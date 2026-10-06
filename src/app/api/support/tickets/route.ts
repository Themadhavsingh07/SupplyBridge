import { NextRequest, NextResponse } from 'next/server';
import { listSupportTickets } from '@/server/services/admin-support.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as any;
    const priority = searchParams.get('priority') as any;
    const assignedToId = searchParams.get('assignedToId') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await listSupportTickets({ status, priority, assignedToId, search, page, limit });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to list support tickets' }, { status: 500 });
  }
}
