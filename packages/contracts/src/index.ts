/**
 * @xala/contracts
 *
 * Platform-level API contracts: Zod schemas, TypeScript types, and utilities.
 *
 * This package contains ONLY platform-level contracts that are shared across all domains:
 * - RFC7807 Problem Details schemas
 * - Pagination schemas
 * - Common response schemas
 * - Generic entity schemas (id, timestamps, etc.)
 * - Module registry and DTOs
 * - Monitoring DTOs
 *
 * NOTE: Domain-specific contracts (rental-object, booking, organization, user, etc.)
 * have been REMOVED from this package. They should be imported from @digilist/contracts.
 *
 * ## Usage
 *
 * ### Import Schemas (for validation)
 * ```typescript
 * import { PaginationSchema, ProblemDetailsSchema } from '@xala/contracts/schemas';
 *
 * const parsed = PaginationSchema.parse({ page: 1, limit: 20 });
 * ```
 *
 * ### Import Types (for type annotations)
 * ```typescript
 * import type { Pagination, ProblemDetails } from '@xala/contracts/types';
 *
 * function handleError(error: ProblemDetails) { ... }
 * ```
 *
 * ### For Domain Types
 * ```typescript
 * // Domain-specific contracts are in @digilist/contracts
 * import { RentalObjectSchema, BookingSchema } from '@digilist/contracts/schemas';
 * import type { RentalObject, Booking } from '@digilist/contracts/types';
 * ```
 */

// =============================================================================
// Platform-level exports
// =============================================================================

// Schemas (platform-level only: pagination, RFC7807, timestamps, etc.)
export * from './schemas';

// Types (platform-level only, re-exported for convenience)
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
} from './types';

// Monitoring DTOs (platform infrastructure)
export * from './monitoring';

// Modules (platform infrastructure for feature flags)
export * from './modules';

// =============================================================================
// NOTE: The following have been REMOVED (domain-specific, now in @digilist/contracts):
// - ./storage (file upload types with domain entity references)
// - ./projections (rental-object, booking, organization, user projections)
// - Domain schemas (rental-object, booking, organization, user, capabilities, custody)
// =============================================================================
