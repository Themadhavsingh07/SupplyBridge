import { NextRequest, NextResponse } from 'next/server';
import { getAdminUserDetails } from '@/server/services/admin-user.service';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getAdminUserDetails(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch user details' }, { status: 500 });
  }
}
