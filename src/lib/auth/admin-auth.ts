import { UserRole } from '@prisma/client';

export type AdminPermission =
  | 'MANAGE_USERS'
  | 'MANAGE_SUPPLIERS'
  | 'VERIFY_SUPPLIERS'
  | 'MANAGE_DELIVERY_PARTNERS'
  | 'MANAGE_PRODUCTS'
  | 'MANAGE_CATEGORIES'
  | 'MANAGE_ORDERS'
  | 'MANAGE_PAYMENTS'
  | 'MANAGE_REFUNDS'
  | 'MANAGE_COMPLAINTS'
  | 'MANAGE_REVIEWS'
  | 'MANAGE_COUPONS'
  | 'VIEW_ANALYTICS'
  | 'MANAGE_SYSTEM'
  | 'VIEW_AUDIT_LOGS';

const SUPPORT_AGENT_PERMISSIONS: AdminPermission[] = [
  'MANAGE_COMPLAINTS',
  'MANAGE_ORDERS',
  'MANAGE_REFUNDS',
  'MANAGE_REVIEWS',
  'VIEW_ANALYTICS',
];

export function hasPermission(role: UserRole | string, permission: AdminPermission): boolean {
  if (role === UserRole.ADMIN || role === 'ADMIN') {
    return true; // Admins have full permissions
  }

  if (role === UserRole.SUPPORT_AGENT || role === 'SUPPORT_AGENT') {
    return SUPPORT_AGENT_PERMISSIONS.includes(permission);
  }

  return false;
}

export function authorizeAdminOrSupport(role: UserRole | string, permission?: AdminPermission) {
  if (role !== UserRole.ADMIN && role !== UserRole.SUPPORT_AGENT && role !== 'ADMIN' && role !== 'SUPPORT_AGENT') {
    return { authorized: false, error: 'Unauthorized: Admin or Support privileges required' };
  }

  if (permission && !hasPermission(role, permission)) {
    return { authorized: false, error: `Forbidden: Insufficient permissions for ${permission}` };
  }

  return { authorized: true, error: null };
}
