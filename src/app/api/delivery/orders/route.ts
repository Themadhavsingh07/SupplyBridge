import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getAvailableDeliveries } from '@/server/services/delivery-assignment.service';

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await getAvailableDeliveries({
      deliveryPartnerId: partner.id,
      page,
      limit,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Fetch available deliveries error:', error);
    return NextResponse.json({ error: 'Failed to fetch available delivery requests' }, { status: 500 });
  }
}
