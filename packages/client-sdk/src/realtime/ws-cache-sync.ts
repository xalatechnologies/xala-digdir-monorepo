/**
 * WebSocket Cache Sync
 * 
 * Risk 3 Mitigation: Every WS event maps to invalidation rules
 * This ensures WS never bypasses DAL cache logic
 */

import type { QueryClient } from '@tanstack/react-query';

// ==============================================================================
// WebSocket Event Types
// ==============================================================================

export type WSEventType =
  // Booking events
  | 'booking.created'
  | 'booking.updated'
  | 'booking.cancelled'
  | 'booking.confirmed'
  | 'booking.completed'
  // Listing events
  | 'listing.updated'
  | 'listing.published'
  | 'listing.unpublished'
  | 'listing.deleted'
  // Availability events
  | 'availability.changed'
  | 'block.created'
  | 'block.removed'
  // Organization events
  | 'organization.updated'
  | 'member.added'
  | 'member.removed'
  // Review events
  | 'review.created'
  | 'review.approved'
  // Season events
  | 'season.updated'
  | 'application.submitted'
  | 'application.allocated'
  // Reservation events (recurring booking)
  | 'reservation.created'
  | 'reservation.expired';

export interface WSEvent<T = unknown> {
  type: WSEventType;
  payload: T;
  tenantId: string;
  timestamp: string;
  correlationId?: string;
}

// ==============================================================================
// Event → Invalidation Mapping (Single Source of Truth)
// ==============================================================================

/**
 * Maps WebSocket event types to query keys to invalidate
 * This ensures WS events follow the same invalidation rules as mutations
 */
export const wsInvalidationMap: Record<WSEventType, string[][]> = {
  // Booking events
  'booking.created': [
    ['listing', 'availability'],
    ['booking', 'mine'],
    ['organization', 'bookings'],
  ],
  'booking.updated': [
    ['booking', 'details'],
    ['booking', 'mine'],
  ],
  'booking.cancelled': [
    ['listing', 'availability'],
    ['booking', 'mine'],
    ['booking', 'details'],
    ['organization', 'bookings'],
  ],
  'booking.confirmed': [
    ['booking', 'mine'],
    ['booking', 'details'],
  ],
  'booking.completed': [
    ['booking', 'mine'],
    ['booking', 'details'],
  ],

  // Listing events
  'listing.updated': [
    ['listing', 'details'],
    ['listing', 'search'],
  ],
  'listing.published': [
    ['listing', 'details'],
    ['listing', 'search'],
  ],
  'listing.unpublished': [
    ['listing', 'details'],
    ['listing', 'search'],
  ],
  'listing.deleted': [
    ['listing', 'search'],
  ],

  // Availability events
  'availability.changed': [
    ['listing', 'availability'],
  ],
  'block.created': [
    ['listing', 'availability'],
  ],
  'block.removed': [
    ['listing', 'availability'],
  ],

  // Organization events
  'organization.updated': [
    ['organization', 'details'],
    ['organization', 'mine'],
  ],
  'member.added': [
    ['organization', 'members'],
  ],
  'member.removed': [
    ['organization', 'members'],
  ],

  // Review events
  'review.created': [
    ['listing', 'details'],
    ['review', 'listing'],
  ],
  'review.approved': [
    ['listing', 'details'],
    ['review', 'listing'],
  ],

  // Season events
  'season.updated': [
    ['config', 'seasons'],
    ['season', 'details'],
  ],
  'application.submitted': [
    ['season', 'applications'],
  ],
  'application.allocated': [
    ['season', 'applications'],
    ['allocation'],
  ],

  // Reservation events (recurring booking)
  'reservation.created': [
    ['listing', 'availability'],
    ['recurringPreview'],
  ],
  'reservation.expired': [
    ['listing', 'availability'],
    ['recurringPreview'],
  ],
};

// ==============================================================================
// Cache Sync Handler
// ==============================================================================

export class WebSocketCacheSync {
  private queryClient: QueryClient | null = null;
  private connected = false;

  /**
   * Initialize with React Query client
   */
  initialize(queryClient: QueryClient): void {
    this.queryClient = queryClient;
  }

  /**
   * Handle incoming WebSocket event
   * Automatically invalidates correct queries based on event type
   */
  handleEvent(event: WSEvent): void {
    if (!this.queryClient) {
      console.warn('[WS-Cache] QueryClient not initialized');
      return;
    }

    const keysToInvalidate = wsInvalidationMap[event.type];
    if (!keysToInvalidate) {
      console.warn(`[WS-Cache] Unknown event type: ${event.type}`);
      return;
    }

    // Invalidate all matching query keys
    keysToInvalidate.forEach(queryKey => {
      this.queryClient!.invalidateQueries({
        queryKey,
        refetchType: 'active', // Only refetch if query is active
      });
    });

    console.debug(`[WS-Cache] Invalidated ${keysToInvalidate.length} queries for ${event.type}`);
  }

  /**
   * Connect to WebSocket and start syncing
   */
  connect(wsUrl: string, tenantId: string): void {
    if (this.connected) return;

    const ws = new WebSocket(`${wsUrl}?tenantId=${tenantId}`);

    ws.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data) as WSEvent;
        this.handleEvent(event);
      } catch (error) {
        console.error('[WS-Cache] Failed to parse event:', error);
      }
    };

    ws.onopen = () => {
      this.connected = true;
      console.log('[WS-Cache] Connected');
    };

    ws.onclose = () => {
      this.connected = false;
      console.log('[WS-Cache] Disconnected, will reconnect...');
      // Auto-reconnect after 3 seconds
      setTimeout(() => this.connect(wsUrl, tenantId), 3000);
    };
  }
}

// Singleton instance
export const wsCacheSync = new WebSocketCacheSync();

// ==============================================================================
// React Integration Hook
// ==============================================================================

/**
 * Hook to use in React app to enable WebSocket cache sync
 * 
 * @example
 * ```tsx
 * function App() {
 *   useWebSocketCacheSync();
 *   return <YourApp />;
 * }
 * ```
 */
export function createUseWebSocketCacheSync(queryClient: QueryClient) {
  return function useWebSocketCacheSync(wsUrl: string, tenantId: string) {
    wsCacheSync.initialize(queryClient);
    wsCacheSync.connect(wsUrl, tenantId);
  };
}
