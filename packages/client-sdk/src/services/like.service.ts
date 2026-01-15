/**
 * Like Service
 * Single Responsibility: Handle all like/favorite-related API operations
 */

import { BaseService } from './base.service';
import type {
  Like,
  CreateLikeDTO,
  LikeQueryParams,
  LikedListing,
} from '../types/additional';
import type { PaginatedResponse, SingleResponse, SuccessResponse } from '../types/enums';

export interface IsLikedResponse {
  isLiked: boolean;
}

export class LikeService extends BaseService {
  constructor() {
    super('/api/likes');
  }

  /**
   * Like a listing (add to favorites)
   */
  async like(listingId: string): Promise<SingleResponse<Like>> {
    const data: CreateLikeDTO = { listingId };
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Unlike a listing (remove from favorites)
   */
  async unlike(listingId: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/${listingId}`));
  }

  /**
   * Get current user's liked listings
   */
  async getMyLikes(params?: LikeQueryParams): Promise<PaginatedResponse<LikedListing>> {
    return this.client.get(this.buildPath('/me'), {
      params: params as Record<string, string | number | boolean>
    });
  }

  /**
   * Check if a listing is liked by the current user
   */
  async isLiked(listingId: string): Promise<IsLikedResponse> {
    return this.client.get(this.buildPath(`/check/${listingId}`));
  }

  /**
   * Get like count for a listing
   */
  async getLikeCount(listingId: string): Promise<{ count: number }> {
    return this.client.get(this.buildPath(`/listing/${listingId}/count`));
  }
}

// Export singleton instance
export const likeService = new LikeService();
