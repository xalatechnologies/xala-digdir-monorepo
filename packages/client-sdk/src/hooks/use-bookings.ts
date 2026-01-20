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
} from '@/services/booking.service';
import type { 
  BookingQueryParams, 
  CreateBookingDTO, 
  UpdateBookingDTO,
  CancelBookingDTO,
  CreateAllocationDTO
} from '@/types/booking';

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
export function useBookingPricing(rentalObjectId: string, startTime: string, endTime: string) {
  return useQuery({
    queryKey: queryKeys.bookings.pricing(rentalObjectId, startTime, endTime),
    queryFn: () => bookingService.calculatePricing(rentalObjectId, startTime, endTime),
    enabled: !!rentalObjectId && !!startTime && !!endTime,
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
    mutationFn: (id: string) => bookingService.deleteById(id),
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
export function useCalendarEvents(params?: { rentalObjectId?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: queryKeys.calendar.events(params),
    queryFn: () => calendarService.getEvents({ rentalObjectId: params?.rentalObjectId, startDate: params?.startDate, endDate: params?.endDate }),
  });
}

/**
 * Get available time slots
 */
export function useAvailabilitySlots(params: { rentalObjectId: string; date: string; duration?: number }) {
  return useQuery({
    queryKey: queryKeys.calendar.slots(params),
    queryFn: () => availabilityService.getSlots({ rentalObjectId: params.rentalObjectId, date: params.date, duration: params.duration }),
    enabled: !!params.rentalObjectId && !!params.date,
  });
}

// ============================================================================
// Allocation Hooks
// ============================================================================

/**
 * Get allocations
 */
export function useAllocations(params?: { rentalObjectId?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: queryKeys.allocations.list(params),
    queryFn: () => allocationService.getAll({ rentalObjectId: params?.rentalObjectId, startDate: params?.startDate, endDate: params?.endDate }),
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
    mutationFn: (id: string) => allocationService.deleteById(id),
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

// ============================================================================
// Booking State Transition Hooks
// ============================================================================

/**
 * Submit booking for approval
 * Transitions from pending → pending_approval
 */
export function useSubmitBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const response = await bookingService.submit(id, notes);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      if (response?.data?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(response.data.id) });
      }
    },
  });
}

/**
 * Approve booking (caseworker/admin only)
 * Transitions from pending_approval → approved
 */
export function useApproveBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await bookingService.approve(id, reason);
      return response;
    },
    onSuccess: (response) => {
      // Invalidate all booking queries
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      // Invalidate specific booking
      if (response?.data?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(response.data.id) });
      }
    },
  });
}

/**
 * Reject booking (caseworker/admin only)
 */
export function useRejectBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await bookingService.reject(id, reason);
      return response;
    },
    onSuccess: (response) => {
      // Invalidate all booking queries
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      // Invalidate specific booking
      if (response?.data?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(response.data.id) });
      }
    },
  });
}

// ============================================================================
// Recurring Booking Hooks
// ============================================================================

/**
 * Preview recurring booking before creation
 * Shows all occurrences that would be created based on the recurrence pattern
 */
export function useRecurringPreview(hash: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.bookings.recurringPreview(hash),
    queryFn: () => bookingService.getRecurringPreview({ hash }),
    enabled: !!hash && (options?.enabled ?? true),
  });
}

/**
 * Create recurring booking mutation
 * Creates a series of bookings based on a recurrence pattern
 */
export function useCreateRecurringBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateBookingDTO & {
      frequency: string;
      endDate: string;
      weekdays?: number[];
    }) => bookingService.createRecurring(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}


