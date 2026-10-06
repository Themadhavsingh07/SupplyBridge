import { NextRequest, NextResponse } from 'next/server';
import { listAdminUsers, updateUserStatusByAdmin } from '@/server/services/admin-user.service';
import { UserStatusUpdateSchema } from '@/lib/validations/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') as any;
    const status = searchParams.get('status') as any;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await listAdminUsers({ role, status, search, page, limit });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to list users' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = UserStatusUpdateSchema.parse(body);

    const adminUserId = req.headers.get('x-user-id') || 'usr_admin_default';

    const updated = await updateUserStatusByAdmin(
      adminUserId,
      parsed.userId,
      parsed.status,
      parsed.reason
    );

    return NextResponse.json({ user: updated, message: 'User status successfully updated' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update user status' }, { status: 400 });
  }
}
