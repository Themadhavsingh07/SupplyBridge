import { ActorRole, RealtimeEvent, RealtimeEventMap, RealtimeEventType } from '@/types/realtime';
import { generateEventId } from './event-id';
import { eventSchemasMap, realtimeEnvelopeSchema } from './event-schemas';
import { getChannelForEvent } from './channel-registry';
import { supabase, fallbackEmitter } from '@/lib/supabase';

export interface PublishOptions<K extends RealtimeEventType> {
  eventType: K;
  actorId: string;
  actorRole: ActorRole;
  entityId: string;
  payload: RealtimeEventMap[K];
  channelName?: string;
}

/**
 * Single, central entry point for publishing typed realtime events across SupplyBridge.
 * MUST be invoked ONLY AFTER PostgreSQL database transaction successfully commits.
 */
export async function publishRealtimeEvent<K extends RealtimeEventType>(
  options: PublishOptions<K>
): Promise<{ success: boolean; event: RealtimeEvent<K, RealtimeEventMap[K]>; error?: string }> {
  const { eventType, actorId, actorRole, entityId, payload } = options;

  // 1. Validate payload with Zod schema
  const payloadSchema = eventSchemasMap[eventType];
  if (payloadSchema) {
    const parsePayload = payloadSchema.safeParse(payload);
    if (!parsePayload.success) {
      console.error(`[EventPublisher] Invalid payload for ${eventType}:`, parsePayload.error.format());
      return {
        success: false,
        event: null as any,
        error: `Payload validation failed for ${eventType}: ${parsePayload.error.message}`,
      };
    }
  }

  // 2. Build Event Envelope
  const event: RealtimeEvent<K, RealtimeEventMap[K]> = {
    eventId: generateEventId(),
    eventType,
    version: 1,
    timestamp: new Date().toISOString(),
    actorId,
    actorRole,
    entityId,
    payload,
  };

  // 3. Validate Envelope
  const parseEnvelope = realtimeEnvelopeSchema.safeParse(event);
  if (!parseEnvelope.success) {
    console.error(`[EventPublisher] Envelope validation error:`, parseEnvelope.error.format());
    return {
      success: false,
      event,
      error: 'Envelope validation failed',
    };
  }

  // 4. Resolve Channel Name
  const channelName = options.channelName || getChannelForEvent(eventType, payload);

  // 5. Broadcast to Supabase Realtime
  if (supabase) {
    const channel = supabase.channel(channelName);
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: eventType,
          payload: event,
        });
      }
    });
  } else {
    fallbackEmitter.emit(channelName, eventType, event);
  }

  return { success: true, event };
}
