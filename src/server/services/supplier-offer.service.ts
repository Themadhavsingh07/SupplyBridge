import { prisma } from '@/lib/prisma';
import { CouponType } from '@prisma/client';
import { SupplierCouponSchema } from '@/lib/validations/supplier';
import { z } from 'zod';

export async function listSupplierOffers(supplierId: string) {
  const coupons = await prisma.coupon.findMany({
    where: {
      supplierId,
    },
    include: {
      _count: { select: { usages: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return coupons;
}

export async function createSupplierOffer(
  supplierId: string,
  input: z.infer<typeof SupplierCouponSchema>
) {
  const validated = SupplierCouponSchema.parse(input);

  const existing = await prisma.coupon.findUnique({
    where: { code: validated.code },
  });

  if (existing) {
    throw new Error(`Coupon code '${validated.code}' already exists`);
  }

  const coupon = await prisma.coupon.create({
    data: {
      supplierId,
      code: validated.code,
      description: validated.description,
      type: validated.type as CouponType,
      value: validated.value,
      minOrderAmount: validated.minOrderAmount,
      maxDiscount: validated.maxDiscount || null,
      startDate: new Date(validated.startDate),
      endDate: new Date(validated.endDate),
      usageLimit: validated.usageLimit || null,
      isActive: validated.isActive,
    },
  });

  return coupon;
}

export async function toggleSupplierOffer(supplierId: string, couponId: string, isActive: boolean) {
  const existing = await prisma.coupon.findFirst({
    where: { id: couponId, supplierId },
  });

  if (!existing) {
    throw new Error('Offer not found or access denied');
  }

  return await prisma.coupon.update({
    where: { id: couponId },
    data: { isActive },
  });
}

export async function validateAndCalculateCoupon(params: {
  code: string;
  subtotal: number;
  supplierId?: string;
  userId?: string;
}) {
  const { code, subtotal, supplierId, userId } = params;

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon) {
    return { valid: false, error: 'Invalid coupon code' };
  }

  if (!coupon.isActive) {
    return { valid: false, error: 'This coupon is inactive' };
  }

  const now = new Date();
  if (now < coupon.startDate || now > coupon.endDate) {
    return { valid: false, error: 'This coupon has expired or is not active yet' };
  }

  // Supplier scope check
  if (coupon.supplierId && supplierId && coupon.supplierId !== supplierId) {
    return { valid: false, error: 'This coupon is not valid for this supplier' };
  }

  // Minimum order check
  const minOrder = Number(coupon.minOrderAmount || 0);
  if (subtotal < minOrder) {
    return { valid: false, error: `Minimum order amount for this coupon is ₹${minOrder}` };
  }

  // Usage limit check
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, error: 'Coupon usage limit reached' };
  }

  // Discount calculation
  let discountAmount = 0;
  if (coupon.type === 'PERCENTAGE') {
    discountAmount = (subtotal * Number(coupon.value)) / 100;
    if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
      discountAmount = Number(coupon.maxDiscount);
    }
  } else if (coupon.type === 'FIXED') {
    discountAmount = Math.min(subtotal, Number(coupon.value));
  } else if (coupon.type === 'FREE_DELIVERY') {
    discountAmount = 0; // Handled as free delivery fee
  }

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      discountAmount: Math.round(discountAmount * 100) / 100,
    },
  };
}
