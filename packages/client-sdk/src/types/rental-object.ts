/**
 * Rental Object Types
 * Primary type definitions for rental objects (utleieobjekter)
 * 
 * This is the unified type system for all rental object operations.
 * Uses the 4-category system: LOKALER_OG_BANER, UTSTYR_OG_INVENTAR, 
 * KJORETOY_OG_TRANSPORT, OPPLEVELSER_OG_ARRANGEMENT
 */

// =============================================================================
// Category Types
// =============================================================================

export type RentalObjectCategory =
  | 'LOKALER_OG_BANER'
  | 'UTSTYR_OG_INVENTAR'
  | 'KJORETOY_OG_TRANSPORT'
  | 'OPPLEVELSER_OG_ARRANGEMENT';

export type BookingTimeMode = 'PERIOD' | 'SLOT' | 'ALL_DAY';

export type RentalObjectStatus = 'draft' | 'published' | 'archived';

export type PricingUnit = 'hour' | 'day' | 'booking' | 'week' | 'month';

// =============================================================================
// Supporting Types
// =============================================================================

export interface RentalObjectPricing {
  basePrice: number;
  currency: string;
  unit: PricingUnit;
  weekendModifier?: number;
  memberDiscount?: number;
}

export interface RentalObjectLocation {
  address?: string;
  city?: string;
  postalCode?: string;
  municipality?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface InventoryFeature {
  enabled: boolean;
  total: number;
  policy?: 'FIFO' | 'CONCURRENT';
}

export interface SharedCapacityFeature {
  enabled: boolean;
  total: number;
  policy?: 'PER_SLOT' | 'PER_DAY';
}

export interface PackageDefinition {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  includedItems?: string[];
}

export interface PackagesFeature {
  enabled: boolean;
  items: PackageDefinition[];
}

export interface BookingFeatures {
  inventory?: InventoryFeature;
  sharedCapacity?: SharedCapacityFeature;
  packages?: PackagesFeature;
}

export interface RentalObjectRules {
  deposit?: {
    required: boolean;
    amount: number;
    currency?: string;
  };
  pickup?: {
    location: string;
    instructions?: string;
  };
  ageRequirement?: number;
  licenseRequired?: boolean;
  cancellation?: {
    hoursNotice: number;
    refundPercent: number;
  };
}

export interface RentalObjectMetadata {
  address?: string;
  city?: string;
  postalCode?: string;
  location?: RentalObjectLocation;
  amenities?: string[];
  /** @deprecated Use amenities instead. The term "facilities" is deprecated in favor of "amenities" for features/equipment. */
  facilities?: string[];
  openingHours?: Record<string, { open: string; close: string }>;
  rules?: string[];
  faq?: Array<{ id?: string; question: string; answer: string }>;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWebsite?: string;
}

// =============================================================================
// Rental Object Entity
// =============================================================================

export interface RentalObject {
  id: string;
  tenantId: string;
  organizationId?: string;
  name: string;
  slug: string;
  
  // Category system
  category: RentalObjectCategory;
  subcategory?: string;
  tags?: string[];
  
  // Booking configuration
  timeMode: BookingTimeMode;
  bookingFeatures?: BookingFeatures;
  
  // Common fields
  status: RentalObjectStatus;
  description?: string;
  images: string[];
  pricing?: RentalObjectPricing;
  capacity?: number;
  fixedLocation: boolean;
  location?: RentalObjectLocation;
  rules?: RentalObjectRules;
  metadata?: RentalObjectMetadata;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Aggregated fields (computed by backend)
  averageRating?: number;
  reviewCount?: number;
}

// =============================================================================
// DTOs
// =============================================================================

export interface CreateRentalObjectDTO {
  name: string;
  slug?: string;
  category: RentalObjectCategory;
  subcategory?: string;
  tags?: string[];
  timeMode?: BookingTimeMode;
  bookingFeatures?: BookingFeatures;
  description?: string;
  images?: string[];
  pricing?: Partial<RentalObjectPricing>;
  capacity?: number;
  fixedLocation?: boolean;
  location?: RentalObjectLocation;
  rules?: RentalObjectRules;
  organizationId?: string;
  metadata?: RentalObjectMetadata;
}

export interface UpdateRentalObjectDTO {
  name?: string;
  category?: RentalObjectCategory;
  subcategory?: string;
  tags?: string[];
  timeMode?: BookingTimeMode;
  bookingFeatures?: BookingFeatures;
  status?: RentalObjectStatus;
  description?: string;
  images?: string[];
  pricing?: Partial<RentalObjectPricing>;
  capacity?: number;
  fixedLocation?: boolean;
  location?: RentalObjectLocation;
  rules?: RentalObjectRules;
  metadata?: RentalObjectMetadata;
}

export interface RentalObjectQueryParams {
  category?: RentalObjectCategory;
  subcategory?: string;
  timeMode?: BookingTimeMode;
  status?: RentalObjectStatus;
  hasInventory?: boolean;
  hasSharedCapacity?: boolean;
  hasPackages?: boolean;
  search?: string;
  organizationId?: string;
  city?: string;
  municipality?: string;
  minCapacity?: number;
  maxCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'capacity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// =============================================================================
// Response Types
// =============================================================================

export interface RentalObjectsResponse {
  data: RentalObject[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RentalObjectResponse {
  data: RentalObject;
}

// =============================================================================
// UI Display Types
// =============================================================================

export interface UiRentalObject {
  id: string;
  name: string;
  category: RentalObjectCategory;
  categoryLabel: string;
  subcategory?: string;
  subcategoryLabel?: string;
  location: string;
  description: string;
  amenities: string[];
  moreAmenities: number;
  capacity: number;
  price: number;
  priceUnit: string;
  currency: string;
  rating: number;
  reviewCount: number;
  available: boolean;
  image: string;
  images: string[];
  slug?: string;
  timeMode: BookingTimeMode;
}

// =============================================================================
// Category Constants
// =============================================================================

export const RENTAL_OBJECT_CATEGORIES: RentalObjectCategory[] = [
  'LOKALER_OG_BANER',
  'UTSTYR_OG_INVENTAR',
  'KJORETOY_OG_TRANSPORT',
  'OPPLEVELSER_OG_ARRANGEMENT',
];

export const BOOKING_TIME_MODES: BookingTimeMode[] = ['PERIOD', 'SLOT', 'ALL_DAY'];

export const CATEGORY_LABELS: Record<RentalObjectCategory, string> = {
  LOKALER_OG_BANER: 'Lokaler og baner',
  UTSTYR_OG_INVENTAR: 'Utstyr og inventar',
  KJORETOY_OG_TRANSPORT: 'Kjøretøy og transport',
  OPPLEVELSER_OG_ARRANGEMENT: 'Opplevelser og arrangement',
};

export const TIME_MODE_LABELS: Record<BookingTimeMode, string> = {
  PERIOD: 'Tidsperiode',
  SLOT: 'Tidsluke',
  ALL_DAY: 'Heldags',
};

// =============================================================================
// Category Filter Options
// =============================================================================

export const CATEGORY_OPTIONS: Array<{ id: RentalObjectCategory | 'ALL'; label: string }> = [
  { id: 'ALL', label: 'Alle' },
  { id: 'LOKALER_OG_BANER', label: 'Lokaler og baner' },
  { id: 'UTSTYR_OG_INVENTAR', label: 'Utstyr og inventar' },
  { id: 'KJORETOY_OG_TRANSPORT', label: 'Kjøretøy og transport' },
  { id: 'OPPLEVELSER_OG_ARRANGEMENT', label: 'Opplevelser og arrangement' },
];

// =============================================================================
// Transform Functions
// =============================================================================

export function getCategoryLabel(category: RentalObjectCategory): string {
  return CATEGORY_LABELS[category] || category;
}

export function getTimeModeLabel(timeMode: BookingTimeMode): string {
  return TIME_MODE_LABELS[timeMode] || timeMode;
}

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

export function toUiRentalObject(obj: RentalObject): UiRentalObject {
  const metadata = obj.metadata || {};
  const location = obj.location || metadata.location || {};
  const amenities = metadata.amenities || [];
  const maxAmenities = 3;

  // Build location string
  const locationParts: string[] = [];
  if (location.address) locationParts.push(location.address);
  if (location.city) locationParts.push(location.city);
  if (location.postalCode) locationParts.push(location.postalCode);
  const locationString = locationParts.length > 0 ? locationParts.join(', ') : 'Ukjent lokasjon';

  return {
    id: obj.id,
    name: obj.name,
    category: obj.category,
    categoryLabel: getCategoryLabel(obj.category),
    subcategory: obj.subcategory,
    subcategoryLabel: obj.subcategory,
    location: locationString,
    description: obj.description || '',
    amenities: amenities.slice(0, maxAmenities),
    moreAmenities: Math.max(0, amenities.length - maxAmenities),
    capacity: obj.capacity || 0,
    price: obj.pricing?.basePrice || 0,
    priceUnit: mapPricingUnit((obj.pricing?.unit as PricingUnit) || 'hour'),
    currency: obj.pricing?.currency || 'NOK',
    rating: obj.averageRating || 0,
    reviewCount: obj.reviewCount || 0,
    available: obj.status === 'published',
    image: obj.images?.[0] || '/placeholder.jpg',
    images: obj.images || [],
    slug: obj.slug,
    timeMode: obj.timeMode,
  };
}

export function toUiRentalObjects(objects: RentalObject[]): UiRentalObject[] {
  return objects.map(toUiRentalObject);
}

// =============================================================================
// Availability Types
// =============================================================================

export interface RentalObjectAvailability {
  rentalObjectId: string;
  startDate: string;
  endDate: string;
  blockedSlots: Array<{
    startTime: string;
    endTime: string;
    status: string;
  }>;
}

export interface AvailabilityQueryParams {
  startDate: string;
  endDate: string;
  duration?: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  price?: number;
}

// =============================================================================
// Statistics Types
// =============================================================================

export interface RentalObjectStats {
  rentalObjectId: string;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  utilizationRate: number;
  lastBooking?: string;
}

// =============================================================================
// Calendar Configuration Types
// =============================================================================

export type CalendarGranularity = 'HOUR' | 'DAY' | 'WEEK';

export type BookingMode = 'single' | 'recurring' | 'in-game';

export interface BookingModeConfig {
  mode: BookingMode;
  enabled: boolean;
  labelKey: string;
  descriptionKey?: string;
  constraints: Record<string, unknown>;
}

export interface RentalObjectCalendarConfig {
  rentalObjectId: string;
  rentalObjectName: string;
  granularity: CalendarGranularity;
  bookingModes: BookingModeConfig[];
  defaultMode: BookingMode;
  operatingHours?: Record<string, { open: string; close: string }>;
  timezone: string;
  slotDurationMinutes: number;
  minSlots?: number;
  maxSlots?: number;
  allowSameDayBooking: boolean;
  leadTimeMinutes?: number;
  availableActions: Array<'VIEW' | 'BOOK' | 'RESERVE' | 'MANAGE'>;
  permissions: {
    canBook: boolean;
    canReserve: boolean;
    canViewPricing: boolean;
    canManageAvailability: boolean;
  };
}

// =============================================================================
// Public Query Types
// =============================================================================

export interface PublicRentalObjectParams {
  category?: RentalObjectCategory;
  subcategory?: string;
  timeMode?: BookingTimeMode;
  city?: string;
  municipality?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  date?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'capacity';
  sortOrder?: 'asc' | 'desc';
}

// =============================================================================
// City and Municipality Types
// =============================================================================

export interface City {
  name: string;
  slug: string;
  rentalObjectCount?: number;
}

export interface Municipality {
  code: string;
  name: string;
  county: string;
  rentalObjectCount?: number;
}

// =============================================================================
// Constants - Listing Type Labels and Options
// =============================================================================

/**
 * Legacy ListingType to Norwegian display labels
 * @deprecated Use RentalObjectCategory instead
 */
export const LISTING_TYPE_LABELS: Record<import('./enums').ListingType, string> = {
  SPACE: 'Lokale',
  RESOURCE: 'Ressurs',
  EVENT: 'Arrangement',
  SERVICE: 'Tjeneste',
  VEHICLE: 'Kjøretøy',
  OTHER: 'Annet',
};

/**
 * Legacy listing type filter options
 * @deprecated Use RentalObjectCategory instead
 */
export const LISTING_TYPE_OPTIONS: Array<{ id: import('./enums').ListingType | 'ALL'; label: string }> = [
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
