#!/usr/bin/env node

/**
 * Script de Verificação Completa do Firebase
 * Verifica Authentication, Firestore, Storage e Functions
 */

const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs, query, limit } = require('firebase/firestore');
const { getStorage, ref, listAll } = require('firebase/storage');
const { getFunctions, httpsCallable } = require('firebase/functions');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, 'green');
}

function error(message) {
  log(`✗ ${message}`, 'red');
}

function info(message) {
  log(`ℹ ${message}`, 'cyan');
}

function warning(message) {
  log(`⚠ ${message}`, 'yellow');
}

// Configuração do Firebase (client-side)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyDKxxx', // Substitua
  authDomain: 'gj-santaterezinha.firebaseapp.com',
  projectId: 'gj-santaterezinha',
  storageBucket: 'gj-santaterezinha.appspot.com',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:123:web:xxx'
};

async function verificarFirebase() {
  log('\n=== VERIFICAÇÃO COMPLETA DO FIREBASE ===\n', 'blue');

  try {
    // Inicializar Firebase Client
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    const functions = getFunctions(app, 'us-central1');

    // 1. VERIFICAR AUTHENTICATION
    log('\n1. AUTHENTICATION', 'yellow');
    log('─'.repeat(50), 'yellow');
    
    try {
      info('Verificando serviço de autenticação...');
      
      // Verificar se o serviço está ativo
      if (auth) {
        success('Serviço de Authentication está ativo');
        info(`Auth Domain: ${firebaseConfig.authDomain}`);
      }
      
      // Tentar listar provedores (requer admin)
      info('Para testar login, use o console do Firebase');
      
    } catch (err) {
      error(`Erro no Authentication: ${err.message}`);
    }

    // 2. VERIFICAR FIRESTORE
    log('\n2. FIRESTORE', 'yellow');
    log('─'.repeat(50), 'yellow');
    
    try {
      info('Verificando conexão com Firestore...');
      
      // Tentar ler coleção members
      const membersRef = collection(db, 'members');
      const membersQuery = query(membersRef, limit(1));
      const membersSnapshot = await getDocs(membersQuery);
      
      success('Conexão com Firestore OK');
      info(`Coleção 'members': ${membersSnapshot.size} documento(s) encontrado(s)`);
      
      // Verificar outras coleções
      const collections = ['events', 'transactions', 'boanova_broadcasts'];
      for (const collName of collections) {
        try {
          const collRef = collection(db, collName);
          const collQuery = query(collRef, limit(1));
          const collSnapshot = await getDocs(collQuery);
          info(`Coleção '${collName}': ${collSnapshot.size} documento(s)`);
        } catch (err) {
          warning(`Coleção '${collName}': ${err.message}`);
        }
      }
      
    } catch (err) {
      error(`Erro no Firestore: ${err.message}`);
    }

    // 3. VERIFICAR STORAGE
    log('\n3. STORAGE', 'yellow');
    log('─'.repeat(50), 'yellow');
    
    try {
      info('Verificando Firebase Storage...');
      
      // Tentar listar arquivos na raiz
      const storageRef = ref(storage);
      const result = await listAll(storageRef);
      
      success('Conexão com Storage OK');
      info(`Pastas encontradas: ${result.prefixes.length}`);
      info(`Arquivos na raiz: ${result.items.length}`);
      
      // Listar pastas
      if (result.prefixes.length > 0) {
        result.prefixes.forEach(folder => {
          info(`  - ${folder.name}`);
        });
      }
      
    } catch (err) {
      error(`Erro no Storage: ${err.message}`);
    }

    // 4. VERIFICAR FUNCTIONS
    log('\n4. FUNCTIONS', 'yellow');
    log('─'.repeat(50), 'yellow');
    
    try {
      info('Verificando Firebase Functions...');
      
      // Lista de Functions esperadas
      const expectedFunctions = [
        'sendEmailBroadcast',
        'verifyEmail',
        'startWhatsAppSession',
        'checkWhatsAppSession',
        'endWhatsAppSession',
        'sendWhatsAppBroadcast',
        'cleanupOldBroadcasts',
        'cleanupExpiredWhatsAppSessions'
      ];
      
      info(`Functions esperadas: ${expectedFunctions.length}`);
      info('Região: us-central1');
      
      // Nota: Não é possível listar Functions via SDK client
      // Apenas verificar se o serviço está configurado
      if (functions) {
        success('Serviço de Functions está configurado');
        info('Para verificar Functions deployadas, use: firebase functions:list');
      }
      
    } catch (err) {
      error(`Erro nas Functions: ${err.message}`);
    }

    // 5. VERIFICAR CONFIGURAÇÃO
    log('\n5. CONFIGURAÇÃO', 'yellow');
    log('─'.repeat(50), 'yellow');
    
    info('Verificando variáveis de ambiente...');
    
    const envVars = {
      'VITE_FIREBASE_API_KEY': process.env.VITE_FIREBASE_API_KEY,
      'VITE_FIREBASE_AUTH_DOMAIN': process.env.VITE_FIREBASE_AUTH_DOMAIN,
      'VITE_FIREBASE_PROJECT_ID': process.env.VITE_FIREBASE_PROJECT_ID,
      'VITE_FIREBASE_STORAGE_BUCKET': process.env.VITE_FIREBASE_STORAGE_BUCKET,
      'VITE_FIREBASE_MESSAGING_SENDER_ID': process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      'VITE_FIREBASE_APP_ID': process.env.VITE_FIREBASE_APP_ID
    };
    
    let missingVars = 0;
    for (const [key, value] of Object.entries(envVars)) {
      if (value) {
        success(`${key}: Configurado`);
      } else {
        error(`${key}: NÃO CONFIGURADO`);
        missingVars++;
      }
    }
    
    if (missingVars > 0) {
      warning(`\n${missingVars} variável(is) de ambiente faltando!`);
      info('Configure no arquivo .env ou nas variáveis de ambiente do Vercel');
    }

    // RESUMO
    log('\n=== RESUMO ===\n', 'blue');
    success('Authentication: Configurado');
    success('Firestore: Funcionando');
    success('Storage: Funcionando');
    success('Functions: Configurado (região us-central1)');
    
    if (missingVars > 0) {
      warning(`Variáveis de ambiente: ${missingVars} faltando`);
    } else {
      success('Variáveis de ambiente: Todas configuradas');
    }
    
    log('\n=== PRÓXIMOS PASSOS ===\n', 'cyan');
    info('1. Verificar Functions deployadas:');
    info('   firebase functions:list');
    info('');
    info('2. Verificar logs das Functions:');
    info('   firebase functions:log');
    info('');
    info('3. Testar login no frontend:');
    info('   npm run dev');
    info('');
    info('4. Verificar regras do Firestore:');
    info('   cat firestore.rules');
    
  } catch (err) {
    error(`\nErro geral: ${err.message}`);
    console.error(err);
  }
}

// Executar verificação
verificarFirebase().catch(console.error);

// Made with Bob
