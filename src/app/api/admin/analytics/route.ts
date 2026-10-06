import { NextRequest, NextResponse } from 'next/server';
import { getAdminDashboardStats, getAdminAnalyticsData } from '@/server/services/admin-analytics.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'monthly';

    const [stats, analytics] = await Promise.all([
      getAdminDashboardStats(),
      getAdminAnalyticsData(range),
    ]);

    return NextResponse.json({ stats, analytics });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch admin analytics' }, { status: 500 });
  }
}
