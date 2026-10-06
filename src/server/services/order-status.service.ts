import { prisma } from '@/lib/prisma';
import { isValidStatusTransition } from '@/lib/realtime/validators';
import { publishEventWithOutbox } from '@/lib/realtime/outbox';
import { RealtimeChannels } from '@/lib/realtime/channel-registry';
import { OrderStatus } from '@prisma/client';
import { ActorRole } from '@/types/realtime';

export interface TransitionOrderStatusInput {
  orderId: string;
  newStatus: OrderStatus;
  actorId: string;
  actorRole: ActorRole;
  reason?: string;
}

export async function transitionOrderStatus(input: TransitionOrderStatusInput) {
  // 1. Fetch current order state
  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: { supplier: true, customer: true },
  });

  if (!order) {
    throw new Error('NOT_FOUND: Order not found');
  }

  // 2. Validate state transition
  if (!isValidStatusTransition(order.status as any, input.newStatus as any)) {
    throw new Error(
      `INVALID_ORDER_STATUS: Cannot transition order status from '${order.status}' to '${input.newStatus}'`
    );
  }

  const prevStatus = order.status;
  const now = new Date();

  // 3. Database Transaction (Source of Truth)
  const updatedOrder = await prisma.$transaction(async (tx) => {
    // Update order status & timestamp fields
    const timestamps: Record<string, any> = {};
    if (input.newStatus === 'CONFIRMED') timestamps.confirmedAt = now;
    if (input.newStatus === 'PREPARING') timestamps.preparingAt = now;
    if (input.newStatus === 'READY_FOR_PICKUP') timestamps.readyAt = now;
    if (input.newStatus === 'PICKED_UP') timestamps.pickedUpAt = now;
    if (input.newStatus === 'OUT_FOR_DELIVERY') timestamps.outForDeliveryAt = now;
    if (input.newStatus === 'DELIVERED') timestamps.deliveredAt = now;
    if (input.newStatus === 'CANCELLED') {
      timestamps.cancelledAt = now;
      timestamps.cancellationReason = input.reason || 'Cancelled';
    }

    const updated = await tx.order.update({
      where: { id: input.orderId },
      data: {
        status: input.newStatus,
        ...timestamps,
      },
    });

    // Create OrderStatusHistory record
    await tx.orderStatusHistory.create({
      data: {
        orderId: input.orderId,
        previousStatus: prevStatus,
        newStatus: input.newStatus,
        changedById: input.actorId,
        reason: input.reason || null,
        createdAt: now,
      },
    });

    return updated;
  });

  // 4. Outbox Event Persistence + Realtime Publish
  const channelName = RealtimeChannels.orderStatus(input.orderId);
  const outboxResult = await publishEventWithOutbox({
    eventType: 'ORDER_STATUS_CHANGED',
    actorId: input.actorId,
    actorRole: input.actorRole,
    entityId: input.orderId,
    channelName,
    payload: {
      orderId: input.orderId,
      previousStatus: prevStatus as any,
      newStatus: input.newStatus as any,
      changedBy: input.actorId,
      changedAt: now.toISOString(),
      reason: input.reason,
    },
  });

  return {
    order: updatedOrder,
    eventId: outboxResult.logRecord.eventId,
  };
}
