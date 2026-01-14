/**
 * Review Transformers
 *
 * Reusable transformation utilities for review data.
 * Used by web, backoffice, and minside apps.
 */

import type { Review, ReviewStatus, ReviewStats, ReviewSummary } from '../types';

// =============================================================================
// UI Types for Transformed Reviews
// =============================================================================

export interface TransformedReview {
  // Core
  id: string;
  tenantId: string;
  listingId: string;
  listingName?: string;
  bookingId: string;
  userId: string;
  userName?: string;
  userEmail?: string;

  // Rating
  rating: number;
  ratingLabel: string;
  ratingStars: string;
  comment?: string;

  // Status
  status: ReviewStatus;
  statusLabel: string;
  statusColor: 'success' | 'warning' | 'danger' | 'neutral';
  isPending: boolean;
  isApproved: boolean;
  isRejected: boolean;

  // Moderation
  helpfulCount: number;
  flaggedCount: number;
  moderatorNotes?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  moderatedAtFormatted?: string;

  // Timestamps
  createdAt: string;
  createdAtFormatted: string;
  updatedAt: string;
}

export interface TransformedReviewStats {
  averageRating: number;
  averageRatingFormatted: string;
  totalReviews: number;
  ratingDistribution: {
    1: { count: number; percentage: number };
    2: { count: number; percentage: number };
    3: { count: number; percentage: number };
    4: { count: number; percentage: number };
    5: { count: number; percentage: number };
  };
  approvedReviews?: number;
  pendingReviews?: number;
  rejectedReviews?: number;
  ratingBreakdown: string;
}

export interface TransformedReviewSummary {
  listingId: string;
  listingName?: string;
  stats: TransformedReviewStats;
  recentReviews: TransformedReview[];
}

// =============================================================================
// Transform Utilities
// =============================================================================

const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: 'Venter på godkjenning',
  approved: 'Godkjent',
  rejected: 'Avvist',
};

const REVIEW_STATUS_COLORS: Record<ReviewStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

const RATING_LABELS: Record<number, string> = {
  1: 'Veldig dårlig',
  2: 'Dårlig',
  3: 'Middels',
  4: 'Bra',
  5: 'Utmerket',
};

/**
 * Get display label for review status
 */
export function getReviewStatusLabel(status: ReviewStatus): string {
  return REVIEW_STATUS_LABELS[status] || status;
}

/**
 * Get color for review status
 */
export function getReviewStatusColor(status: ReviewStatus): 'success' | 'warning' | 'danger' | 'neutral' {
  return REVIEW_STATUS_COLORS[status] || 'neutral';
}

/**
 * Get display label for rating
 */
export function getRatingLabel(rating: number): string {
  return RATING_LABELS[rating] || `${rating} stjerner`;
}

/**
 * Generate star representation of rating
 */
export function getRatingStars(rating: number): string {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
}

/**
 * Format date to Norwegian format
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format rating to one decimal place
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

// =============================================================================
// Main Transform Functions
// =============================================================================

/**
 * Transform a raw API review to a UI-friendly format
 */
export function transformReview(review: Review): TransformedReview {
  const metadata = review.metadata || {};

  return {
    // Core
    id: review.id,
    tenantId: review.tenantId,
    listingId: review.listingId,
    listingName: review.listingName,
    bookingId: review.bookingId,
    userId: review.userId,
    userName: review.userName,
    userEmail: review.userEmail,

    // Rating
    rating: review.rating,
    ratingLabel: getRatingLabel(review.rating),
    ratingStars: getRatingStars(review.rating),
    comment: review.comment,

    // Status
    status: review.status,
    statusLabel: getReviewStatusLabel(review.status),
    statusColor: getReviewStatusColor(review.status),
    isPending: review.status === 'pending',
    isApproved: review.status === 'approved',
    isRejected: review.status === 'rejected',

    // Moderation
    helpfulCount: metadata.helpfulCount || 0,
    flaggedCount: metadata.flaggedCount || 0,
    moderatorNotes: metadata.moderatorNotes,
    moderatedBy: metadata.moderatedBy,
    moderatedAt: metadata.moderatedAt,
    moderatedAtFormatted: metadata.moderatedAt ? formatDate(metadata.moderatedAt) : undefined,

    // Timestamps
    createdAt: review.createdAt,
    createdAtFormatted: formatDate(review.createdAt),
    updatedAt: review.updatedAt,
  };
}

/**
 * Transform multiple reviews
 */
export function transformReviews(reviews: Review[]): TransformedReview[] {
  return reviews.map(transformReview);
}

/**
 * Transform review stats to UI-friendly format
 */
export function transformReviewStats(stats: ReviewStats): TransformedReviewStats {
  const totalReviews = stats.totalReviews;

  // Calculate percentages for each rating
  const ratingDistribution = {
    1: { count: stats.ratingDistribution[1], percentage: (stats.ratingDistribution[1] / totalReviews) * 100 },
    2: { count: stats.ratingDistribution[2], percentage: (stats.ratingDistribution[2] / totalReviews) * 100 },
    3: { count: stats.ratingDistribution[3], percentage: (stats.ratingDistribution[3] / totalReviews) * 100 },
    4: { count: stats.ratingDistribution[4], percentage: (stats.ratingDistribution[4] / totalReviews) * 100 },
    5: { count: stats.ratingDistribution[5], percentage: (stats.ratingDistribution[5] / totalReviews) * 100 },
  };

  // Create rating breakdown string
  const breakdown: string[] = [];
  for (let i = 5; i >= 1; i--) {
    const count = stats.ratingDistribution[i as keyof typeof stats.ratingDistribution];
    if (count > 0) {
      breakdown.push(`${i}★: ${count}`);
    }
  }

  return {
    averageRating: stats.averageRating,
    averageRatingFormatted: formatRating(stats.averageRating),
    totalReviews,
    ratingDistribution,
    approvedReviews: stats.approvedReviews,
    pendingReviews: stats.pendingReviews,
    rejectedReviews: stats.rejectedReviews,
    ratingBreakdown: breakdown.join(' | '),
  };
}

/**
 * Transform review summary to UI-friendly format
 */
export function transformReviewSummary(summary: ReviewSummary): TransformedReviewSummary {
  return {
    listingId: summary.listingId,
    listingName: summary.listingName,
    stats: transformReviewStats(summary.stats),
    recentReviews: summary.recentReviews ? transformReviews(summary.recentReviews) : [],
  };
}
