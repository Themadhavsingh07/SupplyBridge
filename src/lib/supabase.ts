import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isConfigured =
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey.length > 10 &&
  !supabaseUrl.includes('your-supabase-project');

export const supabase: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Event Emitter fallback for local dev environment when Supabase keys are not yet provided.
 */
class RealtimeFallbackEmitter {
  private listeners: Map<string, Set<(payload: any) => void>> = new Map();

  on(channelName: string, eventName: string, callback: (payload: any) => void) {
    const key = `${channelName}:${eventName}`;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  emit(channelName: string, eventName: string, payload: any) {
    const key = `${channelName}:${eventName}`;
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach((cb) => cb(payload));
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(`supplybridge:${key}`, { detail: payload })
      );
    }
  }
}

export const fallbackEmitter = new RealtimeFallbackEmitter();

if (typeof window !== 'undefined' && !isConfigured) {
  console.info(
    '[SupplyBridge Realtime] Supabase Realtime using client-side fallback mode until NEXT_PUBLIC_SUPABASE_URL is configured.'
  );
}

export interface DeliveryLocationPayload {
  orderId: string;
  deliveryPartnerId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  updatedAt: string;
}

/**
 * Subscribe to Live Delivery Partner location updates for a specific order.
 */
export function subscribeToOrderLocation(
  orderId: string,
  onLocationUpdate: (location: DeliveryLocationPayload) => void
) {
  const channelName = `order-${orderId}-location`;

  if (supabase) {
    const channel = supabase.channel(channelName);
    channel
      .on('broadcast', { event: 'location_update' }, (response) => {
        if (response.payload) {
          onLocationUpdate(response.payload);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } else {
    return fallbackEmitter.on(channelName, 'location_update', onLocationUpdate);
  }
}

/**
 * Broadcast a live location update (called after backend validation or client emit).
 */
export function broadcastOrderLocation(
  orderId: string,
  payload: DeliveryLocationPayload
) {
  const channelName = `order-${orderId}-location`;

  if (supabase) {
    const channel = supabase.channel(channelName);
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'location_update',
          payload,
        });
      }
    });
  } else {
    fallbackEmitter.emit(channelName, 'location_update', payload);
  }
}

/**
 * Subscribe to Order Status updates.
 */
export function subscribeToOrderStatus(
  orderId: string,
  onStatusUpdate: (statusPayload: { orderId: string; status: string }) => void
) {
  const channelName = `order-${orderId}-status`;

  if (supabase) {
    const channel = supabase.channel(channelName);
    channel
      .on('broadcast', { event: 'status_update' }, (res) => {
        if (res.payload) onStatusUpdate(res.payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } else {
    return fallbackEmitter.on(channelName, 'status_update', onStatusUpdate);
  }
}

/**
 * Subscribe to Chat Messages for a specific conversation channel.
 */
export function subscribeToConversation(
  conversationId: string,
  onNewMessage: (message: any) => void
) {
  const channelName = `conversation-${conversationId}`;

  if (supabase) {
    const channel = supabase.channel(channelName);
    channel
      .on('broadcast', { event: 'new_message' }, (res) => {
        if (res.payload) onNewMessage(res.payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } else {
    return fallbackEmitter.on(channelName, 'new_message', onNewMessage);
  }
}

/**
 * Broadcast new chat message to conversation channel.
 */
export function broadcastNewMessage(conversationId: string, message: any) {
  const channelName = `conversation-${conversationId}`;

  if (supabase) {
    const channel = supabase.channel(channelName);
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'new_message',
          payload: message,
        });
      }
    });
  } else {
    fallbackEmitter.emit(channelName, 'new_message', message);
  }
}

/**
 * Subscribe to In-App Realtime Notifications for a specific user.
 */
export function subscribeToUserNotifications(
  userId: string,
  onNotification: (notification: any) => void
) {
  const channelName = `user-${userId}-notifications`;

  if (supabase) {
    const channel = supabase.channel(channelName);
    channel
      .on('broadcast', { event: 'notification' }, (res) => {
        if (res.payload) onNotification(res.payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } else {
    return fallbackEmitter.on(channelName, 'notification', onNotification);
  }
}

/**
 * Subscribe to Supplier online/offline status updates.
 */
export function subscribeToSupplierStatus(
  supplierId: string,
  onStatusChange: (status: { supplierId: string; isAvailable: boolean }) => void
) {
  const channelName = `supplier-${supplierId}-status`;

  if (supabase) {
    const channel = supabase.channel(channelName);
    channel
      .on('broadcast', { event: 'availability_change' }, (res) => {
        if (res.payload) onStatusChange(res.payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } else {
    return fallbackEmitter.on(channelName, 'availability_change', onStatusChange);
  }
}
