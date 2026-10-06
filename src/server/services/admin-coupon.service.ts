import { prisma } from '@/lib/prisma';
import { CouponType } from '@prisma/client';
import { createAuditLog } from './audit.service';

export async function listAdminCoupons() {
  return await prisma.coupon.findMany({
    include: {
      supplier: { select: { id: true, businessName: true } },
      _count: { select: { usages: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createAdminCoupon(adminUserId: string, data: {
  code: string;
  discountType: CouponType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number | null;
  startDate: string | Date;
  endDate: string | Date;
  usageLimit?: number | null;
  perUserLimit?: number;
  supplierId?: string | null;
  isActive?: boolean;
}) {
  const existing = await prisma.coupon.findUnique({ where: { code: data.code.toUpperCase() } });
  if (existing) throw new Error(`Coupon code '${data.code}' already exists`);

  const coupon = await prisma.coupon.create({
    data: {
      code: data.code.toUpperCase(),
      type: data.discountType,
      value: data.discountValue,
      minOrderAmount: data.minOrderAmount || 0,
      maxDiscount: data.maxDiscountAmount || null,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      usageLimit: data.usageLimit || null,
      supplierId: data.supplierId || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });

  await createAuditLog({
    userId: adminUserId,
    action: 'COUPON_CREATED' as any,
    entityType: 'COUPON',
    entityId: coupon.id,
    newData: coupon,
  });

  return coupon;
}

export async function toggleCouponStatus(adminUserId: string, couponId: string, isActive: boolean) {
  const coupon = await prisma.coupon.update({
    where: { id: couponId },
    data: { isActive },
  });

  await createAuditLog({
    userId: adminUserId,
    action: 'COUPON_DEACTIVATED' as any,
    entityType: 'COUPON',
    entityId: couponId,
    newData: { isActive },
  });

  return coupon;
}
