/**
 * Booking-Rentals Domain Module
 * 
 * The core domain module for the Digilist platform.
 * Handles rental objects, bookings, calendar, pricing, seasons, and related features.
 * 
 * @module domain/booking-rentals
 * @since 1.0.0
 */

import type { DomainModuleDefinition } from '../types';

// =============================================================================
// MODULE MANIFEST
// =============================================================================

const manifest: DomainModuleDefinition['manifest'] = {
  id: 'BOOKING_RENTALS',
  name: {
    en: 'Booking & Rentals',
    nb: 'Booking og Utleie',
  },
  description: {
    en: 'Complete booking and rental management system for venues, equipment, and spaces',
    nb: 'Komplett booking- og utleiesystem for lokaler, utstyr og rom',
  },
  version: '1.0.0',
  category: 'domain',
  dependencies: [], // No dependencies on other domain modules
  capabilities: [
    // Core capabilities
    'booking',
    'rentals',
    'calendar',
    'pricing',
    
    // Feature capabilities
    'seasons',
    'seasonal_lease',
    'season_applications',
    'allocations',
    'availability',
    'blocks',
    
    // Add-on capabilities
    'addons',
    'amenities',
    'favorites',
    'reviews',
    'discount_codes',
    
    // Access capabilities
    'access_grants',
    'user_groups',
  ],
  isCore: true, // Core module - cannot be disabled (for now)
  defaultEnabled: true,
  configSchema: {
    type: 'object',
    properties: {
      enableSeasons: { type: 'boolean', default: true },
      enableRecurringBookings: { type: 'boolean', default: true },
      enableReviews: { type: 'boolean', default: true },
      enableAddons: { type: 'boolean', default: true },
      defaultBookingMode: {
        type: 'string',
        enum: ['INSTANT', 'REQUEST', 'APPROVAL_REQUIRED'],
        default: 'REQUEST',
      },
    },
  },
};

// =============================================================================
// SCHEMA CONTRIBUTION
// =============================================================================

const schema: DomainModuleDefinition['schema'] = {
  schemaName: 'domain',
  tables: [
    // Core tables
    'rental_objects',
    'bookings',
    'booking_lines',
    'booking_addons',
    'booking_history',
    
    // Calendar tables
    'calendar_events',
    'recurring_patterns',
    
    // Pricing tables
    'pricing_groups',
    'price_rules',
    'discount_codes',
    
    // Season tables
    'seasons',
    'season_periods',
    'season_applications',
    'seasonal_leases',
    'allocations',
    
    // Feature tables
    'availability_blocks',
    'amenities',
    'rental_object_amenities',
    'addons',
    'rental_object_addons',
    'favorites',
    'reviews',
    
    // Access tables
    'access_grants',
    'user_groups',
    'user_group_memberships',
  ],
  migrations: [
    '0001_clean_schema.sql',
    '0015_domain_availability.sql',
    '0016_domain_pricing_engine.sql',
    '0030_favorites_and_conflicts.sql',
    '0031_activity_calendar.sql',
  ],
};

// =============================================================================
// POLICY CONTRIBUTION
// =============================================================================

const policies: DomainModuleDefinition['policies'] = {
  policyTypes: [
    'booking',
    'pricing',
    'approval',
    'availability',
  ],
  policySchemas: {
    booking: {
      type: 'object',
      properties: {
        allowedModes: {
          type: 'array',
          items: { type: 'string', enum: ['INSTANT', 'REQUEST', 'APPROVAL_REQUIRED'] },
        },
        slotRules: {
          type: 'object',
          properties: {
            minDurationMinutes: { type: 'integer', minimum: 15 },
            maxDurationMinutes: { type: 'integer', maximum: 1440 },
            bufferMinutes: { type: 'integer', minimum: 0 },
            allowOvernight: { type: 'boolean' },
          },
        },
        recurringRules: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            maxOccurrences: { type: 'integer', maximum: 52 },
            allowedPatterns: {
              type: 'array',
              items: { type: 'string', enum: ['daily', 'weekly', 'monthly'] },
            },
          },
        },
      },
    },
    pricing: {
      type: 'object',
      properties: {
        basePricing: {
          type: 'object',
          properties: {
            defaultHourlyRate: { type: 'number', minimum: 0 },
            defaultDailyRate: { type: 'number', minimum: 0 },
            currency: { type: 'string', default: 'NOK' },
          },
        },
        discountRules: {
          type: 'object',
          properties: {
            memberDiscount: { type: 'number', minimum: 0, maximum: 100 },
          },
        },
      },
    },
  },
  defaultPolicies: {
    booking: {
      allowedModes: ['REQUEST'],
      slotRules: {
        minDurationMinutes: 60,
        maxDurationMinutes: 480,
        bufferMinutes: 15,
        allowOvernight: false,
      },
      recurringRules: {
        enabled: true,
        maxOccurrences: 26,
        allowedPatterns: ['weekly'],
      },
    },
    pricing: {
      basePricing: {
        defaultHourlyRate: 0,
        defaultDailyRate: 0,
        currency: 'NOK',
      },
      discountRules: {
        memberDiscount: 0,
      },
    },
  },
};

// =============================================================================
// DTO CONTRIBUTION
// =============================================================================

const dtos: DomainModuleDefinition['dtos'] = {
  projections: [
    {
      id: 'RentalObjectCardProjectionDTO',
      entity: 'RentalObject',
      screens: ['SearchResults', 'FeaturedRentalObjects', 'CategoryGrid', 'MapView'],
      roles: ['public', 'user', 'saksbehandler', 'admin', 'tenantAdmin'],
      cost: 'cheap',
      cacheTtl: 'medium',
      hasRelations: false,
      estimatedSize: 2,
    },
    {
      id: 'RentalObjectDetailsProjectionDTO',
      entity: 'RentalObject',
      screens: ['RentalObjectDetailPage', 'BookingModal'],
      roles: ['public', 'user', 'saksbehandler', 'admin', 'tenantAdmin'],
      cost: 'medium',
      cacheTtl: 'medium',
      hasRelations: true,
      estimatedSize: 15,
    },
    {
      id: 'BookingCardProjectionDTO',
      entity: 'Booking',
      screens: ['MyBookings', 'OrgBookings', 'RecentBookings'],
      roles: ['user', 'saksbehandler', 'admin'],
      cost: 'cheap',
      cacheTtl: 'short',
      hasRelations: false,
      estimatedSize: 3,
    },
    {
      id: 'BookingDetailsProjectionDTO',
      entity: 'Booking',
      screens: ['BookingDetailPage', 'BookingModal', 'ApprovalDrawer'],
      roles: ['user', 'saksbehandler', 'admin'],
      cost: 'medium',
      cacheTtl: 'short',
      hasRelations: true,
      estimatedSize: 10,
    },
    {
      id: 'BookingQuoteProjectionDTO',
      entity: 'Booking',
      screens: ['BookingCheckout', 'PricePreview'],
      roles: ['public', 'user'],
      cost: 'heavy',
      cacheTtl: 'short',
      hasRelations: true,
      estimatedSize: 5,
    },
  ],
  interfaces: [
    'RentalObjectCardProjectionDTO',
    'RentalObjectDetailsProjectionDTO',
    'BookingCardProjectionDTO',
    'BookingDetailsProjectionDTO',
    'BookingQuoteProjectionDTO',
    'AvailabilitySlotDTO',
    'PriceBreakdownItemDTO',
    'SeasonDTO',
    'AllocationDTO',
  ],
};

// =============================================================================
// NAVIGATION CONTRIBUTION
// =============================================================================

const navigation: DomainModuleDefinition['navigation'] = {
  web: [
    {
      id: 'browse',
      label: { en: 'Browse', nb: 'Utforsk' },
      href: '/search',
      icon: 'search',
      order: 1,
    },
    {
      id: 'categories',
      label: { en: 'Categories', nb: 'Kategorier' },
      href: '/categories',
      icon: 'grid',
      order: 2,
    },
  ],
  backoffice: [
    {
      id: 'rental-objects',
      label: { en: 'Rental Objects', nb: 'Utleieobjekter' },
      href: '/rental-objects',
      icon: 'building',
      requiredCapability: 'rentals',
      order: 1,
    },
    {
      id: 'calendar',
      label: { en: 'Calendar', nb: 'Kalender' },
      href: '/calendar',
      icon: 'calendar',
      requiredCapability: 'calendar',
      order: 2,
    },
    {
      id: 'bookings',
      label: { en: 'Bookings', nb: 'Bookinger' },
      href: '/bookings',
      icon: 'clipboard',
      requiredCapability: 'booking',
      order: 3,
      children: [
        {
          id: 'bookings-pending',
          label: { en: 'Pending Approval', nb: 'Venter på godkjenning' },
          href: '/bookings/pending',
          order: 1,
        },
        {
          id: 'bookings-all',
          label: { en: 'All Bookings', nb: 'Alle bookinger' },
          href: '/bookings',
          order: 2,
        },
      ],
    },
    {
      id: 'seasons',
      label: { en: 'Seasons', nb: 'Sesonger' },
      href: '/seasons',
      icon: 'sun',
      requiredCapability: 'seasons',
      order: 4,
    },
    {
      id: 'pricing',
      label: { en: 'Pricing', nb: 'Priser' },
      href: '/pricing',
      icon: 'credit-card',
      requiredCapability: 'pricing',
      order: 5,
    },
  ],
  minside: [
    {
      id: 'my-bookings',
      label: { en: 'My Bookings', nb: 'Mine bookinger' },
      href: '/bookings',
      icon: 'calendar',
      requiredCapability: 'booking',
      order: 1,
    },
    {
      id: 'favorites',
      label: { en: 'Favorites', nb: 'Favoritter' },
      href: '/favorites',
      icon: 'heart',
      requiredCapability: 'favorites',
      order: 2,
    },
  ],
};

// =============================================================================
// SEARCH CONTRIBUTION
// =============================================================================

const search: DomainModuleDefinition['search'] = {
  indexableEntities: ['RentalObject', 'Booking'],
  fieldMappings: {
    RentalObject: [
      { field: 'name', type: 'text', boost: 2, searchable: true, filterable: false },
      { field: 'description', type: 'text', boost: 1, searchable: true, filterable: false },
      { field: 'category', type: 'keyword', searchable: false, filterable: true },
      { field: 'city', type: 'keyword', searchable: true, filterable: true },
      { field: 'capacity', type: 'number', searchable: false, filterable: true },
      { field: 'location', type: 'geo', searchable: false, filterable: true },
    ],
    Booking: [
      { field: 'referenceNumber', type: 'keyword', boost: 3, searchable: true, filterable: true },
      { field: 'status', type: 'keyword', searchable: false, filterable: true },
      { field: 'startDate', type: 'date', searchable: false, filterable: true },
    ],
  },
};

// =============================================================================
// SEED CONTRIBUTION
// =============================================================================

const seed: DomainModuleDefinition['seed'] = {
  entityOrder: [
    'amenities',
    'addons',
    'rental_objects',
    'pricing_groups',
    'seasons',
    'bookings',
    'reviews',
  ],
  scenarios: [
    {
      id: 'demo_kommune',
      name: 'Demo Kommune',
      description: 'Standard Norwegian municipality with sports halls, meeting rooms, and equipment',
      entities: {
        rental_objects: 20,
        bookings: 50,
        reviews: 30,
      },
    },
    {
      id: 'small_test',
      name: 'Small Test',
      description: 'Minimal data for unit testing',
      entities: {
        rental_objects: 3,
        bookings: 5,
      },
    },
  ],
};

// =============================================================================
// DOCUMENTATION CONTRIBUTION
// =============================================================================

const docs: DomainModuleDefinition['docs'] = {
  sections: [
    {
      id: 'booking-guide',
      title: { en: 'Booking Guide', nb: 'Bookingguide' },
      order: 1,
    },
    {
      id: 'rental-objects',
      title: { en: 'Rental Objects', nb: 'Utleieobjekter' },
      order: 2,
    },
    {
      id: 'seasons-allocations',
      title: { en: 'Seasons & Allocations', nb: 'Sesonger og tildelinger' },
      order: 3,
    },
    {
      id: 'pricing',
      title: { en: 'Pricing', nb: 'Prising' },
      order: 4,
    },
  ],
  faq: [
    {
      question: { en: 'How do I book a rental object?', nb: 'Hvordan booker jeg et lokale?' },
      answer: {
        en: 'Navigate to the rental object page and click "Book Now" to start the booking process.',
        nb: 'Gå til lokalesiden og klikk "Book nå" for å starte bookingprosessen.',
      },
      category: 'booking',
    },
    {
      question: { en: 'How do I cancel a booking?', nb: 'Hvordan kansellerer jeg en booking?' },
      answer: {
        en: 'Go to My Bookings, find the booking, and click "Cancel".',
        nb: 'Gå til Mine bookinger, finn bookingen, og klikk "Kanseller".',
      },
      category: 'booking',
    },
  ],
};

// =============================================================================
// COMPLETE MODULE DEFINITION
// =============================================================================

const bookingRentalsModule: DomainModuleDefinition = {
  manifest,
  schema,
  policies,
  dtos,
  navigation,
  search,
  seed,
  docs,
};

export default bookingRentalsModule;
