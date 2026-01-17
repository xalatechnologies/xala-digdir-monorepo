/**
 * Favorites Type Definitions
 * 
 * Types for user favorites/wishlist
 */

// ====================================================================
// FAVORITE ENTITY
// ====================================================================

export interface Favorite {
  id: string;
  userId: string;
  rentalObjectId: string;
  tenantId: string;
  
  // Metadata
  notes?: string;
  tags: string[];
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteDetail extends Favorite {
  rentalObject: {
    id: string;
    name: string;
    slug: string;
    categoryKey: string;
    categoryName: string;
    
    // Location
    address?: string;
    city?: string;
    postalCode?: string;
    
    // Metadata
    capacity?: number;
    pricePerHour?: number;
    imageUrl?: string;
    
    // Status
    isActive: boolean;
    isAvailable: boolean;
  };
}

// ====================================================================
// LIST RESPONSE
// ====================================================================

export interface FavoritesListResponse {
  data: FavoriteDetail[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ====================================================================
// QUERY PARAMETERS
// ===================================================================

export interface ListFavoritesQuery {
  page?: number;
  limit?: number;
  tag?: string;
  categoryKey?: string;
  sortBy?: 'createdAt' | 'name' | 'category';
  sortOrder?: 'asc' | 'desc';
}

// ====================================================================
// REQUEST DTOs
// ====================================================================

export interface CreateFavoriteDTO {
  rentalObjectId: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateFavoriteDTO {
  notes?: string;
  tags?: string[];
}

// ====================================================================
// RESPONSE DTOs
// ====================================================================

export interface IsFavoritedResponse {
  isFavorited: boolean;
  favoriteId?: string;
}

// ====================================================================
// BULK OPERATIONS
// ====================================================================

export interface BulkAddFavoritesDTO {
  rentalObjectIds: string[];
}

export interface BulkRemoveFavoritesDTO {
  favoriteIds: string[];
}

export interface BulkFavoritesResponse {
  success: number;
  failed: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}
