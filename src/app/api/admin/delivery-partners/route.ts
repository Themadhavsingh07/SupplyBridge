import { NextRequest, NextResponse } from 'next/server';
import { listAdminDeliveryPartners, updateDeliveryPartnerVerificationStatus } from '@/server/services/admin-delivery.service';
import { DeliveryPartnerVerificationActionSchema } from '@/lib/validations/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const isVerified = searchParams.get('isVerified') !== null ? searchParams.get('isVerified') === 'true' : undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await listAdminDeliveryPartners({ isVerified, search, page, limit });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to list delivery partners' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = DeliveryPartnerVerificationActionSchema.parse(body);

    const adminUserId = req.headers.get('x-user-id') || 'usr_admin_default';

    const updated = await updateDeliveryPartnerVerificationStatus(
      adminUserId,
      parsed.deliveryPartnerId,
      parsed.status,
      parsed.rejectionReason,
      parsed.notes
    );

    return NextResponse.json({ deliveryPartner: updated, message: 'Delivery partner verification updated' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update delivery partner' }, { status: 400 });
  }
}
