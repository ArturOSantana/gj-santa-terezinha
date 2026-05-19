import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Verificar se as variáveis de ambiente estão configuradas
const hasFirebaseConfig =
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

// Avisar no console se estiver usando configuração demo
if (!hasFirebaseConfig) {
  console.warn(
    '⚠️ FIREBASE NÃO CONFIGURADO!\n' +
    'Usando configuração demo. Para usar Firebase:\n' +
    '1. Copie .env.example para .env\n' +
    '2. Configure suas credenciais do Firebase\n' +
    '3. Reinicie o servidor de desenvolvimento'
  );
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);

// Exportar flag de configuração
export const isFirebaseConfigured = hasFirebaseConfig;

// Exportar app para uso em outros serviços se necessário
export default app;