import { z } from 'zod';

/**
 * Favorites Schema Definitions
 * 
 * Purpose: Type-safe validation for the favorites/wishlist system
 * Features: Users can save rental objects to favorites for quick access
 */

// =====================================================================
// DATABASE SCHEMA
// =====================================================================

/**
 * Favorite record in database
 */
export const FavoriteSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  rentalObjectId: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Metadata
  notes: z.string().max(500).optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  
  // Timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Favorite = z.infer<typeof FavoriteSchema>;

// =====================================================================
// REQUEST DTOs
// =====================================================================

/**
 * Create favorite request
 */
export const CreateFavoriteSchema = z.object({
  rentalObjectId: z.string().uuid({
    message: 'rentalObjectId must be a valid UUID',
  }),
  notes: z.string().max(500).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export type CreateFavoriteDTO = z.infer<typeof CreateFavoriteSchema>;

/**
 * Update favorite request
 */
export const UpdateFavoriteSchema = z.object({
  notes: z.string().max(500).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export type UpdateFavoriteDTO = z.infer<typeof UpdateFavoriteSchema>;

/**
 * List favorites query parameters
 */
export const ListFavoritesQuerySchema = z.object({
  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  
  // Filters
  tag: z.string().optional(),
  categoryKey: z.string().optional(),
  
  // Sorting
  sortBy: z.enum(['createdAt', 'name', 'category']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListFavoritesQuery = z.infer<typeof ListFavoritesQuerySchema>;

// =====================================================================
// RESPONSE DTOs
// =====================================================================

/**
 * Favorite with rental object details (joined data)
 */
export const FavoriteDetailSchema = FavoriteSchema.extend({
  rentalObject: z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    categoryKey: z.string(),
    categoryName: z.string(),
    
    // Location
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    
    // Metadata
    capacity: z.number().optional(),
    pricePerHour: z.number().optional(),
    imageUrl: z.string().url().optional(),
    
    // Status
    isActive: z.boolean(),
    isAvailable: z.boolean(),
  }),
});

export type FavoriteDetail = z.infer<typeof FavoriteDetailSchema>;

/**
 * Paginated favorites list response
 */
export const FavoritesListResponseSchema = z.object({
  data: z.array(FavoriteDetailSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type FavoritesListResponse = z.infer<typeof FavoritesListResponseSchema>;

/**
 * Check if rental object is favorited
 */
export const IsFavoritedResponseSchema = z.object({
  isFavorited: z.boolean(),
  favoriteId: z.string().uuid().optional(),
});

export type IsFavoritedResponse = z.infer<typeof IsFavoritedResponseSchema>;

// =====================================================================
// BULK OPERATIONS
// =====================================================================

/**
 * Bulk add favorites
 */
export const BulkAddFavoritesSchema = z.object({
  rentalObjectIds: z.array(z.string().uuid()).min(1).max(50),
});

export type BulkAddFavoritesDTO = z.infer<typeof BulkAddFavoritesSchema>;

/**
 * Bulk remove favorites
 */
export const BulkRemoveFavoritesSchema = z.object({
  favoriteIds: z.array(z.string().uuid()).min(1).max(50),
});

export type BulkRemoveFavoritesDTO = z.infer<typeof BulkRemoveFavoritesSchema>;

/**
 * Bulk operation response
 */
export const BulkFavoritesResponseSchema = z.object({
  success: z.number(),
  failed: z.number(),
  errors: z.array(z.object({
    id: z.string(),
    error: z.string(),
  })).optional(),
});

export type BulkFavoritesResponse = z.infer<typeof BulkFavoritesResponseSchema>;
