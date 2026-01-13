/**
 * Public API Hooks
 * React Query hooks for public (no-auth) API operations
 */

import { useQuery } from '@tanstack/react-query';
import {
  getPublicListings,
  getPublicListing,
  getPublicAvailability,
  getPublicCategories,
  getFeaturedListings,
  getCities,
  getMunicipalities,
} from '../services/api';
import { transformListings, transformListing } from '../types/api';
import type { PublicListingParams, AvailabilityQueryParams } from '../types/api';

// Query keys for cache management
export const publicKeys = {
  all: ['public'] as const,
  listings: (params?: PublicListingParams) => [...publicKeys.all, 'listings', params] as const,
  listing: (id: string) => [...publicKeys.all, 'listing', id] as const,
  availability: (listingId: string, params: AvailabilityQueryParams) =>
    [...publicKeys.all, 'availability', listingId, params] as const,
  categories: () => [...publicKeys.all, 'categories'] as const,
  featured: () => [...publicKeys.all, 'featured'] as const,
  cities: () => [...publicKeys.all, 'cities'] as const,
  municipalities: () => [...publicKeys.all, 'municipalities'] as const,
};

/**
 * Get public listings (no auth required)
 */
export function usePublicListings(params?: PublicListingParams) {
  return useQuery({
    queryKey: publicKeys.listings(params),
    queryFn: () => getPublicListings(params),
  });
}

/**
 * Get public listings transformed to UI format
 */
export function usePublicUiListings(params?: PublicListingParams) {
  return useQuery({
    queryKey: [...publicKeys.listings(params), 'ui'],
    queryFn: async () => {
      const response = await getPublicListings(params);
      return {
        ...response,
        data: transformListings(response.data),
      };
    },
  });
}

/**
 * Get public listing detail (no auth required)
 */
export function usePublicListing(id: string) {
  return useQuery({
    queryKey: publicKeys.listing(id),
    queryFn: () => getPublicListing(id),
    enabled: !!id,
  });
}

/**
 * Get public listing detail transformed to UI format
 */
export function usePublicUiListing(id: string) {
  return useQuery({
    queryKey: [...publicKeys.listing(id), 'ui'],
    queryFn: async () => {
      const response = await getPublicListing(id);
      return {
        data: transformListing(response.data),
      };
    },
    enabled: !!id,
  });
}

/**
 * Get public listing availability (no auth required)
 */
export function usePublicAvailability(listingId: string, params: AvailabilityQueryParams) {
  return useQuery({
    queryKey: publicKeys.availability(listingId, params),
    queryFn: () => getPublicAvailability(listingId, params),
    enabled: !!listingId && !!params.startDate,
  });
}

/**
 * Get public categories (no auth required)
 */
export function usePublicCategories() {
  return useQuery({
    queryKey: publicKeys.categories(),
    queryFn: () => getPublicCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get featured listings (no auth required)
 */
export function useFeaturedListings() {
  return useQuery({
    queryKey: publicKeys.featured(),
    queryFn: () => getFeaturedListings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get cities with listings (no auth required)
 */
export function useCities() {
  return useQuery({
    queryKey: publicKeys.cities(),
    queryFn: () => getCities(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Get municipalities with listings (no auth required)
 */
export function useMunicipalities() {
  return useQuery({
    queryKey: publicKeys.municipalities(),
    queryFn: () => getMunicipalities(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
