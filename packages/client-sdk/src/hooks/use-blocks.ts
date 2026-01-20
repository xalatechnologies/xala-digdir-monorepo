/**
 * Block Hooks
 * React Query hooks for calendar block operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blocksService, type BlockQueryParams } from '@/services/blocks.service';
import type {
  CreateBlockDTO,
  UpdateBlockDTO,
  ConflictCheckParams
} from '@/types/additional';

// Query keys for blocks
export const blockKeys = {
  all: ['blocks'] as const,
  lists: () => [...blockKeys.all, 'list'] as const,
  list: (params?: BlockQueryParams) =>
    [...blockKeys.lists(), params] as const,
  details: () => [...blockKeys.all, 'detail'] as const,
  detail: (id: string) => [...blockKeys.details(), id] as const,
  conflicts: (params: ConflictCheckParams) => [...blockKeys.all, 'conflicts', params] as const,
};

/**
 * Fetch blocks with optional filtering
 */
export function useBlocks(params?: BlockQueryParams) {
  return useQuery({
    queryKey: blockKeys.list(params),
    queryFn: () => blocksService.getAll(params),
  });
}

/**
 * Fetch blocks scoped to assigned rental objects (for org_admin/org_member)
 */
export function useAssignedBlocks(params?: Omit<BlockQueryParams, 'scope'>) {
  return useQuery({
    queryKey: blockKeys.list({ ...params, scope: 'assigned' }),
    queryFn: () => blocksService.getAll({ ...params, scope: 'assigned' }),
  });
}

/**
 * Fetch a single block by ID
 */
export function useBlock(id: string) {
  return useQuery({
    queryKey: blockKeys.detail(id),
    queryFn: () => blocksService.getById(id),
    enabled: !!id,
  });
}

/**
 * Create a new block
 */
export function useCreateBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBlockDTO) => blocksService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockKeys.all });
      // Also invalidate calendar events
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      // Invalidate org dashboard data
      queryClient.invalidateQueries({ queryKey: ['org-dashboard'] });
    },
  });
}

/**
 * Update an existing block
 */
export function useUpdateBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlockDTO }) =>
      blocksService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: blockKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: blockKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['org-dashboard'] });
    },
  });
}

/**
 * Delete a block
 */
export function useDeleteBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blocksService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockKeys.all });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['org-dashboard'] });
    },
  });
}

/**
 * Check for conflicts before creating/updating a block
 */
export function useCheckConflicts(
  params: ConflictCheckParams,
  options?: { enabled?: boolean }
) {
  const isEnabled = options?.enabled ?? (!!params?.rentalObjectId && !!params?.startTime && !!params?.endTime);

  return useQuery({
    queryKey: blockKeys.conflicts(params),
    queryFn: () => blocksService.checkConflicts(params),
    enabled: isEnabled,
  });
}
