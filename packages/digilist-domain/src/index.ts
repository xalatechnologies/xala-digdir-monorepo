/**
 * @digilist/domain
 *
 * Domain-specific contracts, types, and schemas for the Digilist booking system.
 *
 * This package provides:
 * - Zod schemas for runtime validation
 * - TypeScript types inferred from schemas
 * - Projection DTOs for API responses
 *
 * Usage:
 *
 * ```typescript
 * // Import schemas for validation
 * import { CreateBookingSchema } from '@digilist/domain/schemas';
 *
 * // Import types for type annotations
 * import type { Booking, BookingStatus } from '@digilist/domain/types';
 *
 * // Import projections for UI components
 * import type { BookingDetailProjection } from '@digilist/domain/projections';
 * ```
 */

// Re-export everything from submodules
export * from './schemas';
export * from './types';
export * from './projections';

// Version info
export const VERSION = '1.0.0';
