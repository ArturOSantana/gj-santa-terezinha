/**
 * Serviço de Temas Festivos – GJ Sta. Terezinha
 *
 * Responsabilidades:
 *  1. Fornecer os temas padrão (hardcoded, baseados nas datas litúrgicas)
 *  2. Ler temas customizados/forçados do Firestore (coleção `agenda_themes`)
 *  3. Resolver qual tema está ativo hoje (regra de conflito por proximidade + prioridade)
 *  4. CRUD de temas para o painel admin
 */

import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  FeastTheme,
  ActiveTheme,
  SaintKey,
  MarianInvocation,
} from '../types/theme.types';

// ─── Temas padrão ─────────────────────────────────────────────────────────────
// Datas hardcoded para o ano corrente.
// O admin pode sobrescrever via Firestore — mas o sistema funciona sem configuração.

function year(): number { return new Date().getFullYear(); }

function defaultThemes(): FeastTheme[] {
  const y = year();
  return [
    // ── Santa Terezinha ───────────────────────────────────────────────────────
    {
      id: '__default_terezinha',
      saintKey: 'terezinha',
      name: 'Novena de Santa Terezinha',
      subtitle: 'Passarei meu céu fazendo o bem sobre a terra.',
      noveenaStart: `${y}-09-22`,
      feastDate:    `${y}-10-01`,
      endDate:      `${y}-10-01`,
      priority: false,
      forced: false,
    },

    // ── São José ──────────────────────────────────────────────────────────────
    {
      id: '__default_jose',
      saintKey: 'jose',
      name: 'Novena de São José',
      subtitle: 'Ite ad Ioseph – Ide a José.',
      noveenaStart: `${y}-03-10`,
      feastDate:    `${y}-03-19`,
      endDate:      `${y}-03-19`,
      priority: false,
      forced: false,
    },
    {
      id: '__default_jose_operario',
      saintKey: 'jose',
      name: 'São José Operário',
      subtitle: 'Guardião da Sagrada Família, protetor dos trabalhadores.',
      noveenaStart: `${y}-04-22`,
      feastDate:    `${y}-05-01`,
      endDate:      `${y}-05-01`,
      priority: false,
      forced: false,
    },

    // ── São Carlo Acutis ──────────────────────────────────────────────────────
    {
      id: '__default_carlo',
      saintKey: 'carlo',
      name: 'Novena de São Carlo Acutis',
      subtitle: 'A Eucaristia é a minha autoestrada para o céu.',
      noveenaStart: `${y}-10-03`,
      feastDate:    `${y}-10-12`,
      endDate:      `${y}-10-12`,
      priority: false,   // conflito com Aparecida — admin define prioridade
      forced: false,
    },

    // ── São Pier Giorgio Frassati ─────────────────────────────────────────────
    {
      id: '__default_frassati',
      saintKey: 'frassati',
      name: 'Novena de Pier Giorgio Frassati',
      subtitle: "Verso l'alto! Rumo ao alto!",
      noveenaStart: `${y}-06-25`,
      feastDate:    `${y}-07-04`,
      endDate:      `${y}-07-04`,
      priority: false,
      forced: false,
    },

    // ── Santa Joana d'Arc ─────────────────────────────────────────────────────
    {
      id: '__default_joana',
      saintKey: 'joana',
      name: "Novena de Santa Joana d'Arc",
      subtitle: 'Jesus, Maria.',
      noveenaStart: `${y}-05-21`,
      feastDate:    `${y}-05-30`,
      endDate:      `${y}-05-30`,
      priority: false,
      forced: false,
    },

    // ── Santo Inácio de Loyola ────────────────────────────────────────────────
    {
      id: '__default_inacio',
      saintKey: 'inacio',
      name: 'Novena de Santo Inácio de Loyola',
      subtitle: 'Ad maiorem Dei gloriam.',
      noveenaStart: `${y}-07-22`,
      feastDate:    `${y}-07-31`,
      endDate:      `${y}-07-31`,
      priority: false,
      forced: false,
    },

    // ── Festas marianas ───────────────────────────────────────────────────────
    // Candelária / Apresentação do Senhor (02 fev)
    {
      id: '__default_candelaria',
      saintKey: 'nossa_senhora',
      name: 'Nossa Senhora das Candeias',
      subtitle: 'Uma luz para iluminar as nações, glória do teu povo Israel. (Lc 2,32)',
      noveenaStart: `${y}-01-24`,
      feastDate:    `${y}-02-02`,
      endDate:      `${y}-02-02`,
      priority: false,
      forced: false,
      marianInvocation: 'candelaria',
    },
    // Anunciação do Senhor (25 mar)
    {
      id: '__default_anunciacao',
      saintKey: 'nossa_senhora',
      name: 'Anunciação do Senhor',
      subtitle: 'Eis aqui a serva do Senhor; faça-se em mim segundo a tua palavra. (Lc 1,38)',
      noveenaStart: `${y}-03-16`,
      feastDate:    `${y}-03-25`,
      endDate:      `${y}-03-25`,
      priority: false,
      forced: false,
      marianInvocation: 'anunciacao',
    },
    // Nossa Senhora de Fátima (13 mai)
    {
      id: '__default_fatima',
      saintKey: 'nossa_senhora',
      name: 'Novena de Nossa Senhora de Fátima',
      subtitle: 'Rezai o Rosário todos os dias para conseguir a paz no mundo.',
      noveenaStart: `${y}-05-04`,
      feastDate:    `${y}-05-13`,
      endDate:      `${y}-05-13`,
      priority: false,
      forced: false,
      marianInvocation: 'fatima',
    },
    // Visitação de Maria (31 mai)
    {
      id: '__default_visitacao',
      saintKey: 'nossa_senhora',
      name: 'Visitação de Nossa Senhora',
      subtitle: 'Bem-aventurada és tu entre as mulheres. (Lc 1,42)',
      noveenaStart: `${y}-05-22`,
      feastDate:    `${y}-05-31`,
      endDate:      `${y}-05-31`,
      priority: false,
      forced: false,
      marianInvocation: 'visitacao',
    },
    // Nossa Senhora do Carmo (16 jul)
    {
      id: '__default_carmo',
      saintKey: 'nossa_senhora',
      name: 'Novena de Nossa Senhora do Carmo',
      subtitle: 'Tomai este escapulário como sinal de consagração ao meu Imaculado Coração.',
      noveenaStart: `${y}-07-07`,
      feastDate:    `${y}-07-16`,
      endDate:      `${y}-07-16`,
      priority: false,
      forced: false,
      marianInvocation: 'carmo',
    },
    // Assunção de Maria (15 ago) — dogma
    {
      id: '__default_assuncao',
      saintKey: 'nossa_senhora',
      name: 'Novena da Assunção de Nossa Senhora',
      subtitle: 'Coisas grandes fez em mim o Todo-Poderoso: Santo é o seu Nome. (Lc 1,49)',
      noveenaStart: `${y}-08-06`,
      feastDate:    `${y}-08-15`,
      endDate:      `${y}-08-15`,
      priority: false,
      forced: false,
      marianInvocation: 'assuncao',
    },
    // Nossa Senhora Rainha (22 ago)
    {
      id: '__default_rainha',
      saintKey: 'nossa_senhora',
      name: 'Nossa Senhora Rainha',
      subtitle: 'Salve, Rainha, Mãe de misericórdia, vida, doçura e esperança nossa.',
      noveenaStart: `${y}-08-13`,
      feastDate:    `${y}-08-22`,
      endDate:      `${y}-08-22`,
      priority: false,
      forced: false,
      marianInvocation: 'rainha',
    },
    // Natividade de Maria (08 set)
    {
      id: '__default_natividade',
      saintKey: 'nossa_senhora',
      name: 'Natividade de Nossa Senhora',
      subtitle: 'Alegrai-vos com Maria, pois ela nasceu para ser a Mãe do nosso Salvador.',
      noveenaStart: `${y}-08-30`,
      feastDate:    `${y}-09-08`,
      endDate:      `${y}-09-08`,
      priority: false,
      forced: false,
      marianInvocation: 'natividade',
    },
    // Nossa Senhora Aparecida (12 out) — prioridade sobre Carlo Acutis
    {
      id: '__default_aparecida',
      saintKey: 'nossa_senhora',
      name: 'Novena de Nossa Senhora Aparecida',
      subtitle: 'Bendita sois vós entre as mulheres, Mãe de misericórdia e esperança.',
      noveenaStart: `${y}-10-03`,
      feastDate:    `${y}-10-12`,
      endDate:      `${y}-10-12`,
      priority: true,   // Aparecida tem prioridade sobre Carlo Acutis no conflito de 12/out
      forced: false,
      marianInvocation: 'aparecida',
    },
    // Apresentação de Maria no Templo (21 nov)
    {
      id: '__default_apresentacao',
      saintKey: 'nossa_senhora',
      name: 'Apresentação de Maria no Templo',
      subtitle: 'Consagrada desde a infância ao Senhor, ela nos ensina o caminho da entrega.',
      noveenaStart: `${y}-11-12`,
      feastDate:    `${y}-11-21`,
      endDate:      `${y}-11-21`,
      priority: false,
      forced: false,
      marianInvocation: 'apresentacao',
    },
    // Nossa Senhora das Graças (27 nov)
    {
      id: '__default_gracas',
      saintKey: 'nossa_senhora',
      name: 'Nossa Senhora das Graças',
      subtitle: 'Ó Maria, concebida sem pecado, rogai por nós que recorremos a vós.',
      noveenaStart: `${y}-11-18`,
      feastDate:    `${y}-11-27`,
      endDate:      `${y}-11-27`,
      priority: false,
      forced: false,
      marianInvocation: 'gracas',
    },
    // Imaculada Conceição (08 dez) — dogma
    {
      id: '__default_imaculada',
      saintKey: 'nossa_senhora',
      name: 'Novena da Imaculada Conceição',
      subtitle: 'Toda bela és, ó Maria, e mácula original não há em ti.',
      noveenaStart: `${y}-11-29`,
      feastDate:    `${y}-12-08`,
      endDate:      `${y}-12-08`,
      priority: false,
      forced: false,
      marianInvocation: 'imaculada',
    },
  ];
}

// ─── Mapeamento de slugs da API de novenas → saintKey ────────────────────────

/**
 * Mapeamento dos slugs retornados pela API pública de novenas para os
 * saintKeys do sistema de temas. Permite ativar temas automaticamente
 * quando a API confirma que uma novena está em curso.
 *
 * Os slugs são os identificadores usados pela API (campo `slug` em NovenaHoje).
 */
export const NOVENA_SLUG_TO_SAINT: Record<string, SaintKey> = {
  // Santa Terezinha
  'santa-terezinha': 'terezinha',
  'terezinha-menino-jesus': 'terezinha',
  'sta-terezinha': 'terezinha',

  // São José
  'sao-jose': 'jose',
  'jose-operario': 'jose',
  'sao-jose-operario': 'jose',

  // São Carlo Acutis
  'carlo-acutis': 'carlo',
  'sao-carlo-acutis': 'carlo',

  // Pier Giorgio Frassati
  'pier-giorgio-frassati': 'frassati',
  'frassati': 'frassati',

  // Santa Joana d'Arc
  'joana-darc': 'joana',
  'santa-joana-darc': 'joana',
  'joana-arc': 'joana',

  // Santo Inácio de Loyola
  'inacio-loyola': 'inacio',
  'santo-inacio': 'inacio',
  'ignatius-loyola': 'inacio',

  // Nossa Senhora – invocações
  'nossa-senhora-aparecida': 'nossa_senhora',
  'aparecida': 'nossa_senhora',
  'nossa-senhora-fatima': 'nossa_senhora',
  'fatima': 'nossa_senhora',
  'nossa-senhora-carmo': 'nossa_senhora',
  'carmo': 'nossa_senhora',
  'nossa-senhora-assuncao': 'nossa_senhora',
  'assuncao': 'nossa_senhora',
  'nossa-senhora-imaculada': 'nossa_senhora',
  'imaculada-conceicao': 'nossa_senhora',
  'nossa-senhora-visitacao': 'nossa_senhora',
  'visitacao': 'nossa_senhora',
  'nossa-senhora-natividade': 'nossa_senhora',
  'natividade-maria': 'nossa_senhora',
  'anunciacao': 'nossa_senhora',
  'nossa-senhora-gracas': 'nossa_senhora',
  'medalhamilagrosa': 'nossa_senhora',
  'nossa-senhora-candelaria': 'nossa_senhora',
  'nossa-senhora-rainha': 'nossa_senhora',
  'nossa-senhora-apresentacao': 'nossa_senhora',
};

/**
 * Mapeamento dos slugs da API para a invocação mariana correspondente.
 * Usado junto com NOVENA_SLUG_TO_SAINT para definir o data-tema correto.
 */
export const NOVENA_SLUG_TO_INVOCATION: Record<string, MarianInvocation> = {
  'nossa-senhora-aparecida': 'aparecida',
  'aparecida': 'aparecida',
  'nossa-senhora-fatima': 'fatima',
  'fatima': 'fatima',
  'nossa-senhora-carmo': 'carmo',
  'carmo': 'carmo',
  'nossa-senhora-assuncao': 'assuncao',
  'assuncao': 'assuncao',
  'nossa-senhora-imaculada': 'imaculada',
  'imaculada-conceicao': 'imaculada',
  'nossa-senhora-visitacao': 'visitacao',
  'visitacao': 'visitacao',
  'nossa-senhora-natividade': 'natividade',
  'natividade-maria': 'natividade',
  'anunciacao': 'anunciacao',
  'nossa-senhora-gracas': 'gracas',
  'medalhamilagrosa': 'gracas',
  'nossa-senhora-candelaria': 'candelaria',
  'nossa-senhora-rainha': 'rainha',
  'nossa-senhora-apresentacao': 'apresentacao',
};

// ─── Resolução do tema ativo ──────────────────────────────────────────────────

/**
 * Dado um array de temas e a data de hoje (YYYY-MM-DD), retorna o tema ativo
 * com a regra:
 *  1. Tema forçado → vence sempre (o primeiro encontrado, se houver mais de um)
 *  2. Temas cujas janelas (noveenaStart → endDate) cobrem hoje, ordenados por:
 *     a. Prioridade = true primeiro
 *     b. Menos dias até a festa (mais próximo do clímax litúrgico)
 *  3. Se nenhum cobre hoje → retorna null (padrão Terezinha será aplicado pelo hook)
 */
export function resolveActiveTheme(
  themes: FeastTheme[],
  todayISO: string
): ActiveTheme | null {
  // 1. Forçado
  const forced = themes.find((t) => t.forced);
  if (forced) return buildActiveTheme(forced, todayISO);

  // 2. Cobre hoje
  const covering = themes.filter(
    (t) => todayISO >= t.noveenaStart && todayISO <= t.endDate
  );
  if (covering.length === 0) return null;

  // Ordenar: prioridade desc, depois proximidade da festa asc
  covering.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority ? -1 : 1;
    const daysA = daysBetween(todayISO, a.feastDate);
    const daysB = daysBetween(todayISO, b.feastDate);
    return daysA - daysB;
  });

  return buildActiveTheme(covering[0], todayISO);
}

function buildActiveTheme(theme: FeastTheme, todayISO: string): ActiveTheme {
  const isFeast = todayISO === theme.feastDate;
  const isNovena = !isFeast && todayISO >= theme.noveenaStart && todayISO < theme.feastDate;

  let novenaDay: number | null = null;
  if (isNovena) {
    novenaDay = daysBetween(theme.noveenaStart, todayISO) + 1;
    novenaDay = Math.min(Math.max(novenaDay, 1), 9);
  }

  return { theme, isNovena, isFeast, novenaDay };
}

function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + 'T00:00:00');
  const to   = new Date(toISO   + 'T00:00:00');
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

// ─── Firestore — Temas customizados ──────────────────────────────────────────

const COLLECTION = 'agenda_themes';

/** Escuta temas customizados do Firestore em tempo real */
export function subscribeThemes(
  callback: (themes: FeastTheme[]) => void
): Unsubscribe {
  return onSnapshot(collection(db, COLLECTION), (snap) => {
    const themes: FeastTheme[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<FeastTheme, 'id'>),
    }));
    callback(themes);
  });
}

/** Adiciona um novo tema customizado */
export async function addFeastTheme(
  theme: Omit<FeastTheme, 'id'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...theme,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/** Atualiza um tema existente (por ID) */
export async function updateFeastTheme(
  id: string,
  patch: Partial<Omit<FeastTheme, 'id'>>
): Promise<void> {
  await setDoc(doc(db, COLLECTION, id), patch, { merge: true });
}

/** Remove um tema customizado */
export async function deleteFeastTheme(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

/** Força um tema pelo ID (todos os outros são desforçados) */
export async function forceTheme(
  id: string,
  allThemeIds: string[]
): Promise<void> {
  // Desforça todos
  await Promise.all(
    allThemeIds
      .filter((tid) => tid !== id)
      .map((tid) => setDoc(doc(db, COLLECTION, tid), { forced: false }, { merge: true }))
  );
  // Força o escolhido
  await setDoc(doc(db, COLLECTION, id), { forced: true }, { merge: true });
}

/** Reseta todos os temas para automático */
export async function clearForcedTheme(allThemeIds: string[]): Promise<void> {
  await Promise.all(
    allThemeIds.map((tid) =>
      setDoc(doc(db, COLLECTION, tid), { forced: false }, { merge: true })
    )
  );
}

// ─── Export dos temas padrão ──────────────────────────────────────────────────

export { defaultThemes };

/**
 * Mescla temas padrão com customizados do Firestore.
 * Customizados com mesmo ID sobrescrevem o padrão (nunca acontece — IDs são diferentes).
 * Customizados adicionais são somados.
 */
export function mergeThemes(
  customs: FeastTheme[],
  defaults: FeastTheme[]
): FeastTheme[] {
  // Customizados "forçados" sempre entram primeiro para facilitar resolução
  const customIds = new Set(customs.map((c) => c.id));
  const filtered = defaults.filter((d) => !customIds.has(d.id));
  return [...customs, ...filtered];
}

// ─── Helpers para o CSS ───────────────────────────────────────────────────────

/**
 * Retorna o valor do atributo data-tema a ser colocado em .agenda-root
 * com base no tema ativo.
 */
export function getDataTemaAttr(active: ActiveTheme | null): string {
  if (!active) return 'terezinha';
  const { theme } = active;
  if (theme.saintKey === 'nossa_senhora') {
    return `nossa_senhora${theme.marianInvocation ? `__${theme.marianInvocation}` : ''}`;
  }
  return theme.saintKey;
}
