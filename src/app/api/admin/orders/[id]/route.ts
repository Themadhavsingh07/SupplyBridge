import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        supplier: { select: { id: true, businessName: true, addressLine: true } },
        delivery: {
          include: {
            deliveryPartner: {
              include: { user: { select: { name: true, phone: true } } },
            },
            currentLocation: true,
          },
        },
        items: { include: { product: true } },
        payment: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        complaints: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch admin order details' }, { status: 500 });
  }
}
