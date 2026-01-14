/**
 * Listing Projections - API-Side Data Transformation
 *
 * These functions convert raw database entities to screen-ready projection DTOs.
 * The transformation happens ONCE in the API, ensuring consistent data for all frontends.
 *
 * DESIGN PRINCIPLES:
 * - FLAT output (no nested objects for frontends to traverse)
 * - DISPLAY-READY values (labels, formatted strings)
 * - NULL-SAFE (defaults for missing data)
 * - CONSISTENT (same structure for web, backoffice, minside)
 */

// =============================================================================
// TYPE DEFINITIONS (Local - matches SDK's projection-dtos.ts)
// =============================================================================

export interface ListingCardProjectionDTO {
  // Identity
  id: string;
  slug: string;
  name: string;
  tenantId: string;

  // Type
  type: string;
  typeLabel: string;

  // Location (Display-Ready)
  locationFormatted: string;
  city: string;
  latitude: number | null;
  longitude: number | null;

  // Media
  primaryImageUrl: string;
  primaryImageThumbnail: string;
  primaryImageAlt: string;
  imageCount: number;

  // Pricing
  priceAmount: number;
  priceCurrency: string;
  priceUnit: string;
  priceDisplay: string;

  // Capacity
  capacity: number;
  capacityLabel: string;

  // Features (top 3 for cards)
  amenities: string[];
  moreAmenitiesCount: number;

  // Rating
  averageRating: number;
  reviewCount: number;
  ratingDisplay: string;

  // Status
  isAvailable: boolean;
  isFeatured: boolean;
}

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

export interface ListingDetailsProjectionDTO extends ListingCardProjectionDTO {
  // Description
  description: string;
  descriptionExcerpt: string;

  // All images
  images: ListingImageDTO[];

  // Full address
  addressStreet: string;
  addressPostalCode: string;
  addressCity: string;
  addressMunicipality: string;
  addressCountry: string;

  // Contact
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactWebsite: string;

  // All amenities
  allAmenities: ListingAmenityDTO[];

  // Equipment
  includedEquipment: ListingEquipmentDTO[];

  // Additional services
  additionalServices: ListingAdditionalServiceDTO[];

  // Opening hours
  openingHours: ListingOpeningHoursDTO[];
  isOpenNow: boolean;
  todayHoursDisplay: string;

  // Rules & FAQ (for tabs)
  rules: ListingRuleDTO[];
  faq: ListingFaqDTO[];
  highlights: string[];

  // Events (for calendar tab)
  upcomingEvents: ListingEventDTO[];

  // Booking config (for booking widget)
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

  // Permissions (API-Computed)
  canBook: boolean;
  canEdit: boolean;
  canViewPricing: boolean;
  availableActions: string[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// LABEL MAPPINGS (Norwegian)
// =============================================================================

const TYPE_LABELS: Record<string, string> = {
  SPACE: 'Lokale',
  RESOURCE: 'Utstyr',
  EVENT: 'Arrangement',
  SERVICE: 'Tjeneste',
  VEHICLE: 'Kjøretøy',
  FACILITY: 'Anlegg',
  EQUIPMENT: 'Utstyr',
  OTHER: 'Annet',
};

const UNIT_LABELS: Record<string, string> = {
  hour: 'time',
  day: 'dag',
  booking: 'booking',
  week: 'uke',
  month: 'måned',
};

const DAY_LABELS: Record<string, [string, number]> = {
  monday: ['Mandag', 1],
  tuesday: ['Tirsdag', 2],
  wednesday: ['Onsdag', 3],
  thursday: ['Torsdag', 4],
  friday: ['Fredag', 5],
  saturday: ['Lørdag', 6],
  sunday: ['Søndag', 0],
};

// =============================================================================
// RAW DB TYPE (matches Drizzle schema)
// =============================================================================

interface DbListing {
  id: string;
  tenantId: string;
  organizationId?: string | null;
  name: string;
  slug: string;
  type: string;
  status: string;
  description?: string | null;
  images?: string[] | null;
  pricing?: {
    basePrice?: number;
    currency?: string;
    unit?: string;
  } | null;
  capacity?: number | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getTypeLabel(type: string): string {
  return TYPE_LABELS[type] || type;
}

function getUnitLabel(unit: string): string {
  return UNIT_LABELS[unit] || unit;
}

function safeString(val: unknown): string {
  return typeof val === 'string' ? val : '';
}

function safeNumber(val: unknown): number {
  return typeof val === 'number' ? val : 0;
}

function safeArray<T>(val: unknown): T[] {
  return Array.isArray(val) ? val : [];
}

function formatLocation(listing: DbListing): { formatted: string; city: string } {
  const meta = listing.metadata || {};
  const location = (meta.location || {}) as Record<string, unknown>;
  const addr = (meta.address && typeof meta.address === 'object' ? meta.address : {}) as Record<string, string>;

  const street = safeString(addr.street) || safeString(location.address) || '';
  const postalCode = safeString(addr.postalCode) || safeString(location.postalCode) || safeString(meta.postalCode) || '';
  const city = safeString(addr.city) || safeString(location.city) || safeString(meta.city) || '';

  const parts = [street, postalCode, city].filter(Boolean);
  const formatted = parts.length > 0 ? parts.join(', ') : 'Ingen adresse';

  return { formatted, city: city || 'Ukjent' };
}

function getCoordinates(listing: DbListing): { lat: number | null; lng: number | null } {
  const meta = listing.metadata || {};
  const location = (meta.location || {}) as Record<string, unknown>;

  const lat = safeNumber(location.lat) || safeNumber(location.latitude) || null;
  const lng = safeNumber(location.lng) || safeNumber(location.longitude) || null;

  // Only return if both are valid numbers
  if (lat && lng && lat !== 0 && lng !== 0) {
    return { lat, lng };
  }
  return { lat: null, lng: null };
}

function getPrimaryImage(listing: DbListing): { url: string; thumbnail: string; alt: string } {
  const images = safeArray<string>(listing.images);
  const primaryUrl = images[0] || '';

  return {
    url: primaryUrl,
    thumbnail: primaryUrl, // Could add thumbnail generation later
    alt: primaryUrl ? `${listing.name} - bilde` : 'Ingen bilde',
  };
}

function getAmenities(listing: DbListing, maxCount: number = 3): { visible: string[]; moreCount: number } {
  const meta = listing.metadata || {};
  const all = safeArray<string>(meta.amenities) || safeArray<string>(meta.facilities);

  return {
    visible: all.slice(0, maxCount),
    moreCount: Math.max(0, all.length - maxCount),
  };
}

function formatRating(rating?: number, count?: number): string {
  if (!rating || !count) return 'Ingen anmeldelser';
  return `${rating.toFixed(1)} (${count} anmeldelser)`;
}

function formatPrice(pricing?: DbListing['pricing']): {
  amount: number;
  currency: string;
  unit: string;
  display: string;
} {
  const amount = pricing?.basePrice || 0;
  const currency = pricing?.currency || 'NOK';
  const unit = pricing?.unit || 'hour';
  const unitLabel = getUnitLabel(unit);

  return {
    amount,
    currency,
    unit,
    display: amount > 0 ? `${amount} ${currency}/${unitLabel}` : 'Pris ikke oppgitt',
  };
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} minutter`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return hours === 1 ? '1 time' : `${hours} timer`;
  return `${hours}t ${mins}m`;
}

// =============================================================================
// MAIN PROJECTION FUNCTIONS
// =============================================================================

/**
 * Convert a database Listing to a flat, screen-ready ListingCardProjectionDTO
 */
export function toCardProjection(listing: DbListing): ListingCardProjectionDTO {
  const location = formatLocation(listing);
  const coords = getCoordinates(listing);
  const image = getPrimaryImage(listing);
  const { visible: amenities, moreCount } = getAmenities(listing);
  const price = formatPrice(listing.pricing);
  const capacity = listing.capacity || 0;
  const meta = listing.metadata || {};

  // Rating comes from metadata (computed/cached field)
  const avgRating = safeNumber(meta.averageRating);
  const revCount = safeNumber(meta.reviewCount);

  return {
    // Identity
    id: listing.id,
    slug: listing.slug,
    name: listing.name,
    tenantId: listing.tenantId,

    // Type
    type: listing.type,
    typeLabel: getTypeLabel(listing.type),

    // Location
    locationFormatted: location.formatted,
    city: location.city,
    latitude: coords.lat,
    longitude: coords.lng,

    // Media
    primaryImageUrl: image.url,
    primaryImageThumbnail: image.thumbnail,
    primaryImageAlt: image.alt,
    imageCount: safeArray(listing.images).length,

    // Pricing
    priceAmount: price.amount,
    priceCurrency: price.currency,
    priceUnit: price.unit,
    priceDisplay: price.display,

    // Capacity
    capacity,
    capacityLabel: capacity > 0 ? `${capacity} personer` : '',

    // Features
    amenities,
    moreAmenitiesCount: moreCount,

    // Rating (from metadata cache)
    averageRating: avgRating,
    reviewCount: revCount,
    ratingDisplay: formatRating(avgRating, revCount),

    // Status
    isAvailable: listing.status === 'published',
    isFeatured: Boolean(meta.featured),
  };
}

/**
 * Convert a database Listing to a full ListingDetailsProjectionDTO
 */
export function toDetailsProjection(
  listing: DbListing,
  options: { canBook?: boolean; canEdit?: boolean; canViewPricing?: boolean } = {}
): ListingDetailsProjectionDTO {
  const card = toCardProjection(listing);
  const meta = listing.metadata || {};
  const location = (meta.location || {}) as Record<string, unknown>;
  const addr = (meta.address && typeof meta.address === 'object' ? meta.address : {}) as Record<string, string>;

  // All images
  const images: ListingImageDTO[] = safeArray<string>(listing.images).map((url, index) => ({
    id: `img-${index}`,
    url,
    thumbnailUrl: url,
    alt: `${listing.name} - bilde ${index + 1}`,
    isPrimary: index === 0,
    order: index,
  }));

  // All amenities
  const rawAmenities = safeArray<string>(meta.amenities) || safeArray<string>(meta.facilities);
  const allAmenities: ListingAmenityDTO[] = rawAmenities.map((name, i) => ({
    id: `amenity-${i}`,
    name,
    icon: 'check',
    category: 'general',
  }));

  // Equipment
  const rawEquipment = safeArray<{ name: string; quantity?: number; description?: string }>(meta.includedEquipment);
  const includedEquipment: ListingEquipmentDTO[] = rawEquipment.map((item, i) => ({
    id: `equip-${i}`,
    name: item.name || '',
    quantity: item.quantity || 1,
    description: item.description || '',
  }));

  // Additional services
  const rawServices = safeArray<{ name: string; price?: number; description?: string; optional?: boolean }>(meta.additionalServices);
  const additionalServices: ListingAdditionalServiceDTO[] = rawServices.map((svc, i) => ({
    id: `svc-${i}`,
    name: svc.name || '',
    description: svc.description || '',
    price: svc.price || 0,
    currency: listing.pricing?.currency || 'NOK',
    priceDisplay: svc.price ? `${svc.price} ${listing.pricing?.currency || 'NOK'}` : 'Inkludert',
    isOptional: svc.optional !== false,
  }));

  // Opening hours
  const rawHours = (meta.openingHours || {}) as Record<string, { open?: string; close?: string }>;
  const openingHours: ListingOpeningHoursDTO[] = Object.entries(rawHours)
    .map(([day, times]) => {
      const [label, idx] = DAY_LABELS[day.toLowerCase()] || [day, 0];
      const isClosed = !times.open || !times.close;
      return {
        day: label,
        dayIndex: idx,
        openTime: times.open || '',
        closeTime: times.close || '',
        hoursDisplay: isClosed ? 'Stengt' : `${times.open} - ${times.close}`,
        isClosed,
      };
    })
    .sort((a, b) => a.dayIndex - b.dayIndex);

  // Today's hours
  const todayIndex = new Date().getDay();
  const todayHours = openingHours.find(h => h.dayIndex === todayIndex);

  // Rules
  const rawRules = safeArray<{ id?: string; title?: string; content?: string } | string>(
    meta.guidelines || meta.rules
  );
  const rules: ListingRuleDTO[] = rawRules.map((r, i) =>
    typeof r === 'string'
      ? { id: `rule-${i}`, title: r, content: r }
      : { id: r.id || `rule-${i}`, title: r.title || '', content: r.content || '' }
  );

  // FAQ
  const rawFaq = safeArray<{ question: string; answer: string }>(meta.faq);
  const faq: ListingFaqDTO[] = rawFaq.map((item, i) => ({
    id: `faq-${i}`,
    question: item.question || '',
    answer: item.answer || '',
  }));

  // Events
  const rawEvents = safeArray<{ id?: string; title: string; startDate: string; endDate?: string; description?: string }>(meta.events);
  const upcomingEvents: ListingEventDTO[] = rawEvents.map((evt, i) => ({
    id: evt.id || `evt-${i}`,
    title: evt.title || '',
    startDate: evt.startDate || '',
    endDate: evt.endDate || evt.startDate || '',
    description: evt.description || '',
  }));

  // Booking config
  const bookingConfig = (meta.bookingConfig || {}) as Record<string, unknown>;
  const minDuration = safeNumber(bookingConfig.minDuration) || 60;
  const maxDuration = safeNumber(bookingConfig.maxDuration) || 480;
  const advanceDays = safeNumber(bookingConfig.advanceBookingDays) || 7;

  // Description excerpt
  const description = listing.description || '';
  const descriptionExcerpt = description.length > 160 ? description.slice(0, 157) + '...' : description;

  return {
    ...card,

    // Description
    description,
    descriptionExcerpt,

    // All images
    images,

    // Full address
    addressStreet: safeString(addr.street) || safeString(location.address) || '',
    addressPostalCode: safeString(addr.postalCode) || safeString(location.postalCode) || '',
    addressCity: safeString(addr.city) || safeString(location.city) || '',
    addressMunicipality: safeString(location.municipality) || '',
    addressCountry: safeString(location.country) || 'Norge',

    // Contact
    contactName: safeString(meta.contactName) || '',
    contactEmail: safeString(meta.contactEmail) || '',
    contactPhone: safeString(meta.contactPhone) || '',
    contactWebsite: safeString(meta.contactWebsite) || '',

    // All amenities
    allAmenities,

    // Equipment
    includedEquipment,

    // Additional services
    additionalServices,

    // Opening hours
    openingHours,
    isOpenNow: false, // Would need real-time calculation
    todayHoursDisplay: todayHours?.hoursDisplay || '',

    // Rules, FAQ, highlights
    rules,
    faq,
    highlights: safeArray<string>(meta.highlights),

    // Events
    upcomingEvents,

    // Booking config
    bookingCalendarType: (safeString(bookingConfig.calendarType) || 'time_slots') as ListingDetailsProjectionDTO['bookingCalendarType'],
    minBookingDuration: minDuration,
    minBookingDurationDisplay: formatDuration(minDuration),
    maxBookingDuration: maxDuration,
    maxBookingDurationDisplay: formatDuration(maxDuration),
    advanceBookingDays: advanceDays,
    advanceBookingDisplay: advanceDays === 1 ? '1 dag på forhånd' : `${advanceDays} dager på forhånd`,
    cancellationPolicyDisplay: safeString(bookingConfig.cancellationPolicy) || 'Standard avbestillingsregler',
    requiresApproval: Boolean(bookingConfig.requiresApproval),
    instantBookingEnabled: Boolean(bookingConfig.instantBooking),

    // Permissions (from API auth layer)
    canBook: options.canBook ?? true,
    canEdit: options.canEdit ?? false,
    canViewPricing: options.canViewPricing ?? true,
    availableActions: [],

    // Timestamps
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString(),
  };
}

/**
 * Convert multiple listings to card projections
 */
export function toCardProjections(listings: DbListing[]): ListingCardProjectionDTO[] {
  return listings.map(toCardProjection);
}
