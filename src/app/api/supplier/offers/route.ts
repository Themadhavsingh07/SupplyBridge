import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import {
  listSupplierOffers,
  createSupplierOffer,
  toggleSupplierOffer,
} from '@/server/services/supplier-offer.service';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!supplierProfile) {
      return NextResponse.json({ error: 'Supplier profile not found' }, { status: 404 });
    }

    const offers = await listSupplierOffers(supplierProfile.id);
    return NextResponse.json({ success: true, offers });
  } catch (error) {
    console.error('Fetch supplier offers error:', error);
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!supplierProfile) {
      return NextResponse.json({ error: 'Supplier profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const offer = await createSupplierOffer(supplierProfile.id, body);

    return NextResponse.json({ success: true, offer });
  } catch (error: any) {
    console.error('Create offer error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create offer' }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!supplierProfile) {
      return NextResponse.json({ error: 'Supplier profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { id, isActive } = body;

    if (!id || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Coupon ID and isActive boolean required' }, { status: 400 });
    }

    const updated = await toggleSupplierOffer(supplierProfile.id, id, isActive);
    return NextResponse.json({ success: true, offer: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to toggle offer' }, { status: 400 });
  }
}
