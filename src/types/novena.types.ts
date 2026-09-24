/**
 * Tipos da funcionalidade de Novenas – GJ Sta. Terezinha
 * Baseados na estrutura real da API pública de novenas.
 */

// ─── Estrutura da API ─────────────────────────────────────────────────────────

/** Um dia específico dentro de uma novena */
export interface NovenaDia {
  dia: number;        // 1–9
  titulo: string;
  oracao: string;
  meditacao?: string;
  escritura?: string;
}

/** Novena completa com todos os 9 dias (GET /api/v1/novenas/:slug) */
export interface NovenaCompleta {
  id: string;
  slug: string;
  nome: string;
  santoSlug: string;
  mes: number;        // mês da festa (1-12)
  inicioDia: number;
  inicioMes: number;
  fimDia: number;
  fimMes: number;
  descricao: string;
  intencoes: string[];
  totalDias: number;
  oracaoInicial?: string;
  oracaoFinal?: string;
  dias: NovenaDia[];
}

/** Novena em andamento hoje (GET /api/v1/novenas/hoje) — não inclui todos os dias */
export interface NovenaHoje {
  id: string;
  slug: string;
  nome: string;
  santoSlug: string;
  mes: number;
  inicioDia: number;
  inicioMes: number;
  fimDia: number;
  fimMes: number;
  descricao: string;
  intencoes: string[];
  totalDias: number;
  /** Dia atual (1–totalDias) */
  diaAtual: number;
  /** Conteúdo do dia de hoje */
  conteudoHoje: NovenaDia;
}

/**
 * Item retornado por GET /api/v1/novenas/datas?ano=YYYY
 * Datas já em formato ISO YYYY-MM-DD, virada de ano tratada pela API.
 * Usado para marcar os dias no calendário e mostrar o nome da novena.
 */
export interface NovenaCalItem {
  slug: string;
  nome: string;
  inicio: string; // YYYY-MM-DD
  fim: string;    // YYYY-MM-DD
}

/** Wrapper padrão de resposta da API */
export interface ApiResponse<T> {
  sucesso: boolean;
  dados: T;
  total?: number;
}

// ─── Progresso local (localStorage) ──────────────────────────────────────────

/**
 * Progresso salvo no localStorage para uma novena específica.
 * Chave: `novena_progress_<slug>_<inicioMes>_<inicioDia>`
 */
export interface NovenaProgress {
  /** Dias marcados como rezados (1-based) */
  completedDays: number[];
  /** ISO string da última atualização */
  updatedAt: string;
}
