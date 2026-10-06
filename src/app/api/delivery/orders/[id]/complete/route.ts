import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { completeDeliveryWithOtp } from '@/server/services/delivery-assignment.service';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const partner = await prisma.deliveryPartnerProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Delivery partner profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { otp, proofImageUrl } = body;

    if (!otp || typeof otp !== 'string' || otp.length !== 6) {
      return NextResponse.json({ error: 'Valid 6-digit delivery OTP required' }, { status: 400 });
    }

    const delivery = await prisma.delivery.findFirst({
      where: {
        OR: [{ id }, { orderId: id }],
        deliveryPartnerId: partner.id,
      },
    });

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery record not found or access denied' }, { status: 404 });
    }

    const result = await completeDeliveryWithOtp({
      deliveryPartnerId: partner.id,
      deliveryId: delivery.id,
      otp,
      proofImageUrl,
      userId: session.userId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Complete delivery error:', error);
    return NextResponse.json({ error: error.message || 'Delivery completion failed' }, { status: 400 });
  }
}
