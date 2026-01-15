/**
 * Like Zod Schemas
 * Validation schemas for like (favorite) domain
 */
import { z } from 'zod';

/**
 * Full Like Schema
 */
export const LikeSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  listingId: z.string().uuid(),
  createdAt: z.coerce.date(),
});

export type Like = z.infer<typeof LikeSchema>;

/**
 * Create Like DTO
 * Only listingId is required - tenantId and userId come from auth context
 */
export const CreateLikeSchema = z.object({
  listingId: z.string().uuid(),
});

export type CreateLikeDTO = z.infer<typeof CreateLikeSchema>;

/**
 * Like Query Params
 * For paginated queries of user's likes
 */
export const LikeQuerySchema = z.object({
  listingId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type LikeQueryParams = z.infer<typeof LikeQuerySchema>;

/**
 * Like Check Response Schema
 * For checking if a listing is liked
 */
export const LikeCheckSchema = z.object({
  isLiked: z.boolean(),
});

export type LikeCheckResponse = z.infer<typeof LikeCheckSchema>;

/**
 * Liked Listing Projection Schema
 * For displaying liked listings with listing details
 */
export const LikedListingProjectionSchema = z.object({
  id: z.string().uuid(),
  listingId: z.string().uuid(),
  listingTitle: z.string(),
  listingSlug: z.string(),
  listingImageUrl: z.string().url().optional().nullable(),
  likedAt: z.coerce.date(),
});

export type LikedListingProjection = z.infer<typeof LikedListingProjectionSchema>;
