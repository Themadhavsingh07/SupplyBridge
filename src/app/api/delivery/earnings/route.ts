import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getDeliveryEarningsSummary } from '@/server/services/delivery-earnings.service';

export async function GET() {
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

    const summary = await getDeliveryEarningsSummary(partner.id);
    return NextResponse.json({ success: true, ...summary });
  } catch (error) {
    console.error('Fetch delivery earnings error:', error);
    return NextResponse.json({ error: 'Failed to fetch earnings' }, { status: 500 });
  }
}
