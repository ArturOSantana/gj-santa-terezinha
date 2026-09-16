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

const db = admin.firestore();

async function checkAndCleanTransactions() {
  const snapshot = await db.collection('transactions').get();
  console.log(`Total de transações encontradas: ${snapshot.size}`);

  if (snapshot.empty) {
    console.log('Nenhuma transação encontrada no banco Firestore.');
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    console.log(`Deletando transação ID: ${doc.id} - ${JSON.stringify(doc.data())}`);
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log('Todas as transações do banco Firestore foram excluídas com sucesso!');
}

checkAndCleanTransactions().catch((err) => {
  console.error('Erro ao limpar transações:', err);
  process.exit(1);
});
