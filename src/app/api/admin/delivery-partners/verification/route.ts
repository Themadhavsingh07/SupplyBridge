import { NextRequest, NextResponse } from 'next/server';
import { listAdminDeliveryPartners } from '@/server/services/admin-delivery.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await listAdminDeliveryPartners({ isVerified: false, page, limit });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch unverified delivery partners' }, { status: 500 });
  }
}
