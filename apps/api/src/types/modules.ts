/**
 * Module System Types
 *
 * Local type definitions for the module-based feature flag system.
 * These replace imports from the deleted @xalatechnologies/platform/contracts/modules package.
 */

// =============================================================================
// Module Types
// =============================================================================

export interface ModuleName {
  en: string;
  nb: string;
}

export interface ModuleDefinition {
  key: string;
  name: ModuleName;
  description: ModuleName;
  category: 'core' | 'booking' | 'communication' | 'integration' | 'analytics' | 'compliance';
  dependencies: string[];
  capabilities: string[];
  isCore: boolean;
  defaultEnabled: boolean;
}

export interface ModuleDTO {
  key: string;
  enabled: boolean;
  config?: Record<string, unknown>;
  updatedAt?: string;
}

export interface ModuleInfoDTO {
  key: string;
  name: ModuleName;
  description: ModuleName;
  category: string;
  dependencies: string[];
  capabilities: string[];
  isCore: boolean;
  defaultEnabled: boolean;
}

export interface ModuleCatalogDTO {
  modules: ModuleInfoDTO[];
  capabilities: string[];
  categories: string[];
}

export interface EffectiveModulesDTO {
  modules: ModuleDTO[];
  capabilities: Record<string, boolean>;
  tenantId: string;
  organizationId?: string;
}

export interface ModuleValidationError {
  code: 'MISSING_DEPENDENCY' | 'CORE_MODULE' | 'DEPENDENT_ENABLED';
  message: string;
  moduleKey: string;
  relatedModules?: string[];
}

export interface ModuleValidationResult {
  valid: boolean;
  errors: ModuleValidationError[];
}

export interface UpdateModuleDTO {
  enabled: boolean;
  config?: Record<string, unknown>;
}

// =============================================================================
// Module Registry
// =============================================================================

export type ModuleKeyType =
  | 'core'
  | 'bookings'
  | 'calendar'
  | 'seasons'
  | 'pricing'
  | 'notifications'
  | 'messaging'
  | 'reports'
  | 'integrations'
  | 'gdpr'
  | 'audit';

export const MODULE_REGISTRY: Record<ModuleKeyType, ModuleDefinition> = {
  core: {
    key: 'core',
    name: { en: 'Core', nb: 'Kjerne' },
    description: { en: 'Core platform functionality', nb: 'Kjernefunksjonalitet' },
    category: 'core',
    dependencies: [],
    capabilities: ['platform.access'],
    isCore: true,
    defaultEnabled: true,
  },
  bookings: {
    key: 'bookings',
    name: { en: 'Bookings', nb: 'Bookinger' },
    description: { en: 'Booking management', nb: 'Bookingadministrasjon' },
    category: 'booking',
    dependencies: ['core'],
    capabilities: ['bookings.read', 'bookings.create', 'bookings.update', 'bookings.delete'],
    isCore: false,
    defaultEnabled: true,
  },
  calendar: {
    key: 'calendar',
    name: { en: 'Calendar', nb: 'Kalender' },
    description: { en: 'Calendar and availability management', nb: 'Kalender og tilgjengelighet' },
    category: 'booking',
    dependencies: ['core', 'bookings'],
    capabilities: ['calendar.read', 'calendar.manage'],
    isCore: false,
    defaultEnabled: true,
  },
  seasons: {
    key: 'seasons',
    name: { en: 'Seasons', nb: 'Sesonger' },
    description: { en: 'Seasonal booking management', nb: 'Sesongbooking' },
    category: 'booking',
    dependencies: ['core', 'bookings'],
    capabilities: ['seasons.read', 'seasons.manage'],
    isCore: false,
    defaultEnabled: false,
  },
  pricing: {
    key: 'pricing',
    name: { en: 'Pricing', nb: 'Prising' },
    description: { en: 'Pricing and discount management', nb: 'Prising og rabatter' },
    category: 'booking',
    dependencies: ['core'],
    capabilities: ['pricing.read', 'pricing.manage'],
    isCore: false,
    defaultEnabled: true,
  },
  notifications: {
    key: 'notifications',
    name: { en: 'Notifications', nb: 'Varsler' },
    description: { en: 'Email and push notifications', nb: 'E-post og push-varsler' },
    category: 'communication',
    dependencies: ['core'],
    capabilities: ['notifications.send', 'notifications.manage'],
    isCore: false,
    defaultEnabled: true,
  },
  messaging: {
    key: 'messaging',
    name: { en: 'Messaging', nb: 'Meldinger' },
    description: { en: 'In-app messaging', nb: 'Meldinger i appen' },
    category: 'communication',
    dependencies: ['core'],
    capabilities: ['messaging.read', 'messaging.send'],
    isCore: false,
    defaultEnabled: false,
  },
  reports: {
    key: 'reports',
    name: { en: 'Reports', nb: 'Rapporter' },
    description: { en: 'Analytics and reporting', nb: 'Analyse og rapportering' },
    category: 'analytics',
    dependencies: ['core'],
    capabilities: ['reports.read', 'reports.export'],
    isCore: false,
    defaultEnabled: false,
  },
  integrations: {
    key: 'integrations',
    name: { en: 'Integrations', nb: 'Integrasjoner' },
    description: { en: 'Third-party integrations', nb: 'Tredjepartsintegrasjoner' },
    category: 'integration',
    dependencies: ['core'],
    capabilities: ['integrations.manage'],
    isCore: false,
    defaultEnabled: false,
  },
  gdpr: {
    key: 'gdpr',
    name: { en: 'GDPR', nb: 'GDPR' },
    description: { en: 'GDPR compliance tools', nb: 'GDPR-verktøy' },
    category: 'compliance',
    dependencies: ['core'],
    capabilities: ['gdpr.read', 'gdpr.manage'],
    isCore: false,
    defaultEnabled: true,
  },
  audit: {
    key: 'audit',
    name: { en: 'Audit', nb: 'Revisjon' },
    description: { en: 'Audit logging', nb: 'Revisjonslogging' },
    category: 'compliance',
    dependencies: ['core'],
    capabilities: ['audit.read'],
    isCore: true,
    defaultEnabled: true,
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Compute capabilities from enabled modules
 */
export function computeCapabilities(enabledModuleKeys: ModuleKeyType[]): Record<string, boolean> {
  const capabilities: Record<string, boolean> = {};

  for (const key of enabledModuleKeys) {
    const module = MODULE_REGISTRY[key];
    if (module) {
      for (const cap of module.capabilities) {
        capabilities[cap] = true;
      }
    }
  }

  return capabilities;
}

/**
 * Get modules that depend on a given module
 */
export function getModuleDependents(moduleKey: ModuleKeyType): ModuleKeyType[] {
  const dependents: ModuleKeyType[] = [];

  for (const [key, module] of Object.entries(MODULE_REGISTRY)) {
    if (module.dependencies.includes(moduleKey)) {
      dependents.push(key as ModuleKeyType);
    }
  }

  return dependents;
}
