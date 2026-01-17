/**
 * AMENITIES HOOKS
 * 
 * React Query hooks for Amenities API.
 * Provides optimistic updates, cache invalidation, and loading states.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { amenitiesService } from '../services';
import type {
  CreateAmenityRequest,
  UpdateAmenityRequest,
  AssignAmenitiesRequest,
} from '../services/amenities.service';

// Query keys factory
export const amenitiesKeys = {
  all: ['amenities'] as const,
  lists: () => [...amenitiesKeys.all, 'list'] as const,
  list: () => [...amenitiesKeys.lists()] as const,
  grouped: () => [...amenitiesKeys.all, 'grouped'] as const,
  details: () => [...amenitiesKeys.all, 'detail'] as const,
  detail: (id: string) => [...amenitiesKeys.details(), id] as const,
  rentalObject: (id: string) => [...amenitiesKeys.all, 'rental-object', id] as const,
};

/**
 * List all amenities
 */
export function useAmenities() {
  return useQuery({
    queryKey: amenitiesKeys.list(),
    queryFn: async () => {
      const response = await amenitiesService.list();
      return response.data;
    },
  });
}

/**
 * List amenities grouped by category
 */
export function useAmenitiesGrouped() {
  return useQuery({
    queryKey: amenitiesKeys.grouped(),
    queryFn: async () => {
      const response = await amenitiesService.listGrouped();
      return response.data;
    },
  });
}

/**
 * Get single amenity
 */
export function useAmenity(id: string) {
  return useQuery({
    queryKey: amenitiesKeys.detail(id),
    queryFn: async () => {
      const response = await amenitiesService.get(id);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Get amenities for rental object
 */
export function useRentalObjectAmenities(rentalObjectId: string) {
  return useQuery({
    queryKey: amenitiesKeys.rentalObject(rentalObjectId),
    queryFn: async () => {
      const response = await amenitiesService.getForRentalObject(rentalObjectId);
      return response.data;
    },
    enabled: !!rentalObjectId,
  });
}

/**
 * Create amenity (admin only)
 */
export function useCreateAmenity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAmenityRequest) => amenitiesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.lists() });
    },
  });
}

/**
 * Update amenity (admin only)
 */
export function useUpdateAmenity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAmenityRequest }) =>
      amenitiesService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.detail(id) });
    },
  });
}

/**
 * Delete amenity (admin only)
 */
export function useDeleteAmenity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => amenitiesService.deleteById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.lists() });
    },
  });
}

/**
 * Assign amenities to rental object
 */
export function useAssignAmenities() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rentalObjectId, data }: { rentalObjectId: string; data: AssignAmenitiesRequest }) =>
      amenitiesService.assignToRentalObject(rentalObjectId, data),
    onSuccess: (_, { rentalObjectId }) => {
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.rentalObject(rentalObjectId) });
    },
  });
}
