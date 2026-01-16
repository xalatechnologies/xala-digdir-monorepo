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
  CreateAllocationDTO
} from '../types/booking';

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
    staleTime: 2 * 60 * 1000, // 2 minutes
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
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get current user's bookings
 */
export function useMyBookings(params?: BookingQueryParams) {
  return useQuery({
    queryKey: queryKeys.bookings.my(params),
    queryFn: () => bookingService.getMyBookings(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get recurring bookings
 */
export function useRecurringBookings() {
  return useQuery({
    queryKey: queryKeys.bookings.recurring(),
    queryFn: () => bookingService.getRecurring(),
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    staleTime: 2 * 60 * 1000, // 2 minutes - pricing may fluctuate
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
    staleTime: 2 * 60 * 1000, // 2 minutes
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
    staleTime: 60 * 1000, // 1 minute
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
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    staleTime: 5 * 60 * 1000, // 5 minutes - reconciliation reports
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
    staleTime: 3 * 60 * 1000, // 3 minutes - payment history
  });
}
