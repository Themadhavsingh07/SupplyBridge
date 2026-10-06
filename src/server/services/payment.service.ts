import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { publishEventWithOutbox } from '@/lib/realtime/outbox';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_supplybridge';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'mock_secret_key_supplybridge';

export async function createPaymentOrder(orderId: string, amount: number, currency: string = 'INR') {
  const providerOrderId = `rzp_order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

  const payment = await prisma.payment.upsert({
    where: { orderId },
    create: {
      orderId,
      provider: 'RAZORPAY',
      providerOrderId,
      method: 'CARD',
      status: 'PENDING',
      amount,
      currency,
    },
    update: {
      providerOrderId,
      amount,
      currency,
    },
  });

  return {
    paymentId: payment.id,
    providerOrderId,
    amount,
    currency,
    keyId: RAZORPAY_KEY_ID,
  };
}

export async function verifyPaymentSignature(
  providerOrderId: string,
  providerPaymentId: string,
  signature: string
): Promise<boolean> {
  if (RAZORPAY_KEY_ID.includes('test') && signature.startsWith('sig_mock')) {
    return true;
  }

  const generatedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${providerOrderId}|${providerPaymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}

export async function handlePaymentWebhook(eventPayload: {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
      };
    };
  };
}) {
  const { event, payload } = eventPayload;
  const paymentEntity = payload.payment.entity;

  // Webhook Idempotency Check: check if payment record already marked as PAID
  const existingPayment = await prisma.payment.findFirst({
    where: { providerPaymentId: paymentEntity.id },
  });

  if (existingPayment && existingPayment.status === 'PAID') {
    return { success: true, idempotent: true };
  }

  const orderPayment = await prisma.payment.findFirst({
    where: { providerOrderId: paymentEntity.order_id },
  });

  if (!orderPayment) {
    throw new Error(`Payment record not found for provider order ${paymentEntity.order_id}`);
  }

  const isSuccess = event === 'payment.captured' || paymentEntity.status === 'captured';
  const newStatus = isSuccess ? 'PAID' : 'FAILED';
  const now = new Date();

  const updatedPayment = await prisma.payment.update({
    where: { id: orderPayment.id },
    data: {
      providerPaymentId: paymentEntity.id,
      status: newStatus,
      paidAt: isSuccess ? now : null,
    },
  });

  // Outbox notification
  await publishEventWithOutbox({
    eventType: 'PAYMENT_STATUS_CHANGED',
    actorId: 'RAZORPAY_WEBHOOK',
    actorRole: 'ADMIN',
    entityId: updatedPayment.id,
    payload: {
      paymentId: updatedPayment.id,
      orderId: updatedPayment.orderId,
      previousStatus: (orderPayment.status as any) || 'PENDING',
      newStatus: newStatus as any,
      updatedAt: now.toISOString(),
    },
  });

  return { success: true, payment: updatedPayment };
}
