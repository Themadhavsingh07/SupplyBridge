import { NextResponse } from 'next/server';
import { processAISupportQuery } from '@/lib/ai/ai-support';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { message, userId, orderId, complaintId, conversationId } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const aiResult = await processAISupportQuery({
      message,
      userId,
      orderId,
      complaintId,
    });

    let convId = conversationId;
    if (userId) {
      try {
        if (!convId) {
          const newConv = await prisma.aIConversation.create({
            data: {
              userId,
              title: message.slice(0, 50),
              type: 'CUSTOMER_SUPPORT',
              isEscalated: aiResult.escalateToHuman,
            },
          });
          convId = newConv.id;
        } else if (aiResult.escalateToHuman) {
          await prisma.aIConversation.update({
            where: { id: convId },
            data: { isEscalated: true },
          });
        }

        // Record User Message
        await prisma.aIMessage.create({
          data: {
            conversationId: convId,
            role: 'user',
            content: message,
          },
        });

        // Record Assistant Message
        await prisma.aIMessage.create({
          data: {
            conversationId: convId,
            role: 'assistant',
            content: aiResult.response,
            toolCalls: aiResult.toolResults as any,
          },
        });
      } catch (dbErr) {
        console.warn('AI Conversation DB log warn:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      conversationId: convId,
      ...aiResult,
    });
  } catch (err: any) {
    console.error('AI Support API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
