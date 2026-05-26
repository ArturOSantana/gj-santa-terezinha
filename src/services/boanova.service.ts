import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc,
  doc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { db, storage, functions } from '../config/firebase';
import type {
  BoaNovaBroadcast,
  BroadcastContact,
  BroadcastChannel,
  BroadcastStatus,
  ContactStatus
} from '../types/boanova.types';

class BoaNovaService {
  // ============================================================================
  // MÉTODOS COMUNS
  // ============================================================================

  /**
   * Busca histórico de broadcasts
   */
  async getBroadcastHistory(channel?: BroadcastChannel): Promise<BoaNovaBroadcast[]> {
    try {
      const broadcastsRef = collection(db, 'boanova_broadcasts');
      let q = query(broadcastsRef, orderBy('createdAt', 'desc'));

      if (channel) {
        q = query(broadcastsRef, where('channel', '==', channel), orderBy('createdAt', 'desc'));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BoaNovaBroadcast));
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      throw new Error('Falha ao carregar histórico de broadcasts');
    }
  }

  /**
   * Busca membros com consentimento para o canal especificado
   */
  async getMembersWithConsent(channel: BroadcastChannel): Promise<BroadcastContact[]> {
    try {
      const membersRef = collection(db, 'members');
      const consentField = channel === 'whatsapp' ? 'whatsappConsent' : 'emailConsent';
      
      const q = query(
        membersRef,
        where(`${consentField}.accepted`, '==', true)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        const consent = data[consentField];
        const contact = channel === 'whatsapp' ? data.phone : data.email;
        
        return {
          id: doc.id,
          phoneNumber: channel === 'whatsapp' ? contact : undefined,
          email: channel === 'email' ? contact : undefined,
          name: data.name || 'Sem nome',
          status: 'pending' as ContactStatus,
          retryCount: 0
        } as BroadcastContact;
      }).filter(contact => contact.phoneNumber || contact.email); // Remove contatos sem telefone/email
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      throw new Error('Falha ao carregar contatos com consentimento');
    }
  }

  /**
   * Busca estatísticas de broadcasts
   */
  async getBroadcastStats() {
    try {
      const broadcasts = await this.getBroadcastHistory();
      
      const stats = {
        total: broadcasts.length,
        sent: 0,
        failed: 0,
        pending: 0,
        byChannel: {
          whatsapp: 0,
          email: 0
        } as Record<BroadcastChannel, number>
      };

      broadcasts.forEach(broadcast => {
        // Contagem por status
        if (broadcast.status === 'completed') {
          stats.sent += broadcast.recipients.sent || 0;
          stats.failed += broadcast.recipients.failed || 0;
        } else if (broadcast.status === 'sending' || broadcast.status === 'scheduled') {
          stats.pending += broadcast.recipients.pending || 0;
        }

        // Contagem por canal
        if (broadcast.channel !== 'both') {
          stats.byChannel[broadcast.channel]++;
        } else {
          stats.byChannel.whatsapp++;
          stats.byChannel.email++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error('Falha ao carregar estatísticas');
    }
  }

  /**
   * Upload de imagem para Firebase Storage
   */
  async uploadImage(file: File): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileName = `boanova/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      return url;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw new Error('Falha ao fazer upload da imagem');
    }
  }

  /**
   * Cancela um broadcast em andamento
   */
  async cancelBroadcast(broadcastId: string): Promise<void> {
    try {
      const broadcastRef = doc(db, 'boanova_broadcasts', broadcastId);
      await updateDoc(broadcastRef, {
        status: 'cancelled' as BroadcastStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao cancelar broadcast:', error);
      throw new Error('Falha ao cancelar broadcast');
    }
  }

  /**
   * Valida lista de contatos
   */
  validateContacts(contacts: string[], channel: BroadcastChannel): {
    valid: string[];
    invalid: string[];
  } {
    const valid: string[] = [];
    const invalid: string[] = [];

    contacts.forEach(contact => {
      const trimmed = contact.trim();
      
      if (channel === 'whatsapp') {
        // Valida telefone (apenas números, 10-11 dígitos)
        const phoneRegex = /^[0-9]{10,11}$/;
        if (phoneRegex.test(trimmed.replace(/\D/g, ''))) {
          valid.push(trimmed);
        } else {
          invalid.push(trimmed);
        }
      } else {
        // Valida e-mail
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(trimmed)) {
          valid.push(trimmed);
        } else {
          invalid.push(trimmed);
        }
      }
    });

    return { valid, invalid };
  }

  // ============================================================================
  // MÉTODOS E-MAIL
  // ============================================================================

  /**
   * Envia broadcast por e-mail
   */
  async sendEmailBroadcast(
    recipients: string[],
    subject: string,
    message: string,
    imageUrl?: string
  ): Promise<{ success: boolean; broadcastId: string; sent: number; failed: number }> {
    try {
      // Cria registro do broadcast
      const broadcastRef = await addDoc(collection(db, 'boanova_broadcasts'), {
        channel: 'email' as BroadcastChannel,
        status: 'sending' as BroadcastStatus,
        totalRecipients: recipients.length,
        successCount: 0,
        failureCount: 0,
        subject,
        message,
        imageUrl: imageUrl || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Chama Firebase Function para enviar e-mails
      const sendEmailFunction = httpsCallable(functions, 'sendEmailBroadcast');
      const result = await sendEmailFunction({
        broadcastId: broadcastRef.id,
        recipients,
        subject,
        message,
        imageUrl
      });

      const data = result.data as any;

      return {
        success: data.success,
        broadcastId: broadcastRef.id,
        sent: data.sent || 0,
        failed: data.failed || 0
      };
    } catch (error: any) {
      console.error('Erro ao enviar e-mail:', error);
      throw new Error(error.message || 'Falha ao enviar broadcast por e-mail');
    }
  }

  /**
   * Verifica se o serviço de e-mail está configurado
   */
  async verifyEmailService(): Promise<{ success: boolean; message: string }> {
    try {
      const verifyFunction = httpsCallable(functions, 'verifyEmail');
      const result = await verifyFunction();
      const data = result.data as any;

      return {
        success: data.success,
        message: data.message || 'Serviço verificado'
      };
    } catch (error: any) {
      console.error('Erro ao verificar serviço:', error);
      return {
        success: false,
        message: error.message || 'Falha ao verificar serviço de e-mail'
      };
    }
  }

  // ============================================================================
  // MÉTODOS WHATSAPP
  // ============================================================================

  /**
   * Inicia sessão WhatsApp e gera QR Code
   */
  async startWhatsAppSession(): Promise<{
    sessionId: string;
    qrCode: string;
  }> {
    try {
      const startSessionFunction = httpsCallable(functions, 'startWhatsAppSession');
      const result = await startSessionFunction();
      const data = result.data as any;

      if (!data.success) {
        throw new Error(data.message || 'Falha ao iniciar sessão');
      }

      return {
        sessionId: data.sessionId,
        qrCode: data.qrCode
      };
    } catch (error: any) {
      console.error('Erro ao iniciar sessão WhatsApp:', error);
      throw new Error(error.message || 'Falha ao iniciar sessão WhatsApp');
    }
  }

  /**
   * Verifica status da sessão WhatsApp
   */
  async checkWhatsAppSession(sessionId: string): Promise<{
    exists: boolean;
    status?: string;
    phoneNumber?: string;
  }> {
    try {
      const checkSessionFunction = httpsCallable(functions, 'checkWhatsAppSession');
      const result = await checkSessionFunction({ sessionId });
      const data = result.data as any;

      return {
        exists: data.exists,
        status: data.status,
        phoneNumber: data.phoneNumber
      };
    } catch (error: any) {
      console.error('Erro ao verificar sessão:', error);
      throw new Error(error.message || 'Falha ao verificar sessão WhatsApp');
    }
  }

  /**
   * Encerra sessão WhatsApp
   */
  async endWhatsAppSession(sessionId: string): Promise<void> {
    try {
      const endSessionFunction = httpsCallable(functions, 'endWhatsAppSession');
      await endSessionFunction({ sessionId });
    } catch (error: any) {
      console.error('Erro ao encerrar sessão:', error);
      throw new Error(error.message || 'Falha ao encerrar sessão WhatsApp');
    }
  }

  /**
   * Envia broadcast por WhatsApp
   */
  async sendWhatsAppBroadcast(
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
  ): Promise<{ success: boolean; broadcastId: string; sent: number; failed: number }> {
    try {
      // Cria registro do broadcast
      const broadcastRef = await addDoc(collection(db, 'boanova_broadcasts'), {
        channel: 'whatsapp' as BroadcastChannel,
        status: 'sending' as BroadcastStatus,
        totalRecipients: recipients.length,
        successCount: 0,
        failureCount: 0,
        message,
        imageUrl: imageUrl || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Chama Firebase Function para enviar mensagens
      const sendWhatsAppFunction = httpsCallable(functions, 'sendWhatsAppBroadcast');
      const result = await sendWhatsAppFunction({
        broadcastId: broadcastRef.id,
        sessionId,
        recipients,
        message,
        imageUrl,
        settings: settings || {}
      });

      const data = result.data as any;

      return {
        success: data.success,
        broadcastId: broadcastRef.id,
        sent: data.sent || 0,
        failed: data.failed || 0
      };
    } catch (error: any) {
      console.error('Erro ao enviar WhatsApp:', error);
      throw new Error(error.message || 'Falha ao enviar broadcast por WhatsApp');
    }
  }
}

export const boaNovaService = new BoaNovaService();

// Made with Bob