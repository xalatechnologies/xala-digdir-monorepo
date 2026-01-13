/**
 * Seasonal Lease Hooks
 * React Query hooks for seasonal lease endpoints
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSeasonalLeases,
  getSeasonalLease,
  createSeasonalLease,
  updateSeasonalLease,
  terminateSeasonalLease,
} from '../services/api';
import type {
  SeasonalLease,
  SeasonalLeaseQueryParams,
  CreateSeasonalLeaseDTO,
  UpdateSeasonalLeaseDTO,
  PaginatedResponse,
  SingleResponse,
} from '../types/api';

// =============================================================================
// Query Keys
// =============================================================================

export const seasonalLeaseKeys = {
  all: ['seasonal-leases'] as const,
  lists: () => [...seasonalLeaseKeys.all, 'list'] as const,
  list: (params?: SeasonalLeaseQueryParams) => [...seasonalLeaseKeys.lists(), params] as const,
  details: () => [...seasonalLeaseKeys.all, 'detail'] as const,
  detail: (id: string) => [...seasonalLeaseKeys.details(), id] as const,
};

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Fetch all seasonal leases with optional filtering
 */
export function useSeasonalLeases(params?: SeasonalLeaseQueryParams) {
  return useQuery<PaginatedResponse<SeasonalLease>>({
    queryKey: seasonalLeaseKeys.list(params),
    queryFn: () => getSeasonalLeases(params),
  });
}

/**
 * Fetch a single seasonal lease by ID
 */
export function useSeasonalLease(id: string, enabled = true) {
  return useQuery<SingleResponse<SeasonalLease>>({
    queryKey: seasonalLeaseKeys.detail(id),
    queryFn: () => getSeasonalLease(id),
    enabled: enabled && !!id,
  });
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Create a new seasonal lease
 */
export function useCreateSeasonalLease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSeasonalLeaseDTO) => createSeasonalLease(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonalLeaseKeys.lists() });
    },
  });
}

/**
 * Update a seasonal lease
 */
export function useUpdateSeasonalLease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSeasonalLeaseDTO }) =>
      updateSeasonalLease(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: seasonalLeaseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: seasonalLeaseKeys.detail(id) });
    },
  });
}

/**
 * Terminate a seasonal lease
 */
export function useTerminateSeasonalLease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => terminateSeasonalLease(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: seasonalLeaseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: seasonalLeaseKeys.detail(id) });
    },
  });
}
