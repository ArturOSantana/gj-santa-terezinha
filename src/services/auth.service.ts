import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  UserCredential,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, Member, UserRole, AuthUser, MemberStatus } from '../types';

const MAIN_ADMIN_EMAIL = 'admin@gj.com';

const getDefaultRoleByEmail = (email: string | null | undefined): UserRole => {
  return email?.toLowerCase() === MAIN_ADMIN_EMAIL ? 'admin' : 'member';
};

const ensureMemberDocument = async (user: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}): Promise<{ role: UserRole; gender?: 'male' | 'female' }> => {
  const memberRef = doc(db, 'members', user.uid);
  const memberDoc = await getDoc(memberRef);

  if (memberDoc.exists()) {
    const memberData = memberDoc.data() as Member;
    return {
      role: memberData.role,
      gender: memberData.gender,
    };
  }

  const fallbackRole = getDefaultRoleByEmail(user.email);
  const now = serverTimestamp();

  await setDoc(memberRef, {
    id: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Usuário',
    email: user.email,
    phone: '',
    birthDate: null,
    gender: null,
    joinDate: now,
    status: MemberStatus.ACTIVE,
    role: fallbackRole,
    photoUrl: user.photoURL || null,
    createdAt: now,
    updatedAt: now,
    lastLogin: now,
  });

  return {
    role: fallbackRole,
    gender: undefined,
  };
};

const isFirestoreAvailable = async (): Promise<boolean> => {
  try {
    return !!db;
  } catch (error: any) {
    console.warn('Firestore não disponível:', error.message);
    return false;
  }
};

const getUserRole = async (uid: string): Promise<UserRole | null> => {
  try {
    const memberDoc = await getDoc(doc(db, 'members', uid));
    
    if (memberDoc.exists()) {
      const role = memberDoc.data().role as UserRole;
      console.log(`✅ Role obtido do Firestore para ${uid}:`, role);
      return role;
    }
    
    // Se o documento não existe, retorna null para indicar que não há role definido
    console.warn(`⚠️ Documento não encontrado para ${uid}, role não definido`);
    return null;
  } catch (error) {
    console.error('❌ Erro ao obter role do Firestore:', error);
    // Em caso de erro, retorna null para indicar falha
    return null;
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<AuthUser> => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;
    let role: UserRole | null = null;
    let gender: 'male' | 'female' | undefined;

    if (await isFirestoreAvailable()) {
      try {
        const ensuredMember = await ensureMemberDocument({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });

        role = ensuredMember.role;
        gender = ensuredMember.gender;

        await updateDoc(doc(db, 'members', user.uid), {
          lastLogin: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Erro ao buscar Firestore:', error);
        throw error;
      }
    } else {
      const fetchedRole = await getUserRole(user.uid);
      if (!fetchedRole) {
        throw new Error('Não foi possível obter as permissões do usuário.');
      }
      role = fetchedRole;
    }

    if (!role) {
      throw new Error('Role do usuário não definido.');
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || email.split('@')[0],
      photoURL: user.photoURL,
      role: role,
      gender: gender,
    };
  } catch (error: any) {
    console.error('Erro ao fazer login:', error);
    throw handleAuthError(error);
  }
};

export const signUp = async (
  email: string,
  password: string,
  displayName: string,
  phone: string,
  birthDate: Date,
  gender: 'male' | 'female',
  role: UserRole = 'member',
  whatsappConsent: boolean = true,
  emailConsent: boolean = true
): Promise<AuthUser> => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await updateProfile(userCredential.user, {
      displayName,
    });

    const user = userCredential.user;
    
    // Todos os novos usuários entram como 'member' por padrão
    const finalRole = role;

    if (await isFirestoreAvailable()) {
      try {
        // Converter birthDate para Timestamp do Firestore
        const birthDateTimestamp = Timestamp.fromDate(birthDate);
        const now = serverTimestamp();
        
        // Criar documento na coleção 'members' (não 'users')
        await setDoc(doc(db, 'members', user.uid), {
          id: user.uid,
          name: displayName,
          email: email,
          phone: phone,
          birthDate: birthDateTimestamp,
          gender: gender,
          joinDate: now,
          status: MemberStatus.ACTIVE,
          role: finalRole, // Role define permissões (admin/coordinator/member)
          photoUrl: null,
          // Boa Nova - Consentimentos de comunicação
          whatsappConsent: {
            accepted: whatsappConsent,
            acceptedAt: whatsappConsent ? now : null,
            revokedAt: null,
          },
          emailConsent: {
            accepted: emailConsent,
            acceptedAt: emailConsent ? now : null,
            revokedAt: null,
          },
          createdAt: now,
          updatedAt: now,
          lastLogin: now,
        });
        
        console.log('✅ Membro criado no Firestore com sucesso:', user.uid);
      } catch (error) {
        console.error('❌ ERRO ao salvar membro no Firestore:', error);
        console.error('Detalhes do erro:', {
          code: (error as any)?.code,
          message: (error as any)?.message,
          userId: user.uid,
          email: email
        });
        // Não bloqueia o registro, mas loga o erro completo
      }
    } else {
      console.warn('⚠️ Firestore não está disponível. Usuário criado apenas no Authentication.');
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      photoURL: null,
      role: finalRole,
      gender: gender,
    };
  } catch (error: any) {
    console.error('Erro ao registrar usuário:', error);
    throw handleAuthError(error);
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Erro ao fazer logout:', error);
    throw handleAuthError(error);
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Erro ao enviar email de recuperação:', error);
    throw handleAuthError(error);
  }
};

export const updateUserProfile = async (
  displayName: string,
  photoURL?: string
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    await updateProfile(user, {
      displayName,
      photoURL: photoURL || null,
    });

    if (await isFirestoreAvailable()) {
      try {
        await updateDoc(doc(db, 'members', user.uid), {
          name: displayName,
          photoUrl: photoURL || null,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.warn('Firestore indisponível, perfil atualizado apenas no Auth');
      }
    }
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error);
    throw handleAuthError(error);
  }
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }

    let role: UserRole | null = null;
    let gender: 'male' | 'female' | undefined;

    if (await isFirestoreAvailable()) {
      try {
        const ensuredMember = await ensureMemberDocument({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });

        role = ensuredMember.role;
        gender = ensuredMember.gender;
      } catch (error) {
        console.error('Erro ao buscar Firestore:', error);
        return null;
      }
    } else {
      const fetchedRole = await getUserRole(user.uid);
      if (!fetchedRole) {
        return null;
      }
      role = fetchedRole;
    }

    if (!role) {
      console.warn('⚠️ Role não definido para usuário:', user.uid);
      return null;
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'Usuário',
      photoURL: user.photoURL,
      role: role,
      gender: gender,
    };
  } catch (error: any) {
    console.error('Erro ao obter usuário atual:', error);
    return null;
  }
};

export const getUserData = async (uid: string): Promise<User | null> => {
  try {
    const memberDoc = await getDoc(doc(db, 'members', uid));

    if (!memberDoc.exists()) {
      return null;
    }

    return memberDoc.data() as User;
  } catch (error: any) {
    console.error('Erro ao obter dados do usuário:', error);
    return null;
  }
};

export const updateUserRole = async (
  uid: string,
  role: UserRole
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'members', uid), {
      role,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Erro ao atualizar role do usuário:', error);
    throw handleAuthError(error);
  }
};

const handleAuthError = (error: any): Error => {
  const errorCode = error.code;
  let message = 'Erro ao processar autenticação';

  switch (errorCode) {
    case 'auth/email-already-in-use':
      message = 'Este email já está em uso';
      break;
    case 'auth/invalid-email':
      message = 'Email inválido';
      break;
    case 'auth/operation-not-allowed':
      message = 'Operação não permitida';
      break;
    case 'auth/weak-password':
      message = 'Senha muito fraca';
      break;
    case 'auth/user-disabled':
      message = 'Usuário desabilitado';
      break;
    case 'auth/user-not-found':
      message = 'Usuário não encontrado';
      break;
    case 'auth/wrong-password':
      message = 'Senha incorreta';
      break;
    case 'auth/invalid-credential':
      message = 'Credenciais inválidas';
      break;
    case 'auth/too-many-requests':
      message = 'Muitas tentativas. Tente novamente mais tarde';
      break;
    case 'auth/network-request-failed':
      message = 'Erro de conexão. Verifique sua internet';
      break;
    default:
      message = error.message || 'Erro desconhecido';
  }

  return new Error(message);
};
