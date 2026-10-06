import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { updateDeliveryStage } from '@/server/services/delivery-assignment.service';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params; // deliveryId or orderId

    const partner = await prisma.deliveryPartnerProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Delivery partner profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { stage } = body;

    if (!['START', 'ARRIVE_SUPPLIER', 'CONFIRM_PICKUP', 'ARRIVE_CUSTOMER'].includes(stage)) {
      return NextResponse.json({ error: 'Invalid delivery stage' }, { status: 400 });
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

    const updated = await updateDeliveryStage({
      deliveryPartnerId: partner.id,
      deliveryId: delivery.id,
      stage,
      userId: session.userId,
    });

    return NextResponse.json({ success: true, delivery: updated });
  } catch (error: any) {
    console.error('Update delivery stage error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update delivery stage' }, { status: 400 });
  }
}
