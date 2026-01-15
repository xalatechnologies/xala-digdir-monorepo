/**
 * Discount Code Hooks
 * React Query hooks for discount code operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  discountCodeService,
  type DiscountCode,
  type DiscountCodeQueryParams,
  type CreateDiscountCodeDTO,
  type ValidateCodeResult,
} from '../services/discount-code.service';
import { queryKeys } from './query-keys';

// Re-export types
export type { DiscountCode, DiscountCodeQueryParams, CreateDiscountCodeDTO, ValidateCodeResult };

/**
 * Fetch discount codes with optional filtering
 */
export function useDiscountCodes(params?: DiscountCodeQueryParams) {
  return useQuery({
    queryKey: [...queryKeys.discountCodes.list(), params] as const,
    queryFn: () => discountCodeService.getAll(params),
  });
}

/**
 * Fetch a single discount code by ID
 */
export function useDiscountCode(id: string) {
  return useQuery({
    queryKey: queryKeys.discountCodes.detail(id),
    queryFn: () => discountCodeService.getById(id),
    enabled: !!id,
  });
}

/**
 * Create a new discount code
 */
export function useCreateDiscountCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiscountCodeDTO) => discountCodeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.all });
    },
  });
}

/**
 * Update an existing discount code
 */
export function useUpdateDiscountCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDiscountCodeDTO> }) =>
      discountCodeService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.list() });
    },
  });
}

/**
 * Delete a discount code
 */
export function useDeleteDiscountCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discountCodeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.all });
    },
  });
}

/**
 * Validate a discount code
 */
export function useValidateDiscountCode(code: string, listingId?: string) {
  return useQuery({
    queryKey: [...queryKeys.discountCodes.all, 'validate', code, listingId] as const,
    queryFn: () => discountCodeService.validate(code, listingId),
    enabled: !!code,
  });
}

/**
 * Toggle discount code active status
 */
export function useToggleDiscountCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discountCodeService.toggleActive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.list() });
    },
  });
}
