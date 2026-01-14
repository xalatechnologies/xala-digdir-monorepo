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
  /** Unique listing ID */
  id: string;
  /** URL-safe slug for routing */
  slug: string;
  /** Human-readable listing name */
  name: string;

  // === TYPE (Display-Ready) ===
  /** Raw type code (SPACE, RESOURCE, etc.) */
  type: string;
  /** Norwegian display label (Lokale, Utstyr, etc.) */
  typeLabel: string;

  // === LOCATION (Display-Ready) ===
  /** Formatted location string (e.g., "Storgata 1, 3010 Drammen") */
  locationFormatted: string;
  /** City name for filtering */
  city: string;
  /** Coordinates for map display (null if not available) */
  latitude: number | null;
  longitude: number | null;

  // === MEDIA (Display-Ready URLs) ===
  /** Primary image URL (full resolution) */
  primaryImageUrl: string;
  /** Primary image thumbnail URL (for cards) */
  primaryImageThumbnail: string;
  /** Alt text for accessibility */
  primaryImageAlt: string;
  /** Total number of images */
  imageCount: number;

  // === PRICING (Display-Ready) ===
  /** Base price amount (number for calculations) */
  priceAmount: number;
  /** Currency code (NOK, EUR, etc.) */
  priceCurrency: string;
  /** Pricing unit code (hour, day, etc.) */
  priceUnit: string;
  /** Full display string (e.g., "250 NOK/time") */
  priceDisplay: string;

  // === CAPACITY (Display-Ready) ===
  /** Maximum capacity number */
  capacity: number;
  /** Display label (e.g., "20 personer") */
  capacityLabel: string;

  // === FEATURES (Display-Ready Lists) ===
  /** Top 3 amenities for card display */
  amenities: string[];
  /** Count of additional amenities not shown */
  moreAmenitiesCount: number;

  // === RATING (Display-Ready) ===
  /** Average rating (0-5 scale) */
  averageRating: number;
  /** Total review count */
  reviewCount: number;
  /** Display string (e.g., "4.5 (23 anmeldelser)") */
  ratingDisplay: string;

  // === STATUS ===
  /** Whether currently available for booking */
  isAvailable: boolean;
  /** Whether this is a featured listing */
  isFeatured: boolean;
}

// =============================================================================
// LISTING DETAILS PROJECTION - For detail pages
// =============================================================================

/**
 * ListingDetailsProjectionDTO
 *
 * Complete listing data for detail pages.
 * All nested data is flattened or pre-formatted.
 */
export interface ListingDetailsProjectionDTO extends ListingCardProjectionDTO {
  // === DESCRIPTION ===
  /** Full description text */
  description: string;
  /** Short excerpt for meta tags (max 160 chars) */
  descriptionExcerpt: string;

  // === ALL IMAGES (Display-Ready) ===
  /** All images with full metadata */
  images: ListingImageDTO[];

  // === FULL LOCATION ===
  /** Street address */
  addressStreet: string;
  /** Postal code */
  addressPostalCode: string;
  /** City */
  addressCity: string;
  /** Municipality */
  addressMunicipality: string;
  /** Country */
  addressCountry: string;

  // === CONTACT (Display-Ready) ===
  /** Contact person name */
  contactName: string;
  /** Contact email */
  contactEmail: string;
  /** Contact phone (formatted) */
  contactPhone: string;
  /** Contact website URL */
  contactWebsite: string;

  // === ALL AMENITIES ===
  /** Complete list of amenities */
  allAmenities: ListingAmenityDTO[];

  // === FACILITIES/EQUIPMENT ===
  /** Included equipment or facilities */
  includedEquipment: ListingEquipmentDTO[];

  // === OPENING HOURS (Display-Ready) ===
  /** Weekly schedule in display-ready format */
  openingHours: ListingOpeningHoursDTO[];
  /** Whether open now */
  isOpenNow: boolean;
  /** Today's hours display (e.g., "08:00 - 20:00" or "Stengt") */
  todayHoursDisplay: string;

  // === RULES & GUIDELINES ===
  /** House rules / usage guidelines */
  rules: ListingRuleDTO[];

  // === FAQ ===
  /** Frequently asked questions */
  faq: ListingFaqDTO[];

  // === HIGHLIGHTS ===
  /** Marketing highlights/features */
  highlights: string[];

  // === BOOKING CONFIG (Display-Ready) ===
  /** Minimum booking duration display */
  minBookingDurationDisplay: string;
  /** Maximum booking duration display */
  maxBookingDurationDisplay: string;
  /** Advance booking required display */
  advanceBookingDisplay: string;
  /** Cancellation policy display */
  cancellationPolicyDisplay: string;

  // === PERMISSIONS (API-Computed) ===
  /** Whether current user can book */
  canBook: boolean;
  /** Whether current user can edit */
  canEdit: boolean;
  /** Whether current user can view pricing details */
  canViewPricing: boolean;
  /** Available actions for current user */
  availableActions: string[];

  // === TIMESTAMPS ===
  /** Created date (ISO string) */
  createdAt: string;
  /** Last updated date (ISO string) */
  updatedAt: string;
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
