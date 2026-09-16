import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const serviceAccount = JSON.parse(readFileSync(resolve(__dirname, 'serviceAccountKey.json'), 'utf8'));
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db   = admin.firestore();
const auth = admin.auth();

const EMAIL = 'artursantana123@gmail.com';

async function run() {
  const user = await auth.getUserByEmail(EMAIL);
  console.log('Auth UID:', user.uid);
  console.log('Auth email:', user.email);

  const snap = await db.collection('users').doc(user.uid).get();
  if (!snap.exists) {
    console.log('❌ Documento Firestore NÃO existe para esse UID');
  } else {
    console.log('✅ Documento Firestore encontrado:');
    console.log(JSON.stringify(snap.data(), null, 2));
  }
}

run().catch(err => { console.error(err); process.exit(1); });
