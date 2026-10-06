import { NextResponse } from 'next/server';
import { classifyComplaintAI } from '@/lib/ai/ai-classification';

export async function POST(req: Request) {
  try {
    const { subject, description } = await req.json();

    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const classification = await classifyComplaintAI(subject || '', description);

    return NextResponse.json({
      success: true,
      classification,
    });
  } catch (err: any) {
    console.error('Complaint classification error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
