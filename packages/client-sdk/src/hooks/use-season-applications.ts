/**
 * Season Application Hooks
 * React Query hooks for season application operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  seasonApplicationService,
  type SeasonApplicationQueryParams,
  type CreateSeasonApplicationDTO,
  type AllocateApplicationDTO,
  type FinalizeSeasonAllocationsDTO,
} from '@/services/season-application.service';

// Query keys for season applications
export const seasonApplicationKeys = {
  all: ['season-applications'] as const,
  lists: () => [...seasonApplicationKeys.all, 'list'] as const,
  list: (params?: SeasonApplicationQueryParams) => [...seasonApplicationKeys.lists(), params] as const,
  details: () => [...seasonApplicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...seasonApplicationKeys.details(), id] as const,
};

/**
 * Fetch season applications with optional filtering
 */
export function useSeasonApplications(seasonId?: string, params?: SeasonApplicationQueryParams) {
  const queryParams = seasonId ? { ...params, seasonId } : params;

  return useQuery({
    queryKey: seasonApplicationKeys.list(queryParams),
    queryFn: () => seasonApplicationService.getAll(queryParams),
    enabled: !!seasonId || !!params,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch a single season application by ID
 */
export function useSeasonApplication(id: string) {
  return useQuery({
    queryKey: seasonApplicationKeys.detail(id),
    queryFn: () => seasonApplicationService.getById(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Create a new season application
 */
export function useCreateSeasonApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSeasonApplicationDTO) => seasonApplicationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonApplicationKeys.all });
    },
  });
}

/**
 * Update an existing season application
 */
export function useUpdateSeasonApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSeasonApplicationDTO> }) =>
      seasonApplicationService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: seasonApplicationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: seasonApplicationKeys.lists() });
    },
  });
}

/**
 * Approve a season application
 */
export function useApproveSeasonApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => seasonApplicationService.approve(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: seasonApplicationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: seasonApplicationKeys.lists() });
    },
  });
}

/**
 * Reject a season application
 */
export function useRejectSeasonApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      seasonApplicationService.reject(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: seasonApplicationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: seasonApplicationKeys.lists() });
    },
  });
}

/**
 * Allocate an approved application (generate recurring bookings)
 */
export function useAllocateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AllocateApplicationDTO) => seasonApplicationService.allocate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonApplicationKeys.all });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}

/**
 * Finalize all season allocations (lock in all allocated applications)
 */
export function useFinalizeSeasonAllocations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FinalizeSeasonAllocationsDTO) => seasonApplicationService.finalizeAllocations(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonApplicationKeys.all });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      queryClient.invalidateQueries({ queryKey: ['seasons'] });
    },
  });
}

/**
 * Delete a season application (draft/pending only)
 */
export function useDeleteSeasonApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => seasonApplicationService.deleteById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonApplicationKeys.all });
    },
  });
}
