import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import {
  getDeliveryVerificationDetails,
  resubmitDeliveryVerification,
} from '@/server/services/delivery-verification.service';

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

    const details = await getDeliveryVerificationDetails(partner.id);
    return NextResponse.json({ success: true, partner: details });
  } catch (error) {
    console.error('Fetch delivery verification error:', error);
    return NextResponse.json({ error: 'Failed to fetch verification status' }, { status: 500 });
  }
}

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
    delete body.verificationStatus;

    const updated = await resubmitDeliveryVerification(partner.id, body);
    return NextResponse.json({ success: true, partner: updated });
  } catch (error: any) {
    console.error('Resubmit verification error:', error);
    return NextResponse.json({ error: error.message || 'Failed to resubmit' }, { status: 400 });
  }
}
