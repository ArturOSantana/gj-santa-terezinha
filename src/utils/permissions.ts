
import { UserRole } from '../types';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  coordinator: 2,
  member: 1,
};

export const hasPermission = (
  userRole: UserRole,
  requiredRole: UserRole
): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

export const canEdit = (
  userRole: UserRole,
  resourceType: 'member' | 'event' | 'transaction'
): boolean => {
  switch (resourceType) {
    case 'member':
      // Apenas admin pode editar membros
      return userRole === 'admin';
    case 'event':
      // Admin e coordinator podem editar eventos
      return hasPermission(userRole, 'coordinator');
    case 'transaction':
      // Apenas admin pode editar transações
      return userRole === 'admin';
    default:
      return false;
  }
};

export const canDelete = (
  userRole: UserRole,
  resourceType: 'member' | 'event' | 'transaction'
): boolean => {
  switch (resourceType) {
    case 'member':
      // Apenas admin pode deletar membros
      return userRole === 'admin';
    case 'event':
      // Apenas admin pode deletar eventos
      return userRole === 'admin';
    case 'transaction':
      // Apenas admin pode deletar transações
      return userRole === 'admin';
    default:
      return false;
  }
};

export const canCreate = (
  userRole: UserRole,
  resourceType: 'member' | 'event' | 'transaction'
): boolean => {
  switch (resourceType) {
    case 'member':
      // Apenas admin pode criar membros
      return userRole === 'admin';
    case 'event':
      // Admin e coordinator podem criar eventos
      return hasPermission(userRole, 'coordinator');
    case 'transaction':
      // Apenas admin pode criar transações
      return userRole === 'admin';
    default:
      return false;
  }
};

export const canView = (
  userRole: UserRole,
  resourceType: 'member' | 'event' | 'transaction' | 'dashboard' | 'finance'
): boolean => {
  switch (resourceType) {
    case 'member':
      // Apenas admin pode visualizar lista completa de membros
      return userRole === 'admin';
    case 'event':
      // Todos podem visualizar eventos
      return true;
    case 'transaction':
    case 'finance':
      // Admin e coordinator podem visualizar finanças
      return hasPermission(userRole, 'coordinator');
    case 'dashboard':
      // Todos podem visualizar dashboard
      return true;
    default:
      return false;
  }
};

export const canManageAttendance = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'coordinator');
};

export const canManageUsers = (userRole: UserRole): boolean => {
  return userRole === 'admin';
};

export const canManageSettings = (userRole: UserRole): boolean => {
  return userRole === 'admin';
};

export const getRolePermissions = (userRole: UserRole) => {
  return {
    // Visualização
    canViewDashboard: canView(userRole, 'dashboard'),
    canViewEvents: canView(userRole, 'event'),
    canViewMembers: canView(userRole, 'member'),
    canViewFinance: canView(userRole, 'finance'),
    
    // Criação
    canCreateEvents: canCreate(userRole, 'event'),
    canCreateMembers: canCreate(userRole, 'member'),
    canCreateTransactions: canCreate(userRole, 'transaction'),
    
    // Edição
    canEditEvents: canEdit(userRole, 'event'),
    canEditMembers: canEdit(userRole, 'member'),
    canEditTransactions: canEdit(userRole, 'transaction'),
    
    // Exclusão
    canDeleteEvents: canDelete(userRole, 'event'),
    canDeleteMembers: canDelete(userRole, 'member'),
    canDeleteTransactions: canDelete(userRole, 'transaction'),
    
    // Gerenciamento
    canManageAttendance: canManageAttendance(userRole),
    canManageUsers: canManageUsers(userRole),
    canManageSettings: canManageSettings(userRole),
  };
};

export const PERMISSIONS = {
  ADMIN_ONLY: ['admin'] as UserRole[],
  COORDINATOR_AND_ABOVE: ['admin', 'coordinator'] as UserRole[],
  ALL_USERS: ['admin', 'coordinator', 'member'] as UserRole[],
} as const;

export const hasAnyRole = (
  userRole: UserRole,
  allowedRoles: UserRole[]
): boolean => {
  return allowedRoles.includes(userRole);
};

