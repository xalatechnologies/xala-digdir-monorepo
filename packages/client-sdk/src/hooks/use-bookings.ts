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
 * Create booking mutation with optimistic updates
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingDTO) => bookingService.create(data),
    onMutate: async (newBooking) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.all });
      await queryClient.cancelQueries({ queryKey: queryKeys.calendar.all });

      // Snapshot previous values for rollback
      const previousBookings = queryClient.getQueryData(queryKeys.bookings.lists());
      const previousCalendar = queryClient.getQueryData(queryKeys.calendar.all);

      // Optimistically update bookings list
      queryClient.setQueriesData(
        { queryKey: queryKeys.bookings.all },
        (old: any) => {
          if (!old?.data) return old;
          // Add optimistic booking with temporary ID
          const optimisticBooking = {
            id: `temp-${Date.now()}`,
            ...newBooking,
            status: 'PENDING' as const,
            version: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return {
            ...old,
            data: [optimisticBooking, ...old.data],
            meta: { ...old.meta, total: (old.meta?.total || 0) + 1 },
          };
        }
      );

      return { previousBookings, previousCalendar };
    },
    onError: (_error, _newBooking, context) => {
      // Rollback on error
      if (context?.previousBookings) {
        queryClient.setQueryData(queryKeys.bookings.lists(), context.previousBookings);
      }
      if (context?.previousCalendar) {
        queryClient.setQueryData(queryKeys.calendar.all, context.previousCalendar);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

/**
 * Update booking mutation with optimistic updates
 */
export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookingDTO }) =>
      bookingService.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.detail(id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.all });
      await queryClient.cancelQueries({ queryKey: queryKeys.calendar.all });

      // Snapshot previous values
      const previousBooking = queryClient.getQueryData(queryKeys.bookings.detail(id));
      const previousBookings = queryClient.getQueryData(queryKeys.bookings.lists());
      const previousCalendar = queryClient.getQueryData(queryKeys.calendar.all);

      // Optimistically update booking detail
      queryClient.setQueryData(queryKeys.bookings.detail(id), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          ...data,
          version: old.version + 1,
          updatedAt: new Date().toISOString(),
        };
      });

      // Optimistically update booking in lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.bookings.all },
        (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((booking: any) =>
              booking.id === id
                ? { ...booking, ...data, version: booking.version + 1, updatedAt: new Date().toISOString() }
                : booking
            ),
          };
        }
      );

      return { previousBooking, previousBookings, previousCalendar };
    },
    onError: (_error, { id }, context) => {
      // Rollback on error
      if (context?.previousBooking) {
        queryClient.setQueryData(queryKeys.bookings.detail(id), context.previousBooking);
      }
      if (context?.previousBookings) {
        queryClient.setQueryData(queryKeys.bookings.lists(), context.previousBookings);
      }
      if (context?.previousCalendar) {
        queryClient.setQueryData(queryKeys.calendar.all, context.previousCalendar);
      }
    },
    onSettled: (_, __, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

/**
 * Confirm booking mutation with optimistic updates
 */
export function useConfirmBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingService.confirm(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.detail(id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.all });

      // Snapshot previous values
      const previousBooking = queryClient.getQueryData(queryKeys.bookings.detail(id));
      const previousBookings = queryClient.getQueryData(queryKeys.bookings.lists());

      // Optimistically update status to CONFIRMED
      queryClient.setQueryData(queryKeys.bookings.detail(id), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          status: 'CONFIRMED',
          version: old.version + 1,
          updatedAt: new Date().toISOString(),
        };
      });

      // Update in lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.bookings.all },
        (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((booking: any) =>
              booking.id === id
                ? { ...booking, status: 'CONFIRMED', version: booking.version + 1, updatedAt: new Date().toISOString() }
                : booking
            ),
          };
        }
      );

      return { previousBooking, previousBookings };
    },
    onError: (_error, id, context) => {
      // Rollback on error
      if (context?.previousBooking) {
        queryClient.setQueryData(queryKeys.bookings.detail(id), context.previousBooking);
      }
      if (context?.previousBookings) {
        queryClient.setQueryData(queryKeys.bookings.lists(), context.previousBookings);
      }
    },
    onSettled: (_, __, id) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
    },
  });
}

/**
 * Cancel booking mutation with optimistic updates
 */
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: CancelBookingDTO }) =>
      bookingService.cancel(id, data),
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.detail(id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.all });
      await queryClient.cancelQueries({ queryKey: queryKeys.calendar.all });

      // Snapshot previous values
      const previousBooking = queryClient.getQueryData(queryKeys.bookings.detail(id));
      const previousBookings = queryClient.getQueryData(queryKeys.bookings.lists());
      const previousCalendar = queryClient.getQueryData(queryKeys.calendar.all);

      // Optimistically update status to CANCELLED
      queryClient.setQueryData(queryKeys.bookings.detail(id), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          status: 'CANCELLED',
          version: old.version + 1,
          updatedAt: new Date().toISOString(),
        };
      });

      // Update in lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.bookings.all },
        (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((booking: any) =>
              booking.id === id
                ? { ...booking, status: 'CANCELLED', version: booking.version + 1, updatedAt: new Date().toISOString() }
                : booking
            ),
          };
        }
      );

      return { previousBooking, previousBookings, previousCalendar };
    },
    onError: (_error, { id }, context) => {
      // Rollback on error
      if (context?.previousBooking) {
        queryClient.setQueryData(queryKeys.bookings.detail(id), context.previousBooking);
      }
      if (context?.previousBookings) {
        queryClient.setQueryData(queryKeys.bookings.lists(), context.previousBookings);
      }
      if (context?.previousCalendar) {
        queryClient.setQueryData(queryKeys.calendar.all, context.previousCalendar);
      }
    },
    onSettled: (_, __, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

/**
 * Complete booking mutation with optimistic updates
 */
export function useCompleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingService.complete(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.detail(id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.all });

      // Snapshot previous values
      const previousBooking = queryClient.getQueryData(queryKeys.bookings.detail(id));
      const previousBookings = queryClient.getQueryData(queryKeys.bookings.lists());

      // Optimistically update status to COMPLETED
      queryClient.setQueryData(queryKeys.bookings.detail(id), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          status: 'COMPLETED',
          version: old.version + 1,
          updatedAt: new Date().toISOString(),
        };
      });

      // Update in lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.bookings.all },
        (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((booking: any) =>
              booking.id === id
                ? { ...booking, status: 'COMPLETED', version: booking.version + 1, updatedAt: new Date().toISOString() }
                : booking
            ),
          };
        }
      );

      return { previousBooking, previousBookings };
    },
    onError: (_error, id, context) => {
      // Rollback on error
      if (context?.previousBooking) {
        queryClient.setQueryData(queryKeys.bookings.detail(id), context.previousBooking);
      }
      if (context?.previousBookings) {
        queryClient.setQueryData(queryKeys.bookings.lists(), context.previousBookings);
      }
    },
    onSettled: (_, __, id) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
    },
  });
}

/**
 * Delete booking mutation with optimistic updates
 */
export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingService.delete(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.all });
      await queryClient.cancelQueries({ queryKey: queryKeys.calendar.all });

      // Snapshot previous values
      const previousBookings = queryClient.getQueryData(queryKeys.bookings.lists());
      const previousCalendar = queryClient.getQueryData(queryKeys.calendar.all);

      // Optimistically remove booking from lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.bookings.all },
        (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.filter((booking: any) => booking.id !== id),
            meta: { ...old.meta, total: Math.max(0, (old.meta?.total || 0) - 1) },
          };
        }
      );

      return { previousBookings, previousCalendar };
    },
    onError: (_error, _id, context) => {
      // Rollback on error
      if (context?.previousBookings) {
        queryClient.setQueryData(queryKeys.bookings.lists(), context.previousBookings);
      }
      if (context?.previousCalendar) {
        queryClient.setQueryData(queryKeys.calendar.all, context.previousCalendar);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
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
