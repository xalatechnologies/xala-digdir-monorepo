/**
 * Share Link Zod Schemas
 * Validation schemas for share link domain
 */
import { z } from 'zod';

/**
 * Share Link Status Enum
 */
export const ShareLinkStatusSchema = z.enum(['active', 'expired', 'revoked']);
export type ShareLinkStatus = z.infer<typeof ShareLinkStatusSchema>;

/**
 * Share Type Enum
 * Currently only supports listings, but extensible for other resource types
 */
export const ShareTypeSchema = z.enum(['listing']);
export type ShareType = z.infer<typeof ShareTypeSchema>;

/**
 * Full Share Link Schema
 */
export const ShareLinkSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  type: ShareTypeSchema.default('listing'),
  resourceId: z.string().uuid(),
  token: z.string().min(1).max(64),
  createdById: z.string().uuid().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  revokedAt: z.coerce.date().optional().nullable(),
  viewCount: z.number().int().nonnegative().default(0),
  status: ShareLinkStatusSchema.default('active'),
  metadata: z.record(z.unknown()).optional().default({}),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ShareLink = z.infer<typeof ShareLinkSchema>;

/**
 * Create Share Link DTO
 * type and resourceId are required - tenantId and createdById come from auth context
 */
export const CreateShareSchema = z.object({
  type: ShareTypeSchema.default('listing'),
  resourceId: z.string().uuid(),
  expiresAt: z.coerce.date().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateShareDTO = z.infer<typeof CreateShareSchema>;

/**
 * Share Link Query Params
 * For paginated queries of user's share links
 */
export const ShareQuerySchema = z.object({
  type: ShareTypeSchema.optional(),
  resourceId: z.string().uuid().optional(),
  status: ShareLinkStatusSchema.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type ShareQueryParams = z.infer<typeof ShareQuerySchema>;

/**
 * Share Link Token Param Schema
 * For validating token URL parameter
 */
export const ShareTokenParamSchema = z.object({
  token: z.string().min(1).max(64),
});

export type ShareTokenParam = z.infer<typeof ShareTokenParamSchema>;

/**
 * Share Link Response Projection Schema
 * For API responses with generated URL
 */
export const ShareLinkResponseSchema = z.object({
  token: z.string(),
  url: z.string().url(),
  type: ShareTypeSchema,
  resourceId: z.string().uuid(),
  expiresAt: z.coerce.date().optional().nullable(),
  viewCount: z.number().int().nonnegative(),
  status: ShareLinkStatusSchema,
  createdAt: z.coerce.date(),
});

export type ShareLinkResponse = z.infer<typeof ShareLinkResponseSchema>;

/**
 * Revoke Share Link DTO
 * Optional reason for revocation (for audit logging)
 */
export const RevokeShareSchema = z.object({
  reason: z.string().max(1000).optional(),
});

export type RevokeShareDTO = z.infer<typeof RevokeShareSchema>;
