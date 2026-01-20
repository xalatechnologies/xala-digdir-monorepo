/**
 * Activities Hooks
 * React Query hooks for public activities (classes, events, trainings, etc.)
 * Used by web ActivityCalendar page
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import {
  activityService,
  type ActivityQueryParams,
  type ActivityCategory,
  type RegisterForActivityDTO,
} from '@/services/activity.service';

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get activities with optional filters
 */
export function useActivities(params?: ActivityQueryParams) {
  return useQuery({
    queryKey: queryKeys.activities.list(params),
    queryFn: () => activityService.getAll(params),
  });
}

/**
 * Get single activity by ID
 */
export function useActivity(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.activities.detail(id),
    queryFn: () => activityService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Get activities by category
 */
export function useActivitiesByCategory(
  category: ActivityCategory,
  params?: Omit<ActivityQueryParams, 'category'>,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.activities.byCategory(category, params),
    queryFn: () => activityService.getByCategory(category, params),
    enabled: !!category && (options?.enabled ?? true),
  });
}

/**
 * Get activities by date
 */
export function useActivitiesByDate(
  date: string | Date,
  params?: Omit<ActivityQueryParams, 'date'>,
  options?: { enabled?: boolean }
) {
  const dateStr = typeof date === 'string' ? date : date.toISOString();
  return useQuery({
    queryKey: queryKeys.activities.byDate(dateStr, params),
    queryFn: () => activityService.getByDate(date, params),
    enabled: !!date && (options?.enabled ?? true),
  });
}

/**
 * Get activities for a specific rental object
 */
export function useActivitiesByRentalObject(
  rentalObjectId: string,
  params?: Omit<ActivityQueryParams, 'rentalObjectId'>,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.activities.byRentalObject(rentalObjectId, params),
    queryFn: () => activityService.getByRentalObject(rentalObjectId, params),
    enabled: !!rentalObjectId && (options?.enabled ?? true),
  });
}

/**
 * Get registrations for an activity
 */
export function useActivityRegistrations(activityId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.activities.registrations(activityId),
    queryFn: () => activityService.getRegistrations(activityId),
    enabled: !!activityId && (options?.enabled ?? true),
  });
}

/**
 * Get upcoming activities
 */
export function useUpcomingActivities(limit = 10) {
  return useQuery({
    queryKey: queryKeys.activities.upcoming(limit),
    queryFn: () => activityService.getUpcoming(limit),
  });
}

/**
 * Get available activity categories
 */
export function useActivityCategories() {
  return useQuery({
    queryKey: queryKeys.activities.categories(),
    queryFn: () => activityService.getCategories(),
  });
}

/**
 * Search activities
 */
export function useSearchActivities(
  query: string,
  params?: Omit<ActivityQueryParams, 'search'>,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.activities.list({ search: query, ...params }),
    queryFn: () => activityService.search(query, params),
    enabled: !!query && (options?.enabled ?? true),
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Register for an activity
 */
export function useRegisterForActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterForActivityDTO) => activityService.register(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.detail(variables.activityId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.registrations(variables.activityId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.lists() });
    },
  });
}

/**
 * Cancel registration
 */
export function useCancelActivityRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ activityId, registrationId }: { activityId: string; registrationId: string }) =>
      activityService.cancelRegistration(activityId, registrationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.detail(variables.activityId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.registrations(variables.activityId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.lists() });
    },
  });
}

// Re-export types for convenience
export type { ActivityCategory, ActivityQueryParams, RegisterForActivityDTO };
