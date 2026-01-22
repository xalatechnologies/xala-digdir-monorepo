/**
 * Projection Types
 *
 * Local type definitions for API projection DTOs.
 * These replace imports from the deleted @xalatechnologies/platform/contracts/projections package.
 */

// =============================================================================
// Rental Object Projections
// =============================================================================

export interface RentalObjectCardProjection {
  id: string;
  slug: string;
  name: string;
  title: string;
  tenantId: string;
  category: string;
  categoryLabel: string;
  subcategory: string;
  subcategoryLabel: string;
  timeMode: string;
  timeModeLabel: string;
  locationFormatted: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  primaryImageUrl: string;
  primaryImageThumbnail: string;
  primaryImageAlt: string;
  imageCount: number;
  priceAmount: number;
  priceCurrency: string;
  priceUnit: string;
  priceDisplay: string;
  capacity: number;
  capacityLabel: string;
  amenities: string[];
  moreAmenitiesCount: number;
  averageRating: number;
  reviewCount: number;
  ratingDisplay: string;
  descriptionExcerpt: string;
  isAvailable: boolean;
  isFeatured: boolean;
}

export interface RentalObjectImageProjection {
  id: string;
  url: string;
  thumbnailUrl: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface RentalObjectAmenityProjection {
  id: string;
  name: string;
  icon: string;
  category: string;
}

export interface RentalObjectOpeningHoursProjection {
  day: string;
  dayIndex: number;
  openTime: string;
  closeTime: string;
  hoursDisplay: string;
  isClosed: boolean;
}

export interface RentalObjectDetailsProjection extends RentalObjectCardProjection {
  description: string;
  images: RentalObjectImageProjection[];
  addressStreet: string;
  addressPostalCode: string;
  addressCity: string;
  addressMunicipality: string;
  addressCountry: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactWebsite: string;
  allAmenities: RentalObjectAmenityProjection[];
  openingHours: RentalObjectOpeningHoursProjection[];
  isOpenNow: boolean;
  todayHoursDisplay: string;
  rules: Array<{ id: string; title: string; content: string }>;
  faq: Array<{ id: string; question: string; answer: string }>;
  highlights: string[];
  bookingCalendarType: 'time_slots' | 'day_booking' | 'season_allocation' | 'request_only';
  minBookingDuration: number;
  minBookingDurationDisplay: string;
  maxBookingDuration: number;
  maxBookingDurationDisplay: string;
  advanceBookingDays: number;
  advanceBookingDisplay: string;
  cancellationPolicyDisplay: string;
  requiresApproval: boolean;
  instantBookingEnabled: boolean;
  canBook: boolean;
  canEdit: boolean;
  canViewPricing: boolean;
  availableActions: string[];
  createdAt: string;
  updatedAt: string;
}
