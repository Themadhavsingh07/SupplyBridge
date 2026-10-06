import { NextRequest, NextResponse } from 'next/server';
import { generateAIAnalyticsInsights } from '@/lib/ai/ai-analytics';

export async function GET(req: NextRequest) {
  try {
    const result = await generateAIAnalyticsInsights();
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Admin AI Insights API error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to generate AI insights' }, { status: 500 });
  }
}
