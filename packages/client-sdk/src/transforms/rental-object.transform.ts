/**
 * Rental Object Transform Utilities
 * Transform raw API data into UI-friendly formats
 * 
 * Note: All labels are returned as i18n translation keys.
 * Use your app's t() function to resolve them.
 */

import type { RentalObject, RentalObjectCategory, BookingTimeMode, PricingUnit } from '../types/rental-object';
import {
  RENTAL_OBJECT_CATEGORY_KEYS,
  TIME_MODE_KEYS,
  PRICING_UNIT_KEYS,
  PLACEHOLDER_KEYS,
} from '../localization/keys';

// =============================================================================
// Types
// =============================================================================

export interface TransformedAddress {
  street: string;
  postalCode: string;
  city: string;
  municipality: string;
  country: string;
  formatted: string;
  hasCoordinates: boolean;
  latitude: number | null;
  longitude: number | null;
}

export interface TransformedContact {
  name: string;
  email: string;
  phone: string;
  website: string;
  hasContact: boolean;
}

export interface TransformedOpeningHoursDay {
  day: string;
  dayIndex: number;
  open: string;
  close: string;
  display: string;
  isClosed: boolean;
}

export interface TransformedOpeningHours {
  days: TransformedOpeningHoursDay[];
  todayDisplay: string;
  isOpenNow: boolean;
}

export interface TransformedAmenity {
  id: string;
  name: string;
  icon: string;
}

export interface TransformedImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface TransformedPricing {
  basePrice: number;
  currency: string;
  unit: string;
  unitLabel: string;
  display: string;
  hasPricing: boolean;
}

export interface TransformedRentalObject {
  id: string;
  slug: string;
  name: string;
  category: RentalObjectCategory;
  categoryLabel: string;
  subcategory: string;
  subcategoryLabel: string;
  timeMode: BookingTimeMode;
  timeModeLabel: string;
  description: string;
  descriptionExcerpt: string;
  address: TransformedAddress;
  contact: TransformedContact;
  openingHours: TransformedOpeningHours;
  amenities: TransformedAmenity[];
  images: TransformedImage[];
  pricing: TransformedPricing;
  capacity: number;
  capacityLabel: string;
  rating: number;
  reviewCount: number;
  ratingDisplay: string;
  isAvailable: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Day Index Mappings (for sorting)
// =============================================================================

const DAY_INDICES: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

// =============================================================================
// Label Functions (return i18n keys)
// =============================================================================

/**
 * Get i18n key for rental object category label
 * Use t(key) to resolve the actual label
 */
export function getCategoryLabel(category: RentalObjectCategory): string {
  return RENTAL_OBJECT_CATEGORY_KEYS[category] ?? `sdk.rentalObject.category.${category}`;
}

/**
 * Get i18n key for time mode label
 * Use t(key) to resolve the actual label
 */
export function getTimeModeLabel(timeMode: BookingTimeMode): string {
  return TIME_MODE_KEYS[timeMode] ?? `sdk.timeMode.${timeMode}`;
}

/**
 * Get i18n key for pricing unit label
 * Use t(key) to resolve the actual label
 */
export function getPricingUnitLabel(unit: PricingUnit): string {
  return PRICING_UNIT_KEYS[unit] ?? `sdk.pricingUnit.${unit}`;
}

/**
 * Get i18n key for weekday label
 * Use t(key) to resolve the actual label
 */
export function getWeekdayLabel(day: string): string {
  const key = day.toLowerCase();
  return `sdk.weekday.${key}`;
}

// =============================================================================
// Transform Functions
// =============================================================================

export function transformAddress(obj: RentalObject): TransformedAddress {
  const location = obj.location || {};
  const metadata = obj.metadata || {};
  
  const street = location.address || '';
  const postalCode = location.postalCode || '';
  const city = location.city || '';
  const municipality = location.municipality || '';
  const country = location.country || '';
  
  const parts = [street, postalCode, city].filter(Boolean);
  // Return i18n key for placeholder when no address
  const formatted = parts.length > 0 ? parts.join(', ') : PLACEHOLDER_KEYS.noAddress;
  
  return {
    street,
    postalCode,
    city,
    municipality,
    country,
    formatted,
    hasCoordinates: !!(location.latitude && location.longitude),
    latitude: location.latitude || null,
    longitude: location.longitude || null,
  };
}

export function transformContact(obj: RentalObject): TransformedContact {
  const metadata = obj.metadata || {};
  
  return {
    name: metadata.contactName || '',
    email: metadata.contactEmail || '',
    phone: metadata.contactPhone || '',
    website: metadata.contactWebsite || '',
    hasContact: !!(metadata.contactName || metadata.contactEmail || metadata.contactPhone),
  };
}

export function transformOpeningHours(obj: RentalObject): TransformedOpeningHours {
  const metadata = obj.metadata || {};
  const rawHours = metadata.openingHours || {};
  
  const days: TransformedOpeningHoursDay[] = Object.entries(rawHours)
    .map(([day, times]) => {
      const typedTimes = times as { open?: string; close?: string };
      const dayLower = day.toLowerCase();
      const idx = DAY_INDICES[dayLower] ?? 0;
      const isClosed = !typedTimes.open || !typedTimes.close;
      return {
        day: getWeekdayLabel(dayLower), // Returns i18n key
        dayIndex: idx,
        open: typedTimes.open || '',
        close: typedTimes.close || '',
        display: isClosed ? 'sdk.placeholder.closed' : `${typedTimes.open} - ${typedTimes.close}`,
        isClosed,
      };
    })
    .sort((a, b) => a.dayIndex - b.dayIndex);
  
  const todayIndex = new Date().getDay();
  const todayHours = days.find(d => d.dayIndex === todayIndex);
  
  return {
    days,
    todayDisplay: todayHours?.display || '',
    isOpenNow: false, // Would need real-time calculation
  };
}

export function transformAmenities(obj: RentalObject): TransformedAmenity[] {
  const metadata = obj.metadata || {};
  const amenities = metadata.amenities || [];
  
  return amenities.map((name, i) => ({
    id: `amenity-${i}`,
    name,
    icon: 'check',
  }));
}

export function transformImages(obj: RentalObject): TransformedImage[] {
  const images = obj.images || [];
  
  return images.map((url, i) => ({
    id: `img-${i}`,
    url,
    thumbnailUrl: url,
    alt: `${obj.name} - bilde ${i + 1}`,
    isPrimary: i === 0,
    order: i,
  }));
}

export function transformPricing(obj: RentalObject): TransformedPricing {
  const pricing = obj.pricing ?? { basePrice: 0, currency: 'NOK', unit: 'hour' as const };
  const basePrice = pricing.basePrice ?? 0;
  const currency = pricing.currency ?? 'NOK';
  const unit = pricing.unit ?? 'hour';
  const unitLabel = getPricingUnitLabel(unit);
  
  return {
    basePrice,
    currency,
    unit,
    unitLabel,
    display: basePrice > 0 ? `${basePrice} ${currency}` : PLACEHOLDER_KEYS.priceNotSet,
    hasPricing: basePrice > 0,
  };
}

export function transformRentalObject(obj: RentalObject): TransformedRentalObject {
  const metadata = (obj.metadata ?? {}) as Record<string, unknown>;
  const description = obj.description || '';
  const capacity = obj.capacity || 0;
  const rating = obj.averageRating || 0;
  const reviewCount = obj.reviewCount || 0;
  
  return {
    id: obj.id,
    slug: obj.slug,
    name: obj.name,
    category: obj.category,
    categoryLabel: getCategoryLabel(obj.category),
    subcategory: obj.subcategory || '',
    subcategoryLabel: obj.subcategory || '',
    timeMode: obj.timeMode,
    timeModeLabel: getTimeModeLabel(obj.timeMode),
    description,
    descriptionExcerpt: description.length > 160 ? description.slice(0, 157) + '...' : description,
    address: transformAddress(obj),
    contact: transformContact(obj),
    openingHours: transformOpeningHours(obj),
    amenities: transformAmenities(obj),
    images: transformImages(obj),
    pricing: transformPricing(obj),
    capacity,
    capacityLabel: capacity > 0 ? `${capacity}` : '',
    rating,
    reviewCount,
    ratingDisplay: rating > 0 ? `${rating.toFixed(1)} (${reviewCount})` : PLACEHOLDER_KEYS.noReviews,
    isAvailable: obj.status === 'published',
    isFeatured: Boolean(metadata.featured),
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

export function transformRentalObjects(objects: RentalObject[]): TransformedRentalObject[] {
  return objects.map(transformRentalObject);
}
