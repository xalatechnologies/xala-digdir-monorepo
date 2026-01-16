/**
 * GDPR Zod Schemas
 * Validation schemas for GDPR data subject rights requests
 */
import { z } from 'zod';

/**
 * GDPR Request Type Enum
 */
export const GdprRequestTypeSchema = z.enum(['export', 'deletion']);
export type GdprRequestType = z.infer<typeof GdprRequestTypeSchema>;

/**
 * GDPR Request Status Enum
 */
export const GdprRequestStatusSchema = z.enum(['pending', 'processing', 'completed', 'rejected']);
export type GdprRequestStatus = z.infer<typeof GdprRequestStatusSchema>;

/**
 * Full GDPR Request Schema
 */
export const GdprRequestSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  requestType: GdprRequestTypeSchema,
  status: GdprRequestStatusSchema.default('pending'),
  requestedAt: z.coerce.date(),
  processedAt: z.coerce.date().optional().nullable(),
  processedBy: z.string().uuid().optional().nullable(),
  expiresAt: z.coerce.date(),
  metadata: z.record(z.unknown()).optional().default({}),
});

export type GdprRequest = z.infer<typeof GdprRequestSchema>;

/**
 * Create GDPR Request DTO
 */
export const CreateGdprRequestSchema = z.object({
  requestType: GdprRequestTypeSchema,
  metadata: z.record(z.unknown()).optional(),
});

export type CreateGdprRequestDTO = z.infer<typeof CreateGdprRequestSchema>;

/**
 * Update GDPR Request DTO
 */
export const UpdateGdprRequestSchema = z.object({
  status: GdprRequestStatusSchema.optional(),
  processedBy: z.string().uuid().optional().nullable(),
  processedAt: z.coerce.date().optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

export type UpdateGdprRequestDTO = z.infer<typeof UpdateGdprRequestSchema>;

/**
 * Update GDPR Request Status DTO
 */
export const UpdateGdprRequestStatusSchema = z.object({
  status: GdprRequestStatusSchema,
  rejectionReason: z.string().max(1000).optional(),
});

export type UpdateGdprRequestStatusDTO = z.infer<typeof UpdateGdprRequestStatusSchema>;

/**
 * GDPR Request Query Params
 */
export const GdprRequestQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  requestType: GdprRequestTypeSchema.optional(),
  status: GdprRequestStatusSchema.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type GdprRequestQueryParams = z.infer<typeof GdprRequestQuerySchema>;
