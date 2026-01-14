/**
 * Listing Hooks
 * Single Responsibility: React Query hooks for listings
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { listingService, publicListingService } from '../services/listing.service';
import type {
  ListingQueryParams,
  CreateListingDTO,
  UpdateListingDTO,
  AvailabilityQueryParams,
  PublicListingParams
} from '../types/listing';
import { transformListings, transformListing } from '../types/listing';
import type { UploadOptions } from '../types/upload';
import { compressImage, isImageFile } from '../utils/image-compression';

// ============================================================================
// Authenticated Listing Hooks
// ============================================================================

/**
 * Get paginated listings
 */
export function useListings(params?: ListingQueryParams) {
  return useQuery({
    queryKey: queryKeys.listings.list(params),
    queryFn: () => listingService.getAll(params),
  });
}

/**
 * Get single listing by ID
 */
export function useListing(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.listings.detail(id),
    queryFn: () => listingService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Get listing by slug
 */
export function useListingBySlug(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.listings.slug(slug),
    queryFn: () => listingService.getBySlug(slug),
    enabled: !!slug && (options?.enabled ?? true),
  });
}

/**
 * Get listing availability
 */
export function useListingAvailability(id: string, params: AvailabilityQueryParams) {
  return useQuery({
    queryKey: queryKeys.listings.availability(id, params),
    queryFn: () => listingService.getAvailability(id, params),
    enabled: !!id && !!params.startDate,
  });
}

/**
 * Get listing statistics
 */
export function useListingStats(id: string) {
  return useQuery({
    queryKey: queryKeys.listings.stats(id),
    queryFn: () => listingService.getStats(id),
    enabled: !!id,
  });
}

/**
 * Create listing mutation
 */
export function useCreateListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateListingDTO) => listingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.lists() });
    },
  });
}

/**
 * Update listing mutation
 */
export function useUpdateListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateListingDTO }) => 
      listingService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.lists() });
    },
  });
}

/**
 * Delete listing mutation
 */
export function useDeleteListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => listingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
    },
  });
}

/**
 * Publish listing mutation
 */
export function usePublishListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => listingService.publish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.lists() });
    },
  });
}

/**
 * Archive listing mutation
 */
export function useArchiveListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => listingService.archive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.lists() });
    },
  });
}

/**
 * Duplicate listing mutation
 */
export function useDuplicateListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => listingService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.lists() });
    },
  });
}

/**
 * Unpublish listing mutation
 */
export function useUnpublishListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => listingService.unpublish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.lists() });
    },
  });
}

/**
 * Restore archived listing mutation
 */
export function useRestoreListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => listingService.restore(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.lists() });
    },
  });
}

// ============================================================================
// Public Listing Hooks (No Auth)
// ============================================================================

/**
 * Get public listings
 */
export function usePublicListings(params?: PublicListingParams) {
  return useQuery({
    queryKey: queryKeys.public.listings(params),
    queryFn: () => publicListingService.getListings(params),
  });
}

/**
 * Get public listings transformed to UI format
 */
export function usePublicUiListings(params?: PublicListingParams) {
  return useQuery({
    queryKey: [...queryKeys.public.listings(params), 'ui'],
    queryFn: async () => {
      const response = await publicListingService.getListings(params);
      return {
        ...response,
        data: transformListings(response.data),
      };
    },
  });
}

/**
 * Get public listing by ID
 */
export function usePublicListing(id: string) {
  return useQuery({
    queryKey: queryKeys.public.listing(id),
    queryFn: () => publicListingService.getListing(id),
    enabled: !!id,
  });
}

/**
 * Get public listing by ID transformed to UI format
 */
export function usePublicUiListing(id: string) {
  return useQuery({
    queryKey: [...queryKeys.public.listing(id), 'ui'],
    queryFn: async () => {
      const response = await publicListingService.getListing(id);
      return {
        data: transformListing(response.data),
      };
    },
    enabled: !!id,
  });
}

/**
 * Get public availability
 */
export function usePublicAvailability(listingId: string, params: AvailabilityQueryParams) {
  return useQuery({
    queryKey: queryKeys.public.availability(listingId, params),
    queryFn: () => publicListingService.getAvailability(listingId, params),
    enabled: !!listingId && !!params.startDate,
  });
}

/**
 * Get public categories
 */
export function usePublicCategories() {
  return useQuery({
    queryKey: queryKeys.public.categories(),
    queryFn: () => publicListingService.getCategories(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Get cities with listings
 */
export function usePublicCities() {
  return useQuery({
    queryKey: queryKeys.public.cities(),
    queryFn: () => publicListingService.getCities(),
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Get municipalities
 */
export function usePublicMunicipalities() {
  return useQuery({
    queryKey: queryKeys.public.municipalities(),
    queryFn: () => publicListingService.getMunicipalities(),
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Get featured listings
 */
export function useFeaturedListings() {
  return useQuery({
    queryKey: queryKeys.public.featured(),
    queryFn: () => publicListingService.getFeatured(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// Media Hooks
// ============================================================================

interface UploadMediaParams {
  id: string;
  files: File[];
  options?: UploadOptions;
}

/**
 * Upload media to a listing
 * Uses proper multipart/form-data upload with optional compression and progress tracking
 */
export function useUploadListingMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, files, options }: UploadMediaParams) => {
      // Compress images if enabled (default: true)
      const shouldCompress = options?.compress !== false;
      const processedFiles = shouldCompress
        ? await Promise.all(
            files.map(async (file) => {
              // Only compress image files
              if (isImageFile(file)) {
                try {
                  return await compressImage(file, options?.compressionOptions);
                } catch {
                  // If compression fails, use original file
                  return file;
                }
              }
              return file;
            })
          )
        : files;

      // Upload using multipart/form-data
      return listingService.uploadMedia(id, processedFiles, options);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.detail(id) });
    },
  });
}

/**
 * Delete media from a listing
 */
export function useDeleteListingMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listingId, mediaId }: { listingId: string; mediaId: string }) => {
      return listingService.removeMedia(listingId, mediaId);
    },
    onSuccess: (_, { listingId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.detail(listingId) });
    },
  });
}
