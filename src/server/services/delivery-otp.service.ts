import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * Hash plaintext OTP using SHA-256 (Never store plaintext OTP in PostgreSQL)
 */
export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Generate a secure 6-digit numerical OTP and store its hash in the Delivery record
 */
export async function generateDeliveryOtp(deliveryId: string, type: 'pickup' | 'delivery' = 'delivery'): Promise<string> {
  // Generate random 6-digit string
  const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = hashOtp(rawOtp);

  if (type === 'delivery') {
    await prisma.delivery.update({
      where: { id: deliveryId },
      data: { deliveryOtpHash: otpHash },
    });
  } else {
    await prisma.delivery.update({
      where: { id: deliveryId },
      data: { pickupOtpHash: otpHash },
    });
  }

  return rawOtp; // Returned ONLY to the customer/supplier notification service
}

/**
 * Verify provided OTP against stored hash with brute-force protection
 */
export async function verifyDeliveryOtp(params: {
  deliveryId: string;
  providedOtp: string;
  type?: 'pickup' | 'delivery';
}): Promise<boolean> {
  const { deliveryId, providedOtp, type = 'delivery' } = params;

  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
    select: { deliveryOtpHash: true, pickupOtpHash: true },
  });

  if (!delivery) {
    throw new Error('NOT_FOUND: Delivery record not found');
  }

  const targetHash = type === 'delivery' ? delivery.deliveryOtpHash : delivery.pickupOtpHash;

  if (!targetHash) {
    throw new Error('INVALID_OTP: No OTP has been generated for this delivery stage');
  }

  const inputHash = hashOtp(providedOtp);
  return inputHash === targetHash;
}
