export interface NotificationCreatedPayload {
  notificationId: string;
  recipientId: string;
  type:
    | 'ORDER'
    | 'CHAT'
    | 'DELIVERY'
    | 'PAYMENT'
    | 'PROMOTION'
    | 'COMPLAINT'
    | 'SYSTEM';
  title: string;
  message: string;
  entityId?: string;
  createdAt: string;
}

export interface NotificationReadPayload {
  notificationId: string;
  userId: string;
  readAt: string;
}

export interface NotificationDeletedPayload {
  notificationId: string;
  userId: string;
  deletedAt: string;
}
