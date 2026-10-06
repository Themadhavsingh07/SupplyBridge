import { getSession, SessionUser } from './session';
import { Role } from './roles';
import { Permission, hasPermission } from './permissions';
import { prisma } from '@/lib/prisma';

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      customerProfile: true,
      supplierProfile: true,
      deliveryProfile: true,
      addresses: true,
    },
  });

  return user;
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error('UNAUTHORIZED: Authentication required');
  }
  return session;
}

export async function requireRole(allowedRoles: Role | Role[]): Promise<SessionUser> {
  const session = await requireAuth();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(session.role)) {
    throw new Error(`FORBIDDEN: Role ${session.role} is not permitted to access this resource`);
  }

  return session;
}

export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const session = await requireAuth();

  if (!hasPermission(session.role, permission)) {
    throw new Error(`FORBIDDEN: Permission ${permission} required`);
  }

  return session;
}

export async function requireCustomer(): Promise<SessionUser> {
  return requireRole('CUSTOMER');
}

export async function requireSupplier(): Promise<SessionUser> {
  return requireRole(['SUPPLIER', 'ADMIN']);
}

export async function requireDeliveryPartner(): Promise<SessionUser> {
  return requireRole(['DELIVERY_PARTNER', 'ADMIN']);
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole('ADMIN');
}

export async function requireSupportAgent(): Promise<SessionUser> {
  return requireRole(['SUPPORT_AGENT', 'ADMIN']);
}
