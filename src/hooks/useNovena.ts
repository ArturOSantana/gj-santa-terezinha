/**
 * Hook useNovena
 *
 * Carrega as novenas em andamento hoje e o calendário anual de novenas.
 * - novenas: lista do dia com progresso local
 * - novenaDateSet: Set<ISO> de todos os dias com novena no ano atual (+ próximo)
 * - novenaCalItems: array flat para lookup de nomes por data
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { NovenaHoje, NovenaCompleta, NovenaCalItem, NovenaProgress } from '../types/novena.types';
import {
  fetchNovenaHoje,
  fetchNovenaCompleta,
  fetchNovenasDatas,
  buildNovenaDateSet,
  getNovenaProgress,
  toggleNovenaDay,
} from '../services/novena.service';

export interface NovenaState {
  hoje: NovenaHoje;
  progress: NovenaProgress;
  completa: NovenaCompleta | null;
  loadingCompleta: boolean;
}

interface UseNovenaReturn {
  novenas: NovenaState[];
  loading: boolean;
  /** Set de todas as datas ISO (YYYY-MM-DD) com alguma novena — ano atual + próximo */
  novenaDateSet: Set<string>;
  /** Array flat para lookup de nomes por data */
  novenaCalItems: NovenaCalItem[];
  /** Carrega a novena completa (todos os dias) para um slug */
  loadCompleta: (slug: string) => Promise<void>;
  /** Marca/desmarca um dia como rezado */
  toggleDay: (slug: string, inicioMes: number, inicioDia: number, day: number) => void;
}

export function useNovena(): UseNovenaReturn {
  const [novenas, setNovenas]         = useState<NovenaState[]>([]);
  const [loading, setLoading]         = useState(true);
  const [calItems, setCalItems]       = useState<NovenaCalItem[]>([]);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Carrega hoje + calendário do ano atual e próximo em paralelo
    Promise.all([
      fetchNovenaHoje(),
      fetchNovenasDatas(currentYear),
      fetchNovenasDatas(currentYear + 1),
    ])
      .then(([lista, itemsAno, itemsProximo]) => {
        if (cancelled) return;
        const states: NovenaState[] = lista.map((hoje) => ({
          hoje,
          progress: getNovenaProgress(hoje.slug, hoje.inicioMes, hoje.inicioDia),
          completa: null,
          loadingCompleta: false,
        }));
        setNovenas(states);
        setCalItems([...itemsAno, ...itemsProximo]);

        // Carrega a novena completa em background para ter oracaoInicial/oracaoFinal
        lista.forEach((hoje) => {
          fetchNovenaCompleta(hoje.slug).then((completa) => {
            if (cancelled || !completa) return;
            setNovenas((prev) =>
              prev.map((n) => n.hoje.slug === hoje.slug ? { ...n, completa } : n)
            );
          });
        });
      })
      .catch(() => { /* novena é opcional — silencia */ })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [currentYear]);

  const loadCompleta = useCallback(async (slug: string) => {
    // Marca como carregando
    setNovenas((prev) =>
      prev.map((n) => n.hoje.slug === slug ? { ...n, loadingCompleta: true } : n)
    );
    const completa = await fetchNovenaCompleta(slug);
    setNovenas((prev) =>
      prev.map((n) =>
        n.hoje.slug === slug ? { ...n, completa, loadingCompleta: false } : n
      )
    );
  }, []);

  const toggleDay = useCallback(
    (slug: string, inicioMes: number, inicioDia: number, day: number) => {
      const updated = toggleNovenaDay(slug, inicioMes, inicioDia, day);
      setNovenas((prev) =>
        prev.map((n) =>
          n.hoje.slug === slug ? { ...n, progress: updated } : n
        )
      );
    },
    []
  );

  // Set derivado — recalcula só quando calItems muda
  const novenaDateSet = useMemo(() => buildNovenaDateSet(calItems), [calItems]);

  return { novenas, loading, novenaDateSet, novenaCalItems: calItems, loadCompleta, toggleDay };
}
