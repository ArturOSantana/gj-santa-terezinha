/**
 * appendSheetEvent — Cloud Function (onCall)
 *
 * Adiciona uma nova linha na planilha do Google Sheets (aba "Eventos")
 * quando o admin cria um evento pelo painel da agenda.
 *
 * Autenticação: Service Account via GOOGLE_SERVICE_ACCOUNT_KEY (mesmo segredo
 * já usado para o Google Calendar em googleCalendar.ts).
 *
 * Permissões exigidas na planilha:
 *   Compartilhe a planilha com o e-mail da service account como "Editor".
 *
 * Variáveis de ambiente (functions/.env ou firebase functions:config):
 *   GOOGLE_SERVICE_ACCOUNT_KEY  — JSON completo da service account (string)
 *   VITE_SHEETS_ID              — ID da planilha (mesmo do frontend)
 *   ou
 *   SHEETS_ID                   — alias sem prefixo VITE_ para o lado do servidor
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { google } from 'googleapis';

// ─── Auth da Service Account ──────────────────────────────────────────────────

function getAuth() {
  const raw =
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
    functions.config().google?.service_account_key;

  if (!raw) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Credenciais da service account não configuradas. ' +
      'Defina GOOGLE_SERVICE_ACCOUNT_KEY nas variáveis de ambiente das Functions.'
    );
  }

  let credentials: Record<string, string>;
  try {
    credentials = JSON.parse(raw);
  } catch {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'GOOGLE_SERVICE_ACCOUNT_KEY não é um JSON válido.'
    );
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Obtém o ID da planilha das variáveis de ambiente (aceita com ou sem prefixo VITE_). */
function getSheetsId(): string {
  const id =
    process.env.SHEETS_ID ||
    process.env.VITE_SHEETS_ID ||
    functions.config().google?.sheets_id;
  if (!id) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'ID da planilha não configurado. Defina SHEETS_ID nas variáveis de ambiente das Functions.'
    );
  }
  return id;
}

// ─── Validação do payload ─────────────────────────────────────────────────────

interface EventPayload {
  title: string;
  category: string;
  date: string;
  time?: string;
  timeEnd?: string;
  place?: string;
  desc?: string;
  artUrl?: string;
  visible?: boolean;
}

function validate(data: unknown): EventPayload {
  const d = data as Record<string, unknown>;
  if (!d || typeof d.title !== 'string' || !d.title.trim()) {
    throw new functions.https.HttpsError('invalid-argument', 'Campo "title" obrigatório.');
  }
  if (!d || typeof d.date !== 'string' || !d.date.trim()) {
    throw new functions.https.HttpsError('invalid-argument', 'Campo "date" obrigatório (YYYY-MM-DD).');
  }
  return {
    title:    (d.title    as string).trim().slice(0, 100),
    category: (d.category as string | undefined)?.trim() || 'outros',
    date:     (d.date     as string).trim(),
    time:     (d.time     as string | undefined)?.trim() || '',
    timeEnd:  (d.timeEnd  as string | undefined)?.trim() || '',
    place:    (d.place    as string | undefined)?.trim().slice(0, 80) || '',
    desc:     (d.desc     as string | undefined)?.trim().slice(0, 800) || '',
    artUrl:   (d.artUrl   as string | undefined)?.trim() || '',
    visible:  d.visible !== false,
  };
}

// ─── Cloud Function ───────────────────────────────────────────────────────────

export const appendSheetEvent = functions.https.onCall(async (data: unknown, context: functions.https.CallableContext) => {
  // 1. Autenticação Firebase obrigatória
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login necessário.');
  }

  // 2. Verificar role: admin ou coordinator
  const userSnap = await admin.firestore()
    .collection('users')
    .doc(context.auth.uid)
    .get();
  const role = userSnap.data()?.role as string | undefined;
  if (role !== 'admin' && role !== 'coordinator') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Apenas admin ou coordenador podem adicionar eventos à planilha.'
    );
  }

  // 3. Validar payload
  const ev = validate(data);

  // 4. Autenticar via Service Account e anexar linha
  const auth  = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = getSheetsId();

  // Monta a linha na ordem das colunas A→I da aba "Eventos"
  // A: título  B: categoria  C: data  D: hora início  E: hora fim
  // F: local   G: descrição  H: url_arte  I: visível
  const row = [
    ev.title,
    ev.category,
    ev.date,
    ev.time,
    ev.timeEnd,
    ev.place,
    ev.desc,
    ev.artUrl,
    ev.visible ? 'Sim' : 'Não',
  ];

  const appendRes = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Eventos!A:I',
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });

  // Extrai o número da linha gravada do range retornado (ex: "Eventos!A12:I12" → 12)
  const updatedRange = appendRes.data.updates?.updatedRange ?? '';
  const rowMatch = updatedRange.match(/:([A-Z]+)(\d+)$/);
  const rowIndex = rowMatch ? parseInt(rowMatch[2], 10) : null;

  return { success: true, rowIndex };
});

// ─── deleteSheetEvent ─────────────────────────────────────────────────────────

export const deleteSheetEvent = functions.https.onCall(async (data: unknown, context: functions.https.CallableContext) => {
  // 1. Autenticação
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login necessário.');
  }

  // 2. Verificar role
  const userSnap = await admin.firestore()
    .collection('users')
    .doc(context.auth.uid)
    .get();
  const role = userSnap.data()?.role as string | undefined;
  if (role !== 'admin' && role !== 'coordinator') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Apenas admin ou coordenador podem remover eventos da planilha.'
    );
  }

  // 3. Validar payload: precisa do rowIndex (número da linha, 1-based)
  const d = data as Record<string, unknown>;
  const rowIndex = typeof d?.rowIndex === 'number' ? d.rowIndex : null;
  if (!rowIndex || rowIndex < 2) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'rowIndex inválido ou não informado.'
    );
  }

  // 4. Obter o spreadsheetId da planilha
  const spreadsheetId = getSheetsId();

  // 5. Precisamos do sheetId numérico da aba "Eventos" para deletar via batchUpdate
  const authClient = getAuth();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  const metaRes = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = metaRes.data.sheets?.find(
    (s) => s.properties?.title === 'Eventos'
  );
  if (!sheet?.properties?.sheetId == null) {
    throw new functions.https.HttpsError(
      'not-found',
      'Aba "Eventos" não encontrada na planilha.'
    );
  }
  const sheetId = sheet!.properties!.sheetId as number;

  // 6. Deletar a linha via batchUpdate (DeleteDimensionRequest)
  // startIndex é 0-based, endIndex é exclusivo → linha rowIndex (1-based) = startIndex rowIndex-1
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex - 1,
            endIndex: rowIndex,
          },
        },
      }],
    },
  });

  return { success: true };
});
