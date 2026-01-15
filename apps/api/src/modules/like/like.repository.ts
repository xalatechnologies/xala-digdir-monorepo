/**
 * Like Repository
 * Data access layer for like (favorite) entities
 */
import { Injectable } from '../../core/decorators';
import { BaseRepository, type PaginatedResult, type FilterCondition } from '../../database/base.repository';
import { likes, listings, type Like, type NewLike } from '../../database/schema';
import type { LikeQueryParams, LikedListingProjection } from '../../schemas/like.schema';
import { eq, and, desc } from 'drizzle-orm';
import { ConflictError } from '../../core/errors/problem-details';

@Injectable()
export class LikeRepository extends BaseRepository<
  typeof likes,
  Like,
  NewLike,
  Partial<NewLike>,
  string
> {
  constructor(db: any) {
    super(db, likes, likes.id);
  }

  /**
   * Find likes by user with listing details and pagination
   * Returns liked listings with projection data for display
   */
  async findByUser(
    tenantId: string,
    userId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<PaginatedResult<LikedListingProjection>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = (page - 1) * limit;

    // Get total count for user's likes
    const countResult = await this.db
      .select({ count: likes.id })
      .from(likes)
      .where(and(eq(likes.tenantId, tenantId), eq(likes.userId, userId)));
    const total = countResult.length;

    // Get paginated data with listing JOIN
    const data = await this.db
      .select({
        id: likes.id,
        listingId: likes.listingId,
        listingTitle: listings.name,
        listingSlug: listings.slug,
        listingImageUrl: listings.images,
        likedAt: likes.createdAt,
      })
      .from(likes)
      .leftJoin(listings, eq(likes.listingId, listings.id))
      .where(and(eq(likes.tenantId, tenantId), eq(likes.userId, userId)))
      .orderBy(desc(likes.createdAt))
      .limit(limit)
      .offset(offset);

    // Transform images array to get first image URL
    const transformedData: LikedListingProjection[] = data.map((item) => ({
      id: item.id,
      listingId: item.listingId,
      listingTitle: item.listingTitle ?? '',
      listingSlug: item.listingSlug ?? '',
      listingImageUrl: Array.isArray(item.listingImageUrl) && item.listingImageUrl.length > 0
        ? (item.listingImageUrl[0] as string)
        : null,
      likedAt: item.likedAt,
    }));

    return {
      data: transformedData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Find all likes for a specific listing
   * Used for like counts and analytics
   */
  async findByListing(
    tenantId: string,
    listingId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<PaginatedResult<Like>> {
    const conditions: FilterCondition[] = [
      { field: 'tenantId', operator: 'eq', value: tenantId },
      { field: 'listingId', operator: 'eq', value: listingId },
    ];

    return this.findMany(conditions, {
      page: params.page,
      limit: params.limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }

  /**
   * Check if a user has liked a specific listing
   */
  async findByUserAndListing(
    tenantId: string,
    userId: string,
    listingId: string
  ): Promise<Like | null> {
    const result = await this.db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.tenantId, tenantId),
          eq(likes.userId, userId),
          eq(likes.listingId, listingId)
        )
      )
      .limit(1);

    return result[0] ?? null;
  }

  /**
   * Create a like with unique constraint handling
   * Returns existing like if already exists (idempotent)
   */
  async createWithUniqueConstraint(data: NewLike): Promise<Like> {
    try {
      return await this.create(data);
    } catch (error: unknown) {
      // Check for unique constraint violation
      if (
        error instanceof Error &&
        (error.message.includes('unique') ||
          error.message.includes('duplicate') ||
          error.message.includes('23505'))
      ) {
        // Return existing like instead of throwing
        const existingLike = await this.findByUserAndListing(
          data.tenantId,
          data.userId,
          data.listingId
        );
        if (existingLike) {
          throw new ConflictError('Like already exists for this listing');
        }
      }
      throw error;
    }
  }

  /**
   * Delete a like by user and listing
   * Returns true if deleted, false if not found
   */
  async deleteByUserAndListing(
    tenantId: string,
    userId: string,
    listingId: string
  ): Promise<boolean> {
    const result = await this.db
      .delete(likes)
      .where(
        and(
          eq(likes.tenantId, tenantId),
          eq(likes.userId, userId),
          eq(likes.listingId, listingId)
        )
      )
      .returning();

    return result.length > 0;
  }

  /**
   * Count likes for a specific listing
   */
  async countByListing(tenantId: string, listingId: string): Promise<number> {
    return this.count([
      { field: 'tenantId', operator: 'eq', value: tenantId },
      { field: 'listingId', operator: 'eq', value: listingId },
    ]);
  }

  /**
   * Count likes by a specific user
   */
  async countByUser(tenantId: string, userId: string): Promise<number> {
    return this.count([
      { field: 'tenantId', operator: 'eq', value: tenantId },
      { field: 'userId', operator: 'eq', value: userId },
    ]);
  }

  /**
   * Get listing IDs that a user has liked
   * Useful for bulk checking like status
   */
  async getLikedListingIds(
    tenantId: string,
    userId: string,
    listingIds: string[]
  ): Promise<string[]> {
    if (listingIds.length === 0) return [];

    const result = await this.db
      .select({ listingId: likes.listingId })
      .from(likes)
      .where(
        and(
          eq(likes.tenantId, tenantId),
          eq(likes.userId, userId)
        )
      );

    const likedIds = new Set(result.map((r: { listingId: string }) => r.listingId));
    return listingIds.filter((id) => likedIds.has(id));
  }

  protected getEntityName(): string {
    return 'Like';
  }
}
