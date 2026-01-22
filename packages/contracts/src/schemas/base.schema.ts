/**
 * Base Schemas
 *
 * Common reusable schemas for validation.
 * These were previously in @xalatechnologies/platform/contracts.
 */
import { z } from 'zod';

// =============================================================================
// UUID Schema
// =============================================================================

export const UUIDSchema = z.string().uuid();

// =============================================================================
// Slug Schema
// =============================================================================

export const SlugSchema = z.string().min(1).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
  message: 'Slug must be lowercase alphanumeric with hyphens',
});

// =============================================================================
// Timestamp Schemas
// =============================================================================

export const TimestampsSchema = z.object({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// =============================================================================
// Metadata Schema
// =============================================================================

export const MetadataSchema = z.record(z.string(), z.unknown()).default({});

// =============================================================================
// Currency Schema
// =============================================================================

export const CurrencyCodeSchema = z.string().length(3).default('NOK');

// =============================================================================
// Pagination Schema
// =============================================================================

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type Pagination = z.infer<typeof PaginationSchema>;

// =============================================================================
// Sort Order Schema
// =============================================================================

export const SortOrderSchema = z.enum(['asc', 'desc']);

export type SortOrder = z.infer<typeof SortOrderSchema>;

// =============================================================================
// Paginated Response Schema Factory
// =============================================================================

export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    meta: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  });
}

// =============================================================================
// RFC 7807 Problem Details Schema
// =============================================================================

export const ProblemDetailsSchema = z.object({
  type: z.string().url().optional(),
  title: z.string(),
  status: z.number().int().min(100).max(599),
  detail: z.string().optional(),
  instance: z.string().optional(),
});

export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;
