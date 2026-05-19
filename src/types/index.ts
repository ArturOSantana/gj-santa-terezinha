/**
 * Tipos e Interfaces do Sistema de Gestão do Grupo de Jovens
 * Paróquia Santa Terezinha
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Tipo de sábado do mês (1º, 2º, 3º ou 4º)
 */
export enum SaturdayType {
  FIRST = 1,
  SECOND = 2,
  THIRD = 3,
  FOURTH = 4,
}

/**
 * Status de presença em um evento
 */
export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  JUSTIFIED = 'justified',
}

/**
 * Tipo de transação financeira
 */
export enum TransactionType {
  INCOME = 'income',    // Entrada
  EXPENSE = 'expense',  // Saída
}

/**
 * Categoria de transação financeira
 */
export enum TransactionCategory {
  MONTHLY_FEE = 'monthly_fee',        // Mensalidade
  DONATION = 'donation',               // Doação
  EVENT = 'event',                     // Evento
  MATERIAL = 'material',               // Material
  FOOD = 'food',                       // Alimentação
  TRANSPORT = 'transport',             // Transporte
  OTHER = 'other',                     // Outros
}

/**
 * Status de um membro
 */
export enum MemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Interface para Membro do Grupo de Jovens
 */
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: Date;
  gender: 'male' | 'female'; // Gênero do membro (rapazes/moças)
  joinDate: Date;
  status: MemberStatus;
  photoUrl?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para Evento/Encontro
 */
export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  saturdayType: SaturdayType;
  isSpecialEvent: boolean; // Evento especial (fora do calendário regular)
  attendees: string[]; // IDs dos membros presentes
  attendance: {
    [memberId: string]: AttendanceStatus;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para Transação Financeira
 */
export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: Date;
  memberId?: string; // ID do membro relacionado (para mensalidades)
  eventId?: string; // ID do evento relacionado
  paymentMethod?: string;
  receipt?: string; // URL do comprovante
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para Resumo Financeiro
 */
export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  period: {
    start: Date;
    end: Date;
  };
  transactionsByCategory: {
    [key in TransactionCategory]?: number;
  };
}

/**
 * Interface para Estatísticas de Presença
 */
export interface AttendanceStats {
  memberId: string;
  memberName: string;
  totalEvents: number;
  presentCount: number;
  absentCount: number;
  justifiedCount: number;
  attendanceRate: number; // Percentual de presença
}

/**
 * Interface para Configurações do Sistema
 */
export interface SystemSettings {
  parishName: string;
  groupName: string;
  monthlyFeeAmount: number;
  meetingDay: number; // Dia da semana (0-6, onde 0 = Domingo)
  meetingTime: string;
  meetingLocation: string;
  notificationEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

/**
 * Interface para Usuário do Sistema
 */
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'coordinator' | 'member';
  memberId?: string; // Referência ao membro, se aplicável
  photoUrl?: string;
  createdAt: Date;
  lastLogin?: Date;
}

/**
 * Interface para Filtros de Busca
 */
export interface SearchFilters {
  startDate?: Date;
  endDate?: Date;
  status?: MemberStatus | AttendanceStatus;
  category?: TransactionCategory;
  memberId?: string;
  eventId?: string;
}

/**
 * Interface para Estatísticas do Dashboard
 */
export interface DashboardStats {
  totalMembers: number;
  nextEvent: Event | null;
  balance: number;
  attendanceRate: number;
}

/**
 * Interface para Atividades Recentes
 */
export interface Activity {
  id: string;
  type: 'attendance' | 'transaction' | 'event' | 'member';
  description: string;
  timestamp: Date;
  icon: string;
}

// Made with Bob
