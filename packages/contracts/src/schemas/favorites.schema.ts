/**
 * @digilist/contracts - Favorites Schema
 *
 * Type-safe validation for the favorites/wishlist system.
 * Users can save rental objects to favorites for quick access.
 */
import { z } from 'zod';

import { UUIDSchema, TimestampsSchema, createPaginatedResponseSchema } from './base.schema';

// =====================================================================
// BASE TYPES
// =====================================================================

/**
 * Favorite record in database
 */
export const FavoriteSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  rentalObjectId: UUIDSchema,
  tenantId: UUIDSchema,

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
  rentalObjectId: UUIDSchema,
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
 * Sort options for favorites list
 */
export const FavoritesSortBySchema = z.enum(['createdAt', 'name', 'category']);
export type FavoritesSortBy = z.infer<typeof FavoritesSortBySchema>;

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
  sortBy: FavoritesSortBySchema.default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListFavoritesQuery = z.infer<typeof ListFavoritesQuerySchema>;

// =====================================================================
// RESPONSE DTOs
// =====================================================================

/**
 * Rental object summary in favorite detail
 */
export const FavoriteRentalObjectSchema = z.object({
  id: UUIDSchema,
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
});

export type FavoriteRentalObject = z.infer<typeof FavoriteRentalObjectSchema>;

/**
 * Favorite with rental object details (joined data)
 */
export const FavoriteDetailSchema = FavoriteSchema.extend({
  rentalObject: FavoriteRentalObjectSchema,
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
  favoriteId: UUIDSchema.optional(),
});

export type IsFavoritedResponse = z.infer<typeof IsFavoritedResponseSchema>;

// =====================================================================
// BULK OPERATIONS
// =====================================================================

/**
 * Bulk add favorites
 */
export const BulkAddFavoritesSchema = z.object({
  rentalObjectIds: z.array(UUIDSchema).min(1).max(50),
});

export type BulkAddFavoritesDTO = z.infer<typeof BulkAddFavoritesSchema>;

/**
 * Bulk remove favorites
 */
export const BulkRemoveFavoritesSchema = z.object({
  favoriteIds: z.array(UUIDSchema).min(1).max(50),
});

export type BulkRemoveFavoritesDTO = z.infer<typeof BulkRemoveFavoritesSchema>;

/**
 * Bulk operation error detail
 */
export const BulkFavoriteErrorSchema = z.object({
  id: z.string(),
  error: z.string(),
});

export type BulkFavoriteError = z.infer<typeof BulkFavoriteErrorSchema>;

/**
 * Bulk operation response
 */
export const BulkFavoritesResponseSchema = z.object({
  success: z.number(),
  failed: z.number(),
  errors: z.array(BulkFavoriteErrorSchema).optional(),
});

export type BulkFavoritesResponse = z.infer<typeof BulkFavoritesResponseSchema>;
