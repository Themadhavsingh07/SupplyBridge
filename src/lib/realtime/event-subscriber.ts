import {
  RealtimeConnectionStatus,
  RealtimeEvent,
  RealtimeEventMap,
  RealtimeEventType,
} from '@/types/realtime';
import { supabase, fallbackEmitter } from '@/lib/supabase';
import { eventSchemasMap } from './event-schemas';
import { globalIdempotencyManager } from './event-id';

export interface EventSubscriberOptions<K extends RealtimeEventType> {
  channelName: string;
  eventType: K;
  onEvent: (event: RealtimeEvent<K, RealtimeEventMap[K]>) => void;
  onStatusChange?: (status: RealtimeConnectionStatus) => void;
  fetchLatestState?: () => Promise<void>;
}

export class RealtimeEventSubscriber<K extends RealtimeEventType> {
  private channelName: string;
  private eventType: K;
  private onEvent: (event: RealtimeEvent<K, RealtimeEventMap[K]>) => void;
  private onStatusChange?: (status: RealtimeConnectionStatus) => void;
  private fetchLatestState?: () => Promise<void>;

  private status: RealtimeConnectionStatus = 'DISCONNECTED';
  private unsubscribeFn?: () => void;

  constructor(options: EventSubscriberOptions<K>) {
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

    const handleIncomingEvent = (event: RealtimeEvent<K, RealtimeEventMap[K]>) => {
      // 1. Idempotency check: Ignore already processed event IDs
      if (globalIdempotencyManager.hasBeenProcessed(event.eventId)) {
        console.info(`[EventSubscriber] Ignored duplicate eventId: ${event.eventId}`);
        return;
      }
      globalIdempotencyManager.markProcessed(event.eventId);

      // 2. Validate payload against Zod schema
      const schema = eventSchemasMap[event.eventType];
      if (schema) {
        const parse = schema.safeParse(event.payload);
        if (!parse.success) {
          console.warn(`[EventSubscriber] Invalid incoming payload for ${event.eventType}:`, parse.error.format());
          return;
        }
      }

      // 3. Dispatch to component callback
      this.onEvent(event);
    };

    if (supabase) {
      const channel = supabase.channel(this.channelName);
      channel
        .on('broadcast', { event: this.eventType }, (response) => {
          if (response.payload) {
            handleIncomingEvent(response.payload);
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.setStatus('CONNECTED');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            this.setStatus('ERROR');
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
      const unsub = fallbackEmitter.on(
        this.channelName,
        this.eventType,
        handleIncomingEvent
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

export function subscribeToRealtimeEvent<K extends RealtimeEventType>(
  options: EventSubscriberOptions<K>
): () => void {
  const subscriber = new RealtimeEventSubscriber(options);
  return subscriber.subscribe();
}
