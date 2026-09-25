/**
 * Serviço da Agenda dos Jovens
 *
 * Eventos:         lidos do Google Sheets (somente leitura pública)
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
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import type { AgendaEvent, AgendaNotice, AgendaBirthday } from '../types/agenda.types';

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
// Coluna B: categoria (paroquia | jovens | crisma | tlc | catequese | oratorio | perseveranca | servidores | outros)
// Coluna C: data (YYYY-MM-DD ou DD/MM/YYYY)
// Coluna D: Horário Inicial (HH:MM, opcional)
// Coluna E: Horário Final   (HH:MM, opcional)
// Coluna F: local (opcional)
// Coluna G: descrição (opcional)
// Coluna H: url_arte (opcional)
// Coluna I: visível (Sim = público | Não = oculto; padrão: Sim quando vazio)
//
// Configure VITE_SHEETS_ID e VITE_SHEETS_API_KEY no .env
// A planilha deve ser publicada para "Qualquer pessoa com o link pode ver"

const SHEETS_ID = import.meta.env.VITE_SHEETS_ID ?? '';
const SHEETS_API_KEY = import.meta.env.VITE_SHEETS_API_KEY ?? '';
const EVENTS_RANGE = 'Eventos!A5:I';

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

export async function fetchAgendaEvents(): Promise<AgendaEvent[]> {
  const now = Date.now();
  if (eventsCache && now - eventsCache.fetchedAt < CACHE_TTL) return eventsCache.data;
  const data = await fetchSheet<AgendaEvent>(EVENTS_RANGE, (row) => {
    const [title, cat, date, time, timeEnd, place, desc, art_url, visible_raw] = row;
    if (!title?.trim() || !date?.trim()) return null;
    return {
      id: `${normalizeDate(date)}-${title.trim().slice(0,20).replace(/\s/g,'-')}`,
      title: title.trim(),
      g: normalizeCategory(cat ?? ''),
      date: normalizeDate(date),
      time: time?.trim() || undefined,
      timeEnd: timeEnd?.trim() || undefined,
      place: place?.trim() || undefined,
      desc: desc?.trim() || undefined,
      art_url: art_url?.trim() || undefined,
      visible: normalizeVisible(visible_raw),
    };
  });
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
