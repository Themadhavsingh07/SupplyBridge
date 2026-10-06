export interface DeliveryAssignedPayload {
  orderId: string;
  deliveryId: string;
  deliveryPartnerId: string;
  assignedAt: string;
}

export interface DeliveryUnassignedPayload {
  orderId: string;
  deliveryId: string;
  deliveryPartnerId: string;
  reason?: string;
}

export interface DeliveryAcceptedPayload {
  orderId: string;
  deliveryId: string;
  deliveryPartnerId: string;
  acceptedAt: string;
}

export interface DeliveryRejectedPayload {
  orderId: string;
  deliveryId: string;
  deliveryPartnerId: string;
  reason?: string;
}

export interface DeliveryStartedPayload {
  orderId: string;
  deliveryId: string;
  deliveryPartnerId: string;
  startedAt: string;
}

export interface DeliveryLocationUpdatedPayload {
  orderId: string;
  deliveryId: string;
  deliveryPartnerId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: string;
}

export interface DeliveryLocationStalePayload {
  orderId: string;
  deliveryId: string;
  deliveryPartnerId: string;
  lastKnownAt: string;
  staleSince: string;
}

export interface DeliveryArrivedAtSupplierPayload {
  orderId: string;
  deliveryId: string;
  deliveryPartnerId: string;
  arrivedAt: string;
}

export interface DeliveryPickupConfirmedPayload {
  orderId: string;
  deliveryId: string;
  deliveryPartnerId: string;
  confirmedAt: string;
}

export interface DeliveryArrivedAtCustomerPayload {
  orderId: string;
  deliveryId: string;
  deliveryPartnerId: string;
  arrivedAt: string;
}

export interface DeliveryOtpVerifiedPayload {
  orderId: string;
  deliveryId: string;
  verifiedAt: string;
}

export interface DeliveryCompletedPayload {
  orderId: string;
  deliveryId: string;
  deliveryPartnerId: string;
  completedAt: string;
}

export interface DeliveryFailedPayload {
  orderId: string;
  deliveryId: string;
  reason: string;
  failedAt: string;
}

export interface DeliveryCancelledPayload {
  orderId: string;
  deliveryId: string;
  cancelledBy: string;
  reason: string;
  cancelledAt: string;
}
