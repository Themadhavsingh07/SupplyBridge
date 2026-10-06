import { NextRequest, NextResponse } from 'next/server';
import { listAdminCoupons, createAdminCoupon, toggleCouponStatus } from '@/server/services/admin-coupon.service';
import { CouponCreateSchema } from '@/lib/validations/admin';

export async function GET(req: NextRequest) {
  try {
    const coupons = await listAdminCoupons();
    return NextResponse.json({ coupons });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to list coupons' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CouponCreateSchema.parse(body);
    const adminUserId = req.headers.get('x-user-id') || 'usr_admin_default';

    const coupon = await createAdminCoupon(adminUserId, parsed);
    return NextResponse.json({ coupon, message: 'Coupon created successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create coupon' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { couponId, isActive } = body;
    const adminUserId = req.headers.get('x-user-id') || 'usr_admin_default';

    const coupon = await toggleCouponStatus(adminUserId, couponId, isActive);
    return NextResponse.json({ coupon, message: `Coupon ${isActive ? 'activated' : 'deactivated'}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update coupon status' }, { status: 400 });
  }
}
