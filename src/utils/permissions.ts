import { UserRole } from '../types';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  coordinator: 2,
  leader: 1,
  member: 0,
  pending: -1,
};

export const hasPermission = (
  userRole: UserRole,
  requiredRole: UserRole
): boolean => {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
};

export const canEdit = (
  userRole: UserRole,
  resourceType: 'member' | 'event' | 'transaction'
): boolean => {
  if (userRole === 'admin') return true;
  
  if (userRole === 'coordinator') {
    return resourceType === 'event' || resourceType === 'transaction' || resourceType === 'member';
  }
  
  return false;
};

export const canDelete = (
  userRole: UserRole,
  resourceType: 'member' | 'event' | 'transaction'
): boolean => {
  if (userRole === 'admin') return true;
  
  if (userRole === 'coordinator') {
    return resourceType === 'event' || resourceType === 'member';
  }
  
  return false;
};

export const canCreate = (
  userRole: UserRole,
  resourceType: 'member' | 'event' | 'transaction'
): boolean => {
  if (userRole === 'admin') return true;
  
  if (userRole === 'coordinator') {
    return resourceType === 'event' || resourceType === 'transaction';
  }

  if (userRole === 'leader') {
    return resourceType === 'event';
  }
  
  return false;
};

export const canView = (
  userRole: UserRole,
  resourceType: 'member' | 'event' | 'transaction' | 'dashboard' | 'finance' | 'contributions'
): boolean => {
  if (userRole === 'admin') return true;
  
  if (userRole === 'coordinator') {
    return (
      resourceType === 'member' ||
      resourceType === 'event' ||
      resourceType === 'transaction' ||
      resourceType === 'dashboard' ||
      resourceType === 'finance' ||
      resourceType === 'contributions'
    );
  }
  
  if (userRole === 'member') {
    return (
      resourceType === 'event' ||
      resourceType === 'dashboard' ||
      resourceType === 'contributions'
    );
  }
  
  return false;
};

export const canManageUsers = (userRole: UserRole): boolean => {
  return userRole === 'admin' || userRole === 'coordinator';
};

export const canPromoteUser = (userRole: UserRole, targetRole: UserRole): boolean => {
  if (userRole === 'admin') return true;
  return false;
};

export const canDemoteUser = (userRole: UserRole, targetRole: UserRole): boolean => {
  if (userRole === 'admin') return true;
  if (userRole === 'coordinator' && targetRole === 'member') return true;
  return false;
};

export const canRemoveUser = (userRole: UserRole, targetRole: UserRole): boolean => {
  if (userRole === 'admin') return true;
  // Coordenador pode remover apenas líderes e membros, nunca outros coordenadores ou admins
  if (userRole === 'coordinator' && (targetRole === 'leader' || targetRole === 'member' || targetRole === 'pending')) return true;
  return false;
};

export const canDownloadReports = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'coordinator');
};

export const getRolePermissions = (userRole: UserRole) => {
  return {
    canViewDashboard: canView(userRole, 'dashboard'),
    canViewEvents: canView(userRole, 'event'),
    canViewMembers: canView(userRole, 'member'),
    canViewFinance: canView(userRole, 'finance'),
    canViewContributions: canView(userRole, 'contributions'),
    
    canCreateEvents: canCreate(userRole, 'event'),
    canCreateMembers: canCreate(userRole, 'member'),
    canCreateTransactions: canCreate(userRole, 'transaction'),
    
    canEditEvents: canEdit(userRole, 'event'),
    canEditMembers: canEdit(userRole, 'member'),
    canEditTransactions: canEdit(userRole, 'transaction'),
    
    canDeleteEvents: canDelete(userRole, 'event'),
    canDeleteMembers: canDelete(userRole, 'member'),
    canDeleteTransactions: canDelete(userRole, 'transaction'),
    
    canManageUsers: canManageUsers(userRole),
    canDownloadReports: canDownloadReports(userRole),
  };
};

export const PERMISSIONS = {
  ADMIN_ONLY: ['admin'] as UserRole[],
  COORDINATOR_AND_ABOVE: ['admin', 'coordinator'] as UserRole[],
  LEADER_AND_ABOVE: ['admin', 'coordinator', 'leader'] as UserRole[],
  ALL_USERS: ['admin', 'coordinator', 'leader', 'member'] as UserRole[],
  PENDING_ONLY: ['pending'] as UserRole[],
} as const;

export const hasAnyRole = (
  userRole: UserRole,
  allowedRoles: UserRole[]
): boolean => {
  return allowedRoles.includes(userRole);
};

