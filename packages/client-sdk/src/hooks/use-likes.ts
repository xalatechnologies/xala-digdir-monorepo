/**
 * Like Hooks
 * Single Responsibility: React Query hooks for likes (favorites)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { likeService } from '../services/like.service';
import type { LikeQueryParams } from '../types/additional';

// ============================================================================
// Like Query Hooks
// ============================================================================

/**
 * Get current user's liked listings
 */
export function useMyLikes(params?: LikeQueryParams) {
  return useQuery({
    queryKey: queryKeys.likes.myList(params),
    queryFn: () => likeService.getMyLikes(params),
  });
}

/**
 * Check if a listing is liked by the current user
 */
export function useIsLiked(listingId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.likes.check(listingId),
    queryFn: () => likeService.isLiked(listingId),
    enabled: !!listingId && (options?.enabled ?? true),
  });
}

/**
 * Get like count for a listing
 */
export function useLikeCount(listingId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.likes.byListing(listingId),
    queryFn: () => likeService.getLikeCount(listingId),
    enabled: !!listingId && (options?.enabled ?? true),
  });
}

// ============================================================================
// Like Mutation Hooks
// ============================================================================

/**
 * Like a listing mutation
 */
export function useLikeListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => likeService.like(listingId),
    onSuccess: (_, listingId) => {
      // Invalidate my likes list
      queryClient.invalidateQueries({ queryKey: queryKeys.likes.myLists() });
      // Invalidate the specific listing's like check
      queryClient.invalidateQueries({ queryKey: queryKeys.likes.check(listingId) });
      // Invalidate the specific listing's like count
      queryClient.invalidateQueries({ queryKey: queryKeys.likes.byListing(listingId) });
    },
  });
}

/**
 * Unlike a listing mutation
 */
export function useUnlikeListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => likeService.unlike(listingId),
    onSuccess: (_, listingId) => {
      // Invalidate my likes list
      queryClient.invalidateQueries({ queryKey: queryKeys.likes.myLists() });
      // Invalidate the specific listing's like check
      queryClient.invalidateQueries({ queryKey: queryKeys.likes.check(listingId) });
      // Invalidate the specific listing's like count
      queryClient.invalidateQueries({ queryKey: queryKeys.likes.byListing(listingId) });
    },
  });
}
