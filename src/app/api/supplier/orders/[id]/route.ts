import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getSupplierOrderById, processSupplierOrderAction } from '@/server/services/supplier-order.service';
import { SupplierOrderActionSchema } from '@/lib/validations/supplier';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!supplierProfile) {
      return NextResponse.json({ error: 'Supplier profile not found' }, { status: 404 });
    }

    const order = await getSupplierOrderById(supplierProfile.id, id);
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Order not found' }, { status: 404 });
  }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!supplierProfile) {
      return NextResponse.json({ error: 'Supplier profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const parse = SupplierOrderActionSchema.safeParse({
      ...body,
      orderId: id,
    });

    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid order action payload', details: parse.error.format() }, { status: 400 });
    }

    const result = await processSupplierOrderAction({
      supplierId: supplierProfile.id,
      orderId: id,
      action: parse.data.action,
      reason: parse.data.cancellationReason,
      actorUserId: session.userId,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Supplier order action error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process order action' }, { status: 400 });
  }
}
