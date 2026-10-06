import { prisma } from '@/lib/prisma';
import { publishRealtimeEvent } from '@/lib/realtime/event-publisher';
import { ActorRole } from '@/types/realtime';

export async function getDeliveryDashboardMetrics(deliveryPartnerId: string) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [partner, todayDeliveriesCount, activeDelivery, todayEarningsAgg] = await Promise.all([
    // Profile details
    prisma.deliveryPartnerProfile.findUnique({
      where: { id: deliveryPartnerId },
      include: {
        user: { select: { name: true, phone: true, email: true } },
      },
    }),
    // Today's completed deliveries
    prisma.delivery.count({
      where: {
        deliveryPartnerId,
        status: 'COMPLETED',
        completedAt: { gte: startOfToday },
      },
    }),
    // Active delivery
    prisma.delivery.findFirst({
      where: {
        deliveryPartnerId,
        status: { in: ['ACCEPTED', 'STARTED', 'ARRIVED_AT_SUPPLIER', 'PICKUP_CONFIRMED', 'ARRIVED_AT_CUSTOMER'] },
      },
      include: {
        order: { select: { id: true, orderNumber: true, deliveryName: true, total: true } },
      },
    }),
    // Today's earnings
    prisma.deliveryEarning.aggregate({
      where: {
        deliveryPartnerId,
        createdAt: { gte: startOfToday },
      },
      _sum: { totalEarning: true },
    }),
  ]);

  if (!partner) {
    throw new Error('Delivery partner profile not found');
  }

  return {
    partner,
    metrics: {
      todayDeliveries: todayDeliveriesCount,
      activeDeliveryCount: activeDelivery ? 1 : 0,
      activeDelivery: activeDelivery
        ? {
            id: activeDelivery.id,
            orderId: activeDelivery.orderId,
            orderNumber: activeDelivery.order.orderNumber,
            status: activeDelivery.status,
            customerName: activeDelivery.order.deliveryName,
          }
        : null,
      completedDeliveries: partner.totalDeliveries,
      todayEarnings: Number(todayEarningsAgg._sum.totalEarning || 0),
      totalEarnings: Number(partner.totalEarnings || 0),
      rating: Number(partner.rating || 0),
      isOnline: partner.isOnline,
      isAvailable: partner.isAvailable,
      verificationStatus: partner.verificationStatus,
    },
  };
}

export async function updateDeliveryPartnerStatus(params: {
  deliveryPartnerId: string;
  userId: string;
  isOnline?: boolean;
  isAvailable?: boolean;
}) {
  const { deliveryPartnerId, userId, isOnline, isAvailable } = params;

  const existing = await prisma.deliveryPartnerProfile.findUnique({
    where: { id: deliveryPartnerId },
  });

  if (!existing) {
    throw new Error('Delivery partner profile not found');
  }

  const dataToUpdate: any = {};
  if (isOnline !== undefined) dataToUpdate.isOnline = isOnline;
  if (isAvailable !== undefined) dataToUpdate.isAvailable = isAvailable;

  const updated = await prisma.deliveryPartnerProfile.update({
    where: { id: deliveryPartnerId },
    data: dataToUpdate,
  });

  // Determine Realtime Event Type according to Section 6
  const eventType: 'DELIVERY_STARTED' | 'DELIVERY_CANCELLED' = isOnline ? 'DELIVERY_STARTED' : 'DELIVERY_CANCELLED';

  const channelName = `delivery_partner:${deliveryPartnerId}:events`;
  try {
    await publishRealtimeEvent({
      eventType,
      actorId: userId,
      actorRole: 'DELIVERY_PARTNER' as ActorRole,
      entityId: deliveryPartnerId,
      channelName,
      payload: {
        deliveryPartnerId,
        isOnline: updated.isOnline,
        isAvailable: updated.isAvailable,
        updatedAt: new Date().toISOString(),
      } as any,
    });
  } catch (err) {
    console.error('Failed to publish delivery partner status event:', err);
  }

  return updated;
}
