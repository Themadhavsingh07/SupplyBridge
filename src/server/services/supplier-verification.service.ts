import { prisma } from '@/lib/prisma';
import { SupplierVerificationStatus } from '@prisma/client';

export async function getSupplierVerificationDetails(supplierId: string) {
  const profile = await prisma.supplierProfile.findUnique({
    where: { id: supplierId },
    select: {
      id: true,
      businessName: true,
      verificationStatus: true,
      verifiedAt: true,
      rejectionReason: true,
      gstNumber: true,
      panNumber: true,
      businessLicenseNumber: true,
      verificationDocuments: true,
      createdAt: true,
    },
  });

  if (!profile) {
    throw new Error('Supplier profile not found');
  }

  return profile;
}

export async function resubmitSupplierVerification(
  supplierId: string,
  data: {
    gstNumber?: string;
    panNumber?: string;
    businessLicenseNumber?: string;
    gstDocUrl?: string;
    panDocUrl?: string;
    licenseDocUrl?: string;
    idProofUrl?: string;
    bankProofUrl?: string;
  }
) {
  const existing = await prisma.supplierProfile.findUnique({
    where: { id: supplierId },
  });

  if (!existing) {
    throw new Error('Supplier profile not found');
  }

  // Security check: Only allow re-submission if status is PENDING, REJECTED, or UNDER_REVIEW
  if (existing.verificationStatus === 'VERIFIED') {
    throw new Error('Supplier is already verified.');
  }

  // Server sets verificationStatus strictly to UNDER_REVIEW upon user resubmission
  const updated = await prisma.supplierProfile.update({
    where: { id: supplierId },
    data: {
      gstNumber: data.gstNumber || existing.gstNumber,
      panNumber: data.panNumber || existing.panNumber,
      businessLicenseNumber: data.businessLicenseNumber || existing.businessLicenseNumber,
      verificationStatus: 'UNDER_REVIEW',
      rejectionReason: null, // clear previous rejection reason
    },
  });

  return updated;
}
