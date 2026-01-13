/**
 * Seasonal Lease Hooks
 * React Query hooks for seasonal lease operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seasonalLeaseService } from '../services/seasonal-lease.service';
import type { SeasonalLeaseQueryParams, CreateSeasonalLeaseDTO, UpdateSeasonalLeaseDTO } from '../types';

// Query keys
export const seasonalLeaseKeys = {
  all: ['seasonal-leases'] as const,
  lists: () => [...seasonalLeaseKeys.all, 'list'] as const,
  list: (params?: SeasonalLeaseQueryParams) => [...seasonalLeaseKeys.lists(), params] as const,
  details: () => [...seasonalLeaseKeys.all, 'detail'] as const,
  detail: (id: string) => [...seasonalLeaseKeys.details(), id] as const,
};

/**
 * Get paginated seasonal leases
 */
export function useSeasonalLeases(params?: SeasonalLeaseQueryParams) {
  return useQuery({
    queryKey: seasonalLeaseKeys.list(params),
    queryFn: () => seasonalLeaseService.getAll(params),
  });
}

/**
 * Get single seasonal lease
 */
export function useSeasonalLease(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: seasonalLeaseKeys.detail(id),
    queryFn: () => seasonalLeaseService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Create seasonal lease mutation
 */
export function useCreateSeasonalLease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSeasonalLeaseDTO) => seasonalLeaseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonalLeaseKeys.lists() });
    },
  });
}

/**
 * Update seasonal lease mutation
 */
export function useUpdateSeasonalLease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSeasonalLeaseDTO }) =>
      seasonalLeaseService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: seasonalLeaseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: seasonalLeaseKeys.lists() });
    },
  });
}

/**
 * Terminate seasonal lease mutation
 */
export function useTerminateSeasonalLease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => seasonalLeaseService.terminate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: seasonalLeaseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: seasonalLeaseKeys.lists() });
    },
  });
}

/**
 * Delete seasonal lease mutation
 */
export function useDeleteSeasonalLease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => seasonalLeaseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonalLeaseKeys.lists() });
    },
  });
}
