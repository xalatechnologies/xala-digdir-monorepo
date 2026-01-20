import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesService } from '../services/favorites.service';
import type {
  CreateFavoriteDTO,
  UpdateFavoriteDTO,
  ListFavoritesQuery,
  BulkAddFavoritesDTO,
  BulkRemoveFavoritesDTO,
} from '../types/favorites.types';
import { queryKeys } from './query-keys';

/**
 * Favorites Hooks
 * 
 * React Query hooks for favorites/wishlist
 */

// ====================================================================
// QUERIES
// ====================================================================

/**
 * List user's favorites
 */
export function useFavorites(query?: Partial<ListFavoritesQuery>) {
  return useQuery({
    queryKey: queryKeys.favorites.list(query),
    queryFn: () => favoritesService.list(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get single favorite
 */
export function useFavorite(id: string) {
  return useQuery({
    queryKey: queryKeys.favorites.detail(id),
    queryFn: () => favoritesService.getById(id),
    enabled: !!id,
  });
}

/**
 * Check if rental object is favorited
 */
export function useIsFavorited(rentalObjectId: string) {
  return useQuery({
    queryKey: queryKeys.favorites.isFavorited(rentalObjectId),
    queryFn: () => favoritesService.checkIsFavorited(rentalObjectId),
    enabled: !!rentalObjectId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Get favorite count
 */
export function useFavoriteCount() {
  return useQuery({
    queryKey: queryKeys.favorites.count(),
    queryFn: () => favoritesService.getCount(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ====================================================================
// MUTATIONS
// ====================================================================

/**
 * Add favorite
 */
export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFavoriteDTO) => favoritesService.add(data),
    onSuccess: (_, variables) => {
      // Invalidate favorites list
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.lists() });
      
      // Invalidate favorite count
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.count() });
      
      // Update isFavorited cache
      queryClient.setQueryData(
        queryKeys.favorites.isFavorited(variables.rentalObjectId),
        { isFavorited: true }
      );
    },
  });
}

/**
 * Update favorite
 */
export function useUpdateFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFavoriteDTO }) =>
      favoritesService.update(id, data),
    onSuccess: (data, variables) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.lists() });
      
      // Update detail cache
      queryClient.setQueryData(
        queryKeys.favorites.detail(variables.id),
        data
      );
    },
  });
}

/**
 * Remove favorite
 */
export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => favoritesService.remove(id),
    onSuccess: (_, id) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.lists() });
      
      // Invalidate count
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.count() });
      
      // Remove detail cache
      queryClient.removeQueries({ queryKey: queryKeys.favorites.detail(id) });
    },
  });
}

/**
 * Remove favorite by rental object ID
 */
export function useRemoveFavoriteByObjectId() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rentalObjectId: string) =>
      favoritesService.removeByObjectId(rentalObjectId),
    onSuccess: (_, rentalObjectId) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.lists() });
      
      // Invalidate count
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.count() });
      
      // Update isFavorited cache
      queryClient.setQueryData(
        queryKeys.favorites.isFavorited(rentalObjectId),
        { isFavorited: false }
      );
    },
  });
}

/**
 * Toggle favorite (optimistic update)
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rentalObjectId: string) => favoritesService.toggle(rentalObjectId),
    onMutate: async (rentalObjectId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.favorites.isFavorited(rentalObjectId),
      });

      // Get current state
      const previous = queryClient.getQueryData(
        queryKeys.favorites.isFavorited(rentalObjectId)
      );

      // Optimistically toggle
      queryClient.setQueryData(
        queryKeys.favorites.isFavorited(rentalObjectId),
        (old: { isFavorited?: boolean } | undefined) => ({ isFavorited: !old?.isFavorited })
      );

      return { previous };
    },
    onError: (err, rentalObjectId, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.favorites.isFavorited(rentalObjectId),
          context.previous
        );
      }
    },
    onSettled: (_, __, rentalObjectId) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({
        queryKey: queryKeys.favorites.isFavorited(rentalObjectId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.count() });
    },
  });
}

/**
 * Bulk add favorites
 */
export function useBulkAddFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkAddFavoritesDTO) => favoritesService.bulkAdd(data),
    onSuccess: () => {
      // Invalidate all favorites queries
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
    },
  });
}

/**
 * Bulk remove favorites
 */
export function useBulkRemoveFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkRemoveFavoritesDTO) => favoritesService.bulkRemove(data),
    onSuccess: () => {
      // Invalidate all favorites queries
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
    },
  });
}

// ====================================================================
// HELPER HOOKS
// ====================================================================

/**
 * Get favorited rental object IDs (for highlighting in lists)
 */
export function useFavoritedIds() {
  const { data } = useFavorites();
  
  return {
    favoritedIds: data?.data.map((f) => f.rentalObjectId) || [],
    isLoading: !data,
  };
}

/**
 * Check multiple objects at once
 */
export function useAreFavorited(rentalObjectIds: string[]) {
  const { favoritedIds } = useFavoritedIds();
  
  return rentalObjectIds.map((id) => ({
    rentalObjectId: id,
    isFavorited: favoritedIds.includes(id),
  }));
}
