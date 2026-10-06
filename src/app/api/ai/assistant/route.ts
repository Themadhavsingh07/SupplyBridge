import { NextResponse } from 'next/server';
import { processAiShoppingAssistant } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, budget } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const result = await processAiShoppingAssistant(prompt, budget);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('AI Assistant API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'AI Assistant error' }, { status: 500 });
  }
}
