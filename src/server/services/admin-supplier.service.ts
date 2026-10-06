import { prisma } from '@/lib/prisma';
import { SupplierVerificationStatus } from '@prisma/client';
import { createAuditLog } from './audit.service';
import { publishRealtimeEvent } from '@/lib/realtime/event-publisher';

export async function listAdminSuppliers(params: {
  verificationStatus?: SupplierVerificationStatus;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.verificationStatus) where.verificationStatus = params.verificationStatus;
  if (params.search) {
    where.OR = [
      { businessName: { contains: params.search, mode: 'insensitive' } },
      { gstNumber: { contains: params.search, mode: 'insensitive' } },
      { panNumber: { contains: params.search, mode: 'insensitive' } },
      { user: { name: { contains: params.search, mode: 'insensitive' } } },
    ];
  }

  const [suppliers, total] = await Promise.all([
    prisma.supplierProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        verificationDocuments: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.supplierProfile.count({ where }),
  ]);

  return { suppliers, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function updateSupplierVerificationStatus(
  adminUserId: string,
  supplierId: string,
  newStatus: SupplierVerificationStatus,
  rejectionReason?: string,
  notes?: string
) {
  const supplier = await prisma.supplierProfile.findUnique({
    where: { id: supplierId },
    include: { user: true },
  });

  if (!supplier) throw new Error('Supplier profile not found');

  const oldStatus = supplier.verificationStatus;

  const updatedSupplier = await prisma.supplierProfile.update({
    where: { id: supplierId },
    data: {
      verificationStatus: newStatus,
      rejectionReason: rejectionReason || null,
      verifiedAt: newStatus === 'VERIFIED' ? new Date() : supplier.verifiedAt,
    },
  });

  let auditAction: any = 'SUPPLIER_APPROVED';
  if (newStatus === 'REJECTED') auditAction = 'SUPPLIER_REJECTED';
  if (newStatus === 'SUSPENDED') auditAction = 'SUPPLIER_SUSPENDED';

  await createAuditLog({
    userId: adminUserId,
    action: auditAction,
    entityType: 'SUPPLIER_PROFILE',
    entityId: supplierId,
    oldData: { verificationStatus: oldStatus },
    newData: { verificationStatus: newStatus, rejectionReason, notes },
  });

  // Notification to recipient
  await prisma.notification.create({
    data: {
      recipientId: supplier.userId,
      type: 'SYSTEM',
      title: `Supplier Verification: ${newStatus}`,
      message: `Your supplier profile verification status has been updated to ${newStatus}.${
        rejectionReason ? ` Reason: ${rejectionReason}` : ''
      }`,
    },
  });

  // Publish Realtime Event
  await publishRealtimeEvent({
    eventType: 'SUPPLIER_VERIFIED' as any,
    actorId: adminUserId,
    actorRole: 'ADMIN',
    entityId: supplierId,
    payload: { supplierId, verificationStatus: newStatus } as any,
  });

  return updatedSupplier;
}
