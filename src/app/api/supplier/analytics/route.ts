import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import {
  getSupplierDashboardMetrics,
  getSupplierAnalytics,
} from '@/server/services/supplier-analytics.service';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!supplierProfile) {
      return NextResponse.json({ error: 'Supplier profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const range = (searchParams.get('range') as any) || '30d';

    const [kpis, analytics] = await Promise.all([
      getSupplierDashboardMetrics(supplierProfile.id),
      getSupplierAnalytics(supplierProfile.id, range),
    ]);

    return NextResponse.json({
      success: true,
      kpis,
      analytics,
    });
  } catch (error) {
    console.error('Fetch supplier analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
