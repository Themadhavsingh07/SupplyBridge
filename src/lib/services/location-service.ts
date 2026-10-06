import { prisma } from '@/lib/prisma';
import { publishEventWithOutbox } from '@/lib/realtime/outbox';
import { RealtimeChannels } from '@/lib/realtime/channel-registry';
import { deliveryLocationUpdatedSchema } from '@/lib/realtime/validators';

interface LocationUpdateInput {
  orderId: string;
  deliveryPartnerId: string;
  role: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function processDeliveryLocationUpdate(input: LocationUpdateInput) {
  // 1. Validate GPS coordinates with Zod
  const validation = deliveryLocationUpdatedSchema.partial({
    deliveryId: true,
    timestamp: true,
  }).safeParse({
    orderId: input.orderId,
    deliveryPartnerId: input.deliveryPartnerId,
    latitude: input.latitude,
    longitude: input.longitude,
    accuracy: input.accuracy ?? null,
    heading: input.heading ?? null,
    speed: input.speed ?? null,
  });

  if (!validation.success) {
    throw new Error(`Invalid GPS coordinates: ${validation.error.message}`);
  }

  // 2. Authorize delivery partner assignment
  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: {
      delivery: {
        include: {
          deliveryPartner: true,
          currentLocation: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  const deliveryPartnerProfileId = order.delivery?.deliveryPartnerId;
  const isAssignedUser = order.delivery?.deliveryPartner?.userId === input.deliveryPartnerId;
  const isAdmin = input.role === 'ADMIN';

  if (!isAssignedUser && !isAdmin) {
    throw new Error('Forbidden: User is not the assigned delivery partner for this order');
  }

  const deliveryId = order.delivery?.id || order.id;
  const partnerProfileId = deliveryPartnerProfileId || input.deliveryPartnerId;

  // 3. Check current location for throttling storage history inserts
  const currentLoc = order.delivery?.currentLocation;

  let shouldInsertHistory = true;
  if (currentLoc) {
    const dist = calculateDistanceMeters(
      Number(currentLoc.latitude),
      Number(currentLoc.longitude),
      input.latitude,
      input.longitude
    );
    const elapsedMs = Date.now() - new Date(currentLoc.timestamp).getTime();

    // Throttling: If moved < 10 meters AND < 5 seconds passed, skip history insertion
    if (dist < 10 && elapsedMs < 5000) {
      shouldInsertHistory = false;
    }
  }

  // 4. Prisma Database Updates (Source of Truth)
  const now = new Date();
  const timestampIso = now.toISOString();

  if (order.delivery) {
    await prisma.$transaction(async (tx) => {
      // Upsert Current Delivery Location record
      await tx.currentDeliveryLocation.upsert({
        where: { deliveryId: order.delivery!.id },
        create: {
          deliveryId: order.delivery!.id,
          deliveryPartnerId: partnerProfileId,
          latitude: input.latitude,
          longitude: input.longitude,
          accuracy: input.accuracy ?? null,
          heading: input.heading ?? null,
          speed: input.speed ?? null,
          timestamp: now,
        },
        update: {
          latitude: input.latitude,
          longitude: input.longitude,
          accuracy: input.accuracy ?? null,
          heading: input.heading ?? null,
          speed: input.speed ?? null,
          timestamp: now,
        },
      });

      // Insert history log if meaningful movement occurred
      if (shouldInsertHistory) {
        await tx.deliveryPartnerLocation.create({
          data: {
            deliveryPartnerId: partnerProfileId,
            userId: input.deliveryPartnerId,
            orderId: input.orderId,
            deliveryId: order.delivery!.id,
            latitude: input.latitude,
            longitude: input.longitude,
            accuracy: input.accuracy ?? null,
            heading: input.heading ?? null,
            speed: input.speed ?? null,
            timestamp: now,
          },
        });
      }
    });
  }

  // 5. Outbox Event Persistence + Supabase Realtime Broadcast
  const channelName = RealtimeChannels.orderTracking(input.orderId);
  const outboxResult = await publishEventWithOutbox({
    eventType: 'DELIVERY_LOCATION_UPDATED',
    actorId: input.deliveryPartnerId,
    actorRole: 'DELIVERY_PARTNER',
    entityId: input.orderId,
    channelName,
    payload: {
      orderId: input.orderId,
      deliveryId,
      deliveryPartnerId: input.deliveryPartnerId,
      latitude: input.latitude,
      longitude: input.longitude,
      accuracy: input.accuracy ?? null,
      heading: input.heading ?? null,
      speed: input.speed ?? null,
      timestamp: timestampIso,
    },
  });

  return {
    success: true,
    eventId: outboxResult.logRecord.eventId,
    timestamp: timestampIso,
  };
}
