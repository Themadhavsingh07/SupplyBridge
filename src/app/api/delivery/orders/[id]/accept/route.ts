import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { acceptDelivery } from '@/server/services/delivery-assignment.service';

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

    const result = await acceptDelivery({
      deliveryPartnerId: partner.id,
      orderId: id,
      userId: session.userId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Accept delivery error:', error);
    return NextResponse.json({ error: error.message || 'Failed to accept delivery request' }, { status: 400 });
  }
}
