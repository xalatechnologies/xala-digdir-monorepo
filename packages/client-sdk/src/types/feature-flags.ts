/**
 * Feature Flags & Tenant Controls
 * Tenant-controlled access to rental object categories and platform features
 */

/**
 * Rental Object Categories
 */
export enum RentalObjectCategory {
  LOCALE = 'LOCALE',           // Rooms/spaces (lokaler/rom)
  ARRANGEMENT = 'ARRANGEMENT', // Events/activities (arrangement/aktiviteter)
  EQUIPMENT = 'EQUIPMENT',     // Equipment (utstyr) - future
  VEHICLE = 'VEHICLE',         // Vehicles (kjøretøy) - future
  OTHER = 'OTHER',             // Other (annet) - placeholder
}

/**
 * Feature Flag Keys
 */
export enum FeatureFlag {
  // Backoffice modules
  BACKOFFICE_ORG_MANAGEMENT = 'backoffice.orgManagement',
  BACKOFFICE_REPORTING = 'backoffice.reporting',
  BACKOFFICE_AUDIT_LOG = 'backoffice.auditLog',
  BACKOFFICE_MESSAGING = 'backoffice.messaging',
  BACKOFFICE_MAINTENANCE_CALENDAR = 'backoffice.maintenanceCalendar',
  
  // Web/Public modules
  WEB_RATINGS = 'web.ratings',
  WEB_FEEDBACK = 'web.feedback',
  WEB_PUBLIC_ACTIVITY_CALENDAR = 'web.publicActivityCalendar',
  WEB_PAYMENTS = 'web.payments',
  
  // Rental object features
  RENTAL_OBJECT_RECURRING_BOOKINGS = 'rentalObject.recurringBookings',
  RENTAL_OBJECT_PACKAGES = 'rentalObject.packages',
  RENTAL_OBJECT_DISCOUNTS = 'rentalObject.discounts',
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
  // Backoffice - all enabled by default
  [FeatureFlag.BACKOFFICE_ORG_MANAGEMENT]: true,
  [FeatureFlag.BACKOFFICE_REPORTING]: true,
  [FeatureFlag.BACKOFFICE_AUDIT_LOG]: true,
  [FeatureFlag.BACKOFFICE_MESSAGING]: true,
  [FeatureFlag.BACKOFFICE_MAINTENANCE_CALENDAR]: true,
  
  // Web - selective by default
  [FeatureFlag.WEB_RATINGS]: false,
  [FeatureFlag.WEB_FEEDBACK]: false,
  [FeatureFlag.WEB_PUBLIC_ACTIVITY_CALENDAR]: true,
  [FeatureFlag.WEB_PAYMENTS]: false,
  
  // Rental object features
  [FeatureFlag.RENTAL_OBJECT_RECURRING_BOOKINGS]: true,
  [FeatureFlag.RENTAL_OBJECT_PACKAGES]: true,
  [FeatureFlag.RENTAL_OBJECT_DISCOUNTS]: true,
};

/**
 * Demo tenant preset (Cheyenne Kommune)
 * Minimal feature set for demo purposes
 */
export const DEMO_FEATURE_FLAGS: FeatureFlags = {
  // Backoffice - demo-safe subset
  [FeatureFlag.BACKOFFICE_ORG_MANAGEMENT]: true,
  [FeatureFlag.BACKOFFICE_REPORTING]: false,  // Hide for demo
  [FeatureFlag.BACKOFFICE_AUDIT_LOG]: true,
  [FeatureFlag.BACKOFFICE_MESSAGING]: true,
  [FeatureFlag.BACKOFFICE_MAINTENANCE_CALENDAR]: true,
  
  // Web - minimal for demo
  [FeatureFlag.WEB_RATINGS]: false,
  [FeatureFlag.WEB_FEEDBACK]: false,
  [FeatureFlag.WEB_PUBLIC_ACTIVITY_CALENDAR]: true,
  [FeatureFlag.WEB_PAYMENTS]: false,
  
  // Rental object features
  [FeatureFlag.RENTAL_OBJECT_RECURRING_BOOKINGS]: true,
  [FeatureFlag.RENTAL_OBJECT_PACKAGES]: false,
  [FeatureFlag.RENTAL_OBJECT_DISCOUNTS]: false,
};

/**
 * Category labels for UI
 */
export const RENTAL_OBJECT_CATEGORY_LABELS: Record<RentalObjectCategory, { no: string; en: string }> = {
  [RentalObjectCategory.LOCALE]: {
    no: 'Lokaler',
    en: 'Spaces',
  },
  [RentalObjectCategory.ARRANGEMENT]: {
    no: 'Arrangement',
    en: 'Events',
  },
  [RentalObjectCategory.EQUIPMENT]: {
    no: 'Utstyr',
    en: 'Equipment',
  },
  [RentalObjectCategory.VEHICLE]: {
    no: 'Kjøretøy',
    en: 'Vehicles',
  },
  [RentalObjectCategory.OTHER]: {
    no: 'Annet',
    en: 'Other',
  },
};
