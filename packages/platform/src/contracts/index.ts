/**
 * @xalatechnologies/platform/contracts
 *
 * API contracts: Zod schemas, TypeScript types, and projections
 *
 * Provides:
 * - Validation schemas (Zod) for API requests/responses
 * - Projection schemas for UI-ready DTOs
 * - TypeScript types inferred from schemas
 * - RFC 7807 Problem Details schema
 *
 * @example
 * ```tsx
 * import {
 *   CreateBookingSchema,
 *   BookingProjection,
 *   ProblemDetailsSchema,
 * } from '@xalatechnologies/platform/contracts';
 *
 * // Validate input
 * const result = CreateBookingSchema.safeParse(input);
 * if (!result.success) {
 *   console.error(result.error);
 * }
 *
 * // Use projection type
 * function BookingCard({ booking }: { booking: BookingProjection }) {
 *   return <Card>{booking.title}</Card>;
 * }
 * ```
 */

import { z } from 'zod';

// Common schemas
export const UUIDSchema = z.string().uuid();
export const SlugSchema = z.string().regex(/^[a-z0-9-]+$/);
export const EmailSchema = z.string().email();
export const DateSchema = z.string().datetime();

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type Pagination = z.infer<typeof PaginationSchema>;

// Sort order schema
export const SortOrderSchema = z.enum(['asc', 'desc']);
export type SortOrder = z.infer<typeof SortOrderSchema>;

// RFC 7807 Problem Details
export const ProblemDetailsSchema = z.object({
  type: z.string().url(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string().optional(),
  instance: z.string().optional(),
  correlationId: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  errors: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      })
    )
    .optional(),
});

export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;

// Paginated response schema factory
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  });
}

// TODO: Migrate from @xala/contracts
// Schemas
// export * from './schemas';

// Projections
// export * from './projections';

// Types
// export * from './types';
