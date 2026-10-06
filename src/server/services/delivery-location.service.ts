import { prisma } from '@/lib/prisma';
import { publishRealtimeEvent } from '@/lib/realtime/event-publisher';
import { ActorRole } from '@/types/realtime';

export interface GPSLocationInput {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp?: string;
}

/**
 * Validate GPS coordinates & metadata strictly according to Section 21
 */
export function validateGPSInput(input: GPSLocationInput): { valid: boolean; error?: string } {
  const { latitude, longitude, accuracy, heading, speed } = input;

  if (typeof latitude !== 'number' || isNaN(latitude) || latitude < -90 || latitude > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90 degrees' };
  }

  if (typeof longitude !== 'number' || isNaN(longitude) || longitude < -180 || longitude > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180 degrees' };
  }

  if (accuracy !== undefined && (typeof accuracy !== 'number' || isNaN(accuracy) || accuracy < 0)) {
    return { valid: false, error: 'Accuracy must be a non-negative number' };
  }

  if (heading !== undefined && (typeof heading !== 'number' || isNaN(heading) || heading < 0 || heading > 360)) {
    return { valid: false, error: 'Heading must be between 0 and 360 degrees' };
  }

  if (speed !== undefined && (typeof speed !== 'number' || isNaN(speed) || speed < 0)) {
    return { valid: false, error: 'Speed must be a non-negative number' };
  }

  return { valid: true };
}

/**
 * Calculate distance in meters using Haversine formula
 */
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Ingest, throttle, persist, and publish live GPS location for an active delivery.
 */
export async function updateDeliveryLocation(params: {
  deliveryPartnerId: string;
  userId: string;
  input: GPSLocationInput;
}) {
  const { deliveryPartnerId, userId, input } = params;

  // 1. Validate GPS Input
  const validation = validateGPSInput(input);
  if (!validation.valid) {
    throw new Error(`INVALID_GPS: ${validation.error}`);
  }

  // 2. Find active assigned delivery for this partner
  const activeDelivery = await prisma.delivery.findFirst({
    where: {
      deliveryPartnerId,
      status: {
        in: ['ACCEPTED', 'STARTED', 'ARRIVED_AT_SUPPLIER', 'PICKUP_CONFIRMED', 'ARRIVED_AT_CUSTOMER'],
      },
    },
    include: {
      currentLocation: true,
      order: { select: { id: true, orderNumber: true } },
    },
  });

  if (!activeDelivery) {
    throw new Error('NO_ACTIVE_DELIVERY: No active delivery found for location tracking');
  }

  const { latitude, longitude, accuracy = 10, heading = 0, speed = 0 } = input;
  const now = new Date();

  // 3. Location Throttling (Section 22)
  if (activeDelivery.currentLocation) {
    const prevLat = Number(activeDelivery.currentLocation.latitude);
    const prevLon = Number(activeDelivery.currentLocation.longitude);
    const distanceMoved = calculateDistanceMeters(prevLat, prevLon, latitude, longitude);
    const timeElapsedMs = now.getTime() - new Date(activeDelivery.currentLocation.timestamp).getTime();

    // Skip update if moved less than 5 meters AND less than 3 seconds elapsed
    if (distanceMoved < 5 && timeElapsedMs < 3000) {
      return { throttled: true, deliveryId: activeDelivery.id, orderId: activeDelivery.orderId };
    }
  }

  // 4. Update CurrentDeliveryLocation and write history log point in transaction
  const updatedLocation = await prisma.$transaction(async (tx) => {
    // Upsert CurrentDeliveryLocation
    const currentLoc = await tx.currentDeliveryLocation.upsert({
      where: { deliveryId: activeDelivery.id },
      create: {
        deliveryId: activeDelivery.id,
        deliveryPartnerId,
        latitude,
        longitude,
        accuracy,
        heading,
        speed,
        timestamp: now,
      },
      update: {
        latitude,
        longitude,
        accuracy,
        heading,
        speed,
        timestamp: now,
      },
    });

    // Create DeliveryPartnerLocation history record
    await tx.deliveryPartnerLocation.create({
      data: {
        deliveryPartnerId,
        userId,
        orderId: activeDelivery.orderId,
        deliveryId: activeDelivery.id,
        latitude,
        longitude,
        accuracy,
        heading,
        speed,
        timestamp: now,
      },
    });

    return currentLoc;
  });

  // 5. Broadcast DELIVERY_LOCATION_UPDATED via Supabase Realtime to order tracking channel
  const channelName = `order:${activeDelivery.orderId}:tracking`;
  try {
    await publishRealtimeEvent({
      eventType: 'DELIVERY_LOCATION_UPDATED',
      actorId: userId,
      actorRole: 'DELIVERY_PARTNER' as ActorRole,
      entityId: activeDelivery.id,
      channelName,
      payload: {
        deliveryId: activeDelivery.id,
        orderId: activeDelivery.orderId,
        deliveryPartnerId,
        latitude,
        longitude,
        heading,
        speed,
        accuracy,
        updatedAt: now.toISOString(),
      } as any,
    });
  } catch (err) {
    console.error('Failed to publish realtime location update:', err);
  }

  return {
    success: true,
    location: updatedLocation,
    orderId: activeDelivery.orderId,
  };
}

/**
 * Fetch authoritative latest current location for an authorized order
 */
export async function getLatestOrderLocation(orderId: string) {
  const delivery = await prisma.delivery.findUnique({
    where: { orderId },
    include: {
      currentLocation: true,
      deliveryPartner: {
        select: {
          id: true,
          rating: true,
          vehicleType: true,
          vehicleNumber: true,
          user: { select: { name: true, phone: true } },
        },
      },
    },
  });

  if (!delivery || !delivery.currentLocation) {
    return null;
  }

  // Check stale condition (Section 31: If location updates stop for > 2 minutes)
  const lastUpdated = new Date(delivery.currentLocation.timestamp);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastUpdated.getTime()) / (1000 * 60);

  return {
    deliveryId: delivery.id,
    orderId,
    deliveryPartner: delivery.deliveryPartner,
    location: {
      latitude: Number(delivery.currentLocation.latitude),
      longitude: Number(delivery.currentLocation.longitude),
      accuracy: Number(delivery.currentLocation.accuracy || 10),
      heading: Number(delivery.currentLocation.heading || 0),
      speed: Number(delivery.currentLocation.speed || 0),
      timestamp: delivery.currentLocation.timestamp.toISOString(),
    },
    isStale: diffMinutes > 2,
    staleSinceMinutes: Math.round(diffMinutes * 10) / 10,
  };
}
