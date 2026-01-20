/**
 * Pricing Hooks
 * 
 * React Query hooks for pricing groups and rental object pricing
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pricingService } from '@/services/pricing.service';
import type {
  CreatePricingGroupDTO,
  UpdatePricingGroupDTO,
  ListPricingGroupsQuery,
  UpdateRentalObjectPricingDTO,
  BulkUpdatePricingDTO,
  BookingQuoteRequest,
} from '@/types/pricing.types';
import { queryKeys } from './query-keys';

// ====================================================================
// PRICING GROUPS - QUERIES
// ====================================================================

/**
 * List pricing groups
 */
export function usePricingGroups(query?: Partial<ListPricingGroupsQuery>) {
  return useQuery({
    queryKey: queryKeys.pricing.groups.list(query),
    queryFn: () => pricingService.listGroups(query),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get single pricing group
 */
export function usePricingGroup(id: string) {
  return useQuery({
    queryKey: queryKeys.pricing.groups.detail(id),
    queryFn: () => pricingService.getGroup(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get active pricing groups (for dropdowns)
 */
export function useActivePricingGroups() {
  return useQuery({
    queryKey: queryKeys.pricing.groups.active(),
    queryFn: () => pricingService.getActiveGroups(),
    staleTime: 10 * 60 * 1000,
  });
}

// ====================================================================
// PRICING GROUPS - MUTATIONS  
// ====================================================================

/**
 * Create pricing group
 */
export function useCreatePricingGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePricingGroupDTO) => pricingService.createGroup(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pricing.groups.all() });
      if (data.data) {
        queryClient.setQueryData(queryKeys.pricing.groups.detail(data.data.id), data);
      }
    },
  });
}

/**
 * Update pricing group
 */
export function useUpdatePricingGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePricingGroupDTO }) =>
      pricingService.updateGroup(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pricing.groups.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.pricing.groups.all() });
    },
  });
}

/**
 * Delete pricing group
 */
export function useDeletePricingGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pricingService.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pricing.groups.all() });
    },
  });
}

// ====================================================================
// RENTAL OBJECT PRICING - QUERIES
// ====================================================================

/**
 * Get pricing for a rental object
 */
export function useRentalObjectPricing(rentalObjectId: string) {
  return useQuery({
    queryKey: queryKeys.pricing.rentalObject(rentalObjectId),
    queryFn: () => pricingService.getRentalObjectPricing(rentalObjectId),
    enabled: !!rentalObjectId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get pricing variations for a rental object
 */
export function usePricingVariations(rentalObjectId: string) {
  return useQuery({
    queryKey: queryKeys.pricing.variations(rentalObjectId),
    queryFn: () => pricingService.getPricingVariations(rentalObjectId),
    enabled: !!rentalObjectId,
    staleTime: 5 * 60 * 1000,
  });
}

// ====================================================================
// RENTAL OBJECT PRICING - MUTATIONS
// ====================================================================

/**
 * Update rental object pricing
 */
export function useUpdateRentalObjectPricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rentalObjectId,
      data,
    }: {
      rentalObjectId: string;
      data: UpdateRentalObjectPricingDTO;
    }) => pricingService.updateRentalObjectPricing(rentalObjectId, data),
    onSuccess: (_, { rentalObjectId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pricing.rentalObject(rentalObjectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pricing.variations(rentalObjectId),
      });
    },
  });
}

/**
 * Bulk update pricing for multiple rental objects
 */
export function useBulkUpdatePricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkUpdatePricingDTO) => pricingService.bulkUpdatePricing(data),
    onSuccess: (_, { rentalObjectIds }) => {
      rentalObjectIds.forEach((id) => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.pricing.rentalObject(id),
        });
      });
    },
  });
}

// ====================================================================
// QUOTES
// ====================================================================

/**
 * Get a booking quote
 */
export function useBookingQuote() {
  return useMutation({
    mutationFn: (data: BookingQuoteRequest) => pricingService.getBookingQuote(data),
  });
}

// ====================================================================
// USER PRICING
// ====================================================================

/**
 * Get current user's pricing group
 */
export function useUserPricingGroup(userId?: string) {
  return useQuery({
    queryKey: queryKeys.pricing.userGroup(userId),
    queryFn: () => pricingService.getUserPricingGroup(userId),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Get member count for a pricing group
 */
export function useGroupMembersCount(groupId: string) {
  return useQuery({
    queryKey: queryKeys.pricing.groupMembers(groupId),
    queryFn: () => pricingService.getGroupMembersCount(groupId),
    enabled: !!groupId,
    staleTime: 5 * 60 * 1000,
  });
}
