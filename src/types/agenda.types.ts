/**
 * Tipos da Agenda dos Jovens – Paróquia Santa Terezinha do Menino Jesus
 */

export type AgendaCategory =
  | 'paroquia'
  | 'jovens'
  | 'joana'
  | 'crisma'
  | 'tlc'
  | 'catequese'
  | 'oratorio'
  | 'perseveranca'
  | 'servidores'
  | 'outros';

/** Origem do aviso — quem enviou */
export type NoticeOrigin = 'tlc' | 'paroquia' | 'jovens' | 'crisma';

export const NOTICE_ORIGIN_LABELS: Record<NoticeOrigin, string> = {
  tlc: 'TLC',
  paroquia: 'Paróquia',
  jovens: 'Grupo de Jovens',
  crisma: 'Crisma',
};

/** Evento lido do Google Sheets */
export interface AgendaEvent {
  id: string;
  title: string;
  /** Categoria: paroquia, jovens, crisma, tlc, catequese, oratorio, perseveranca, servidores, outros */
  g: AgendaCategory;
  /** Data no formato YYYY-MM-DD */
  date: string;
  /** Horário inicial no formato HH:MM (opcional) */
  time?: string;
  /** Horário final no formato HH:MM (opcional) */
  timeEnd?: string;
  /** Local (máx. 80 chars) */
  place?: string;
  /** Descrição (máx. 800 chars) */
  desc?: string;
  /** URL da arte do evento */
  art_url?: string;
  /**
   * Visibilidade pública do evento.
   * Coluna H da planilha: "Sim" = visível (padrão), "Não" = oculto.
   */
  visible: boolean;
}

/** Aviso publicado pelo admin — some automaticamente quando vence */
export interface AgendaNotice {
  id: string;
  title: string;
  text?: string;
  urgent: boolean;
  /** Origem do aviso: tlc, paroquia, jovens ou crisma */
  origin?: NoticeOrigin;
  /** Data de vencimento ISO string (YYYY-MM-DD). Se definida, some nessa data. */
  expiresAt?: string;
  createdAt?: Date;
  createdBy?: string;
}

/** Aniversariante lido do Google Calendar */
export interface AgendaBirthday {
  id: string;
  name: string;
  /** Dia do mês: 1-31 */
  d: number;
  /** Mês: 1-12 */
  m: number;
}

export type AgendaFilter = 'all' | AgendaCategory;
export type AgendaView = 'list' | 'calendar';
export type AdminTab = 'notices' | 'events';

/** Evento criado pelo admin direto no Firestore (visível publicamente) */
export interface AgendaAdminEvent {
  id: string;
  title: string;
  g: AgendaCategory;
  date: string;       // YYYY-MM-DD
  time?: string;      // HH:MM
  timeEnd?: string;   // HH:MM
  place?: string;
  desc?: string;
  visible: boolean;
  /** Número da linha na planilha (1-based). Salvo pelo addAdminEvent após appendSheetEvent. */
  sheetRowIndex?: number;
  createdAt?: Date;
  createdBy?: string;
}

/** Conflito detectado entre dois eventos (mesmo local + dia + sobreposição de horário) */
export interface AgendaConflict {
  eventA: { id: string; title: string; time?: string; timeEnd?: string };
  eventB: { id: string; title: string; time?: string; timeEnd?: string };
  date: string;
  place: string;
}

export const CATEGORY_LABELS: Record<AgendaFilter, string> = {
  all: 'Tudo',
  paroquia: 'Paróquia',
  jovens: 'Grupo de Jovens',
  joana: 'Sta Joana',
  crisma: 'Crisma',
  tlc: 'TLC',
  catequese: 'Catequese',
  oratorio: 'Oratório',
  perseveranca: 'Perseverança',
  servidores: 'Servidores',
  outros: 'Outros',
};

export const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'] as const;
export const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
] as const;
