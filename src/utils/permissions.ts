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
      return hasPermission(userRole, 'coordinator');
    case 'event':
      return hasPermission(userRole, 'coordinator');
    case 'transaction':
      return hasPermission(userRole, 'coordinator');
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
      return hasPermission(userRole, 'coordinator');
    case 'event':
      return hasPermission(userRole, 'coordinator');
    case 'transaction':
      return hasPermission(userRole, 'coordinator');
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
      return userRole === 'admin';
    case 'event':
      return hasPermission(userRole, 'coordinator');
    case 'transaction':
      return hasPermission(userRole, 'coordinator');
    default:
      return false;
  }
};

export const canView = (
  userRole: UserRole,
  resourceType: 'member' | 'event' | 'transaction' | 'dashboard' | 'finance' | 'contributions'
): boolean => {
  switch (resourceType) {
    case 'member':
      return userRole === 'admin';
    case 'event':
      return true;
    case 'transaction':
    case 'finance':
      return hasPermission(userRole, 'coordinator');
    case 'contributions':
      return true;
    case 'dashboard':
      return true;
    default:
      return false;
  }
};

export const canManageUsers = (userRole: UserRole): boolean => {
  return userRole === 'admin';
};

export const canPromoteUser = (userRole: UserRole, targetRole: UserRole): boolean => {
  if (userRole === 'admin') return true;
  if (userRole === 'coordinator' && targetRole !== 'admin') return true;
  return false;
};

export const canDemoteUser = (userRole: UserRole, targetRole: UserRole): boolean => {
  if (userRole === 'admin') return true;
  if (userRole === 'coordinator' && targetRole !== 'admin') return true;
  return false;
};

export const canRemoveUser = (userRole: UserRole, targetRole: UserRole): boolean => {
  if (userRole === 'admin') return true;
  if (userRole === 'coordinator' && targetRole !== 'admin') return true;
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
  ALL_USERS: ['admin', 'coordinator', 'member'] as UserRole[],
} as const;

export const hasAnyRole = (
  userRole: UserRole,
  allowedRoles: UserRole[]
): boolean => {
  return allowedRoles.includes(userRole);
};

// Made with Bob
