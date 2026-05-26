import * as functions from 'firebase-functions';
import { google } from 'googleapis';

const parseServiceAccountCredentials = () => {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || functions.config().google?.service_account_key;
  if (!raw) return null;

  try {
    const credentials = JSON.parse(raw);
    if (!credentials.client_email || !credentials.private_key) {
      return null;
    }
    return credentials;
  } catch (error) {
    console.error('Erro ao fazer parse da service account:', error);
    return null;
  }
};

const getGoogleAuth = () => {
  const credentials = parseServiceAccountCredentials();
  if (!credentials) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Credenciais da service account não configuradas'
    );
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
};

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || functions.config().google?.calendar_id;
const GOOGLE_API_KEY = process.env.GOOGLE_CALENDAR_API_KEY || functions.config().google?.calendar_api_key;

// GET - Listar eventos (público, usa API Key)
export const getCalendarEvents = functions.https.onRequest(async (req, res) => {
  // CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  if (!CALENDAR_ID) {
    res.status(500).json({ error: 'Calendar ID não configurado' });
    return;
  }

  if (!GOOGLE_API_KEY) {
    res.status(500).json({
      error: 'Google Calendar API Key não configurada',
      details: 'Defina GOOGLE_CALENDAR_API_KEY nas variáveis de ambiente',
    });
    return;
  }

  try {
    const { timeMin, timeMax } = req.query;

    const calendar = google.calendar({ version: 'v3', auth: GOOGLE_API_KEY });
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: (timeMin as string) || new Date().toISOString(),
      timeMax: (timeMax as string) || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    res.status(500).json({
      error: 'Erro ao processar requisição',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
});

// POST - Criar evento (autenticado, usa Service Account)
export const createCalendarEvent = functions.https.onCall(async (data, context) => {
  // Verificar autenticação
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Usuário não autenticado'
    );
  }

  if (!CALENDAR_ID) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Calendar ID não configurado'
    );
  }

  try {
    const auth = getGoogleAuth();
    const calendar = google.calendar({ version: 'v3', auth });

    const result = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: data.event,
    });

    return { success: true, event: result.data };
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Erro ao criar evento',
      error instanceof Error ? error.message : 'Erro desconhecido'
    );
  }
});

// PUT - Atualizar evento (autenticado, usa Service Account)
export const updateCalendarEvent = functions.https.onCall(async (data, context) => {
  // Verificar autenticação
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Usuário não autenticado'
    );
  }

  const { eventId, event } = data;

  if (!eventId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Event ID é obrigatório'
    );
  }

  if (!CALENDAR_ID) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Calendar ID não configurado'
    );
  }

  try {
    const auth = getGoogleAuth();
    const calendar = google.calendar({ version: 'v3', auth });

    const result = await calendar.events.update({
      calendarId: CALENDAR_ID,
      eventId: eventId,
      requestBody: event,
    });

    return { success: true, event: result.data };
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Erro ao atualizar evento',
      error instanceof Error ? error.message : 'Erro desconhecido'
    );
  }
});

// DELETE - Deletar evento (autenticado, usa Service Account)
export const deleteCalendarEvent = functions.https.onCall(async (data, context) => {
  // Verificar autenticação
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Usuário não autenticado'
    );
  }

  const { eventId } = data;

  if (!eventId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Event ID é obrigatório'
    );
  }

  if (!CALENDAR_ID) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Calendar ID não configurado'
    );
  }

  try {
    const auth = getGoogleAuth();
    const calendar = google.calendar({ version: 'v3', auth });

    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId: eventId,
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Erro ao deletar evento',
      error instanceof Error ? error.message : 'Erro desconhecido'
    );
  }
});

