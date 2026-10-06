export * from './common';
export * from './chat';
export * from './order';
export * from './delivery';
export * from './supplier';
export * from './inventory';
export * from './payment';
export * from './notification';
export * from './complaint';
export * from './user';
export * from './system';

import {
  ChatConversationCreatedPayload,
  ChatMessageCreatedPayload,
  ChatMessageUpdatedPayload,
  ChatMessageDeletedPayload,
  ChatMessageReadPayload,
  ChatTypingStartedPayload,
  ChatTypingStoppedPayload,
  ChatUserOnlinePayload,
  ChatUserOfflinePayload,
  ChatAttachmentUploadedPayload,
} from './chat';

import {
  OrderCreatedPayload,
  OrderConfirmedPayload,
  OrderPreparingPayload,
  OrderReadyForPickupPayload,
  OrderPickedUpPayload,
  OrderOutForDeliveryPayload,
  OrderDeliveredPayload,
  OrderCancelledPayload,
  OrderStatusChangedPayload,
  OrderItemAddedPayload,
  OrderItemRemovedPayload,
  OrderUpdatedPayload,
} from './order';

import {
  DeliveryAssignedPayload,
  DeliveryUnassignedPayload,
  DeliveryAcceptedPayload,
  DeliveryRejectedPayload,
  DeliveryStartedPayload,
  DeliveryLocationUpdatedPayload,
  DeliveryLocationStalePayload,
  DeliveryArrivedAtSupplierPayload,
  DeliveryPickupConfirmedPayload,
  DeliveryArrivedAtCustomerPayload,
  DeliveryOtpVerifiedPayload,
  DeliveryCompletedPayload,
  DeliveryFailedPayload,
  DeliveryCancelledPayload,
} from './delivery';

import {
  SupplierCreatedPayload,
  SupplierVerificationSubmittedPayload,
  SupplierVerifiedPayload,
  SupplierRejectedPayload,
  SupplierSuspendedPayload,
  SupplierOnlinePayload,
  SupplierOfflinePayload,
  SupplierBusyPayload,
  SupplierStatusChangedPayload,
} from './supplier';

import {
  ProductCreatedPayload,
  ProductUpdatedPayload,
  ProductDeletedPayload,
  ProductActivatedPayload,
  ProductDeactivatedPayload,
  InventoryUpdatedPayload,
  InventoryLowStockPayload,
  InventoryOutOfStockPayload,
  InventoryRestockedPayload,
} from './inventory';

import {
  PaymentCreatedPayload,
  PaymentPendingPayload,
  PaymentAuthorizedPayload,
  PaymentPaidPayload,
  PaymentFailedPayload,
  PaymentRefundedPayload,
  PaymentPartiallyRefundedPayload,
  PaymentStatusChangedPayload,
} from './payment';

import {
  NotificationCreatedPayload,
  NotificationReadPayload,
  NotificationDeletedPayload,
} from './notification';

import {
  ComplaintCreatedPayload,
  ComplaintAssignedPayload,
  ComplaintStatusChangedPayload,
  ComplaintMessageCreatedPayload,
  ComplaintResolvedPayload,
  ComplaintReopenedPayload,
} from './complaint';

import {
  UserProfileUpdatedPayload,
  UserStatusChangedPayload,
  UserSuspendedPayload,
  UserReactivatedPayload,
  UserLocationUpdatedPayload,
} from './user';

import {
  SystemMaintenanceStartedPayload,
  SystemMaintenanceEndedPayload,
  SystemAnnouncementPayload,
  RealtimeConnectionStatusPayload,
} from './system';

import { RealtimeEvent } from './common';

export type RealtimeEventType =
  | 'CHAT_CONVERSATION_CREATED'
  | 'CHAT_MESSAGE_CREATED'
  | 'CHAT_MESSAGE_UPDATED'
  | 'CHAT_MESSAGE_DELETED'
  | 'CHAT_MESSAGE_READ'
  | 'CHAT_TYPING_STARTED'
  | 'CHAT_TYPING_STOPPED'
  | 'CHAT_USER_ONLINE'
  | 'CHAT_USER_OFFLINE'
  | 'CHAT_ATTACHMENT_UPLOADED'

  | 'ORDER_CREATED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_PREPARING'
  | 'ORDER_READY_FOR_PICKUP'
  | 'ORDER_PICKED_UP'
  | 'ORDER_OUT_FOR_DELIVERY'
  | 'ORDER_DELIVERED'
  | 'ORDER_CANCELLED'
  | 'ORDER_STATUS_CHANGED'
  | 'ORDER_ITEM_ADDED'
  | 'ORDER_ITEM_REMOVED'
  | 'ORDER_UPDATED'

  | 'DELIVERY_ASSIGNED'
  | 'DELIVERY_UNASSIGNED'
  | 'DELIVERY_ACCEPTED'
  | 'DELIVERY_REJECTED'
  | 'DELIVERY_STARTED'
  | 'DELIVERY_LOCATION_UPDATED'
  | 'DELIVERY_LOCATION_STALE'
  | 'DELIVERY_ARRIVED_AT_SUPPLIER'
  | 'DELIVERY_PICKUP_CONFIRMED'
  | 'DELIVERY_ARRIVED_AT_CUSTOMER'
  | 'DELIVERY_OTP_VERIFIED'
  | 'DELIVERY_COMPLETED'
  | 'DELIVERY_FAILED'
  | 'DELIVERY_CANCELLED'

  | 'SUPPLIER_CREATED'
  | 'SUPPLIER_VERIFICATION_SUBMITTED'
  | 'SUPPLIER_VERIFIED'
  | 'SUPPLIER_REJECTED'
  | 'SUPPLIER_SUSPENDED'
  | 'SUPPLIER_ONLINE'
  | 'SUPPLIER_OFFLINE'
  | 'SUPPLIER_BUSY'
  | 'SUPPLIER_STATUS_CHANGED'

  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_DELETED'
  | 'PRODUCT_ACTIVATED'
  | 'PRODUCT_DEACTIVATED'
  | 'INVENTORY_UPDATED'
  | 'INVENTORY_LOW_STOCK'
  | 'INVENTORY_OUT_OF_STOCK'
  | 'INVENTORY_RESTOCKED'

  | 'PAYMENT_CREATED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_AUTHORIZED'
  | 'PAYMENT_PAID'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_REFUNDED'
  | 'PAYMENT_PARTIALLY_REFUNDED'
  | 'PAYMENT_STATUS_CHANGED'

  | 'NOTIFICATION_CREATED'
  | 'NOTIFICATION_READ'
  | 'NOTIFICATION_DELETED'

  | 'COMPLAINT_CREATED'
  | 'COMPLAINT_ASSIGNED'
  | 'COMPLAINT_STATUS_CHANGED'
  | 'COMPLAINT_MESSAGE_CREATED'
  | 'COMPLAINT_RESOLVED'
  | 'COMPLAINT_REOPENED'

  | 'USER_PROFILE_UPDATED'
  | 'USER_STATUS_CHANGED'
  | 'USER_SUSPENDED'
  | 'USER_REACTIVATED'
  | 'USER_LOCATION_UPDATED'

  | 'SYSTEM_MAINTENANCE_STARTED'
  | 'SYSTEM_MAINTENANCE_ENDED'
  | 'SYSTEM_ANNOUNCEMENT'
  | 'REALTIME_CONNECTION_STATUS';

export interface RealtimeEventMap {
  CHAT_CONVERSATION_CREATED: ChatConversationCreatedPayload;
  CHAT_MESSAGE_CREATED: ChatMessageCreatedPayload;
  CHAT_MESSAGE_UPDATED: ChatMessageUpdatedPayload;
  CHAT_MESSAGE_DELETED: ChatMessageDeletedPayload;
  CHAT_MESSAGE_READ: ChatMessageReadPayload;
  CHAT_TYPING_STARTED: ChatTypingStartedPayload;
  CHAT_TYPING_STOPPED: ChatTypingStoppedPayload;
  CHAT_USER_ONLINE: ChatUserOnlinePayload;
  CHAT_USER_OFFLINE: ChatUserOfflinePayload;
  CHAT_ATTACHMENT_UPLOADED: ChatAttachmentUploadedPayload;

  ORDER_CREATED: OrderCreatedPayload;
  ORDER_CONFIRMED: OrderConfirmedPayload;
  ORDER_PREPARING: OrderPreparingPayload;
  ORDER_READY_FOR_PICKUP: OrderReadyForPickupPayload;
  ORDER_PICKED_UP: OrderPickedUpPayload;
  ORDER_OUT_FOR_DELIVERY: OrderOutForDeliveryPayload;
  ORDER_DELIVERED: OrderDeliveredPayload;
  ORDER_CANCELLED: OrderCancelledPayload;
  ORDER_STATUS_CHANGED: OrderStatusChangedPayload;
  ORDER_ITEM_ADDED: OrderItemAddedPayload;
  ORDER_ITEM_REMOVED: OrderItemRemovedPayload;
  ORDER_UPDATED: OrderUpdatedPayload;

  DELIVERY_ASSIGNED: DeliveryAssignedPayload;
  DELIVERY_UNASSIGNED: DeliveryUnassignedPayload;
  DELIVERY_ACCEPTED: DeliveryAcceptedPayload;
  DELIVERY_REJECTED: DeliveryRejectedPayload;
  DELIVERY_STARTED: DeliveryStartedPayload;
  DELIVERY_LOCATION_UPDATED: DeliveryLocationUpdatedPayload;
  DELIVERY_LOCATION_STALE: DeliveryLocationStalePayload;
  DELIVERY_ARRIVED_AT_SUPPLIER: DeliveryArrivedAtSupplierPayload;
  DELIVERY_PICKUP_CONFIRMED: DeliveryPickupConfirmedPayload;
  DELIVERY_ARRIVED_AT_CUSTOMER: DeliveryArrivedAtCustomerPayload;
  DELIVERY_OTP_VERIFIED: DeliveryOtpVerifiedPayload;
  DELIVERY_COMPLETED: DeliveryCompletedPayload;
  DELIVERY_FAILED: DeliveryFailedPayload;
  DELIVERY_CANCELLED: DeliveryCancelledPayload;

  SUPPLIER_CREATED: SupplierCreatedPayload;
  SUPPLIER_VERIFICATION_SUBMITTED: SupplierVerificationSubmittedPayload;
  SUPPLIER_VERIFIED: SupplierVerifiedPayload;
  SUPPLIER_REJECTED: SupplierRejectedPayload;
  SUPPLIER_SUSPENDED: SupplierSuspendedPayload;
  SUPPLIER_ONLINE: SupplierOnlinePayload;
  SUPPLIER_OFFLINE: SupplierOfflinePayload;
  SUPPLIER_BUSY: SupplierBusyPayload;
  SUPPLIER_STATUS_CHANGED: SupplierStatusChangedPayload;

  PRODUCT_CREATED: ProductCreatedPayload;
  PRODUCT_UPDATED: ProductUpdatedPayload;
  PRODUCT_DELETED: ProductDeletedPayload;
  PRODUCT_ACTIVATED: ProductActivatedPayload;
  PRODUCT_DEACTIVATED: ProductDeactivatedPayload;
  INVENTORY_UPDATED: InventoryUpdatedPayload;
  INVENTORY_LOW_STOCK: InventoryLowStockPayload;
  INVENTORY_OUT_OF_STOCK: InventoryOutOfStockPayload;
  INVENTORY_RESTOCKED: InventoryRestockedPayload;

  PAYMENT_CREATED: PaymentCreatedPayload;
  PAYMENT_PENDING: PaymentPendingPayload;
  PAYMENT_AUTHORIZED: PaymentAuthorizedPayload;
  PAYMENT_PAID: PaymentPaidPayload;
  PAYMENT_FAILED: PaymentFailedPayload;
  PAYMENT_REFUNDED: PaymentRefundedPayload;
  PAYMENT_PARTIALLY_REFUNDED: PaymentPartiallyRefundedPayload;
  PAYMENT_STATUS_CHANGED: PaymentStatusChangedPayload;

  NOTIFICATION_CREATED: NotificationCreatedPayload;
  NOTIFICATION_READ: NotificationReadPayload;
  NOTIFICATION_DELETED: NotificationDeletedPayload;

  COMPLAINT_CREATED: ComplaintCreatedPayload;
  COMPLAINT_ASSIGNED: ComplaintAssignedPayload;
  COMPLAINT_STATUS_CHANGED: ComplaintStatusChangedPayload;
  COMPLAINT_MESSAGE_CREATED: ComplaintMessageCreatedPayload;
  COMPLAINT_RESOLVED: ComplaintResolvedPayload;
  COMPLAINT_REOPENED: ComplaintReopenedPayload;

  USER_PROFILE_UPDATED: UserProfileUpdatedPayload;
  USER_STATUS_CHANGED: UserStatusChangedPayload;
  USER_SUSPENDED: UserSuspendedPayload;
  USER_REACTIVATED: UserReactivatedPayload;
  USER_LOCATION_UPDATED: UserLocationUpdatedPayload;

  SYSTEM_MAINTENANCE_STARTED: SystemMaintenanceStartedPayload;
  SYSTEM_MAINTENANCE_ENDED: SystemMaintenanceEndedPayload;
  SYSTEM_ANNOUNCEMENT: SystemAnnouncementPayload;
  REALTIME_CONNECTION_STATUS: RealtimeConnectionStatusPayload;
}

/**
 * Generic Mapped Union Type for any valid Realtime Event.
 */
export type AnyRealtimeEvent = {
  [K in keyof RealtimeEventMap]: RealtimeEvent<K, RealtimeEventMap[K]>;
}[keyof RealtimeEventMap];
