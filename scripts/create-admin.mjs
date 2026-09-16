/**
 * Script de provisionamento de usuário admin — GJ Santa Terezinha
 *
 * USO:
 *   node scripts/create-admin.mjs
 *
 * PRÉ-REQUISITOS:
 *   1. Instale as dependências do script:
 *      npm install --save-dev firebase-admin
 *
 *   2. Baixe a chave de Service Account no Firebase Console:
 *      Project Settings → Service Accounts → Generate new private key
 *      Salve como: scripts/serviceAccountKey.json  (nunca suba para o git!)
 *
 *   3. Defina a senha no ambiente (não coloque aqui!):
 *      ADMIN_PASSWORD=SuaSenhaForte node scripts/create-admin.mjs
 *
 * SEGURANÇA:
 *   - O arquivo serviceAccountKey.json está no .gitignore.
 *   - A senha NUNCA é hardcodada aqui — vem pela variável de ambiente ADMIN_PASSWORD.
 *   - Execute este script apenas localmente, nunca em CI/CD com segredos expostos.
 */

import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Validações de entrada ────────────────────────────────────────────────────

const ADMIN_EMAIL = 'artursantana123@gmail.com';
const ADMIN_NAME  = 'Artur Santana';

const password = process.env.ADMIN_PASSWORD;
if (!password) {
  console.error('\n❌  Variável de ambiente ADMIN_PASSWORD não definida.');
  console.error('    Execute assim:');
  console.error('    ADMIN_PASSWORD="SuaSenhaForte!" node scripts/create-admin.mjs\n');
  process.exit(1);
}

if (password.length < 8) {
  console.error('\n❌  A senha deve ter pelo menos 8 caracteres.\n');
  process.exit(1);
}

// ── Inicializa o Firebase Admin ──────────────────────────────────────────────

const serviceAccountPath = resolve(__dirname, 'serviceAccountKey.json');

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch {
  console.error('\n❌  Arquivo scripts/serviceAccountKey.json não encontrado.');
  console.error('    Baixe em: Firebase Console → Project Settings → Service Accounts\n');
  process.exit(1);
}

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const auth = admin.auth();
const db   = admin.firestore();

// ── Criação do usuário ───────────────────────────────────────────────────────

async function run() {
  console.log(`\n🔧  Provisionando admin: ${ADMIN_EMAIL}`);

  let uid;

  // Tenta criar — se já existir, usa o UID existente
  try {
    const userRecord = await auth.createUser({
      email:         ADMIN_EMAIL,
      password:      password,
      displayName:   ADMIN_NAME,
      emailVerified: true,
    });
    uid = userRecord.uid;
    console.log(`✅  Usuário criado no Firebase Auth (uid: ${uid})`);
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      const existing = await auth.getUserByEmail(ADMIN_EMAIL);
      uid = existing.uid;
      console.log(`ℹ️   Usuário já existe no Auth (uid: ${uid}) — atualizando senha e documento Firestore.`);
      await auth.updateUser(uid, { password, displayName: ADMIN_NAME, emailVerified: true });
    } else {
      throw err;
    }
  }

  // Grava / atualiza o documento em users/{uid}
  const now = admin.firestore.FieldValue.serverTimestamp();
  await db.collection('users').doc(uid).set(
    {
      id:        uid,
      name:      ADMIN_NAME,
      email:     ADMIN_EMAIL,
      role:      'admin',
      personId:  null,
      createdAt: now,
      updatedAt: now,
      lastLogin: null,
    },
    { merge: true }
  );

  console.log(`✅  Documento users/${uid} gravado com role: admin`);
  console.log('\n🎉  Pronto! Faça login no painel com:');
  console.log(`    E-mail : ${ADMIN_EMAIL}`);
  console.log(`    Senha  : (a que você definiu em ADMIN_PASSWORD)\n`);
}

run().catch(err => {
  console.error('\n❌  Erro ao provisionar admin:', err.message ?? err);
  process.exit(1);
});
