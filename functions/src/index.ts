/**
 * Firebase Functions para GJ Santa Terezinha
 * Sistema Boa Nova - Envio de Mensagens
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {
  initializeEmailService,
  sendBroadcastEmails,
  verifyEmailService,
} from './boanova/email.service';
import { whatsappService } from './boanova/whatsapp.service';

// Importar Google Calendar Functions
export {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from './googleCalendar';

// Importar Agenda Functions
export { appendSheetEvent, deleteSheetEvent } from './agenda/appendSheetEvent';

// Inicializar Firebase Admin
admin.initializeApp();

// Inicializar serviço de e-mail com credenciais do ambiente
const gmailUser = functions.config().gmail?.user || process.env.GMAIL_USER;
const gmailPassword = functions.config().gmail?.password || process.env.GMAIL_APP_PASSWORD;

if (gmailUser && gmailPassword) {
  initializeEmailService({
    user: gmailUser,
    pass: gmailPassword,
  });
} else {
  console.warn('⚠️ Credenciais do Gmail não configuradas. Configure com:');
  console.warn('firebase functions:config:set gmail.user="seu-email" gmail.password="sua-senha-app"');
}

/**
 * Function: Enviar Broadcast por E-mail
 * Chamada pelo frontend para enviar mensagens em massa
 */
export const sendEmailBroadcast = functions.https.onCall(async (data, context) => {
  // Validar autenticação
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Usuário não autenticado'
    );
  }

  // Validar permissões (apenas coordenadores e admins)
  const userDoc = await admin.firestore()
    .collection('users')
    .doc(context.auth.uid)
    .get();

  const userRole = userDoc.data()?.role;
  if (userRole !== 'admin' && userRole !== 'coordinator') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Apenas coordenadores e administradores podem enviar broadcasts'
    );
  }

  // Validar dados
  const { recipients, subject, message, imageUrl } = data;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Lista de destinatários inválida'
    );
  }

  if (!subject || typeof subject !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Assunto inválido'
    );
  }

  if (!message || typeof message !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Mensagem inválida'
    );
  }

  try {
    // Criar documento de broadcast no Firestore
    const broadcastRef = await admin.firestore().collection('boa_nova_broadcasts').add({
      userId: context.auth.uid,
      channel: 'email',
      status: 'sending',
      subject,
      message: {
        text: message,
        imageUrl: imageUrl || null,
      },
      recipients: {
        total: recipients.length,
        sent: 0,
        failed: 0,
        pending: recipients.length,
      },
      email: {
        sent: 0,
        failed: 0,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Enviar e-mails
    const result = await sendBroadcastEmails(recipients, subject, message, imageUrl);

    // Atualizar documento com resultados
    await broadcastRef.update({
      status: 'completed',
      recipients: {
        total: recipients.length,
        sent: result.sent,
        failed: result.failed,
        pending: 0,
      },
      email: {
        sent: result.sent,
        failed: result.failed,
      },
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Registrar logs
    if (result.errors.length > 0) {
      await broadcastRef.collection('logs').add({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        level: 'error',
        message: `Falhas no envio: ${result.failed}`,
        metadata: { errors: result.errors },
      });
    }

    return {
      success: true,
      broadcastId: broadcastRef.id,
      sent: result.sent,
      failed: result.failed,
    };

  } catch (error: any) {
    console.error('❌ Erro ao enviar broadcast:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Erro interno ao enviar e-mails. Tente novamente mais tarde.'
    );
  }
});

/**
 * Function: Verificar Serviço de E-mail
 * Testa se o serviço de e-mail está configurado corretamente
 */
export const verifyEmail = functions.https.onCall(async (data, context) => {
  // Validar autenticação
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Usuário não autenticado'
    );
  }

  // Validar permissões
  const userDoc = await admin.firestore()
    .collection('users')
    .doc(context.auth.uid)
    .get();

  const userRole = userDoc.data()?.role;
  if (userRole !== 'admin' && userRole !== 'coordinator') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Apenas coordenadores e administradores podem verificar o serviço'
    );
  }

  try {
    const isWorking = await verifyEmailService();
    return {
      success: isWorking,
      message: isWorking
        ? 'Serviço de e-mail funcionando corretamente'
        : 'Erro ao verificar serviço de e-mail',
    };
  } catch (error: any) {
    console.error('❌ Erro ao verificar serviço de e-mail:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Erro interno ao verificar serviço de e-mail.'
    );
  }
});

/**
 * Scheduled Function: Limpeza de Broadcasts Antigos
 * Executa diariamente para remover broadcasts com mais de 7 dias
 */
export const cleanupOldBroadcasts = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const cutoffDate = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 dias atrás
    );

    const oldBroadcasts = await admin.firestore()
      .collection('boa_nova_broadcasts')
      .where('status', '==', 'completed')
      .where('completedAt', '<=', cutoffDate)
      .get();

    const batch = admin.firestore().batch();
    let count = 0;

    for (const doc of oldBroadcasts.docs) {
      // Deletar subcoleções
      const contactsSnapshot = await doc.ref.collection('contacts').get();
      contactsSnapshot.docs.forEach(contactDoc => batch.delete(contactDoc.ref));

      const logsSnapshot = await doc.ref.collection('logs').get();
      logsSnapshot.docs.forEach(logDoc => batch.delete(logDoc.ref));

      // Deletar documento principal
      batch.delete(doc.ref);
      count++;
    }

    await batch.commit();

    console.log(`🧹 Limpeza concluída: ${count} broadcasts removidos`);
    return null;
  });

/**
 * ============================================================================
 * WHATSAPP FUNCTIONS
 * ============================================================================
 */

/**
 * Function: Iniciar Sessão WhatsApp
 * Gera QR Code para conexão
 */
export const startWhatsAppSession = functions
  .runWith({
    timeoutSeconds: 540, // 9 minutos (máximo permitido)
    memory: '1GB' // Mais memória para Baileys
  })
  .https.onCall(async (data, context) => {
  // Validar autenticação
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Usuário não autenticado'
    );
  }

  // Validar permissões
  const userDoc = await admin.firestore()
    .collection('users')
    .doc(context.auth.uid)
    .get();

  const userRole = userDoc.data()?.role;
  if (userRole !== 'admin' && userRole !== 'coordinator') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Apenas coordenadores e administradores podem iniciar sessões'
    );
  }

  try {
    const { sessionId, qrCode } = await whatsappService.startSession(context.auth.uid);
    
    return {
      success: true,
      sessionId,
      qrCode
    };
  } catch (error: any) {
    console.error('❌ Erro ao iniciar sessão WhatsApp:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Erro interno ao iniciar sessão WhatsApp. Tente novamente mais tarde.'
    );
  }
});

/**
 * Function: Verificar Status da Sessão
 */
export const checkWhatsAppSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  const { sessionId } = data;
  if (!sessionId) {
    throw new functions.https.HttpsError('invalid-argument', 'sessionId é obrigatório');
  }

  try {
    const status = whatsappService.getSessionStatus(sessionId);
    return status;
  } catch (error: any) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Function: Encerrar Sessão WhatsApp
 */
export const endWhatsAppSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  const { sessionId } = data;
  if (!sessionId) {
    throw new functions.https.HttpsError('invalid-argument', 'sessionId é obrigatório');
  }

  try {
    await whatsappService.endSession(sessionId);
    return { success: true };
  } catch (error: any) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Function: Enviar Broadcast por WhatsApp
 */
export const sendWhatsAppBroadcast = functions.https.onCall(async (data, context) => {
  // Validar autenticação
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  // Validar permissões
  const userDoc = await admin.firestore()
    .collection('users')
    .doc(context.auth.uid)
    .get();

  const userRole = userDoc.data()?.role;
  if (userRole !== 'admin' && userRole !== 'coordinator') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Apenas coordenadores e administradores podem enviar broadcasts'
    );
  }

  // Validar dados
  const { sessionId, recipients, message, imageUrl, settings } = data;

  if (!sessionId) {
    throw new functions.https.HttpsError('invalid-argument', 'sessionId é obrigatório');
  }

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Lista de destinatários inválida');
  }

  if (!message || typeof message !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Mensagem inválida');
  }

  try {
    // Criar documento de broadcast
    const broadcastRef = await admin.firestore().collection('boa_nova_broadcasts').add({
      userId: context.auth.uid,
      channel: 'whatsapp',
      status: 'sending',
      message: {
        text: message,
        imageUrl: imageUrl || null,
      },
      recipients: {
        total: recipients.length,
        sent: 0,
        failed: 0,
        pending: recipients.length,
      },
      whatsapp: {
        sent: 0,
        failed: 0,
        sessionId,
      },
      settings: settings || {
        delayMin: 3,
        delayMax: 8,
        batchSize: 20,
        batchDelay: 5,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Enviar mensagens
    const result = await whatsappService.sendBroadcast(
      sessionId,
      recipients,
      message,
      imageUrl,
      settings
    );

    // Atualizar documento com resultados
    await broadcastRef.update({
      status: result.failed > 0 ? 'completed' : 'completed',
      recipients: {
        total: recipients.length,
        sent: result.sent,
        failed: result.failed,
        pending: 0,
      },
      whatsapp: {
        sent: result.sent,
        failed: result.failed,
        sessionId,
      },
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Registrar erros se houver
    if (result.errors.length > 0) {
      await broadcastRef.collection('logs').add({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        level: 'error',
        message: `Falhas no envio: ${result.failed}`,
        metadata: { errors: result.errors },
      });
    }

    return {
      success: true,
      broadcastId: broadcastRef.id,
      sent: result.sent,
      failed: result.failed,
    };

  } catch (error: any) {
    console.error('❌ Erro ao enviar broadcast WhatsApp:', error);
    throw new functions.https.HttpsError('internal', 'Erro interno ao enviar mensagens. Tente novamente mais tarde.');
  }
});

/**
 * Scheduled Function: Limpar Sessões Expiradas
 * Executa a cada hora
 */
export const cleanupExpiredWhatsAppSessions = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const cutoffDate = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 30 * 60 * 1000) // 30 minutos atrás
    );

    const expiredSessions = await admin.firestore()
      .collection('whatsapp_sessions')
      .where('status', 'in', ['qr_pending', 'connected'])
      .where('expiresAt', '<=', cutoffDate)
      .get();

    const batch = admin.firestore().batch();
    let count = 0;

    for (const doc of expiredSessions.docs) {
      const sessionId = doc.id;
      
      // Encerrar sessão no serviço
      try {
        await whatsappService.endSession(sessionId);
      } catch (error) {
        console.error(`Erro ao encerrar sessão ${sessionId}:`, error);
      }

      // Atualizar status no Firestore
      batch.update(doc.ref, {
        status: 'disconnected',
        disconnectedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      count++;
    }

    await batch.commit();

    console.log(`🧹 Limpeza de sessões WhatsApp: ${count} sessões encerradas`);
    return null;

  });
