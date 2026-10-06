import { prisma } from '@/lib/prisma';
import { publishEventWithOutbox } from '@/lib/realtime/outbox';
import { RealtimeChannels } from '@/lib/realtime/channel-registry';
import { ActorRole } from '@/types/realtime';

interface SendChatMessageInput {
  conversationId: string;
  senderId: string;
  senderRole: ActorRole;
  text: string;
  messageType?: 'TEXT' | 'IMAGE' | 'PRODUCT' | 'ORDER' | 'SYSTEM';
  attachmentUrl?: string;
  productId?: string;
  orderId?: string;
}

export async function createChatMessage(input: SendChatMessageInput) {
  // 1. Authorize conversation membership via ConversationParticipant or SupplierProfile
  const conversation = await prisma.conversation.findUnique({
    where: { id: input.conversationId },
    include: {
      supplier: true,
      participants: true,
    },
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const isParticipant = conversation.participants.some((p) => p.userId === input.senderId);
  const isSupplierOwner = conversation.supplier?.userId === input.senderId;
  const isAdmin = input.senderRole === 'ADMIN' || input.senderRole === 'SUPPORT_AGENT';

  if (!isParticipant && !isSupplierOwner && !isAdmin) {
    throw new Error('Forbidden: You are not a participant of this conversation');
  }

  // 2. Prisma Database Transaction (Source of Truth)
  const now = new Date();
  const messageRecord = await prisma.message.create({
    data: {
      conversationId: input.conversationId,
      senderId: input.senderId,
      messageType: (input.messageType as any) || 'TEXT',
      content: input.text,
      attachmentUrl: input.attachmentUrl || null,
      productId: input.productId || null,
      orderId: input.orderId || null,
      createdAt: now,
      updatedAt: now,
    },
  });

  // Update conversation timestamp
  await prisma.conversation.update({
    where: { id: input.conversationId },
    data: {
      updatedAt: now,
    },
  });

  // 3. Outbox Event Persistence + Realtime Publish
  const channelName = RealtimeChannels.conversation(input.conversationId);
  const outboxResult = await publishEventWithOutbox({
    eventType: 'CHAT_MESSAGE_CREATED',
    actorId: input.senderId,
    actorRole: input.senderRole,
    entityId: messageRecord.id,
    channelName,
    payload: {
      messageId: messageRecord.id,
      conversationId: input.conversationId,
      senderId: input.senderId,
      senderRole: input.senderRole,
      messageType: (input.messageType as any) || 'TEXT',
      content: input.text,
      attachmentUrl: input.attachmentUrl,
      productId: input.productId,
      orderId: input.orderId,
      createdAt: now.toISOString(),
    },
  });

  return {
    message: messageRecord,
    eventId: outboxResult.logRecord.eventId,
  };
}

export async function getChatHistory(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      supplier: true,
      participants: true,
    },
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const isParticipant = conversation.participants.some((p) => p.userId === userId);
  const isSupplierOwner = conversation.supplier?.userId === userId;

  if (!isParticipant && !isSupplierOwner) {
    throw new Error('Forbidden');
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      isDeleted: false,
    },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });

  return { conversation, messages };
}
