/**
 * Schemas Module
 *
 * Platform-level Zod schemas for API contracts.
 *
 * NOTE: Domain-specific schemas (rental-object, booking, organization, user, etc.)
 * have been REMOVED from this package. They should be imported from @digilist/contracts/schemas.
 *
 * This package (@xala/contracts) contains ONLY platform-level contracts:
 * - RFC7807 Problem Details schema
 * - Pagination schemas
 * - Common response schemas
 * - Generic entity schemas (id, timestamps, etc.)
 *
 * @example
 * // For domain schemas, use @digilist/contracts:
 * import { RentalObjectSchema, BookingSchema } from '@digilist/contracts/schemas';
 *
 * // For platform schemas, use @xala/contracts:
 * import { ProblemDetailsSchema, PaginationSchema } from '@xala/contracts/schemas';
 */

// =============================================================================
// Platform-level schemas
// =============================================================================

// Common platform schemas (pagination, sorting, identifiers, timestamps, RFC7807)
export * from './common.schema';
