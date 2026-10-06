import { ActorRole } from './common';

export interface ChatConversationCreatedPayload {
  conversationId: string;
  participantIds: string[];
  conversationType:
    | 'CUSTOMER_SUPPLIER'
    | 'CUSTOMER_DELIVERY'
    | 'CUSTOMER_SUPPORT'
    | 'SUPPLIER_SUPPORT';
  createdAt: string;
}

export interface ChatMessageCreatedPayload {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderRole: ActorRole;
  messageType: 'TEXT' | 'IMAGE' | 'PRODUCT' | 'ORDER' | 'SYSTEM';
  content: string | null;
  attachmentUrl?: string;
  productId?: string;
  orderId?: string;
  createdAt: string;
}

export interface ChatMessageUpdatedPayload {
  messageId: string;
  conversationId: string;
  content: string;
  updatedAt: string;
}

export interface ChatMessageDeletedPayload {
  messageId: string;
  conversationId: string;
  deletedAt: string;
}

export interface ChatMessageReadPayload {
  conversationId: string;
  messageId: string;
  readerId: string;
  readAt: string;
}

export interface ChatTypingStartedPayload {
  conversationId: string;
  userId: string;
}

export interface ChatTypingStoppedPayload {
  conversationId: string;
  userId: string;
}

export interface ChatUserOnlinePayload {
  conversationId: string;
  userId: string;
  onlineAt: string;
}

export interface ChatUserOfflinePayload {
  conversationId: string;
  userId: string;
  offlineAt: string;
}

export interface ChatAttachmentUploadedPayload {
  messageId: string;
  conversationId: string;
  uploaderId: string;
  attachmentType: 'IMAGE' | 'DOCUMENT';
  attachmentUrl: string;
  uploadedAt: string;
}
