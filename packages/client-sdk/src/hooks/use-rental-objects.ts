/**
 * Rental Objects Hooks
 * React Query hooks for rental object (utleieobjekter) operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rentalObjectService, publicRentalObjectService } from '../services/rental-object.service';
import type {
  RentalObject,
  RentalObjectQueryParams,
  CreateRentalObjectDTO,
  UpdateRentalObjectDTO,
  RentalObjectCategory,
  RentalObjectsResponse,
} from '../types/rental-object';

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
    mutationFn: (id: string) => rentalObjectService.delete(id),
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
