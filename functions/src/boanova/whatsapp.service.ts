import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  delay,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as admin from 'firebase-admin';
import * as QRCode from 'qrcode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import pino from 'pino';

const logger = pino({ level: 'info' });

interface WhatsAppSession {
  socket: WASocket | null;
  qrCode: string | null;
  status: 'initializing' | 'qr_pending' | 'connected' | 'disconnected' | 'error';
  phoneNumber?: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Gerenciador de sessões WhatsApp com Baileys
 * Implementa estratégias anti-banimento
 */
class WhatsAppService {
  private sessions: Map<string, WhatsAppSession> = new Map();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos
  private readonly AUTH_DIR = path.join(os.tmpdir(), 'baileys_auth');

  constructor() {
    // Criar diretório de autenticação se não existir
    if (!fs.existsSync(this.AUTH_DIR)) {
      fs.mkdirSync(this.AUTH_DIR, { recursive: true });
    }

    // Limpar sessões expiradas a cada 5 minutos
    setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
  }

  /**
   * Inicia uma nova sessão WhatsApp
   */
  async startSession(userId: string): Promise<{ sessionId: string; qrCode: string }> {
    try {
      const sessionId = `${userId}_${Date.now()}`;
      const authDir = path.join(this.AUTH_DIR, sessionId);

      // Criar diretório de autenticação para esta sessão
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(authDir);

      // Configurar socket com estratégias anti-banimento
      const socket = makeWASocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, logger)
        },
        logger,
        printQRInTerminal: false,
        browser: ['GJ Santa Terezinha', 'Chrome', '120.0.0'], // Simular navegador real
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
        markOnlineOnConnect: false, // Não marcar como online automaticamente
        syncFullHistory: false, // Não sincronizar histórico completo
        getMessage: async () => undefined
      });

      let qrCode: string | null = null;

      // Listener para QR Code
      socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          // Gerar QR Code como string base64
          qrCode = await QRCode.toDataURL(qr);
          
          const session = this.sessions.get(sessionId);
          if (session) {
            session.qrCode = qrCode;
            session.status = 'qr_pending';
          }

          // Salvar QR Code no Firestore
          await admin.firestore()
            .collection('whatsapp_sessions')
            .doc(sessionId)
            .set({
              userId,
              qrCode,
              status: 'qr_pending',
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              expiresAt: new Date(Date.now() + this.SESSION_TIMEOUT)
            }, { merge: true });
        }

        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          
          if (shouldReconnect) {
            logger.info('Reconectando...');
            // Não reconectar automaticamente para evitar banimento
          } else {
            logger.info('Sessão encerrada pelo usuário');
            await this.endSession(sessionId);
          }
        } else if (connection === 'open') {
          logger.info('Conexão estabelecida!');
          
          const session = this.sessions.get(sessionId);
          if (session) {
            session.status = 'connected';
            session.phoneNumber = socket.user?.id.split(':')[0];
          }

          // Atualizar status no Firestore
          await admin.firestore()
            .collection('whatsapp_sessions')
            .doc(sessionId)
            .update({
              status: 'connected',
              phoneNumber: socket.user?.id.split(':')[0],
              connectedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
      });

      // Listener para salvar credenciais
      socket.ev.on('creds.update', saveCreds);

      // Criar sessão
      const session: WhatsAppSession = {
        socket,
        qrCode,
        status: 'initializing',
        userId,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.SESSION_TIMEOUT)
      };

      this.sessions.set(sessionId, session);

      // Aguardar QR Code ser gerado (timeout de 90 segundos)
      logger.info('Aguardando geração do QR Code...');
      let attempts = 0;
      const maxAttempts = 90; // 90 segundos
      
      while (!qrCode && attempts < maxAttempts) {
        await delay(1000);
        const currentSession = this.sessions.get(sessionId);
        if (currentSession?.qrCode) {
          qrCode = currentSession.qrCode;
          logger.info(`QR Code gerado após ${attempts + 1} segundos`);
          break;
        }
        attempts++;
        
        // Log a cada 10 segundos
        if (attempts % 10 === 0) {
          logger.info(`Ainda aguardando QR Code... (${attempts}s/${maxAttempts}s)`);
        }
      }

      if (!qrCode) {
        logger.error(`Timeout após ${maxAttempts} segundos. QR Code não foi gerado.`);
        throw new Error(`Timeout ao gerar QR Code após ${maxAttempts} segundos`);
      }

      return { sessionId, qrCode };
    } catch (error) {
      logger.error('Erro ao iniciar sessão:', error);
      throw error;
    }
  }

  /**
   * Envia mensagem com estratégias anti-banimento
   */
  async sendMessage(
    sessionId: string,
    phoneNumber: string,
    message: string,
    imageUrl?: string
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    
    if (!session || !session.socket) {
      throw new Error('Sessão não encontrada ou não conectada');
    }

    if (session.status !== 'connected') {
      throw new Error('Sessão não está conectada');
    }

    try {
      // Formatar número (adicionar @s.whatsapp.net)
      const jid = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;

      // Delay aleatório antes de enviar (1-3 segundos)
      const randomDelay = Math.floor(Math.random() * 2000) + 1000;
      await delay(randomDelay);

      if (imageUrl) {
        // Enviar imagem com legenda
        await session.socket.sendMessage(jid, {
          image: { url: imageUrl },
          caption: message
        });
      } else {
        // Enviar apenas texto
        await session.socket.sendMessage(jid, {
          text: message
        });
      }

      // Simular digitação humana (delay proporcional ao tamanho da mensagem)
      const typingDelay = Math.min(message.length * 50, 3000);
      await delay(typingDelay);

      logger.info(`Mensagem enviada para ${phoneNumber}`);
    } catch (error) {
      logger.error(`Erro ao enviar mensagem para ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * Envia broadcast com rate limiting e delays
   */
  async sendBroadcast(
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
  ): Promise<{ sent: number; failed: number; errors: string[] }> {
    const session = this.sessions.get(sessionId);
    
    if (!session || session.status !== 'connected') {
      throw new Error('Sessão não conectada');
    }

    const {
      delayMin = 3,      // 3 segundos mínimo
      delayMax = 8,      // 8 segundos máximo
      batchSize = 20,    // 20 mensagens por lote
      batchDelay = 5     // 5 minutos entre lotes
    } = settings || {};

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    // Processar em lotes
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      logger.info(`Processando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(recipients.length / batchSize)}`);

      for (const phoneNumber of batch) {
        try {
          await this.sendMessage(sessionId, phoneNumber, message, imageUrl);
          sent++;

          // Delay aleatório entre mensagens
          const randomDelay = Math.floor(Math.random() * (delayMax - delayMin + 1) + delayMin) * 1000;
          await delay(randomDelay);
        } catch (error: any) {
          failed++;
          errors.push(`${phoneNumber}: ${error.message}`);
          logger.error(`Falha ao enviar para ${phoneNumber}:`, error);
        }
      }

      // Delay entre lotes (exceto no último)
      if (i + batchSize < recipients.length) {
        logger.info(`Aguardando ${batchDelay} minutos antes do próximo lote...`);
        await delay(batchDelay * 60 * 1000);
      }
    }

    return { sent, failed, errors };
  }

  /**
   * Verifica status da sessão
   */
  getSessionStatus(sessionId: string): {
    exists: boolean;
    status?: string;
    phoneNumber?: string;
    expiresAt?: Date;
  } {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return { exists: false };
    }

    return {
      exists: true,
      status: session.status,
      phoneNumber: session.phoneNumber,
      expiresAt: session.expiresAt
    };
  }

  /**
   * Encerra uma sessão
   */
  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      try {
        if (session.socket) {
          await session.socket.logout();
        }
      } catch (error) {
        logger.error('Erro ao fazer logout:', error);
      }

      this.sessions.delete(sessionId);

      // Limpar diretório de autenticação
      const authDir = path.join(this.AUTH_DIR, sessionId);
      if (fs.existsSync(authDir)) {
        fs.rmSync(authDir, { recursive: true, force: true });
      }

      // Atualizar Firestore
      await admin.firestore()
        .collection('whatsapp_sessions')
        .doc(sessionId)
        .update({
          status: 'disconnected',
          disconnectedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
  }

  /**
   * Limpa sessões expiradas
   */
  private async cleanupExpiredSessions(): Promise<void> {
    const now = Date.now();
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt.getTime() < now) {
        logger.info(`Limpando sessão expirada: ${sessionId}`);
        await this.endSession(sessionId);
      }
    }
  }

  /**
   * Lista sessões ativas de um usuário
   */
  getUserSessions(userId: string): string[] {
    const userSessions: string[] = [];
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        userSessions.push(sessionId);
      }
    }
    
    return userSessions;
  }
}

export const whatsappService = new WhatsAppService();

