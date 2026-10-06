import { prisma } from '@/lib/prisma';
import { createAuditLog } from './audit.service';
import { publishRealtimeEvent } from '@/lib/realtime/event-publisher';

export interface ProcessRefundInput {
  adminUserId: string;
  orderId: string;
  amount: number;
  reason: string;
  refundType?: 'FULL' | 'PARTIAL';
}

export async function processAdminRefund(input: ProcessRefundInput) {
  const { adminUserId, orderId, amount, reason, refundType = 'FULL' } = input;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true, customer: true },
  });

  if (!order) throw new Error('Order not found');
  if (!order.payment) throw new Error('No payment record associated with this order');
  if (order.payment.status === 'REFUNDED') throw new Error('Order payment is already fully refunded');

  const providerRefundId = `ref_prov_${orderId}_${Date.now()}`;

  // Check Idempotency via Payment Refunds relation
  const existingRefund = await prisma.refund.findFirst({
    where: {
      paymentId: order.payment.id,
      amount,
      reason,
      status: 'SUCCESS',
    },
  });

  if (existingRefund) {
    return { refund: existingRefund, duplicate: true, message: 'Identical refund already processed successfully' };
  }

  // Execute database transaction
  const result = await prisma.$transaction(async (tx) => {
    const refundRecord = await tx.refund.create({
      data: {
        paymentId: order.payment!.id,
        providerRefundId,
        amount,
        reason,
        status: 'SUCCESS',
        processedAt: new Date(),
      },
    });

    const newPaymentStatus = refundType === 'FULL' || amount >= Number(order.total) ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

    await tx.payment.update({
      where: { id: order.payment!.id },
      data: { status: newPaymentStatus },
    });

    return refundRecord;
  });

  // Log Audit Record
  await createAuditLog({
    userId: adminUserId,
    action: 'REFUND_CREATED',
    entityType: 'REFUND',
    entityId: result.id,
    oldData: { paymentStatus: order.payment.status },
    newData: { refundId: result.id, amount, reason, providerRefundId },
  });

  // Notify Customer
  await prisma.notification.create({
    data: {
      recipientId: order.customerId,
      type: 'PAYMENT',
      title: 'Refund Processed',
      message: `A refund of ₹${amount} has been issued for Order #${order.orderNumber}. Reason: ${reason}`,
    },
  });

  // Publish Realtime Event
  await publishRealtimeEvent({
    eventType: 'PAYMENT_REFUNDED' as any,
    actorId: adminUserId,
    actorRole: 'ADMIN',
    entityId: result.id,
    payload: { orderId, amount, providerRefundId } as any,
  });

  return { refund: result, duplicate: false, message: 'Refund successfully processed' };
}
