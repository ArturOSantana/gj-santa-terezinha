/**
 * Serviço de Novenas – GJ Sta. Terezinha
 *
 * Consome a API pública de novenas (https://api-novenas.vercel.app).
 * Persiste o progresso do jovem no localStorage — sem necessidade de login.
 *
 * Configure VITE_NOVENA_API_URL no .env
 * Ex: VITE_NOVENA_API_URL=https://api-novenas.vercel.app
 */

import type {
  NovenaHoje,
  NovenaCompleta,
  NovenaCalItem,
  NovenaProgress,
  ApiResponse,
} from '../types/novena.types';

const BASE_URL = (import.meta.env.VITE_NOVENA_API_URL ?? '').replace(/\/$/, '');
const API = `${BASE_URL}/api/v1/novenas`;

// ─── Cache em memória ─────────────────────────────────────────────────────────

const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

type Cache<T> = { data: T; fetchedAt: number };
let hojeCache: Cache<NovenaHoje[]> | null = null;
const completaCache = new Map<string, Cache<NovenaCompleta>>();
const datasCache = new Map<number, Cache<NovenaCalItem[]>>();

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T | null> {
  if (!BASE_URL) return null;
  try {
    const res = await fetch(`${API}${path}`);
    if (!res.ok) {
      console.error(`[Novena] API error ${res.status}: ${path}`);
      return null;
    }
    const json: ApiResponse<T> = await res.json();
    return json.sucesso ? json.dados : null;
  } catch (err) {
    console.error('[Novena] Falha de rede:', err);
    return null;
  }
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

/**
 * Retorna as novenas em andamento hoje (pode haver mais de uma).
 * Cada item já inclui `diaAtual` e `conteudoHoje`.
 */
export async function fetchNovenaHoje(): Promise<NovenaHoje[]> {
  const now = Date.now();
  if (hojeCache && now - hojeCache.fetchedAt < CACHE_TTL) return hojeCache.data;

  const dados = await apiFetch<NovenaHoje[]>('/hoje');
  const data = dados ?? [];
  hojeCache = { data, fetchedAt: now };
  return data;
}

/**
 * Busca a novena completa (todos os 9 dias, oração inicial/final).
 * Resultado é cacheado individualmente por slug.
 */
export async function fetchNovenaCompleta(slug: string): Promise<NovenaCompleta | null> {
  const now = Date.now();
  const cached = completaCache.get(slug);
  if (cached && now - cached.fetchedAt < CACHE_TTL) return cached.data;

  const data = await apiFetch<NovenaCompleta>(`/${slug}`);
  if (data) completaCache.set(slug, { data, fetchedAt: now });
  return data;
}

/**
 * Busca todas as datas de novenas de um ano (ISO YYYY-MM-DD).
 * Usa GET /api/v1/novenas/datas?ano=YYYY
 */
export async function fetchNovenasDatas(ano: number): Promise<NovenaCalItem[]> {
  const now = Date.now();
  const cached = datasCache.get(ano);
  if (cached && now - cached.fetchedAt < CACHE_TTL) return cached.data;

  const dados = await apiFetch<NovenaCalItem[]>(`/datas?ano=${ano}`);
  const data = dados ?? [];
  datasCache.set(ano, { data, fetchedAt: now });
  return data;
}

/**
 * Constrói um Set<string> de todas as datas ISO em que há alguma novena,
 * expandindo o intervalo início→fim de cada item.
 */
export function buildNovenaDateSet(items: NovenaCalItem[]): Set<string> {
  const set = new Set<string>();
  for (const item of items) {
    const start = new Date(item.inicio + 'T00:00:00');
    const end   = new Date(item.fim   + 'T00:00:00');
    for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      set.add(d.toISOString().slice(0, 10));
    }
  }
  return set;
}

/**
 * Dado um Set de datas e uma data ISO, retorna os nomes das novenas daquele dia.
 * Útil para mostrar tooltip/label no calendário.
 */
export function novenasByDate(items: NovenaCalItem[], dateISO: string): string[] {
  return items
    .filter((n) => dateISO >= n.inicio && dateISO <= n.fim)
    .map((n) => n.nome);
}

/** Invalida todos os caches forçando nova requisição */
export function invalidateNovenaCache(): void {
  hojeCache = null;
  completaCache.clear();
  datasCache.clear();
}

// ─── Progresso local (localStorage) ──────────────────────────────────────────

function progressKey(slug: string, inicioMes: number, inicioDia: number): string {
  return `novena_progress_${slug}_${inicioMes}_${inicioDia}`;
}

/** Lê o progresso salvo para uma novena */
export function getNovenaProgress(slug: string, inicioMes: number, inicioDia: number): NovenaProgress {
  try {
    const raw = localStorage.getItem(progressKey(slug, inicioMes, inicioDia));
    if (raw) {
      const parsed = JSON.parse(raw) as NovenaProgress;
      return {
        completedDays: Array.isArray(parsed.completedDays) ? parsed.completedDays : [],
        updatedAt: parsed.updatedAt ?? '',
      };
    }
  } catch {
    // parse error — retorna padrão
  }
  return { completedDays: [], updatedAt: '' };
}

/**
 * Alterna um dia como rezado / não rezado.
 * Retorna o progresso atualizado.
 */
export function toggleNovenaDay(
  slug: string,
  inicioMes: number,
  inicioDia: number,
  day: number
): NovenaProgress {
  const progress = getNovenaProgress(slug, inicioMes, inicioDia);
  const already = progress.completedDays.includes(day);
  const completedDays = already
    ? progress.completedDays.filter((d) => d !== day)
    : [...progress.completedDays, day].sort((a, b) => a - b);

  const updated: NovenaProgress = { completedDays, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(progressKey(slug, inicioMes, inicioDia), JSON.stringify(updated));
  } catch {
    // localStorage indisponível (modo privado, cota cheia, etc.)
  }
  return updated;
}
