/**
 * Rental Objects Hooks
 * Primary React Query hooks for rental object (utleieobjekter) operations
 * 
 * This is the main hook library for all rental object operations.
 * Provides full CRUD, availability, stats, and category management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rentalObjectService, publicRentalObjectService } from '../services/rental-object.service';
import type {
  RentalObjectQueryParams,
  CreateRentalObjectDTO,
  UpdateRentalObjectDTO,
  RentalObjectCategory,
  AvailabilityQueryParams,
  PublicRentalObjectParams,
} from '../types/rental-object';
import type { UploadOptions } from '../types/upload';
import { compressImage, isImageFile } from '../utils/image-compression';

// =============================================================================
// Query Keys
// =============================================================================

export const rentalObjectKeys = {
  all: ['rental-objects'] as const,
  lists: () => [...rentalObjectKeys.all, 'list'] as const,
  list: (params?: RentalObjectQueryParams) => [...rentalObjectKeys.lists(), params] as const,
  byCategory: (category: RentalObjectCategory, params?: Omit<RentalObjectQueryParams, 'category'>) =>
    [...rentalObjectKeys.lists(), 'category', category, params] as const,
  details: () => [...rentalObjectKeys.all, 'detail'] as const,
  detail: (id: string) => [...rentalObjectKeys.details(), id] as const,
  bySlug: (slug: string) => [...rentalObjectKeys.all, 'slug', slug] as const,
  categories: () => [...rentalObjectKeys.all, 'categories'] as const,
  subcategories: (category: RentalObjectCategory) =>
    [...rentalObjectKeys.categories(), category, 'subcategories'] as const,
};

// =============================================================================
// List Hooks
// =============================================================================

/**
 * Fetch paginated rental objects with optional filtering
 */
export function useRentalObjects(params?: RentalObjectQueryParams) {
  return useQuery({
    queryKey: rentalObjectKeys.list(params),
    queryFn: () => rentalObjectService.getAll(params),
  });
}

/**
 * Fetch rental objects by category
 */
export function useRentalObjectsByCategory(
  category: RentalObjectCategory,
  params?: Omit<RentalObjectQueryParams, 'category'>
) {
  return useQuery({
    queryKey: rentalObjectKeys.byCategory(category, params),
    queryFn: () => rentalObjectService.getByCategory(category, params),
    enabled: !!category,
  });
}

/**
 * Fetch public rental objects (no auth required)
 */
export function usePublicRentalObjects(params?: RentalObjectQueryParams) {
  return useQuery({
    queryKey: [...rentalObjectKeys.list(params), 'public'],
    queryFn: () => publicRentalObjectService.getAll(params),
  });
}

// =============================================================================
// Detail Hooks
// =============================================================================

/**
 * Fetch single rental object by ID
 */
export function useRentalObject(id: string | undefined) {
  return useQuery({
    queryKey: rentalObjectKeys.detail(id!),
    queryFn: () => rentalObjectService.getById(id!),
    enabled: !!id,
  });
}

/**
 * Fetch rental object by slug
 */
export function useRentalObjectBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: rentalObjectKeys.bySlug(slug!),
    queryFn: () => rentalObjectService.getBySlug(slug!),
    enabled: !!slug,
  });
}

// =============================================================================
// Category Hooks
// =============================================================================

/**
 * Fetch available categories
 */
export function useRentalObjectCategories() {
  return useQuery({
    queryKey: rentalObjectKeys.categories(),
    queryFn: () => rentalObjectService.getCategories(),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

/**
 * Fetch subcategories for a specific category
 */
export function useRentalObjectSubcategories(category: RentalObjectCategory | undefined) {
  return useQuery({
    queryKey: rentalObjectKeys.subcategories(category!),
    queryFn: () => rentalObjectService.getSubcategories(category!),
    enabled: !!category,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Create new rental object
 */
export function useCreateRentalObject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRentalObjectDTO) => rentalObjectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rentalObjectKeys.lists() });
    },
  });
}

/**
 * Update existing rental object
 */
export function useUpdateRentalObject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRentalObjectDTO }) =>
      rentalObjectService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: rentalObjectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: rentalObjectKeys.lists() });
    },
  });
}

/**
 * Delete rental object
 */
export function useDeleteRentalObject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rentalObjectService.deleteById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rentalObjectKeys.lists() });
    },
  });
}

/**
 * Publish rental object
 */
export function usePublishRentalObject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rentalObjectService.publish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: rentalObjectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: rentalObjectKeys.lists() });
    },
  });
}

/**
 * Archive rental object
 */
export function useArchiveRentalObject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rentalObjectService.archive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: rentalObjectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: rentalObjectKeys.lists() });
    },
  });
}

/**
 * Unpublish rental object (set to draft)
 */
export function useUnpublishRentalObject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rentalObjectService.unpublish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: rentalObjectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: rentalObjectKeys.lists() });
    },
  });
}

/**
 * Restore archived rental object
 */
export function useRestoreRentalObject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rentalObjectService.restore(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: rentalObjectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: rentalObjectKeys.lists() });
    },
  });
}

/**
 * Duplicate rental object
 */
export function useDuplicateRentalObject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rentalObjectService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rentalObjectKeys.lists() });
    },
  });
}

// =============================================================================
// Availability and Stats Hooks
// =============================================================================

/**
 * Fetch rental object availability
 */
export function useRentalObjectAvailability(id: string, params: AvailabilityQueryParams) {
  return useQuery({
    queryKey: [...rentalObjectKeys.detail(id), 'availability', params],
    queryFn: () => rentalObjectService.getAvailability(id, params),
    enabled: !!id && !!params.startDate,
  });
}

/**
 * Fetch rental object statistics
 */
export function useRentalObjectStats(id: string) {
  return useQuery({
    queryKey: [...rentalObjectKeys.detail(id), 'stats'],
    queryFn: () => rentalObjectService.getStats(id),
    enabled: !!id,
  });
}

/**
 * Fetch rental object calendar configuration
 */
export function useRentalObjectCalendarConfig(id: string) {
  return useQuery({
    queryKey: [...rentalObjectKeys.detail(id), 'calendar-config'],
    queryFn: () => rentalObjectService.getCalendarConfig(id),
    enabled: !!id,
  });
}

/**
 * Fetch booking time modes
 */
export function useBookingTimeModes() {
  return useQuery({
    queryKey: [...rentalObjectKeys.all, 'time-modes'],
    queryFn: () => rentalObjectService.getTimeModes(),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

// =============================================================================
// Public Hooks (No Auth Required)
// =============================================================================

/**
 * Fetch public rental objects
 */
export function usePublicRentalObjectsList(params?: PublicRentalObjectParams) {
  return useQuery({
    queryKey: [...rentalObjectKeys.list(params as RentalObjectQueryParams), 'public'],
    queryFn: () => publicRentalObjectService.getAll(params),
  });
}

/**
 * Fetch public rental object by ID
 */
export function usePublicRentalObject(id: string) {
  return useQuery({
    queryKey: [...rentalObjectKeys.detail(id), 'public'],
    queryFn: () => publicRentalObjectService.getById(id),
    enabled: !!id,
  });
}

/**
 * Fetch public rental object by slug
 */
export function usePublicRentalObjectBySlug(slug: string) {
  return useQuery({
    queryKey: [...rentalObjectKeys.bySlug(slug), 'public'],
    queryFn: () => publicRentalObjectService.getBySlug(slug),
    enabled: !!slug,
  });
}

/**
 * Fetch public availability
 */
export function usePublicRentalObjectAvailability(rentalObjectId: string, params: AvailabilityQueryParams) {
  return useQuery({
    queryKey: [...rentalObjectKeys.detail(rentalObjectId), 'public', 'availability', params],
    queryFn: () => publicRentalObjectService.getAvailability(rentalObjectId, params),
    enabled: !!rentalObjectId && !!params.startDate,
  });
}

/**
 * Fetch public categories
 */
export function usePublicRentalObjectCategories() {
  return useQuery({
    queryKey: [...rentalObjectKeys.categories(), 'public'],
    queryFn: () => publicRentalObjectService.getCategories(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Get cities with rental objects
 */
export function usePublicCities() {
  return useQuery({
    queryKey: [...rentalObjectKeys.all, 'cities', 'public'],
    queryFn: () => publicRentalObjectService.getCities(),
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Get municipalities
 */
export function usePublicMunicipalities() {
  return useQuery({
    queryKey: [...rentalObjectKeys.all, 'municipalities', 'public'],
    queryFn: () => publicRentalObjectService.getMunicipalities(),
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Get featured rental objects
 */
export function useFeaturedRentalObjects() {
  return useQuery({
    queryKey: [...rentalObjectKeys.all, 'featured', 'public'],
    queryFn: () => publicRentalObjectService.getFeatured(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// =============================================================================
// Media Hooks
// =============================================================================

interface UploadMediaParams {
  id: string;
  files: File[];
  options?: UploadOptions;
}

/**
 * Upload media to a rental object
 */
export function useUploadRentalObjectMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, files, options }: UploadMediaParams) => {
      const shouldCompress = options?.compress !== false;
      const processedFiles = shouldCompress
        ? await Promise.all(
            files.map(async (file) => {
              if (isImageFile(file)) {
                try {
                  return await compressImage(file, options?.compressionOptions);
                } catch {
                  return file;
                }
              }
              return file;
            })
          )
        : files;

      return rentalObjectService.uploadMedia(id, processedFiles, options);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: rentalObjectKeys.detail(id) });
    },
  });
}

/**
 * Delete media from a rental object
 */
export function useDeleteRentalObjectMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rentalObjectId, mediaId }: { rentalObjectId: string; mediaId: string }) => {
      return rentalObjectService.removeMedia(rentalObjectId, mediaId);
    },
    onSuccess: (_, { rentalObjectId }) => {
      queryClient.invalidateQueries({ queryKey: rentalObjectKeys.detail(rentalObjectId) });
    },
  });
}

// =============================================================================
// Combined Hook for List View
// =============================================================================

interface UseRentalObjectsListOptions extends RentalObjectQueryParams {
  enabled?: boolean;
}

/**
 * Combined hook for rental objects list view with category counts
 */
export function useRentalObjectsList(options: UseRentalObjectsListOptions = {}) {
  const { enabled = true, ...params } = options;

  const query = useQuery({
    queryKey: rentalObjectKeys.list(params),
    queryFn: () => rentalObjectService.getAll(params),
    enabled,
  });

  return {
    ...query,
    rentalObjects: query.data?.data ?? [],
    pagination: query.data?.meta,
    total: query.data?.meta?.total ?? 0,
    totalPages: query.data?.meta?.totalPages ?? 1,
    currentPage: query.data?.meta?.page ?? 1,
  };
}
