/**
 * Booking Quote Hooks
 * Projection-only hooks for booking quote operations
 * 
 * XALA Architecture Compliance:
 * - Hooks return projection DTOs only
 * - No transformers
 * - Uses DAL query keys
 * - SDK-only networking
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../services/booking.service';
import { dalKeys, createSelectionHash, invalidateBookings, invalidateAvailability } from '../dal';
import type { BookingQuoteSelectionDTO, CreateBookingDTO } from '../types/booking';

// =============================================================================
// Query Keys (exported for external use)
// =============================================================================

export const bookingQuoteKeys = {
  quote: dalKeys.booking.quote,
  recurringPreview: dalKeys.booking.recurringPreview,
};

// =============================================================================
// Booking Quote Hook
// =============================================================================

interface UseBookingQuoteOptions {
  /** Rental object ID */
  rentalObjectId: string;
  /** Start time (ISO 8601) */
  startTime: string;
  /** End time (ISO 8601) */
  endTime: string;
  /** Booking mode */
  mode?: 'SINGLE_SLOT' | 'IN_GAME' | 'RECURRING';
  /** Whether to enable the query */
  enabled?: boolean;
}

/**
 * Hook to get a booking quote projection
 * Returns rental-object-driven pricing, availability, and available actions.
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useBookingQuote({
 *   rentalObjectId: 'abc-123',
 *   startTime: '2026-01-20T10:00:00Z',
 *   endTime: '2026-01-20T12:00:00Z',
 * });
 * 
 * // Render from projection - no transformation
 * if (data?.slot.status === 'AVAILABLE') {
 *   return <BookButton actions={data.availableActions} />;
 * }
 * ```
 */
export function useBookingQuote(options: UseBookingQuoteOptions) {
  const { rentalObjectId, startTime, endTime, mode = 'SINGLE_SLOT', enabled = true } = options;

  // Map rentalObjectId to listingId for DTO (backward compatibility with API/DB)
  const selection: BookingQuoteSelectionDTO = {
    listingId: rentalObjectId, // DTO uses listingId for backward compatibility
    startTime,
    endTime,
    mode,
  };

  const selectionHash = createSelectionHash(selection);

  return useQuery({
    queryKey: dalKeys.booking.quote(rentalObjectId, selectionHash),
    queryFn: async () => {
      const response = await bookingService.quote(selection);
      return response.data;
    },
    enabled: enabled && !!rentalObjectId && !!startTime && !!endTime,
    staleTime: 30 * 1000, // 30 seconds - availability can change
  });
}

// =============================================================================
// Recurring Preview Hook
// =============================================================================

interface UseRecurringPreviewOptions {
  /** Rental object ID */
  rentalObjectId: string;
  /** Start time (ISO 8601) */
  startTime: string;
  /** End time (ISO 8601) */
  endTime: string;
  /** Recurrence frequency */
  frequency: 'WEEKLY' | 'MONTHLY';
  /** Weekdays for weekly recurrence (1-7, where 1=Monday) */
  weekdays?: number[];
  /** End condition */
  endCondition: {
    type: 'COUNT' | 'DATE';
    count?: number;
    endDate?: string;
  };
  /** Whether to enable the query */
  enabled?: boolean;
}

/**
 * Hook to get a recurring booking preview projection
 * Returns server-computed occurrence preview with conflict detection.
 * 
 * @example
 * ```tsx
 * const { data } = useRecurringPreview({
 *   rentalObjectId: 'abc-123',
 *   startTime: '2026-01-20T10:00:00Z',
 *   endTime: '2026-01-20T12:00:00Z',
 *   frequency: 'WEEKLY',
 *   weekdays: [1, 3, 5], // Mon, Wed, Fri
 *   endCondition: { type: 'COUNT', count: 10 },
 * });
 * 
 * // Show conflicts from projection
 * {data?.occurrences.filter(o => o.status !== 'AVAILABLE').map(conflict => (
 *   <ConflictWarning key={conflict.index} occurrence={conflict} />
 * ))}
 * ```
 */
export function useRecurringPreview(options: UseRecurringPreviewOptions) {
  const { 
    rentalObjectId, 
    startTime, 
    endTime, 
    frequency, 
    weekdays, 
    endCondition,
    enabled = true 
  } = options;

  // Map rentalObjectId to listingId for DTO (backward compatibility with API/DB)
  const selection = {
    listingId: rentalObjectId, // DTO uses listingId for backward compatibility
    startTime,
    endTime,
    frequency,
    weekdays,
    endCondition,
  };

  const selectionHash = createSelectionHash({
    listingId: rentalObjectId, // DTO uses listingId for backward compatibility
    startTime,
    endTime,
    mode: 'RECURRING',
  });

  return useQuery({
    queryKey: dalKeys.booking.recurringPreview(selectionHash),
    queryFn: async () => {
      const response = await bookingService.getRecurringPreview(selection as any);
      return response.data;
    },
    enabled: enabled && !!rentalObjectId && !!startTime && !!endTime && !!frequency,
    staleTime: 30 * 1000,
  });
}

// =============================================================================
// Create Booking Mutation (using quote data)
// =============================================================================

/**
 * Hook to create a booking from a quote
 * Automatically invalidates availability and booking caches.
 * 
 * @example
 * ```tsx
 * const createBooking = useCreateBookingFromQuote();
 * 
 * // Only allow booking if quote says it's available
 * if (quote.slot.status === 'AVAILABLE' && quote.availableActions.includes('BOOK')) {
 *   createBooking.mutate({
 *     listingId: quote.rentalObjectId, // DTO uses listingId for backward compatibility
 *     startTime: quote.selection.startTime,
 *     endTime: quote.selection.endTime,
 *     totalPrice: quote.pricing.totalPrice,
 *   });
 * }
 * ```
 */
export function useCreateBookingFromQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingDTO) => bookingService.create(data),
    onSuccess: (_, variables) => {
      // Invalidate availability for the rental object
      // Note: variables.listingId is used for backward compatibility with DTO/DB
      invalidateAvailability(queryClient, variables.listingId);
      // Invalidate all booking queries
      invalidateBookings(queryClient);
    },
  });
}
