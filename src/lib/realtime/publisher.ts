import { RealtimeEvent, RealtimeEventMap, RealtimeEventType } from '@/types/realtime';
import { createRealtimeEvent } from './events';
import { payloadSchemasMap, realtimeEnvelopeSchema } from './validators';
import { supabase, fallbackEmitter } from '@/lib/supabase';

/**
 * Publishes a strongly-typed, Zod-validated Realtime Event to Supabase Realtime.
 * Must ONLY be called AFTER the database transaction has successfully committed!
 */
export async function publishRealtimeEvent<K extends RealtimeEventType>(
  channelName: string,
  eventType: K,
  actorId: string,
  actorRole: any,
  entityId: string,
  payload: RealtimeEventMap[K]
): Promise<{ success: boolean; event: RealtimeEvent<K, RealtimeEventMap[K]>; error?: string }> {
  // 1. Validate payload with Zod schema
  const payloadSchema = payloadSchemasMap[eventType];
  if (payloadSchema) {
    const parsePayload = payloadSchema.safeParse(payload);
    if (!parsePayload.success) {
      console.error(`[Realtime Publisher Error] Payload invalid for event ${eventType}:`, parsePayload.error.format());
      return {
        success: false,
        event: null as any,
        error: `Payload validation failed for ${eventType}: ${parsePayload.error.message}`,
      };
    }
  }

  // 2. Build Event Envelope
  const event = createRealtimeEvent(eventType, actorId, actorRole, entityId, payload);

  // 3. Validate Envelope
  const parseEnvelope = realtimeEnvelopeSchema.safeParse(event);
  if (!parseEnvelope.success) {
    console.error(`[Realtime Publisher Error] Envelope validation failed:`, parseEnvelope.error.format());
    return {
      success: false,
      event,
      error: 'Envelope validation failed',
    };
  }

  // 4. Broadcast to Supabase Realtime
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
