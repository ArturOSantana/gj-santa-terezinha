/**
 * Hook useFeastTheme
 *
 * Combina os temas padrão (hardcoded por data litúrgica) com os temas
 * customizados do Firestore e resolve qual está ativo hoje.
 *
 * Também consome a API de novenas: quando ela confirma que uma novena está
 * em andamento e o slug corresponde a um dos nossos santos, um tema virtual
 * é construído a partir das datas da API — garantindo ativação automática
 * mesmo que o hardcoded esteja com data ligeiramente diferente.
 *
 * Retorna:
 *  - activeTheme: o tema resolvido (ou null → aplica padrão Terezinha no CSS)
 *  - dataTema: string para o atributo data-tema do .agenda-root
 *  - allThemes: lista completa para o painel admin
 *  - loading: true durante o primeiro carregamento do Firestore
 */

import { useEffect, useState, useMemo } from 'react';
import type { ActiveTheme, FeastTheme } from '../types/theme.types';
import {
  subscribeThemes,
  defaultThemes,
  mergeThemes,
  resolveActiveTheme,
  getDataTemaAttr,
  NOVENA_SLUG_TO_SAINT,
  NOVENA_SLUG_TO_INVOCATION,
} from '../services/theme.service';
import { fetchNovenaHoje } from '../services/novena.service';
import type { NovenaHoje } from '../types/novena.types';

// YYYY-MM-DD da data atual
const todayISO = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Constrói uma data ISO a partir de mês e dia no ano atual */
function isoFromMD(mes: number, dia: number): string {
  const y = new Date().getFullYear();
  return `${y}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

/**
 * Dado o array de novenas retornadas pela API hoje, cria FeastThemes temporários
 * para as que possuem correspondência no mapeamento de slugs.
 * Esses temas têm prioridade baixa — só entram se nenhum tema hardcoded cobrir hoje.
 */
function buildApiThemes(novenas: NovenaHoje[]): FeastTheme[] {
  const today = todayISO();
  const themes: FeastTheme[] = [];

  for (const n of novenas) {
    const saintKey = NOVENA_SLUG_TO_SAINT[n.slug];
    if (!saintKey) continue; // slug desconhecido — ignora

    // Calcula start/end a partir dos campos da API
    const noveenaStart = isoFromMD(n.inicioMes, n.inicioDia);
    const feastDate    = isoFromMD(n.fimMes,    n.fimDia);

    // Só usa se hoje realmente estiver na janela (evita artefatos de fuso)
    if (today < noveenaStart || today > feastDate) continue;

    const invocation = NOVENA_SLUG_TO_INVOCATION[n.slug];

    themes.push({
      id: `__api_${n.slug}`,
      saintKey,
      name: n.nome,
      subtitle: n.descricao ?? '',
      noveenaStart,
      feastDate,
      endDate: feastDate,
      priority: false,
      forced: false,
      marianInvocation: invocation,
    });
  }

  return themes;
}

interface UseFeastThemeReturn {
  activeTheme: ActiveTheme | null;
  /** Valor para data-tema no .agenda-root */
  dataTema: string;
  /** Todos os temas (padrão + customizados), para o admin */
  allThemes: FeastTheme[];
  loading: boolean;
}

export function useFeastTheme(): UseFeastThemeReturn {
  const [customThemes, setCustomThemes] = useState<FeastTheme[]>([]);
  const [apiNovenas, setApiNovenas]     = useState<NovenaHoje[]>([]);
  const [loading, setLoading]           = useState(true);

  // Escuta temas customizados do Firestore
  useEffect(() => {
    const unsub = subscribeThemes((themes) => {
      setCustomThemes(themes);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Carrega novenas ativas da API (uma vez por sessão — cache de 10 min no service)
  useEffect(() => {
    fetchNovenaHoje()
      .then(setApiNovenas)
      .catch(() => { /* API é opcional — silencia */ });
  }, []);

  const today = todayISO();
  const defaults = defaultThemes();

  // Temas da API — construídos a partir das novenas ativas confirmadas pela API
  const apiThemes = useMemo(() => buildApiThemes(apiNovenas), [apiNovenas]);

  // Merge: customizados > padrão > API
  // (customizados e padrão já têm regra de mesclagem própria; API é camada extra)
  const allThemesForAdmin = mergeThemes(customThemes, defaults);
  const allThemesForResolution = mergeThemes(allThemesForAdmin, apiThemes);

  const activeTheme = resolveActiveTheme(allThemesForResolution, today);
  const dataTema    = getDataTemaAttr(activeTheme);

  return { activeTheme, dataTema, allThemes: allThemesForAdmin, loading };
}
