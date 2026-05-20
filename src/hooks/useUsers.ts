
import { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { UsersService } from '../services/firestore.service';
import { useAuth } from '../contexts/AuthContext';

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  searchUsers: (query: string) => User[];
  filterByRole: (role: UserRole | 'all') => User[];
  refreshUsers: () => void;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  // Carregar usuários em tempo real
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Listener em tempo real
      const unsubscribe = UsersService.onSnapshot(currentUser.role, (updatedUsers) => {
        setUsers(updatedUsers);
        setLoading(false);
      });

      // Cleanup
      return () => {
        unsubscribe();
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar usuários';
      setError(errorMessage);
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * Atualizar role de um usuário
   */
  const updateUserRole = useCallback(
    async (userId: string, newRole: UserRole): Promise<void> => {
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('Apenas administradores podem alterar roles');
      }

      // Não permitir que admin remova próprio role de admin
      if (userId === currentUser.uid && newRole !== 'admin') {
        throw new Error('Você não pode remover seu próprio role de administrador');
      }

      try {
        await UsersService.updateUserRole(userId, newRole, currentUser.role);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar role';
        setError(errorMessage);
        throw err;
      }
    },
    [currentUser]
  );

  /**
   * Deletar usuário
   */
  const deleteUser = useCallback(
    async (userId: string): Promise<void> => {
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('Apenas administradores podem deletar usuários');
      }

      if (userId === currentUser.uid) {
        throw new Error('Você não pode deletar sua própria conta');
      }

      try {
        await UsersService.delete(userId, currentUser.role, currentUser.uid);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar usuário';
        setError(errorMessage);
        throw err;
      }
    },
    [currentUser]
  );

  /**
   * Buscar usuários por nome ou email
   */
  const searchUsers = useCallback(
    (query: string): User[] => {
      const safeQuery = typeof query === 'string' ? query.trim().toLowerCase() : '';
      if (!safeQuery) {
        return users;
      }

      return users.filter((user) => {
        const displayName = typeof user.name === 'string' ? user.name.toLowerCase() : '';
        const email = typeof user.email === 'string' ? user.email.toLowerCase() : '';
        return displayName.includes(safeQuery) || email.includes(safeQuery);
      });
    },
    [users]
  );

  /**
   * Filtrar usuários por role
   */
  const filterByRole = useCallback(
    (role: UserRole | 'all'): User[] => {
      if (role === 'all') {
        return users;
      }
      return users.filter((user) => user.role === role);
    },
    [users]
  );

  /**
   * Forçar atualização dos usuários
   */
  const refreshUsers = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'admin') {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const updatedUsers = await UsersService.getAllUsers(currentUser.role);
      setUsers(updatedUsers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar usuários';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  return {
    users,
    loading,
    error,
    updateUserRole,
    deleteUser,
    searchUsers,
    filterByRole,
    refreshUsers,
  };
};

export default useUsers;

