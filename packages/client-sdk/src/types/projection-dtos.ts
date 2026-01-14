/**
 * Listing Projection DTOs - Screen-Ready Data Structures
 *
 * These DTOs are returned directly by the API and are designed to be
 * immediately renderable by UI components WITHOUT any transformation.
 *
 * DESIGN PRINCIPLES:
 * - FLAT structure (no nested objects to traverse)
 * - DESCRIPTIVE field names (self-documenting)
 * - DISPLAY-READY values (labels, formatted strings)
 * - CONSISTENT across all frontends (web, backoffice, minside)
 *
 * @example
 * // Frontend can render directly:
 * <ListingCard
 *   id={listing.id}
 *   name={listing.name}
 *   typeLabel={listing.typeLabel}
 *   locationFormatted={listing.locationFormatted}
 *   primaryImageUrl={listing.primaryImageUrl}
 *   priceDisplay={listing.priceDisplay}
 * />
 */

// =============================================================================
// LISTING CARD PROJECTION - For grids, search results, maps
// =============================================================================

/**
 * ListingCardProjectionDTO
 *
 * Minimal, flat structure for listing cards in grids/lists.
 * All fields are display-ready strings or primitives.
 */
export interface ListingCardProjectionDTO {
  // === IDENTITY ===
  id: string;
  slug: string;
  name: string;
  tenantId: string;

  // === TYPE (Display-Ready) ===
  type: string;
  typeLabel: string;

  // === LOCATION (Display-Ready) ===
  locationFormatted: string;
  city: string;
  latitude: number | null;
  longitude: number | null;

  // === MEDIA (Display-Ready URLs) ===
  primaryImageUrl: string;
  primaryImageThumbnail: string;
  primaryImageAlt: string;
  imageCount: number;

  // === PRICING (Display-Ready) ===
  priceAmount: number;
  priceCurrency: string;
  priceUnit: string;
  priceDisplay: string;

  // === CAPACITY (Display-Ready) ===
  capacity: number;
  capacityLabel: string;

  // === FEATURES (Display-Ready Lists) ===
  amenities: string[];
  moreAmenitiesCount: number;

  // === RATING (Display-Ready) ===
  averageRating: number;
  reviewCount: number;
  ratingDisplay: string;

  // === DESCRIPTION (excerpt for cards) ===
  descriptionExcerpt: string;

  // === STATUS ===
  isAvailable: boolean;
  isFeatured: boolean;
}

// =============================================================================
// SUPPORTING TYPES (Flat, Display-Ready)
// =============================================================================

export interface ListingImageDTO {
  id: string;
  url: string;
  thumbnailUrl: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface ListingAmenityDTO {
  id: string;
  name: string;
  icon: string;
  category: string;
}

export interface ListingEquipmentDTO {
  id: string;
  name: string;
  quantity: number;
  description: string;
}

export interface ListingOpeningHoursDTO {
  day: string;
  dayIndex: number;
  openTime: string;
  closeTime: string;
  hoursDisplay: string;
  isClosed: boolean;
}

export interface ListingRuleDTO {
  id: string;
  title: string;
  content: string;
}

export interface ListingFaqDTO {
  id: string;
  question: string;
  answer: string;
}

export interface ListingAdditionalServiceDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  priceDisplay: string;
  isOptional: boolean;
}

export interface ListingEventDTO {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
}

// =============================================================================
// LISTING DETAILS PROJECTION - For detail pages with all tabs
// =============================================================================

/**
 * ListingDetailsProjectionDTO
 *
 * Complete listing data for detail pages.
 * Covers all tabs: Overview, Rules, FAQ, Events, Booking.
 */
export interface ListingDetailsProjectionDTO extends ListingCardProjectionDTO {
  // === DESCRIPTION ===
  description: string;
  descriptionExcerpt: string;

  // === ALL IMAGES (for gallery) ===
  images: ListingImageDTO[];

  // === FULL LOCATION (for map tab) ===
  addressStreet: string;
  addressPostalCode: string;
  addressCity: string;
  addressMunicipality: string;
  addressCountry: string;

  // === CONTACT (Display-Ready) ===
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactWebsite: string;

  // === ALL AMENITIES ===
  allAmenities: ListingAmenityDTO[];

  // === FACILITIES/EQUIPMENT ===
  includedEquipment: ListingEquipmentDTO[];

  // === ADDITIONAL SERVICES (purchasable add-ons) ===
  additionalServices: ListingAdditionalServiceDTO[];

  // === OPENING HOURS (Display-Ready) ===
  openingHours: ListingOpeningHoursDTO[];
  isOpenNow: boolean;
  todayHoursDisplay: string;

  // === RULES & GUIDELINES (for Rules tab) ===
  rules: ListingRuleDTO[];

  // === FAQ (for FAQ tab) ===
  faq: ListingFaqDTO[];

  // === HIGHLIGHTS ===
  highlights: string[];

  // === EVENTS (for Events/Calendar tab) ===
  upcomingEvents: ListingEventDTO[];

  // === BOOKING CONFIG (for booking widget) ===
  /** Calendar type: time_slots, day_booking, season_allocation, request_only */
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

  // === PERMISSIONS (API-Computed) ===
  canBook: boolean;
  canEdit: boolean;
  canViewPricing: boolean;
  availableActions: string[];

  // === TIMESTAMPS ===
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// BOOKING PROJECTIONS
// =============================================================================

/**
 * BookingCardProjectionDTO
 *
 * For booking lists in "My Bookings", "Org Bookings", etc.
 */
export interface BookingCardProjectionDTO {
  // === IDENTITY ===
  id: string;
  referenceNumber: string;

  // === LISTING (Embedded, Flat) ===
  listingId: string;
  listingName: string;
  listingSlug: string;
  listingImageUrl: string;
  listingLocation: string;

  // === TIMING (Display-Ready) ===
  startDateTime: string;
  endDateTime: string;
  dateDisplay: string;
  timeDisplay: string;
  durationDisplay: string;

  // === STATUS (Display-Ready) ===
  status: string;
  statusLabel: string;
  statusColor: string;

  // === PRICING ===
  totalAmount: number;
  currency: string;
  totalDisplay: string;

  // === ACTIONS (API-Computed) ===
  canCancel: boolean;
  canModify: boolean;
  canReview: boolean;
  availableActions: string[];
}

/**
 * BookingDetailsProjectionDTO
 *
 * Complete booking data for detail pages.
 */
export interface BookingDetailsProjectionDTO extends BookingCardProjectionDTO {
  // === PURPOSE ===
  purposeDescription: string;
  attendeesCount: number;

  // === ORGANIZATION (if applicable) ===
  organizationId: string | null;
  organizationName: string | null;

  // === APPROVAL INFO ===
  requiresApproval: boolean;
  approvalStatus: string | null;
  approvalStatusLabel: string | null;
  approvedByName: string | null;
  approvedAt: string | null;

  // === PAYMENT INFO ===
  paymentStatus: string;
  paymentStatusLabel: string;
  paymentMethod: string | null;
  invoiceId: string | null;

  // === TIMESTAMPS ===
  createdAt: string;
  updatedAt: string;

  // === PRICING BREAKDOWN ===
  priceBreakdown: PriceBreakdownItemDTO[];
}

export interface PriceBreakdownItemDTO {
  label: string;
  amount: number;
  type: 'base' | 'addon' | 'discount' | 'tax' | 'total';
}

// =============================================================================
// ORGANIZATION PROJECTIONS
// =============================================================================

export interface OrganizationCardProjectionDTO {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  memberCount: number;
  role: string;
  roleLabel: string;
}

export interface OrganizationDetailsProjectionDTO extends OrganizationCardProjectionDTO {
  description: string;
  contactEmail: string;
  contactPhone: string;
  addressFormatted: string;
  createdAt: string;
  canEdit: boolean;
  canManageMembers: boolean;
  canViewBookings: boolean;
}

// =============================================================================
// USER PROJECTIONS
// =============================================================================

export interface UserProfileProjectionDTO {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  phone: string;
  preferredLanguage: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  organizations: OrganizationCardProjectionDTO[];
}
