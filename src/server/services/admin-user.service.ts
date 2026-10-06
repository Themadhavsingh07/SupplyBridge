import { prisma } from '@/lib/prisma';
import { UserRole, UserStatus } from '@prisma/client';
import { createAuditLog } from './audit.service';

export interface UserListParams {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export async function listAdminUsers(params: UserListParams) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.role) where.role = params.role;
  if (params.status) where.status = params.status;
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { email: { contains: params.search, mode: 'insensitive' } },
      { phone: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        customerProfile: { select: { totalOrders: true, totalSpent: true } },
        supplierProfile: { select: { businessName: true, verificationStatus: true } },
        deliveryProfile: { select: { vehicleType: true, rating: true, verificationStatus: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getAdminUserDetails(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      customerProfile: true,
      supplierProfile: true,
      deliveryProfile: true,
      orders: { take: 5, orderBy: { createdAt: 'desc' } },
      auditLogs: { take: 10, orderBy: { createdAt: 'desc' } },
      complaints: { take: 5, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!user) return null;
  const { passwordHash, ...cleanUser } = user;
  return cleanUser;
}

export async function updateUserStatusByAdmin(
  adminUserId: string,
  targetUserId: string,
  newStatus: UserStatus,
  reason: string
) {
  if (adminUserId === targetUserId) {
    throw new Error('Admins cannot change their own account status');
  }

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) throw new Error('User not found');

  const oldStatus = targetUser.status;

  const updatedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: { status: newStatus },
  });

  // Log Audit Entry
  await createAuditLog({
    userId: adminUserId,
    action: newStatus === 'SUSPENDED' ? 'USER_SUSPENDED' : 'USER_REACTIVATED' as any,
    entityType: 'USER',
    entityId: targetUserId,
    oldData: { status: oldStatus },
    newData: { status: newStatus, reason },
  });

  // Create In-App Notification
  await prisma.notification.create({
    data: {
      recipientId: targetUserId,
      type: 'SYSTEM',
      title: `Account Status Updated (${newStatus})`,
      message: `Your account status was changed to ${newStatus}. Reason: ${reason}`,
    },
  });

  return updatedUser;
}
