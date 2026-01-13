/**
 * Listing Types
 * Single Responsibility: All listing-related type definitions
 */

import type { TenantEntity, ListingType, ListingStatus, BookingModel, PricingUnit, BaseQueryParams } from './enums';

// =============================================================================
// Listing Entity
// =============================================================================

export interface ListingPricing {
  basePrice: number;
  currency: string;
  unit: PricingUnit;
  weekendMultiplier?: number;
  peakHoursMultiplier?: number;
  // Computed/alias field
  hourlyRate?: number;
}

export interface ListingLocation {
  lat?: number;
  lng?: number;
  city?: string;
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
  faq?: Array<{ question: string; answer: string }>;
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
  metadata?: ListingMetadata;
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
// UI Types (Transformed for components)
// =============================================================================

/**
 * UI-friendly listing type (matches @xala/ds ListingCard props)
 */
export interface UiListing {
  id: string;
  name: string;
  type: string;
  listingType: ListingType;
  location: string;
  description: string;
  facilities: string[];
  moreFacilities: number;
  capacity: number;
  price: number;
  priceUnit: string;
  rating: number;
  reviewCount: number;
  available: boolean;
  image: string;
  latitude?: number;
  longitude?: number;
  slug?: string;
}

/**
 * Map API pricing unit to Norwegian display string
 */
function mapPricingUnit(unit: PricingUnit): string {
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
 * Transform API Listing to UI Listing
 */
export function transformListing(listing: Listing): UiListing {
  const metadata = listing.metadata || {};
  const facilities = metadata.facilities || [];
  const maxFacilities = 3;

  const result: UiListing = {
    id: listing.id,
    name: listing.name,
    type: metadata.amenities?.[0] || listing.type,
    listingType: listing.type,
    location: metadata.address || metadata.city || 'Unknown',
    description: listing.description || '',
    facilities: facilities.slice(0, maxFacilities),
    moreFacilities: Math.max(0, facilities.length - maxFacilities),
    capacity: listing.capacity || 0,
    price: listing.pricing?.basePrice || 0,
    priceUnit: mapPricingUnit(listing.pricing?.unit || 'hour'),
    rating: 0, // Not in metadata yet
    reviewCount: 0, // Not in metadata yet
    available: listing.status === 'published',
    image: listing.images?.[0] || '/placeholder.jpg',
    slug: listing.slug,
  };

  // Only add optional properties if they have values
  if (metadata.location?.lat !== undefined) {
    result.latitude = metadata.location.lat;
  }
  if (metadata.location?.lng !== undefined) {
    result.longitude = metadata.location.lng;
  }

  return result;
}

/**
 * Transform multiple listings
 */
export function transformListings(listings: Listing[]): UiListing[] {
  return listings.map(transformListing);
}
