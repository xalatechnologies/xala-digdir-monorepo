/**
 * Share Service
 * Single Responsibility: Handle all share link-related API operations
 */

import { BaseService } from './base.service';
import type {
  ShareLink,
  CreateShareLinkDTO,
} from '../types/additional';
import type { PaginatedResponse, SingleResponse, SuccessResponse, BaseQueryParams } from '../types/enums';

/**
 * Query parameters for share link listing
 */
export interface ShareQueryParams extends BaseQueryParams {
  type?: 'listing' | 'booking';
  resourceId?: string;
  status?: 'active' | 'expired' | 'revoked';
}

/**
 * Response when retrieving a share link by token
 */
export interface ShareLinkResponse {
  token: string;
  type: 'listing' | 'booking';
  resourceId: string;
  url: string;
  viewCount: number;
  expiresAt: string;
  createdAt: string;
  createdBy?: string;
  status: 'active' | 'expired' | 'revoked';
}

export class ShareService extends BaseService {
  constructor() {
    super('/api/shares');
  }

  /**
   * Create a new share link
   */
  async create(data: CreateShareLinkDTO): Promise<SingleResponse<ShareLink>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Get share link by token (also increments view count)
   */
  async getByToken(token: string): Promise<SingleResponse<ShareLinkResponse>> {
    return this.client.get(this.buildPath(`/${token}`));
  }

  /**
   * Revoke (delete) a share link
   */
  async revoke(token: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/${token}`));
  }

  /**
   * Get current user's share links
   */
  async getMyShares(params?: ShareQueryParams): Promise<PaginatedResponse<ShareLink>> {
    return this.client.get(this.buildPath('/me'), {
      params: params as Record<string, string | number | boolean>
    });
  }

  /**
   * Validate a share link without incrementing view count
   */
  async validate(token: string): Promise<SingleResponse<{ valid: boolean; shareLink?: ShareLinkResponse }>> {
    return this.client.get(this.buildPath(`/${token}/validate`));
  }

  /**
   * Get share links for a specific resource (listing or booking)
   */
  async getByResource(
    type: 'listing' | 'booking',
    resourceId: string,
    params?: ShareQueryParams
  ): Promise<PaginatedResponse<ShareLink>> {
    return this.client.get(this.buildPath(`/resource/${type}/${resourceId}`), {
      params: params as Record<string, string | number | boolean>
    });
  }
}

// Export singleton instance
export const shareService = new ShareService();
