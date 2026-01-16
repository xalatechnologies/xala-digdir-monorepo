/**
 * Season Hooks
 * React Query hooks for season operations
 */
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  seasonService,
  type Season,
  type SeasonQueryParams,
  type CreateSeasonDTO,
  type UpdateSeasonDTO,
} from '../services/season.service';

// Query keys for seasons
export const seasonKeys = {
  all: ['seasons'] as const,
  lists: () => [...seasonKeys.all, 'list'] as const,
  list: (params?: SeasonQueryParams) => [...seasonKeys.lists(), params] as const,
  details: () => [...seasonKeys.all, 'detail'] as const,
  detail: (id: string) => [...seasonKeys.details(), id] as const,
  stats: (id: string) => [...seasonKeys.all, 'stats', id] as const,
};

/**
 * Fetch seasons with optional filtering
 */
export function useSeasons(params?: SeasonQueryParams) {
  return useQuery({
    queryKey: seasonKeys.list(params),
    queryFn: () => seasonService.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch a single season by ID
 */
export function useSeason(id: string, options?: Omit<UseQueryOptions<{ data: Season }>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: seasonKeys.detail(id),
    queryFn: () => seasonService.getById(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * Fetch season statistics
 */
export function useSeasonStats(id: string) {
  return useQuery({
    queryKey: seasonKeys.stats(id),
    queryFn: () => seasonService.getStats(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create a new season
 */
export function useCreateSeason() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSeasonDTO) => seasonService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonKeys.all });
    },
  });
}

/**
 * Update an existing season
 */
export function useUpdateSeason() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSeasonDTO }) =>
      seasonService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: seasonKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: seasonKeys.lists() });
    },
  });
}

/**
 * Open a season for applications
 */
export function useOpenSeason() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => seasonService.open(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: seasonKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: seasonKeys.lists() });
    },
  });
}

/**
 * Close a season (stop accepting applications)
 */
export function useCloseSeason() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => seasonService.close(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: seasonKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: seasonKeys.lists() });
    },
  });
}

/**
 * Activate a season (make it the current active season)
 */
export function useActivateSeason() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => seasonService.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: seasonKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: seasonKeys.lists() });
    },
  });
}

/**
 * Complete a season (mark as finished)
 */
export function useCompleteSeason() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => seasonService.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: seasonKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: seasonKeys.lists() });
    },
  });
}

/**
 * Cancel a season
 */
export function useCancelSeason() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      seasonService.cancel(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: seasonKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: seasonKeys.lists() });
    },
  });
}

/**
 * Delete a season (draft only)
 */
export function useDeleteSeason() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => seasonService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonKeys.all });
    },
  });
}
