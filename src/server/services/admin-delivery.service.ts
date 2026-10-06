import { prisma } from '@/lib/prisma';
import { SupplierVerificationStatus } from '@prisma/client';
import { createAuditLog } from './audit.service';

export async function listAdminDeliveryPartners(params: {
  isVerified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.isVerified !== undefined) {
    where.verificationStatus = params.isVerified ? 'VERIFIED' : 'PENDING';
  }
  if (params.search) {
    where.OR = [
      { vehicleNumber: { contains: params.search, mode: 'insensitive' } },
      { licenseNumber: { contains: params.search, mode: 'insensitive' } },
      { user: { name: { contains: params.search, mode: 'insensitive' } } },
      { user: { phone: { contains: params.search, mode: 'insensitive' } } },
    ];
  }

  const [deliveryPartners, total] = await Promise.all([
    prisma.deliveryPartnerProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, status: true } },
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.deliveryPartnerProfile.count({ where }),
  ]);

  return { deliveryPartners, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function updateDeliveryPartnerVerificationStatus(
  adminUserId: string,
  deliveryPartnerId: string,
  newStatus: SupplierVerificationStatus,
  rejectionReason?: string,
  notes?: string
) {
  const partner = await prisma.deliveryPartnerProfile.findUnique({
    where: { id: deliveryPartnerId },
    include: { user: true },
  });

  if (!partner) throw new Error('Delivery Partner profile not found');

  const updatedPartner = await prisma.deliveryPartnerProfile.update({
    where: { id: deliveryPartnerId },
    data: {
      verificationStatus: newStatus,
    },
  });

  // Also sync user status if suspended/rejected
  if (newStatus === 'SUSPENDED' || newStatus === 'REJECTED') {
    await prisma.user.update({
      where: { id: partner.userId },
      data: { status: 'SUSPENDED' },
    });
  } else if (newStatus === 'VERIFIED') {
    await prisma.user.update({
      where: { id: partner.userId },
      data: { status: 'ACTIVE' },
    });
  }

  await createAuditLog({
    userId: adminUserId,
    action: newStatus === 'VERIFIED' ? ('DELIVERY_PARTNER_APPROVED' as any) : ('DELIVERY_PARTNER_REJECTED' as any),
    entityType: 'DELIVERY_PARTNER_PROFILE',
    entityId: deliveryPartnerId,
    oldData: { verificationStatus: partner.verificationStatus },
    newData: { verificationStatus: newStatus, rejectionReason, notes },
  });

  // Send Notification to Rider
  await prisma.notification.create({
    data: {
      recipientId: partner.userId,
      type: 'SYSTEM',
      title: `Delivery Partner Verification: ${newStatus}`,
      message: `Your rider account status is now ${newStatus}.${
        rejectionReason ? ` Reason: ${rejectionReason}` : ''
      }`,
    },
  });

  return updatedPartner;
}
