
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { hasAnyRole } from '../../utils/permissions';

interface RoleGuardProps {
  children: React.ReactNode;
  roles: UserRole[];
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles,
  fallback = null,
}) => {
  const { user } = useAuth();

  // Se não há usuário autenticado, não mostra nada
  if (!user) {
    return <>{fallback}</>;
  }

  // Verifica se o usuário tem uma das roles permitidas
  if (!hasAnyRole(user.role, roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

