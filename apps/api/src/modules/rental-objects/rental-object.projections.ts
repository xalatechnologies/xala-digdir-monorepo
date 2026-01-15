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
  name: string;
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
// LABEL MAPPINGS
// =============================================================================

const CATEGORY_LABELS: Record<string, string> = {
  LOKALER_OG_BANER: 'Lokaler og baner',
  UTSTYR_OG_INVENTAR: 'Utstyr og inventar',
  KJORETOY_OG_TRANSPORT: 'Kjoeretoy og transport',
  OPPLEVELSER_OG_ARRANGEMENT: 'Opplevelser og arrangement',
};

const TIME_MODE_LABELS: Record<string, string> = {
  PERIOD: 'Tidsperiode',
  SLOT: 'Tidsluke',
  ALL_DAY: 'Heldags',
};

const UNIT_LABELS: Record<string, string> = {
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
// RAW DB TYPE
// =============================================================================

interface DbRentalObject {
  id: string;
  tenantId: string;
  organizationId?: string | null;
  name: string;
  slug: string;
  category: string;
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

function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category;
}

function getTimeModeLabel(timeMode: string): string {
  return TIME_MODE_LABELS[timeMode] || timeMode;
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

function formatLocation(obj: DbRentalObject): { formatted: string; city: string } {
  const meta = obj.metadata || {};
  const location = (meta.location || {}) as Record<string, unknown>;
  const addr = (meta.address && typeof meta.address === 'object' ? meta.address : {}) as Record<string, string>;

  const street = safeString(addr.street) || safeString(location.address) || '';
  const postalCode = safeString(addr.postalCode) || safeString(location.postalCode) || safeString(meta.postalCode) || '';
  const city = safeString(addr.city) || safeString(location.city) || safeString(meta.city) || '';

  const parts = [street, postalCode, city].filter(Boolean);
  const formatted = parts.length > 0 ? parts.join(', ') : 'Ingen adresse';

  return { formatted, city: city || 'Ukjent' };
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
  const images = safeArray<string>(obj.images);
  const primaryUrl = images[0] || '';

  return {
    url: primaryUrl,
    thumbnail: primaryUrl,
    alt: primaryUrl ? `${obj.name} - bilde` : 'Ingen bilde',
  };
}

function getAmenities(obj: DbRentalObject, maxCount: number = 3): { visible: string[]; moreCount: number } {
  const meta = obj.metadata || {};
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

function formatPrice(pricing?: DbRentalObject['pricing']): {
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
    name: obj.name,
    tenantId: obj.tenantId,
    category: obj.category,
    categoryLabel: getCategoryLabel(obj.category),
    subcategory: obj.subcategory || '',
    subcategoryLabel: obj.subcategory || '',
    timeMode: obj.timeMode,
    timeModeLabel: getTimeModeLabel(obj.timeMode),
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
    capacityLabel: capacity > 0 ? `${capacity} personer` : '',
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
    alt: `${obj.name} - bilde ${index + 1}`,
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
      const dayName = safeString(item.day) || safeString(item.dayName) || `Day ${i}`;
      const dayIdx = typeof item.dayIndex === 'number' ? item.dayIndex : i;
      const openTime = safeString(item.open) || safeString(item.openTime) || '';
      const closeTime = safeString(item.close) || safeString(item.closeTime) || '';
      const isClosed = item.isClosed === true || (!openTime && !closeTime);
      return {
        day: dayName,
        dayIndex: dayIdx,
        openTime,
        closeTime,
        hoursDisplay: isClosed ? 'Stengt' : `${openTime} - ${closeTime}`,
        isClosed,
      };
    });
  } else if (rawHoursData && typeof rawHoursData === 'object') {
    openingHours = Object.entries(rawHoursData as Record<string, { open?: string; close?: string }>)
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
    addressCountry: safeString(location.country) || 'Norge',
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
    advanceBookingDisplay: advanceDays === 1 ? '1 dag pa forhand' : `${advanceDays} dager pa forhand`,
    cancellationPolicyDisplay: safeString(bookingConfig.cancellationPolicy) || 'Standard avbestillingsregler',
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
