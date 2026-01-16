/**
 * Common Schemas
 *
 * Shared schema components used across multiple domains.
 */
import { z } from 'zod';

// =============================================================================
// Pagination
// =============================================================================

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type Pagination = z.infer<typeof PaginationSchema>;

export const PaginatedResponseMetaSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type PaginatedResponseMeta = z.infer<typeof PaginatedResponseMetaSchema>;

// =============================================================================
// Sorting
// =============================================================================

export const SortOrderSchema = z.enum(['asc', 'desc']);
export type SortOrder = z.infer<typeof SortOrderSchema>;

export function createSortableQuerySchema<T extends readonly string[]>(sortableFields: T) {
  return z.object({
    sortBy: z.enum(sortableFields as unknown as [string, ...string[]]).optional(),
    sortOrder: SortOrderSchema.optional().default('desc'),
  });
}

// =============================================================================
// Identifiers
// =============================================================================

export const UUIDSchema = z.string().uuid();
export const SlugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(255);

// =============================================================================
// Timestamps
// =============================================================================

export const TimestampsSchema = z.object({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Timestamps = z.infer<typeof TimestampsSchema>;

// =============================================================================
// Metadata
// =============================================================================

export const MetadataSchema = z.record(z.unknown()).default({});
export type Metadata = z.infer<typeof MetadataSchema>;

// =============================================================================
// Currency
// =============================================================================

export const CurrencyCodeSchema = z.string().length(3).default('NOK');
export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;

export const MoneySchema = z.object({
  amount: z.number(),
  currency: CurrencyCodeSchema,
});

export type Money = z.infer<typeof MoneySchema>;

// =============================================================================
// API Response Wrappers
// =============================================================================

export function createDataResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    data: dataSchema,
  });
}

export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    data: z.array(dataSchema),
    meta: PaginatedResponseMetaSchema,
  });
}

// =============================================================================
// Error Response (RFC 7807)
// =============================================================================

export const FieldErrorSchema = z.object({
  field: z.string().optional(),
  message: z.string(),
  code: z.string().optional(),
});

export type FieldError = z.infer<typeof FieldErrorSchema>;

export const ProblemDetailsSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string().optional(),
  instance: z.string().optional(),
  correlationId: z.string().optional(),
  timestamp: z.string().optional(),
  errors: z.array(FieldErrorSchema).optional(),
});

export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;
