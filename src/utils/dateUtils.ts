/**
 * Utilitários para manipulação de datas e horários
 * Converte entre UTC (Firestore) e horário local (Brasil)
 */

/**
 * Converte timestamp do Firestore (UTC) para horário de Brasília
 */
export const formatFirestoreDate = (timestamp: any): string => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Converte timestamp do Firestore para apenas data (sem hora)
 */
export const formatFirestoreDateOnly = (timestamp: any): string => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  return date.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Converte timestamp do Firestore para apenas hora
 */
export const formatFirestoreTime = (timestamp: any): string => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  return date.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Converte Date local para UTC (para salvar no Firestore)
 */
export const toUTC = (date: Date): Date => {
  return new Date(date.toISOString());
};

/**
 * Converte UTC para horário de Brasília
 */
export const fromUTC = (date: Date): Date => {
  return new Date(date.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
};

/**
 * Formata duração em minutos para texto legível
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}min`;
};

/**
 * Calcula diferença entre duas datas em dias
 */
export const daysBetween = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
};

/**
 * Verifica se uma data é hoje
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Verifica se uma data é amanhã
 */
export const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
};

/**
 * Formata data relativa (hoje, amanhã, ou data completa)
 */
export const formatRelativeDate = (timestamp: any): string => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  if (isToday(date)) {
    return `Hoje às ${formatFirestoreTime(timestamp)}`;
  }
  
  if (isTomorrow(date)) {
    return `Amanhã às ${formatFirestoreTime(timestamp)}`;
  }
  
  return formatFirestoreDate(timestamp);
};

/**
 * Converte string de data/hora para Date considerando timezone de Brasília
 */
export const parseBrazilDateTime = (dateStr: string, timeStr: string): Date => {
  // Formato esperado: "DD/MM/YYYY" e "HH:MM"
  const [day, month, year] = dateStr.split('/').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  
  // Criar data no timezone de Brasília
  const date = new Date(year, month - 1, day, hour, minute);
  
  return date;
};

/**
 * Formata timestamp para exibição em cards/listas
 */
export const formatCardDate = (timestamp: any): string => {
  if (!timestamp) return 'Data não disponível';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Agora mesmo';
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays} dias atrás`;
  
  return formatFirestoreDateOnly(timestamp);
};

