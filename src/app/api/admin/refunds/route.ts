import { NextRequest, NextResponse } from 'next/server';
import { processAdminRefund } from '@/server/services/admin-refund.service';
import { RefundRequestSchema } from '@/lib/validations/admin';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const refunds = await prisma.refund.findMany({
      include: {
        payment: {
          select: {
            id: true,
            method: true,
            status: true,
            order: { select: { id: true, orderNumber: true, customer: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ refunds });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to list refunds' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RefundRequestSchema.parse(body);
    const adminUserId = req.headers.get('x-user-id') || 'usr_admin_default';

    const result = await processAdminRefund({
      adminUserId,
      orderId: parsed.orderId,
      amount: parsed.amount,
      reason: parsed.reason,
      refundType: parsed.refundType,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to process refund' }, { status: 400 });
  }
}
