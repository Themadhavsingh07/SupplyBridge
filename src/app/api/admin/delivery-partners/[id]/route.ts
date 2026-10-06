import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const partner = await prisma.deliveryPartnerProfile.findUnique({
      where: { id },
      include: {
        user: true,
        documents: true,
        locations: { take: 1, orderBy: { timestamp: 'desc' } },
        deliveries: { take: 10, orderBy: { createdAt: 'desc' } },
        earnings: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Delivery partner profile not found' }, { status: 404 });
    }

    return NextResponse.json({ deliveryPartner: partner });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch delivery partner details' }, { status: 500 });
  }
}
