/**
 * Rental Object Projections - API-Side Data Transformation
 *
 * These functions convert raw database entities to screen-ready projection DTOs.
 * The transformation happens ONCE in the API, ensuring consistent data for all frontends.
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface RentalObjectCardProjectionDTO {
  id: string;
  slug: string;
  name: string; // EXPAND: Deprecated in v1.1.0, use title instead
  title: string; // EXPAND: Preferred field (v1.1.0)
  tenantId: string;
  category: string;
  categoryLabel: string;
  subcategory: string;
  subcategoryLabel: string;
  timeMode: string;
  timeModeLabel: string;
  locationFormatted: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  primaryImageUrl: string;
  primaryImageThumbnail: string;
  primaryImageAlt: string;
  imageCount: number;
  priceAmount: number;
  priceCurrency: string;
  priceUnit: string;
  priceDisplay: string;
  capacity: number;
  capacityLabel: string;
  amenities: string[];
  moreAmenitiesCount: number;
  averageRating: number;
  reviewCount: number;
  ratingDisplay: string;
  descriptionExcerpt: string;
  isAvailable: boolean;
  isFeatured: boolean;
}

export interface RentalObjectImageDTO {
  id: string;
  url: string;
  thumbnailUrl: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface RentalObjectAmenityDTO {
  id: string;
  name: string;
  icon: string;
  category: string;
}

export interface RentalObjectOpeningHoursDTO {
  day: string;
  dayIndex: number;
  openTime: string;
  closeTime: string;
  hoursDisplay: string;
  isClosed: boolean;
}

export interface RentalObjectDetailsProjectionDTO extends RentalObjectCardProjectionDTO {
  description: string;
  images: RentalObjectImageDTO[];
  addressStreet: string;
  addressPostalCode: string;
  addressCity: string;
  addressMunicipality: string;
  addressCountry: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactWebsite: string;
  allAmenities: RentalObjectAmenityDTO[];
  openingHours: RentalObjectOpeningHoursDTO[];
  isOpenNow: boolean;
  todayHoursDisplay: string;
  rules: Array<{ id: string; title: string; content: string }>;
  faq: Array<{ id: string; question: string; answer: string }>;
  highlights: string[];
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
  canBook: boolean;
  canEdit: boolean;
  canViewPricing: boolean;
  availableActions: string[];
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// TRANSLATION KEY MAPPINGS
// All labels are now i18n keys - use t() in the frontend to resolve them
// =============================================================================

const CATEGORY_LABEL_KEYS: Record<string, string> = {
  LOKALER_OG_BANER: 'sdk.rentalObject.category.LOKALER_OG_BANER',
  UTSTYR_OG_INVENTAR: 'sdk.rentalObject.category.UTSTYR_OG_INVENTAR',
  KJORETOY_OG_TRANSPORT: 'sdk.rentalObject.category.KJORETOY_OG_TRANSPORT',
  OPPLEVELSER_OG_ARRANGEMENT: 'sdk.rentalObject.category.OPPLEVELSER_OG_ARRANGEMENT',
};

const TIME_MODE_LABEL_KEYS: Record<string, string> = {
  PERIOD: 'sdk.timeMode.PERIOD',
  SLOT: 'sdk.timeMode.SLOT',
  ALL_DAY: 'sdk.timeMode.ALL_DAY',
};

const UNIT_LABEL_KEYS: Record<string, string> = {
  hour: 'sdk.pricingUnit.hour',
  day: 'sdk.pricingUnit.day',
  booking: 'sdk.pricingUnit.booking',
  week: 'sdk.pricingUnit.week',
  month: 'sdk.pricingUnit.month',
};

const DAY_INDICES: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

const DAY_LABEL_KEYS: Record<string, string> = {
  monday: 'sdk.weekday.monday',
  tuesday: 'sdk.weekday.tuesday',
  wednesday: 'sdk.weekday.wednesday',
  thursday: 'sdk.weekday.thursday',
  friday: 'sdk.weekday.friday',
  saturday: 'sdk.weekday.saturday',
  sunday: 'sdk.weekday.sunday',
};

// =============================================================================
// RAW DB TYPE
// =============================================================================

interface DbRentalObject {
  id: string;
  tenantId: string;
  organizationId?: string | null;
  name: string; // EXPAND: Keep for backward compatibility
  title?: string; // EXPAND: New field (v1.1.0)
  slug: string;
  categoryKey: string;  // Maps to category_key column in DB
  subcategory?: string | null;
  timeMode: string;
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

function getCategoryLabelKey(category: string): string {
  return CATEGORY_LABEL_KEYS[category] ?? `sdk.rentalObject.category.${category}`;
}

function getTimeModeLabelKey(timeMode: string): string {
  return TIME_MODE_LABEL_KEYS[timeMode] ?? `sdk.timeMode.${timeMode}`;
}

function getUnitLabelKey(unit: string): string {
  return UNIT_LABEL_KEYS[unit] ?? `sdk.pricingUnit.${unit}`;
}

function getWeekdayLabelKey(day: string): string {
  const dayLower = day.toLowerCase();
  return DAY_LABEL_KEYS[dayLower] ?? `sdk.weekday.${dayLower}`;
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

function formatLocation(obj: DbRentalObject): { formatted: string; city: string } {
  const meta = obj.metadata || {};
  const location = (meta.location || {}) as Record<string, unknown>;
  const addr = (meta.address && typeof meta.address === 'object' ? meta.address : {}) as Record<string, string>;

  const street = safeString(addr.street) || safeString(location.address) || '';
  const postalCode = safeString(addr.postalCode) || safeString(location.postalCode) || safeString(meta.postalCode) || '';
  const city = safeString(addr.city) || safeString(location.city) || safeString(meta.city) || '';

  const parts = [street, postalCode, city].filter(Boolean);
  // Return i18n key for placeholder when no address
  const formatted = parts.length > 0 ? parts.join(', ') : 'sdk.placeholder.noAddress';

  return { formatted, city: city || 'sdk.placeholder.unknown' };
}

function getCoordinates(obj: DbRentalObject): { lat: number | null; lng: number | null } {
  const meta = obj.metadata || {};
  const location = (meta.location || {}) as Record<string, unknown>;

  const lat = safeNumber(location.lat) || safeNumber(location.latitude) || null;
  const lng = safeNumber(location.lng) || safeNumber(location.longitude) || null;

  if (lat && lng && lat !== 0 && lng !== 0) {
    return { lat, lng };
  }
  return { lat: null, lng: null };
}

function getPrimaryImage(obj: DbRentalObject): { url: string; thumbnail: string; alt: string } {
  const rawImages = obj.images || [];
  const images = Array.isArray(rawImages) ? rawImages : [];
  
  if (images.length === 0) {
    return {
      url: '',
      thumbnail: '',
      alt: 'sdk.placeholder.noImage',
    };
  }

  const first = images[0];
  
  // Handle object format: {url: string, alt: string}
  if (typeof first === 'object' && first !== null && 'url' in first) {
    const imgObj = first as { url: string; alt?: string };
    return {
      url: imgObj.url || '',
      thumbnail: imgObj.url || '',
      alt: imgObj.alt || obj.name,
    };
  }
  
  // Handle string format (plain URL)
  const primaryUrl = typeof first === 'string' ? first : '';
  return {
    url: primaryUrl,
    thumbnail: primaryUrl,
    alt: primaryUrl ? `${obj.name}` : 'sdk.placeholder.noImage',
  };
}

function getAmenities(obj: DbRentalObject, maxCount: number = 3): { visible: string[]; moreCount: number } {
  const meta = obj.metadata || {};
  const all = safeArray<string>(meta.amenities) || safeArray<string>(meta.facilities);
  
  // Ensure amenity keys have the 'amenity.' prefix for i18n translation
  const prefixedAmenities = all.map(a => {
    // If already has prefix, keep it; otherwise add amenity. prefix
    return a.startsWith('amenity.') ? a : `amenity.${a}`;
  });

  return {
    visible: prefixedAmenities.slice(0, maxCount),
    moreCount: Math.max(0, prefixedAmenities.length - maxCount),
  };
}

function formatRating(rating?: number, count?: number): string {
  if (!rating || !count) return 'sdk.placeholder.noReviews';
  return `${rating.toFixed(1)} (${count})`;
}

function formatPrice(pricing?: DbRentalObject['pricing']): {
  amount: number;
  currency: string;
  unit: string;
  unitLabel: string;
  display: string;
} {
  const amount = pricing?.basePrice || 0;
  const currency = pricing?.currency || 'NOK';
  const unit = pricing?.unit || 'hour';
  const unitLabel = getUnitLabelKey(unit);

  return {
    amount,
    currency,
    unit,
    unitLabel,
    display: amount > 0 ? `${amount} ${currency}` : 'sdk.placeholder.priceNotSet',
  };
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} sdk.duration.minutes`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return hours === 1 ? `1 sdk.duration.hour` : `${hours} sdk.duration.hours`;
  return `${hours} sdk.duration.hours ${mins} sdk.duration.minutes`;
}

// =============================================================================
// MAIN PROJECTION FUNCTIONS
// =============================================================================

/**
 * Convert a database rental object to a flat, screen-ready RentalObjectCardProjectionDTO
 */
export function toCardProjection(obj: DbRentalObject): RentalObjectCardProjectionDTO {
  const location = formatLocation(obj);
  const coords = getCoordinates(obj);
  const image = getPrimaryImage(obj);
  const { visible: amenities, moreCount } = getAmenities(obj);
  const price = formatPrice(obj.pricing);
  const capacity = obj.capacity || 0;
  const meta = obj.metadata || {};

  const avgRating = safeNumber(meta.averageRating);
  const revCount = safeNumber(meta.reviewCount);

  return {
    id: obj.id,
    slug: obj.slug,
    name: obj.name, // EXPAND: Keep for backward compatibility (deprecated in v1.1.0)
    title: obj.title || obj.name, // EXPAND: Prefer title, fallback to name
    tenantId: obj.tenantId,
    category: obj.categoryKey,
    categoryLabel: getCategoryLabelKey(obj.categoryKey),
    subcategory: obj.subcategory || '',
    subcategoryLabel: obj.subcategory || '',
    timeMode: obj.timeMode,
    timeModeLabel: getTimeModeLabelKey(obj.timeMode),
    locationFormatted: location.formatted,
    city: location.city,
    latitude: coords.lat,
    longitude: coords.lng,
    primaryImageUrl: image.url,
    primaryImageThumbnail: image.thumbnail,
    primaryImageAlt: image.alt,
    imageCount: safeArray(obj.images).length,
    priceAmount: price.amount,
    priceCurrency: price.currency,
    priceUnit: price.unit,
    priceDisplay: price.display,
    capacity,
    capacityLabel: capacity > 0 ? `${capacity}` : '',
    amenities,
    moreAmenitiesCount: moreCount,
    averageRating: avgRating,
    reviewCount: revCount,
    ratingDisplay: formatRating(avgRating, revCount),
    descriptionExcerpt: obj.description 
      ? (obj.description.length > 120 ? obj.description.slice(0, 117) + '...' : obj.description)
      : '',
    isAvailable: obj.status === 'published',
    isFeatured: Boolean(meta.featured),
  };
}

/**
 * Convert a database rental object to a full RentalObjectDetailsProjectionDTO
 */
export function toDetailsProjection(
  obj: DbRentalObject,
  options: { canBook?: boolean; canEdit?: boolean; canViewPricing?: boolean } = {}
): RentalObjectDetailsProjectionDTO {
  const card = toCardProjection(obj);
  const meta = obj.metadata || {};
  const location = (meta.location || {}) as Record<string, unknown>;
  const addr = (meta.address && typeof meta.address === 'object' ? meta.address : {}) as Record<string, string>;

  const images: RentalObjectImageDTO[] = safeArray<string>(obj.images).map((url, index) => ({
    id: `img-${index}`,
    url,
    thumbnailUrl: url,
    alt: `${obj.name} ${index + 1}`,
    isPrimary: index === 0,
    order: index,
  }));

  const rawAmenities = safeArray<string>(meta.amenities) || safeArray<string>(meta.facilities);
  const allAmenities: RentalObjectAmenityDTO[] = rawAmenities.map((name, i) => ({
    id: `amenity-${i}`,
    name,
    icon: 'check',
    category: 'general',
  }));

  const rawHoursData = meta.openingHours;
  let openingHours: RentalObjectOpeningHoursDTO[] = [];
  
  if (Array.isArray(rawHoursData)) {
    openingHours = rawHoursData.map((item: any, i: number) => {
      const dayName = safeString(item.day) || safeString(item.dayName) || getWeekdayLabelKey(`day${i}`);
      const dayIdx = typeof item.dayIndex === 'number' ? item.dayIndex : i;
      const openTime = safeString(item.open) || safeString(item.openTime) || '';
      const closeTime = safeString(item.close) || safeString(item.closeTime) || '';
      const isClosed = item.isClosed === true || (!openTime && !closeTime);
      return {
        day: dayName,
        dayIndex: dayIdx,
        openTime,
        closeTime,
        hoursDisplay: isClosed ? 'sdk.placeholder.closed' : `${openTime} - ${closeTime}`,
        isClosed,
      };
    });
  } else if (rawHoursData && typeof rawHoursData === 'object') {
    openingHours = Object.entries(rawHoursData as Record<string, { open?: string; close?: string }>)
      .map(([day, times]) => {
        const dayLower = day.toLowerCase();
        const idx = DAY_INDICES[dayLower] ?? 0;
        const isClosed = !times.open || !times.close;
        return {
          day: getWeekdayLabelKey(dayLower),
          dayIndex: idx,
          openTime: times.open || '',
          closeTime: times.close || '',
          hoursDisplay: isClosed ? 'sdk.placeholder.closed' : `${times.open} - ${times.close}`,
          isClosed,
        };
      })
      .sort((a, b) => a.dayIndex - b.dayIndex);
  }

  const todayIndex = new Date().getDay();
  const todayHours = openingHours.find(h => h.dayIndex === todayIndex);

  const rawRules = safeArray<{ id?: string; title?: string; content?: string } | string>(meta.guidelines || meta.rules);
  const rules = rawRules.map((r, i) =>
    typeof r === 'string'
      ? { id: `rule-${i}`, title: r, content: r }
      : { id: r.id || `rule-${i}`, title: r.title || '', content: r.content || '' }
  );

  const rawFaq = safeArray<{ question: string; answer: string }>(meta.faq);
  const faq = rawFaq.map((item, i) => ({
    id: `faq-${i}`,
    question: item.question || '',
    answer: item.answer || '',
  }));

  const bookingConfig = (meta.bookingConfig || {}) as Record<string, unknown>;
  const minDuration = safeNumber(bookingConfig.minDuration) || 60;
  const maxDuration = safeNumber(bookingConfig.maxDuration) || 480;
  const advanceDays = safeNumber(bookingConfig.advanceBookingDays) || 7;

  const description = obj.description || '';

  return {
    ...card,
    description,
    images,
    addressStreet: safeString(addr.street) || safeString(location.address) || '',
    addressPostalCode: safeString(addr.postalCode) || safeString(location.postalCode) || '',
    addressCity: safeString(addr.city) || safeString(location.city) || '',
    addressMunicipality: safeString(location.municipality) || '',
    addressCountry: safeString(location.country) || '',
    contactName: safeString(meta.contactName) || '',
    contactEmail: safeString(meta.contactEmail) || '',
    contactPhone: safeString(meta.contactPhone) || '',
    contactWebsite: safeString(meta.contactWebsite) || '',
    allAmenities,
    openingHours,
    isOpenNow: false,
    todayHoursDisplay: todayHours?.hoursDisplay || '',
    rules,
    faq,
    highlights: safeArray<string>(meta.highlights),
    bookingCalendarType: (safeString(bookingConfig.calendarType) || 'time_slots') as RentalObjectDetailsProjectionDTO['bookingCalendarType'],
    minBookingDuration: minDuration,
    minBookingDurationDisplay: formatDuration(minDuration),
    maxBookingDuration: maxDuration,
    maxBookingDurationDisplay: formatDuration(maxDuration),
    advanceBookingDays: advanceDays,
    advanceBookingDisplay: `${advanceDays} sdk.booking.advanceDays`,
    cancellationPolicyDisplay: safeString(bookingConfig.cancellationPolicy) || 'sdk.booking.standardCancellation',
    requiresApproval: Boolean(bookingConfig.requiresApproval),
    instantBookingEnabled: Boolean(bookingConfig.instantBooking),
    canBook: options.canBook ?? true,
    canEdit: options.canEdit ?? false,
    canViewPricing: options.canViewPricing ?? true,
    availableActions: [],
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  };
}

/**
 * Convert multiple rental objects to card projections
 */
export function toCardProjections(objects: DbRentalObject[]): RentalObjectCardProjectionDTO[] {
  return objects.map(toCardProjection);
}
