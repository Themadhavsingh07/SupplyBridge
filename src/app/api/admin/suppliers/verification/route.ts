import { NextRequest, NextResponse } from 'next/server';
import { listAdminSuppliers } from '@/server/services/admin-supplier.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // List all suppliers pending or under review for verification queue
    const result = await listAdminSuppliers({ verificationStatus: 'PENDING', page, limit });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch verification queue' }, { status: 500 });
  }
}
