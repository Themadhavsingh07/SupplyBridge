import { NextResponse } from 'next/server';
import { getCurrentUser, clearSessionCookie } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatarUrl,
        isVerified: user.isEmailVerified || user.isPhoneVerified,
        loyaltyPoints: 0,
        cashbackBalance: 0,
        referralCode: user.id,
        supplierId: user.supplierProfile?.id,
        supplier: user.supplierProfile ? {
          id: user.supplierProfile.id,
          businessName: user.supplierProfile.businessName,
          verificationStatus: user.supplierProfile.verificationStatus,
          rating: Number(user.supplierProfile.rating || 5),
        } : null,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user session' }, { status: 500 });
  }
}

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
