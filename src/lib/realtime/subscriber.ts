import {
  RealtimeConnectionStatus,
  RealtimeEvent,
  RealtimeEventMap,
  RealtimeEventType,
} from '@/types/realtime';
import { supabase, fallbackEmitter } from '@/lib/supabase';
import { payloadSchemasMap } from './validators';

export interface SubscriberOptions<K extends RealtimeEventType> {
  channelName: string;
  eventType: K;
  onEvent: (event: RealtimeEvent<K, RealtimeEventMap[K]>) => void;
  onStatusChange?: (status: RealtimeConnectionStatus) => void;
  fetchLatestState?: () => Promise<void>;
}

/**
 * Manages Supabase Realtime channel subscriptions with idempotency tracking,
 * connection status handling, payload validation, and automatic reconciliation.
 */
export class RealtimeSubscriber<K extends RealtimeEventType> {
  private channelName: string;
  private eventType: K;
  private onEvent: (event: RealtimeEvent<K, RealtimeEventMap[K]>) => void;
  private onStatusChange?: (status: RealtimeConnectionStatus) => void;
  private fetchLatestState?: () => Promise<void>;

  private seenEventIds: Set<string> = new Set();
  private status: RealtimeConnectionStatus = 'DISCONNECTED';
  private unsubscribeFn?: () => void;

  constructor(options: SubscriberOptions<K>) {
    this.channelName = options.channelName;
    this.eventType = options.eventType;
    this.onEvent = options.onEvent;
    this.onStatusChange = options.onStatusChange;
    this.fetchLatestState = options.fetchLatestState;
  }

  private setStatus(newStatus: RealtimeConnectionStatus) {
    this.status = newStatus;
    if (this.onStatusChange) {
      this.onStatusChange(newStatus);
    }
  }

  public getStatus(): RealtimeConnectionStatus {
    return this.status;
  }

  public subscribe(): () => void {
    this.setStatus('CONNECTING');

    const handleIncomingEnvelope = (event: RealtimeEvent<any, any>) => {
      // 1. Idempotency check: Ignore already seen event IDs
      if (this.seenEventIds.has(event.eventId)) {
        console.info(`[Realtime Subscriber] Ignored duplicate eventId: ${event.eventId}`);
        return;
      }
      this.seenEventIds.add(event.eventId);

      // Keep cache size bounded (max 500 IDs)
      if (this.seenEventIds.size > 500) {
        const first = this.seenEventIds.values().next().value;
        if (first) this.seenEventIds.delete(first);
      }

      // 2. Validate payload if schema exists
      const schema = payloadSchemasMap[event.eventType];
      if (schema) {
        const parse = schema.safeParse(event.payload);
        if (!parse.success) {
          console.warn(`[Realtime Subscriber] Invalid incoming payload for ${event.eventType}:`, parse.error.format());
          return;
        }
      }

      // 3. Dispatch to listener
      this.onEvent(event);
    };

    if (supabase) {
      const channel = supabase.channel(this.channelName);
      channel
        .on('broadcast', { event: this.eventType }, (response) => {
          if (response.payload) {
            handleIncomingEnvelope(response.payload);
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.setStatus('CONNECTED');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            this.setStatus('ERROR');
            // Attempt state reconciliation if connection had issues
            if (this.fetchLatestState) {
              this.fetchLatestState().catch(console.error);
            }
          } else if (status === 'CLOSED') {
            this.setStatus('DISCONNECTED');
          }
        });

      this.unsubscribeFn = () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
        this.setStatus('DISCONNECTED');
      };
    } else {
      // Fallback Emitter connection for local dev
      const unsub = fallbackEmitter.on(
        this.channelName,
        this.eventType,
        handleIncomingEnvelope
      );

      this.setStatus('CONNECTED');

      this.unsubscribeFn = () => {
        unsub();
        this.setStatus('DISCONNECTED');
      };
    }

    return () => {
      if (this.unsubscribeFn) this.unsubscribeFn();
    };
  }
}

/**
 * Convenience helper to create and start a subscription.
 */
export function subscribeToRealtimeContract<K extends RealtimeEventType>(
  options: SubscriberOptions<K>
): () => void {
  const subscriber = new RealtimeSubscriber(options);
  return subscriber.subscribe();
}
