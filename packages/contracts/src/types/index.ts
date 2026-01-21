/**
 * Types Module
 *
 * Platform-level TypeScript types derived from Zod schemas.
 *
 * NOTE: Domain-specific types (rental-object, booking, organization, user, etc.)
 * have been REMOVED from this package. They should be imported from @digilist/contracts/types.
 *
 * This package (@xala/contracts) contains ONLY platform-level types:
 * - RFC7807 Problem Details types
 * - Pagination types
 * - Common response types
 * - Generic entity types (timestamps, metadata, etc.)
 *
 * @example
 * // For domain types, use @digilist/contracts:
 * import type { RentalObject, Booking, User } from '@digilist/contracts/types';
 *
 * // For platform types, use @xala/contracts:
 * import type { ProblemDetails, Pagination } from '@xala/contracts/types';
 */

// =============================================================================
// Platform-level Types (from common.schema.ts)
// =============================================================================

export type {
  Pagination,
  PaginatedResponseMeta,
  SortOrder,
  Timestamps,
  Metadata,
  CurrencyCode,
  Money,
  FieldError,
  ProblemDetails,
} from '../schemas/common.schema';
