import { z } from 'zod';
import { actorRoleSchema, orderStatusEnum } from './validators';

export const realtimeEnvelopeSchema = z.object({
  eventId: z.string().min(1),
  eventType: z.string().min(1),
  version: z.literal(1),
  timestamp: z.string().datetime(),
  actorId: z.string().min(1),
  actorRole: actorRoleSchema,
  entityId: z.string().min(1),
  payload: z.record(z.string(), z.any()),
});

// ----------------------------------------------------
// Category Schemas
// ----------------------------------------------------

// Chat Schemas
export const chatConversationCreatedSchema = z.object({
  conversationId: z.string().min(1),
  participantIds: z.array(z.string().min(1)),
  conversationType: z.enum([
    'CUSTOMER_SUPPLIER',
    'CUSTOMER_DELIVERY',
    'CUSTOMER_SUPPORT',
    'SUPPLIER_SUPPORT',
  ]),
  createdAt: z.string().datetime(),
});

export const chatMessageCreatedSchema = z.object({
  messageId: z.string().min(1),
  conversationId: z.string().min(1),
  senderId: z.string().min(1),
  senderRole: actorRoleSchema,
  messageType: z.enum(['TEXT', 'IMAGE', 'PRODUCT', 'ORDER', 'SYSTEM']),
  content: z.string().nullable(),
  attachmentUrl: z.string().url().optional(),
  productId: z.string().optional(),
  orderId: z.string().optional(),
  createdAt: z.string().datetime(),
});

export const chatMessageUpdatedSchema = z.object({
  messageId: z.string().min(1),
  conversationId: z.string().min(1),
  content: z.string(),
  updatedAt: z.string().datetime(),
});

export const chatMessageDeletedSchema = z.object({
  messageId: z.string().min(1),
  conversationId: z.string().min(1),
  deletedAt: z.string().datetime(),
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

export const chatUserPresenceSchema = z.object({
  conversationId: z.string().min(1),
  userId: z.string().min(1),
  onlineAt: z.string().datetime().optional(),
  offlineAt: z.string().datetime().optional(),
});

export const chatAttachmentUploadedSchema = z.object({
  messageId: z.string().min(1),
  conversationId: z.string().min(1),
  uploaderId: z.string().min(1),
  attachmentType: z.enum(['IMAGE', 'DOCUMENT']),
  attachmentUrl: z.string().url(),
  uploadedAt: z.string().datetime(),
});

// Order Schemas
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

export const orderStatusChangedSchema = z.object({
  orderId: z.string().min(1),
  previousStatus: orderStatusEnum,
  newStatus: orderStatusEnum,
  changedBy: z.string().min(1),
  changedAt: z.string().datetime(),
  reason: z.string().optional(),
});

export const orderSimpleTimestampSchema = z.object({
  orderId: z.string().min(1),
  supplierId: z.string().optional(),
  deliveryPartnerId: z.string().optional(),
  confirmedAt: z.string().datetime().optional(),
  startedAt: z.string().datetime().optional(),
  readyAt: z.string().datetime().optional(),
  pickedUpAt: z.string().datetime().optional(),
  deliveredAt: z.string().datetime().optional(),
});

export const orderCancelledSchema = z.object({
  orderId: z.string().min(1),
  cancelledBy: z.string().min(1),
  reason: z.string().min(1),
  cancelledAt: z.string().datetime(),
});

export const orderItemAddedSchema = z.object({
  orderId: z.string().min(1),
  orderItemId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().positive(),
});

export const orderItemRemovedSchema = z.object({
  orderId: z.string().min(1),
  orderItemId: z.string().min(1),
  productId: z.string().min(1),
});

export const orderUpdatedSchema = z.object({
  orderId: z.string().min(1),
  updatedFields: z.array(z.string()),
  updatedAt: z.string().datetime(),
});

// Delivery Schemas
export const deliveryAssignedSchema = z.object({
  orderId: z.string().min(1),
  deliveryId: z.string().min(1),
  deliveryPartnerId: z.string().min(1),
  assignedAt: z.string().datetime(),
});

export const deliveryUnassignedSchema = z.object({
  orderId: z.string().min(1),
  deliveryId: z.string().min(1),
  deliveryPartnerId: z.string().min(1),
  reason: z.string().optional(),
});

export const deliveryAcceptedSchema = z.object({
  orderId: z.string().min(1),
  deliveryId: z.string().min(1),
  deliveryPartnerId: z.string().min(1),
  acceptedAt: z.string().datetime(),
});

export const deliveryRejectedSchema = z.object({
  orderId: z.string().min(1),
  deliveryId: z.string().min(1),
  deliveryPartnerId: z.string().min(1),
  reason: z.string().optional(),
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

export const deliveryLocationStaleSchema = z.object({
  orderId: z.string().min(1),
  deliveryId: z.string().min(1),
  deliveryPartnerId: z.string().min(1),
  lastKnownAt: z.string().datetime(),
  staleSince: z.string().datetime(),
});

export const deliveryArrivedAtSupplierSchema = z.object({
  orderId: z.string().min(1),
  deliveryId: z.string().min(1),
  deliveryPartnerId: z.string().min(1),
  arrivedAt: z.string().datetime(),
});

export const deliveryPickupConfirmedSchema = z.object({
  orderId: z.string().min(1),
  deliveryId: z.string().min(1),
  deliveryPartnerId: z.string().min(1),
  confirmedAt: z.string().datetime(),
});

export const deliveryArrivedAtCustomerSchema = z.object({
  orderId: z.string().min(1),
  deliveryId: z.string().min(1),
  deliveryPartnerId: z.string().min(1),
  arrivedAt: z.string().datetime(),
});

export const deliveryOtpVerifiedSchema = z.object({
  orderId: z.string().min(1),
  deliveryId: z.string().min(1),
  verifiedAt: z.string().datetime(),
});

export const deliveryCompletedSchema = z.object({
  orderId: z.string().min(1),
  deliveryId: z.string().min(1),
  deliveryPartnerId: z.string().min(1),
  completedAt: z.string().datetime(),
});

export const deliveryFailedSchema = z.object({
  orderId: z.string().min(1),
  deliveryId: z.string().min(1),
  reason: z.string().min(1),
  failedAt: z.string().datetime(),
});

export const deliveryCancelledSchema = z.object({
  orderId: z.string().min(1),
  deliveryId: z.string().min(1),
  cancelledBy: z.string().min(1),
  reason: z.string().min(1),
  cancelledAt: z.string().datetime(),
});

// Supplier Schemas
export const supplierCreatedSchema = z.object({
  supplierId: z.string().min(1),
  businessName: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const supplierVerificationSubmittedSchema = z.object({
  supplierId: z.string().min(1),
  submittedAt: z.string().datetime(),
});

export const supplierVerifiedSchema = z.object({
  supplierId: z.string().min(1),
  verifiedAt: z.string().datetime(),
  verifiedBy: z.string().min(1),
});

export const supplierRejectedSchema = z.object({
  supplierId: z.string().min(1),
  rejectedAt: z.string().datetime(),
  rejectedBy: z.string().min(1),
  reason: z.string().min(1),
});

export const supplierSuspendedSchema = z.object({
  supplierId: z.string().min(1),
  suspendedAt: z.string().datetime(),
  suspendedBy: z.string().min(1),
  reason: z.string().min(1),
});

export const supplierPresenceSchema = z.object({
  supplierId: z.string().min(1),
  changedAt: z.string().datetime(),
});

export const supplierStatusChangedSchema = z.object({
  supplierId: z.string().min(1),
  previousStatus: z.enum(['ONLINE', 'OFFLINE', 'BUSY']),
  newStatus: z.enum(['ONLINE', 'OFFLINE', 'BUSY']),
  changedAt: z.string().datetime(),
});

// Inventory Schemas
export const productCreatedSchema = z.object({
  productId: z.string().min(1),
  supplierId: z.string().min(1),
  categoryId: z.string().min(1),
  name: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const productUpdatedSchema = z.object({
  productId: z.string().min(1),
  supplierId: z.string().min(1),
  updatedFields: z.array(z.string()),
  updatedAt: z.string().datetime(),
});

export const productDeletedSchema = z.object({
  productId: z.string().min(1),
  supplierId: z.string().min(1),
  deletedAt: z.string().datetime(),
});

export const productStateSchema = z.object({
  productId: z.string().min(1),
  supplierId: z.string().min(1),
  activatedAt: z.string().datetime().optional(),
  deactivatedAt: z.string().datetime().optional(),
});

export const inventoryUpdatedSchema = z.object({
  productId: z.string().min(1),
  supplierId: z.string().min(1),
  previousQuantity: z.number().min(0),
  newQuantity: z.number().min(0),
  changedAt: z.string().datetime(),
});

export const inventoryLowStockSchema = z.object({
  productId: z.string().min(1),
  supplierId: z.string().min(1),
  currentQuantity: z.number().min(0),
  threshold: z.number().min(0),
  detectedAt: z.string().datetime(),
});

export const inventoryOutOfStockSchema = z.object({
  productId: z.string().min(1),
  supplierId: z.string().min(1),
  detectedAt: z.string().datetime(),
});

export const inventoryRestockedSchema = z.object({
  productId: z.string().min(1),
  supplierId: z.string().min(1),
  previousQuantity: z.number().min(0),
  newQuantity: z.number().min(0),
  restockedAt: z.string().datetime(),
});

// Payment Schemas
export const paymentCreatedSchema = z.object({
  paymentId: z.string().min(1),
  orderId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.literal('INR'),
  createdAt: z.string().datetime(),
});

export const paymentPendingSchema = z.object({
  paymentId: z.string().min(1),
  orderId: z.string().min(1),
  updatedAt: z.string().datetime(),
});

export const paymentAuthorizedSchema = z.object({
  paymentId: z.string().min(1),
  orderId: z.string().min(1),
  updatedAt: z.string().datetime(),
});

export const paymentPaidSchema = z.object({
  paymentId: z.string().min(1),
  orderId: z.string().min(1),
  amount: z.number().positive(),
  paidAt: z.string().datetime(),
});

export const paymentFailedSchema = z.object({
  paymentId: z.string().min(1),
  orderId: z.string().min(1),
  reason: z.string().optional(),
  failedAt: z.string().datetime(),
});

export const paymentRefundedSchema = z.object({
  paymentId: z.string().min(1),
  orderId: z.string().min(1),
  refundAmount: z.number().positive(),
  refundedAt: z.string().datetime(),
});

export const paymentPartiallyRefundedSchema = z.object({
  paymentId: z.string().min(1),
  orderId: z.string().min(1),
  refundAmount: z.number().positive(),
  remainingAmount: z.number().min(0),
  refundedAt: z.string().datetime(),
});

export const paymentStatusChangedSchema = z
  .object({
    paymentId: z.string().min(1),
    orderId: z.string().min(1),
    previousStatus: z.enum([
      'PENDING',
      'AUTHORIZED',
      'PAID',
      'FAILED',
      'REFUNDED',
      'PARTIALLY_REFUNDED',
    ]),
    newStatus: z.enum([
      'PENDING',
      'AUTHORIZED',
      'PAID',
      'FAILED',
      'REFUNDED',
      'PARTIALLY_REFUNDED',
    ]),
    updatedAt: z.string().datetime(),
  })
  .strict();

// Notification Schemas
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

export const notificationReadSchema = z.object({
  notificationId: z.string().min(1),
  userId: z.string().min(1),
  readAt: z.string().datetime(),
});

export const notificationDeletedSchema = z.object({
  notificationId: z.string().min(1),
  userId: z.string().min(1),
  deletedAt: z.string().datetime(),
});

// Complaint Schemas
export const complaintCreatedSchema = z.object({
  complaintId: z.string().min(1),
  orderId: z.string().min(1),
  customerId: z.string().min(1),
  category: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  createdAt: z.string().datetime(),
});

export const complaintAssignedSchema = z.object({
  complaintId: z.string().min(1),
  assignedTo: z.string().min(1),
  assignedAt: z.string().datetime(),
});

export const complaintStatusChangedSchema = z.object({
  complaintId: z.string().min(1),
  previousStatus: z.string().min(1),
  newStatus: z.string().min(1),
  changedBy: z.string().min(1),
  changedAt: z.string().datetime(),
});

export const complaintMessageCreatedSchema = z.object({
  complaintId: z.string().min(1),
  messageId: z.string().min(1),
  senderId: z.string().min(1),
  senderRole: actorRoleSchema,
  content: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const complaintResolvedSchema = z.object({
  complaintId: z.string().min(1),
  resolvedBy: z.string().min(1),
  resolution: z.string().min(1),
  resolvedAt: z.string().datetime(),
});

export const complaintReopenedSchema = z.object({
  complaintId: z.string().min(1),
  reopenedBy: z.string().min(1),
  reason: z.string().min(1),
  reopenedAt: z.string().datetime(),
});

// User Schemas
export const userProfileUpdatedSchema = z.object({
  userId: z.string().min(1),
  updatedFields: z.array(z.string()),
  updatedAt: z.string().datetime(),
});

export const userStatusChangedSchema = z.object({
  userId: z.string().min(1),
  previousStatus: z.enum(['ACTIVE', 'INACTIVE']),
  newStatus: z.enum(['ACTIVE', 'INACTIVE']),
  changedAt: z.string().datetime(),
});

export const userSuspendedSchema = z.object({
  userId: z.string().min(1),
  suspendedBy: z.string().min(1),
  reason: z.string().min(1),
  suspendedAt: z.string().datetime(),
});

export const userReactivatedSchema = z.object({
  userId: z.string().min(1),
  reactivatedBy: z.string().min(1),
  reactivatedAt: z.string().datetime(),
});

export const userLocationUpdatedSchema = z.object({
  userId: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).nullable(),
  timestamp: z.string().datetime(),
});

// System Schemas
export const systemMaintenanceStartedSchema = z.object({
  maintenanceId: z.string().min(1),
  message: z.string().min(1),
  startsAt: z.string().datetime(),
  estimatedEndAt: z.string().datetime().optional(),
});

export const systemMaintenanceEndedSchema = z.object({
  maintenanceId: z.string().min(1),
  endedAt: z.string().datetime(),
});

export const systemAnnouncementSchema = z.object({
  announcementId: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
  priority: z.enum(['INFO', 'WARNING', 'IMPORTANT']),
  createdAt: z.string().datetime(),
});

export const realtimeConnectionStatusPayloadSchema = z.object({
  status: z.enum(['CONNECTED', 'CONNECTING', 'DISCONNECTED', 'ERROR']),
  changedAt: z.string().datetime(),
});

// Event Schemas Registry Map
export const eventSchemasMap: Record<string, z.ZodSchema> = {
  CHAT_CONVERSATION_CREATED: chatConversationCreatedSchema,
  CHAT_MESSAGE_CREATED: chatMessageCreatedSchema,
  CHAT_MESSAGE_UPDATED: chatMessageUpdatedSchema,
  CHAT_MESSAGE_DELETED: chatMessageDeletedSchema,
  CHAT_MESSAGE_READ: chatMessageReadSchema,
  CHAT_TYPING_STARTED: chatTypingSchema,
  CHAT_TYPING_STOPPED: chatTypingSchema,
  CHAT_USER_ONLINE: chatUserPresenceSchema,
  CHAT_USER_OFFLINE: chatUserPresenceSchema,
  CHAT_ATTACHMENT_UPLOADED: chatAttachmentUploadedSchema,

  ORDER_CREATED: orderCreatedSchema,
  ORDER_CONFIRMED: orderSimpleTimestampSchema,
  ORDER_PREPARING: orderSimpleTimestampSchema,
  ORDER_READY_FOR_PICKUP: orderSimpleTimestampSchema,
  ORDER_PICKED_UP: orderSimpleTimestampSchema,
  ORDER_OUT_FOR_DELIVERY: orderSimpleTimestampSchema,
  ORDER_DELIVERED: orderSimpleTimestampSchema,
  ORDER_CANCELLED: orderCancelledSchema,
  ORDER_STATUS_CHANGED: orderStatusChangedSchema,
  ORDER_ITEM_ADDED: orderItemAddedSchema,
  ORDER_ITEM_REMOVED: orderItemRemovedSchema,
  ORDER_UPDATED: orderUpdatedSchema,

  DELIVERY_ASSIGNED: deliveryAssignedSchema,
  DELIVERY_UNASSIGNED: deliveryUnassignedSchema,
  DELIVERY_ACCEPTED: deliveryAcceptedSchema,
  DELIVERY_REJECTED: deliveryRejectedSchema,
  DELIVERY_STARTED: deliveryStartedSchema,
  DELIVERY_LOCATION_UPDATED: deliveryLocationUpdatedSchema,
  DELIVERY_LOCATION_STALE: deliveryLocationStaleSchema,
  DELIVERY_ARRIVED_AT_SUPPLIER: deliveryArrivedAtSupplierSchema,
  DELIVERY_PICKUP_CONFIRMED: deliveryPickupConfirmedSchema,
  DELIVERY_ARRIVED_AT_CUSTOMER: deliveryArrivedAtCustomerSchema,
  DELIVERY_OTP_VERIFIED: deliveryOtpVerifiedSchema,
  DELIVERY_COMPLETED: deliveryCompletedSchema,
  DELIVERY_FAILED: deliveryFailedSchema,
  DELIVERY_CANCELLED: deliveryCancelledSchema,

  SUPPLIER_CREATED: supplierCreatedSchema,
  SUPPLIER_VERIFICATION_SUBMITTED: supplierVerificationSubmittedSchema,
  SUPPLIER_VERIFIED: supplierVerifiedSchema,
  SUPPLIER_REJECTED: supplierRejectedSchema,
  SUPPLIER_SUSPENDED: supplierSuspendedSchema,
  SUPPLIER_ONLINE: supplierPresenceSchema,
  SUPPLIER_OFFLINE: supplierPresenceSchema,
  SUPPLIER_BUSY: supplierPresenceSchema,
  SUPPLIER_STATUS_CHANGED: supplierStatusChangedSchema,

  PRODUCT_CREATED: productCreatedSchema,
  PRODUCT_UPDATED: productUpdatedSchema,
  PRODUCT_DELETED: productDeletedSchema,
  PRODUCT_ACTIVATED: productStateSchema,
  PRODUCT_DEACTIVATED: productStateSchema,
  INVENTORY_UPDATED: inventoryUpdatedSchema,
  INVENTORY_LOW_STOCK: inventoryLowStockSchema,
  INVENTORY_OUT_OF_STOCK: inventoryOutOfStockSchema,
  INVENTORY_RESTOCKED: inventoryRestockedSchema,

  PAYMENT_CREATED: paymentCreatedSchema,
  PAYMENT_PENDING: paymentPendingSchema,
  PAYMENT_AUTHORIZED: paymentAuthorizedSchema,
  PAYMENT_PAID: paymentPaidSchema,
  PAYMENT_FAILED: paymentFailedSchema,
  PAYMENT_REFUNDED: paymentRefundedSchema,
  PAYMENT_PARTIALLY_REFUNDED: paymentPartiallyRefundedSchema,
  PAYMENT_STATUS_CHANGED: paymentStatusChangedSchema,

  NOTIFICATION_CREATED: notificationCreatedSchema,
  NOTIFICATION_READ: notificationReadSchema,
  NOTIFICATION_DELETED: notificationDeletedSchema,

  COMPLAINT_CREATED: complaintCreatedSchema,
  COMPLAINT_ASSIGNED: complaintAssignedSchema,
  COMPLAINT_STATUS_CHANGED: complaintStatusChangedSchema,
  COMPLAINT_MESSAGE_CREATED: complaintMessageCreatedSchema,
  COMPLAINT_RESOLVED: complaintResolvedSchema,
  COMPLAINT_REOPENED: complaintReopenedSchema,

  USER_PROFILE_UPDATED: userProfileUpdatedSchema,
  USER_STATUS_CHANGED: userStatusChangedSchema,
  USER_SUSPENDED: userSuspendedSchema,
  USER_REACTIVATED: userReactivatedSchema,
  USER_LOCATION_UPDATED: userLocationUpdatedSchema,

  SYSTEM_MAINTENANCE_STARTED: systemMaintenanceStartedSchema,
  SYSTEM_MAINTENANCE_ENDED: systemMaintenanceEndedSchema,
  SYSTEM_ANNOUNCEMENT: systemAnnouncementSchema,
  REALTIME_CONNECTION_STATUS: realtimeConnectionStatusPayloadSchema,
};

/**
 * Validates full Realtime Event envelope and payload. Rejects unknown event types or invalid schemas.
 */
export function validateRealtimeEvent(event: any): { valid: boolean; error?: string } {
  const parseEnvelope = realtimeEnvelopeSchema.safeParse(event);
  if (!parseEnvelope.success) {
    return { valid: false, error: `Envelope validation error: ${parseEnvelope.error.message}` };
  }

  const schema = eventSchemasMap[event.eventType];
  if (!schema) {
    return { valid: false, error: `Unknown or unregistered eventType: ${event.eventType}` };
  }

  const parsePayload = schema.safeParse(event.payload);
  if (!parsePayload.success) {
    return { valid: false, error: `Payload validation error for ${event.eventType}: ${parsePayload.error.message}` };
  }

  return { valid: true };
}
