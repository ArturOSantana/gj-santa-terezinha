
import { SaturdayType } from '../types';

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

export const isSaturday = (date: Date): boolean => {
  return date.getDay() === 6;
};

export const getNextSaturday = (date: Date = new Date()): Date => {
  const nextSaturday = new Date(date);
  const daysUntilSaturday = (6 - date.getDay() + 7) % 7 || 7;
  nextSaturday.setDate(date.getDate() + daysUntilSaturday);
  return nextSaturday;
};

export const formatDateBR = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatTime = (time: string): string => {
  return time;
};

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

