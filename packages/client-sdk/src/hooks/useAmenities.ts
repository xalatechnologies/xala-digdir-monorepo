/**
 * AMENITIES HOOKS
 * 
 * React Query hooks for Amenities API.
 * Provides optimistic updates, cache invalidation, and loading states.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  AmenityDTO,
  AmenityGroupDTO,
} from '@digilist/types';
import type {
  CreateAmenityRequest,
  UpdateAmenityRequest,
  AssignAmenitiesRequest,
} from '../services/amenities.service';
import { useApiClient } from './useApiClient';

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
  const { amenities } = useApiClient();

  return useQuery({
    queryKey: amenitiesKeys.list(),
    queryFn: async () => {
      const response = await amenities.list();
      return response.data;
    },
  });
}

/**
 * List amenities grouped by category
 */
export function useAmenitiesGrouped() {
  const { amenities } = useApiClient();

  return useQuery({
    queryKey: amenitiesKeys.grouped(),
    queryFn: async () => {
      const response = await amenities.listGrouped();
      return response.data;
    },
  });
}

/**
 * Get single amenity
 */
export function useAmenity(id: string) {
  const { amenities } = useApiClient();

  return useQuery({
    queryKey: amenitiesKeys.detail(id),
    queryFn: async () => {
      const response = await amenities.get(id);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Get amenities for rental object
 */
export function useRentalObjectAmenities(rentalObjectId: string) {
  const { amenities } = useApiClient();

  return useQuery({
    queryKey: amenitiesKeys.rentalObject(rentalObjectId),
    queryFn: async () => {
      const response = await amenities.getForRentalObject(rentalObjectId);
      return response.data;
    },
    enabled: !!rentalObjectId,
  });
}

/**
 * Create amenity (admin only)
 */
export function useCreateAmenity() {
  const { amenities } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAmenityRequest) => amenities.create(data),
    onSuccess: () => {
      // Invalidate all amenity queries
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.all });
    },
  });
}

/**
 * Update amenity (admin only)
 */
export function useUpdateAmenity() {
  const { amenities } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAmenityRequest }) =>
      amenities.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific amenity and list
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.lists() });
    },
  });
}

/**
 * Delete amenity (admin only)
 */
export function useDeleteAmenity() {
  const { amenities } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => amenities.deleteById(id),
    onSuccess: () => {
      // Invalidate all amenity queries
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.all });
    },
  });
}

/**
 * Assign amenities to rental object (admin only)
 */
export function useAssignAmenities() {
  const { amenities } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rentalObjectId, data }: { rentalObjectId: string; data: AssignAmenitiesRequest }) =>
      amenities.assignToRentalObject(rentalObjectId, data),
    onSuccess: (_, variables) => {
      // Invalidate rental object amenities
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.rentalObject(variables.rentalObjectId) });
      // Invalidate rental object details
      queryClient.invalidateQueries({ queryKey: ['rental-objects', 'detail', variables.rentalObjectId] });
    },
  });
}
