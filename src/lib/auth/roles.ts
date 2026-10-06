import { UserRole } from '@prisma/client';

export type Role = UserRole;

export const ROLES: Record<Role, Role> = {
  CUSTOMER: 'CUSTOMER',
  SUPPLIER: 'SUPPLIER',
  DELIVERY_PARTNER: 'DELIVERY_PARTNER',
  ADMIN: 'ADMIN',
  SUPPORT_AGENT: 'SUPPORT_AGENT',
};

export const ROLE_HIERARCHY: Record<Role, number> = {
  CUSTOMER: 1,
  DELIVERY_PARTNER: 1,
  SUPPLIER: 2,
  SUPPORT_AGENT: 3,
  ADMIN: 4,
};

export function hasRoleLevel(userRole: Role, requiredRole: Role): boolean {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
}
