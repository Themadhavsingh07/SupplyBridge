import { NextResponse } from 'next/server';
import { processAiShoppingAssistant } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, maxBudget } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const result = await processAiShoppingAssistant(prompt, maxBudget);
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Shopping error:', error);
    return NextResponse.json({ error: 'AI Assistant failed to generate recommendations' }, { status: 500 });
  }
}
