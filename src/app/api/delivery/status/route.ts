import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { updateDeliveryPartnerStatus } from '@/server/services/delivery.service';

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partner = await prisma.deliveryPartnerProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Delivery partner profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { isOnline, isAvailable } = body;

    const updated = await updateDeliveryPartnerStatus({
      deliveryPartnerId: partner.id,
      userId: session.userId,
      isOnline,
      isAvailable,
    });

    return NextResponse.json({ success: true, partner: updated });
  } catch (error: any) {
    console.error('Update delivery partner status error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update status' }, { status: 400 });
  }
}
