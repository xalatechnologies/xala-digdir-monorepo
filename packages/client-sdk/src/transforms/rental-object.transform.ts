/**
 * Rental Object Transform Utilities
 * Transform raw API data into UI-friendly formats
 */

import type { RentalObject, RentalObjectCategory, BookingTimeMode, PricingUnit } from '../types/rental-object';

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
// Label Mappings
// =============================================================================

const CATEGORY_LABELS: Record<RentalObjectCategory, string> = {
  LOKALER_OG_BANER: 'Lokaler og baner',
  UTSTYR_OG_INVENTAR: 'Utstyr og inventar',
  KJORETOY_OG_TRANSPORT: 'Kjoeretoy og transport',
  OPPLEVELSER_OG_ARRANGEMENT: 'Opplevelser og arrangement',
};

const TIME_MODE_LABELS: Record<BookingTimeMode, string> = {
  PERIOD: 'Tidsperiode',
  SLOT: 'Tidsluke',
  ALL_DAY: 'Heldags',
};

const PRICING_UNIT_LABELS: Record<PricingUnit, string> = {
  hour: 'time',
  day: 'dag',
  booking: 'booking',
  week: 'uke',
  month: 'maned',
};

const DAY_LABELS: Record<string, [string, number]> = {
  monday: ['Mandag', 1],
  tuesday: ['Tirsdag', 2],
  wednesday: ['Onsdag', 3],
  thursday: ['Torsdag', 4],
  friday: ['Fredag', 5],
  saturday: ['Lordag', 6],
  sunday: ['Sondag', 0],
};

// =============================================================================
// Label Functions
// =============================================================================

export function getCategoryLabel(category: RentalObjectCategory): string {
  return CATEGORY_LABELS[category] || category;
}

export function getTimeModeLabel(timeMode: BookingTimeMode): string {
  return TIME_MODE_LABELS[timeMode] || timeMode;
}

export function getPricingUnitLabel(unit: PricingUnit): string {
  return PRICING_UNIT_LABELS[unit] || unit;
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
  const country = location.country || 'Norge';
  
  const parts = [street, postalCode, city].filter(Boolean);
  const formatted = parts.length > 0 ? parts.join(', ') : 'Ingen adresse';
  
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
      const [label, idx] = DAY_LABELS[day.toLowerCase()] || [day, 0];
      const isClosed = !typedTimes.open || !typedTimes.close;
      return {
        day: label,
        dayIndex: idx,
        open: typedTimes.open || '',
        close: typedTimes.close || '',
        display: isClosed ? 'Stengt' : `${typedTimes.open} - ${typedTimes.close}`,
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
  const pricing = obj.pricing || {};
  const basePrice = pricing.basePrice || 0;
  const currency = pricing.currency || 'NOK';
  const unit = pricing.unit || 'hour';
  const unitLabel = getPricingUnitLabel(unit);
  
  return {
    basePrice,
    currency,
    unit,
    unitLabel,
    display: basePrice > 0 ? `${basePrice} ${currency}/${unitLabel}` : 'Pris ikke oppgitt',
    hasPricing: basePrice > 0,
  };
}

export function transformRentalObject(obj: RentalObject): TransformedRentalObject {
  const metadata = obj.metadata || {};
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
    capacityLabel: capacity > 0 ? `${capacity} personer` : '',
    rating,
    reviewCount,
    ratingDisplay: rating > 0 ? `${rating.toFixed(1)} (${reviewCount} anmeldelser)` : 'Ingen anmeldelser',
    isAvailable: obj.status === 'published',
    isFeatured: Boolean(metadata.featured),
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

export function transformRentalObjects(objects: RentalObject[]): TransformedRentalObject[] {
  return objects.map(transformRentalObject);
}
