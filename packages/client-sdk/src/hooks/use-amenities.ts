/**
 * Amenities Hooks
 * React Query hooks for amenity/feature management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { amenitiesService } from '@/services/amenities.service';
import type { 
  AmenityQueryParams,
  CreateAmenityDTO,
  UpdateAmenityDTO,
} from '@/types';

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get all amenities
 */
export function useAmenities(params?: AmenityQueryParams) {
  return useQuery({
    queryKey: queryKeys.amenities.list(params),
    queryFn: () => amenitiesService.getAll(params),
  });
}

/**
 * Get single amenity by ID
 */
export function useAmenity(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.amenities.detail(id),
    queryFn: () => amenitiesService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Get amenities by category
 */
export function useAmenitiesByCategory(category: string) {
  return useQuery({
    queryKey: queryKeys.amenities.byCategory(category),
    queryFn: () => amenitiesService.getByCategory(category),
    enabled: !!category,
  });
}

/**
 * Get popular amenities
 */
export function usePopularAmenities(limit = 10) {
  return useQuery({
    queryKey: queryKeys.amenities.popular(limit),
    queryFn: () => amenitiesService.getPopular(limit),
  });
}

/**
 * Search amenities
 */
export function useSearchAmenities(query: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.amenities.search(query),
    queryFn: () => amenitiesService.search(query),
    enabled: !!query && (options?.enabled ?? true),
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create amenity mutation
 */
export function useCreateAmenity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAmenityDTO) => amenitiesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.amenities.all });
    },
  });
}

/**
 * Update amenity mutation
 */
export function useUpdateAmenity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAmenityDTO }) => 
      amenitiesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.amenities.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.amenities.lists() });
    },
  });
}

/**
 * Delete amenity mutation
 */
export function useDeleteAmenity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => amenitiesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.amenities.all });
    },
  });
}
