import { NextRequest, NextResponse } from 'next/server';
import { globalAdminSearch } from '@/server/services/admin-search.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    const results = await globalAdminSearch(q);
    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to search admin records' }, { status: 500 });
  }
}
