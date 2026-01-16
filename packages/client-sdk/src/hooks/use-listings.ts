/**
 * DEPRECATED Listing Hooks
 * 
 * @deprecated This file is being phased out. Use the rental-object hooks instead:
 * - usePublicListings → usePublicRentalObjectsList
 * - usePublicListing → usePublicRentalObject
 * - usePublicCities → import from use-rental-objects
 * - usePublicMunicipalities → import from use-rental-objects
 * 
 * This file will be removed in the next major version.
 */

import { useQuery } from '@tanstack/react-query';
import { publicRentalObjectService } from '../services/rental-object.service';
import type { PublicRentalObjectParams } from '../types/rental-object';

/**
 * @deprecated Use usePublicRentalObjectsList from use-rental-objects.ts
 */
export function usePublicListings(params?: PublicRentalObjectParams) {
  return useQuery({
    queryKey: ['public', 'rental-objects', params],
    queryFn: () => publicRentalObjectService.getAll(params),
  });
}

/**
 * @deprecated Use usePublicRentalObject from use-rental-objects.ts
 */
export function usePublicListing(id: string) {
  return useQuery({
    queryKey: ['public', 'rental-object', id],
    queryFn: () => publicRentalObjectService.getById(id),
    enabled: !!id,
  });
}

/**
 * @deprecated Use usePublicCities from use-rental-objects.ts
 */
export function usePublicCities() {
  return useQuery({
    queryKey: ['rental-objects', 'cities', 'public'],
    queryFn: () => publicRentalObjectService.getCities(),
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * @deprecated Use usePublicMunicipalities from use-rental-objects.ts
 */
export function usePublicMunicipalities() {
  return useQuery({
    queryKey: ['rental-objects', 'municipalities', 'public'],
    queryFn: () => publicRentalObjectService.getMunicipalities(),
    staleTime: 60 * 60 * 1000,
  });
}

// =============================================================================
// Query Hook Aliases (Backward Compatibility)
// =============================================================================
// These are direct re-exports to support legacy "listing" terminology in backoffice
// @deprecated Use rental object hooks directly from use-rental-objects.ts

export {
  useRentalObject as useListing,
  useRentalObjectBySlug as useListingBySlug,
} from './use-rental-objects';

// =============================================================================
// Mutation Hook Aliases (Backward Compatibility)
// =============================================================================
// These are direct re-exports to support legacy "listing" terminology in backoffice
// @deprecated Use rental object hooks directly from use-rental-objects.ts

export {
  useCreateRentalObject as useCreateListing,
  useUpdateRentalObject as useUpdateListing,
  usePublishRentalObject as usePublishListing,
  useArchiveRentalObject as useArchiveListing,
  useDeleteRentalObject as useDeleteListing,
  useDuplicateRentalObject as useDuplicateListing,
  useUploadRentalObjectMedia as useUploadListingMedia,
  useDeleteRentalObjectMedia as useDeleteListingMedia,
} from './use-rental-objects';
