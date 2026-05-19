
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
import { User, UserRole, AuthUser } from '../types';

const localRoles = new Map<string, UserRole>();

const isFirestoreAvailable = async (): Promise<boolean> => {
  try {
    if (!db) return false;
    await getDoc(doc(db, '_health_check_', 'test'));
    return true;
  } catch (error: any) {
    console.warn('Firestore não disponível:', error.message);
    return false;
  }
};

const getUserRole = async (uid: string): Promise<UserRole> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      setUserRoleLocally(uid, userData.role);
      return userData.role;
    }
  } catch (error: any) {
    console.error('Erro ao buscar role do Firestore:', error.message);
  }
  
  const localRole = localRoles.get(uid) || 'member';
  return localRole;
};

const setUserRoleLocally = (uid: string, role: UserRole): void => {
  localRoles.set(uid, role);
  try {
    const roles = JSON.parse(localStorage.getItem('user_roles') || '{}');
    roles[uid] = role;
    localStorage.setItem('user_roles', JSON.stringify(roles));
  } catch (error) {
    console.warn('Erro ao salvar role localmente:', error);
  }
};

const loadLocalRoles = (): void => {
  try {
    const roles = JSON.parse(localStorage.getItem('user_roles') || '{}');
    Object.entries(roles).forEach(([uid, role]) => {
      localRoles.set(uid, role as UserRole);
    });
  } catch (error) {
    console.warn('Erro ao carregar roles locais:', error);
  }
};

loadLocalRoles();

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
    let role: UserRole = 'member';
    let memberId: string | undefined;

    if (await isFirestoreAvailable()) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          role = userData.role;
          memberId = userData.memberId;
          
          await updateDoc(doc(db, 'users', user.uid), {
            lastLogin: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error('Erro ao buscar Firestore:', error);
        role = await getUserRole(user.uid);
      }
    } else {
      role = await getUserRole(user.uid);
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || email.split('@')[0],
      photoURL: user.photoURL,
      role: role,
      memberId: memberId,
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
  role: UserRole = 'member'
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
    
    // Todos os novos usuários entram como 'member'
    const finalRole = role;

    setUserRoleLocally(user.uid, finalRole);

    if (await isFirestoreAvailable()) {
      try {
        const userData: User = {
          id: user.uid,
          email: email,
          displayName: displayName,
          phone: phone,
          birthDate: birthDate,
          role: finalRole,
          photoUrl: undefined,
          createdAt: new Date(),
          lastLogin: new Date(),
        };

        await setDoc(doc(db, 'users', user.uid), {
          ...userData,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
        
        console.log('✅ Usuário criado no Firestore com sucesso:', user.uid);
      } catch (error) {
        console.error('❌ ERRO ao salvar usuário no Firestore:', error);
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
        await updateDoc(doc(db, 'users', user.uid), {
          displayName,
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

    let role: UserRole = 'member';
    let memberId: string | undefined;

    if (await isFirestoreAvailable()) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          role = userData.role;
          memberId = userData.memberId;
        } else {
          role = await getUserRole(user.uid);
        }
      } catch (error) {
        console.error('Erro ao buscar Firestore:', error);
        role = await getUserRole(user.uid);
      }
    } else {
      role = await getUserRole(user.uid);
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'Usuário',
      photoURL: user.photoURL,
      role: role,
      memberId: memberId,
    };
  } catch (error: any) {
    console.error('Erro ao obter usuário atual:', error);
    return null;
  }
};

export const getUserData = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));

    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data() as User;
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
    await updateDoc(doc(db, 'users', uid), {
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
