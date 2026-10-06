import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supplier = await prisma.supplierProfile.findUnique({
      where: { id },
      include: {
        user: true,
        verificationDocuments: true,
        products: { take: 10 },
        orders: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier profile not found' }, { status: 404 });
    }

    return NextResponse.json({ supplier });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch supplier details' }, { status: 500 });
  }
}
