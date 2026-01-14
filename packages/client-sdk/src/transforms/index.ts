/**
 * Transform Utilities
 *
 * Reusable data transformation functions for all apps.
 * Use these to transform raw API data into UI-friendly formats.
 */

// Listing transforms
export {
  // Types
  type TransformedAddress,
  type TransformedContact,
  type TransformedOpeningHoursDay,
  type TransformedOpeningHours,
  type TransformedAmenity,
  type TransformedFacility,
  type TransformedRule,
  type TransformedFAQ,
  type TransformedImage,
  type TransformedKeyFacts,
  type TransformedPricing as TransformedListingPricing,
  type TransformedListing,
  // Functions
  getListingTypeLabel,
  getPricingUnitLabel,
  transformAddress,
  transformContact,
  transformOpeningHours,
  transformAmenities,
  transformFacilities,
  transformRules,
  transformFAQ,
  transformImages,
  transformPricing as transformListingPricing,
  transformKeyFacts,
  getHighlights,
  transformListing,
  transformListings,
} from './listing.transform';

// Booking transforms
export {
  // Types
  type TransformedTimeSlot,
  type TransformedUser,
  type TransformedOrganization,
  type TransformedListing as TransformedBookingListing,
  type TransformedPricing as TransformedBookingPricing,
  type TransformedBooking,
  type TransformedCalendarEvent,
  type TransformedAllocation,
  // Functions
  getBookingStatusLabel,
  getBookingStatusColor,
  getPaymentStatusLabel,
  formatDuration,
  formatDate,
  formatTime,
  formatDateTime,
  transformTimeSlot,
  formatPrice,
  transformBooking,
  transformBookings,
  transformCalendarEvent,
  transformCalendarEvents,
  transformAllocation,
  transformAllocations,
} from './booking.transform';
