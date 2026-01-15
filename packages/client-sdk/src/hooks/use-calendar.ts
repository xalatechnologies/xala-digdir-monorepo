/**
 * Calendar Hooks
 * Single Responsibility: React Query hooks for calendar configuration and availability
 */

import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import {
  realtimeClient,
  type RealtimeEventHandler,
} from '../realtime';
import {
  rentalObjectCalendarService,
  availabilityMatrixService,
  type CalendarConfigQueryParams,
} from '../services/calendar.service';
import type { AvailabilityMatrixQueryParams } from '../types/calendar';

// ============================================================================
// Calendar Configuration Hooks
// ============================================================================

/**
 * Get calendar configuration for a rental object
 * Returns complete calendar behavior including granularity, slot rules, booking window,
 * opening hours, allowed booking types, UI hints, and permissions.
 *
 * @param rentalObjectId - The rental object ID
 * @param params - Optional query parameters (bookingType)
 * @param options - Query options
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useRentalObjectCalendarConfig('rental-object-123');
 * if (data) {
 *   console.log(data.data.granularity); // 'TIME_SLOTS' | 'ALL_DAY' | 'MULTI_DAY'
 *   console.log(data.data.slotSizeMinutes); // 30
 * }
 * ```
 */
export function useRentalObjectCalendarConfig(
  rentalObjectId: string,
  params?: CalendarConfigQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.calendar.config(rentalObjectId, params),
    queryFn: () => rentalObjectCalendarService.getCalendarConfig(rentalObjectId, params),
    enabled: !!rentalObjectId && (options?.enabled ?? true),
  });
}

// Backward compatibility alias (deprecated)
/** @deprecated Use useRentalObjectCalendarConfig instead */
export function useListingCalendarConfig(
  listingId: string,
  params?: CalendarConfigQueryParams,
  options?: { enabled?: boolean }
) {
  return useRentalObjectCalendarConfig(listingId, params, options);
}

// ============================================================================
// Availability Matrix Hooks
// ============================================================================

/**
 * Get availability matrix for a rental object
 * Returns cell-by-cell availability state for a date range, with each cell
 * containing status (AVAILABLE, RESERVED, BOOKED, BLOCKED, BLACKOUT, CLOSED)
 * and reason key for unavailable slots.
 *
 * @param rentalObjectId - The rental object ID
 * @param params - Query parameters including from/to dates and optional bookingType
 * @param options - Query options
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useAvailabilityMatrix('rental-object-123', {
 *   from: '2025-01-15',
 *   to: '2025-01-21',
 *   bookingType: 'HOURLY'
 * });
 * if (data) {
 *   console.log(data.data.cells); // Array of AvailabilityCellDTO
 * }
 * ```
 */
export function useAvailabilityMatrix(
  rentalObjectId: string,
  params: AvailabilityMatrixQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.calendar.availabilityMatrix(rentalObjectId, params),
    queryFn: () => availabilityMatrixService.getAvailabilityMatrix(rentalObjectId, params),
    enabled: !!rentalObjectId && !!params.from && !!params.to && (options?.enabled ?? true),
  });
}

// ============================================================================
// Realtime Hooks
// ============================================================================

/**
 * Hook to subscribe to calendar availability events
 * Auto-invalidates calendar-related queries when availability changes
 *
 * Subscribes to:
 * - availability.updated - Direct availability changes
 * - booking.created/updated/cancelled - Bookings affect availability
 * - block.created/updated/deleted - Blocks affect availability
 *
 * @param handler - Optional custom event handler
 *
 * @example
 * ```tsx
 * function CalendarView() {
 *   // Auto-invalidates availability queries on realtime events
 *   useCalendarRealtime((event) => {
 *     console.log('Calendar event:', event.type);
 *   });
 *
 *   const { data } = useAvailabilityMatrix('rental-object-123', { from: '2025-01-15', to: '2025-01-21' });
 *   // ...
 * }
 * ```
 */
export function useCalendarRealtime(handler?: RealtimeEventHandler) {
  const queryClient = useQueryClient();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const invalidateCalendarQueries = () => {
      // Invalidate all calendar-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['blocks'] });
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
    };

    // Subscribe to availability update events
    const unsubAvailability = realtimeClient.onAvailability((event) => {
      invalidateCalendarQueries();
      handlerRef.current?.(event);
    });

    // Subscribe to booking events (affect availability)
    const unsubBookingCreated = realtimeClient.onBookingCreated((event) => {
      invalidateCalendarQueries();
      handlerRef.current?.(event);
    });

    const unsubBookingUpdated = realtimeClient.onBookingUpdated((event) => {
      invalidateCalendarQueries();
      handlerRef.current?.(event);
    });

    const unsubBookingCancelled = realtimeClient.onBookingCancelled((event) => {
      invalidateCalendarQueries();
      handlerRef.current?.(event);
    });

    // Subscribe to block events (affect availability)
    const unsubBlockCreated = realtimeClient.onBlockCreated((event) => {
      invalidateCalendarQueries();
      handlerRef.current?.(event);
    });

    const unsubBlockUpdated = realtimeClient.onBlockUpdated((event) => {
      invalidateCalendarQueries();
      handlerRef.current?.(event);
    });

    const unsubBlockDeleted = realtimeClient.onBlockDeleted((event) => {
      invalidateCalendarQueries();
      handlerRef.current?.(event);
    });

    return () => {
      unsubAvailability();
      unsubBookingCreated();
      unsubBookingUpdated();
      unsubBookingCancelled();
      unsubBlockCreated();
      unsubBlockUpdated();
      unsubBlockDeleted();
    };
  }, [queryClient]);
}
