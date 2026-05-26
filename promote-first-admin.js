/**
 * Script para promover um email específico a admin principal
 *
 * USO:
 * 1. Certifique-se de ter um usuário registrado no sistema com email admin@gj.com
 * 2. Configure as variáveis de ambiente do Firebase no .env
 * 3. Execute: node promote-first-admin.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, query, where, limit } from 'firebase/firestore';
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

const ADMIN_EMAIL = 'admin@gj.com';

async function promoteMainAdmin() {
  try {
    console.log(`🔍 Buscando membro com email ${ADMIN_EMAIL}...`);
    
    const membersRef = collection(db, 'members');
    const q = query(membersRef, where('email', '==', ADMIN_EMAIL), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`❌ Nenhum membro com email ${ADMIN_EMAIL} foi encontrado no Firestore.`);
      console.log('📝 Cadastre esse usuário primeiro no sistema.');
      return;
    }
    
    const adminMember = querySnapshot.docs[0];
    const memberData = adminMember.data();
    
    console.log('\n👤 Membro encontrado:');
    console.log(`   ID: ${adminMember.id}`);
    console.log(`   Nome: ${memberData.name}`);
    console.log(`   Email: ${memberData.email}`);
    console.log(`   Role atual: ${memberData.role}`);
    
    if (memberData.role === 'admin') {
      console.log('\n✅ Este membro já é o admin principal!');
      return;
    }
    
    console.log('\n🔄 Promovendo membro a admin principal...');
    const memberDocRef = doc(db, 'members', adminMember.id);
    await updateDoc(memberDocRef, {
      role: 'admin'
    });
    
    console.log(`✅ ${ADMIN_EMAIL} promovido a admin com sucesso!`);
    console.log('\n📋 Próximos passos:');
    console.log('   1. Faça logout/login com este usuário');
    console.log('   2. Verifique se o painel administrativo foi liberado');
    console.log('   3. Use este admin para promover outros usuários, se necessário');
    
  } catch (error) {
    console.error('❌ Erro ao promover admin principal:', error);
    console.error('\n💡 Verifique se:');
    console.error('   - As variáveis de ambiente estão configuradas no .env');
    console.error('   - O Firebase está configurado corretamente');
    console.error('   - Você tem permissão para acessar o Firestore');
  }
}

// Executar
promoteMainAdmin();

