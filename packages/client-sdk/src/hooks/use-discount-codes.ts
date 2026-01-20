/**
 * Discount Codes Hooks
 * React Query hooks for discount/promo code management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { discountCodesService } from '@/services/discount-codes.service';
import type { 
  DiscountCodeQueryParams,
  CreateDiscountCodeDTO,
  UpdateDiscountCodeDTO,
  ValidateDiscountCodeDTO,
} from '@/types';

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get all discount codes
 */
export function useDiscountCodes(params?: DiscountCodeQueryParams) {
  return useQuery({
    queryKey: queryKeys.discountCodes.list(params),
    queryFn: () => discountCodesService.getAll(params),
  });
}

/**
 * Get single discount code by ID
 */
export function useDiscountCode(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.discountCodes.detail(id),
    queryFn: () => discountCodesService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Get discount code by code string
 */
export function useDiscountCodeByCode(code: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.discountCodes.byCode(code),
    queryFn: () => discountCodesService.getByCode(code),
    enabled: !!code && (options?.enabled ?? true),
  });
}

/**
 * Validate discount code
 */
export function useValidateDiscountCode(data: ValidateDiscountCodeDTO, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.discountCodes.validate(data),
    queryFn: () => discountCodesService.validate(data),
    enabled: !!data.code && (options?.enabled ?? true),
  });
}

/**
 * Get discount code usage stats
 */
export function useDiscountCodeStats(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.discountCodes.stats(id),
    queryFn: () => discountCodesService.getUsageStats(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create discount code mutation
 */
export function useCreateDiscountCode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateDiscountCodeDTO) => discountCodesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.all });
    },
  });
}

/**
 * Update discount code mutation
 */
export function useUpdateDiscountCode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDiscountCodeDTO }) => 
      discountCodesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.lists() });
    },
  });
}

/**
 * Delete discount code mutation
 */
export function useDeleteDiscountCode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => discountCodesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.all });
    },
  });
}

/**
 * Apply discount code to booking mutation
 */
export function useApplyDiscountCode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ code, bookingId }: { code: string; bookingId: string }) => 
      discountCodesService.apply(code, bookingId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.bookingId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.all });
    },
  });
}

/**
 * Deactivate discount code mutation
 */
export function useDeactivateDiscountCode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => discountCodesService.deactivate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.lists() });
    },
  });
}

/**
 * Activate discount code mutation
 */
export function useActivateDiscountCode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => discountCodesService.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.lists() });
    },
  });
}
