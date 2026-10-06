import { NextResponse } from 'next/server';
import { getPersonalizedHomeRecommendations } from '@/lib/ai/ai-recommendations';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || undefined;
    const city = searchParams.get('city') || undefined;
    const productId = searchParams.get('productId') || undefined;
    const category = searchParams.get('category') || undefined;

    const recommendations = await getPersonalizedHomeRecommendations({
      userId,
      city,
      productId,
      category,
    });

    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (err: any) {
    console.error('AI Recommendations error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
