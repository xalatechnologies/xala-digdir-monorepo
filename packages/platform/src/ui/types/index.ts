/**
 * Platform UI Types
 *
 * Centralized type exports for platform UI components.
 * Uses platform-neutral terminology: "resource" instead of "listing", "amenity" instead of "facility".
 *
 * ## Migration Guide
 *
 * The following types have been renamed for platform-neutral terminology:
 *
 * | Old Name | New Name | Notes |
 * |----------|----------|-------|
 * | `ListingType` | `ResourceType` | Primary resource type enum |
 * | `ListingDetail` | `ResourceDetail` | Complete resource detail data |
 * | `Facility` | `Amenity` | Resource amenity/feature |
 * | `FacilitiesFilter` | `AmenitiesFilter` | Multi-select filter for amenities |
 * | `listingId` | `resourceId` | In BookingConfig |
 * | `listingType` | `resourceType` | In BookingConfig |
 *
 * Old names are still available as deprecated aliases for backward compatibility.
 */

// =============================================================================
// Resource Detail Types
// =============================================================================
export {
  // New platform-neutral types
  ResourceType,
  ResourceDetail,
  Amenity,

  // Deprecated aliases for backward compatibility
  /** @deprecated Use ResourceType instead */
  ListingType,
  /** @deprecated Use ResourceDetail instead */
  ListingDetail,
  /** @deprecated Use Amenity instead */
  Facility,

  // Other types (unchanged)
  TimeSlotStatus,
  GalleryImage,
  AdditionalService,
  ContactInfo,
  Coordinates,
  OpeningHoursDay,
  TimeSlot,
  BreadcrumbItem,
  BookingStep,
  ActivityType,
  BookingDetails,
  BookingState,
  GuidelineSection,
  FAQItem,

  // Calendar types
  CalendarMode,
  CalendarSlotStatus,
  CalendarSelectionType,
  CalendarViewMode,
  CalendarCell,
  CalendarSelectionRange,
  CalendarSelection,
  CalendarLegendItem,

  // Calendar constants
  CALENDAR_SLOT_STATUS_LABELS,
  CALENDAR_SLOT_STATUS_KEYS,
  CALENDAR_MODE_LABELS,
  DEFAULT_CALENDAR_LEGEND,

  // Calendar utilities
  isCalendarSlotSelectable,
  getCalendarSlotLabel,
  getCalendarSlotKey,
} from './resource-detail';

// =============================================================================
// Filter Types
// =============================================================================
export {
  // Re-export ResourceType from filters (same type, just for convenience)
  ResourceType as FilterResourceType,

  // Deprecated alias
  /** @deprecated Use ResourceType instead */
  ListingType as FilterListingType,

  // Other filter types
  VenueType,
  PriceUnit,
  AvailabilityStatus,
  FilterOption,
  PriceRangeFilter,
  CapacityRangeFilter,
  RatingFilter,
  LocationFilter,
  DateTimeFilter,
  FilterState,
  FilterConfig,

  // New platform-neutral filter
  AmenitiesFilter,

  // Deprecated alias
  /** @deprecated Use AmenitiesFilter instead */
  FacilitiesFilter,

  // Mock data generators
  mockFilterData,
} from './filters';

// =============================================================================
// Booking Types
// =============================================================================
export {
  // Booking-specific resource type
  BookingResourceType,

  // Booking types
  BookingMode,
  BookingPriceUnit,
  SlotStatus,
  AvailabilitySlot,
  DayAvailability,
  BookingPricing,
  BookingRules,
  DaySchedule,
  BookingConfig,
  BookingSelection,
  BookingFormData,
  PriceItem,
  BookingPriceCalculation,
  BookingStepConfig,

  // Booking utilities
  getBookingSteps,
  determineBookingMode,
  formatPrice,
  formatPriceUnit,
} from './booking';
