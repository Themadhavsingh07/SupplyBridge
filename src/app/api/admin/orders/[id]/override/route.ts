import { NextRequest, NextResponse } from 'next/server';
import { overrideOrderStatusByAdmin } from '@/server/services/admin-order.service';
import { OrderOverrideSchema } from '@/lib/validations/admin';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const parsed = OrderOverrideSchema.parse({ ...body, orderId: id });
    const adminUserId = req.headers.get('x-user-id') || 'usr_admin_default';

    const updated = await overrideOrderStatusByAdmin(
      adminUserId,
      id,
      parsed.newStatus,
      parsed.reason
    );

    return NextResponse.json({ order: updated, message: 'Order status overridden successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to override order status' }, { status: 400 });
  }
}
