import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
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

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            businessName: true,
            phone: true,
            email: true,
            addressLine: true,
            city: true,
            latitude: true,
            longitude: true,
          },
        },
        items: {
          include: {
            product: { select: { name: true, unit: true, sku: true } },
          },
        },
        delivery: {
          include: {
            currentLocation: true,
          },
        },
        payment: {
          select: { status: true, method: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Fetch delivery order details error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
