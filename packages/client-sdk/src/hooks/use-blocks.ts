/**
 * Block Hooks
 * Single Responsibility: React Query hooks for calendar blocks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { blockService } from '../services/block.service';
import type {
  BlockQueryParams,
  CreateBlockDTO,
  UpdateBlockDTO,
  ConflictCheckParams,
} from '../types/booking';

// ============================================================================
// Block Query Hooks
// ============================================================================

/**
 * Get paginated blocks
 */
export function useBlocks(params?: BlockQueryParams) {
  return useQuery({
    queryKey: queryKeys.blocks.list(params),
    queryFn: () => blockService.getAll(params),
  });
}

/**
 * Get single block by ID
 */
export function useBlock(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.blocks.detail(id),
    queryFn: () => blockService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Get blocks for a specific listing
 */
export function useListingBlocks(
  listingId: string,
  params?: Omit<BlockQueryParams, 'listingId'>,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.blocks.list({ listingId, ...params }),
    queryFn: () => blockService.getByListing(listingId, params),
    enabled: !!listingId && (options?.enabled ?? true),
  });
}

/**
 * Check for conflicts before creating a block
 */
export function useCheckConflicts(
  params: ConflictCheckParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.blocks.conflicts({
      listingId: params.listingId,
      startTime: params.startTime,
      endTime: params.endTime,
    }),
    queryFn: () => blockService.checkConflicts(params),
    enabled:
      !!params.listingId &&
      !!params.startTime &&
      !!params.endTime &&
      (options?.enabled ?? true),
  });
}

// ============================================================================
// Block Mutation Hooks
// ============================================================================

/**
 * Create block mutation
 */
export function useCreateBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBlockDTO) => blockService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blocks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.all });
    },
  });
}

/**
 * Update block mutation
 */
export function useUpdateBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlockDTO }) =>
      blockService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blocks.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.blocks.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.all });
    },
  });
}

/**
 * Delete block mutation
 */
export function useDeleteBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blockService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blocks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.all });
    },
  });
}

/**
 * Cancel block mutation (soft delete)
 */
export function useCancelBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blockService.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blocks.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.blocks.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

/**
 * Bulk delete blocks mutation (admin only)
 */
export function useBulkDeleteBlocks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => blockService.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blocks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.all });
    },
  });
}
