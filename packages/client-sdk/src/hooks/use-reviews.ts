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
 * Get reviews for a specific rental object
 */
export function useRentalObjectReviews(
  rentalObjectId: string,
  params?: Omit<ReviewQueryParams, 'rentalObjectId'>,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.reviews.byRentalObject(rentalObjectId, params),
    queryFn: () => reviewService.getByRentalObjectId(rentalObjectId, params),
    enabled: !!rentalObjectId && (options?.enabled ?? true),
  });
}

/**
 * @deprecated Use useRentalObjectReviews instead
 */
export const useListingReviews = useRentalObjectReviews;

/**
 * Get review statistics for a rental object
 */
export function useReviewStats(rentalObjectId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.reviews.stats(rentalObjectId),
    queryFn: () => reviewService.getStats(rentalObjectId),
    enabled: !!rentalObjectId && (options?.enabled ?? true),
  });
}

/**
 * Get review summary for a rental object (stats + recent reviews)
 */
export function useReviewSummary(rentalObjectId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...queryKeys.reviews.all, 'summary', rentalObjectId] as const,
    queryFn: () => reviewService.getSummary(rentalObjectId),
    enabled: !!rentalObjectId && (options?.enabled ?? true),
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
      // Invalidate specific rental object's reviews and stats
      if (variables.rentalObjectId) {
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.reviews.all, 'byRentalObject', variables.rentalObjectId],
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.reviews.stats(variables.rentalObjectId),
        });
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.reviews.all, 'summary', variables.rentalObjectId],
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
      // Invalidate rental object reviews and stats if we have the rentalObjectId
      if (response.data?.rentalObjectId) {
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.reviews.all, 'byRentalObject', response.data.rentalObjectId],
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.reviews.stats(response.data.rentalObjectId),
        });
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.reviews.all, 'summary', response.data.rentalObjectId],
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
    mutationFn: (id: string) => reviewService.deleteById(id),
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
      // Invalidate rental object reviews and stats if we have the rentalObjectId
      if (response.data?.rentalObjectId) {
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.reviews.all, 'byRentalObject', response.data.rentalObjectId],
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.reviews.stats(response.data.rentalObjectId),
        });
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.reviews.all, 'summary', response.data.rentalObjectId],
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
      // Invalidate rental object reviews and stats if we have the rentalObjectId
      if (response.data?.rentalObjectId) {
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.reviews.all, 'byRentalObject', response.data.rentalObjectId],
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.reviews.stats(response.data.rentalObjectId),
        });
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.reviews.all, 'summary', response.data.rentalObjectId],
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
      // Invalidate rental object reviews and stats if we have the rentalObjectId
      if (response.data?.rentalObjectId) {
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.reviews.all, 'byRentalObject', response.data.rentalObjectId],
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.reviews.stats(response.data.rentalObjectId),
        });
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.reviews.all, 'summary', response.data.rentalObjectId],
        });
      }
    },
  });
}
