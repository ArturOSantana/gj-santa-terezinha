import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Validar variáveis obrigatórias
const requiredEnvVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Verificar se alguma variável está faltando
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Configuração do Firebase incompleta. Variáveis faltando: ${missingVars.join(', ')}. ` +
    `Consulte FIREBASE_SETUP.md para instruções de configuração.`
  );
}

export const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey,
  authDomain: requiredEnvVars.authDomain,
  projectId: requiredEnvVars.projectId,
  storageBucket: requiredEnvVars.storageBucket,
  messagingSenderId: requiredEnvVars.messagingSenderId,
  appId: requiredEnvVars.appId
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

// Conectar aos Firebase Emulators em desenvolvimento
// Emuladores desabilitados — conectando direto ao Firebase em nuvem
// Para reativar, descomente o bloco abaixo e rode: firebase emulators:start
// if (import.meta.env.DEV) {
//   connectFunctionsEmulator(functions, '127.0.0.1', 5001);
//   connectFirestoreEmulator(db, '127.0.0.1', 8080);
//   console.log('🔧 Usando Firebase Emulators:');
//   console.log('   - Functions: http://127.0.0.1:5001');
//   console.log('   - Firestore: http://127.0.0.1:8080');
//   console.log('   - UI: http://127.0.0.1:4000');
// }

export default app;