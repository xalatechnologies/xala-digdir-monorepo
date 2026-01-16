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
} from '../realtime';
import { queryKeys } from './query-keys';

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
 * Hook to handle booking conflicts in real-time
 * Monitors booking events for potential conflicts with user's current selections
 * Auto-invalidates availability queries when conflicts detected
 */
export function useRealtimeBookingConflicts(
  listingId?: string,
  onConflict?: (event: RealtimeEvent) => void
) {
  const queryClient = useQueryClient();
  const listingIdRef = useRef(listingId);
  const onConflictRef = useRef(onConflict);

  listingIdRef.current = listingId;
  onConflictRef.current = onConflict;

  useEffect(() => {
    const unsubscribe = realtimeClient.onBooking((event) => {
      // Check if this booking event affects the current listing
      const eventData = event.data as any;
      const affectsCurrentListing = !listingIdRef.current ||
        (eventData?.listingId === listingIdRef.current);

      if (affectsCurrentListing) {
        // Invalidate availability queries to refetch latest data
        queryClient.invalidateQueries({ queryKey: ['availability'] });
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
        queryClient.invalidateQueries({ queryKey: ['bookings'] });

        // Notify about potential conflict
        onConflictRef.current?.(event);
      }
    });

    return unsubscribe;
  }, [queryClient]);
}

/**
 * Hook to subscribe to rental object events
 * Auto-invalidates rental object queries when events arrive
 */
export function useRealtimeRentalObjects(handler?: RealtimeEventHandler) {
  const queryClient = useQueryClient();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = realtimeClient.onRentalObject((event) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.rentalObjects.all });
      // Also invalidate backward compatibility keys
      queryClient.invalidateQueries({ queryKey: ['listings'] });

      // Call custom handler if provided
      handlerRef.current?.(event);
    });

    return unsubscribe;
  }, [queryClient]);
}

/**
 * Hook to subscribe to calendar events (bookings, blocks, allocations)
 * Auto-invalidates calendar-related queries when events arrive
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
      queryClient.invalidateQueries({ queryKey: ['blocks'] });
      queryClient.invalidateQueries({ queryKey: ['allocations'] });

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
 * Hook to subscribe to notification events
 * Auto-invalidates notification queries when events arrive
 */
export function useRealtimeNotifications(handler?: RealtimeEventHandler) {
  const queryClient = useQueryClient();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = realtimeClient.on('notification', (event) => {
      // Invalidate notification queries to refetch latest data
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

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
