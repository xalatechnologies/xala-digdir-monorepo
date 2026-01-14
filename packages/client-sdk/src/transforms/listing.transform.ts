/**
 * Listing Transformers
 *
 * Reusable transformation utilities for listing data.
 * Used by web, backoffice, and minside apps.
 */

import type { Listing, ListingMetadata, ListingLocation, ListingType } from '../types/listing';

// =============================================================================
// UI Types for Transformed Listings
// =============================================================================

export interface TransformedAddress {
  street?: string;
  postalCode?: string;
  city?: string;
  municipality?: string;
  country?: string;
  formatted: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface TransformedContact {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
}

export interface TransformedOpeningHoursDay {
  day: string;
  dayIndex: number;
  open?: string;
  close?: string;
  hours: string;
  isClosed: boolean;
}

export interface TransformedOpeningHours {
  regular: TransformedOpeningHoursDay[];
  exceptions?: Array<{
    date: string;
    label?: string;
    hours?: string;
    isClosed: boolean;
  }>;
}

export interface TransformedAmenity {
  id: string;
  name: string;
  icon?: string;
  category?: string;
}

export interface TransformedFacility {
  id: string;
  name: string;
  quantity?: number;
  description?: string;
}

export interface TransformedRule {
  id: string;
  title: string;
  content: string;
  category?: string;
}

export interface TransformedFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface TransformedImage {
  id: string;
  url: string;
  alt?: string;
  thumbnail?: string;
  isPrimary?: boolean;
  order?: number;
}

export interface TransformedKeyFacts {
  capacity?: number;
  capacityLabel?: string;
  area?: number;
  areaUnit?: string;
  quantity?: number;
  type: string;
  typeLabel: string;
}

export interface TransformedPricing {
  basePrice: number;
  currency: string;
  unit: string;
  unitLabel: string;
  displayPrice: string;
}

export interface TransformedListing {
  // Core
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  type: ListingType;
  typeLabel: string;
  status: string;
  description?: string;

  // Media
  images: TransformedImage[];
  primaryImage?: TransformedImage;

  // Location
  address: TransformedAddress;

  // Contact
  contact?: TransformedContact;

  // Schedule
  openingHours: TransformedOpeningHours;

  // Features
  amenities: TransformedAmenity[];
  facilities: TransformedFacility[];
  highlights: string[];

  // Content
  rules: TransformedRule[];
  faq: TransformedFAQ[];

  // Key Facts
  keyFacts: TransformedKeyFacts;

  // Pricing
  pricing?: TransformedPricing;

  // Reviews
  averageRating?: number;
  reviewCount?: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Transform Utilities
// =============================================================================

const LISTING_TYPE_LABELS: Record<string, string> = {
  SPACE: 'Lokale',
  RESOURCE: 'Ressurs',
  EVENT: 'Arrangement',
  SERVICE: 'Tjeneste',
  VEHICLE: 'Kjøretøy',
  FACILITY: 'Anlegg',
  EQUIPMENT: 'Utstyr',
  OTHER: 'Annet',
};

const PRICING_UNIT_LABELS: Record<string, string> = {
  hour: 'time',
  day: 'dag',
  booking: 'booking',
  week: 'uke',
  month: 'måned',
};

const DAY_MAP: Record<string, [string, number]> = {
  monday: ['Mandag', 1],
  tuesday: ['Tirsdag', 2],
  wednesday: ['Onsdag', 3],
  thursday: ['Torsdag', 4],
  friday: ['Fredag', 5],
  saturday: ['Lørdag', 6],
  sunday: ['Søndag', 0],
};

/**
 * Get display label for listing type
 */
export function getListingTypeLabel(type: ListingType | string): string {
  return LISTING_TYPE_LABELS[type] || type;
}

/**
 * Get display label for pricing unit
 */
export function getPricingUnitLabel(unit: string): string {
  return PRICING_UNIT_LABELS[unit] || unit;
}

/**
 * Transform address from listing
 */
export function transformAddress(listing: Listing): TransformedAddress {
  const location = listing.location;
  const meta = listing.metadata || {};

  // Build address parts from multiple sources
  const street = listing.address || location?.address || meta.address || '';
  const postalCode = location?.postalCode || meta.postalCode || '';
  const city = location?.city || meta.city || '';
  const municipality = location?.municipality || '';
  const country = location?.country || '';

  // Get coordinates (support both lat/lng and latitude/longitude)
  const lat = location?.lat ?? location?.latitude ?? meta.location?.lat ?? meta.location?.latitude;
  const lng = location?.lng ?? location?.longitude ?? meta.location?.lng ?? meta.location?.longitude;

  // Build formatted address
  const parts = [street, postalCode, city].filter(Boolean);
  const formatted = parts.length > 0 ? parts.join(', ') : '';

  return {
    street,
    postalCode,
    city,
    municipality,
    country,
    formatted,
    ...(typeof lat === 'number' && typeof lng === 'number'
      ? { coordinates: { latitude: lat, longitude: lng } }
      : {}),
  };
}

/**
 * Transform contact info from listing metadata
 */
export function transformContact(metadata?: ListingMetadata): TransformedContact | undefined {
  if (!metadata) return undefined;

  const { contactName, contactEmail, contactPhone, contactWebsite } = metadata;

  if (!contactName && !contactEmail && !contactPhone && !contactWebsite) {
    return undefined;
  }

  return {
    ...(contactName ? { name: contactName } : {}),
    ...(contactEmail ? { email: contactEmail } : {}),
    ...(contactPhone ? { phone: contactPhone } : {}),
    ...(contactWebsite ? { website: contactWebsite } : {}),
  };
}

/**
 * Transform opening hours from metadata
 */
export function transformOpeningHours(
  openingHours?: Record<string, { open: string; close: string }>
): TransformedOpeningHours {
  if (!openingHours) {
    return { regular: [] };
  }

  const regular: TransformedOpeningHoursDay[] = Object.entries(openingHours)
    .map(([day, times]) => {
      const [dayLabel, dayIndex] = DAY_MAP[day.toLowerCase()] || [day, 0];
      const isClosed = !times.open || !times.close;
      const hours = isClosed ? 'Stengt' : `${times.open} - ${times.close}`;

      return {
        day: dayLabel,
        dayIndex,
        open: times.open,
        close: times.close,
        hours,
        isClosed,
      };
    })
    .sort((a, b) => a.dayIndex - b.dayIndex);

  return { regular };
}

/**
 * Transform amenities from metadata
 */
export function transformAmenities(metadata?: ListingMetadata): TransformedAmenity[] {
  if (!metadata) return [];

  // Combine amenities and facilities, prefer amenities
  const items = metadata.amenities || metadata.facilities || [];

  return items.map((name, index) => ({
    id: `amenity-${index}`,
    name,
    category: 'general',
  }));
}

/**
 * Transform included facilities/equipment from metadata
 */
export function transformFacilities(metadata?: ListingMetadata): TransformedFacility[] {
  if (!metadata) return [];

  // Check for includedEquipment in metadata (cast to any for flexibility)
  const metaAny = metadata as Record<string, unknown>;
  const equipment = metaAny.includedEquipment as Array<{
    name: string;
    quantity?: number;
    description?: string;
  }> | undefined;

  if (!equipment) return [];

  return equipment.map((item, index) => ({
    id: `facility-${index}`,
    name: item.name,
    ...(item.quantity !== undefined ? { quantity: item.quantity } : {}),
    ...(item.description ? { description: item.description } : {}),
  }));
}

/**
 * Transform rules from metadata
 */
export function transformRules(metadata?: ListingMetadata): TransformedRule[] {
  if (!metadata) return [];

  // Check for guidelines or rules (cast to any for flexibility)
  const metaAny = metadata as Record<string, unknown>;
  const rulesRaw = (metaAny.guidelines || metaAny.rules || metadata.rules || []) as Array<
    { id?: string; title?: string; content?: string } | string
  >;

  return rulesRaw.map((rule, index) => {
    if (typeof rule === 'string') {
      return { id: `rule-${index}`, title: rule, content: rule };
    }
    return {
      id: rule.id || `rule-${index}`,
      title: rule.title || '',
      content: rule.content || '',
    };
  });
}

/**
 * Transform FAQ from metadata
 */
export function transformFAQ(metadata?: ListingMetadata): TransformedFAQ[] {
  if (!metadata?.faq) return [];

  return metadata.faq.map((item, index) => ({
    id: item.id || `faq-${index}`,
    question: item.question,
    answer: item.answer,
  }));
}

/**
 * Transform images
 */
export function transformImages(images: string[], listingName: string): TransformedImage[] {
  return images.map((url, index) => ({
    id: `image-${index}`,
    url,
    alt: `${listingName} - bilde ${index + 1}`,
    thumbnail: url,
    isPrimary: index === 0,
    order: index,
  }));
}

/**
 * Transform pricing
 */
export function transformPricing(listing: Listing): TransformedPricing | undefined {
  if (!listing.pricing?.basePrice) return undefined;

  const unit = listing.pricing.unit || 'hour';
  const unitLabel = getPricingUnitLabel(unit);
  const currency = listing.pricing.currency || 'NOK';

  return {
    basePrice: listing.pricing.basePrice,
    currency,
    unit,
    unitLabel,
    displayPrice: `${listing.pricing.basePrice} ${currency}/${unitLabel}`,
  };
}

/**
 * Transform key facts
 */
export function transformKeyFacts(listing: Listing): TransformedKeyFacts {
  return {
    ...(listing.capacity ? { capacity: listing.capacity, capacityLabel: `${listing.capacity} personer` } : {}),
    ...(listing.quantity ? { quantity: listing.quantity } : {}),
    type: listing.type,
    typeLabel: getListingTypeLabel(listing.type),
  };
}

/**
 * Get highlights from metadata
 */
export function getHighlights(metadata?: ListingMetadata): string[] {
  if (!metadata) return [];
  const metaAny = metadata as Record<string, unknown>;
  return (metaAny.highlights as string[]) || [];
}

// =============================================================================
// Main Transform Function
// =============================================================================

/**
 * Transform a raw API listing to a UI-friendly format
 *
 * @param listing - Raw listing from API
 * @returns Transformed listing with all data properly formatted
 */
export function transformListing(listing: Listing): TransformedListing {
  const images = transformImages(listing.images || [], listing.name);

  return {
    // Core
    id: listing.id,
    tenantId: listing.tenantId,
    name: listing.name,
    slug: listing.slug,
    type: listing.type,
    typeLabel: getListingTypeLabel(listing.type),
    status: listing.status,
    description: listing.description,

    // Media
    images,
    primaryImage: images[0],

    // Location
    address: transformAddress(listing),

    // Contact
    contact: transformContact(listing.metadata),

    // Schedule
    openingHours: transformOpeningHours(listing.metadata?.openingHours),

    // Features
    amenities: transformAmenities(listing.metadata),
    facilities: transformFacilities(listing.metadata),
    highlights: getHighlights(listing.metadata),

    // Content
    rules: transformRules(listing.metadata),
    faq: transformFAQ(listing.metadata),

    // Key Facts
    keyFacts: transformKeyFacts(listing),

    // Pricing
    pricing: transformPricing(listing),

    // Reviews
    averageRating: listing.averageRating,
    reviewCount: listing.reviewCount,

    // Timestamps
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
  };
}

/**
 * Transform multiple listings
 */
export function transformListings(listings: Listing[]): TransformedListing[] {
  return listings.map(transformListing);
}
