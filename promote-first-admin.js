/**
 * Script para promover o primeiro usuário registrado a admin
 * 
 * USO:
 * 1. Certifique-se de ter um usuário registrado no sistema
 * 2. Configure as variáveis de ambiente do Firebase no .env
 * 3. Execute: node promote-first-admin.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, query, orderBy, limit } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function promoteFirstUserToAdmin() {
  try {
    console.log('🔍 Buscando usuários...');
    
    // Buscar o primeiro usuário (ordenado por data de criação)
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'asc'), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ Nenhum usuário encontrado no Firestore.');
      console.log('📝 Registre um usuário primeiro no sistema.');
      return;
    }
    
    const firstUser = querySnapshot.docs[0];
    const userData = firstUser.data();
    
    console.log('\n👤 Primeiro usuário encontrado:');
    console.log(`   ID: ${firstUser.id}`);
    console.log(`   Nome: ${userData.displayName}`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   Role atual: ${userData.role}`);
    
    if (userData.role === 'admin') {
      console.log('\n✅ Este usuário já é admin!');
      return;
    }
    
    // Promover a admin
    console.log('\n🔄 Promovendo usuário a admin...');
    const userDocRef = doc(db, 'users', firstUser.id);
    await updateDoc(userDocRef, {
      role: 'admin'
    });
    
    console.log('✅ Usuário promovido a admin com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Faça login com este usuário');
    console.log('   2. Acesse a página "Usuários"');
    console.log('   3. Agora você pode promover outros usuários');
    
  } catch (error) {
    console.error('❌ Erro ao promover usuário:', error);
    console.error('\n💡 Verifique se:');
    console.error('   - As variáveis de ambiente estão configuradas no .env');
    console.error('   - O Firebase está configurado corretamente');
    console.error('   - Você tem permissão para acessar o Firestore');
  }
}

// Executar
promoteFirstUserToAdmin();

// Made with Bob
