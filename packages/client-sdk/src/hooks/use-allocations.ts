/**
 * Allocations Hooks
 * React Query hooks for resource allocation operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { allocationsService } from '../services/allocations.service';
import type { 
  AllocationQueryParams,
  CreateAllocationDTO,
  UpdateAllocationDTO,
} from '../types';

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get all allocations
 */
export function useAllocations(params?: AllocationQueryParams) {
  return useQuery({
    queryKey: queryKeys.allocations.list(params),
    queryFn: () => allocationsService.getAll(params),
  });
}

/**
 * Get single allocation by ID
 */
export function useAllocation(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.allocations.detail(id),
    queryFn: () => allocationsService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Get allocations for a rental object
 */
export function useRentalObjectAllocations(rentalObjectId: string) {
  return useQuery({
    queryKey: queryKeys.allocations.byRentalObject(rentalObjectId),
    queryFn: () => allocationsService.getByRentalObject(rentalObjectId),
    enabled: !!rentalObjectId,
  });
}

/**
 * Check allocation conflicts
 */
export function useAllocationConflicts(params: {
  rentalObjectId: string;
  startTime: string;
  endTime: string;
}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.allocations.conflicts(params),
    queryFn: () => allocationsService.checkConflicts(params),
    enabled: options?.enabled ?? true,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create allocation mutation
 */
export function useCreateAllocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAllocationDTO) => allocationsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

/**
 * Update allocation mutation
 */
export function useUpdateAllocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAllocationDTO }) => 
      allocationsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

/**
 * Delete allocation mutation
 */
export function useDeleteAllocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => allocationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

/**
 * Bulk create allocations mutation
 */
export function useBulkCreateAllocations() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (allocations: CreateAllocationDTO[]) => 
      allocationsService.bulkCreate(allocations),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}
