import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const createConvSchema = z.object({
  supplierId: z.string().optional(),
  orderId: z.string().optional(),
  initialMessage: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userParticipantConvs = await prisma.conversationParticipant.findMany({
      where: { userId: session.userId },
      select: { conversationId: true },
    });

    const convIds = userParticipantConvs.map((p) => p.conversationId);

    const conversations = await prisma.conversation.findMany({
      where: { id: { in: convIds } },
      include: {
        supplier: true,
        order: true,
        participants: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true, role: true } },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formatted = conversations.map((c) => {
      const lastMsg = c.messages[0];
      const otherParticipant = c.participants.find((p) => p.userId !== session.userId)?.user;

      return {
        id: c.id,
        type: c.type,
        title: c.title || c.supplier?.businessName || otherParticipant?.name || 'Chat',
        supplierId: c.supplierId,
        supplierName: c.supplier?.businessName,
        orderId: c.orderId,
        orderNumber: c.order?.orderNumber,
        orderStatus: c.order?.status,
        lastMessageText: lastMsg?.content || 'No messages yet',
        lastMessageAt: lastMsg?.createdAt || c.updatedAt,
        otherParticipant,
      };
    });

    return NextResponse.json({ conversations: formatted });
  } catch (error) {
    console.error('Fetch conversations error:', error);
    return NextResponse.json({ error: 'Failed to fetch chat threads' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Please log in to contact supplier.' }, { status: 401 });
    }

    const body = await req.json();
    const parse = createConvSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { supplierId, orderId, initialMessage } = parse.data;

    let conversation = await prisma.conversation.findFirst({
      where: {
        orderId: orderId || undefined,
        supplierId: supplierId || undefined,
        participants: {
          some: { userId: session.userId },
        },
      },
      include: {
        supplier: true,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          type: orderId ? 'ORDER' : 'CUSTOMER_SUPPLIER',
          supplierId: supplierId || null,
          orderId: orderId || null,
          title: 'Direct Support Chat',
          participants: {
            create: [
              { userId: session.userId },
              ...(supplierId ? [] : []),
            ],
          },
        },
        include: {
          supplier: true,
        },
      });
    }

    if (initialMessage) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.userId,
          messageType: 'TEXT',
          content: initialMessage,
        },
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      supplierName: conversation.supplier?.businessName || 'Supplier',
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json({ error: 'Failed to initiate conversation' }, { status: 500 });
  }
}
