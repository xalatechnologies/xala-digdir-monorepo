import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pricingService } from '../services/pricing.service';
import type {
  PricingGroup,
  PricingGroupListResponse,
  CreatePricingGroupDTO,
  UpdatePricingGroupDTO,
  ListPricingGroupsQuery,
  RentalObjectPricing,
  UpdateRentalObjectPricingDTO,
} from '../types/pricing.types';
import { queryKeys } from './query-keys';

/**
 * Pricing Hooks
 * 
 * React Query hooks for pricing groups and rental object pricing
 */

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
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ====================================================================
// PRICING GROUPS - MUTATIONS  
// ====================================================================

/**
 * Create pricing group (admin only)
 */
export function useCreatePricingGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePricingGroupDTO) => pricingService.createGroup(data),
    onSuccess: (data) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.pricing.groups.lists() });
      
      // Set detail cache
      queryClient.setQueryData(queryKeys.pricing.groups.detail(data.id), data);
    },
  });
}

/**
 * Update pricing group (admin only)
 */
export function useUpdatePricingGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePricingGroupDTO }) =>
      pricingService.updateGroup(id, data),
    onSuccess: (data, variables) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.pricing.groups.lists() });
      
      // Update detail cache
      queryClient.setQueryData(queryKeys.pricing.groups.detail(variables.id), data);
    },
  });
}

/**
 * Delete pricing group (admin only)
 */
export function useDeletePricingGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pricingService.deleteGroup(id),
    onSuccess: (_, id) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.pricing.groups.lists() });
      
      // Remove detail cache
      queryClient.removeQueries({ queryKey: queryKeys.pricing.groups.detail(id) });
    },
  });
}

// ====================================================================
// RENTAL OBJECT PRICING - QUERIES
// ====================================================================

/**
 * Get pricing for rental object
 */
export function useRentalObjectPricing(rentalObjectId: string) {
  return useQuery({
    queryKey: queryKeys.pricing.rentalObject(rentalObjectId),
    queryFn: () => pricingService.getRentalObjectPricing(rentalObjectId),
    enabled: !!rentalObjectId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get all pricing variations for a rental object
 */
export function useRentalObjectPricingVariations(rentalObjectId: string) {
  return useQuery({
    queryKey: queryKeys.pricing.variations(rentalObjectId),
    queryFn: () => pricingService.getPricingVariations(rentalObjectId),
    enabled: !!rentalObjectId,
    staleTime: 2 * 60 * 1000,
  });
}

// ====================================================================
// RENTAL OBJECT PRICING - MUTATIONS
// ====================================================================

/**
 * Update rental object pricing (admin only)
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
    onSuccess: (_, variables) => {
      // Invalidate rental object pricing
      queryClient.invalidateQueries({
        queryKey: queryKeys.pricing.rentalObject(variables.rentalObjectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pricing.variations(variables.rentalObjectId),
      });
      
      // Also invalidate rental object details (price changed)
      queryClient.invalidateQueries({
        queryKey: ['rentalObjects', 'detail', variables.rentalObjectId],
      });
    },
  });
}

/**
 * Bulk update pricing for multiple rental objects (admin only)
 */
export function useBulkUpdatePricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      rentalObjectIds: string[];
      pricing: UpdateRentalObjectPricingDTO;
    }) => pricingService.bulkUpdatePricing(data),
    onSuccess: (_, variables) => {
      // Invalidate all affected rental objects
      variables.rentalObjectIds.forEach((id) => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.pricing.rentalObject(id),
        });
        queryClient.invalidateQueries({
          queryKey: ['rentalObjects', 'detail', id],
        });
      });
    },
  });
}

// ====================================================================
// BOOKING QUOTE
// ====================================================================

/**
 * Get booking quote (pricing calculator)
 */
export function useBookingQuote() {
  return useMutation({
    mutationFn: (data: {
      rentalObjectId: string;
      startTime: string;
      endTime: string;
      pricingGroupId?: string;
      addonIds?: string[];
    }) => pricingService.getBookingQuote(data),
  });
}

// ====================================================================
// HELPER HOOKS
// ====================================================================

/**
 * Check if user belongs to any pricing group
 */
export function useUserPricingGroup(userId?: string) {
  return useQuery({
    queryKey: queryKeys.pricing.userGroup(userId),
    queryFn: () => pricingService.getUserPricingGroup(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get pricing group members count
 */
export function usePricingGroupMembersCount(groupId: string) {
  return useQuery({
    queryKey: queryKeys.pricing.groupMembers(groupId),
    queryFn: () => pricingService.getGroupMembersCount(groupId),
    enabled: !!groupId,
    staleTime: 2 * 60 * 1000,
  });
}
