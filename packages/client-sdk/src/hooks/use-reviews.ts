/**
 * Review Hooks
 * Single Responsibility: React Query hooks for reviews
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { reviewService } from '../services/review.service';
import type {
  ReviewQueryParams,
  CreateReviewDTO,
  UpdateReviewDTO,
  ModerateReviewDTO,
} from '../types/review';

// ============================================================================
// Review Query Hooks
// ============================================================================

/**
 * Get paginated reviews
 */
export function useReviews(params?: ReviewQueryParams) {
  return useQuery({
    queryKey: queryKeys.reviews.list(params),
    queryFn: () => reviewService.getAll(params),
  });
}

/**
 * Get single review by ID
 */
export function useReview(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.reviews.detail(id),
    queryFn: () => reviewService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Get reviews for a specific listing
 */
export function useListingReviews(
  listingId: string,
  params?: Omit<ReviewQueryParams, 'listingId'>,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.reviews.byListing(listingId, params),
    queryFn: () => reviewService.getByListingId(listingId, params),
    enabled: !!listingId && (options?.enabled ?? true),
  });
}

/**
 * Get review statistics for a listing
 */
export function useReviewStats(listingId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.reviews.stats(listingId),
    queryFn: () => reviewService.getStats(listingId),
    enabled: !!listingId && (options?.enabled ?? true),
  });
}

/**
 * Get review summary for a listing (stats + recent reviews)
 */
export function useReviewSummary(listingId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...queryKeys.reviews.all, 'summary', listingId] as const,
    queryFn: () => reviewService.getSummary(listingId),
    enabled: !!listingId && (options?.enabled ?? true),
  });
}

/**
 * Get current user's reviews
 */
export function useMyReviews(params?: ReviewQueryParams) {
  return useQuery({
    queryKey: [...queryKeys.reviews.all, 'my', params] as const,
    queryFn: () => reviewService.getMyReviews(params),
  });
}

// ============================================================================
// Review Mutation Hooks
// ============================================================================

/**
 * Create review mutation
 */
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewDTO) => reviewService.create(data),
    onSuccess: (_, variables) => {
      // Invalidate all review lists
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.lists() });
      // Invalidate my reviews
      queryClient.invalidateQueries({ queryKey: [...queryKeys.reviews.all, 'my'] });
      // Invalidate specific listing's reviews and stats
      if (variables.listingId) {
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.reviews.all, 'byListing', variables.listingId],
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.reviews.stats(variables.listingId),
        });
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.reviews.all, 'summary', variables.listingId],
        });
      }
    },
  });
}

/**
 * Update review mutation
 */
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReviewDTO }) =>
      reviewService.update(id, data),
    onSuccess: (response, { id }) => {
      // Invalidate specific review detail
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.detail(id) });
      // Invalidate all review lists
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.lists() });
      // Invalidate my reviews
      queryClient.invalidateQueries({ queryKey: [...queryKeys.reviews.all, 'my'] });
      // Invalidate listing reviews and stats if we have the listingId
      if (response.data?.listingId) {
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.reviews.all, 'byListing', response.data.listingId],
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.reviews.stats(response.data.listingId),
        });
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.reviews.all, 'summary', response.data.listingId],
        });
      }
    },
  });
}

/**
 * Delete review mutation
 */
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewService.delete(id),
    onSuccess: () => {
      // Invalidate all review-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
    },
  });
}

/**
 * Moderate review mutation (approve or reject)
 */
export function useModerateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ModerateReviewDTO }) =>
      reviewService.moderate(id, data),
    onSuccess: (response, { id }) => {
      // Invalidate specific review detail
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.detail(id) });
      // Invalidate all review lists
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.lists() });
      // Invalidate listing reviews and stats if we have the listingId
      if (response.data?.listingId) {
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.reviews.all, 'byListing', response.data.listingId],
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.reviews.stats(response.data.listingId),
        });
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.reviews.all, 'summary', response.data.listingId],
        });
      }
    },
  });
}

/**
 * Approve review mutation (convenience method)
 */
export function useApproveReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, moderatorNotes }: { id: string; moderatorNotes?: string }) =>
      reviewService.approve(id, moderatorNotes),
    onSuccess: (response, { id }) => {
      // Invalidate specific review detail
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.detail(id) });
      // Invalidate all review lists
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.lists() });
      // Invalidate listing reviews and stats if we have the listingId
      if (response.data?.listingId) {
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.reviews.all, 'byListing', response.data.listingId],
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.reviews.stats(response.data.listingId),
        });
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.reviews.all, 'summary', response.data.listingId],
        });
      }
    },
  });
}

/**
 * Reject review mutation (convenience method)
 */
export function useRejectReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, moderatorNotes }: { id: string; moderatorNotes?: string }) =>
      reviewService.reject(id, moderatorNotes),
    onSuccess: (response, { id }) => {
      // Invalidate specific review detail
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.detail(id) });
      // Invalidate all review lists
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.lists() });
      // Invalidate listing reviews and stats if we have the listingId
      if (response.data?.listingId) {
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.reviews.all, 'byListing', response.data.listingId],
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.reviews.stats(response.data.listingId),
        });
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.reviews.all, 'summary', response.data.listingId],
        });
      }
    },
  });
}
