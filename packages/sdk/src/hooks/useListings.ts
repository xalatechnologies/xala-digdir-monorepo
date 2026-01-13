/**
 * Listings Hooks
 * React Query hooks for listing operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getListings,
  getListing,
  createListing,
  updateListing,
  publishListing,
  archiveListing,
  deleteListing,
} from '../services/api';
import { isUsingMockData } from '../lib/api-client';
import type {
  ListingQueryParams,
  CreateListingDTO,
  UpdateListingDTO,
} from '../types/api';
import { transformListings, transformListing } from '../types/api';

// Query keys for cache management
export const listingKeys = {
  all: ['listings'] as const,
  lists: () => [...listingKeys.all, 'list'] as const,
  list: (params?: ListingQueryParams) => [...listingKeys.lists(), params] as const,
  details: () => [...listingKeys.all, 'detail'] as const,
  detail: (id: string) => [...listingKeys.details(), id] as const,
};

/**
 * Fetch listings with optional filtering
 * Returns empty data when in mock mode (app should use local mock data)
 */
export function useListings(params?: ListingQueryParams) {
  const mockMode = isUsingMockData();
  
  return useQuery({
    queryKey: listingKeys.list(params),
    queryFn: () => getListings(params),
    enabled: !mockMode,
  });
}

/**
 * Fetch listings and transform to UI format
 * Returns empty data when in mock mode (app should use local mock data)
 */
export function useUiListings(params?: ListingQueryParams) {
  const mockMode = isUsingMockData();
  
  return useQuery({
    queryKey: [...listingKeys.list(params), 'ui'],
    queryFn: async () => {
      const response = await getListings(params);
      return {
        ...response,
        data: transformListings(response.data),
      };
    },
    enabled: !mockMode,
  });
}

/**
 * Fetch a single listing by ID
 */
export function useListing(id: string) {
  return useQuery({
    queryKey: listingKeys.detail(id),
    queryFn: () => getListing(id),
    enabled: !!id,
  });
}

/**
 * Fetch a single listing and transform to UI format
 */
export function useUiListing(id: string) {
  return useQuery({
    queryKey: [...listingKeys.detail(id), 'ui'],
    queryFn: async () => {
      const response = await getListing(id);
      return {
        data: transformListing(response.data),
      };
    },
    enabled: !!id,
  });
}

/**
 * Create a new listing
 */
export function useCreateListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateListingDTO) => createListing(data),
    onSuccess: () => {
      // Invalidate listings cache to refetch
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
    },
  });
}

/**
 * Update a listing
 */
export function useUpdateListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateListingDTO }) => 
      updateListing(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific listing and list cache
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
    },
  });
}

/**
 * Publish a listing
 */
export function usePublishListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => publishListing(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
    },
  });
}

/**
 * Archive a listing
 */
export function useArchiveListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => archiveListing(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
    },
  });
}

/**
 * Delete a listing
 */
export function useDeleteListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteListing(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: listingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
    },
  });
}
