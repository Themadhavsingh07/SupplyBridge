import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { createChatMessage } from '@/lib/services/chat-service';
import { z } from 'zod';

const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  text: z.string().min(1),
  imageAttachment: z.string().optional(),
  productAttachmentId: z.string().optional(),
  orderAttachmentId: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        supplier: true,
        order: true,
        participants: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true, role: true } },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId, isDeleted: false },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, name: true, role: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json({
      conversation,
      messages,
    });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parse = sendMessageSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid message content' }, { status: 400 });
    }

    const { conversationId, text, imageAttachment, productAttachmentId, orderAttachmentId } = parse.data;

    const chatResult = await createChatMessage({
      conversationId,
      senderId: session.userId,
      senderRole: (session.role as any) || 'CUSTOMER',
      text,
      attachmentUrl: imageAttachment,
      productId: productAttachmentId,
      orderId: orderAttachmentId,
    });

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { supplier: true, participants: true },
    });

    if (conversation) {
      const recipientParticipant = conversation.participants.find((p) => p.userId !== session.userId);
      const recipientUserId = recipientParticipant?.userId || conversation.supplier?.userId;

      if (recipientUserId) {
        await createNotification({
          userId: recipientUserId,
          title: `New message 💬`,
          body: text.slice(0, 80),
          type: 'CHAT',
          linkUrl: `/messages/${conversationId}`,
        });
      }
    }

    return NextResponse.json({ success: true, message: chatResult.message, eventId: chatResult.eventId });
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send message' }, { status: 500 });
  }
}
