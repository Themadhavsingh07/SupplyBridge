import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { SupplierRegistrationSchema } from '@/lib/validations/supplier';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized. Login required to register business.' }, { status: 401 });
    }

    // Check if user already has a supplier profile
    const existing = await prisma.supplierProfile.findUnique({
      where: { userId: session.userId },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'You have already registered a business application', supplier: existing },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parse = SupplierRegistrationSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json({ error: 'Validation failed', details: parse.error.format() }, { status: 400 });
    }

    const data = parse.data;

    // Execute in Prisma transaction: create SupplierProfile, categories, verification documents, and update User role
    const newSupplier = await prisma.$transaction(async (tx) => {
      // 1. Create SupplierProfile
      const profile = await tx.supplierProfile.create({
        data: {
          userId: session.userId,
          businessName: data.storeName,
          ownerName: data.ownerName,
          businessDescription: data.description,
          phone: data.phone,
          email: data.email,
          addressLine: data.address,
          landmark: data.landmark || null,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          latitude: data.latitude,
          longitude: data.longitude,
          serviceRadiusKm: data.serviceRadiusKm,
          gstNumber: data.gstNumber,
          panNumber: data.panNumber,
          businessLicenseNumber: data.businessLicense,
          logoUrl: data.logoUrl || null,
          coverImageUrl: data.coverImageUrl || null,
          openingTime: data.openingTime,
          closingTime: data.closingTime,
          verificationStatus: 'UNDER_REVIEW', // Server sets initial verification status strictly
          onlineStatus: 'OFFLINE',
          isOpen: false,
          verificationDocuments: {
            create: [
              { type: 'GST', documentUrl: data.gstDocUrl, documentNo: data.gstNumber },
              { type: 'PAN', documentUrl: data.panDocUrl, documentNo: data.panNumber },
              { type: 'BUSINESS_LICENSE', documentUrl: data.licenseDocUrl, documentNo: data.businessLicense },
              { type: 'ID_PROOF', documentUrl: data.idProofUrl },
              { type: 'BANK_PROOF', documentUrl: data.bankProofUrl },
            ],
          },
        },
      });

      // 2. Link categories
      if (data.categoryIds.length > 0) {
        await tx.supplierCategory.createMany({
          data: data.categoryIds.map((catId) => ({
            supplierId: profile.id,
            categoryId: catId,
          })),
        });
      }

      // 3. Update User role to SUPPLIER
      await tx.user.update({
        where: { id: session.userId },
        data: { role: 'SUPPLIER' },
      });

      return profile;
    });

    return NextResponse.json({ success: true, supplier: newSupplier });
  } catch (error: any) {
    console.error('Supplier registration error:', error);
    return NextResponse.json({ error: error.message || 'Failed to register supplier' }, { status: 500 });
  }
}
