import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

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
    const skip = (page - 1) * limit;

    const [deliveries, totalCount] = await Promise.all([
      prisma.delivery.findMany({
        where: {
          deliveryPartnerId: partner.id,
          status: { in: ['COMPLETED', 'FAILED', 'CANCELLED'] },
        },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              deliveryName: true,
              city: true,
              total: true,
              supplier: { select: { businessName: true } },
            },
          },
          earning: true,
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.delivery.count({
        where: {
          deliveryPartnerId: partner.id,
          status: { in: ['COMPLETED', 'FAILED', 'CANCELLED'] },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      deliveries,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Fetch delivery history error:', error);
    return NextResponse.json({ error: 'Failed to fetch delivery history' }, { status: 500 });
  }
}
