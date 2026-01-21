/**
 * @digilist/ui
 *
 * Domain-specific UI components for the Digilist rental booking platform.
 *
 * This package contains business components specific to the rental booking domain.
 * For platform-agnostic UI components (Button, Card, etc.), use @xalatechnologies/platform/ui.
 *
 * ## Recommended: Feature Kits with Mappers
 *
 * Feature kits provide thin wrappers that compose Platform patterns with domain mapping:
 *
 * ```tsx
 * import {
 *   RentalObjectCardWrapper,
 *   mapRentalObjectToResourceCard,
 * } from '@digilist/ui/features/rental-objects';
 *
 * import { BookingSuccess, mapBookingToCardDisplay } from '@digilist/ui/features/booking';
 * import { SeasonCard, mapSeasonDTOToCardData } from '@digilist/ui/features/seasons';
 * ```
 *
 * ## Direct Component Usage (Legacy)
 *
 * ```tsx
 * import { RentalObjectCard, BookingSuccess } from '@digilist/ui';
 * ```
 *
 * ## Package Structure
 *
 * ```
 * @digilist/ui
 * ├── features/            # Feature kits with thin wrappers + mappers (RECOMMENDED)
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
 * ## Feature Kit Pattern
 *
 * Each feature kit exports:
 * 1. **Thin Wrappers** - Components that compose Platform patterns with domain mapping
 * 2. **Mappers** - Functions to transform domain DTOs to component props
 * 3. **Re-exports** - Domain components from blocks for direct use
 *
 * @see [Feature Kits Documentation](./features/index.ts)
 */

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
