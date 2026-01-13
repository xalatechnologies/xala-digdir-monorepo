/**
 * Calendar & Availability Hooks
 * React Query hooks for calendar and availability endpoints
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCalendarEvents,
  getAvailableSlots,
  createAllocation,
  deleteAllocation,
} from '../services/api';
import type {
  CalendarEvent,
  TimeSlot,
  CalendarQueryParams,
  AvailabilityQueryParams,
  CreateAllocationDTO,
  PaginatedResponse,
} from '../types/api';

// =============================================================================
// Query Keys
// =============================================================================

export const calendarKeys = {
  all: ['calendar'] as const,
  events: () => [...calendarKeys.all, 'events'] as const,
  eventsByParams: (params: CalendarQueryParams) => [...calendarKeys.events(), params] as const,
  availability: () => [...calendarKeys.all, 'availability'] as const,
  slots: (params: AvailabilityQueryParams) => [...calendarKeys.availability(), 'slots', params] as const,
  allocations: () => [...calendarKeys.all, 'allocations'] as const,
};

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Fetch calendar events for a date range
 */
export function useCalendarEvents(params: CalendarQueryParams) {
  return useQuery<PaginatedResponse<CalendarEvent>>({
    queryKey: calendarKeys.eventsByParams(params),
    queryFn: () => getCalendarEvents(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch available time slots for a listing
 */
export function useAvailableSlots(params: AvailabilityQueryParams, enabled = true) {
  return useQuery<{ data: TimeSlot[] }>({
    queryKey: calendarKeys.slots(params),
    queryFn: () => getAvailableSlots(params),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes (availability changes frequently)
  });
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Create an allocation (block time, maintenance)
 */
export function useCreateAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAllocationDTO) => createAllocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
      queryClient.invalidateQueries({ queryKey: calendarKeys.availability() });
    },
  });
}

/**
 * Delete an allocation
 */
export function useDeleteAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAllocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
      queryClient.invalidateQueries({ queryKey: calendarKeys.availability() });
    },
  });
}
