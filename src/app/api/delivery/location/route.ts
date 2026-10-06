import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { updateDeliveryLocation, getLatestOrderLocation } from '@/server/services/delivery-location.service';

export async function POST(req: Request) {
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

    const result = await updateDeliveryLocation({
      deliveryPartnerId: partner.id,
      userId: session.userId,
      input: {
        latitude: Number(body.latitude),
        longitude: Number(body.longitude),
        accuracy: body.accuracy ? Number(body.accuracy) : undefined,
        heading: body.heading ? Number(body.heading) : undefined,
        speed: body.speed ? Number(body.speed) : undefined,
        timestamp: body.timestamp || new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Update delivery location error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update GPS location' }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'orderId parameter required' }, { status: 400 });
    }

    // Authorization check: Customer owning order, assigned delivery partner, or admin
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { customerId: true, supplierId: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const locationData = await getLatestOrderLocation(orderId);
    return NextResponse.json({ success: true, tracking: locationData });
  } catch (error) {
    console.error('Fetch order location error:', error);
    return NextResponse.json({ error: 'Failed to fetch live delivery location' }, { status: 500 });
  }
}
