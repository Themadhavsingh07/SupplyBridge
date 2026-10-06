import { RealtimeEventType } from '@/types/realtime';

export const ChannelFormats = {
  conversation: (conversationId: string) => `conversation:${conversationId}`,
  orderTracking: (orderId: string) => `order:${orderId}:tracking`,
  orderStatus: (orderId: string) => `order:${orderId}:status`,
  userNotifications: (userId: string) => `user:${userId}:notifications`,
  supplierEvents: (supplierId: string) => `supplier:${supplierId}:events`,
  complaint: (complaintId: string) => `complaint:${complaintId}`,
  system: () => `system:announcements`,
  adminEvents: () => `admin:events`,
};

export const RealtimeChannels = ChannelFormats;

/**
 * Returns the appropriate target private channel name for a given event type and payload.
 */
export function getChannelForEvent(eventType: RealtimeEventType, payload: any): string {
  if (eventType.startsWith('CHAT_')) {
    if (payload.conversationId) return ChannelFormats.conversation(payload.conversationId);
  }

  if (eventType === 'DELIVERY_LOCATION_UPDATED' || eventType === 'DELIVERY_LOCATION_STALE' || eventType === 'DELIVERY_STARTED') {
    if (payload.orderId) return ChannelFormats.orderTracking(payload.orderId);
  }

  if (eventType.startsWith('ORDER_') || eventType.startsWith('DELIVERY_') || eventType.startsWith('PAYMENT_')) {
    if (payload.orderId) return ChannelFormats.orderStatus(payload.orderId);
  }

  if (eventType.startsWith('NOTIFICATION_')) {
    if (payload.recipientId || payload.userId) return ChannelFormats.userNotifications(payload.recipientId || payload.userId);
  }

  if (eventType.startsWith('SUPPLIER_') || eventType.startsWith('PRODUCT_') || eventType.startsWith('INVENTORY_')) {
    if (payload.supplierId) return ChannelFormats.supplierEvents(payload.supplierId);
  }

  if (eventType.startsWith('COMPLAINT_')) {
    if (payload.complaintId) return ChannelFormats.complaint(payload.complaintId);
  }

  if (eventType.startsWith('SYSTEM_')) {
    return ChannelFormats.system();
  }

  if (payload.userId) {
    return ChannelFormats.userNotifications(payload.userId);
  }

  return `general:events`;
}
