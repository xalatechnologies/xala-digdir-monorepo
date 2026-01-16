/**
 * Rental Domain Seed Data
 * 4 Categories + 3 Time Modes + 3 Features + Rule Sets
 * 
 * Source of Truth - All UI/rules derive from these tables
 */

// =============================================================================
// CATEGORIES (4 hovedkategorier)
// =============================================================================

export const CATEGORIES = [
  {
    key: 'LOKALER_OG_BANER',
    titleNb: 'Lokaler og baner',
    titleEn: 'Venues and courts',
    defaultTimeMode: 'PERIOD',
    allowedTimeModes: ['PERIOD', 'SLOT', 'ALL_DAY'],
    allowedFeatures: ['SHARED_CAPACITY'],
    uiIcon: 'building',
    sortOrder: 1,
  },
  {
    key: 'UTSTYR_OG_INVENTAR',
    titleNb: 'Utstyr og inventar',
    titleEn: 'Equipment and inventory',
    defaultTimeMode: 'ALL_DAY',
    allowedTimeModes: ['ALL_DAY', 'PERIOD'],
    allowedFeatures: ['INVENTORY'],
    uiIcon: 'tool',
    sortOrder: 2,
  },
  {
    key: 'KJORETOY_OG_TRANSPORT',
    titleNb: 'Kjøretøy og transport',
    titleEn: 'Vehicles and transport',
    defaultTimeMode: 'ALL_DAY',
    allowedTimeModes: ['ALL_DAY', 'PERIOD'],
    allowedFeatures: ['INVENTORY'],
    uiIcon: 'car',
    sortOrder: 3,
  },
  {
    key: 'OPPLEVELSER_OG_ARRANGEMENT',
    titleNb: 'Opplevelser og arrangement',
    titleEn: 'Experiences and events',
    defaultTimeMode: 'SLOT',
    allowedTimeModes: ['SLOT', 'PERIOD'],
    allowedFeatures: ['SHARED_CAPACITY', 'PACKAGES'],
    uiIcon: 'calendar',
    sortOrder: 4,
  },
] as const;

export type CategoryKey = typeof CATEGORIES[number]['key'];

// =============================================================================
// TIME MODES (3 tidsmoduser)
// =============================================================================

export const TIME_MODES = [
  {
    key: 'PERIOD',
    titleNb: 'Tidsperiode',
    titleEn: 'Time period',
    calendarUiVariant: 'timeline',
    sortOrder: 1,
  },
  {
    key: 'SLOT',
    titleNb: 'Tidsluke',
    titleEn: 'Time slot',
    calendarUiVariant: 'slot-grid',
    sortOrder: 2,
  },
  {
    key: 'ALL_DAY',
    titleNb: 'Heldags',
    titleEn: 'Full day',
    calendarUiVariant: 'day-cards',
    sortOrder: 3,
  },
] as const;

export type TimeModeKey = typeof TIME_MODES[number]['key'];

// =============================================================================
// FEATURES (3 tilleggsfunksjoner)
// =============================================================================

export const FEATURES = [
  {
    key: 'INVENTORY',
    titleNb: 'Beholdning',
    titleEn: 'Inventory',
    description: 'Track quantity available (x igjen)',
  },
  {
    key: 'SHARED_CAPACITY',
    titleNb: 'Delt kapasitet',
    titleEn: 'Shared capacity',
    description: 'Track seats/places available (plasser igjen)',
  },
  {
    key: 'PACKAGES',
    titleNb: 'Pakker',
    titleEn: 'Packages',
    description: 'Bundle items and add-ons for checkout',
  },
] as const;

export type FeatureKey = typeof FEATURES[number]['key'];

// =============================================================================
// RULE SETS (gjenbrukbare regler)
// =============================================================================

export const RULE_SETS = [
  {
    key: 'RS_LOKALE_STANDARD',
    titleNb: 'Standard lokale',
    titleEn: 'Standard venue',
    timeMode: 'PERIOD',
    rules: {
      capacityRequired: true,
      bufferMinutes: 30,
      maxDurationHours: 8,
      requiresApproval: false,
    },
  },
  {
    key: 'RS_BANE_SLOT',
    titleNb: 'Bane med tidsluke',
    titleEn: 'Court with slots',
    timeMode: 'SLOT',
    rules: {
      slotDurationMinutes: 60,
      supportRecurring: true,
      pricePerSlot: true,
      requiresApproval: false,
    },
  },
  {
    key: 'RS_UTSTYR_HELDAG',
    titleNb: 'Utstyr heldags',
    titleEn: 'Equipment full day',
    timeMode: 'ALL_DAY',
    rules: {
      inventoryEnabled: true,
      depositRequired: false,
      pickupReturnWindow: true,
      requiresApproval: false,
    },
  },
  {
    key: 'RS_KJORETOY',
    titleNb: 'Kjøretøy',
    titleEn: 'Vehicle',
    timeMode: 'ALL_DAY',
    rules: {
      requiresLicense: true,
      minimumAge: 18,
      insuranceRequired: true,
      requiresApproval: true,
    },
  },
  {
    key: 'RS_EVENT_KAPASITET',
    titleNb: 'Arrangement med kapasitet',
    titleEn: 'Event with capacity',
    timeMode: 'SLOT',
    rules: {
      sharedCapacityEnabled: true,
      cancellationPolicy: 'flexible',
      requiresApproval: true,
    },
  },
] as const;

export type RuleSetKey = typeof RULE_SETS[number]['key'];
