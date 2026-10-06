import { OrderStatus } from './common';

export interface OrderCreatedPayload {
  orderId: string;
  orderNumber: string;
  customerId: string;
  supplierId: string;
  total: number;
  currency: 'INR';
  status: 'PLACED';
  createdAt: string;
}

export interface OrderConfirmedPayload {
  orderId: string;
  supplierId: string;
  confirmedAt: string;
}

export interface OrderPreparingPayload {
  orderId: string;
  supplierId: string;
  startedAt: string;
}

export interface OrderReadyForPickupPayload {
  orderId: string;
  supplierId: string;
  readyAt: string;
}

export interface OrderPickedUpPayload {
  orderId: string;
  deliveryPartnerId: string;
  pickedUpAt: string;
}

export interface OrderOutForDeliveryPayload {
  orderId: string;
  deliveryPartnerId: string;
  startedAt: string;
}

export interface OrderDeliveredPayload {
  orderId: string;
  deliveryPartnerId: string;
  deliveredAt: string;
}

export interface OrderCancelledPayload {
  orderId: string;
  cancelledBy: string;
  reason: string;
  cancelledAt: string;
}

export interface OrderStatusChangedPayload {
  orderId: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

export interface OrderItemAddedPayload {
  orderId: string;
  orderItemId: string;
  productId: string;
  quantity: number;
}

export interface OrderItemRemovedPayload {
  orderId: string;
  orderItemId: string;
  productId: string;
}

export interface OrderUpdatedPayload {
  orderId: string;
  updatedFields: string[];
  updatedAt: string;
}
