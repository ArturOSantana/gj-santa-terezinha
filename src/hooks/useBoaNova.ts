import { useState, useEffect, useCallback } from 'react';
import { boaNovaService } from '../services/boanova.service';
import type { 
  BoaNovaBroadcast, 
  BroadcastContact,
  BroadcastChannel 
} from '../types/boanova.types';

interface UseBoaNovaReturn {
  // Estado
  broadcasts: BoaNovaBroadcast[];
  contacts: BroadcastContact[];
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
    byChannel: Record<BroadcastChannel, number>;
  } | null;
  whatsappSession: {
    sessionId: string | null;
    qrCode: string | null;
    status: string | null;
    phoneNumber: string | null;
  };

  // Ações E-mail
  loadBroadcasts: (channel?: BroadcastChannel) => Promise<void>;
  loadContacts: (channel: BroadcastChannel) => Promise<void>;
  loadStats: () => Promise<void>;
  sendEmail: (
    recipients: string[],
    subject: string,
    message: string,
    imageUrl?: string
  ) => Promise<{ success: boolean; broadcastId: string; sent: number; failed: number }>;
  uploadImage: (file: File) => Promise<string>;
  verifyEmailService: () => Promise<{ success: boolean; message: string }>;
  
  // Ações WhatsApp
  startWhatsAppSession: () => Promise<void>;
  checkWhatsAppSession: (sessionId: string) => Promise<void>;
  endWhatsAppSession: (sessionId: string) => Promise<void>;
  sendWhatsApp: (
    sessionId: string,
    recipients: string[],
    message: string,
    imageUrl?: string,
    settings?: {
      delayMin?: number;
      delayMax?: number;
      batchSize?: number;
      batchDelay?: number;
    }
  ) => Promise<{ success: boolean; broadcastId: string; sent: number; failed: number }>;
  
  // Ações Comuns
  cancelBroadcast: (broadcastId: string) => Promise<void>;
  validateContacts: (contacts: string[], channel: BroadcastChannel) => {
    valid: string[];
    invalid: string[];
  };
  refresh: () => Promise<void>;
}

export function useBoaNova(): UseBoaNovaReturn {
  const [broadcasts, setBroadcasts] = useState<BoaNovaBroadcast[]>([]);
  const [contacts, setContacts] = useState<BroadcastContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    sent: number;
    failed: number;
    pending: number;
    byChannel: Record<BroadcastChannel, number>;
  } | null>(null);
  const [whatsappSession, setWhatsappSession] = useState<{
    sessionId: string | null;
    qrCode: string | null;
    status: string | null;
    phoneNumber: string | null;
  }>({
    sessionId: null,
    qrCode: null,
    status: null,
    phoneNumber: null
  });

  // ============================================================================
  // MÉTODOS COMUNS
  // ============================================================================

  const loadBroadcasts = useCallback(async (channel?: BroadcastChannel) => {
    setLoading(true);
    setError(null);
    try {
      const data = await boaNovaService.getBroadcastHistory(channel);
      setBroadcasts(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar broadcasts');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadContacts = useCallback(async (channel: BroadcastChannel) => {
    setLoading(true);
    setError(null);
    try {
      const data = await boaNovaService.getMembersWithConsent(channel);
      setContacts(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar contatos');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await boaNovaService.getBroadcastStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadImage = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const url = await boaNovaService.uploadImage(file);
      return url;
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload da imagem');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBroadcast = useCallback(async (broadcastId: string) => {
    setLoading(true);
    setError(null);
    try {
      await boaNovaService.cancelBroadcast(broadcastId);
      await loadBroadcasts();
    } catch (err: any) {
      setError(err.message || 'Erro ao cancelar broadcast');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadBroadcasts]);

  const validateContacts = useCallback((contacts: string[], channel: BroadcastChannel) => {
    return boaNovaService.validateContacts(contacts, channel);
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([loadBroadcasts(), loadStats()]);
  }, [loadBroadcasts, loadStats]);

  // ============================================================================
  // MÉTODOS E-MAIL
  // ============================================================================

  const sendEmail = useCallback(async (
    recipients: string[],
    subject: string,
    message: string,
    imageUrl?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await boaNovaService.sendEmailBroadcast(recipients, subject, message, imageUrl);
      await loadBroadcasts();
      return result;
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar e-mail');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadBroadcasts]);

  const verifyEmailService = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await boaNovaService.verifyEmailService();
      return result;
    } catch (err: any) {
      setError(err.message || 'Erro ao verificar serviço');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // MÉTODOS WHATSAPP
  // ============================================================================

  const startWhatsAppSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await boaNovaService.startWhatsAppSession();
      setWhatsappSession({
        sessionId: result.sessionId,
        qrCode: result.qrCode,
        status: 'qr_pending',
        phoneNumber: null
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao iniciar sessão WhatsApp');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkWhatsAppSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await boaNovaService.checkWhatsAppSession(sessionId);
      if (result.exists) {
        setWhatsappSession(prev => ({
          ...prev,
          status: result.status || null,
          phoneNumber: result.phoneNumber || null
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao verificar sessão');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const endWhatsAppSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      await boaNovaService.endWhatsAppSession(sessionId);
      setWhatsappSession({
        sessionId: null,
        qrCode: null,
        status: null,
        phoneNumber: null
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao encerrar sessão');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendWhatsApp = useCallback(async (
    sessionId: string,
    recipients: string[],
    message: string,
    imageUrl?: string,
    settings?: {
      delayMin?: number;
      delayMax?: number;
      batchSize?: number;
      batchDelay?: number;
    }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await boaNovaService.sendWhatsAppBroadcast(
        sessionId,
        recipients,
        message,
        imageUrl,
        settings
      );
      await loadBroadcasts();
      return result;
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar WhatsApp');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadBroadcasts]);

  // Carrega dados iniciais
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    broadcasts,
    contacts,
    loading,
    error,
    stats,
    whatsappSession,
    loadBroadcasts,
    loadContacts,
    loadStats,
    sendEmail,
    uploadImage,
    verifyEmailService,
    startWhatsAppSession,
    checkWhatsAppSession,
    endWhatsAppSession,
    sendWhatsApp,
    cancelBroadcast,
    validateContacts,
    refresh
  };
}

