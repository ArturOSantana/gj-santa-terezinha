// ============================================================================
// BOA NOVA - TIPOS DO SISTEMA DE ENVIO DE MENSAGENS
// ============================================================================

export type BroadcastChannel = 'whatsapp' | 'email' | 'both';
export type BroadcastStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'cancelled';
export type ContactStatus = 'pending' | 'sent' | 'failed' | 'invalid';
export type SessionStatus = 'initializing' | 'qr_pending' | 'connected' | 'disconnected' | 'error';

// ============================================================================
// CONSENTIMENTOS
// ============================================================================

export interface CommunicationConsent {
  accepted: boolean;
  acceptedAt: Date;
  revokedAt?: Date;
  ipAddress?: string;
}

// ============================================================================
// SESSÃO WHATSAPP
// ============================================================================

export interface WhatsAppSession {
  id: string;
  userId: string;
  status: SessionStatus;
  qrCode?: string;
  phoneNumber?: string;
  createdAt: Date;
  connectedAt?: Date;
  expiresAt: Date;
  lastActivity: Date;
  metadata: {
    userAgent: string;
    ipAddress?: string;
  };
}

// ============================================================================
// BROADCAST
// ============================================================================

export interface BoaNovaBroadcast {
  id: string;
  userId: string;
  channel: BroadcastChannel;
  status: BroadcastStatus;
  
  // Conteúdo
  subject?: string;  // Apenas para e-mail
  message: string;
  imageUrl?: string;
  
  // Destinatários
  recipients: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
  };
  
  // Resultados por canal
  whatsapp?: {
    sent: number;
    failed: number;
    sessionId?: string;
  };
  
  email?: {
    sent: number;
    failed: number;
  };
  
  // Configurações de envio
  settings: {
    delayMin: number;      // Delay mínimo entre mensagens (segundos)
    delayMax: number;      // Delay máximo entre mensagens (segundos)
    batchSize: number;     // Mensagens por lote
    batchDelay: number;    // Delay entre lotes (minutos)
  };
  
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  scheduledFor?: Date;
}

// ============================================================================
// CONTATO DO BROADCAST
// ============================================================================

export interface BroadcastContact {
  id: string;
  phoneNumber?: string;
  email?: string;
  name?: string;
  status: ContactStatus;
  sentAt?: Date;
  error?: string;
  retryCount: number;
}

// ============================================================================
// LOG DO BROADCAST
// ============================================================================

export interface BroadcastLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// RATE LIMIT
// ============================================================================

export interface RateLimit {
  id: string;  // userId
  dailyMessages: number;
  weeklyMessages: number;
  lastReset: Date;
  violations: number;
  blockedUntil?: Date;
}

// ============================================================================
// FILTROS DE DESTINATÁRIOS
// ============================================================================

export interface RecipientFilters {
  source: 'upload' | 'members' | 'both';
  status?: ('active' | 'inactive' | 'suspended')[];
  gender?: ('male' | 'female')[];
  hasWhatsAppConsent?: boolean;
  hasEmailConsent?: boolean;
}

// ============================================================================
// DADOS DE ENVIO
// ============================================================================

export interface SendBroadcastData {
  channel: BroadcastChannel;
  recipients: string[];  // Telefones ou e-mails
  subject?: string;      // Apenas para e-mail
  message: string;
  imageUrl?: string;
  settings?: {
    delayMin?: number;
    delayMax?: number;
    batchSize?: number;
    batchDelay?: number;
  };
  scheduledFor?: Date;
}

// ============================================================================
// RESULTADO DE ENVIO
// ============================================================================

export interface SendResult {
  success: boolean;
  broadcastId: string;
  sent: number;
  failed: number;
  errors?: string[];
}

