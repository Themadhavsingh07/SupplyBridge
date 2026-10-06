import { prisma } from '@/lib/prisma';
import { DeliveryStatus, OrderStatus } from '@prisma/client';
import { publishRealtimeEvent } from '@/lib/realtime/event-publisher';
import { generateDeliveryOtp, verifyDeliveryOtp } from './delivery-otp.service';
import { createDeliveryEarningRecord } from './delivery-earnings.service';
import { ActorRole } from '@/types/realtime';

/**
 * List available delivery orders ready for pickup that have not been accepted yet
 */
export async function getAvailableDeliveries(params: {
  deliveryPartnerId: string;
  latitude?: number;
  longitude?: number;
  page?: number;
  limit?: number;
}) {
  const { deliveryPartnerId, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  // 1. Verify partner is ONLINE and VERIFIED
  const partner = await prisma.deliveryPartnerProfile.findUnique({
    where: { id: deliveryPartnerId },
  });

  if (!partner || !partner.isOnline || partner.verificationStatus !== 'VERIFIED') {
    return {
      deliveries: [],
      message: 'Delivery partner must be ONLINE and VERIFIED to view available requests.',
      pagination: { page, limit, totalCount: 0, totalPages: 0 },
    };
  }

  // 2. Fetch orders in READY_FOR_PICKUP state
  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where: {
        status: OrderStatus.READY_FOR_PICKUP,
        OR: [
          { delivery: null },
          { delivery: { status: DeliveryStatus.ASSIGNED } },
          { delivery: { status: DeliveryStatus.REJECTED } },
        ],
      },
      include: {
        supplier: {
          select: {
            businessName: true,
            addressLine: true,
            city: true,
            phone: true,
            latitude: true,
            longitude: true,
          },
        },
        items: {
          include: {
            product: { select: { name: true, unit: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({
      where: {
        status: OrderStatus.READY_FOR_PICKUP,
        OR: [
          { delivery: null },
          { delivery: { status: DeliveryStatus.ASSIGNED } },
          { delivery: { status: DeliveryStatus.REJECTED } },
        ],
      },
    }),
  ]);

  const deliveryRequests = orders.map((o) => ({
    orderId: o.id,
    orderNumber: o.orderNumber,
    supplierName: o.supplier.businessName,
    supplierAddress: `${o.supplier.addressLine}, ${o.supplier.city}`,
    customerArea: `${o.deliveryName}, ${o.city}`,
    totalAmount: Number(o.total),
    itemCount: o.items.length,
    estimatedEarnings: 55.0, // Base ₹40 + ₹15 surge
    createdAt: o.createdAt.toISOString(),
  }));

  return {
    deliveries: deliveryRequests,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
}

/**
 * Accept delivery assignment atomically with transaction locking (Section 42)
 * Prevents two delivery partners from accepting the same delivery.
 */
export async function acceptDelivery(params: {
  deliveryPartnerId: string;
  orderId: string;
  userId: string;
}) {
  const { deliveryPartnerId, orderId, userId } = params;

  // 1. Verify partner eligibility
  const partner = await prisma.deliveryPartnerProfile.findUnique({
    where: { id: deliveryPartnerId },
  });

  if (!partner || !partner.isOnline || partner.verificationStatus !== 'VERIFIED') {
    throw new Error('UNAUTHORIZED: You must be ONLINE and VERIFIED to accept deliveries');
  }

  // Check if partner already has an active delivery
  const existingActive = await prisma.delivery.findFirst({
    where: {
      deliveryPartnerId,
      status: {
        in: ['ACCEPTED', 'STARTED', 'ARRIVED_AT_SUPPLIER', 'PICKUP_CONFIRMED', 'ARRIVED_AT_CUSTOMER'],
      },
    },
  });

  if (existingActive) {
    throw new Error('CONCURRENCY_ERROR: You already have an active delivery in progress');
  }

  const now = new Date();

  // 2. Atomic Database Transaction with Lock Check
  const result = await prisma.$transaction(async (tx) => {
    // Lock check: Order must still be READY_FOR_PICKUP
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { delivery: true },
    });

    if (!order || order.status !== OrderStatus.READY_FOR_PICKUP) {
      throw new Error('CONFLICT: Order is no longer available for pickup');
    }

    if (
      order.delivery &&
      order.delivery.status !== DeliveryStatus.ASSIGNED &&
      order.delivery.status !== DeliveryStatus.REJECTED
    ) {
      throw new Error('CONFLICT: This delivery has already been accepted by another delivery partner');
    }

    // Upsert Delivery record with ACCEPTED status
    let delivery;
    if (order.delivery) {
      delivery = await tx.delivery.update({
        where: { id: order.delivery.id },
        data: {
          deliveryPartnerId,
          status: DeliveryStatus.ACCEPTED,
          acceptedAt: now,
        },
      });
    } else {
      delivery = await tx.delivery.create({
        data: {
          orderId,
          deliveryPartnerId,
          status: DeliveryStatus.ACCEPTED,
          assignedAt: now,
          acceptedAt: now,
        },
      });
    }

    // Generate 6-digit Delivery OTP for final customer verification
    const rawDeliveryOtp = await generateDeliveryOtp(delivery.id, 'delivery');

    // Update order status history
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        previousStatus: order.status,
        newStatus: OrderStatus.READY_FOR_PICKUP,
        changedById: userId,
        reason: 'Delivery accepted by delivery partner',
      },
    });

    return { delivery, rawDeliveryOtp };
  });

  // 3. Broadcast DELIVERY_ACCEPTED realtime event
  const channelName = `order:${orderId}:tracking`;
  await publishRealtimeEvent({
    eventType: 'DELIVERY_ACCEPTED',
    actorId: userId,
    actorRole: 'DELIVERY_PARTNER' as ActorRole,
    entityId: result.delivery.id,
    channelName,
    payload: {
      deliveryId: result.delivery.id,
      orderId,
      deliveryPartnerId,
      acceptedAt: now.toISOString(),
    } as any,
  });

  return {
    success: true,
    delivery: result.delivery,
    otpPrompt: 'Delivery OTP generated and dispatched to customer',
  };
}

/**
 * Execute delivery lifecycle state transition securely according to Section 14
 */
export async function updateDeliveryStage(params: {
  deliveryPartnerId: string;
  deliveryId: string;
  stage: 'START' | 'ARRIVE_SUPPLIER' | 'CONFIRM_PICKUP' | 'ARRIVE_CUSTOMER';
  userId: string;
}) {
  const { deliveryPartnerId, deliveryId, stage, userId } = params;

  const delivery = await prisma.delivery.findFirst({
    where: { id: deliveryId, deliveryPartnerId },
    include: { order: true },
  });

  if (!delivery) {
    throw new Error('NOT_FOUND: Delivery record not found or unauthorized');
  }

  const now = new Date();
  let targetDeliveryStatus: DeliveryStatus;
  let targetOrderStatus: OrderStatus | undefined;
  let eventType: 'DELIVERY_STARTED' | 'DELIVERY_ARRIVED_AT_SUPPLIER' | 'DELIVERY_PICKUP_CONFIRMED' | 'DELIVERY_ARRIVED_AT_CUSTOMER';

  switch (stage) {
    case 'START':
      if (delivery.status !== DeliveryStatus.ACCEPTED) {
        throw new Error(`INVALID_TRANSITION: Cannot start delivery from state '${delivery.status}'`);
      }
      targetDeliveryStatus = DeliveryStatus.STARTED;
      eventType = 'DELIVERY_STARTED';
      break;

    case 'ARRIVE_SUPPLIER':
      if (!['ACCEPTED', 'STARTED'].includes(delivery.status)) {
        throw new Error(`INVALID_TRANSITION: Cannot mark arrived at supplier from state '${delivery.status}'`);
      }
      targetDeliveryStatus = DeliveryStatus.ARRIVED_AT_SUPPLIER;
      eventType = 'DELIVERY_ARRIVED_AT_SUPPLIER';
      break;

    case 'CONFIRM_PICKUP':
      if (!['STARTED', 'ARRIVED_AT_SUPPLIER'].includes(delivery.status)) {
        throw new Error(`INVALID_TRANSITION: Cannot confirm pickup from state '${delivery.status}'`);
      }
      targetDeliveryStatus = DeliveryStatus.PICKUP_CONFIRMED;
      targetOrderStatus = OrderStatus.OUT_FOR_DELIVERY;
      eventType = 'DELIVERY_PICKUP_CONFIRMED';
      break;

    case 'ARRIVE_CUSTOMER':
      if (!['PICKUP_CONFIRMED'].includes(delivery.status)) {
        throw new Error(`INVALID_TRANSITION: Cannot mark arrived at customer from state '${delivery.status}'`);
      }
      targetDeliveryStatus = DeliveryStatus.ARRIVED_AT_CUSTOMER;
      eventType = 'DELIVERY_ARRIVED_AT_CUSTOMER';
      break;

    default:
      throw new Error(`Invalid stage: ${stage}`);
  }

  // Execute database updates in transaction
  const updated = await prisma.$transaction(async (tx) => {
    const timestamps: any = {};
    if (stage === 'START') timestamps.startedAt = now;
    if (stage === 'ARRIVE_SUPPLIER') timestamps.startedAt = now;
    if (stage === 'CONFIRM_PICKUP') timestamps.pickedUpAt = now;
    if (stage === 'ARRIVE_CUSTOMER') timestamps.arrivedAtCustomerAt = now;

    const del = await tx.delivery.update({
      where: { id: deliveryId },
      data: {
        status: targetDeliveryStatus,
        ...timestamps,
      },
    });

    if (targetOrderStatus) {
      await tx.order.update({
        where: { id: delivery.orderId },
        data: {
          status: targetOrderStatus,
          outForDeliveryAt: stage === 'CONFIRM_PICKUP' ? now : undefined,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: delivery.orderId,
          previousStatus: delivery.order.status,
          newStatus: targetOrderStatus,
          changedById: userId,
          reason: `Delivery partner ${stage}`,
        },
      });
    }

    return del;
  });

  // Publish Realtime Event
  const channelName = `order:${delivery.orderId}:tracking`;
  await publishRealtimeEvent({
    eventType,
    actorId: userId,
    actorRole: 'DELIVERY_PARTNER' as ActorRole,
    entityId: delivery.id,
    channelName,
    payload: {
      deliveryId: delivery.id,
      orderId: delivery.orderId,
      deliveryPartnerId,
      timestamp: now.toISOString(),
    } as any,
  });

  return updated;
}

/**
 * Complete delivery securely using customer 6-digit OTP (Section 33 & 34)
 */
export async function completeDeliveryWithOtp(params: {
  deliveryPartnerId: string;
  deliveryId: string;
  otp: string;
  proofImageUrl?: string;
  userId: string;
}) {
  const { deliveryPartnerId, deliveryId, otp, proofImageUrl, userId } = params;

  // 1. Fetch & authorize delivery
  const delivery = await prisma.delivery.findFirst({
    where: { id: deliveryId, deliveryPartnerId },
    include: { order: true },
  });

  if (!delivery) {
    throw new Error('NOT_FOUND: Delivery record not found or unauthorized');
  }

  if (delivery.status === DeliveryStatus.COMPLETED) {
    throw new Error('ALREADY_COMPLETED: Delivery is already marked completed');
  }

  // 2. Verify 6-digit OTP hash
  const isOtpValid = await verifyDeliveryOtp({
    deliveryId,
    providedOtp: otp,
    type: 'delivery',
  });

  if (!isOtpValid) {
    throw new Error('INVALID_OTP: The 6-digit delivery OTP entered is incorrect');
  }

  const now = new Date();

  // 3. Execute atomic completion transaction
  const result = await prisma.$transaction(async (tx) => {
    // Mark Delivery as COMPLETED
    const updatedDelivery = await tx.delivery.update({
      where: { id: deliveryId },
      data: {
        status: DeliveryStatus.COMPLETED,
        completedAt: now,
        proofImageUrl: proofImageUrl || null,
      },
    });

    // Mark Order as DELIVERED
    const updatedOrder = await tx.order.update({
      where: { id: delivery.orderId },
      data: {
        status: OrderStatus.DELIVERED,
        deliveredAt: now,
      },
    });

    // Write OrderStatusHistory
    await tx.orderStatusHistory.create({
      data: {
        orderId: delivery.orderId,
        previousStatus: delivery.order.status,
        newStatus: OrderStatus.DELIVERED,
        changedById: userId,
        reason: 'Delivery completed via OTP verification',
      },
    });

    return { delivery: updatedDelivery, order: updatedOrder };
  });

  // 4. Create Authoritative Delivery Earnings Record
  await createDeliveryEarningRecord({
    deliveryPartnerId,
    deliveryId,
    orderId: delivery.orderId,
    baseFee: 40,
    distanceSurge: 15,
    tip: 0,
  });

  // 5. Publish DELIVERY_COMPLETED Realtime Event
  const channelName = `order:${delivery.orderId}:tracking`;
  await publishRealtimeEvent({
    eventType: 'DELIVERY_COMPLETED',
    actorId: userId,
    actorRole: 'DELIVERY_PARTNER' as ActorRole,
    entityId: delivery.id,
    channelName,
    payload: {
      deliveryId: delivery.id,
      orderId: delivery.orderId,
      deliveryPartnerId,
      completedAt: now.toISOString(),
    } as any,
  });

  return {
    success: true,
    message: 'Delivery successfully completed! Earnings credited.',
    order: result.order,
  };
}
