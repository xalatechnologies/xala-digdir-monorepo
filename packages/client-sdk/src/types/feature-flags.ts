/**
 * Feature Flags & Tenant Controls
 * Tenant-controlled access to rental object categories and platform features
 */

import type { RentalObjectCategory } from './rental-object';
// Note: RentalObjectCategory is exported from types/index.ts via rental-object.ts

/**
 * Feature Flag Keys (CANONICAL - follows naming convention: feature.{module})
 * Reference: docs/roles/matrix.md Section 3
 * Naming: feature.{module} or integrations.{name}
 */
export enum FeatureFlag {
  // Core modules (always on in production)
  RENTAL_OBJECTS = 'feature.rental_objects',
  BOOKINGS = 'feature.bookings',
  CALENDAR = 'feature.calendar',
  
  // Backoffice modules
  BLOCKS_MAINTENANCE = 'feature.blocks_maintenance',
  REPORTS_EXPORTS = 'feature.reports_exports',
  AUDIT_LOG = 'feature.audit_log',
  MESSAGING = 'feature.messaging',
  
  // Web/Public modules
  RATINGS_REVIEWS = 'feature.ratings_reviews',
  FAVORITES = 'feature.favorites',
  HELP_SUPPORT = 'feature.help_support',
  GLOBAL_SEARCH = 'feature.global_search',
  
  // Advanced booking features
  RECURRING_BOOKINGS = 'feature.recurring_bookings',
  SEASON_RENTALS = 'feature.season_rentals',
  
  // Economy modules
  PRICING = 'feature.pricing',
  ECONOMY_INVOICING = 'feature.economy_invoicing',
  PAYMENTS = 'feature.payments',
  
  // Compliance
  GDPR_TOOLS = 'feature.gdpr_tools',
  
  // Integrations
  INTEGRATION_IDPORTEN = 'integrations.idporten',
  INTEGRATION_VIPPS = 'integrations.vipps',
  INTEGRATION_STRIPE = 'integrations.stripe',
}

/**
 * Feature flags configuration
 */
export interface FeatureFlags {
  [key: string]: boolean;
}

/**
 * Tenant features response
 */
export interface TenantFeatures {
  tenantId: string;
  tenantName: string;
  enabledRentalObjectCategories: RentalObjectCategory[];
  featureFlags: FeatureFlags;
}

/**
 * Default feature flags for new tenants
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  // Core modules (always on)
  [FeatureFlag.RENTAL_OBJECTS]: true,
  [FeatureFlag.BOOKINGS]: true,
  [FeatureFlag.CALENDAR]: true,
  
  // Backoffice modules
  [FeatureFlag.BLOCKS_MAINTENANCE]: true,
  [FeatureFlag.REPORTS_EXPORTS]: true,
  [FeatureFlag.AUDIT_LOG]: true,
  [FeatureFlag.MESSAGING]: true,
  
  // Web/Public modules
  [FeatureFlag.RATINGS_REVIEWS]: false,  // Opt-in
  [FeatureFlag.FAVORITES]: true,
  [FeatureFlag.HELP_SUPPORT]: true,
  [FeatureFlag.GLOBAL_SEARCH]: true,
  
  // Advanced booking
  [FeatureFlag.RECURRING_BOOKINGS]: true,
  [FeatureFlag.SEASON_RENTALS]: false,  // Opt-in
  
  // Economy
  [FeatureFlag.PRICING]: true,
  [FeatureFlag.ECONOMY_INVOICING]: false,  // Subscription-gated
  [FeatureFlag.PAYMENTS]: false,  // Subscription-gated
  
  // Compliance
  [FeatureFlag.GDPR_TOOLS]: true,
  
  // Integrations
  [FeatureFlag.INTEGRATION_IDPORTEN]: true,
  [FeatureFlag.INTEGRATION_VIPPS]: false,
  [FeatureFlag.INTEGRATION_STRIPE]: false,
};

/**
 * Demo tenant preset
 * Minimal feature set for demo purposes
 */
export const DEMO_FEATURE_FLAGS: FeatureFlags = {
  // Core modules
  [FeatureFlag.RENTAL_OBJECTS]: true,
  [FeatureFlag.BOOKINGS]: true,
  [FeatureFlag.CALENDAR]: true,
  
  // Backoffice - demo-safe subset
  [FeatureFlag.BLOCKS_MAINTENANCE]: true,
  [FeatureFlag.REPORTS_EXPORTS]: false,  // Hide for demo
  [FeatureFlag.AUDIT_LOG]: true,
  [FeatureFlag.MESSAGING]: true,
  
  // Web - minimal
  [FeatureFlag.RATINGS_REVIEWS]: false,
  [FeatureFlag.FAVORITES]: true,
  [FeatureFlag.HELP_SUPPORT]: true,
  [FeatureFlag.GLOBAL_SEARCH]: true,
  
  // Advanced booking
  [FeatureFlag.RECURRING_BOOKINGS]: true,
  [FeatureFlag.SEASON_RENTALS]: false,
  
  // Economy - disabled for demo
  [FeatureFlag.PRICING]: true,
  [FeatureFlag.ECONOMY_INVOICING]: false,
  [FeatureFlag.PAYMENTS]: false,
  
  // Compliance
  [FeatureFlag.GDPR_TOOLS]: true,
  
  // Integrations
  [FeatureFlag.INTEGRATION_IDPORTEN]: true,
  [FeatureFlag.INTEGRATION_VIPPS]: false,
  [FeatureFlag.INTEGRATION_STRIPE]: false,
};

/**
 * Category labels for UI (matches canonical categories in rental-object.ts)
 */
export const RENTAL_OBJECT_CATEGORY_LABELS: Record<RentalObjectCategory, { no: string; en: string }> = {
  LOKALER_OG_BANER: {
    no: 'Lokaler og baner',
    en: 'Spaces and Fields',
  },
  UTSTYR_OG_INVENTAR: {
    no: 'Utstyr og inventar',
    en: 'Equipment and Inventory',
  },
  KJORETOY_OG_TRANSPORT: {
    no: 'Kjøretøy og transport',
    en: 'Vehicles and Transport',
  },
  OPPLEVELSER_OG_ARRANGEMENT: {
    no: 'Opplevelser og arrangementer',
    en: 'Experiences and Events',
  },
};
