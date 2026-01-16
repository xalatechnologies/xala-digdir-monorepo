/**
 * Review Service
 * Single Responsibility: Handle all review-related API operations
 */

import { BaseService } from './base.service';
import type {
  Review,
  ReviewQueryParams,
  CreateReviewDTO,
  UpdateReviewDTO,
  ModerateReviewDTO,
  ReviewStats,
  ReviewSummary,
} from '../types/review';
import type { PaginatedResponse, SingleResponse, SuccessResponse } from '../types/enums';

export class ReviewService extends BaseService {
  constructor() {
    super('/api/reviews');
  }

  /**
   * Get paginated reviews
   * @param params - Optional query parameters for filtering and pagination
   * @returns Promise resolving to paginated list of reviews
   * @example
   * ```ts
   * const reviews = await reviewService.getAll({
   *   page: 1,
   *   limit: 20,
   *   status: 'approved'
   * });
   * ```
   */
  async getAll(params?: ReviewQueryParams): Promise<PaginatedResponse<Review>> {
    return this.client.get(this.buildPath(), { params: params as Record<string, string | number | boolean> });
  }

  /**
   * Get single review by ID
   * @param id - Review ID
   * @returns Promise resolving to review details
   */
  async getById(id: string): Promise<SingleResponse<Review>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Create new review
   * @param data - Review data including rating, comment, and listing ID
   * @returns Promise resolving to created review
   * @example
   * ```ts
   * const review = await reviewService.create({
   *   listingId: 'listing-123',
   *   rating: 5,
   *   comment: 'Excellent facility!'
   * });
   * ```
   */
  async create(data: CreateReviewDTO): Promise<SingleResponse<Review>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update existing review
   * @param id - Review ID
   * @param data - Updated review data
   * @returns Promise resolving to updated review
   */
  async update(id: string, data: UpdateReviewDTO): Promise<SingleResponse<Review>> {
    return this.client.put(this.buildPath(`/${id}`), data);
  }

  /**
   * Delete review
   * @param id - Review ID
   * @returns Promise resolving to success response
   */
  async delete(id: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/${id}`));
  }

  /**
   * Moderate review (approve or reject)
   * @param id - Review ID
   * @param data - Moderation data including action and optional moderator notes
   * @returns Promise resolving to moderated review
   */
  async moderate(id: string, data: ModerateReviewDTO): Promise<SingleResponse<Review>> {
    return this.client.put(this.buildPath(`/${id}/moderate`), data);
  }

  /**
   * Approve review (convenience method)
   * @param id - Review ID
   * @param moderatorNotes - Optional notes from moderator
   * @returns Promise resolving to approved review
   */
  async approve(id: string, moderatorNotes?: string): Promise<SingleResponse<Review>> {
    return this.moderate(id, { action: 'approve', moderatorNotes });
  }

  /**
   * Reject review (convenience method)
   * @param id - Review ID
   * @param moderatorNotes - Optional notes from moderator explaining rejection
   * @returns Promise resolving to rejected review
   */
  async reject(id: string, moderatorNotes?: string): Promise<SingleResponse<Review>> {
    return this.moderate(id, { action: 'reject', moderatorNotes });
  }

  /**
   * Get reviews for a specific rental object
   * @param rentalObjectId - Rental Object ID
   * @param params - Optional query parameters for filtering and pagination
   * @returns Promise resolving to paginated list of reviews for the rental object
   */
  async getByRentalObjectId(rentalObjectId: string, params?: ReviewQueryParams): Promise<PaginatedResponse<Review>> {
    return this.client.get(this.buildPath(`/rental-object/${rentalObjectId}`), {
      params: params as Record<string, string | number | boolean>
    });
  }

  /**
   * Get review statistics for a rental object
   * @param rentalObjectId - Rental Object ID
   * @returns Promise resolving to review statistics (average rating, count, distribution)
   */
  async getStats(rentalObjectId: string): Promise<SingleResponse<ReviewStats>> {
    return this.client.get(this.buildPath(`/rental-object/${rentalObjectId}/stats`));
  }

  /**
   * Get review summary for a rental object (stats + recent reviews)
   * @param rentalObjectId - Rental Object ID
   * @returns Promise resolving to review summary with statistics and recent reviews
   */
  async getSummary(rentalObjectId: string): Promise<SingleResponse<ReviewSummary>> {
    return this.client.get(this.buildPath(`/rental-object/${rentalObjectId}/summary`));
  }

  /**
   * Get current user's reviews
   * @param params - Optional query parameters for filtering and pagination
   * @returns Promise resolving to paginated list of current user's reviews
   */
  async getMyReviews(params?: ReviewQueryParams): Promise<PaginatedResponse<Review>> {
    return this.client.get(this.buildPath('/my'), { params: params as Record<string, string | number | boolean> });
  }
}

// Export singleton instance
export const reviewService = new ReviewService();
