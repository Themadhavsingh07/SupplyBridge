import { NextRequest, NextResponse } from 'next/server';
import { listAdminReviews, moderateReview } from '@/server/services/admin-review.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await listAdminReviews({ search, page, limit });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to list reviews' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { reviewId, action } = body; // action: 'HIDE' | 'RESTORE'
    const adminUserId = req.headers.get('x-user-id') || 'usr_admin_default';

    const result = await moderateReview(adminUserId, reviewId, action);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to moderate review' }, { status: 400 });
  }
}
