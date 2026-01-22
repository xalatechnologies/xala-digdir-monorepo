/**
 * @digilist/ui - Rental Object Details Feature Kit
 *
 * Provides mappers and re-exports for rental object detail pages.
 * This feature kit bridges SDK data to presentational components.
 *
 * ## Architecture
 *
 * The rental object details feature has many components spread across the app.
 * This feature kit provides:
 *
 * 1. **Mappers** - Transform SDK DTOs to component props
 * 2. **Type re-exports** - Domain types for rental object details
 * 3. **Platform component references** - Contact and opening hours use platform components
 *
 * ## Usage
 *
 * ```tsx
 * import {
 *   mapContactInfoToCardProps,
 *   mapOpeningHoursToCardProps,
 *   type RentalObjectDetail,
 *   type ContactInfo,
 * } from '@digilist/ui/features/rental-object-details';
 *
 * // Use platform components with domain mappers
 * import { ContactInfoCard, OpeningHoursCard } from '@xalatechnologies/platform/ui';
 *
 * function Sidebar({ rentalObject }) {
 *   return (
 *     <>
 *       <ContactInfoCard {...mapContactInfoToCardProps(rentalObject.contact)} />
 *       <OpeningHoursCard {...mapOpeningHoursToCardProps(rentalObject.openingHours)} />
 *     </>
 *   );
 * }
 * ```
 *
 * ## Migration Path
 *
 * Many rental object detail components currently live in apps/web.
 * Components are being migrated incrementally:
 *
 * - **Widget components**: ContactWidget, OpeningHoursWidget → Use platform components
 * - **Tab components**: Evaluate for migration (may contain SDK hooks)
 * - **Booking components**: Complex workflows, remain in app for now
 * - **Recurring components**: Evaluate for migration
 *
 * ## Platform Components for Widgets
 *
 * For contact and opening hours display, use platform components directly:
 * - `ContactInfoCard` from `@xalatechnologies/platform/ui`
 * - `OpeningHoursCard` from `@xalatechnologies/platform/ui`
 */

// Mappers
export {
  mapContactInfoToCardProps,
  mapOpeningHoursToCardProps,
  type ContactInfoDTO,
  type OpeningHoursDTO,
  type DayHoursDTO,
} from './mappers';

// Re-export types from @digilist/ui/types
// Note: Only export types unique to rental-object-details to avoid conflicts
// with other feature kits (booking, rental-objects)
export type {
  RentalObjectDetail,
  RentalObjectType,
  ContactInfo,
  OpeningHoursDay,
  Coordinates,
  AdditionalService,
  GalleryImage,
  GuidelineSection,
  // Calendar types (unique to rental-object-details)
  CalendarMode,
  CalendarSlotStatus,
  CalendarSelectionType,
  CalendarViewMode,
  CalendarCell,
  CalendarSelection,
  CalendarSelectionRange,
  CalendarLegendItem,
  // Booking detail types (unique naming)
  BookingDetails,
  BookingState,
  BookingStep,
  TimeSlotStatus,
} from '../../types/rental-object-detail';

// Re-export utilities
export {
  isCalendarSlotSelectable,
  getCalendarSlotLabel,
  getCalendarSlotKey,
  CALENDAR_SLOT_STATUS_LABELS,
  CALENDAR_SLOT_STATUS_KEYS,
  CALENDAR_MODE_LABELS,
  DEFAULT_CALENDAR_LEGEND,
} from '../../types/rental-object-detail';

// Note: The following types are NOT re-exported here to avoid conflicts:
// - Amenity (use from @digilist/ui/features/rental-objects)
// - FAQItem (use from @digilist/ui/types directly)
// - TimeSlot (use from @digilist/ui/features/booking)
// - ActivityType (use from @digilist/ui/features/booking)
