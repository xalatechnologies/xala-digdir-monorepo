/**
 * Discount Code Hooks
 * Single Responsibility: React Query hooks for discount codes and validation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { discountCodeService } from '../services/discount-code.service';
import type { DiscountCodeQueryParams, CreateDiscountCodeDTO, DiscountCode } from '../services/discount-code.service';

// ============================================================================
// Discount Code Hooks
// ============================================================================

/**
 * Get all discount codes
 */
export function useDiscountCodes(params?: DiscountCodeQueryParams) {
  return useQuery({
    queryKey: queryKeys.discountCodes.list(params),
    queryFn: () => discountCodeService.getAll(params),
  });
}

/**
 * Get single discount code by ID
 */
export function useDiscountCode(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.discountCodes.detail(id),
    queryFn: () => discountCodeService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Validate a discount code
 */
export function useValidateCode(code: string, rentalObjectId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...queryKeys.discountCodes.all, 'validate', code, rentalObjectId] as const,
    queryFn: () => discountCodeService.validate(code, rentalObjectId),
    enabled: !!code && (options?.enabled ?? true),
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create discount code mutation with optimistic updates
 */
export function useCreateDiscountCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiscountCodeDTO) => discountCodeService.create(data),
    onMutate: async (newDiscountCode) => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.discountCodes.lists() });

      // Snapshot previous value
      const previousDiscountCodes = queryClient.getQueryData(queryKeys.discountCodes.lists());

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.discountCodes.lists(), (old: { data: DiscountCode[] } | undefined) => {
        if (!old?.data) return old;

        // Create optimistic discount code with temporary ID
        const optimisticCode: DiscountCode = {
          id: `temp-${Date.now()}`,
          tenantId: '',
          code: newDiscountCode.code,
          type: newDiscountCode.type,
          value: newDiscountCode.value,
          currency: newDiscountCode.type === 'fixed' ? 'NOK' : undefined,
          description: newDiscountCode.description,
          validFrom: newDiscountCode.validFrom,
          validUntil: newDiscountCode.validUntil,
          usageLimit: newDiscountCode.usageLimit,
          usageCount: 0,
          minBookingValue: newDiscountCode.minBookingValue,
          applicableRentalObjects: newDiscountCode.applicableRentalObjects,
          isActive: newDiscountCode.isActive ?? true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return {
          ...old,
          data: [optimisticCode, ...old.data],
        };
      });

      // Return context with snapshot
      return { previousDiscountCodes };
    },
    onError: (err, newDiscountCode, context) => {
      // Rollback to previous state on error
      if (context?.previousDiscountCodes) {
        queryClient.setQueryData(queryKeys.discountCodes.lists(), context.previousDiscountCodes);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch to get actual data from server
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.all });
    },
  });
}

/**
 * Update discount code mutation with optimistic updates
 */
export function useUpdateDiscountCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDiscountCodeDTO> }) =>
      discountCodeService.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.discountCodes.lists() });
      await queryClient.cancelQueries({ queryKey: queryKeys.discountCodes.detail(id) });

      // Snapshot previous values
      const previousDiscountCodes = queryClient.getQueryData(queryKeys.discountCodes.lists());
      const previousDiscountCode = queryClient.getQueryData(queryKeys.discountCodes.detail(id));

      // Optimistically update list
      queryClient.setQueryData(queryKeys.discountCodes.lists(), (old: { data: DiscountCode[] } | undefined) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.map((code: DiscountCode) =>
            code.id === id
              ? { ...code, ...data, updatedAt: new Date().toISOString() }
              : code
          ),
        };
      });

      // Optimistically update detail
      queryClient.setQueryData(queryKeys.discountCodes.detail(id), (old: { data: DiscountCode } | undefined) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: { ...old.data, ...data, updatedAt: new Date().toISOString() },
        };
      });

      // Return context with snapshots
      return { previousDiscountCodes, previousDiscountCode };
    },
    onError: (err, { id }, context) => {
      // Rollback to previous state on error
      if (context?.previousDiscountCodes) {
        queryClient.setQueryData(queryKeys.discountCodes.lists(), context.previousDiscountCodes);
      }
      if (context?.previousDiscountCode) {
        queryClient.setQueryData(queryKeys.discountCodes.detail(id), context.previousDiscountCode);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch to get actual data from server
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.all });
    },
  });
}

/**
 * Delete discount code mutation with optimistic updates
 */
export function useDeleteDiscountCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discountCodeService.deleteById(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.discountCodes.lists() });
      await queryClient.cancelQueries({ queryKey: queryKeys.discountCodes.detail(id) });

      // Snapshot previous values
      const previousDiscountCodes = queryClient.getQueryData(queryKeys.discountCodes.lists());
      const previousDiscountCode = queryClient.getQueryData(queryKeys.discountCodes.detail(id));

      // Optimistically remove from list
      queryClient.setQueryData(queryKeys.discountCodes.lists(), (old: { data: DiscountCode[] } | undefined) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.filter((code: DiscountCode) => code.id !== id),
        };
      });

      // Optimistically remove detail
      queryClient.removeQueries({ queryKey: queryKeys.discountCodes.detail(id) });

      // Return context with snapshots
      return { previousDiscountCodes, previousDiscountCode };
    },
    onError: (err, id, context) => {
      // Rollback to previous state on error
      if (context?.previousDiscountCodes) {
        queryClient.setQueryData(queryKeys.discountCodes.lists(), context.previousDiscountCodes);
      }
      if (context?.previousDiscountCode) {
        queryClient.setQueryData(queryKeys.discountCodes.detail(id), context.previousDiscountCode);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch to get actual data from server
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.all });
    },
  });
}

/**
 * Toggle discount code active status with optimistic updates
 */
export function useToggleActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discountCodeService.toggleActive(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.discountCodes.lists() });
      await queryClient.cancelQueries({ queryKey: queryKeys.discountCodes.detail(id) });

      // Snapshot previous values
      const previousDiscountCodes = queryClient.getQueryData(queryKeys.discountCodes.lists());
      const previousDiscountCode = queryClient.getQueryData(queryKeys.discountCodes.detail(id));

      // Optimistically toggle in list
      queryClient.setQueryData(queryKeys.discountCodes.lists(), (old: { data: DiscountCode[] } | undefined) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.map((code: DiscountCode) =>
            code.id === id
              ? { ...code, isActive: !code.isActive, updatedAt: new Date().toISOString() }
              : code
          ),
        };
      });

      // Optimistically toggle in detail
      queryClient.setQueryData(queryKeys.discountCodes.detail(id), (old: { data: DiscountCode } | undefined) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: { ...old.data, isActive: !old.data.isActive, updatedAt: new Date().toISOString() },
        };
      });

      // Return context with snapshots
      return { previousDiscountCodes, previousDiscountCode };
    },
    onError: (err, id, context) => {
      // Rollback to previous state on error
      if (context?.previousDiscountCodes) {
        queryClient.setQueryData(queryKeys.discountCodes.lists(), context.previousDiscountCodes);
      }
      if (context?.previousDiscountCode) {
        queryClient.setQueryData(queryKeys.discountCodes.detail(id), context.previousDiscountCode);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch to get actual data from server
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.all });
    },
  });
}
