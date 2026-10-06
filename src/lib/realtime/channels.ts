/**
 * SUPPLYBRIDGE — PRIVATE REALTIME CHANNELS
 * Centralized private channel naming conventions.
 * Never use one single global channel for sensitive application events.
 */

export const RealtimeChannels = {
  /**
   * Private Chat Conversation Channel
   * Allowed: Participants (Customer, Supplier) of the conversation.
   */
  conversation: (conversationId: string) => `conversation:${conversationId}`,

  /**
   * Private Order Live GPS Tracking Channel
   * Allowed: Customer of order, assigned Delivery Partner, Supplier of order, Admin.
   */
  orderTracking: (orderId: string) => `order:${orderId}:tracking`,

  /**
   * Private Order Status Channel
   * Allowed: Customer, Supplier, Delivery Partner, Admin.
   */
  orderStatus: (orderId: string) => `order:${orderId}:status`,

  /**
   * Private User Notification Channel
   * Allowed: The recipient user only.
   */
  userNotifications: (userId: string) => `user:${userId}:notifications`,

  /**
   * Private Supplier Events Channel
   * Allowed: Supplier store owner, Admin.
   */
  supplierEvents: (supplierId: string) => `supplier:${supplierId}:events`,
};

/**
 * Parses channel string to extract entity type and ID for authorization checks.
 */
export function parseChannel(channelName: string): { type: string; id: string; subTopic?: string } | null {
  const parts = channelName.split(':');
  if (parts.length === 2) {
    return { type: parts[0], id: parts[1] };
  } else if (parts.length === 3) {
    return { type: parts[0], id: parts[1], subTopic: parts[2] };
  }
  return null;
}
