import { BaseService } from './base.service';
import type {
  FavoriteDetail,
  FavoritesListResponse,
  CreateFavoriteDTO,
  UpdateFavoriteDTO,
  ListFavoritesQuery,
  IsFavoritedResponse,
  BulkAddFavoritesDTO,
  BulkRemoveFavoritesDTO,
  BulkFavoritesResponse,
} from '../types/favorites.types';

/**
 * Favorites Service
 * 
 * Client SDK for favorites/wishlist operations
 */
export class FavoritesService extends BaseService {
  /**
   * List current user's favorites
   */
  async list(query?: Partial<ListFavoritesQuery>): Promise<FavoritesListResponse> {
    return this.get('/me/favorites', { params: query });
  }

  /**
   * Get single favorite by ID
   */
  async getById(id: string): Promise<FavoriteDetail> {
    return this.get(`/me/favorites/${id}`);
  }

  /**
   * Add rental object to favorites
   */
  async add(data: CreateFavoriteDTO): Promise<FavoriteDetail> {
    return this.post('/me/favorites', data);
  }

  /**
   * Update favorite (notes, tags)
   */
  async update(id: string, data: UpdateFavoriteDTO): Promise<FavoriteDetail> {
    return this.patch(`/me/favorites/${id}`, data);
  }

  /**
   * Remove favorite by ID
   */
  async remove(id: string): Promise<void> {
    return this.delete(`/me/favorites/${id}`);
  }

  /**
   * Remove favorite by rental object ID
   */
  async removeByObjectId(rentalObjectId: string): Promise<void> {
    return this.delete(`/me/favorites/by-object/${rentalObjectId}`);
  }

  /**
   * Check if rental object is favorited
   */
  async checkIsFavorited(rentalObjectId: string): Promise<IsFavoritedResponse> {
    return this.get(`/rental-objects/${rentalObjectId}/is-favorited`);
  }

  /**
   * Get total favorite count
   */
  async getCount(): Promise<{ count: number }> {
    return this.get('/me/favorites/count');
  }

  /**
   * Bulk add favorites
   */
  async bulkAdd(data: BulkAddFavoritesDTO): Promise<BulkFavoritesResponse> {
    return this.post('/me/favorites/bulk', data);
  }

  /**
   * Bulk remove favorites
   */
  async bulkRemove(data: BulkRemoveFavoritesDTO): Promise<BulkFavoritesResponse> {
    return this.delete('/me/favorites/bulk', { data });
  }

  /**
   * Toggle favorite (add if not favorited, remove if favorited)
   */
  async toggle(rentalObjectId: string): Promise<{ isFavorited: boolean }> {
    const { isFavorited, favoriteId } = await this.checkIsFavorited(rentalObjectId);

    if (isFavorited && favoriteId) {
      await this.remove(favoriteId);
      return { isFavorited: false };
    } else {
      await this.add({ rentalObjectId });
      return { isFavorited: true };
    }
  }
}

// Export singleton instance
export const favoritesService = new FavoritesService();
