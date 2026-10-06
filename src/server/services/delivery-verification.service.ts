import { prisma } from '@/lib/prisma';
import { SupplierVerificationStatus } from '@prisma/client';

export async function getDeliveryVerificationDetails(deliveryPartnerId: string) {
  const profile = await prisma.deliveryPartnerProfile.findUnique({
    where: { id: deliveryPartnerId },
    select: {
      id: true,
      vehicleType: true,
      vehicleNumber: true,
      licenseNumber: true,
      verificationStatus: true,
      bankAccountNumber: true,
      bankIfscCode: true,
      upiId: true,
      documents: true,
      createdAt: true,
    },
  });

  if (!profile) {
    throw new Error('Delivery partner profile not found');
  }

  return profile;
}

export async function resubmitDeliveryVerification(
  deliveryPartnerId: string,
  data: {
    vehicleType?: string;
    vehicleNumber?: string;
    licenseNumber?: string;
    bankAccountNumber?: string;
    bankIfscCode?: string;
    upiId?: string;
  }
) {
  const existing = await prisma.deliveryPartnerProfile.findUnique({
    where: { id: deliveryPartnerId },
  });

  if (!existing) {
    throw new Error('Delivery partner profile not found');
  }

  // Security check: Only allow re-submission if status is PENDING, REJECTED, or UNDER_REVIEW
  if (existing.verificationStatus === 'VERIFIED') {
    throw new Error('Delivery partner is already verified.');
  }

  // Server sets verificationStatus strictly to UNDER_REVIEW upon user resubmission
  const updated = await prisma.deliveryPartnerProfile.update({
    where: { id: deliveryPartnerId },
    data: {
      ...data,
      verificationStatus: 'UNDER_REVIEW',
    },
  });

  return updated;
}
