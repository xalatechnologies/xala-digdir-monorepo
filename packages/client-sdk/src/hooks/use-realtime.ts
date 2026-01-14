/**
 * Realtime React Hooks
 * React hooks for integrating with the WebSocket realtimeClient
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  realtimeClient, 
  type RealtimeEvent, 
  type RealtimeEventHandler,
  type RealtimeClientConfig,
  createTenantWebSocketUrl,
} from '../realtime';

/**
 * Hook to connect to realtime WebSocket on mount
 */
export function useRealtimeConnection(config?: Partial<RealtimeClientConfig>) {
  const [isConnected, setIsConnected] = useState(realtimeClient.isConnected);
  
  useEffect(() => {
    if (!config?.url) return;

    realtimeClient.connect({
      url: config.url,
      autoReconnect: config.autoReconnect ?? true,
      reconnectInterval: config.reconnectInterval ?? 3000,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 5,
      tenantId: config.tenantId,
    });

    const unsubscribe = realtimeClient.on('connected', () => {
      setIsConnected(true);
    });

    return () => {
      unsubscribe();
    };
  }, [config?.url, config?.autoReconnect, config?.reconnectInterval, config?.maxReconnectAttempts, config?.tenantId]);

  return isConnected;
}

/**
 * Hook to subscribe to booking events
 * Auto-invalidates booking queries when events arrive
 */
export function useRealtimeBookings(handler?: RealtimeEventHandler) {
  const queryClient = useQueryClient();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = realtimeClient.onBooking((event) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      
      // Call custom handler if provided
      handlerRef.current?.(event);
    });

    return unsubscribe;
  }, [queryClient]);
}

/**
 * Hook to subscribe to listing events
 * Auto-invalidates listing queries when events arrive
 */
export function useRealtimeListings(handler?: RealtimeEventHandler) {
  const queryClient = useQueryClient();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = realtimeClient.onListing((event) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      
      // Call custom handler if provided
      handlerRef.current?.(event);
    });

    return unsubscribe;
  }, [queryClient]);
}

/**
 * Hook to subscribe to message events
 * Updates unread count and invalidates conversation queries
 */
export function useRealtimeMessages(handler?: RealtimeEventHandler) {
  const queryClient = useQueryClient();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = realtimeClient.onMessage((event) => {
      // Invalidate conversation queries
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      
      // Call custom handler if provided
      handlerRef.current?.(event);
    });

    return unsubscribe;
  }, [queryClient]);
}

/**
 * Hook to subscribe to calendar events
 * Auto-invalidates calendar and booking queries when events arrive
 */
export function useRealtimeCalendar(handler?: RealtimeEventHandler) {
  const queryClient = useQueryClient();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = realtimeClient.onBooking((event) => {
      // Invalidate calendar-related queries
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['availability-slots'] });

      // Call custom handler if provided
      handlerRef.current?.(event);
    });

    return unsubscribe;
  }, [queryClient]);
}

/**
 * Hook to subscribe to audit events (admin only)
 */
export function useRealtimeAudit(handler?: RealtimeEventHandler) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = realtimeClient.onAudit((event) => {
      handlerRef.current?.(event);
    });

    return unsubscribe;
  }, []);
}

/**
 * Hook to subscribe to all realtime events
 */
export function useRealtimeEvents(handler: RealtimeEventHandler) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = realtimeClient.onAll((event) => {
      handlerRef.current(event);
    });

    return unsubscribe;
  }, []);
}

/**
 * Hook for notification badge count
 * Returns unread count that updates in real-time
 */
export function useNotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = realtimeClient.on('notification', (event) => {
      if (event.data && typeof event.data === 'object' && 'unreadCount' in event.data) {
        setUnreadCount((event.data as { unreadCount: number }).unreadCount);
      }
    });

    return unsubscribe;
  }, []);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return { unreadCount, markAsRead };
}

/**
 * Hook to send realtime messages
 */
export function useRealtimeSend() {
  const send = useCallback((data: unknown) => {
    realtimeClient.send(data);
  }, []);

  const ping = useCallback(() => {
    realtimeClient.ping();
  }, []);

  return { send, ping, isConnected: realtimeClient.isConnected };
}
