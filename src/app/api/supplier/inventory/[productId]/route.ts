import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { adjustSupplierStock } from '@/server/services/supplier-inventory.service';
import { SupplierInventoryUpdateSchema } from '@/lib/validations/supplier';

export async function POST(req: Request, context: { params: Promise<{ productId: string }> }) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await context.params;

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!supplierProfile) {
      return NextResponse.json({ error: 'Supplier profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const parse = SupplierInventoryUpdateSchema.safeParse({
      ...body,
      productId,
    });

    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid stock adjustment parameters', details: parse.error.format() }, { status: 400 });
    }

    const updated = await adjustSupplierStock({
      supplierId: supplierProfile.id,
      productId,
      quantityChange: parse.data.quantityChange,
      reason: parse.data.reason,
      newThreshold: parse.data.newThreshold,
      actorUserId: session.userId,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Adjust stock error:', error);
    return NextResponse.json({ error: error.message || 'Failed to adjust stock' }, { status: 400 });
  }
}
