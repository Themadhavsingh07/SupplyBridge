import { NextResponse } from 'next/server';
import { getAIConfig } from '@/lib/ai/ai-config';

export async function GET() {
  try {
    const config = getAIConfig();

    return NextResponse.json({
      status: 'ok',
      enabled: config.AI_ENABLED,
      available: true,
      providerType: config.AI_PROVIDER,
      features: {
        assistant: config.AI_ASSISTANT,
        smartSearch: config.SMART_SEARCH,
        recommendations: config.AI_RECOMMENDATIONS,
        customerSupport: config.AI_CUSTOMER_SUPPORT,
        analytics: config.AI_ANALYTICS,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', enabled: false, available: false }, { status: 500 });
  }
}
