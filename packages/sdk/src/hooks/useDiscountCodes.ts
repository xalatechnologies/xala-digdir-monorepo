/**
 * Discount Code Hooks
 * React Query hooks for discount code operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDiscountCodes,
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
  validateDiscountCode,
} from '../services/api';
import type { CreateDiscountCodeDTO } from '../types/api';

// Query keys for cache management
export const discountCodeKeys = {
  all: ['discountCodes'] as const,
  list: () => [...discountCodeKeys.all, 'list'] as const,
};

/**
 * Get all discount codes
 */
export function useDiscountCodes() {
  return useQuery({
    queryKey: discountCodeKeys.list(),
    queryFn: () => getDiscountCodes(),
  });
}

/**
 * Create a discount code
 */
export function useCreateDiscountCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiscountCodeDTO) => createDiscountCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountCodeKeys.list() });
    },
  });
}

/**
 * Update a discount code
 */
export function useUpdateDiscountCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDiscountCodeDTO> }) =>
      updateDiscountCode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountCodeKeys.list() });
    },
  });
}

/**
 * Delete a discount code
 */
export function useDeleteDiscountCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDiscountCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountCodeKeys.list() });
    },
  });
}

/**
 * Validate a discount code
 */
export function useValidateDiscountCode() {
  return useMutation({
    mutationFn: ({ code, listingId }: { code: string; listingId?: string }) =>
      validateDiscountCode(code, listingId),
  });
}
