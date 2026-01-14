/**
 * Booking Hooks
 * Single Responsibility: React Query hooks for bookings and calendar
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { 
  bookingService, 
  calendarService, 
  allocationService, 
  availabilityService 
} from '../services/booking.service';
import type {
  BookingQueryParams,
  CreateBookingDTO,
  UpdateBookingDTO,
  CancelBookingDTO,
  CreateAllocationDTO,
  BookingSelectionDTO,
  RecurringPreviewProjectionDTO,
  CreateRecurringBookingDTO
} from '../types/booking';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a stable hash from a booking selection for cache key stability.
 * Prevents unnecessary refetches when selection object reference changes but content is same.
 */
function hashSelection(selection: BookingSelectionDTO): string {
  // Create a deterministic string from the selection properties
  const parts = [
    selection.listingId,
    selection.mode,
    selection.startTime,
    selection.endTime,
    selection.frequency ?? '',
    selection.weekdays?.sort().join(',') ?? '',
    selection.endCondition?.type ?? '',
    selection.endCondition?.occurrences?.toString() ?? '',
    selection.endCondition?.untilDate ?? '',
    selection.durationMinutes?.toString() ?? '',
    selection.userId ?? '',
    selection.organizationId ?? '',
  ];

  // Simple string hash for cache key differentiation
  const str = parts.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

// ============================================================================
// Booking Hooks
// ============================================================================

/**
 * Get paginated bookings
 */
export function useBookings(params?: BookingQueryParams) {
  return useQuery({
    queryKey: queryKeys.bookings.list(params),
    queryFn: () => bookingService.getAll(params),
  });
}

/**
 * Get single booking by ID
 */
export function useBooking(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id),
    queryFn: () => bookingService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Get current user's bookings
 */
export function useMyBookings(params?: BookingQueryParams) {
  return useQuery({
    queryKey: queryKeys.bookings.my(params),
    queryFn: () => bookingService.getMyBookings(params),
  });
}

/**
 * Get recurring bookings
 */
export function useRecurringBookings() {
  return useQuery({
    queryKey: queryKeys.bookings.recurring(),
    queryFn: () => bookingService.getRecurring(),
  });
}

/**
 * Calculate booking pricing
 */
export function useBookingPricing(listingId: string, startTime: string, endTime: string) {
  return useQuery({
    queryKey: queryKeys.bookings.pricing(listingId, startTime, endTime),
    queryFn: () => bookingService.calculatePricing(listingId, startTime, endTime),
    enabled: !!listingId && !!startTime && !!endTime,
  });
}

/**
 * Get recurring booking preview with conflict detection.
 * Uses selection hash for cache key stability to prevent unnecessary refetches
 * when selection object reference changes but content remains the same.
 *
 * @param listingId - ID of the listing for the recurring booking
 * @param selection - Booking selection with recurring pattern configuration
 * @param options - Query options including enabled flag
 * @returns Query result with RecurringPreviewProjectionDTO containing occurrences and availability
 */
export function useRecurringPreview(
  listingId: string,
  selection: BookingSelectionDTO | null,
  options?: { enabled?: boolean }
) {
  const selectionHash = selection ? hashSelection(selection) : '';

  return useQuery({
    queryKey: queryKeys.bookings.recurringPreview(listingId, selectionHash),
    queryFn: () => bookingService.getRecurringPreview(selection!),
    enabled: !!listingId && !!selection && (options?.enabled ?? true),
    staleTime: 10_000, // 10s for real-time accuracy
  });
}

/**
 * Create booking mutation
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingDTO) => bookingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

/**
 * Create recurring booking mutation with conflict policy support.
 * Creates a series of recurring bookings with configurable conflict handling.
 * Supports stopOnConflict (halt on first conflict) and allowPartial (create available only) policies.
 */
export function useCreateRecurringBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRecurringBookingDTO) => bookingService.createRecurringBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

/**
 * Update booking mutation
 */
export function useUpdateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookingDTO }) => 
      bookingService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

/**
 * Confirm booking mutation
 */
export function useConfirmBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => bookingService.confirm(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
    },
  });
}

/**
 * Cancel booking mutation
 */
export function useCancelBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: CancelBookingDTO }) => 
      bookingService.cancel(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

/**
 * Complete booking mutation
 */
export function useCompleteBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => bookingService.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
    },
  });
}

/**
 * Delete booking mutation
 */
export function useDeleteBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => bookingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

// ============================================================================
// Calendar Hooks
// ============================================================================

/**
 * Get calendar events
 */
export function useCalendarEvents(params?: { listingId?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: queryKeys.calendar.events(params),
    queryFn: () => calendarService.getEvents(params),
  });
}

/**
 * Get available time slots
 */
export function useAvailabilitySlots(params: { listingId: string; date: string; duration?: number }) {
  return useQuery({
    queryKey: queryKeys.calendar.slots(params),
    queryFn: () => availabilityService.getSlots(params),
    enabled: !!params.listingId && !!params.date,
  });
}

// ============================================================================
// Allocation Hooks
// ============================================================================

/**
 * Get allocations
 */
export function useAllocations(params?: { listingId?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: queryKeys.allocations.list(params),
    queryFn: () => allocationService.getAll(params),
  });
}

/**
 * Create allocation (block time) mutation
 */
export function useCreateAllocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAllocationDTO) => allocationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

/**
 * Delete allocation mutation
 */
export function useDeleteAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => allocationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

// ============================================================================
// Payment Hooks
// ============================================================================

/**
 * Get payment reconciliation report
 */
export function usePaymentReconciliation(params?: {
  startDate?: string;
  endDate?: string;
  status?: string;
  provider?: string;
}) {
  return useQuery({
    queryKey: queryKeys.bookings.paymentReconciliation(params),
    queryFn: () => bookingService.getPaymentReconciliation(params),
  });
}

/**
 * Get payment history for a booking
 */
export function usePaymentHistory(bookingId: string) {
  return useQuery({
    queryKey: queryKeys.bookings.paymentHistory(bookingId),
    queryFn: () => bookingService.getPaymentHistory(bookingId),
    enabled: !!bookingId,
  });
}
