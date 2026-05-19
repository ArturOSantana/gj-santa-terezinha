/**
 * Utilitários para o Calendário
 * Sistema de Gestão do Grupo de Jovens - Paróquia Santa Terezinha
 */

import { SaturdayType } from '../types';

/**
 * Identifica automaticamente o tipo de sábado baseado na data
 * 
 * @param date - Data a ser verificada
 * @returns O tipo de sábado (1º, 2º, 3º ou 4º)
 * 
 * @example
 * const date = new Date('2026-05-02'); // Primeiro sábado de maio
 * const type = getSaturdayTypeFromDate(date); // Retorna SaturdayType.FIRST
 */
export const getSaturdayTypeFromDate = (date: Date): SaturdayType => {
  // Verifica se é sábado
  if (date.getDay() !== 6) {
    // Se não for sábado, encontra o sábado mais próximo
    const daysUntilSaturday = (6 - date.getDay() + 7) % 7;
    date = new Date(date);
    date.setDate(date.getDate() + daysUntilSaturday);
  }

  // Encontra o primeiro dia do mês
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  
  // Encontra o primeiro sábado do mês
  const firstSaturday = new Date(firstDayOfMonth);
  while (firstSaturday.getDay() !== 6) {
    firstSaturday.setDate(firstSaturday.getDate() + 1);
  }
  
  // Calcula quantos dias se passaram desde o primeiro sábado
  const daysDiff = Math.floor(
    (date.getTime() - firstSaturday.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Calcula qual sábado do mês é (1º, 2º, 3º ou 4º)
  const saturdayNumber = Math.floor(daysDiff / 7) + 1;
  
  // Garante que retorna um valor válido (1-4)
  if (saturdayNumber >= 1 && saturdayNumber <= 4) {
    return saturdayNumber as SaturdayType;
  }
  
  // Se for o 5º sábado ou inválido, retorna o 4º
  return SaturdayType.FOURTH;
};

/**
 * Retorna informações sobre o tipo de sábado
 * 
 * @param type - Tipo de sábado
 * @returns Objeto com cor, label e descrição
 */
export const getSaturdayTypeInfo = (type: SaturdayType) => {
  switch (type) {
    case SaturdayType.FIRST:
      return {
        color: '#9c27b0',
        label: '1º Sábado',
        description: 'Oração e Espiritualidade',
        fullLabel: '1º Sábado - Oração e Espiritualidade',
      };
    case SaturdayType.SECOND:
      return {
        color: '#ff9800',
        label: '2º Sábado',
        description: 'Grande Evento/Convivência',
        fullLabel: '2º Sábado - Grande Evento/Convivência',
      };
    case SaturdayType.THIRD:
      return {
        color: '#2196f3',
        label: '3º Sábado',
        description: 'Formação I - Doutrinário',
        fullLabel: '3º Sábado - Formação I - Doutrinário',
      };
    case SaturdayType.FOURTH:
      return {
        color: '#4caf50',
        label: '4º Sábado',
        description: 'Formação II - Aprofundamento',
        fullLabel: '4º Sábado - Formação II - Aprofundamento',
      };
    default:
      return {
        color: '#757575',
        label: 'Tipo desconhecido',
        description: '',
        fullLabel: 'Tipo desconhecido',
      };
  }
};

/**
 * Retorna todos os sábados de um mês específico
 * 
 * @param year - Ano
 * @param month - Mês (0-11)
 * @returns Array com as datas de todos os sábados do mês
 */
export const getSaturdaysInMonth = (year: number, month: number): Date[] => {
  const saturdays: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Encontra o primeiro sábado
  let currentDate = new Date(firstDay);
  while (currentDate.getDay() !== 6) {
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Adiciona todos os sábados do mês
  while (currentDate <= lastDay) {
    saturdays.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  return saturdays;
};

/**
 * Verifica se uma data é sábado
 * 
 * @param date - Data a ser verificada
 * @returns true se for sábado, false caso contrário
 */
export const isSaturday = (date: Date): boolean => {
  return date.getDay() === 6;
};

/**
 * Retorna o próximo sábado a partir de uma data
 * 
 * @param date - Data de referência
 * @returns Data do próximo sábado
 */
export const getNextSaturday = (date: Date = new Date()): Date => {
  const nextSaturday = new Date(date);
  const daysUntilSaturday = (6 - date.getDay() + 7) % 7 || 7;
  nextSaturday.setDate(date.getDate() + daysUntilSaturday);
  return nextSaturday;
};

/**
 * Formata uma data para exibição no formato brasileiro
 * 
 * @param date - Data a ser formatada
 * @returns String formatada (ex: "02/05/2026")
 */
export const formatDateBR = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Formata um horário para exibição
 * 
 * @param time - Horário no formato "HH:mm"
 * @returns String formatada (ex: "18:00")
 */
export const formatTime = (time: string): string => {
  return time;
};

/**
 * Valida se um horário de término é posterior ao horário de início
 * 
 * @param startTime - Horário de início (formato "HH:mm")
 * @param endTime - Horário de término (formato "HH:mm")
 * @returns true se o horário de término for posterior, false caso contrário
 */
export const isEndTimeAfterStartTime = (
  startTime: string,
  endTime: string
): boolean => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  return endMinutes > startMinutes;
};

// Made with Bob