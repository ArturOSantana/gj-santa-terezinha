
// ============================================================================
// ENUMS
// ============================================================================

export enum EventCategory {
  SATURDAY = 'saturday',
  SOLEMNITY = 'solemnity',
  SAINT_DAY = 'saint_day',
  BIRTHDAY = 'birthday',
  PARISH_EVENT = 'parish_event',
  NOVENA = 'novena',
  // Novas categorias para Google Calendar
  GJ_MEETING = 'gj_meeting',
  RETREAT = 'retreat',
  MASS = 'mass'
}

export enum ActivityType {
  SPIRITUALITY = 'spirituality',
  FELLOWSHIP = 'fellowship',
  FORMATION = 'formation',
  DEEPENING = 'deepening',
}

export enum TransactionType {
  INCOME = 'income',    // Entrada
  EXPENSE = 'expense',  // Saída
}

export enum TransactionCategory {
  MONTHLY_FEE = 'monthly_fee',        // Mensalidade
  DONATION = 'donation',               // Doação
  EVENT = 'event',                     // Evento
  MATERIAL = 'material',               // Material
  FOOD = 'food',                       // Alimentação
  TRANSPORT = 'transport',             // Transporte
  OTHER = 'other',                     // Outros
}

export enum MemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum Gender {
  MALE = 'male',      // Rapazes
  FEMALE = 'female',  // Moças
  MIXED = 'mixed',    // Misto (ambos)
}

// ============================================================================
// INTERFACES
// ============================================================================

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

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  category: EventCategory;
  activityType?: ActivityType;
  targetGender?: Gender; // Para filtrar eventos de moças/rapazes
  googleCalendarId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

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

export type UserRole = 'admin' | 'coordinator' | 'member';

export interface User {
  id: string;
  email: string;
  displayName: string;
  phone: string;
  birthDate: Date;
  role: UserRole;
  memberId?: string; // Referência ao membro, se aplicável
  photoUrl?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  memberId?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, phone: string, birthDate: Date) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
}

export interface SearchFilters {
  startDate?: Date;
  endDate?: Date;
  status?: MemberStatus;
  category?: TransactionCategory;
  memberId?: string;
  eventId?: string;
}

export interface DashboardStats {
  totalMembers: number;
  nextEvent: Event | null;
  balance: number;
}

export interface Activity {
  id: string;
  type: 'transaction' | 'event' | 'member';
  description: string;
  timestamp: Date;
  icon: string;
}

