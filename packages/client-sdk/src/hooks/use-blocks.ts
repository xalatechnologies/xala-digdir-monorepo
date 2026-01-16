/**
 * Block Hooks
 * React Query hooks for calendar block operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClient } from '../core/client-factory';
import type {
  Block,
  CreateBlockDTO,
  UpdateBlockDTO,
  Conflict,
  ConflictsResponse,
  ConflictCheckParams
} from '../types/additional';

// Query keys for blocks
export const blockKeys = {
  all: ['blocks'] as const,
  lists: () => [...blockKeys.all, 'list'] as const,
  list: (params?: { rentalObjectId?: string; startDate?: string; endDate?: string }) =>
    [...blockKeys.lists(), params] as const,
  details: () => [...blockKeys.all, 'detail'] as const,
  detail: (id: string) => [...blockKeys.details(), id] as const,
  conflicts: (params: ConflictCheckParams) => [...blockKeys.all, 'conflicts', params] as const,
};

// Placeholder service (to be replaced with actual block service)
const blockService = {
  async getAll(params?: { rentalObjectId?: string; startDate?: string; endDate?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.rentalObjectId) queryParams.set('rentalObjectId', params.rentalObjectId);
    if (params?.startDate) queryParams.set('startDate', params.startDate);
    if (params?.endDate) queryParams.set('endDate', params.endDate);

    const url = queryParams.toString() ? `/api/blocks?${queryParams}` : '/api/blocks';
    return getClient().get<{ data: Block[]; meta: { total: number } }>(url);
  },

  async getById(id: string) {
    return getClient().get<{ data: Block }>(`/api/blocks/${id}`);
  },

  async create(data: CreateBlockDTO) {
    return getClient().post<{ data: Block }>('/api/blocks', data);
  },

  async update(id: string, data: UpdateBlockDTO) {
    return getClient().put<{ data: Block }>(`/api/blocks/${id}`, data);
  },

  async delete(id: string) {
    return getClient().delete<{ success: boolean }>(`/api/blocks/${id}`);
  },

  async checkConflicts(params: ConflictCheckParams) {
    const queryParams = new URLSearchParams({
      rentalObjectId: params.rentalObjectId,
      startTime: params.startTime,
      endTime: params.endTime,
    });
    if (params.excludeBlockId) {
      queryParams.set('excludeBlockId', params.excludeBlockId);
    }
    const response = await getClient().get<{ data: Conflict[] }>(`/api/blocks/conflicts?${queryParams}`);
    const conflicts = response.data || [];
    return {
      data: {
        hasConflicts: conflicts.length > 0,
        conflicts,
      } as ConflictsResponse,
    };
  },
};

/**
 * Fetch blocks with optional filtering
 */
export function useBlocks(params?: { rentalObjectId?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: blockKeys.list(params),
    queryFn: () => blockService.getAll(params),
  });
}

/**
 * Fetch a single block by ID
 */
export function useBlock(id: string) {
  return useQuery({
    queryKey: blockKeys.detail(id),
    queryFn: () => blockService.getById(id),
    enabled: !!id,
  });
}

/**
 * Create a new block
 */
export function useCreateBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBlockDTO) => blockService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockKeys.all });
      // Also invalidate calendar events
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
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
      blockService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: blockKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: blockKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}

/**
 * Delete a block
 */
export function useDeleteBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blockService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockKeys.all });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
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
    queryFn: () => blockService.checkConflicts(params),
    enabled: isEnabled,
  });
}
