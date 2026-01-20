/**
 * Rental Object Calendar Hooks
 * 
 * XALA-compliant hooks for calendar functionality.
 * Uses DAL query keys and returns projection DTOs only.
 * 
 * These hooks are designed to work with the RentalObjectCalendar component.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { rentalObjectService } from '../services/rental-object.service';
import { dalKeys, handleBookingEvent, type BookingWebSocketEvent } from '../dal';
import type { 
  RentalObjectAvailability, 
  RentalObjectCalendarConfig,
} from '../types/rental-object';
import { useEffect, useCallback } from 'react';

// =============================================================================
// Calendar Config Hook
// =============================================================================

/**
 * Fetch rental object calendar configuration
 * Returns projection DTO with mode, constraints, and operating hours
 */
export function useCalendarConfig(rentalObjectId: string) {
  return useQuery({
    queryKey: dalKeys.rentalObject.calendarConfig(rentalObjectId),
    queryFn: async () => {
      const response = await rentalObjectService.getCalendarConfig(rentalObjectId);
      return response.data;
    },
    enabled: !!rentalObjectId,
    staleTime: 5 * 60 * 1000, // 5 minutes - config rarely changes
  });
}

// =============================================================================
// Calendar Availability Hook
// =============================================================================

interface UseCalendarAvailabilityOptions {
  rentalObjectId: string;
  startDate: string;
  endDate: string;
  enabled?: boolean;
}

/**
 * Fetch rental object availability for a date range
 * Returns projection DTO with slots and their statuses
 */
export function useCalendarAvailability(options: UseCalendarAvailabilityOptions) {
  const { rentalObjectId, startDate, endDate, enabled = true } = options;

  return useQuery({
    queryKey: dalKeys.rentalObject.availability(rentalObjectId, { startDate, endDate }),
    queryFn: async () => {
      const response = await rentalObjectService.getAvailability(rentalObjectId, {
        startDate,
        endDate,
      });
      return response.data;
    },
    enabled: enabled && !!rentalObjectId && !!startDate && !!endDate,
    staleTime: 30 * 1000, // 30 seconds - availability can change frequently
  });
}

// =============================================================================
// Combined Calendar Hook
// =============================================================================

interface UseRentalObjectCalendarOptions {
  rentalObjectId: string;
  startDate: string;
  endDate: string;
}

interface CalendarData {
  config: RentalObjectCalendarConfig | undefined;
  availability: RentalObjectAvailability | undefined;
  isLoading: boolean;
  isConfigLoading: boolean;
  isAvailabilityLoading: boolean;
  error: string | undefined;
}

/**
 * Combined hook for calendar config and availability
 * Returns both datasets with loading and error states
 */
export function useRentalObjectCalendar(options: UseRentalObjectCalendarOptions): CalendarData {
  const { rentalObjectId, startDate, endDate } = options;

  const configQuery = useCalendarConfig(rentalObjectId);
  const availabilityQuery = useCalendarAvailability({
    rentalObjectId,
    startDate,
    endDate,
    enabled: !!configQuery.data,
  });

  const error = configQuery.error 
    ? 'calendar.error.configLoad' 
    : availabilityQuery.error 
      ? 'calendar.error.availabilityLoad' 
      : undefined;

  return {
    config: configQuery.data,
    availability: availabilityQuery.data,
    isLoading: configQuery.isLoading || availabilityQuery.isLoading,
    isConfigLoading: configQuery.isLoading,
    isAvailabilityLoading: availabilityQuery.isLoading,
    error,
  };
}

// =============================================================================
// Realtime Updates Hook
// =============================================================================

/**
 * Hook to handle realtime booking events and invalidate calendar caches
 * 
 * @example
 * ```tsx
 * useCalendarRealtime(rentalObjectId, (event) => {
 *   console.log('Booking event:', event);
 * });
 * ```
 */
export function useCalendarRealtime(
  rentalObjectId: string,
  onEvent?: (event: BookingWebSocketEvent) => void
) {
  const queryClient = useQueryClient();

  const handleEvent = useCallback((event: BookingWebSocketEvent) => {
    // Only handle events for this rental object
    if (event.rentalObjectId !== rentalObjectId) return;

    // Invalidate caches using DAL helper
    handleBookingEvent(queryClient, event);

    // Call user callback if provided
    onEvent?.(event);
  }, [queryClient, rentalObjectId, onEvent]);

  useEffect(() => {
    // Subscribe to WebSocket events
    // Note: Actual WebSocket subscription is handled by the realtimeClient
    // This hook just provides the handler function
    
    // For now, we expose the handler via a custom event
    const listener = (e: Event) => {
      const customEvent = e as CustomEvent<BookingWebSocketEvent>;
      handleEvent(customEvent.detail);
    };

    window.addEventListener('booking-event', listener);

    return () => {
      window.removeEventListener('booking-event', listener);
    };
  }, [handleEvent]);

  return handleEvent;
}

// =============================================================================
// Export Query Keys
// =============================================================================

export const calendarKeys = {
  config: dalKeys.rentalObject.calendarConfig,
  availability: dalKeys.rentalObject.availability,
};
