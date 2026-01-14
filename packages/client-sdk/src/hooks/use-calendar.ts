/**
 * Calendar Hooks
 * Single Responsibility: React Query hooks for calendar configuration and availability
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import {
  listingCalendarService,
  availabilityMatrixService,
  type CalendarConfigQueryParams,
} from '../services/calendar.service';
import type { AvailabilityMatrixQueryParams } from '../types/calendar';

// ============================================================================
// Calendar Configuration Hooks
// ============================================================================

/**
 * Get calendar configuration for a listing
 * Returns complete calendar behavior including granularity, slot rules, booking window,
 * opening hours, allowed booking types, UI hints, and permissions.
 *
 * @param listingId - The listing ID
 * @param params - Optional query parameters (bookingType)
 * @param options - Query options
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useListingCalendarConfig('listing-123');
 * if (data) {
 *   console.log(data.data.granularity); // 'TIME_SLOTS' | 'ALL_DAY' | 'MULTI_DAY'
 *   console.log(data.data.slotSizeMinutes); // 30
 * }
 * ```
 */
export function useListingCalendarConfig(
  listingId: string,
  params?: CalendarConfigQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.calendar.config(listingId, params),
    queryFn: () => listingCalendarService.getCalendarConfig(listingId, params),
    enabled: !!listingId && (options?.enabled ?? true),
  });
}

// ============================================================================
// Availability Matrix Hooks
// ============================================================================

/**
 * Get availability matrix for a listing
 * Returns cell-by-cell availability state for a date range, with each cell
 * containing status (AVAILABLE, RESERVED, BOOKED, BLOCKED, BLACKOUT, CLOSED)
 * and reason key for unavailable slots.
 *
 * @param listingId - The listing ID
 * @param params - Query parameters including from/to dates and optional bookingType
 * @param options - Query options
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useAvailabilityMatrix('listing-123', {
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
  listingId: string,
  params: AvailabilityMatrixQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.calendar.availabilityMatrix(listingId, params),
    queryFn: () => availabilityMatrixService.getAvailabilityMatrix(listingId, params),
    enabled: !!listingId && !!params.from && !!params.to && (options?.enabled ?? true),
  });
}
