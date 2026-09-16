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
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserRole, AuthUser } from '../types';

/**
 * Busca o registro de usuário operador em `users/{uid}`.
 * Princípio fail-closed: Se o documento não existir, acesso é negado (sem auto-criação de conta).
 */
export const getUserOperatorDoc = async (uid: string): Promise<{
  role: UserRole;
  personId?: string;
  name: string;
  email: string;
} | null> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      return null;
    }
    const data = snap.data();
    return {
      role: data.role as UserRole,
      personId: data.personId,
      name: data.name || 'Operador',
      email: data.email || '',
    };
  } catch (error) {
    console.error('Erro ao buscar operador em users/{uid}:', error);
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
    const operatorDoc = await getUserOperatorDoc(user.uid);

    if (!operatorDoc || !operatorDoc.role) {
      // Se não há documento de usuário provisionado na liderança, encerra a sessão imediatamente (fail-closed)
      await firebaseSignOut(auth);
      throw new Error('Acesso restrito à liderança do Grupo de Jovens. Solicite seu cadastro à coordenação geral.');
    }

    if (operatorDoc.role === 'pending') {
      // Conta criada mas ainda não aprovada por um Admin
      await firebaseSignOut(auth);
      throw new Error('Sua conta aguarda aprovação da coordenação. Aguarde o contato da liderança.');
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Não foi possível atualizar lastLogin do operador:', e);
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: operatorDoc.name || user.displayName || email.split('@')[0],
      photoURL: user.photoURL,
      role: operatorDoc.role,
    };
  } catch (error: any) {
    console.error('Erro ao fazer login:', error);
    throw handleAuthError(error);
  }
};

/**
 * Criação de novo operador administrativo no painel do grupo.
 * Exclusivo para ser invocado por administradores.
 */
export const createOperatorUser = async (
  email: string,
  pass: string,
  name: string,
  role: UserRole,
  personId?: string
): Promise<{ uid: string }> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const uid = userCredential.user.uid;

  await updateProfile(userCredential.user, {
    displayName: name,
  });

  const now = serverTimestamp();
  await setDoc(doc(db, 'users', uid), {
    id: uid,
    personId: personId || null,
    name,
    email,
    role,
    createdAt: now,
    updatedAt: now,
    lastLogin: null,
  });

  return { uid };
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

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: displayName,
        photoUrl: photoURL || null,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.warn('Atualização persistida no Auth, aguardando sincronização no users/{uid}');
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

    const operatorDoc = await getUserOperatorDoc(user.uid);
    if (!operatorDoc || !operatorDoc.role) {
      return null;
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: operatorDoc.name || user.displayName || user.email?.split('@')[0] || 'Líder',
      photoURL: user.photoURL,
      role: operatorDoc.role,
    };
  } catch (error: any) {
    console.error('Erro ao obter operador atual:', error);
    return null;
  }
};

export const updateUserRole = async (
  uid: string,
  role: UserRole
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      role,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Erro ao atualizar papel do operador:', error);
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
