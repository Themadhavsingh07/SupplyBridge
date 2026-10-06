import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { DeliveryProfileSchema } from '@/lib/validations/delivery';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partner = await prisma.deliveryPartnerProfile.findUnique({
      where: { userId: session.userId },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        documents: true,
      },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Delivery partner profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, partner });
  } catch (error) {
    console.error('Fetch delivery profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

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
    delete (body as any).verificationStatus;
    delete (body as any).rating;
    delete (body as any).totalDeliveries;
    delete (body as any).totalEarnings;

    const parse = DeliveryProfileSchema.partial().safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid profile data', details: parse.error.format() }, { status: 400 });
    }

    const updated = await prisma.deliveryPartnerProfile.update({
      where: { id: partner.id },
      data: parse.data,
    });

    return NextResponse.json({ success: true, partner: updated });
  } catch (error) {
    console.error('Update delivery profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
