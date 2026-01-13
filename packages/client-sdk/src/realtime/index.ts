/**
 * Real-time Event System
 * 
 * Comprehensive event infrastructure for real-time notifications.
 * Supports bookings, messages, cancellations, and approvals.
 * 
 * Currently uses polling + event bus. Can be upgraded to WebSockets
 * by connecting to backend WS endpoint.
 */

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// =============================================================================
// Event Types
// =============================================================================

export type RealtimeEventType = 
  // Booking events
  | 'booking:created'
  | 'booking:updated'
  | 'booking:confirmed'
  | 'booking:cancelled'
  | 'booking:completed'
  // Message events
  | 'message:new'
  | 'message:read'
  | 'conversation:created'
  | 'conversation:updated'
  // Approval events
  | 'approval:requested'
  | 'approval:approved'
  | 'approval:rejected'
  // System events
  | 'notification:new'
  | 'system:connected'
  | 'system:disconnected';

export interface RealtimeEvent {
  type: RealtimeEventType;
  payload: {
    id?: string;
    conversationId?: string;
    bookingId?: string;
    userId?: string;
    organizationId?: string;
    message?: string;
    data?: unknown;
  };
  timestamp: string;
  source?: 'user' | 'admin' | 'system';
}

export type RealtimeEventHandler = (event: RealtimeEvent) => void;

// =============================================================================
// Event Emitter
// =============================================================================

class RealtimeEventEmitter {
  private handlers = new Map<string, Set<RealtimeEventHandler>>();
  private globalHandlers = new Set<RealtimeEventHandler>();
  private connectionState: 'connected' | 'disconnected' | 'connecting' = 'disconnected';
  private wsConnection: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Subscribe to specific event type
   */
  on(eventType: RealtimeEventType, handler: RealtimeEventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
    
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  /**
   * Subscribe to all events
   */
  onAny(handler: RealtimeEventHandler): () => void {
    this.globalHandlers.add(handler);
    return () => this.globalHandlers.delete(handler);
  }

  /**
   * Emit an event
   */
  emit(event: RealtimeEvent): void {
    // Notify specific handlers
    const handlers = this.handlers.get(event.type);
    handlers?.forEach((handler) => handler(event));
    
    // Notify global handlers
    this.globalHandlers.forEach((handler) => handler(event));
    
    if (typeof window !== 'undefined' && (window as unknown as { __DEV__?: boolean }).__DEV__) {
      console.log('[REALTIME]', event.type, event.payload);
    }
  }

  /**
   * Connect to WebSocket server (when backend supports it)
   */
  connect(wsUrl?: string): void {
    if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
      return;
    }

    this.connectionState = 'connecting';

    // If no WS URL, use polling mode (current implementation)
    if (!wsUrl) {
      this.connectionState = 'connected';
      this.emit({
        type: 'system:connected',
        payload: { message: 'Connected via polling' },
        timestamp: new Date().toISOString(),
        source: 'system',
      });
      return;
    }

    // WebSocket connection (for future backend integration)
    try {
      this.wsConnection = new WebSocket(wsUrl);

      this.wsConnection.onopen = () => {
        this.connectionState = 'connected';
        this.reconnectAttempts = 0;
        this.emit({
          type: 'system:connected',
          payload: { message: 'WebSocket connected' },
          timestamp: new Date().toISOString(),
          source: 'system',
        });
      };

      this.wsConnection.onmessage = (msg) => {
        try {
          const event = JSON.parse(msg.data) as RealtimeEvent;
          this.emit(event);
        } catch (e) {
          console.error('[REALTIME] Failed to parse message:', e);
        }
      };

      this.wsConnection.onclose = () => {
        this.connectionState = 'disconnected';
        this.emit({
          type: 'system:disconnected',
          payload: { message: 'WebSocket disconnected' },
          timestamp: new Date().toISOString(),
          source: 'system',
        });
        this.attemptReconnect(wsUrl);
      };

      this.wsConnection.onerror = (error) => {
        console.error('[REALTIME] WebSocket error:', error);
      };
    } catch (error) {
      console.error('[REALTIME] Failed to connect:', error);
      this.connectionState = 'disconnected';
    }
  }

  private attemptReconnect(wsUrl: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[REALTIME] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`[REALTIME] Reconnect attempt ${this.reconnectAttempts}`);
      this.connect(wsUrl);
    }, delay);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.wsConnection?.close();
    this.wsConnection = null;
    this.connectionState = 'disconnected';
  }

  /**
   * Get connection state
   */
  isConnected(): boolean {
    return this.connectionState === 'connected';
  }
}

// Global singleton
export const realtimeEvents = new RealtimeEventEmitter();

// =============================================================================
// React Hooks
// =============================================================================

/**
 * Subscribe to a specific event type
 */
export function useRealtimeEvent(
  eventType: RealtimeEventType,
  handler: RealtimeEventHandler
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    return realtimeEvents.on(eventType, (event) => {
      handlerRef.current(event);
    });
  }, [eventType]);
}

/**
 * Subscribe to all events
 */
export function useRealtimeEvents(handler: RealtimeEventHandler): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    return realtimeEvents.onAny((event) => {
      handlerRef.current(event);
    });
  }, []);
}

/**
 * Auto-invalidate queries when events occur
 */
export function useRealtimeQueryInvalidation(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = realtimeEvents.onAny((event) => {
      // Invalidate relevant queries based on event type
      switch (event.type) {
        case 'booking:created':
        case 'booking:updated':
        case 'booking:confirmed':
        case 'booking:cancelled':
        case 'booking:completed':
          queryClient.invalidateQueries({ queryKey: ['bookings'] });
          if (event.payload.bookingId) {
            queryClient.invalidateQueries({ 
              queryKey: ['bookings', event.payload.bookingId] 
            });
          }
          break;

        case 'message:new':
        case 'message:read':
        case 'conversation:created':
        case 'conversation:updated':
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          if (event.payload.conversationId) {
            queryClient.invalidateQueries({ 
              queryKey: ['conversations', 'detail', event.payload.conversationId] 
            });
          }
          break;

        case 'approval:requested':
        case 'approval:approved':
        case 'approval:rejected':
          queryClient.invalidateQueries({ queryKey: ['bookings'] });
          queryClient.invalidateQueries({ queryKey: ['approvals'] });
          break;
      }
    });

    return unsubscribe;
  }, [queryClient]);
}

/**
 * Connect to realtime service on mount
 */
export function useRealtimeConnection(wsUrl?: string): boolean {
  const isConnectedRef = useRef(false);

  useEffect(() => {
    realtimeEvents.connect(wsUrl);
    isConnectedRef.current = realtimeEvents.isConnected();

    return () => {
      // Don't disconnect on unmount - keep connection alive
    };
  }, [wsUrl]);

  return realtimeEvents.isConnected();
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Emit a booking event (call after mutations succeed)
 */
export function emitBookingEvent(
  type: 'created' | 'updated' | 'confirmed' | 'cancelled' | 'completed',
  bookingId: string,
  data?: unknown
): void {
  realtimeEvents.emit({
    type: `booking:${type}`,
    payload: { bookingId, data },
    timestamp: new Date().toISOString(),
    source: 'user',
  });
}

/**
 * Emit a message event
 */
export function emitMessageEvent(
  type: 'new' | 'read',
  conversationId: string,
  data?: unknown
): void {
  realtimeEvents.emit({
    type: `message:${type}`,
    payload: { conversationId, data },
    timestamp: new Date().toISOString(),
    source: 'user',
  });
}

/**
 * Emit a notification
 */
export function emitNotification(message: string, data?: unknown): void {
  realtimeEvents.emit({
    type: 'notification:new',
    payload: { message, data },
    timestamp: new Date().toISOString(),
    source: 'system',
  });
}
