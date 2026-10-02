/**
 * Serviço da Agenda dos Jovens
 *
 * Eventos Sheets:  lidos do Google Sheets (somente leitura pública)
 * Eventos Admin:   criados pelo admin no Firestore (collection agenda_events)
 *                  + gravados na planilha via Cloud Function appendSheetEvent
 * Aniversariantes: lidos do Google Calendar (somente leitura pública)
 * Avisos:          salvos no Firestore, gerenciados pelo admin
 */

import {
  collection,
  doc,
  getDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  Unsubscribe,
  Timestamp,
  type DocumentReference,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, auth, functions as fbFunctions } from '../config/firebase';
import type { AgendaEvent, AgendaNotice, AgendaBirthday, AgendaAdminEvent, AgendaConflict, RecurrenceRule } from '../types/agenda.types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toDate = (val: unknown): Date | undefined => {
  if (!val) return undefined;
  if (val instanceof Date) return val;
  if (val instanceof Timestamp) return val.toDate();
  return undefined;
};

const uid = () => auth.currentUser?.uid ?? 'unknown';

// ─── Google Sheets — Eventos ──────────────────────────────────────────────────
//
// Estrutura esperada da planilha (aba "Eventos"):
// Coluna A: título
// Coluna B: categoria (paroquia | jovens | joana | crisma | tlc | catequese | oratorio | perseveranca | servidores | outros)
// Coluna C: data inicial (YYYY-MM-DD ou DD/MM/YYYY)
// Coluna D: data final   (YYYY-MM-DD ou DD/MM/YYYY — opcional; vazio = evento de um dia)
// Coluna E: Horário Inicial (HH:MM, opcional)
// Coluna F: Horário Final   (HH:MM, opcional)
// Coluna G: local (opcional)
// Coluna H: descrição (opcional)
// Coluna I: url_arte (opcional)
// Coluna J: visível (Sim = público | Não = oculto; padrão: Sim quando vazio)
//
// Configure VITE_SHEETS_ID e VITE_SHEETS_API_KEY no .env
// A planilha deve ser publicada para "Qualquer pessoa com o link pode ver"

const SHEETS_ID = import.meta.env.VITE_SHEETS_ID ?? '';
const SHEETS_API_KEY = import.meta.env.VITE_SHEETS_API_KEY ?? '';
// Lê até a coluna K (recorrência)
// Coluna K: recorrência no formato "weekly:2025-12-31" | "biweekly:..." | "monthly:..."
const EVENTS_RANGE = 'Eventos!A5:K';

type SheetsCache<T> = { data: T[]; fetchedAt: number };
let eventsCache: SheetsCache<AgendaEvent> | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function normalizeDate(raw: string): string {
  if (!raw) return '';
  // Aceita YYYY-MM-DD e DD/MM/YYYY
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) return raw.trim();
  const parts = raw.trim().split('/');
  if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
  return raw.trim();
}

function normalizeCategory(raw: string): AgendaEvent['g'] {
  const map: Record<string, AgendaEvent['g']> = {
    paroquia: 'paroquia', paróquia: 'paroquia',
    jovens: 'jovens', 'grupo de jovens': 'jovens',
    joana: 'joana', 'santa joana': 'joana', 'sta joana': 'joana', "santa joana d'arc": 'joana',
    crisma: 'crisma',
    tlc: 'tlc',
    catequese: 'catequese',
    oratorio: 'oratorio', oratório: 'oratorio',
    perseveranca: 'perseveranca', perseverança: 'perseveranca',
    servidores: 'servidores',
    outros: 'outros',
  };
  return map[raw.toLowerCase().trim()] ?? 'outros';
}

async function fetchSheet<T>(range: string, mapper: (row: string[]) => T | null): Promise<T[]> {
  if (!SHEETS_ID || !SHEETS_API_KEY) return [];
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/${encodeURIComponent(range)}?key=${SHEETS_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    console.error('[Sheets] erro detalhado:', body);
    throw new Error(`Sheets API error: ${res.status}`);
  }
  const json = await res.json();
  const rows: string[][] = json.values ?? [];
  return rows.map(mapper).filter((r): r is T => r !== null);
}

/** Normaliza o valor da coluna "Visível": vazio ou "Sim" → true; "Não" → false. */
function normalizeVisible(raw: string | undefined): boolean {
  if (!raw?.trim()) return true; // padrão: visível quando a célula está em branco
  return raw.trim().toLowerCase() !== 'não' && raw.trim().toLowerCase() !== 'nao';
}

/**
 * Parseia a coluna K de recorrência.
 * Formato esperado: "weekly:2025-12-31" | "biweekly:2025-12-31" | "monthly:2025-12-31"
 */
function parseSheetRecurrence(raw: string | undefined): RecurrenceRule | undefined {
  if (!raw?.trim()) return undefined;
  const [freq, until] = raw.trim().split(':');
  if (!freq || !until) return undefined;
  if (freq !== 'weekly' && freq !== 'biweekly' && freq !== 'monthly') return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(until)) return undefined;
  return { freq: freq as import('../types/agenda.types').RecurrenceFreq, until };
}

/**
 * Expande um evento da planilha com recorrência em múltiplas ocorrências.
 * O evento original é retornado como primeiro item; as demais são cópias com
 * datas incrementadas conforme a regra.
 */
function expandSheetEvent(base: AgendaEvent, rule: import('../types/agenda.types').RecurrenceRule): AgendaEvent[] {
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const toStr = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  const result: AgendaEvent[] = [];
  const cur = new Date(`${base.date}T12:00:00`);
  const end = new Date(`${rule.until}T12:00:00`);
  let idx = 0;

  while (cur <= end) {
    const dateStr = toStr(cur);
    result.push({
      ...base,
      id: idx === 0 ? base.id : `${base.id}-${dateStr}`,
      date: dateStr,
    });
    if (rule.freq === 'weekly')        cur.setDate(cur.getDate() + 7);
    else if (rule.freq === 'biweekly') cur.setDate(cur.getDate() + 14);
    else /* monthly */                 cur.setMonth(cur.getMonth() + 1);
    idx++;
  }
  return result;
}

export async function fetchAgendaEvents(): Promise<AgendaEvent[]> {
  const now = Date.now();
  if (eventsCache && now - eventsCache.fetchedAt < CACHE_TTL) return eventsCache.data;

  const rawEvents = await fetchSheet<AgendaEvent>(EVENTS_RANGE, (row) => {
    const [title, cat, date, dateEnd, time, timeEnd, place, desc, art_url, visible_raw, recur_raw] = row;
    if (!title?.trim() || !date?.trim()) return null;
    const recurrence = parseSheetRecurrence(recur_raw);
    return {
      id: `${normalizeDate(date)}-${title.trim().slice(0,20).replace(/\s/g,'-')}`,
      title: title.trim(),
      g: normalizeCategory(cat ?? ''),
      date: normalizeDate(date),
      dateEnd: dateEnd?.trim() ? normalizeDate(dateEnd) : undefined,
      time: time?.trim() || undefined,
      timeEnd: timeEnd?.trim() || undefined,
      place: place?.trim() || undefined,
      desc: desc?.trim() || undefined,
      art_url: art_url?.trim() || undefined,
      visible: normalizeVisible(visible_raw),
      recurrence,
    };
  });

  // Expande eventos com recorrência em múltiplas ocorrências
  const data: AgendaEvent[] = [];
  for (const ev of rawEvents) {
    if (ev.recurrence) {
      data.push(...expandSheetEvent(ev, ev.recurrence));
    } else {
      data.push(ev);
    }
  }

  eventsCache = { data, fetchedAt: now };
  return data;
}

// ─── Google Calendar — Aniversariantes ───────────────────────────────────────
//
// Lê eventos de um Google Calendar público (ou acessível via chave de API).
// Cada aniversário deve ser um evento recorrente anual (ou evento único).
// A API é consultada com uma janela de 365 dias a partir de hoje.
//
// Configure VITE_GOOGLE_CALENDAR_ID e VITE_SHEETS_API_KEY no .env
// (a mesma chave do Sheets serve — basta ativar também a Calendar API no Cloud)

const CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID ?? '';
let birthdaysCache: SheetsCache<AgendaBirthday> | null = null;

export function invalidateSheetsCache(): void {
  eventsCache = null;
  birthdaysCache = null;
}

// ─── Eventos Admin (Firestore) ────────────────────────────────────────────────
//
// Estrutura do documento em agenda_events/:
//   title, g, date, time?, timeEnd?, place?, desc?, visible, createdAt, createdBy

export function subscribeAdminEvents(
  callback: (events: AgendaAdminEvent[]) => void
): Unsubscribe {
  const q = query(collection(db, 'agenda_events'), orderBy('date', 'asc'));
  return onSnapshot(q, (snap) => {
    const events: AgendaAdminEvent[] = snap.docs.map((d) => {
      const data = d.data();
      const recur = data.recurrence as { freq?: string; until?: string } | undefined;
      return {
        id: d.id,
        title: data.title ?? '',
        g: data.g ?? 'outros',
        date: data.date ?? '',
        dateEnd: data.dateEnd ?? undefined,
        time: data.time ?? undefined,
        timeEnd: data.timeEnd ?? undefined,
        place: data.place ?? undefined,
        desc: data.desc ?? undefined,
        visible: data.visible !== false,
        recurrence: recur?.freq && recur?.until
          ? { freq: recur.freq as import('../types/agenda.types').RecurrenceFreq, until: recur.until }
          : undefined,
        seriesIds: Array.isArray(data.seriesIds) ? data.seriesIds : undefined,
        sheetRowIndex: typeof data.sheetRowIndex === 'number' ? data.sheetRowIndex : undefined,
        seriesRowIndexes: Array.isArray(data.seriesRowIndexes) ? data.seriesRowIndexes : undefined,
        createdAt: toDate(data.createdAt),
        createdBy: data.createdBy ?? undefined,
      } satisfies AgendaAdminEvent;
    });
    callback(events);
  });
}

// ─── Helpers de recorrência ───────────────────────────────────────────────────

/** Gera a sequência de datas (YYYY-MM-DD) de uma série recorrente a partir de
 *  startDate até until (inclusive), aplicando a frequência escolhida. */
function expandRecurrenceDates(startDate: string, rule: RecurrenceRule): string[] {
  const dates: string[] = [];
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const toStr = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  const cur = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${rule.until}T12:00:00`);

  while (cur <= end) {
    dates.push(toStr(cur));
    if (rule.freq === 'weekly')        cur.setDate(cur.getDate() + 7);
    else if (rule.freq === 'biweekly') cur.setDate(cur.getDate() + 14);
    else /* monthly */                 cur.setMonth(cur.getMonth() + 1);
  }
  return dates;
}

export async function addAdminEvent(
  event: Omit<AgendaAdminEvent, 'id' | 'createdAt' | 'createdBy'>
): Promise<number> {
  const baseData: Record<string, unknown> = {
    title:    event.title,
    g:        event.g,
    date:     event.date,
    visible:  event.visible,
    createdAt: serverTimestamp(),
    createdBy: uid(),
  };
  if (event.dateEnd) baseData.dateEnd = event.dateEnd;
  if (event.time)    baseData.time    = event.time;
  if (event.timeEnd) baseData.timeEnd = event.timeEnd;
  if (event.place)   baseData.place   = event.place;
  if (event.desc)    baseData.desc    = event.desc;

  // Sem recorrência — comportamento original (único evento)
  if (!event.recurrence) {
    const docRef = await addDoc(collection(db, 'agenda_events'), baseData);
    try {
      const appendFn = httpsCallable<unknown, { success: boolean; rowIndex: number | null }>(
        fbFunctions, 'appendSheetEvent'
      );
      const result = await appendFn({
        title:    event.title,
        category: event.g,
        date:     event.date,
        dateEnd:  event.dateEnd  ?? '',
        time:     event.time     ?? '',
        timeEnd:  event.timeEnd  ?? '',
        place:    event.place    ?? '',
        desc:     event.desc     ?? '',
        artUrl:   '',
        visible:  event.visible,
      });
      if (result.data.rowIndex) {
        const { updateDoc } = await import('firebase/firestore');
        await updateDoc(docRef, { sheetRowIndex: result.data.rowIndex });
      }
    } catch (sheetErr: unknown) {
      const code = (sheetErr as { code?: string })?.code ?? '';
      const msg  = (sheetErr as { message?: string })?.message ?? '';
      console.warn('[Agenda] Planilha não atualizada (continuando com Firestore):', code, msg);
    }
    return 1;
  }

  // Com recorrência — gera série de datas e cria um doc por ocorrência
  const rule = event.recurrence;
  const dates = expandRecurrenceDates(event.date, rule);
  if (dates.length === 0) {
    // Nenhuma data válida — cria evento único sem recorrência
    await addDoc(collection(db, 'agenda_events'), baseData);
    return 1;
  }

  // 1. Cria todos os docs no Firestore (o primeiro é o "raiz" com a rule)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docRefs: DocumentReference<any>[] = [];
  for (let i = 0; i < dates.length; i++) {
    const data: Record<string, unknown> = {
      ...baseData,
      date: dates[i],
      createdAt: serverTimestamp(),
    };
    // Só o doc raiz (i=0) guarda a recorrência e os seriesIds
    if (i === 0) {
      data.recurrence = { freq: rule.freq, until: rule.until };
    }
    const ref = await addDoc(collection(db, 'agenda_events'), data);
    docRefs.push(ref);
  }

  // Salva seriesIds no doc raiz (os IDs das ocorrências seguintes)
  if (docRefs.length > 1) {
    const { updateDoc } = await import('firebase/firestore');
    await updateDoc(docRefs[0], { seriesIds: docRefs.slice(1).map((r) => r.id) });
  }

  // 2. Grava todas as linhas na planilha via Cloud Function batch (best-effort)
  try {
    const batchFn = httpsCallable<unknown, { success: boolean; rowIndexes: (number | null)[] }>(
      fbFunctions, 'appendSheetEventBatch'
    );
    const rows = dates.map((date) => ({
      title:    event.title,
      category: event.g,
      date,
      dateEnd:  event.dateEnd  ?? '',
      time:     event.time     ?? '',
      timeEnd:  event.timeEnd  ?? '',
      place:    event.place    ?? '',
      desc:     event.desc     ?? '',
      artUrl:   '',
      visible:  event.visible,
    }));
    const result = await batchFn({ rows });
    // Persiste os rowIndexes: o primeiro no doc raiz, os demais em cada doc filho
    const { updateDoc } = await import('firebase/firestore');
    const indexes = result.data.rowIndexes;
    if (indexes[0]) await updateDoc(docRefs[0], { sheetRowIndex: indexes[0], seriesRowIndexes: indexes.filter(Boolean) });
    for (let i = 1; i < docRefs.length; i++) {
      if (indexes[i]) await updateDoc(docRefs[i], { sheetRowIndex: indexes[i] });
    }
  } catch (sheetErr: unknown) {
    const code = (sheetErr as { code?: string })?.code ?? '';
    const msg  = (sheetErr as { message?: string })?.message ?? '';
    console.warn('[Agenda] Planilha (série) não atualizada (continuando com Firestore):', code, msg);
  }

  return dates.length;
}

export async function deleteAdminEvent(
  id: string,
  sheetRowIndex?: number
): Promise<void> {
  // 1. Apaga da planilha via Cloud Function (best-effort)
  if (sheetRowIndex) {
    try {
      const deleteFn = httpsCallable(fbFunctions, 'deleteSheetEvent');
      await deleteFn({ rowIndex: sheetRowIndex });
    } catch (sheetErr: unknown) {
      const code = (sheetErr as { code?: string })?.code ?? '';
      const msg  = (sheetErr as { message?: string })?.message ?? '';
      console.warn('[Agenda] Linha da planilha não removida (continuando):', code, msg);
    }
  }
  // 2. Apaga do Firestore (sempre)
  await deleteDoc(doc(db, 'agenda_events', id));
}

// ─── Eventos Ocultos (agenda_hidden) ─────────────────────────────────────────
//
// Permite ao admin ocultar qualquer evento (inclusive os da planilha)
// sem precisar editar a planilha. O evento some da agenda publicamente
// em tempo real via onSnapshot.
//
// Documento: agenda_hidden/{eventId}  →  { hiddenAt, hiddenBy }

export function subscribeHiddenEvents(
  callback: (hiddenIds: Set<string>) => void
): Unsubscribe {
  return onSnapshot(collection(db, 'agenda_hidden'), (snap) => {
    callback(new Set(snap.docs.map((d) => d.id)));
  });
}

export async function hideEvent(eventId: string): Promise<void> {
  const { setDoc } = await import('firebase/firestore');
  await setDoc(doc(db, 'agenda_hidden', eventId), {
    hiddenAt: serverTimestamp(),
    hiddenBy: uid(),
  });
}

export async function unhideEvent(eventId: string): Promise<void> {
  await deleteDoc(doc(db, 'agenda_hidden', eventId));
}

/**
 * Detecta conflitos de local + dia + sobreposição de horário entre todos os
 * eventos visíveis (Sheets + Admin). Retorna apenas conflitos reais.
 *
 * Regra: dois eventos conflitam se têm o mesmo dia E o mesmo local
 * (case-insensitive) E os horários se sobrepõem (ou ambos sem horário).
 */
export function detectConflicts(
  sheetsEvents: AgendaEvent[],
  adminEvents: AgendaAdminEvent[]
): AgendaConflict[] {
  // Normaliza em lista unificada (apenas visíveis com local preenchido)
  type SimpleEvent = { id: string; title: string; date: string; place: string; time?: string; timeEnd?: string };
  const all: SimpleEvent[] = [
    ...sheetsEvents
      .filter((e) => e.visible && e.place)
      .map((e) => ({ id: e.id, title: e.title, date: e.date, place: e.place!, time: e.time, timeEnd: e.timeEnd })),
    ...adminEvents
      .filter((e) => e.visible && e.place)
      .map((e) => ({ id: e.id, title: e.title, date: e.date, place: e.place!, time: e.time, timeEnd: e.timeEnd })),
  ];

  const conflicts: AgendaConflict[] = [];

  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const a = all[i];
      const b = all[j];
      if (a.date !== b.date) continue;
      if (a.place.toLowerCase().trim() !== b.place.toLowerCase().trim()) continue;
      if (timesOverlap(a.time, a.timeEnd, b.time, b.timeEnd)) {
        conflicts.push({
          eventA: { id: a.id, title: a.title, time: a.time, timeEnd: a.timeEnd },
          eventB: { id: b.id, title: b.title, time: b.time, timeEnd: b.timeEnd },
          date: a.date,
          place: a.place,
        });
      }
    }
  }

  return conflicts;
}

/** Retorna true se os intervalos [a.time, a.timeEnd] e [b.time, b.timeEnd] se sobrepõem. */
function timesOverlap(
  aStart?: string, aEnd?: string,
  bStart?: string, bEnd?: string
): boolean {
  // Se nenhum tem horário, ou ambos não têm → conflito de dia inteiro
  if (!aStart && !bStart) return true;
  // Se apenas um não tem horário → considera sobreposição conservadora
  if (!aStart || !bStart) return true;
  // Ambos têm horário de início
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const aS = toMin(aStart);
  const aE = aEnd ? toMin(aEnd) : aS + 60; // assume 1h de duração se sem fim
  const bS = toMin(bStart);
  const bE = bEnd ? toMin(bEnd) : bS + 60;
  return aS < bE && bS < aE;
}

export async function fetchAgendaBirthdays(): Promise<AgendaBirthday[]> {
  const now = Date.now();
  if (birthdaysCache && now - birthdaysCache.fetchedAt < CACHE_TTL) return birthdaysCache.data;

  if (!CALENDAR_ID || !SHEETS_API_KEY) return [];

  // Janela: hoje até +365 dias — captura todos os aniversários do ano
  const timeMin = new Date();
  timeMin.setHours(0, 0, 0, 0);
  const timeMax = new Date(timeMin);
  timeMax.setDate(timeMax.getDate() + 365);

  const params = new URLSearchParams({
    key: SHEETS_API_KEY,
    singleEvents: 'true',           // expande recorrências
    orderBy: 'startTime',
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    maxResults: '500',
  });

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Calendar API error: ${res.status}`);

  const json = await res.json();
  const items: Array<{ id: string; summary?: string; start?: { date?: string; dateTime?: string } }> =
    json.items ?? [];

  // Deduplica pelo nome: aniversários recorrentes aparecem uma vez por ocorrência,
  // mas queremos somente dia/mês — usamos o nome como chave de deduplicação.
  const seen = new Set<string>();
  const data: AgendaBirthday[] = [];

  for (const item of items) {
    const name = item.summary?.trim();
    if (!name) continue;
    if (seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());

    // date (all-day) ou dateTime (com hora) — extrai YYYY-MM-DD
    const rawDate = item.start?.date ?? item.start?.dateTime?.slice(0, 10);
    if (!rawDate) continue;

    const [, mm, dd] = rawDate.split('-');
    data.push({
      id: `${name}-${dd}-${mm}`,
      name,
      d: parseInt(dd, 10),
      m: parseInt(mm, 10),
    });
  }

  birthdaysCache = { data, fetchedAt: now };
  return data;
}

// ─── Avisos (Firestore) ───────────────────────────────────────────────────────

const todayStr = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export function subscribeAgendaNotices(
  callback: (notices: AgendaNotice[]) => void
): Unsubscribe {
  const q = query(collection(db, 'agenda_notices'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const today = todayStr();
    const notices: AgendaNotice[] = snap.docs
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title ?? '',
          text: data.text ?? undefined,
          urgent: data.urgent ?? false,
          origin: data.origin ?? undefined,
          expiresAt: data.expiresAt ?? undefined,
          createdAt: toDate(data.createdAt),
          createdBy: data.createdBy ?? undefined,
        } satisfies AgendaNotice;
      })
      // Filtrar avisos vencidos: some no dia do vencimento (exclusive — some quando expiresAt < today)
      .filter((n) => !n.expiresAt || n.expiresAt >= today);
    callback(notices);
  });
}

export async function addAgendaNotice(
  notice: Omit<AgendaNotice, 'id' | 'createdAt' | 'createdBy'>
): Promise<string> {
  // Firestore não aceita `undefined` — omite campos opcionais quando não definidos
  const data: Record<string, unknown> = {
    title: notice.title,
    urgent: notice.urgent,
    createdAt: serverTimestamp(),
    createdBy: uid(),
  };
  if (notice.text)      data.text      = notice.text;
  if (notice.origin)    data.origin    = notice.origin;
  if (notice.expiresAt) data.expiresAt = notice.expiresAt;

  const docRef = await addDoc(collection(db, 'agenda_notices'), data);
  return docRef.id;
}

export async function deleteAgendaNotice(id: string): Promise<void> {
  await deleteDoc(doc(db, 'agenda_notices', id));
}

// ─── Admin check ─────────────────────────────────────────────────────────────

export async function checkIsAgendaAdmin(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (!snap.exists()) return false;
    const role = snap.data()?.role as string | undefined;
    return role === 'admin' || role === 'coordinator';
  } catch {
    return false;
  }
}
