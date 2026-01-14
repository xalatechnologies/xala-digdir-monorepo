/**
 * Review Types
 * Single Responsibility: All review-related type definitions
 */

import type { TenantEntity, BaseQueryParams } from './enums';

// =============================================================================
// Review Enums
// =============================================================================

export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type ReviewModerationAction = 'approve' | 'reject';

// =============================================================================
// Review Entity
// =============================================================================

export interface ReviewMetadata {
  helpfulCount?: number;
  flaggedCount?: number;
  moderatorNotes?: string;
  moderatedBy?: string;
  moderatedAt?: string;
}

export interface Review extends TenantEntity {
  listingId: string;
  bookingId: string;
  userId: string;
  rating: number; // 1-5 stars
  comment?: string;
  status: ReviewStatus;
  metadata?: ReviewMetadata;
  // Display/denormalized fields (populated by backend)
  listingName?: string;
  userName?: string;
  userEmail?: string;
}

// =============================================================================
// Review DTOs
// =============================================================================

export interface CreateReviewDTO {
  listingId: string;
  bookingId: string;
  rating: number; // 1-5
  comment?: string;
}

export interface UpdateReviewDTO {
  rating?: number; // 1-5
  comment?: string;
}

export interface ModerateReviewDTO {
  action: ReviewModerationAction;
  moderatorNotes?: string;
}

export interface ReviewQueryParams extends BaseQueryParams {
  status?: ReviewStatus;
  listingId?: string;
  userId?: string;
  bookingId?: string;
  minRating?: number;
  maxRating?: number;
}

// =============================================================================
// Review Statistics
// =============================================================================

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  approvedReviews?: number;
  pendingReviews?: number;
  rejectedReviews?: number;
}

export interface ReviewSummary {
  listingId: string;
  listingName?: string;
  stats: ReviewStats;
  recentReviews?: Review[];
}
