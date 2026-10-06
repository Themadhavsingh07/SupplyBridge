import { NextRequest, NextResponse } from 'next/server';
import { getAdminFinancials } from '@/server/services/admin-analytics.service';

export async function GET(req: NextRequest) {
  try {
    const financials = await getAdminFinancials();
    return NextResponse.json({ financials });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch financial analytics' }, { status: 500 });
  }
}
