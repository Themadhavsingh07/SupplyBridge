import { NextRequest, NextResponse } from 'next/server';
import { listAdminSuppliers, updateSupplierVerificationStatus } from '@/server/services/admin-supplier.service';
import { SupplierVerificationActionSchema } from '@/lib/validations/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const verificationStatus = searchParams.get('verificationStatus') as any;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await listAdminSuppliers({ verificationStatus, search, page, limit });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to list suppliers' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SupplierVerificationActionSchema.parse(body);

    const adminUserId = req.headers.get('x-user-id') || 'usr_admin_default';

    const updated = await updateSupplierVerificationStatus(
      adminUserId,
      parsed.supplierId,
      parsed.status,
      parsed.rejectionReason,
      parsed.notes
    );

    return NextResponse.json({ supplier: updated, message: 'Supplier verification status updated' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update supplier status' }, { status: 400 });
  }
}
