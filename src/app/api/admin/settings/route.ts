import { NextRequest, NextResponse } from 'next/server';
import { getSystemSettings, updateSystemSettings } from '@/server/services/admin-settings.service';
import { SystemSettingsSchema } from '@/lib/validations/admin';

export async function GET(req: NextRequest) {
  try {
    const settings = await getSystemSettings();
    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SystemSettingsSchema.parse(body);
    const adminUserId = req.headers.get('x-user-id') || 'usr_admin_default';

    const updated = await updateSystemSettings(adminUserId, parsed);
    return NextResponse.json({ settings: updated, message: 'System settings updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update system settings' }, { status: 400 });
  }
}
