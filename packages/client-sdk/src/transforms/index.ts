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
  type TransformedOrganization as TransformedBookingOrganization,
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

// Organization & User transforms
export {
  // Organization Types
  type TransformedOrganization,
  type TransformedOrganizationMember,
  // User Types
  type TransformedUser as TransformedUserProfile,
  type TransformedAddress as TransformedUserAddress,
  // Functions
  getActorTypeLabel,
  getOrganizationStatusLabel,
  getOrganizationStatusColor,
  getUserRoleLabel,
  getUserRoleColor,
  getUserStatusLabel,
  getUserStatusColor,
  transformAddress as transformUserAddress,
  transformOrganization,
  transformOrganizations,
  transformOrganizationMember,
  transformOrganizationMembers,
  transformUser,
  transformUsers,
} from './organization.transform';

// Review transforms
export {
  // Types
  type TransformedReview,
  type TransformedReviewStats,
  type TransformedReviewSummary,
  // Functions
  getReviewStatusLabel,
  getReviewStatusColor,
  getRatingLabel,
  getRatingStars,
  formatRating,
  transformReview,
  transformReviews,
  transformReviewStats,
  transformReviewSummary,
} from './review.transform';

// Season transforms
export {
  // Types
  type TransformedSeasonDates,
  type TransformedSeasonStats,
  type TransformedSeason,
  type TransformedSeasonApplicationTime,
  type TransformedSeasonApplication,
  // Functions
  getSeasonStatusLabel,
  getSeasonStatusColor,
  getApplicationStatusLabel,
  getApplicationStatusColor,
  getWeekdayLabel,
  getWeekdayShortLabel,
  transformSeasonDates,
  transformSeasonStats,
  transformApplicationTime,
  transformSeason,
  transformSeasons,
  transformSeasonApplication,
  transformSeasonApplications,
} from './season.transform';
