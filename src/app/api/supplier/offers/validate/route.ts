import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { validateAndCalculateCoupon } from '@/server/services/supplier-offer.service';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { code, subtotal, supplierId } = body;

    if (!code || typeof subtotal !== 'number') {
      return NextResponse.json({ error: 'Coupon code and subtotal required' }, { status: 400 });
    }

    const result = await validateAndCalculateCoupon({
      code,
      subtotal,
      supplierId,
      userId: session?.userId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Validate coupon error:', error);
    return NextResponse.json({ valid: false, error: 'Coupon validation failed' }, { status: 500 });
  }
}
