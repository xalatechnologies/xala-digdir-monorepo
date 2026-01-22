/**
 * @digilist/ui
 *
 * Domain-specific UI components for the Digilist rental booking platform.
 * Extends @xalatechnologies/platform/ui with domain-specific components.
 *
 * ## Package Structure
 *
 * ```
 * @digilist/ui
 * ├── compat/              # Platform UI compatibility layer (extends platform)
 * │   ├── Designsystemet components (Button, Card, etc.)
 * │   ├── AppHeader, ContentLayout, Grid, Stack
 * │   ├── BookingStatusBadge, PaymentStatusBadge
 * │   └── Icons, Hooks, Types
 * ├── features/            # Feature kits with thin wrappers + mappers
 * │   ├── rental-objects/  # RentalObjectCardWrapper, mapRentalObjectToResourceCard
 * │   ├── booking/         # mapBookingToCardDisplay, mapBookingToPriceSummary
 * │   └── seasons/         # mapSeasonDTOToCardData, mapVenueDTOToCardData
 * ├── blocks/              # Domain components (direct use)
 * │   ├── rental-objects/  # RentalObjectCard, RentalObjectGrid, etc.
 * │   ├── booking/         # BookingFormModal, BookingSuccess, etc.
 * │   └── seasons/         # SeasonCard, VenueCard
 * └── booking-engine/      # Multi-step booking wizard
 * ```
 *
 * ## Usage Examples
 *
 * ```tsx
 * // Platform UI components from compat layer
 * import { Button, Card, AppHeader, BookingStatusBadge } from '@digilist/ui/compat';
 *
 * // Domain components
 * import { RentalObjectCard, BookingSuccess } from '@digilist/ui';
 *
 * // Feature kits with mappers
 * import {
 *   RentalObjectCardWrapper,
 *   mapRentalObjectToResourceCard,
 * } from '@digilist/ui/features/rental-objects';
 * ```
 *
 * @see [Compat Layer](./compat/index.ts) for platform UI components
 * @see [Feature Kits](./features/index.ts) for domain feature kits
 */

// =============================================================================
// Platform UI Compatibility Layer (extends @xalatechnologies/platform/ui)
// =============================================================================
// IMPORTANT: For platform UI components, import from '@digilist/ui/compat'
// The compat module is NOT re-exported here to avoid conflicts with domain components.
//
// Example:
//   import { AppHeader, Stack, Grid } from '@digilist/ui/compat';
//   import { BookingStatusBadge } from '@digilist/ui/compat';
//
// Domain components are exported below via features.

// NOTE: Compat module is available at '@digilist/ui/compat' but not re-exported here
// to prevent duplicate exports with domain components (StatusTag, ShareButton, etc.)

// =============================================================================
// Feature Kits (RECOMMENDED - Thin Wrappers + Mappers)
// =============================================================================
// Note: Feature kits re-export domain components from ./blocks
// so we don't need a separate export from ./blocks to avoid duplicates

export * from './features';

// =============================================================================
// Booking Engine (Multi-step Booking Wizard)
// =============================================================================

export * from './booking-engine';

// =============================================================================
// Types (explicit exports to avoid conflicts with features)
// =============================================================================
// Note: Some types are already exported via features -> blocks chain,
// so we only export additional types from ./types that aren't duplicated

export type {
  // Rental object detail types
  RentalObjectType,
  ListingType, // @deprecated - use RentalObjectType
  TimeSlotStatus,
  GalleryImage,
  Amenity,
  Facility, // @deprecated - use Amenity
  AdditionalService,
  ContactInfo,
  Coordinates,
  OpeningHoursDay,
  BreadcrumbItem,
  BookingStep,
  BookingDetails,
  BookingState,
  GuidelineSection,
  FAQItem,
  RentalObjectDetail,
  ListingDetail, // @deprecated - use RentalObjectDetail
  // Calendar types
  CalendarMode,
  CalendarSlotStatus,
  CalendarSelectionType,
  CalendarViewMode,
  CalendarCell,
  CalendarSelectionRange,
  CalendarSelection,
  CalendarLegendItem,
} from './types';

export {
  // Calendar constants and helpers
  CALENDAR_SLOT_STATUS_LABELS,
  CALENDAR_SLOT_STATUS_KEYS,
  CALENDAR_MODE_LABELS,
  DEFAULT_CALENDAR_LEGEND,
  isCalendarSlotSelectable,
  getCalendarSlotLabel,
  getCalendarSlotKey,
} from './types';
