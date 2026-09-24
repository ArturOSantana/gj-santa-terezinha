import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthContextType, AuthUser } from '../types';
import * as authService from '../services/auth.service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const authUser = await authService.getCurrentUser();
          
          if (authUser) {
            setUser(authUser);
          } else {
            // Se getCurrentUser retorna null, significa que o documento não existe
            // Não definir role automaticamente - deixar o sistema criar o documento primeiro
            console.warn('[AuthContext] Documento do usuário não encontrado no Firestore:', firebaseUser.uid);
            setUser(null);
          }
        } catch (error) {
          console.error('[AuthContext] Erro ao carregar dados do usuário:', error);
          // Em caso de erro, não assumir role - deixar null para forçar recriação
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    const authUser = await authService.signIn(email, password);
    setUser(authUser);
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
  ): Promise<void> => {
    // Auto-cadastro cria conta com role 'pending' — sem acesso ao painel até aprovação por Admin
    const created = await authService.createOperatorUser(email, password, displayName, 'pending');
    const operatorDoc = await authService.getUserOperatorDoc(created.uid);
    if (operatorDoc) {
      setUser({
        uid: created.uid,
        email,
        displayName,
        role: operatorDoc.role,
      });
    }
  };

  const signOut = async (): Promise<void> => {
    await authService.signOut();
    setUser(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    await authService.resetPassword(email);
  };

  const updateUserProfile = async (
    displayName: string,
    photoURL?: string
  ): Promise<void> => {
    await authService.updateUserProfile(displayName, photoURL);
    if (user) {
      setUser({
        ...user,
        displayName,
        photoURL: photoURL || null,
      });
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};
