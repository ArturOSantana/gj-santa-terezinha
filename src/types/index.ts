// ============================================================================
// ENUMS & TYPES - GJ SANTA TEREZINHA
// ============================================================================

export type UserRole = 'admin' | 'coordinator' | 'leader' | 'member' | 'pending';

export enum EventCategory {
  FORMATION = 'formation',
  MASS = 'mass',
  MEETING = 'meeting',
  RETREAT = 'retreat',
  OUTING = 'outing',
  LEADERSHIP_MEETING = 'leadership_meeting',
  PASTORAL = 'pastoral',
  PARISH = 'parish',
  SCHEDULE = 'schedule',
  DEADLINE = 'deadline',
  GJ_MEETING = 'gj_meeting',
  OTHER = 'other',
}

export enum ActivityType {
  SPIRITUALITY = 'spirituality',
  FELLOWSHIP = 'fellowship',
  FORMATION = 'formation',
  DEEPENING = 'deepening',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  MIXED = 'mixed',
}

export enum MemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum PersonStatus {
  ACTIVE = 'active',        // Ativo no grupo
  NEW = 'new',              // Novo / recém chegado
  AWAY = 'away',            // Afastado / sumido (>30 dias)
  ALUMNI = 'alumni',        // Ex-integrante
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ScheduleStatus {
  CONFIRMED = 'confirmed',
  PENDING = 'pending',
  DECLINED = 'declined',
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum TransactionCategory {
  MONTHLY_FEE = 'monthly_fee',
  DONATION = 'donation',
  EVENT_INCOME = 'event_income',
  FUNDRAISING = 'fundraising',
  FORMATION = 'formation',
  MEETING_SNACK = 'meeting_snack',
  MATERIAL = 'material',
  FOOD = 'food',
  TRANSPORT = 'transport',
  RETREAT = 'retreat',
  OTHER = 'other',
}

export enum RegistrationSourceProvider {
  MANUAL = 'manual',
  GOOGLE_FORMS = 'google_forms',
  EXTERNAL_SYSTEM = 'external_system',
  PUBLIC_PAGE = 'public_page',
}

export enum PaymentStatus {
  PAID = 'paid',
  PENDING = 'pending',
  PARTIAL = 'partial',
  WAIVED = 'waived',
}

// ============================================================================
// INTERFACES CENTRAIS
// ============================================================================

/**
 * Pessoa no ecossistema (jovem, servidor, coordenador).
 * Nem toda Pessoa é Usuário do sistema (sem login para a maioria dos jovens).
 */
export interface Person {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
  gender?: 'male' | 'female';
  joinDate?: Date;
  status: PersonStatus;
  userId?: string; // Se vinculado a um login do sistema
  rolesInGroup?: string[]; // Ex: ["Coordenação", "Música", "Liturgia"]
  parish?: string;
  guardianName?: string; // Nome do responsável (se menor)
  guardianPhone?: string;
  dietaryRestrictions?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Retrocompatibilidade com componentes que chamavam de Member
export type Member = Person;

/**
 * Evento com organização 360°, integrações externas e checklist
 */
export interface EventChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  assignedTo?: string; // Nome ou ID do responsável
}

export interface EventTeamMember {
  personId?: string;
  personName: string;
  role: string; // Ex: 'Coordenação', 'Cozinha', 'Música', 'Liturgia'
  status?: 'confirmed' | 'pending';
}

export interface RegistrationSourceConfig {
  provider: RegistrationSourceProvider;
  formUrl?: string;
  spreadsheetId?: string;
  sheetName?: string;
  externalApiUrl?: string;
  lastSyncedAt?: Date;
  autoSync?: boolean;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  personId?: string;
  name: string;
  phone?: string;
  birthDate?: Date;
  age?: number;
  guardianName?: string;
  guardianPhone?: string;
  emergencyContact?: string;
  dietaryRestrictions?: string;
  parish?: string;
  source: RegistrationSourceProvider;
  externalId?: string;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  totalAmount: number;
  registeredAt: Date;
  confirmed: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  themeVerse?: string; // Ex: "Faça-se em mim segundo a tua palavra"
  date: Date;
  endDate?: Date; // Para retiros/eventos de múltiplos dias
  startTime: string;
  endTime: string;
  location: string;
  category: EventCategory;
  activityType?: ActivityType;
  responsibleName?: string;
  responsibleId?: string;
  maxParticipants?: number;
  price?: number;
  priceCents?: number;
  googleCalendarId?: string;
  googleEventId?: string;
  googleSyncStatus?: 'synced' | 'pending' | 'conflict' | 'error' | 'disconnected';
  googleLastSyncedAt?: Date;
  googleLastModifiedAt?: Date;
  visibility?: 'public' | 'leadership' | 'private';
  isPublic: boolean;
  publicSlug?: string; // Ex: 'retiro-fiat-2026'
  registrationSource?: RegistrationSourceConfig;
  checklist?: EventChecklistItem[];
  teams?: EventTeamMember[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tarefas da Coordenação
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedToName?: string;
  assignedToId?: string;
  eventId?: string;
  eventTitle?: string;
  dueDate: Date;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Escalas de serviço
 */
export interface ScheduleAssignment {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  role: string; // Ex: 'Coordenação', 'Música', 'Recepção', 'Lanche', 'Liturgia'
  personId?: string;
  personName: string;
  personPhone?: string;
  status: ScheduleStatus;
  publicToken?: string; // Token para confirmação sem login pelo WhatsApp
  updatedAt: Date;
}

/**
 * Presenças e Frequência Pastoral
 */
export interface AttendanceRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  personId?: string;
  personName: string;
  phone?: string;
  checkedInAt: Date;
  method: 'qr_code' | 'manual' | 'self_checkin';
}

/**
 * Reuniões e Atas da Coordenação
 */
export interface MeetingAgendaItem {
  id: string;
  title: string;
  description?: string;
}

export interface MeetingDecision {
  id: string;
  text: string;
}

export interface MeetingGeneratedTask {
  id: string;
  taskTitle: string;
  assignedTo: string;
  completed?: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  date: Date;
  location?: string;
  attendees: string[]; // Nomes dos participantes
  agenda: MeetingAgendaItem[];
  decisions: MeetingDecision[];
  generatedTasks: MeetingGeneratedTask[];
  notes?: string;
  createdAt: Date;
}

/**
 * Documentos do Grupo (links ou arquivos)
 */
export interface GroupDocument {
  id: string;
  title: string;
  category: 'Retiro' | 'Financeiro' | 'Coordenação' | 'Formação' | 'Outros';
  fileType: 'pdf' | 'xlsx' | 'docx' | 'link' | 'image';
  url: string;
  size?: string;
  eventId?: string;
  isPublic: boolean;
  uploadedByName: string;
  createdAt: Date;
}

/**
 * Tesouraria / Caixa
 */
export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  amountCents?: number;
  description: string;
  date: Date;
  memberId?: string;
  personName?: string;
  personId?: string;
  eventId?: string;
  eventTitle?: string;
  paymentMethod?: string;
  receiptUrl?: string; // Comprovante anexado
  hasReceipt: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorName: string;
  action: string;
  entity: string;
  entityId: string;
  details?: Record<string, any>;
  createdAt: Date;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  expensesWithoutReceipt: number;
  period: {
    start: Date;
    end: Date;
  };
  transactionsByCategory: {
    [key in TransactionCategory]?: number;
  };
}

/**
 * Usuário do Sistema (Auth)
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  personId?: string;
}

export interface User extends Person {
  role: UserRole;
  lastLogin?: Date;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    phone: string,
    birthDate: Date,
    gender: 'male' | 'female',
    whatsappConsent?: boolean,
    emailConsent?: boolean
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
}

export interface DashboardStats {
  totalPeople: number;
  activePeople: number;
  newPeople: number;
  awayPeople: number;
  nextEvent: Event | null;
  balance: number;
  pendingTasksCount: number;
  expensesWithoutReceiptTotal: number;
  retreatRegistrationsCount: number;
  retreatTarget: number;
}

// ============================================================================
// CONFIGURAÇÃO DA PÁGINA PÚBLICA (ADM)
// ============================================================================

export type PublicPageSection =
  | 'hero'
  | 'retreat_highlight'
  | 'next_events'
  | 'share_whatsapp'
  | 'public_calendar_link'
  | 'checkin_link'
  | 'custom_cards';

// ============================================================================
// CARDS CUSTOMIZADOS DA PÁGINA PÚBLICA
// ============================================================================

export type PublicCardStyle = 'highlight' | 'dark' | 'minimal';

export interface PublicCard {
  id: string;
  /** Título do card (ex: "Retiro FIAT 2026") */
  title: string;
  /** Badge/etiqueta no topo (ex: "INSCRIÇÕES ABERTAS", "EM BREVE") */
  badge?: string;
  /** Descrição curta exibida no card */
  description?: string;
  /** Versículo ou subtítulo em itálico */
  verse?: string;
  /** Data de início (string ISO ou texto livre como "14 a 16 de Fevereiro") */
  dateText?: string;
  /** Local do evento */
  location?: string;
  /** Valor (ex: "R$ 80,00") */
  priceText?: string;
  /** Texto do botão de ação */
  buttonLabel: string;
  /** URL do cadastro externo (Google Forms, WhatsApp, site, etc.) */
  externalUrl: string;
  /** Se true, abre em nova aba */
  openInNewTab: boolean;
  /** Estilo visual do card */
  style: PublicCardStyle;
  /** Ordem de exibição (menor = primeiro) */
  order: number;
  /** Card visível na home pública */
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicPageConfig {
  /** Título exibido no hero */
  heroTitle: string;
  /** Subtítulo/descrição exibida no hero */
  heroSubtitle: string;
  /** Citação/versículo exibido no chip acima do título */
  heroQuote: string;
  /** Quais seções estão visíveis */
  sections: Record<PublicPageSection, boolean>;
  /** Botões de ação rápida no hero */
  showCalendarButton: boolean;
  showCheckinButton: boolean;
  showShareButton: boolean;
  /** Texto customizado no botão de compartilhamento WhatsApp */
  shareButtonText: string;
  /** Mensagem padrão do convite no WhatsApp */
  shareMessage: string;
  /** Rodapé - texto de copyright */
  footerText: string;
  updatedAt: Date;
  updatedByName?: string;
}

export const EMPTY_PUBLIC_CARD: Omit<PublicCard, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  badge: 'INSCRIÇÕES ABERTAS',
  description: '',
  verse: '',
  dateText: '',
  location: '',
  priceText: '',
  buttonLabel: 'Quero me inscrever',
  externalUrl: '',
  openInNewTab: true,
  style: 'highlight',
  order: 0,
  visible: true,
};

export const DEFAULT_PUBLIC_PAGE_CONFIG: PublicPageConfig = {
  heroTitle: 'Grupo de Jovens Santa Terezinha',
  heroSubtitle:
    'Aqui você encontra os próximos encontros, inscrições para retiros, nossa agenda oficial e presença nos eventos. Tudo sem precisar de cadastro ou senha.',
  heroQuote: '',
  sections: {
    hero: true,
    retreat_highlight: true,
    next_events: true,
    share_whatsapp: true,
    public_calendar_link: true,
    checkin_link: true,
    custom_cards: true,
  },
  showCalendarButton: true,
  showCheckinButton: true,
  showShareButton: true,
  shareButtonText: 'Convidar um amigo no WhatsApp',
  shareMessage:
    '*Grupo de Jovens Santa Terezinha*\nVenha participar dos nossos encontros, formações e retiros!\n\nConfira nossa programação e inscrições abertas:',
  footerText: 'Grupo de Jovens Santa Terezinha • Paróquia Santa Terezinha',
  updatedAt: new Date(),
};
