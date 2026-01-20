/**
 * Search Hooks
 * Single Responsibility: React Query hooks for search functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { searchService } from '@/services/search.service';
import type {
  SearchParams,
  TypeaheadParams,
  SavedFilterQueryParams,
  CreateSavedFilterDTO,
  UpdateSavedFilterDTO,
  RecentSearchQueryParams,
  ExportSearchParams
} from '@/types/search';

// ============================================================================
// Global Search Hooks
// ============================================================================

/**
 * Execute global search across entities
 */
export function useGlobalSearch(params: SearchParams) {
  return useQuery({
    queryKey: queryKeys.search.results(params),
    queryFn: () => searchService.search(params),
    enabled: !!params.query && params.query.length > 0,
  });
}

/**
 * Get typeahead suggestions as user types
 */
export function useTypeahead(params: TypeaheadParams) {
  return useQuery({
    queryKey: queryKeys.search.typeahead(params),
    queryFn: () => searchService.typeahead(params),
    enabled: !!params.query && params.query.length > 0,
    staleTime: 30000, // Suggestions stay fresh for 30 seconds
  });
}

// ============================================================================
// Saved Filter Hooks
// ============================================================================

/**
 * Get user's saved filters
 */
export function useSavedFilters(params?: SavedFilterQueryParams) {
  return useQuery({
    queryKey: queryKeys.search.savedFilters.list(params),
    queryFn: () => searchService.getSavedFilters(params),
  });
}

/**
 * Get single saved filter by ID
 */
export function useSavedFilter(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.search.savedFilters.detail(id),
    queryFn: () => searchService.getSavedFilterById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Create new saved filter mutation
 */
export function useCreateSavedFilter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSavedFilterDTO) => searchService.createSavedFilter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.search.savedFilters.all() });
    },
  });
}

/**
 * Update existing saved filter mutation
 */
export function useUpdateSavedFilter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSavedFilterDTO }) =>
      searchService.updateSavedFilter(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.search.savedFilters.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.search.savedFilters.lists() });
    },
  });
}

/**
 * Delete saved filter mutation
 */
export function useDeleteSavedFilter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => searchService.deleteSavedFilter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.search.savedFilters.all() });
    },
  });
}

// ============================================================================
// Recent Searches Hooks
// ============================================================================

/**
 * Get user's recent searches
 */
export function useRecentSearches(params?: RecentSearchQueryParams) {
  return useQuery({
    queryKey: queryKeys.search.recent(params),
    queryFn: () => searchService.getRecentSearches(params),
  });
}

// ============================================================================
// Export Hooks
// ============================================================================

/**
 * Export search results mutation
 */
export function useExportResults() {
  return useMutation({
    mutationFn: (params: ExportSearchParams) => searchService.exportResults(params),
  });
}
