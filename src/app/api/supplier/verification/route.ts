import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { resubmitSupplierVerification } from '@/server/services/supplier-verification.service';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.userId },
      include: {
        verificationDocuments: true,
      },
    });

    if (!supplierProfile) {
      return NextResponse.json({ error: 'Supplier profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, supplier: supplierProfile });
  } catch (error) {
    console.error('Fetch verification error:', error);
    return NextResponse.json({ error: 'Failed to fetch verification status' }, { status: 500 });
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

    // Security check: Reject client attempting to pass verificationStatus or verifiedAt
    const body = await req.json();
    delete body.verificationStatus;
    delete body.verifiedAt;

    const updated = await resubmitSupplierVerification(supplierProfile.id, body);

    return NextResponse.json({ success: true, supplier: updated });
  } catch (error: any) {
    console.error('Resubmit verification error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit verification' }, { status: 400 });
  }
}
