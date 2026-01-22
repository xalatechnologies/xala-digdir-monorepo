/**
 * Category Metadata Schemas
 * 3 categories: LOCALE (venues/rental objects), ARRANGEMENT (events), UTSTYR (equipment)
 */

// =============================================================================
// CATEGORIES
// =============================================================================

export const CATEGORIES = ['LOCALE', 'ARRANGEMENT', 'UTSTYR'] as const;
export type Category = typeof CATEGORIES[number];

// =============================================================================
// METADATA PER CATEGORY
// =============================================================================

/** LOCALE - Venues, halls, rooms, rental objects */
export interface LocaleMetadata {
  address: string;
  capacity: number;
  squareMeters: number;
  amenities: string[];
  accessibility: boolean;
}

/** ARRANGEMENT - Events, packages, services */
export interface ArrangementMetadata {
  duration: number;           // Minutes
  maxGuests: number;
  includes: string[];
  leadTimeDays: number;
}

/** UTSTYR - Equipment, tools */
export interface UtstyrMetadata {
  quantity: number;
  condition: 'new' | 'good' | 'fair';
  requiresTraining: boolean;
  deposit: number;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const defaultMetadata: Record<Category, object> = {
  LOCALE: {
    address: '',
    capacity: 0,
    squareMeters: 0,
    amenities: [],
    accessibility: true,
  },
  ARRANGEMENT: {
    duration: 120,
    maxGuests: 50,
    includes: [],
    leadTimeDays: 3,
  },
  UTSTYR: {
    quantity: 1,
    condition: 'good',
    requiresTraining: false,
    deposit: 0,
  },
};

// =============================================================================
// PRICING
// =============================================================================

export interface Pricing {
  basePrice: number;
  currency: 'NOK';
  unit: 'hour' | 'day' | 'event' | 'item';
}
