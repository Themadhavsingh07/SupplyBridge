import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { DeliveryRegistrationSchema } from '@/lib/validations/delivery';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized. Login required.' }, { status: 401 });
    }

    const existing = await prisma.deliveryPartnerProfile.findUnique({
      where: { userId: session.userId },
    });

    if (existing) {
      return NextResponse.json({ error: 'You have already registered as a delivery partner', partner: existing }, { status: 400 });
    }

    const body = await req.json();
    const parse = DeliveryRegistrationSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json({ error: 'Validation failed', details: parse.error.format() }, { status: 400 });
    }

    const data = parse.data;

    // Create DeliveryPartnerProfile, documents, and update User role in transaction
    const newPartner = await prisma.$transaction(async (tx) => {
      const profile = await tx.deliveryPartnerProfile.create({
        data: {
          userId: session.userId,
          vehicleType: data.vehicleType,
          vehicleNumber: data.vehicleNumber,
          licenseNumber: data.licenseNumber,
          bankAccountNumber: data.bankAccountNumber,
          bankIfscCode: data.bankIfscCode,
          upiId: data.upiId || null,
          verificationStatus: 'UNDER_REVIEW',
          isOnline: false,
          isAvailable: false,
          documents: {
            create: [
              { type: 'ID_PROOF', documentUrl: data.govtIdUrl },
              { type: 'BUSINESS_LICENSE', documentUrl: data.licenseDocUrl, documentNo: data.licenseNumber },
              { type: 'OTHER', documentUrl: data.rcDocUrl, documentNo: data.vehicleNumber },
            ],
          },
        },
      });

      await tx.user.update({
        where: { id: session.userId },
        data: { role: 'DELIVERY_PARTNER' },
      });

      return profile;
    });

    return NextResponse.json({ success: true, partner: newPartner });
  } catch (error: any) {
    console.error('Delivery registration error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
