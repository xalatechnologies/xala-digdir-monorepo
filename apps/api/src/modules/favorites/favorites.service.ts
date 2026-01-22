/**
 * Favorites Service
 * 
 * Business logic for managing user favorites (wishlist)
 * Features:
 * - Add/remove favorites
 * - List with filters and pagination
 * - Check if object is favorited
 * - Bulk operations
 */

import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { favorites, rentalObjects, categories } from '../../database/schema';
import type {
  CreateFavoriteDTO,
  UpdateFavoriteDTO,
  ListFavoritesQuery,
  FavoriteDetail,
  FavoritesListResponse,
  BulkAddFavoritesDTO,
  BulkRemoveFavoritesDTO,
  BulkFavoritesResponse,
} from '@digilist/contracts/schemas';

export class FavoritesService {
  constructor(private readonly db: any) {}

  /**
   * Add rental object to user's favorites
   */
  async addFavorite(
    userId: string,
    tenantId: string,
    data: CreateFavoriteDTO
  ): Promise<FavoriteDetail> {
    // Check if already favorited
    const existing = await this.db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.rentalObjectId, data.rentalObjectId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new Error('ALREADY_FAVORITED');
    }

    // Verify rental object exists and belongs to tenant
    const rentalObject = await this.db
      .select()
      .from(rentalObjects)
      .where(
        and(
          eq(rentalObjects.id, data.rentalObjectId),
          eq(rentalObjects.tenantId, tenantId)
        )
      )
      .limit(1);

    if (rentalObject.length === 0) {
      throw new Error('RENTAL_OBJECT_NOT_FOUND');
    }

    // Create favorite
    const [favorite] = await this.db
      .insert(favorites)
      .values({
        userId,
        tenantId,
        rentalObjectId: data.rentalObjectId,
        notes: data.notes || null,
        tags: data.tags || [],
      })
      .returning();

    // Return with rental object details
    return this.getFavoriteById(favorite.id, userId);
  }

  /**
   * Remove favorite
   */
  async removeFavorite(favoriteId: string, userId: string): Promise<void> {
    const result = await this.db
      .delete(favorites)
      .where(
        and(
          eq(favorites.id, favoriteId),
          eq(favorites.userId, userId)
        )
      )
      .returning();

    if (result.length === 0) {
      throw new Error('FAVORITE_NOT_FOUND');
    }
  }

  /**
   * Remove favorite by rental object ID
   */
  async removeFavoriteByObjectId(
    rentalObjectId: string,
    userId: string
  ): Promise<void> {
    const result = await this.db
      .delete(favorites)
      .where(
        and(
          eq(favorites.rentalObjectId, rentalObjectId),
          eq(favorites.userId, userId)
        )
      )
      .returning();

    if (result.length === 0) {
      throw new Error('FAVORITE_NOT_FOUND');
    }
  }

  /**
   * Update favorite (notes, tags)
   */
  async updateFavorite(
    favoriteId: string,
    userId: string,
    data: UpdateFavoriteDTO
  ): Promise<FavoriteDetail> {
    const [updated] = await this.db
      .update(favorites)
      .set({
        notes: data.notes,
        tags: data.tags,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(favorites.id, favoriteId),
          eq(favorites.userId, userId)
        )
      )
      .returning();

    if (!updated) {
      throw new Error('FAVORITE_NOT_FOUND');
    }

    return this.getFavoriteById(favoriteId, userId);
  }

  /**
   * Get favorite by ID with rental object details
   */
  async getFavoriteById(
    favoriteId: string,
    userId: string
  ): Promise<FavoriteDetail> {
    const result = await this.db
      .select({
        id: favorites.id,
        userId: favorites.userId,
        rentalObjectId: favorites.rentalObjectId,
        tenantId: favorites.tenantId,
        notes: favorites.notes,
        tags: favorites.tags,
        createdAt: favorites.createdAt,
        updatedAt: favorites.updatedAt,
        
        // Rental object details
        rentalObject: {
          id: rentalObjects.id,
          name: rentalObjects.name,
          slug: rentalObjects.slug,
          categoryKey: rentalObjects.categoryKey,
          categoryName: categories.name,
          capacity: rentalObjects.capacity,
          status: rentalObjects.status,
        },
      })
      .from(favorites)
      .innerJoin(rentalObjects, eq(favorites.rentalObjectId, rentalObjects.id))
      .leftJoin(categories, eq(rentalObjects.categoryKey, categories.key))
      .where(
        and(
          eq(favorites.id, favoriteId),
          eq(favorites.userId, userId)
        )
      )
      .limit(1);

    if (result.length === 0) {
      throw new Error('FAVORITE_NOT_FOUND');
    }

    return result[0] as FavoriteDetail;
  }

  /**
   * List user's favorites with filters and pagination
   */
  async listFavorites(
    userId: string,
    tenantId: string,
    query: ListFavoritesQuery
  ): Promise<FavoritesListResponse> {
    const offset = (query.page - 1) * query.limit;

    // Build WHERE conditions
    const conditions = [
      eq(favorites.userId, userId),
      eq(favorites.tenantId, tenantId),
    ];

    if (query.tag) {
      conditions.push(sql`${query.tag} = ANY(${favorites.tags})`);
    }

    if (query.categoryKey) {
      conditions.push(eq(rentalObjects.categoryKey, query.categoryKey));
    }

    // Get total count
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(favorites)
      .innerJoin(rentalObjects, eq(favorites.rentalObjectId, rentalObjects.id))
      .where(and(...conditions));

    // Get data
    const data = await this.db
      .select({
        id: favorites.id,
        userId: favorites.userId,
        rentalObjectId: favorites.rentalObjectId,
        tenantId: favorites.tenantId,
        notes: favorites.notes,
        tags: favorites.tags,
        createdAt: favorites.createdAt,
        updatedAt: favorites.updatedAt,
        
        rentalObject: {
          id: rentalObjects.id,
          name: rentalObjects.name,
          slug: rentalObjects.slug,
          categoryKey: rentalObjects.categoryKey,
          categoryName: categories.name,
          capacity: rentalObjects.capacity,
          status: rentalObjects.status,
        },
      })
      .from(favorites)
      .innerJoin(rentalObjects, eq(favorites.rentalObjectId, rentalObjects.id))
      .leftJoin(categories, eq(rentalObjects.categoryKey, categories.key))
      .where(and(...conditions))
      .orderBy(
        query.sortOrder === 'desc'
          ? desc(favorites.createdAt)
          : favorites.createdAt
      )
      .limit(query.limit)
      .offset(offset);

    return {
      data: data as FavoriteDetail[],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  /**
   * Check if rental object is favorited by user
   */
  async isFavorited(
    rentalObjectId: string,
    userId: string
  ): Promise<{ isFavorited: boolean; favoriteId?: string }> {
    const result = await this.db
      .select({ id: favorites.id })
      .from(favorites)
      .where(
        and(
          eq(favorites.rentalObjectId, rentalObjectId),
          eq(favorites.userId, userId)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return { isFavorited: false };
    }

    return {
      isFavorited: true,
      favoriteId: result[0].id,
    };
  }

  /**
   * Bulk add favorites
   */
  async bulkAddFavorites(
    userId: string,
    tenantId: string,
    data: BulkAddFavoritesDTO
  ): Promise<BulkFavoritesResponse> {
    let success = 0;
    let failed = 0;
    const errors: Array<{ id: string; error: string }> = [];

    for (const rentalObjectId of data.rentalObjectIds) {
      try {
        await this.addFavorite(userId, tenantId, { rentalObjectId });
        success++;
      } catch (error) {
        failed++;
        errors.push({
          id: rentalObjectId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { success, failed, errors: errors.length > 0 ? errors : undefined };
  }

  /**
   * Bulk remove favorites
   */
  async bulkRemoveFavorites(
    userId: string,
    data: BulkRemoveFavoritesDTO
  ): Promise<BulkFavoritesResponse> {
    const result = await this.db
      .delete(favorites)
      .where(
        and(
          inArray(favorites.id, data.favoriteIds),
          eq(favorites.userId, userId)
        )
      )
      .returning();

    return {
      success: result.length,
      failed: data.favoriteIds.length - result.length,
    };
  }

  /**
   * Get favorite count for user
   */
  async getFavoriteCount(userId: string): Promise<number> {
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(favorites)
      .where(eq(favorites.userId, userId));

    return count;
  }
}

// Export factory function for creating service with db
export function createFavoritesService(db: any): FavoritesService {
  return new FavoritesService(db);
}
