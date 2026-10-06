import { Role } from './roles';

export type Permission =
  | 'read:products'
  | 'write:products'
  | 'read:orders'
  | 'write:orders'
  | 'manage:inventory'
  | 'update:location'
  | 'read:analytics'
  | 'manage:suppliers'
  | 'manage:users'
  | 'resolve:complaints';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  CUSTOMER: ['read:products', 'read:orders', 'write:orders'],
  SUPPLIER: ['read:products', 'write:products', 'read:orders', 'write:orders', 'manage:inventory', 'read:analytics'],
  DELIVERY_PARTNER: ['read:orders', 'write:orders', 'update:location'],
  SUPPORT_AGENT: ['read:products', 'read:orders', 'write:orders', 'resolve:complaints', 'read:analytics'],
  ADMIN: [
    'read:products',
    'write:products',
    'read:orders',
    'write:orders',
    'manage:inventory',
    'update:location',
    'read:analytics',
    'manage:suppliers',
    'manage:users',
    'resolve:complaints',
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}
