import { NextRequest, NextResponse } from 'next/server';
import { listAdminOrders } from '@/server/services/admin-order.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as any;
    const supplierId = searchParams.get('supplierId') || undefined;
    const customerId = searchParams.get('customerId') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await listAdminOrders({ status, supplierId, customerId, search, page, limit });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to list admin orders' }, { status: 500 });
  }
}
