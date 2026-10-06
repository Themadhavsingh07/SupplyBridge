import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { listSupplierInventory } from '@/server/services/supplier-inventory.service';

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
    const search = searchParams.get('search') || undefined;
    const stockFilter = (searchParams.get('stockFilter') as any) || 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await listSupplierInventory({
      supplierId: supplierProfile.id,
      search,
      stockFilter,
      page,
      limit,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Fetch inventory error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}
