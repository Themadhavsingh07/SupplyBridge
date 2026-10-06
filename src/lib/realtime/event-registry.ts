/**
 * SUPPLYBRIDGE — COMPLETE REALTIME EVENT REGISTRY
 * Unified single source of truth entry point for all realtime events in SupplyBridge.
 */

export * from '@/types/realtime';
export * from './event-types';
export * from './event-id';
export * from './event-schemas';
export * from './channel-registry';
export * from './authorization';
export * from './event-publisher';
export * from './event-subscriber';

import { ActorRole, RealtimeEvent, RealtimeEventMap, RealtimeEventType } from '@/types/realtime';
import { generateEventId } from './event-id';

/**
 * Creates a strongly typed RealtimeEvent envelope.
 * Automatically fills eventId, timestamp, and version = 1.
 */
export function createRealtimeEvent<K extends RealtimeEventType>(
  eventType: K,
  actorId: string,
  actorRole: ActorRole,
  entityId: string,
  payload: RealtimeEventMap[K]
): RealtimeEvent<K, RealtimeEventMap[K]> {
  return {
    eventId: generateEventId(),
    eventType,
    version: 1,
    timestamp: new Date().toISOString(),
    actorId,
    actorRole,
    entityId,
    payload,
  };
}
