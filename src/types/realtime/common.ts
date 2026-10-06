export type ActorRole =
  | 'CUSTOMER'
  | 'SUPPLIER'
  | 'DELIVERY_PARTNER'
  | 'ADMIN'
  | 'SUPPORT_AGENT';

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type RealtimeConnectionStatus =
  | 'CONNECTED'
  | 'CONNECTING'
  | 'DISCONNECTED'
  | 'ERROR';

/**
 * Standard Envelope for ALL Realtime Events in SupplyBridge.
 */
export type RealtimeEvent<
  TEventType extends string,
  TPayload
> = {
  eventId: string;
  eventType: TEventType;
  version: 1;
  timestamp: string; // ISO 8601
  actorId: string;
  actorRole: ActorRole;
  entityId: string;
  payload: TPayload;
};
