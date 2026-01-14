/**
 * Listing Types
 * Single Responsibility: All listing-related type definitions
 */

import type { BaseEntity, TenantEntity, ListingType, ListingStatus, BookingModel, PricingUnit, BaseQueryParams } from './enums';
import type { ReviewStats } from './review';
import type { BookingMode, RecurringConstraintsDTO, InGameConstraintsDTO } from './booking';

// =============================================================================
// Listing Entity
// =============================================================================

export interface ListingPricing {
  basePrice: number;
  currency: string;
  unit: PricingUnit;
  weekendMultiplier?: number;
  peakHoursMultiplier?: number;
}

export interface ListingLocation {
  // Support both lat/lng and latitude/longitude for compatibility
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  municipality?: string;
}

export interface ListingMetadata {
  address?: string;
  city?: string;
  postalCode?: string;
  location?: ListingLocation;
  facilities?: string[];
  amenities?: string[];
  openingHours?: Record<string, { open: string; close: string }>;
  rules?: string[];
  faq?: Array<{ id?: string; question: string; answer: string }>;
  // Contact information
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWebsite?: string;
}

export interface Listing extends TenantEntity {
  organizationId?: string;
  name: string;
  slug: string;
  type: ListingType;
  bookingModel?: BookingModel;
  status: ListingStatus;
  description?: string;
  images: string[];
  pricing: ListingPricing;
  capacity?: number;
  quantity?: number;
  // Location fields (root level)
  address?: string;
  location?: ListingLocation;
  metadata?: ListingMetadata;
  // Review aggregation (populated by backend)
  averageRating?: number;
  reviewCount?: number;
}

// =============================================================================
// Listing DTOs
// =============================================================================

export interface CreateListingDTO {
  name: string;
  slug?: string;
  type: ListingType;
  bookingModel?: BookingModel;
  description?: string;
  images?: string[];
  pricing?: Partial<ListingPricing>;
  capacity?: number;
  organizationId?: string;
  metadata?: ListingMetadata;
}

export interface UpdateListingDTO {
  name?: string;
  description?: string;
  images?: string[];
  pricing?: Partial<ListingPricing>;
  capacity?: number;
  metadata?: ListingMetadata;
}

export interface ListingQueryParams extends BaseQueryParams {
  type?: ListingType;
  status?: ListingStatus;
  organizationId?: string;
  search?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  maxCapacity?: number;
  amenities?: string;
}

// =============================================================================
// Listing Related Types
// =============================================================================

export interface ListingAvailability {
  listingId: string;
  startDate: string;
  endDate: string;
  blockedSlots: Array<{
    startTime: string;
    endTime: string;
    status: string;
  }>;
}

export interface ListingStats {
  listingId: string;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  utilizationRate: number;
  lastBooking?: string;
  reviewStats?: ReviewStats;
}

export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  slug?: string;
  description?: string;
  icon?: string;
  listingCount?: number;
  parentId?: string;
  children?: Category[];
}

export interface City {
  name: string;
  slug: string;
  listingCount?: number;
}

export interface Municipality {
  code: string;
  name: string;
  county: string;
  listingCount?: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  price?: number;
}

export interface AvailabilityQueryParams {
  startDate: string;
  endDate: string;
  duration?: number;
}

export interface PublicListingParams extends BaseQueryParams {
  type?: ListingType;
  city?: string;
  municipality?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  date?: string;
  search?: string;
}

// =============================================================================
// Listing Calendar Config Types
// =============================================================================

/**
 * Constraints for single slot booking mode.
 * Defines rules for standard one-time booking selection.
 */
export interface SingleSlotConstraintsDTO {
  /** Whether single slot mode is enabled for this listing */
  enabled: boolean;
  /** Minimum booking duration in minutes */
  minDurationMinutes?: number;
  /** Maximum booking duration in minutes */
  maxDurationMinutes?: number;
  /** Minimum advance notice in minutes */
  minNoticeMinutes?: number;
  /** Maximum advance booking window in days */
  maxAdvanceDays?: number;
}

/**
 * Configuration for a single booking mode.
 * Contains mode type, enabled status, label key, and mode-specific constraints.
 */
export interface BookingModeConfig {
  /** The booking mode type */
  mode: BookingMode;
  /** Whether this mode is enabled for the listing */
  enabled: boolean;
  /** Localization key for display label (e.g., "booking.mode.single", "booking.mode.recurring") */
  labelKey: string;
  /** Optional description key for mode explanation */
  descriptionKey?: string;
  /** Mode-specific constraints */
  constraints: SingleSlotConstraintsDTO | InGameConstraintsDTO | RecurringConstraintsDTO;
}

/**
 * Calendar granularity for display purposes.
 * - HOUR: Display time slots by hour
 * - DAY: Display full-day slots
 * - WEEK: Display weekly view
 */
export type CalendarGranularity = 'HOUR' | 'DAY' | 'WEEK';

/**
 * Listing calendar configuration projection DTO.
 * Contains all configuration needed to render the booking calendar UI.
 * This is a screen-ready projection - UI should use values directly without transformation.
 */
export interface ListingCalendarConfigProjectionDTO {
  /** ID of the listing */
  listingId: string;
  /** Name of the listing */
  listingName: string;
  /** Calendar display granularity */
  granularity: CalendarGranularity;
  /** Available booking modes with their configurations */
  bookingModes: BookingModeConfig[];
  /** Default booking mode (first enabled mode) */
  defaultMode: BookingMode;
  /** Operating hours for the listing (ISO weekday 1-7 to open/close times) */
  operatingHours?: Record<string, { open: string; close: string }>;
  /** Time zone for the listing (IANA format, e.g., "Europe/Oslo") */
  timezone: string;
  /** Slot duration in minutes for calendar grid */
  slotDurationMinutes: number;
  /** Minimum selectable slots (for MIN_SLOT_COUNT validation) */
  minSlots?: number;
  /** Maximum selectable slots (for MAX_SLOT_COUNT validation) */
  maxSlots?: number;
  /** Whether the listing allows same-day booking */
  allowSameDayBooking: boolean;
  /** Lead time in minutes required before booking start */
  leadTimeMinutes?: number;
  /** Available actions based on user permissions */
  availableActions: Array<'VIEW' | 'BOOK' | 'RESERVE' | 'MANAGE'>;
  /** User permissions for this listing */
  permissions: {
    canBook: boolean;
    canReserve: boolean;
    canViewPricing: boolean;
    canManageAvailability: boolean;
  };
}

// =============================================================================
// Filter Option Constants
// =============================================================================

/**
 * ListingType to Norwegian display labels
 */
export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  SPACE: 'Lokale',
  RESOURCE: 'Ressurs',
  EVENT: 'Arrangement',
  SERVICE: 'Tjeneste',
  VEHICLE: 'Kjøretøy',
  OTHER: 'Annet',
};

/**
 * Listing type filter options
 */
export const LISTING_TYPE_OPTIONS: Array<{ id: ListingType | 'ALL'; label: string }> = [
  { id: 'ALL', label: 'Alle' },
  { id: 'SPACE', label: 'Lokaler' },
  { id: 'RESOURCE', label: 'Ressurser' },
  { id: 'EVENT', label: 'Arrangementer' },
  { id: 'SERVICE', label: 'Tjenester' },
  { id: 'VEHICLE', label: 'Kjøretøy' },
  { id: 'OTHER', label: 'Annet' },
];

/**
 * Capacity filter options
 */
export const CAPACITY_OPTIONS: Array<{ id: string; label: string; min: number; max: number }> = [
  { id: 'all', label: 'Alle størrelser', min: 0, max: Infinity },
  { id: '1-10', label: '1-10 personer', min: 1, max: 10 },
  { id: '11-25', label: '11-25 personer', min: 11, max: 25 },
  { id: '26-50', label: '26-50 personer', min: 26, max: 50 },
  { id: '51-100', label: '51-100 personer', min: 51, max: 100 },
  { id: '100+', label: 'Over 100 personer', min: 101, max: Infinity },
];

// =============================================================================
// UI-friendly Types
// =============================================================================

/**
 * UI-friendly listing type (matches @xala/ds ListingCard props)
 */
export interface UiListing {
  id: string;
  name: string;
  /** Display category/subcategory (e.g., "Møterom", "Idrettshall") */
  type: string;
  /** Primary listing type enum */
  listingType: ListingType;
  location: string;
  description: string;
  /** Amenities/facilities for display */
  facilities: string[];
  moreFacilities: number;
  capacity: number;
  price: number;
  priceUnit: string;
  currency: string;
  rating: number;
  reviewCount: number;
  available: boolean;
  image: string;
  images: string[];
  latitude?: number;
  longitude?: number;
  slug?: string;
  openingHours?: Record<string, { open: string; close: string }>;
  rules?: string[];
  faq?: Array<{ id?: string; question: string; answer: string }>;
  additionalServices?: Array<{ name: string; price: number }>;
}

// =============================================================================
// Transform Functions
// =============================================================================

/**
 * Map API pricing unit to Norwegian display string
 */
export function mapPricingUnit(unit: PricingUnit): string {
  const unitMap: Record<PricingUnit, string> = {
    hour: 'time',
    day: 'dag',
    booking: 'booking',
    week: 'uke',
    month: 'måned',
  };
  return unitMap[unit] || unit;
}

/**
 * Get display label for listing type (for UiListing cards)
 * @deprecated Use getListingTypeLabel from transforms/listing.transform.ts for comprehensive transforms
 */
export function getListingTypeLabelForCard(type: ListingType): string {
  return LISTING_TYPE_LABELS[type] || type;
}

/**
 * Transform API Listing to UiListing (card format)
 * @deprecated Use transformListing from transforms/listing.transform.ts for comprehensive transforms
 */
export function toUiListing(listing: Listing): UiListing {
  const metadata = listing.metadata || {};
  const location = metadata.location || {};

  // Use amenities as facilities (these are the display amenities)
  const amenities = metadata.amenities || [];
  const maxFacilities = 3;

  // Build location string - check ALL possible locations in order of preference:
  // API returns metadata.address as an OBJECT with {city, street, postalCode}
  // 1. metadata.address.* (object structure: {city, street, postalCode})
  // 2. metadata.location.* (nested location object)
  // 3. metadata.* (flat metadata structure - strings)
  // 4. Root level fields (if API returns them directly on listing)
  
  const listingAny = listing as unknown as Record<string, unknown>;
  
  // Handle metadata.address as object (API structure)
  const addressObj = metadata.address;
  const isAddressObject = addressObj && typeof addressObj === 'object' && !Array.isArray(addressObj);
  const addressObjTyped = isAddressObject ? addressObj as Record<string, unknown> : null;
  
  // Extract address components - prioritize object structure
  const street = 
    (addressObjTyped && typeof addressObjTyped.street === 'string' ? addressObjTyped.street : null) ||
    (addressObjTyped && typeof addressObjTyped.address === 'string' ? addressObjTyped.address : null) ||
    (typeof location.address === 'string' ? location.address : null) ||
    (typeof metadata.address === 'string' ? metadata.address : null) ||
    (typeof listingAny.address === 'string' ? listingAny.address : null) ||
    null;
    
  const postalCode = 
    (addressObjTyped && typeof addressObjTyped.postalCode === 'string' ? addressObjTyped.postalCode : null) ||
    (typeof location.postalCode === 'string' ? location.postalCode : null) ||
    (typeof metadata.postalCode === 'string' ? metadata.postalCode : null) ||
    (typeof listingAny.postalCode === 'string' ? listingAny.postalCode : null) ||
    null;
    
  const city = 
    (addressObjTyped && typeof addressObjTyped.city === 'string' ? addressObjTyped.city : null) ||
    (typeof location.city === 'string' ? location.city : null) ||
    (typeof metadata.city === 'string' ? metadata.city : null) ||
    (typeof listingAny.city === 'string' ? listingAny.city : null) ||
    null;

  // Filter out empty strings and build location parts
  // Prefer: street, postalCode, city (if street exists) OR city, postalCode (if no street)
  const locationParts: string[] = [];
  if (street) {
    locationParts.push(street);
    if (postalCode) locationParts.push(postalCode);
    if (city) locationParts.push(city);
  } else {
    // No street, use city and postalCode
    if (city) locationParts.push(city);
    if (postalCode) locationParts.push(postalCode);
  }
  
  const locationString = locationParts.length > 0 ? locationParts.join(', ') : 'Ukjent lokasjon';

  // Use listing type label as display type
  const displayType = getListingTypeLabelForCard(listing.type);

  const result: UiListing = {
    id: listing.id,
    name: listing.name,
    type: displayType,
    listingType: listing.type,
    location: locationString,
    description: listing.description || '',
    facilities: amenities.slice(0, maxFacilities),
    moreFacilities: Math.max(0, amenities.length - maxFacilities),
    capacity: listing.capacity || 0,
    price: listing.pricing?.basePrice || 0,
    priceUnit: mapPricingUnit(listing.pricing?.unit || 'hour'),
    currency: listing.pricing?.currency || 'NOK',
    rating: listing.averageRating || 0,
    reviewCount: listing.reviewCount || 0,
    available: listing.status === 'published',
    image: listing.images?.[0] || '/placeholder.jpg',
    images: listing.images || [],
    slug: listing.slug,
    openingHours: metadata.openingHours,
    rules: metadata.rules,
    faq: metadata.faq,
  };

  // Add coordinates if available
  if (location.lat !== undefined) {
    result.latitude = location.lat;
  }
  if (location.lng !== undefined) {
    result.longitude = location.lng;
  }

  return result;
}

/**
 * Transform multiple listings to UiListing (card format)
 * @deprecated Use transformListings from transforms/listing.transform.ts for comprehensive transforms
 */
export function toUiListings(listings: Listing[]): UiListing[] {
  return listings.map(toUiListing);
}
