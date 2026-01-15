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
   */
  async getAll(params?: ReviewQueryParams): Promise<PaginatedResponse<Review>> {
    return this.client.get(this.buildPath(), { params: params as Record<string, string | number | boolean> });
  }

  /**
   * Get single review by ID
   */
  async getById(id: string): Promise<SingleResponse<Review>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Create new review
   */
  async create(data: CreateReviewDTO): Promise<SingleResponse<Review>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update existing review
   */
  async update(id: string, data: UpdateReviewDTO): Promise<SingleResponse<Review>> {
    return this.client.put(this.buildPath(`/${id}`), data);
  }

  /**
   * Delete review
   */
  async delete(id: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/${id}`));
  }

  /**
   * Moderate review (approve or reject)
   */
  async moderate(id: string, data: ModerateReviewDTO): Promise<SingleResponse<Review>> {
    return this.client.put(this.buildPath(`/${id}/moderate`), data);
  }

  /**
   * Approve review (convenience method)
   */
  async approve(id: string, moderatorNotes?: string): Promise<SingleResponse<Review>> {
    return this.moderate(id, { action: 'approve', moderatorNotes });
  }

  /**
   * Reject review (convenience method)
   */
  async reject(id: string, moderatorNotes?: string): Promise<SingleResponse<Review>> {
    return this.moderate(id, { action: 'reject', moderatorNotes });
  }

  /**
   * Get reviews for a specific rental object
   */
  async getByRentalObjectId(rentalObjectId: string, params?: ReviewQueryParams): Promise<PaginatedResponse<Review>> {
    return this.client.get(this.buildPath(`/rental-object/${rentalObjectId}`), {
      params: params as Record<string, string | number | boolean>
    });
  }

  /**
   * Get review statistics for a rental object
   */
  async getStats(rentalObjectId: string): Promise<SingleResponse<ReviewStats>> {
    return this.client.get(this.buildPath(`/rental-object/${rentalObjectId}/stats`));
  }

  /**
   * Get review summary for a rental object (stats + recent reviews)
   */
  async getSummary(rentalObjectId: string): Promise<SingleResponse<ReviewSummary>> {
    return this.client.get(this.buildPath(`/rental-object/${rentalObjectId}/summary`));
  }

  // Backward compatibility aliases (deprecated)
  /**
   * @deprecated Use getByRentalObjectId instead
   */
  async getByListingId(listingId: string, params?: ReviewQueryParams): Promise<PaginatedResponse<Review>> {
    return this.getByRentalObjectId(listingId, params);
  }

  /**
   * Get current user's reviews
   */
  async getMyReviews(params?: ReviewQueryParams): Promise<PaginatedResponse<Review>> {
    return this.client.get(this.buildPath('/my'), { params: params as Record<string, string | number | boolean> });
  }
}

// Export singleton instance
export const reviewService = new ReviewService();
