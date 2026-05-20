import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const parseServiceAccountCredentials = () => {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
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
    throw new Error('Credenciais da service account não configuradas');
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
};

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || process.env.VITE_GOOGLE_CALENDAR_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_CALENDAR_API_KEY || process.env.VITE_GOOGLE_CALENDAR_API_KEY;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!CALENDAR_ID) {
    return res.status(500).json({ error: 'Calendar ID não configurado' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const { timeMin, timeMax } = req.query;

        if (!GOOGLE_API_KEY) {
          return res.status(500).json({
            error: 'Google Calendar API Key não configurada',
            details: 'Defina GOOGLE_CALENDAR_API_KEY ou VITE_GOOGLE_CALENDAR_API_KEY',
          });
        }

        const calendar = google.calendar({ version: 'v3', auth: GOOGLE_API_KEY });
        const response = await calendar.events.list({
          calendarId: CALENDAR_ID,
          timeMin: (timeMin as string) || new Date().toISOString(),
          timeMax: (timeMax as string) || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
        });

        return res.status(200).json(response.data);
      }

      case 'POST':
      case 'PUT':
      case 'DELETE': {
        const auth = getGoogleAuth();
        const calendar = google.calendar({ version: 'v3', auth });

        if (req.method === 'POST') {
          const createResult = await calendar.events.insert({
            calendarId: CALENDAR_ID,
            requestBody: req.body,
          });

          return res.status(201).json(createResult.data);
        }

        if (req.method === 'PUT') {
          const { eventId } = req.query;
          if (!eventId) {
            return res.status(400).json({ error: 'Event ID é obrigatório' });
          }

          const updateResult = await calendar.events.update({
            calendarId: CALENDAR_ID,
            eventId: eventId as string,
            requestBody: req.body,
          });

          return res.status(200).json(updateResult.data);
        }

        const { eventId: deleteEventId } = req.query;
        if (!deleteEventId) {
          return res.status(400).json({ error: 'Event ID é obrigatório' });
        }

        await calendar.events.delete({
          calendarId: CALENDAR_ID,
          eventId: deleteEventId as string,
        });

        return res.status(204).end();
      }

      default:
        return res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API do Google Calendar:', error);
    return res.status(500).json({
      error: 'Erro ao processar requisição',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}

