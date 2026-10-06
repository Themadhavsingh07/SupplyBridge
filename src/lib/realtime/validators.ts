import { z } from 'zod';
import { OrderStatus } from '@/types/realtime';

// Actor Roles Schema
export const actorRoleSchema = z.enum([
  'CUSTOMER',
  'SUPPLIER',
  'DELIVERY_PARTNER',
  'ADMIN',
  'SUPPORT_AGENT',
]);

// Base Envelope Schema Generator
export const realtimeEnvelopeSchema = z.object({
  eventId: z.string().min(1),
  eventType: z.string().min(1),
  version: z.number().int().min(1),
  timestamp: z.string().datetime(),
  actorId: z.string().min(1),
  actorRole: actorRoleSchema,
  entityId: z.string().min(1),
  payload: z.record(z.string(), z.any()),
});

// ----------------------------------------------------
// Specific Payload Schemas
// ----------------------------------------------------

export const chatMessageCreatedSchema = z.object({
  messageId: z.string().min(1),
  conversationId: z.string().min(1),
  senderId: z.string().min(1),
  senderRole: actorRoleSchema,
  messageType: z.enum(['TEXT', 'IMAGE', 'PRODUCT', 'ORDER']),
  content: z.string().nullable(),
  attachmentUrl: z.string().url().optional(),
  productId: z.string().optional(),
  orderId: z.string().optional(),
  createdAt: z.string().datetime(),
});

export const chatMessageReadSchema = z.object({
  conversationId: z.string().min(1),
  messageId: z.string().min(1),
  readerId: z.string().min(1),
  readAt: z.string().datetime(),
});

export const chatTypingSchema = z.object({
  conversationId: z.string().min(1),
  userId: z.string().min(1),
});

export const orderCreatedSchema = z.object({
  orderId: z.string().min(1),
  orderNumber: z.string().min(1),
  customerId: z.string().min(1),
  supplierId: z.string().min(1),
  total: z.number().positive(),
  currency: z.literal('INR'),
  status: z.literal('PLACED'),
  createdAt: z.string().datetime(),
});

export const orderStatusEnum = z.enum([
  'PLACED',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'PICKED_UP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
]);

export const orderStatusChangedSchema = z.object({
  orderId: z.string().min(1),
  previousStatus: orderStatusEnum,
  newStatus: orderStatusEnum,
  changedBy: z.string().min(1),
  changedAt: z.string().datetime(),
  reason: z.string().optional(),
});

export const deliveryAssignedSchema = z.object({
  orderId: z.string().min(1),
  deliveryId: z.string().min(1),
  deliveryPartnerId: z.string().min(1),
  assignedAt: z.string().datetime(),
});

export const deliveryStartedSchema = z.object({
  orderId: z.string().min(1),
  deliveryId: z.string().min(1),
  deliveryPartnerId: z.string().min(1),
  startedAt: z.string().datetime(),
});

export const deliveryLocationUpdatedSchema = z.object({
  orderId: z.string().min(1),
  deliveryId: z.string().min(1),
  deliveryPartnerId: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).nullable(),
  heading: z.number().min(0).max(360).nullable(),
  speed: z.number().min(0).nullable(),
  timestamp: z.string().datetime(),
});

export const deliveryCompletedSchema = z.object({
  orderId: z.string().min(1),
  deliveryId: z.string().min(1),
  deliveryPartnerId: z.string().min(1),
  completedAt: z.string().datetime(),
});

export const supplierStatusChangedSchema = z.object({
  supplierId: z.string().min(1),
  status: z.enum(['ONLINE', 'OFFLINE', 'BUSY']),
  changedAt: z.string().datetime(),
});

export const notificationCreatedSchema = z.object({
  notificationId: z.string().min(1),
  recipientId: z.string().min(1),
  type: z.enum([
    'ORDER',
    'CHAT',
    'DELIVERY',
    'PAYMENT',
    'PROMOTION',
    'COMPLAINT',
    'SYSTEM',
  ]),
  title: z.string().min(1),
  message: z.string().min(1),
  entityId: z.string().optional(),
  createdAt: z.string().datetime(),
});

export const paymentStatusChangedSchema = z
  .object({
    paymentId: z.string().min(1),
    orderId: z.string().min(1),
    status: z.enum(['PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED']),
    updatedAt: z.string().datetime(),
  })
  .strict(); // Ensures no extra fields like cardNumber, CVV, or PIN can be included

export const complaintCreatedSchema = z.object({
  complaintId: z.string().min(1),
  orderId: z.string().min(1),
  customerId: z.string().min(1),
  category: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  createdAt: z.string().datetime(),
});

export const complaintStatusChangedSchema = z.object({
  complaintId: z.string().min(1),
  orderId: z.string().min(1),
  previousStatus: z.string().min(1),
  newStatus: z.string().min(1),
  changedBy: z.string().min(1),
  changedAt: z.string().datetime(),
});

// Map of EventType -> Zod Schema
export const payloadSchemasMap: Record<string, z.ZodSchema> = {
  CHAT_MESSAGE_CREATED: chatMessageCreatedSchema,
  CHAT_MESSAGE_READ: chatMessageReadSchema,
  CHAT_TYPING_STARTED: chatTypingSchema,
  CHAT_TYPING_STOPPED: chatTypingSchema,
  ORDER_CREATED: orderCreatedSchema,
  ORDER_STATUS_CHANGED: orderStatusChangedSchema,
  DELIVERY_ASSIGNED: deliveryAssignedSchema,
  DELIVERY_STARTED: deliveryStartedSchema,
  DELIVERY_LOCATION_UPDATED: deliveryLocationUpdatedSchema,
  DELIVERY_COMPLETED: deliveryCompletedSchema,
  SUPPLIER_STATUS_CHANGED: supplierStatusChangedSchema,
  NOTIFICATION_CREATED: notificationCreatedSchema,
  PAYMENT_STATUS_CHANGED: paymentStatusChangedSchema,
  COMPLAINT_CREATED: complaintCreatedSchema,
  COMPLAINT_STATUS_CHANGED: complaintStatusChangedSchema,
};

/**
 * Validates whether an Order Status transition is valid according to business rules.
 */
export function isValidStatusTransition(
  prev: OrderStatus,
  next: OrderStatus
): boolean {
  if (prev === next) return true;
  if (prev === 'CANCELLED' || prev === 'DELIVERED') return false;

  const validNextStates: Record<OrderStatus, OrderStatus[]> = {
    PLACED: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY_FOR_PICKUP', 'CANCELLED'],
    READY_FOR_PICKUP: ['PICKED_UP', 'CANCELLED'],
    PICKED_UP: ['OUT_FOR_DELIVERY', 'CANCELLED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [],
    CANCELLED: [],
  };

  return validNextStates[prev]?.includes(next) ?? false;
}
