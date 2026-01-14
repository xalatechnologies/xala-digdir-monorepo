/**
 * Seasonal Lease Hooks
 * React Query hooks for seasonal lease operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  seasonalLeaseService,
  type SeasonalLease,
  type SeasonalLeaseQueryParams,
  type CreateSeasonalLeaseDTO,
} from '../services/seasonal-lease.service';

// Query keys for seasonal leases
export const seasonalLeaseKeys = {
  all: ['seasonal-leases'] as const,
  lists: () => [...seasonalLeaseKeys.all, 'list'] as const,
  list: (params?: SeasonalLeaseQueryParams) => [...seasonalLeaseKeys.lists(), params] as const,
  details: () => [...seasonalLeaseKeys.all, 'detail'] as const,
  detail: (id: string) => [...seasonalLeaseKeys.details(), id] as const,
};

/**
 * Fetch seasonal leases with optional filtering
 */
export function useSeasonalLeases(params?: SeasonalLeaseQueryParams) {
  return useQuery({
    queryKey: seasonalLeaseKeys.list(params),
    queryFn: () => seasonalLeaseService.getAll(params),
  });
}

/**
 * Fetch a single seasonal lease by ID
 */
export function useSeasonalLease(id: string) {
  return useQuery({
    queryKey: seasonalLeaseKeys.detail(id),
    queryFn: () => seasonalLeaseService.getById(id),
    enabled: !!id,
  });
}

/**
 * Create a new seasonal lease
 */
export function useCreateSeasonalLease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSeasonalLeaseDTO) => seasonalLeaseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonalLeaseKeys.all });
    },
  });
}

/**
 * Update an existing seasonal lease
 */
export function useUpdateSeasonalLease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSeasonalLeaseDTO> }) =>
      seasonalLeaseService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: seasonalLeaseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: seasonalLeaseKeys.lists() });
    },
  });
}

/**
 * Approve a seasonal lease
 */
export function useApproveSeasonalLease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => seasonalLeaseService.approve(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: seasonalLeaseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: seasonalLeaseKeys.lists() });
    },
  });
}

/**
 * Reject a seasonal lease
 */
export function useRejectSeasonalLease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      seasonalLeaseService.reject(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: seasonalLeaseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: seasonalLeaseKeys.lists() });
    },
  });
}

/**
 * Cancel a seasonal lease
 */
export function useCancelSeasonalLease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      seasonalLeaseService.cancel(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: seasonalLeaseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: seasonalLeaseKeys.lists() });
    },
  });
}

/**
 * Delete a seasonal lease (draft only)
 */
export function useDeleteSeasonalLease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => seasonalLeaseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonalLeaseKeys.all });
    },
  });
}

/**
 * Generate allocations from seasonal lease
 */
export function useGenerateAllocations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => seasonalLeaseService.generateAllocations(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}
