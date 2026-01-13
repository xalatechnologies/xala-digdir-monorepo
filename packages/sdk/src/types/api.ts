/**
 * API Types
 * Type definitions for Digilist API responses
 */

// =============================================================================
// Enums
// =============================================================================

export type ListingType = 'SPACE' | 'RESOURCE' | 'EVENT' | 'SERVICE' | 'VEHICLE' | 'OTHER';
export type ListingStatus = 'draft' | 'published' | 'archived';
export type PricingUnit = 'hour' | 'day' | 'booking' | 'week' | 'month';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

// =============================================================================
// API Response Types
// =============================================================================

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Single item response wrapper
 */
export interface SingleResponse<T> {
  data: T;
}

// =============================================================================
// Domain Types (API Schema)
// =============================================================================

/**
 * Pricing information
 */
export interface Pricing {
  basePrice: number;
  currency: string;
  unit: PricingUnit;
  weekendModifier?: number;
  memberDiscount?: number;
}

/**
 * Tenant
 */
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive' | 'suspended';
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Listing (API response shape)
 */
export interface Listing {
  id: string;
  tenantId: string;
  organizationId?: string | null;
  name: string;
  slug: string;
  type: ListingType;
  status: ListingStatus;
  description?: string | null;
  images: string[];
  pricing: Pricing;
  capacity?: number | null;
  metadata: ListingMetadata;
  createdAt: string;
  updatedAt: string;
}

/**
 * Listing metadata (flexible schema for additional data)
 */
export interface ListingMetadata {
  // Location
  address?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  
  // Category
  category?: string;
  subcategory?: string;
  
  // Facilities
  facilities?: string[];
  
  // Ratings
  rating?: number;
  reviewCount?: number;
  
  // Availability
  openingHours?: Record<string, { open: string; close: string }>;
  
  // Custom fields
  [key: string]: unknown;
}

/**
 * Booking
 */
export interface Booking {
  id: string;
  tenantId: string;
  listingId: string;
  userId: string;
  status: BookingStatus;
  startTime: string;
  endTime: string;
  totalPrice: number;
  currency: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  
  // Relations (optional, depends on API response)
  listing?: Listing;
  user?: User;
}

/**
 * User
 */
export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Query Parameters
// =============================================================================

export interface ListingQueryParams {
  organizationId?: string;
  type?: ListingType;
  status?: ListingStatus;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface BookingQueryParams {
  listingId?: string;
  userId?: string;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// =============================================================================
// Create/Update DTOs
// =============================================================================

export interface CreateListingDTO {
  name: string;
  slug?: string;
  organizationId?: string;
  type?: ListingType;
  description?: string;
  images?: string[];
  pricing?: Partial<Pricing>;
  capacity?: number;
  metadata?: Partial<ListingMetadata>;
}

export interface UpdateListingDTO {
  name?: string;
  type?: ListingType;
  description?: string | null;
  images?: string[];
  pricing?: Partial<Pricing>;
  capacity?: number | null;
  metadata?: Partial<ListingMetadata>;
}

export interface CreateBookingDTO {
  listingId: string;
  startTime: string;
  endTime: string;
  notes?: string;
  metadata?: Record<string, unknown>;
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
    type: metadata.category || listing.type,
    listingType: listing.type,
    location: metadata.address || metadata.city || 'Unknown',
    description: listing.description || '',
    facilities: facilities.slice(0, maxFacilities),
    moreFacilities: Math.max(0, facilities.length - maxFacilities),
    capacity: listing.capacity || 0,
    price: listing.pricing?.basePrice || 0,
    priceUnit: mapPricingUnit(listing.pricing?.unit || 'hour'),
    rating: metadata.rating || 0,
    reviewCount: metadata.reviewCount || 0,
    available: listing.status === 'published',
    image: listing.images?.[0] || '/placeholder.jpg',
  };

  // Only add optional properties if they have values
  if (metadata.latitude !== undefined) {
    result.latitude = metadata.latitude;
  }
  if (metadata.longitude !== undefined) {
    result.longitude = metadata.longitude;
  }

  return result;
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
 * Transform multiple listings
 */
export function transformListings(listings: Listing[]): UiListing[] {
  return listings.map(transformListing);
}
