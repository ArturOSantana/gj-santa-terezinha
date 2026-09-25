/**
 * Utilitários de data e categoria para a Agenda dos Jovens
 */

import type { AgendaCategory, AgendaFilter } from '../../types/agenda.types';
import { WEEKDAYS, MONTHS } from '../../types/agenda.types';

export const pad = (n: number): string => String(n).padStart(2, '0');

export const todayStr = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Retorna instância de Date de uma string YYYY-MM-DD sem ambiguidade de fuso */
export const parseDate = (dateStr: string): Date =>
  new Date(`${dateStr}T12:00:00`);

export const formatWhen = (date: string, time?: string): string => {
  const d = parseDate(date);
  const wd = WEEKDAYS[d.getDay()];
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  return `${wd}, ${day} de ${month}${time ? ` às ${time}` : ''}`;
};

export const getCatVar = (cat: AgendaCategory | AgendaFilter): string => {
  const map: Record<string, string> = {
    paroquia:     'var(--ag-paroquia)',
    jovens:       'var(--ag-jovens)',
    joana:        'var(--ag-joana)',
    crisma:       'var(--ag-crisma)',
    tlc:          'var(--ag-tlc)',
    catequese:    'var(--ag-catequese)',
    oratorio:     'var(--ag-oratorio)',
    perseveranca: 'var(--ag-perseveranca)',
    servidores:   'var(--ag-servidores)',
    outros:       'var(--ag-outros)',
    all:          'var(--ag-navy)',
    novena:       'var(--ag-gold)',
  };
  return map[cat] ?? 'var(--ag-outros)';
};
