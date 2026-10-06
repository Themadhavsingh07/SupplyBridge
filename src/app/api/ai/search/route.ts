import { NextRequest, NextResponse } from 'next/server';
import { extractSearchIntentWithAI, searchIntentSchema } from '@/lib/ai/ai-search';
import { executeSearch } from '@/server/services/search.service';
import { isAIFeatureEnabled } from '@/lib/ai/ai-config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, latitude, longitude } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const location =
      typeof latitude === 'number' && typeof longitude === 'number'
        ? { lat: latitude, lng: longitude }
        : undefined;

    // Extract search intent via AI (or deterministic fallback if AI is disabled or fails)
    const intent = await extractSearchIntentWithAI(query, location);
    const validatedIntent = searchIntentSchema.parse(intent);

    const searchResult = await executeSearch(validatedIntent);

    return NextResponse.json({
      success: true,
      rawQuery: query,
      aiEnabled: isAIFeatureEnabled('SMART_SEARCH'),
      extractedIntent: validatedIntent,
      ...searchResult,
    });
  } catch (err: any) {
    console.error('POST /api/ai/search error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Smart search failed' },
      { status: 500 }
    );
  }
}
