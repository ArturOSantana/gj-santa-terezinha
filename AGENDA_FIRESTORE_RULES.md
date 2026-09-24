// ─────────────────────────────────────────────────────────────────────────────
// Regras Firestore para as coleções da Agenda dos Jovens
//
// Instruções:
//   1. Acesse o Firebase Console → Firestore → Regras
//   2. Adicione as regras abaixo às suas regras existentes (dentro do match /databases/{db}/documents)
//
// Ou copie para o arquivo firestore.rules local e faça deploy com:
//   firebase deploy --only firestore:rules
//
// Lógica de acesso:
//   - Qualquer pessoa (sem login) pode LER agenda_events, agenda_notices, agenda_birthdays
//   - Apenas usuários autenticados com custom claim role='admin' ou role='coordinator'
//     podem ESCREVER (criar, atualizar, apagar) nessas coleções
// ─────────────────────────────────────────────────────────────────────────────

// Adicione dentro de: match /databases/{database}/documents {

    // ── Agenda: Eventos ─────────────────────────────────────────────────────
    match /agenda_events/{docId} {
      allow read: if true;
      allow write: if request.auth != null
        && (request.auth.token.role == 'admin'
            || request.auth.token.role == 'coordinator');
    }

    // ── Agenda: Avisos ──────────────────────────────────────────────────────
    match /agenda_notices/{docId} {
      allow read: if true;
      allow write: if request.auth != null
        && (request.auth.token.role == 'admin'
            || request.auth.token.role == 'coordinator');
    }

    // ── Agenda: Aniversariantes ─────────────────────────────────────────────
    match /agenda_birthdays/{docId} {
      allow read: if true;
      allow write: if request.auth != null
        && (request.auth.token.role == 'admin'
            || request.auth.token.role == 'coordinator');
    }

    // ── Agenda: Arte dos eventos (Firebase Storage) ─────────────────────────
    // Adicione no Firebase Storage → Regras:
    //
    // match /agenda_art/{filename} {
    //   allow read: if true;
    //   allow write: if request.auth != null
    //     && (request.auth.token.role == 'admin'
    //         || request.auth.token.role == 'coordinator');
    // }

// Fim das regras da Agenda


// ─────────────────────────────────────────────────────────────────────────────
// Como atribuir o custom claim 'role' a um usuário:
//
// No Firebase Admin SDK (Node.js / Cloud Function):
//
//   const admin = require('firebase-admin');
//   await admin.auth().setCustomUserClaims(uid, { role: 'admin' });
//
// O usuário precisa fazer logout e login novamente para que o claim entre em vigor.
// ─────────────────────────────────────────────────────────────────────────────
