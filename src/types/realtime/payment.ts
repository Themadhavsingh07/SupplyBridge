import { PaymentStatus } from './common';

export interface PaymentCreatedPayload {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: 'INR';
  createdAt: string;
}

export interface PaymentPendingPayload {
  paymentId: string;
  orderId: string;
  updatedAt: string;
}

export interface PaymentAuthorizedPayload {
  paymentId: string;
  orderId: string;
  updatedAt: string;
}

export interface PaymentPaidPayload {
  paymentId: string;
  orderId: string;
  amount: number;
  paidAt: string;
}

export interface PaymentFailedPayload {
  paymentId: string;
  orderId: string;
  reason?: string;
  failedAt: string;
}

export interface PaymentRefundedPayload {
  paymentId: string;
  orderId: string;
  refundAmount: number;
  refundedAt: string;
}

export interface PaymentPartiallyRefundedPayload {
  paymentId: string;
  orderId: string;
  refundAmount: number;
  remainingAmount: number;
  refundedAt: string;
}

export interface PaymentStatusChangedPayload {
  paymentId: string;
  orderId: string;
  previousStatus: PaymentStatus;
  newStatus: PaymentStatus;
  updatedAt: string;
}
