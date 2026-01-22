/**
 * Rental Object Anti-Corruption Layer (ACL) Mapper
 *
 * This mapper sits between the persistence layer (database) and the domain layer,
 * providing three critical transformations:
 *
 * 1. toDomain() - Persistence → Domain (clean business types)
 * 2. toPersistence() - Domain → Persistence (database format)
 * 3. toCardProjection() - Domain → CardProjectionDTO (display-ready)
 * 4. toDetailsProjection() - Domain → DetailsProjectionDTO (display-ready)
 *
 * PURPOSE:
 * - Decouple database schema from business logic
 * - Enable safe schema evolution (Expand/Contract pattern)
 * - Enforce single source of truth for transformations
 * - Prevent schema coupling in controllers and services
 */

import type {
  RentalObject,
  Location,
  Pricing,
  Capacity,
  Image,
  ContactInfo,
  OpeningHours,
  BookingConfig,
  Amenity,
  Equipment,
  Rule,
  FaqEntry,
  AdditionalService,
} from '../../domain/rental-objects';

import type {
  RentalObjectCardProjectionDTO,
  RentalObjectDetailsProjectionDTO,
} from '@digilist/client-sdk/types/projection-dtos';

// =============================================================================
// PERSISTENCE TYPES (Database Schema)
// =============================================================================

/**
 * Raw database record from rentalObjects table
 * Matches Drizzle schema exactly
 */
export interface DbRentalObject {
  id: string;
  tenantId: string;
  organizationId: string | null;
  name: string; // EXPAND: Keep for backward compatibility
  title?: string; // EXPAND: New field (v1.1.0)
  slug: string;
  description: string | null;
  categoryKey: string;
  timeMode: string;
  features: unknown; // JSONB array
  ruleSetKey: string | null;
  status: string;
  requiresApproval: boolean;
  capacity: number | null;
  inventoryTotal: number | null;
  images: unknown; // JSONB array
  pricing: unknown; // JSONB object
  metadata: unknown; // JSONB object
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// TRANSFORMATION: PERSISTENCE → DOMAIN
// =============================================================================

/**
 * Convert database record to clean domain model
 *
 * @param db Raw database record
 * @returns Clean domain entity
 */
export function toDomain(db: DbRentalObject): RentalObject {
  const metadata = parseMetadata(db.metadata);
  const pricingData = parsePricing(db.pricing);
  const imagesData = parseImages(db.images);

  return {
    // Identity
    id: db.id,
    tenantId: db.tenantId,
    organizationId: db.organizationId,

    // Core attributes
    // EXPAND: Prefer title, fallback to name for backward compatibility
    name: db.name,
    title: db.title || db.name, // Use title if available, otherwise fallback to name
    slug: db.slug,
    description: db.description || '',

    // V3 classification
    category: {
      key: db.categoryKey,
      label: getCategoryLabel(db.categoryKey),
    },
    timeMode: parseTimeMode(db.timeMode),
    features: parseFeatures(db.features),
    ruleSet: db.ruleSetKey,

    // Status & workflow
    status: parseStatus(db.status),
    requiresApproval: db.requiresApproval,

    // Location
    location: extractLocation(metadata),

    // Capacity & inventory
    capacity: extractCapacity(db.capacity, db.inventoryTotal, metadata),

    // Pricing
    pricing: pricingData,

    // Media
    images: imagesData,

    // Contact
    contact: extractContact(metadata),

    // Operating hours
    openingHours: extractOpeningHours(metadata),

    // Booking configuration
    bookingConfig: extractBookingConfig(metadata, db.requiresApproval),

    // Amenities & equipment
    amenities: extractAmenities(metadata),
    equipment: extractEquipment(metadata),

    // Rules & FAQ
    rules: extractRules(metadata),
    faq: extractFaq(metadata),

    // Additional services
    additionalServices: extractAdditionalServices(metadata),

    // Highlights
    highlights: extractHighlights(metadata),

    // Metadata
    isFeatured: Boolean(metadata.featured),
    averageRating: typeof metadata.averageRating === 'number' ? metadata.averageRating : null,
    reviewCount: typeof metadata.reviewCount === 'number' ? metadata.reviewCount : 0,
    metadata: metadata,

    // Timestamps
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
  };
}

// =============================================================================
// TRANSFORMATION: DOMAIN → PERSISTENCE
// =============================================================================

/**
 * Convert domain model to database format
 *
 * @param domain Clean domain entity
 * @returns Database record ready for insert/update
 */
export function toPersistence(domain: RentalObject): Omit<DbRentalObject, 'createdAt' | 'updatedAt'> {
  return {
    id: domain.id,
    tenantId: domain.tenantId,
    organizationId: domain.organizationId,
    name: domain.name, // EXPAND: Keep for backward compatibility
    title: domain.title, // EXPAND: Write new field (v1.1.0)
    slug: domain.slug,
    description: domain.description || null,
    categoryKey: domain.category.key,
    timeMode: domain.timeMode,
    features: domain.features,
    ruleSetKey: domain.ruleSet,
    status: domain.status.toLowerCase(),
    requiresApproval: domain.requiresApproval,
    capacity: domain.capacity?.maximum || null,
    inventoryTotal: domain.capacity?.inventoryTotal || null,
    images: domain.images.map((img) => img.url),
    pricing: domain.pricing
      ? {
          basePrice: domain.pricing.amount,
          currency: domain.pricing.currency,
          unit: domain.pricing.unit.toLowerCase(),
          taxIncluded: domain.pricing.taxIncluded,
          taxRate: domain.pricing.taxRate,
        }
      : null,
    metadata: serializeMetadata(domain),
  };
}

// =============================================================================
// TRANSFORMATION: DOMAIN → CARD PROJECTION
// =============================================================================

/**
 * Convert domain model to card projection DTO (for grids/lists)
 *
 * @param domain Clean domain entity
 * @returns Screen-ready card projection
 */
export function toCardProjection(domain: RentalObject): RentalObjectCardProjectionDTO {
  const primaryImage = domain.images.find((img) => img.isPrimary) || domain.images[0];
  const location = domain.location;
  const pricing = domain.pricing;

  return {
    // Identity
    id: domain.id,
    slug: domain.slug,
    name: domain.name, // EXPAND: Keep for backward compatibility (deprecated in v1.1.0)
    title: domain.title, // EXPAND: Preferred field (v1.1.0)
    tenantId: domain.tenantId,

    // Type (display-ready)
    type: domain.category.key,
    typeLabel: domain.category.label,

    // Location (display-ready)
    locationFormatted: formatLocation(location),
    city: location?.city || 'sdk.placeholder.unknown',
    latitude: location?.latitude || null,
    longitude: location?.longitude || null,

    // Media (display-ready URLs)
    primaryImageUrl: primaryImage?.url || '',
    primaryImageThumbnail: primaryImage?.thumbnailUrl || '',
    primaryImageAlt: primaryImage?.alt || domain.name,
    imageCount: domain.images.length,

    // Pricing (display-ready)
    priceAmount: pricing?.amount || 0,
    priceCurrency: pricing?.currency || 'NOK',
    priceUnit: pricing?.unit.toLowerCase() || 'hour',
    priceDisplay: formatPrice(pricing),

    // Capacity (display-ready)
    capacity: domain.capacity?.maximum || 0,
    capacityLabel: formatCapacity(domain.capacity),

    // Features (display-ready lists)
    amenities: domain.amenities.slice(0, 3).map((a) => a.name),
    moreAmenitiesCount: Math.max(0, domain.amenities.length - 3),

    // Rating (display-ready)
    averageRating: domain.averageRating || 0,
    reviewCount: domain.reviewCount,
    ratingDisplay: formatRating(domain.averageRating, domain.reviewCount),

    // Description excerpt
    descriptionExcerpt: domain.description
      ? domain.description.length > 120
        ? domain.description.slice(0, 117) + '...'
        : domain.description
      : '',

    // Status
    isAvailable: domain.status === 'PUBLISHED',
    isFeatured: domain.isFeatured,
  };
}

// =============================================================================
// TRANSFORMATION: DOMAIN → DETAILS PROJECTION
// =============================================================================

/**
 * Convert domain model to details projection DTO (for detail pages)
 *
 * @param domain Clean domain entity
 * @param permissions User permissions (computed by RBAC layer)
 * @returns Screen-ready details projection
 */
export function toDetailsProjection(
  domain: RentalObject,
  permissions: {
    canBook?: boolean;
    canEdit?: boolean;
    canViewPricing?: boolean;
    availableActions?: string[];
  } = {}
): RentalObjectDetailsProjectionDTO {
  const card = toCardProjection(domain);
  const location = domain.location;
  const bookingConfig = domain.bookingConfig;

  return {
    ...card,

    // Full description
    description: domain.description,

    // All images
    images: domain.images.map((img) => ({
      id: img.id,
      url: img.url,
      thumbnailUrl: img.thumbnailUrl,
      alt: img.alt,
      isPrimary: img.isPrimary,
      order: img.order,
    })),

    // Full location
    addressStreet: location?.street || '',
    addressPostalCode: location?.postalCode || '',
    addressCity: location?.city || '',
    addressMunicipality: location?.municipality || '',
    addressCountry: location?.country || 'Norge',

    // Contact
    contactName: domain.contact?.name || '',
    contactEmail: domain.contact?.email || '',
    contactPhone: domain.contact?.phone || '',
    contactWebsite: domain.contact?.website || '',

    // All amenities
    allAmenities: domain.amenities.map((a) => ({
      id: a.id,
      name: a.name,
      icon: a.icon,
      category: a.category,
    })),

    // Equipment
    includedEquipment: domain.equipment.map((e) => ({
      id: e.id,
      name: e.name,
      quantity: e.quantity,
      description: e.description,
    })),

    // Additional services
    additionalServices: domain.additionalServices.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      price: s.pricing.amount,
      currency: s.pricing.currency,
      priceDisplay: formatPrice(s.pricing),
      isOptional: s.isOptional,
    })),

    // Opening hours
    openingHours: domain.openingHours.map((oh) => ({
      day: getDayLabel(oh.dayOfWeek),
      dayIndex: oh.dayOfWeek,
      openTime: oh.openTime,
      closeTime: oh.closeTime,
      hoursDisplay: oh.isClosed
        ? 'sdk.openingHours.closed'
        : `${oh.openTime} - ${oh.closeTime}`,
      isClosed: oh.isClosed,
    })),
    isOpenNow: checkIsOpenNow(domain.openingHours),
    todayHoursDisplay: getTodayHoursDisplay(domain.openingHours),

    // Rules
    rules: domain.rules.map((r) => ({
      id: r.id,
      title: r.title,
      content: r.content,
    })),

    // FAQ
    faq: domain.faq.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
    })),

    // Highlights
    highlights: domain.highlights,

    // Upcoming events (placeholder - would need separate query)
    upcomingEvents: [],

    // Booking config
    bookingCalendarType: mapCalendarType(bookingConfig?.calendarType),
    minBookingDuration: bookingConfig?.minDurationMinutes || 60,
    minBookingDurationDisplay: formatDuration(bookingConfig?.minDurationMinutes || 60),
    maxBookingDuration: bookingConfig?.maxDurationMinutes || 1440,
    maxBookingDurationDisplay: formatDuration(bookingConfig?.maxDurationMinutes || 1440),
    advanceBookingDays: bookingConfig?.advanceBookingDays || 30,
    advanceBookingDisplay: `${bookingConfig?.advanceBookingDays || 30} sdk.duration.days`,
    cancellationPolicyDisplay: `${bookingConfig?.cancellationDeadlineHours || 24} sdk.duration.hours`,
    requiresApproval: domain.requiresApproval,
    instantBookingEnabled: bookingConfig?.instantBookingEnabled || false,

    // Permissions (from RBAC layer)
    canBook: permissions.canBook ?? false,
    canEdit: permissions.canEdit ?? false,
    canViewPricing: permissions.canViewPricing ?? true,
    availableActions: permissions.availableActions ?? [],

    // Timestamps
    createdAt: domain.createdAt.toISOString(),
    updatedAt: domain.updatedAt.toISOString(),
  };
}

// =============================================================================
// HELPER FUNCTIONS - PARSING (Persistence → Domain)
// =============================================================================

function parseMetadata(raw: unknown): Record<string, unknown> {
  if (typeof raw === 'object' && raw !== null) {
    return raw as Record<string, unknown>;
  }
  return {};
}

function parsePricing(raw: unknown): Pricing | null {
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.basePrice === 'number') {
      return {
        amount: obj.basePrice,
        currency: typeof obj.currency === 'string' ? obj.currency : 'NOK',
        unit: parsePricingUnit(obj.unit),
        taxIncluded: typeof obj.taxIncluded === 'boolean' ? obj.taxIncluded : true,
        taxRate: typeof obj.taxRate === 'number' ? obj.taxRate : 0,
      };
    }
  }
  return null;
}

function parsePricingUnit(raw: unknown): Pricing['unit'] {
  const str = typeof raw === 'string' ? raw.toUpperCase() : 'HOUR';
  if (['HOUR', 'DAY', 'WEEK', 'MONTH', 'FIXED'].includes(str)) {
    return str as Pricing['unit'];
  }
  return 'HOUR';
}

function parseImages(raw: unknown): Image[] {
  if (Array.isArray(raw)) {
    return raw.map((url, index) => ({
      id: `img-${index}`,
      url: typeof url === 'string' ? url : '',
      thumbnailUrl: typeof url === 'string' ? url : '',
      alt: '',
      isPrimary: index === 0,
      order: index,
    }));
  }
  return [];
}

function parseTimeMode(raw: string): RentalObject['timeMode'] {
  const upper = raw.toUpperCase();
  if (['PERIOD', 'SLOT', 'ALL_DAY'].includes(upper)) {
    return upper as RentalObject['timeMode'];
  }
  return 'PERIOD';
}

function parseFeatures(raw: unknown): RentalObject['features'] {
  if (Array.isArray(raw)) {
    return raw.filter((f) => ['INVENTORY', 'SHARED_CAPACITY', 'PACKAGES'].includes(f));
  }
  return [];
}

function parseStatus(raw: string): RentalObject['status'] {
  const upper = raw.toUpperCase();
  if (['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(upper)) {
    return upper as RentalObject['status'];
  }
  return 'DRAFT';
}

function getCategoryLabel(key: string): string {
  return `sdk.rentalObject.category.${key}`;
}

// Extraction helpers
function extractLocation(meta: Record<string, unknown>): Location | null {
  const addr = meta.address as Record<string, unknown> | undefined;
  const loc = meta.location as Record<string, unknown> | undefined;

  if (!addr && !loc) return null;

  return {
    street: (addr?.street || loc?.address || '') as string,
    postalCode: (addr?.postalCode || meta.postalCode || '') as string,
    city: (addr?.city || meta.city || '') as string,
    municipality: (addr?.municipality || '') as string,
    country: (addr?.country || 'Norge') as string,
    latitude: typeof loc?.lat === 'number' ? loc.lat : null,
    longitude: typeof loc?.lng === 'number' ? loc.lng : null,
  };
}

function extractCapacity(
  capacity: number | null,
  inventoryTotal: number | null,
  meta: Record<string, unknown>
): Capacity | null {
  if (!capacity && !inventoryTotal) return null;

  return {
    maximum: capacity || 0,
    inventoryTotal,
    inventoryAvailable: inventoryTotal, // TODO: compute from bookings
  };
}

function extractContact(meta: Record<string, unknown>): ContactInfo | null {
  const contact = meta.contact as Record<string, unknown> | undefined;
  if (!contact) return null;

  return {
    name: (contact.name || '') as string,
    email: (contact.email || '') as string,
    phone: (contact.phone || '') as string,
    website: (contact.website || null) as string | null,
  };
}

function extractOpeningHours(meta: Record<string, unknown>): OpeningHours[] {
  const hours = meta.openingHours;
  if (!Array.isArray(hours)) return [];

  return hours.map((h: any, i) => ({
    dayOfWeek: (typeof h.dayIndex === 'number' ? h.dayIndex : i) as OpeningHours['dayOfWeek'],
    openTime: h.openTime || h.open || '',
    closeTime: h.closeTime || h.close || '',
    isClosed: h.isClosed || false,
  }));
}

function extractBookingConfig(meta: Record<string, unknown>, requiresApproval: boolean): BookingConfig | null {
  const config = meta.bookingConfig as Record<string, unknown> | undefined;
  if (!config) return null;

  return {
    minDurationMinutes: (config.minDurationMinutes || 60) as number,
    maxDurationMinutes: (config.maxDurationMinutes || 1440) as number,
    advanceBookingDays: (config.advanceBookingDays || 30) as number,
    cancellationDeadlineHours: (config.cancellationDeadlineHours || 24) as number,
    requiresApproval,
    instantBookingEnabled: (config.instantBookingEnabled || false) as boolean,
    calendarType: parseCalendarType(config.calendarType),
  };
}

function parseCalendarType(raw: unknown): BookingConfig['calendarType'] {
  const str = typeof raw === 'string' ? raw.toUpperCase().replace(/-/g, '_') : 'TIME_SLOTS';
  if (['TIME_SLOTS', 'DAY_BOOKING', 'SEASON_ALLOCATION', 'REQUEST_ONLY'].includes(str)) {
    return str as BookingConfig['calendarType'];
  }
  return 'TIME_SLOTS';
}

function extractAmenities(meta: Record<string, unknown>): Amenity[] {
  const amenities = meta.amenities;
  if (!Array.isArray(amenities)) return [];

  return amenities.map((name: any, i) => ({
    id: `amenity-${i}`,
    name: typeof name === 'string' ? name : String(name),
    icon: 'check',
    category: 'general',
  }));
}

function extractEquipment(meta: Record<string, unknown>): Equipment[] {
  const equipment = meta.equipment;
  if (!Array.isArray(equipment)) return [];

  return equipment.map((e: any, i) => ({
    id: e.id || `equipment-${i}`,
    name: e.name || '',
    quantity: e.quantity || 1,
    description: e.description || '',
  }));
}

function extractRules(meta: Record<string, unknown>): Rule[] {
  const rules = meta.rules;
  if (!Array.isArray(rules)) return [];

  return rules.map((r: any, i) => ({
    id: r.id || `rule-${i}`,
    title: r.title || '',
    content: r.content || '',
    order: r.order || i,
  }));
}

function extractFaq(meta: Record<string, unknown>): FaqEntry[] {
  const faq = meta.faq;
  if (!Array.isArray(faq)) return [];

  return faq.map((f: any, i) => ({
    id: f.id || `faq-${i}`,
    question: f.question || '',
    answer: f.answer || '',
    order: f.order || i,
  }));
}

function extractAdditionalServices(meta: Record<string, unknown>): AdditionalService[] {
  const services = meta.additionalServices;
  if (!Array.isArray(services)) return [];

  return services.map((s: any, i) => ({
    id: s.id || `service-${i}`,
    name: s.name || '',
    description: s.description || '',
    pricing: {
      amount: s.price || 0,
      currency: s.currency || 'NOK',
      unit: 'FIXED' as const,
      taxIncluded: true,
      taxRate: 0,
    },
    isOptional: s.isOptional !== false,
  }));
}

function extractHighlights(meta: Record<string, unknown>): string[] {
  const highlights = meta.highlights;
  if (Array.isArray(highlights)) {
    return highlights.filter((h) => typeof h === 'string');
  }
  return [];
}

// =============================================================================
// HELPER FUNCTIONS - SERIALIZATION (Domain → Persistence)
// =============================================================================

function serializeMetadata(domain: RentalObject): Record<string, unknown> {
  return {
    ...domain.metadata,
    location: domain.location
      ? {
          address: domain.location.street,
          postalCode: domain.location.postalCode,
          city: domain.location.city,
          lat: domain.location.latitude,
          lng: domain.location.longitude,
        }
      : undefined,
    address: domain.location
      ? {
          street: domain.location.street,
          postalCode: domain.location.postalCode,
          city: domain.location.city,
          municipality: domain.location.municipality,
          country: domain.location.country,
        }
      : undefined,
    contact: domain.contact,
    openingHours: domain.openingHours.map((oh) => ({
      dayIndex: oh.dayOfWeek,
      openTime: oh.openTime,
      closeTime: oh.closeTime,
      isClosed: oh.isClosed,
    })),
    bookingConfig: domain.bookingConfig
      ? {
          minDurationMinutes: domain.bookingConfig.minDurationMinutes,
          maxDurationMinutes: domain.bookingConfig.maxDurationMinutes,
          advanceBookingDays: domain.bookingConfig.advanceBookingDays,
          cancellationDeadlineHours: domain.bookingConfig.cancellationDeadlineHours,
          instantBookingEnabled: domain.bookingConfig.instantBookingEnabled,
          calendarType: domain.bookingConfig.calendarType,
        }
      : undefined,
    amenities: domain.amenities.map((a) => a.name),
    equipment: domain.equipment,
    rules: domain.rules,
    faq: domain.faq,
    additionalServices: domain.additionalServices.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      price: s.pricing.amount,
      currency: s.pricing.currency,
      isOptional: s.isOptional,
    })),
    highlights: domain.highlights,
    featured: domain.isFeatured,
    averageRating: domain.averageRating,
    reviewCount: domain.reviewCount,
  };
}

// =============================================================================
// HELPER FUNCTIONS - FORMATTING (Display-Ready Strings)
// =============================================================================

function formatLocation(location: Location | null): string {
  if (!location) return 'sdk.placeholder.noAddress';

  const parts = [location.street, location.postalCode, location.city].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'sdk.placeholder.noAddress';
}

function formatPrice(pricing: Pricing | null): string {
  if (!pricing || pricing.amount === 0) {
    return 'sdk.placeholder.priceNotSet';
  }
  return `${pricing.amount} ${pricing.currency}`;
}

function formatCapacity(capacity: Capacity | null): string {
  if (!capacity || capacity.maximum === 0) return '';
  return `${capacity.maximum}`;
}

function formatRating(rating: number | null, count: number): string {
  if (!rating || count === 0) return 'sdk.placeholder.noReviews';
  return `${rating.toFixed(1)} (${count})`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} sdk.duration.minutes`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return hours === 1 ? `1 sdk.duration.hour` : `${hours} sdk.duration.hours`;
  return `${hours} sdk.duration.hours ${mins} sdk.duration.minutes`;
}

function getDayLabel(dayOfWeek: number): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return `sdk.weekday.${days[dayOfWeek]}`;
}

function checkIsOpenNow(hours: OpeningHours[]): boolean {
  const now = new Date();
  const today = now.getDay();
  const todayHours = hours.find((h) => h.dayOfWeek === today);

  if (!todayHours || todayHours.isClosed) return false;

  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
}

function getTodayHoursDisplay(hours: OpeningHours[]): string {
  const now = new Date();
  const today = now.getDay();
  const todayHours = hours.find((h) => h.dayOfWeek === today);

  if (!todayHours || todayHours.isClosed) {
    return 'sdk.openingHours.closed';
  }

  return `${todayHours.openTime} - ${todayHours.closeTime}`;
}

function mapCalendarType(
  type: BookingConfig['calendarType'] | undefined
): RentalObjectDetailsProjectionDTO['bookingCalendarType'] {
  if (!type) return 'time_slots';

  const mapping: Record<BookingConfig['calendarType'], RentalObjectDetailsProjectionDTO['bookingCalendarType']> = {
    TIME_SLOTS: 'time_slots',
    DAY_BOOKING: 'day_booking',
    SEASON_ALLOCATION: 'season_allocation',
    REQUEST_ONLY: 'request_only',
  };

  return mapping[type];
}
