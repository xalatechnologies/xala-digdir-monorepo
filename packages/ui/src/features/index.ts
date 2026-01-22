/**
 * @digilist/ui - Feature Kits
 *
 * Feature-level components that compose Platform patterns
 * with Digilist domain-specific mapping.
 *
 * Each feature kit provides:
 * 1. **Thin Wrappers** - Components that compose Platform patterns with domain mapping
 * 2. **Mappers** - Functions to transform domain DTOs to component props
 * 3. **Re-exports** - Domain components from blocks for direct use
 *
 * ## Feature Kit Pattern
 *
 * ```
 * features/
 * ├── rental-objects/
 * │   ├── index.ts           # Public API
 * │   ├── mappers.ts         # DTO -> props mapping
 * │   └── *Wrapper.tsx       # Thin wrapper components
 * ├── booking/
 * │   ├── index.ts
 * │   └── mappers.ts
 * └── seasons/
 *     ├── index.ts
 *     └── mappers.ts
 * ```
 *
 * ## Usage
 *
 * ```tsx
 * // Import from feature kit
 * import {
 *   RentalObjectCardWrapper,
 *   mapRentalObjectToResourceCard,
 * } from '@digilist/ui/features/rental-objects';
 *
 * // Or import specific feature
 * import { BookingSuccess } from '@digilist/ui/features/booking';
 * import { SeasonCard } from '@digilist/ui/features/seasons';
 * ```
 */

// =============================================================================
// Rental Objects Feature Kit
// =============================================================================

export * from './rental-objects';

// =============================================================================
// Booking Feature Kit
// =============================================================================

export * from './booking';

// =============================================================================
// Seasons Feature Kit
// =============================================================================

export * from './seasons';

// =============================================================================
// Reviews Feature Kit
// =============================================================================

export * from './reviews';

// =============================================================================
// Rental Object Details Feature Kit
// =============================================================================

export * from './rental-object-details';

// =============================================================================
// Calendar Feature Kit
// =============================================================================

export * from './calendar';
