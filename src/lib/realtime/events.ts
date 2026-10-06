import { ActorRole, RealtimeEvent, RealtimeEventMap, RealtimeEventType } from '@/types/realtime';

export const CURRENT_EVENT_VERSION = 1;

/**
 * Creates a strictly typed and structured RealtimeEvent envelope.
 */
export function createRealtimeEvent<K extends RealtimeEventType>(
  eventType: K,
  actorId: string,
  actorRole: ActorRole,
  entityId: string,
  payload: RealtimeEventMap[K],
  version: 1 = 1
): RealtimeEvent<K, RealtimeEventMap[K]> {
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const timestamp = new Date().toISOString();

  return {
    eventId,
    eventType,
    version,
    timestamp,
    actorId,
    actorRole,
    entityId,
    payload,
  };
}
