/**
 * Like Service
 * Business logic for like (favorite) domain
 */
import { Injectable, Inject } from '../../core/decorators';
import { LikeRepository } from './like.repository';
import { validate } from '../../core/validation/zod-pipe';
import { NotFoundError, ForbiddenError, UnauthorizedError } from '../../core/errors/problem-details';
import { getAuditService } from '../../core/audit/audit.service';
import {
  CreateLikeSchema,
  LikeQuerySchema,
  type CreateLikeDTO,
  type LikeQueryParams,
  type Like,
  type LikeCheckResponse,
  type LikedListingProjection,
} from '../../schemas/like.schema';
import type { PaginatedResult } from '../../database/base.repository';

@Injectable()
export class LikeService {
  constructor(
    @Inject('LikeRepository') private readonly repository: LikeRepository,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Like a listing (add to favorites)
   * Returns the created like or existing like if already liked
   */
  async like(tenantId: string, userId: string, data: CreateLikeDTO): Promise<Like> {
    // Require authenticated user
    if (!userId || userId === 'anonymous') {
      throw new UnauthorizedError('Authentication required to like listings');
    }

    const validated = validate(CreateLikeSchema, data);

    // Create the like (repository handles unique constraint)
    const like = await this.repository.createWithUniqueConstraint({
      tenantId,
      userId,
      listingId: validated.listingId,
    });

    this.adapters?.log?.info('Listing liked', {
      likeId: like.id,
      listingId: like.listingId,
      userId,
      tenantId,
    });

    // Audit log - FAVORITE_ADDED event
    getAuditService().log({
      tenantId,
      userId,
      action: 'favorite_added',
      resource: 'like',
      resourceId: like.id,
      metadata: { listingId: like.listingId },
    });

    return like;
  }

  /**
   * Unlike a listing (remove from favorites)
   */
  async unlike(tenantId: string, userId: string, listingId: string): Promise<void> {
    // Require authenticated user
    if (!userId || userId === 'anonymous') {
      throw new UnauthorizedError('Authentication required to unlike listings');
    }

    const deleted = await this.repository.deleteByUserAndListing(tenantId, userId, listingId);

    if (!deleted) {
      throw new NotFoundError('Like not found for this listing');
    }

    this.adapters?.log?.info('Listing unliked', {
      listingId,
      userId,
      tenantId,
    });

    // Audit log - FAVORITE_REMOVED event
    getAuditService().log({
      tenantId,
      userId,
      action: 'favorite_removed',
      resource: 'like',
      resourceId: listingId,
      metadata: { listingId },
    });
  }

  /**
   * Get user's liked listings with pagination
   */
  async findByUser(
    tenantId: string,
    userId: string,
    params: LikeQueryParams = {}
  ): Promise<PaginatedResult<LikedListingProjection>> {
    // Require authenticated user
    if (!userId || userId === 'anonymous') {
      throw new UnauthorizedError('Authentication required to view likes');
    }

    const validated = validate(LikeQuerySchema, params);
    return this.repository.findByUser(tenantId, userId, {
      page: validated.page ?? 1,
      limit: validated.limit ?? 20,
    });
  }

  /**
   * Check if a listing is liked by user
   */
  async isLiked(tenantId: string, userId: string, listingId: string): Promise<LikeCheckResponse> {
    // Anonymous users cannot have likes
    if (!userId || userId === 'anonymous') {
      return { isLiked: false };
    }

    const existingLike = await this.repository.findByUserAndListing(tenantId, userId, listingId);
    return { isLiked: existingLike !== null };
  }

  /**
   * Get like count for a listing
   */
  async getLikeCount(tenantId: string, listingId: string): Promise<number> {
    return this.repository.countByListing(tenantId, listingId);
  }

  /**
   * Bulk check which listings are liked by user
   * Returns array of listingIds that are liked
   */
  async getLikedListingIds(
    tenantId: string,
    userId: string,
    listingIds: string[]
  ): Promise<string[]> {
    // Anonymous users cannot have likes
    if (!userId || userId === 'anonymous') {
      return [];
    }

    return this.repository.getLikedListingIds(tenantId, userId, listingIds);
  }

  /**
   * Get all likes for a listing (admin/analytics)
   */
  async findByListing(
    tenantId: string,
    listingId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<PaginatedResult<Like>> {
    return this.repository.findByListing(tenantId, listingId, params);
  }

  /**
   * Toggle like state (like if not liked, unlike if liked)
   * Returns the new like state
   */
  async toggle(
    tenantId: string,
    userId: string,
    listingId: string
  ): Promise<{ isLiked: boolean; like?: Like }> {
    // Require authenticated user
    if (!userId || userId === 'anonymous') {
      throw new UnauthorizedError('Authentication required to toggle like');
    }

    const existingLike = await this.repository.findByUserAndListing(tenantId, userId, listingId);

    if (existingLike) {
      // Unlike
      await this.unlike(tenantId, userId, listingId);
      return { isLiked: false };
    } else {
      // Like
      const like = await this.like(tenantId, userId, { listingId });
      return { isLiked: true, like };
    }
  }
}
