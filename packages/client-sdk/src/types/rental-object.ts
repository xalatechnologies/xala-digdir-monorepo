/**
 * Rental Object Types
 * Type definitions for the 4-category rental objects system
 */

import type {
  BookingTimeMode,
  PricingUnit,
  InventoryFeature,
  SharedCapacityFeature,
  PackageDefinition,
  PackagesFeature,
} from './enums';

// Note: BookingTimeMode, PricingUnit, etc. are NOT re-exported here
// as they are already exported from './enums'

// =============================================================================
// Category Types
// =============================================================================

export type RentalObjectCategory =
  | 'LOKALER_OG_BANER'
  | 'UTSTYR_OG_INVENTAR'
  | 'KJORETOY_OG_TRANSPORT'
  | 'OPPLEVELSER_OG_ARRANGEMENT';

export type RentalObjectStatus = 'draft' | 'published' | 'archived';

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

// Note: InventoryFeature, SharedCapacityFeature, PackageDefinition, PackagesFeature
// are imported from './enums' to avoid duplicate exports

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
  facilities?: string[];
  amenities?: string[];
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

// Note: mapPricingUnit is already exported from listing.ts
// This is a local copy for use within rental-object transformations
function mapPricingUnitLocal(unit: PricingUnit): string {
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
  const maxFacilities = 3;

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
    facilities: amenities.slice(0, maxFacilities),
    moreFacilities: Math.max(0, amenities.length - maxFacilities),
    capacity: obj.capacity || 0,
    price: obj.pricing?.basePrice || 0,
    priceUnit: mapPricingUnitLocal((obj.pricing?.unit as PricingUnit) || 'hour'),
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
