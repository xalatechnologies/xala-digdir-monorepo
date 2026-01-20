/**
 * Booking Contracts Hooks
 * React Query hooks for contract-first booking endpoints
 * 
 * Reference: packages/client-sdk/src/types/booking-contracts.ts
 */
import { useQuery, useMutation } from '@tanstack/react-query';
import { BaseService } from '../services/base.service';

// =============================================================================
// Service
// =============================================================================

class BookingContractsService extends BaseService {
  constructor() {
    super('/api/bookings');
  }

  async previewPrice(request: unknown) {
    return this.post('/preview-price', request);
  }

  async previewRecurring(request: unknown) {
    return this.post('/recurring/preview', request);
  }
}

const bookingContractsService = new BookingContractsService();

// =============================================================================
// Query Keys
// =============================================================================

export const bookingContractsKeys = {
  all: ['booking-contracts'] as const,
  pricePreview: (request: unknown) => [...bookingContractsKeys.all, 'price-preview', request] as const,
  recurringPreview: (request: unknown) => [...bookingContractsKeys.all, 'recurring-preview', request] as const,
};

// =============================================================================
// Hooks
// =============================================================================

interface PricePreviewRequest {
  rentalObjectId: string;
  startTime?: string;
  endTime?: string;
  [key: string]: unknown;
}

interface RecurringPreviewRequest {
  rentalObjectId: string;
  startTime?: string;
  endTime?: string;
  frequency?: string;
  [key: string]: unknown;
}

/**
 * Preview booking price with breakdown
 */
export function usePricePreview(request: PricePreviewRequest | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: bookingContractsKeys.pricePreview(request),
    queryFn: () => bookingContractsService.previewPrice(request),
    enabled: options?.enabled !== false && !!request?.rentalObjectId,
  });
}

/**
 * Preview recurring booking with conflicts
 */
export function useRecurringPreview(request: RecurringPreviewRequest | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: bookingContractsKeys.recurringPreview(request),
    queryFn: () => bookingContractsService.previewRecurring(request),
    enabled: options?.enabled !== false && !!request?.rentalObjectId,
  });
}

/**
 * Mutation for price preview (if needed as mutation)
 */
export function usePreviewPriceMutation() {
  return useMutation({
    mutationFn: (request: PricePreviewRequest) => bookingContractsService.previewPrice(request),
  });
}

/**
 * Mutation for recurring preview (if needed as mutation)
 */
export function usePreviewRecurringMutation() {
  return useMutation({
    mutationFn: (request: RecurringPreviewRequest) => bookingContractsService.previewRecurring(request),
  });
}
