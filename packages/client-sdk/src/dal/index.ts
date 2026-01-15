/**
 * Data Access Layer (DAL)
 * Central cache management and query key factory
 * 
 * XALA Architecture Compliance:
 * - DAL owns cache + invalidation
 * - Single source of truth for query keys
 * - WebSocket events invalidate availability & previews
 */

import type { QueryClient } from '@tanstack/react-query';
import type { AvailabilityQueryParams } from '../types/rental-object';

// =============================================================================
// Query Key Factory
// Single Responsibility: Centralized query key management
// =============================================================================

export const dalKeys = {
  // =========================================================================
  // Rental Object Keys (primary domain)
  // =========================================================================
  rentalObject: {
    all: ['rentalObject'] as const,
    lists: () => [...dalKeys.rentalObject.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...dalKeys.rentalObject.lists(), params] as const,
    details: () => [...dalKeys.rentalObject.all, 'detail'] as const,
    detail: (id: string) => [...dalKeys.rentalObject.details(), id] as const,
    bySlug: (slug: string) => [...dalKeys.rentalObject.all, 'slug', slug] as const,
    
    // Calendar configuration - drives booking UI behavior
    calendarConfig: (id: string) => [...dalKeys.rentalObject.detail(id), 'calendarConfig'] as const,
    
    // Availability - server-computed slots with status
    availability: (id: string, range: { startDate: string; endDate: string }) => 
      [...dalKeys.rentalObject.detail(id), 'availability', range] as const,
    
    // Statistics
    stats: (id: string) => [...dalKeys.rentalObject.detail(id), 'stats'] as const,
  },

  // =========================================================================
  // Booking Keys
  // =========================================================================
  booking: {
    all: ['booking'] as const,
    lists: () => [...dalKeys.booking.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...dalKeys.booking.lists(), params] as const,
    details: () => [...dalKeys.booking.all, 'detail'] as const,
    detail: (id: string) => [...dalKeys.booking.details(), id] as const,
    my: (params?: Record<string, unknown>) => [...dalKeys.booking.all, 'my', params] as const,
    
    // Quote - rental-object-driven pricing/availability check
    quote: (rentalObjectId: string, selectionHash: string) => 
      [...dalKeys.booking.all, 'quote', rentalObjectId, selectionHash] as const,
    
    // Recurring preview - server-computed occurrence preview
    recurringPreview: (selectionHash: string) => 
      [...dalKeys.booking.all, 'recurringPreview', selectionHash] as const,
    
    // Payment reconciliation
    reconciliation: (params?: Record<string, unknown>) => 
      [...dalKeys.booking.all, 'reconciliation', params] as const,
  },

  // =========================================================================
  // Calendar Keys (derived from rental objects)
  // =========================================================================
  calendar: {
    all: ['calendar'] as const,
    events: (rentalObjectId: string, params?: { startDate?: string; endDate?: string }) => 
      [...dalKeys.calendar.all, 'events', rentalObjectId, params] as const,
    slots: (rentalObjectId: string, date: string) => 
      [...dalKeys.calendar.all, 'slots', rentalObjectId, date] as const,
  },
} as const;

// =============================================================================
// Cache Invalidation Helpers
// =============================================================================

/**
 * Invalidate all availability queries for a rental object
 * Called when a booking is created, updated, or cancelled
 */
export function invalidateAvailability(
  queryClient: QueryClient,
  rentalObjectId: string
): void {
  queryClient.invalidateQueries({
    queryKey: [...dalKeys.rentalObject.detail(rentalObjectId), 'availability'],
  });
  queryClient.invalidateQueries({
    queryKey: dalKeys.calendar.events(rentalObjectId),
  });
}

/**
 * Invalidate all booking queries
 * Called when any booking mutation occurs
 */
export function invalidateBookings(queryClient: QueryClient): void {
  queryClient.invalidateQueries({
    queryKey: dalKeys.booking.all,
  });
}

/**
 * Invalidate quote cache for a rental object
 * Called when availability changes
 */
export function invalidateQuotes(
  queryClient: QueryClient,
  rentalObjectId: string
): void {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey;
      return (
        key[0] === 'booking' &&
        key[1] === 'quote' &&
        key[2] === rentalObjectId
      );
    },
  });
}

/**
 * Invalidate recurring preview cache
 * Called when availability changes
 */
export function invalidateRecurringPreviews(queryClient: QueryClient): void {
  queryClient.invalidateQueries({
    queryKey: [...dalKeys.booking.all, 'recurringPreview'],
  });
}

// =============================================================================
// WebSocket Event Handlers
// =============================================================================

export interface BookingWebSocketEvent {
  type: 'created' | 'updated' | 'cancelled' | 'confirmed' | 'completed';
  bookingId: string;
  listingId: string;
  tenantId: string;
  startTime: string;
  endTime: string;
  userId?: string;
  version?: number;
}

/**
 * Handle booking WebSocket events
 * Invalidates relevant caches to ensure UI stays in sync
 */
export function handleBookingEvent(
  queryClient: QueryClient,
  event: BookingWebSocketEvent
): void {
  // Invalidate availability for the affected rental object
  invalidateAvailability(queryClient, event.listingId);
  
  // Invalidate quotes for the affected rental object
  invalidateQuotes(queryClient, event.listingId);
  
  // Invalidate recurring previews
  invalidateRecurringPreviews(queryClient);
  
  // Invalidate specific booking detail
  queryClient.invalidateQueries({
    queryKey: dalKeys.booking.detail(event.bookingId),
  });
  
  // Invalidate booking lists
  queryClient.invalidateQueries({
    queryKey: dalKeys.booking.lists(),
  });
}

/**
 * Create a hash from booking selection for cache key
 */
export function createSelectionHash(selection: {
  listingId: string;
  startTime: string;
  endTime: string;
  mode?: string;
}): string {
  return `${selection.listingId}-${selection.startTime}-${selection.endTime}-${selection.mode || 'SINGLE_SLOT'}`;
}

// =============================================================================
// Prefetch Helpers
// =============================================================================

/**
 * Prefetch rental object availability for a date range
 */
export async function prefetchAvailability(
  queryClient: QueryClient,
  rentalObjectId: string,
  params: AvailabilityQueryParams,
  fetchFn: () => Promise<unknown>
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: dalKeys.rentalObject.availability(rentalObjectId, {
      startDate: params.startDate,
      endDate: params.endDate,
    }),
    queryFn: fetchFn,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Prefetch rental object calendar config
 */
export async function prefetchCalendarConfig(
  queryClient: QueryClient,
  rentalObjectId: string,
  fetchFn: () => Promise<unknown>
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: dalKeys.rentalObject.calendarConfig(rentalObjectId),
    queryFn: fetchFn,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
