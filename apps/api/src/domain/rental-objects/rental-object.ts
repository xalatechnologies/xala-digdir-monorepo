/**
 * Rental Object Domain Model
 *
 * Clean business representation of a rental object, independent of:
 * - Database schema (no snake_case, no ORM artifacts)
 * - API contracts (no DTOs, no serialization concerns)
 * - UI concerns (no display-ready formatting)
 *
 * This is the canonical representation used by business logic.
 */

// =============================================================================
// VALUE OBJECTS
// =============================================================================

/**
 * Location Value Object
 * Represents a physical address with optional coordinates
 */
export interface Location {
  street: string;
  postalCode: string;
  city: string;
  municipality: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Pricing Value Object
 * Represents pricing configuration for a rental object
 */
export interface Pricing {
  amount: number;
  currency: string;
  unit: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'FIXED';
  taxIncluded: boolean;
  taxRate: number;
}

/**
 * Capacity Value Object
 * Represents capacity and inventory configuration
 */
export interface Capacity {
  maximum: number;
  /** Total inventory count (null if not inventory-tracked) */
  inventoryTotal: number | null;
  /** Current available inventory (null if not inventory-tracked) */
  inventoryAvailable: number | null;
}

/**
 * Image Value Object
 * Represents a single image with metadata
 */
export interface Image {
  id: string;
  url: string;
  thumbnailUrl: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

/**
 * Contact Info Value Object
 * Represents contact information for a rental object
 */
export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  website: string | null;
}

/**
 * Opening Hours Value Object
 * Represents operating hours for a single day
 */
export interface OpeningHours {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  openTime: string; // HH:mm format
  closeTime: string; // HH:mm format
  isClosed: boolean;
}

/**
 * Booking Configuration Value Object
 * Represents booking rules and constraints
 */
export interface BookingConfig {
  /** Minimum booking duration in minutes */
  minDurationMinutes: number;
  /** Maximum booking duration in minutes */
  maxDurationMinutes: number;
  /** How many days in advance bookings can be made */
  advanceBookingDays: number;
  /** Cancellation deadline in hours before start */
  cancellationDeadlineHours: number;
  /** Whether bookings require manual approval */
  requiresApproval: boolean;
  /** Whether instant booking is enabled */
  instantBookingEnabled: boolean;
  /** Calendar mode for booking */
  calendarType: 'TIME_SLOTS' | 'DAY_BOOKING' | 'SEASON_ALLOCATION' | 'REQUEST_ONLY';
}

/**
 * Amenity Value Object
 * Represents a facility or feature available at the rental object
 */
export interface Amenity {
  id: string;
  name: string;
  icon: string;
  category: string;
}

/**
 * Equipment Value Object
 * Represents equipment included with the rental
 */
export interface Equipment {
  id: string;
  name: string;
  quantity: number;
  description: string;
}

/**
 * Rule Value Object
 * Represents a usage rule or guideline
 */
export interface Rule {
  id: string;
  title: string;
  content: string;
  order: number;
}

/**
 * FAQ Entry Value Object
 * Represents a frequently asked question
 */
export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  order: number;
}

/**
 * Additional Service Value Object
 * Represents optional purchasable add-ons
 */
export interface AdditionalService {
  id: string;
  name: string;
  description: string;
  pricing: Pricing;
  isOptional: boolean;
}

// =============================================================================
// DOMAIN ENTITY
// =============================================================================

/**
 * Rental Object Domain Entity
 *
 * Canonical business representation of a rental object.
 * Use this for all business logic operations.
 *
 * @example
 * const rentalObject: RentalObject = {
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   tenantId: 'skien-kommune',
 *   organizationId: 'kultur-og-idrett',
 *   name: 'Idrettshall Nord',
 *   slug: 'idrettshall-nord',
 *   description: 'Modern sports hall with capacity for 200 people',
 *   category: { key: 'LOKALER_OG_BANER', label: 'Lokaler og baner' },
 *   timeMode: 'PERIOD',
 *   features: ['SHARED_CAPACITY'],
 *   ruleSet: 'SPORTS_FACILITIES',
 *   status: 'PUBLISHED',
 *   requiresApproval: true,
 *   // ... rest of fields
 * };
 */
export interface RentalObject {
  // === IDENTITY ===
  id: string;
  tenantId: string;
  organizationId: string | null;

  // === CORE ATTRIBUTES ===
  name: string;
  slug: string;
  description: string;

  // === V3 CLASSIFICATION ===
  /** Category key (e.g., 'LOKALER_OG_BANER', 'UTSTYR_OG_INVENTAR') */
  category: {
    key: string;
    label: string; // i18n key or display label
  };

  /** Time mode for booking (PERIOD, SLOT, ALL_DAY) */
  timeMode: 'PERIOD' | 'SLOT' | 'ALL_DAY';

  /** Feature flags (INVENTORY, SHARED_CAPACITY, PACKAGES) */
  features: Array<'INVENTORY' | 'SHARED_CAPACITY' | 'PACKAGES'>;

  /** Rule set key (e.g., 'SPORTS_FACILITIES', 'VEHICLES') */
  ruleSet: string | null;

  // === STATUS & WORKFLOW ===
  /** Publication status (DRAFT, PUBLISHED, ARCHIVED) */
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

  /** Whether bookings require manual approval */
  requiresApproval: boolean;

  // === LOCATION ===
  location: Location | null;

  // === CAPACITY & INVENTORY ===
  capacity: Capacity | null;

  // === PRICING ===
  pricing: Pricing | null;

  // === MEDIA ===
  images: Image[];

  // === CONTACT ===
  contact: ContactInfo | null;

  // === OPERATING HOURS ===
  openingHours: OpeningHours[];

  // === BOOKING CONFIGURATION ===
  bookingConfig: BookingConfig | null;

  // === AMENITIES & EQUIPMENT ===
  amenities: Amenity[];
  equipment: Equipment[];

  // === RULES & FAQ ===
  rules: Rule[];
  faq: FaqEntry[];

  // === ADDITIONAL SERVICES ===
  additionalServices: AdditionalService[];

  // === HIGHLIGHTS ===
  /** Key selling points or features (for marketing) */
  highlights: string[];

  // === METADATA ===
  /** Whether the rental object is featured */
  isFeatured: boolean;

  /** Average rating (computed field) */
  averageRating: number | null;

  /** Number of reviews (computed field) */
  reviewCount: number;

  /** Custom metadata (flexible key-value pairs) */
  metadata: Record<string, unknown>;

  // === TIMESTAMPS ===
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// DOMAIN EVENTS
// =============================================================================

/**
 * Domain Events for Rental Objects
 * Used for audit logging and event sourcing
 */
export type RentalObjectEvent =
  | { type: 'RENTAL_OBJECT_CREATED'; payload: RentalObject }
  | { type: 'RENTAL_OBJECT_UPDATED'; payload: { id: string; changes: Partial<RentalObject> } }
  | { type: 'RENTAL_OBJECT_PUBLISHED'; payload: { id: string } }
  | { type: 'RENTAL_OBJECT_ARCHIVED'; payload: { id: string } }
  | { type: 'RENTAL_OBJECT_DELETED'; payload: { id: string } };

// =============================================================================
// DOMAIN VALIDATION RULES
// =============================================================================

/**
 * Domain Validation Errors
 */
export class RentalObjectValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'RentalObjectValidationError';
  }
}

/**
 * Domain Validation Rules
 * Business rules that must always be true
 */
export const RentalObjectRules = {
  /**
   * Validate that a rental object name is valid
   */
  validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new RentalObjectValidationError('Name is required', 'name', 'REQUIRED');
    }
    if (name.length < 3) {
      throw new RentalObjectValidationError(
        'Name must be at least 3 characters',
        'name',
        'MIN_LENGTH'
      );
    }
    if (name.length > 255) {
      throw new RentalObjectValidationError(
        'Name must not exceed 255 characters',
        'name',
        'MAX_LENGTH'
      );
    }
  },

  /**
   * Validate that capacity is positive
   */
  validateCapacity(capacity: Capacity | null): void {
    if (capacity && capacity.maximum <= 0) {
      throw new RentalObjectValidationError(
        'Capacity must be positive',
        'capacity.maximum',
        'INVALID_VALUE'
      );
    }
  },

  /**
   * Validate that inventory tracking is configured correctly
   */
  validateInventory(features: RentalObject['features'], capacity: Capacity | null): void {
    const hasInventoryFeature = features.includes('INVENTORY');

    if (hasInventoryFeature && !capacity?.inventoryTotal) {
      throw new RentalObjectValidationError(
        'Inventory feature requires inventoryTotal to be set',
        'capacity.inventoryTotal',
        'REQUIRED_FOR_FEATURE'
      );
    }
  },

  /**
   * Validate that shared capacity is configured correctly
   */
  validateSharedCapacity(features: RentalObject['features'], capacity: Capacity | null): void {
    const hasSharedCapacity = features.includes('SHARED_CAPACITY');

    if (hasSharedCapacity && !capacity?.maximum) {
      throw new RentalObjectValidationError(
        'Shared capacity feature requires maximum capacity to be set',
        'capacity.maximum',
        'REQUIRED_FOR_FEATURE'
      );
    }
  },

  /**
   * Validate that a rental object can be published
   */
  validateCanPublish(rentalObject: RentalObject): void {
    if (!rentalObject.name) {
      throw new RentalObjectValidationError('Name is required to publish', 'name', 'REQUIRED');
    }
    if (!rentalObject.description) {
      throw new RentalObjectValidationError(
        'Description is required to publish',
        'description',
        'REQUIRED'
      );
    }
    if (rentalObject.images.length === 0) {
      throw new RentalObjectValidationError(
        'At least one image is required to publish',
        'images',
        'REQUIRED'
      );
    }
    if (!rentalObject.pricing) {
      throw new RentalObjectValidationError('Pricing is required to publish', 'pricing', 'REQUIRED');
    }
  },

  /**
   * Validate all business rules for a rental object
   */
  validateAll(rentalObject: RentalObject): void {
    this.validateName(rentalObject.name);
    this.validateCapacity(rentalObject.capacity);
    this.validateInventory(rentalObject.features, rentalObject.capacity);
    this.validateSharedCapacity(rentalObject.features, rentalObject.capacity);

    if (rentalObject.status === 'PUBLISHED') {
      this.validateCanPublish(rentalObject);
    }
  },
};
