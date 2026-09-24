/**
 * Tipos do sistema de Temas Festivos – Agenda dos Jovens Sta. Terezinha
 *
 * Cada "tema" corresponde a uma novena/festa de um santo ou advocação mariana.
 * O tema ativo é calculado automaticamente pela data, com suporte a forçamento
 * manual pelo admin e regra de desempate por prioridade.
 */

/** Chave única de cada santo/tema */
export type SaintKey =
  | 'terezinha'        // padroeira – tema padrão
  | 'jose'             // São José
  | 'carlo'            // São Carlo Acutis
  | 'frassati'         // São Pier Giorgio Frassati
  | 'nossa_senhora'    // Nossa Senhora (várias invocações)
  | 'joana'            // Santa Joana d'Arc
  | 'inacio';          // Santo Inácio de Loyola

/** Invocação mariana – só relevante quando saintKey === 'nossa_senhora' */
export type MarianInvocation =
  | 'aparecida'      // 12 out — Padroeira do Brasil
  | 'fatima'         // 13 mai — Fátima
  | 'carmo'          // 16 jul — Nossa Senhora do Carmo
  | 'imaculada'      // 08 dez — Imaculada Conceição (dogma)
  | 'assuncao'       // 15 ago — Assunção (dogma)
  | 'visitacao'      // 31 mai — Visitação
  | 'natividade'     // 08 set — Natividade de Maria
  | 'anunciacao'     // 25 mar — Anunciação do Senhor
  | 'rainha'         // 22 ago — Nossa Senhora Rainha
  | 'gracas'         // 27 nov — Nossa Senhora das Graças
  | 'candelaria'     // 02 fev — Apresentação do Senhor / N.S. das Candeias
  | 'apresentacao'   // 21 nov — Apresentação de Maria no Templo
  | 'outro';

/**
 * Definição de um tema festivo.
 * Cada instância representa uma novena/festa configurada para um ano específico.
 */
export interface FeastTheme {
  /** ID único do documento Firestore */
  id: string;
  /** Santo ou advocação */
  saintKey: SaintKey;
  /** Nome de exibição (ex: "Novena de São José") */
  name: string;
  /** Frase de apoio abaixo do título no hero */
  subtitle: string;
  /** Data de início da novena – YYYY-MM-DD */
  noveenaStart: string;
  /** Data da festa – YYYY-MM-DD */
  feastDate: string;
  /** Data de fim do tema (inclusive) – padrão: feastDate */
  endDate: string;
  /** Se verdadeiro, vence conflito de datas em empate */
  priority: boolean;
  /**
   * Forçar este tema independente da data.
   * Quando false/undefined, a ativação é automática pela data.
   */
  forced: boolean;
  /** URL do brasão (PNG transparente ou SVG), opcional */
  crestUrl?: string;
  /** Invocação mariana (só usado quando saintKey === 'nossa_senhora') */
  marianInvocation?: MarianInvocation;
}

/**
 * Tema resolvido/ativo em um momento.
 * Calculado por `resolveActiveTheme()`.
 */
export interface ActiveTheme {
  theme: FeastTheme;
  /** true = está dentro do período da novena (antes da festa) */
  isNovena: boolean;
  /** true = hoje é exatamente a festa */
  isFeast: boolean;
  /** Número do dia atual dentro da novena (1-9), ou null se não for novena */
  novenaDay: number | null;
}

/**
 * Mapeamento de saintKey → chave do atributo data-tema no DOM.
 * Nossa Senhora usa a invocação como sufixo: nossa_senhora__aparecida
 */
export function saintKeyToDataTema(key: SaintKey, inv?: MarianInvocation): string {
  if (key === 'nossa_senhora') return `nossa_senhora${inv ? `__${inv}` : ''}`;
  return key;
}

/**
 * Nome de exibição padrão para cada santo (fallback se o admin não preencher)
 */
export const SAINT_DISPLAY_NAMES: Record<SaintKey, string> = {
  terezinha:    'Santa Terezinha',
  jose:         'São José',
  carlo:        'São Carlo Acutis',
  frassati:     'São Pier Giorgio',
  nossa_senhora:'Nossa Senhora',
  joana:        'Santa Joana d\'Arc',
  inacio:       'Santo Inácio',
};
