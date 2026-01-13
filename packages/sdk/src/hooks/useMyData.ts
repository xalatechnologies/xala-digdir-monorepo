/**
 * User's Own Data Hooks
 * React Query hooks for current user's data operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyBookings,
  cancelMyBooking,
  exportMyData,
  deleteMyAccount,
  getMyConsents,
  updateMyConsents,
} from '../services/api';
import { bookingKeys } from './useBookings';
import type { BookingQueryParams, ConsentSettings } from '../types/api';

// Query keys for cache management
export const myDataKeys = {
  all: ['my'] as const,
  bookings: (params?: BookingQueryParams) => [...myDataKeys.all, 'bookings', params] as const,
  consents: () => [...myDataKeys.all, 'consents'] as const,
};

/**
 * Get current user's bookings
 */
export function useMyBookings(params?: BookingQueryParams) {
  return useQuery({
    queryKey: myDataKeys.bookings(params),
    queryFn: () => getMyBookings(params),
  });
}

/**
 * Cancel own booking
 */
export function useCancelMyBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => cancelMyBooking(id, reason),
    onSuccess: (_, variables) => {
      // Invalidate my bookings and general bookings cache
      queryClient.invalidateQueries({ queryKey: myDataKeys.bookings() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.id) });
    },
  });
}

/**
 * Export personal data (GDPR)
 */
export function useGdprExport() {
  return useMutation({
    mutationFn: () => exportMyData(),
  });
}

/**
 * Delete account (GDPR)
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteMyAccount(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

/**
 * Get consent settings
 */
export function useMyConsents() {
  return useQuery({
    queryKey: myDataKeys.consents(),
    queryFn: () => getMyConsents(),
  });
}

/**
 * Update consent settings
 */
export function useUpdateMyConsents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (consents: Partial<ConsentSettings>) => updateMyConsents(consents),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myDataKeys.consents() });
    },
  });
}
