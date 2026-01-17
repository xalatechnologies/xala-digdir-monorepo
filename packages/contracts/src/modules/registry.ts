/**
 * Module Registry
 * Canonical module definitions for the Digilist platform
 *
 * This is the single source of truth for all platform modules.
 * Each module represents a feature area that can be enabled/disabled per tenant.
 */

// =============================================================================
// Module Keys (Type-safe string union)
// =============================================================================

export const ModuleKey = {
  // Core Modules (cannot be disabled)
  CORE_AUTH: 'CORE_AUTH',
  CORE_TENANTS: 'CORE_TENANTS',
  CORE_USERS: 'CORE_USERS',

  // Booking Domain
  RENTAL_OBJECTS: 'RENTAL_OBJECTS',
  BOOKINGS: 'BOOKINGS',
  CALENDAR: 'CALENDAR',
  PRICING: 'PRICING',
  AVAILABILITY: 'AVAILABILITY',
  SEASON_RENTAL: 'SEASON_RENTAL',
  ALLOCATIONS: 'ALLOCATIONS',

  // Communication
  MESSAGING: 'MESSAGING',
  NOTIFICATIONS: 'NOTIFICATIONS',
  INTERNAL_NOTES: 'INTERNAL_NOTES',

  // Economy
  PAYMENTS: 'PAYMENTS',
  INVOICING: 'INVOICING',
  PAYMENTS_VIPPS: 'PAYMENTS_VIPPS',
  PAYMENTS_STRIPE: 'PAYMENTS_STRIPE',

  // User Experience
  RATINGS: 'RATINGS',
  FAVORITES: 'FAVORITES',
  SEARCH: 'SEARCH',
  SEO: 'SEO',
  GEO: 'GEO',

  // Integrations
  INTEGRATIONS_IDPORTEN: 'INTEGRATIONS_IDPORTEN',
  INTEGRATIONS_BANKID: 'INTEGRATIONS_BANKID',
  INTEGRATIONS_VIPPS: 'INTEGRATIONS_VIPPS',

  // Compliance & Admin
  AUDIT_LOGGING: 'AUDIT_LOGGING',
  COMPLIANCE_GDPR: 'COMPLIANCE_GDPR',
  ACTIVITIES: 'ACTIVITIES',
  REPORTING: 'REPORTING',

  // Support
  HELP: 'HELP',
  RAG_SUPPORT: 'RAG_SUPPORT',
} as const;

export type ModuleKeyType = (typeof ModuleKey)[keyof typeof ModuleKey];

// =============================================================================
// Module Categories
// =============================================================================

export type ModuleCategory =
  | 'core'
  | 'booking'
  | 'communication'
  | 'economy'
  | 'experience'
  | 'integrations'
  | 'compliance';

// =============================================================================
// Module Definition Interface
// =============================================================================

export interface ModuleDefinition {
  key: ModuleKeyType;
  name: { no: string; en: string };
  description: { no: string; en: string };
  category: ModuleCategory;
  /** Module keys this module depends on */
  dependencies: ModuleKeyType[];
  /** Capability flags this module provides */
  capabilities: string[];
  /** Whether module is enabled by default for new tenants */
  defaultEnabled: boolean;
  /** Core modules cannot be disabled */
  isCore: boolean;
}

// =============================================================================
// Module Registry
// =============================================================================

export const MODULE_REGISTRY: Record<ModuleKeyType, ModuleDefinition> = {
  // -------------------------------------------------------------------------
  // Core Modules
  // -------------------------------------------------------------------------
  [ModuleKey.CORE_AUTH]: {
    key: ModuleKey.CORE_AUTH,
    name: { no: 'Autentisering', en: 'Authentication' },
    description: { no: 'Pålogging og brukerautentisering', en: 'Login and user authentication' },
    category: 'core',
    dependencies: [],
    capabilities: ['auth', 'session'],
    defaultEnabled: true,
    isCore: true,
  },
  [ModuleKey.CORE_TENANTS]: {
    key: ModuleKey.CORE_TENANTS,
    name: { no: 'Leietakere', en: 'Tenants' },
    description: { no: 'Flerleiehåndtering', en: 'Multi-tenancy management' },
    category: 'core',
    dependencies: [],
    capabilities: ['tenants'],
    defaultEnabled: true,
    isCore: true,
  },
  [ModuleKey.CORE_USERS]: {
    key: ModuleKey.CORE_USERS,
    name: { no: 'Brukere', en: 'Users' },
    description: { no: 'Brukeradministrasjon', en: 'User management' },
    category: 'core',
    dependencies: [ModuleKey.CORE_AUTH, ModuleKey.CORE_TENANTS],
    capabilities: ['users', 'profiles'],
    defaultEnabled: true,
    isCore: true,
  },

  // -------------------------------------------------------------------------
  // Booking Domain
  // -------------------------------------------------------------------------
  [ModuleKey.RENTAL_OBJECTS]: {
    key: ModuleKey.RENTAL_OBJECTS,
    name: { no: 'Utleieobjekter', en: 'Rental Objects' },
    description: { no: 'Administrer lokaler, utstyr og ressurser', en: 'Manage venues, equipment and resources' },
    category: 'booking',
    dependencies: [ModuleKey.CORE_TENANTS],
    capabilities: ['rentalObjects', 'rentalObjectCategories'],
    defaultEnabled: true,
    isCore: false,
  },
  [ModuleKey.BOOKINGS]: {
    key: ModuleKey.BOOKINGS,
    name: { no: 'Bestillinger', en: 'Bookings' },
    description: { no: 'Booking og reservasjoner', en: 'Booking and reservations' },
    category: 'booking',
    dependencies: [ModuleKey.RENTAL_OBJECTS],
    capabilities: ['bookings', 'reservations', 'bookingWorkflow'],
    defaultEnabled: true,
    isCore: false,
  },
  [ModuleKey.CALENDAR]: {
    key: ModuleKey.CALENDAR,
    name: { no: 'Kalender', en: 'Calendar' },
    description: { no: 'Kalendervisning og tidsblokker', en: 'Calendar view and time slots' },
    category: 'booking',
    dependencies: [ModuleKey.RENTAL_OBJECTS],
    capabilities: ['calendar', 'slots'],
    defaultEnabled: true,
    isCore: false,
  },
  [ModuleKey.PRICING]: {
    key: ModuleKey.PRICING,
    name: { no: 'Priser', en: 'Pricing' },
    description: { no: 'Prisregler og beregninger', en: 'Price rules and calculations' },
    category: 'booking',
    dependencies: [ModuleKey.RENTAL_OBJECTS],
    capabilities: ['pricing', 'priceRules', 'discounts'],
    defaultEnabled: true,
    isCore: false,
  },
  [ModuleKey.AVAILABILITY]: {
    key: ModuleKey.AVAILABILITY,
    name: { no: 'Tilgjengelighet', en: 'Availability' },
    description: { no: 'Åpningstider og tilgjengelighetsstyring', en: 'Opening hours and availability management' },
    category: 'booking',
    dependencies: [ModuleKey.RENTAL_OBJECTS],
    capabilities: ['availability', 'openingHours', 'blackouts'],
    defaultEnabled: true,
    isCore: false,
  },
  [ModuleKey.SEASON_RENTAL]: {
    key: ModuleKey.SEASON_RENTAL,
    name: { no: 'Sesongutleie', en: 'Season Rental' },
    description: { no: 'Langtidsleie og sesonger', en: 'Long-term rental and seasons' },
    category: 'booking',
    dependencies: [ModuleKey.BOOKINGS],
    capabilities: ['seasonRental', 'seasons'],
    defaultEnabled: false,
    isCore: false,
  },
  [ModuleKey.ALLOCATIONS]: {
    key: ModuleKey.ALLOCATIONS,
    name: { no: 'Allokeringer', en: 'Allocations' },
    description: { no: 'Tidsblokkeringer og allokeringer', en: 'Time blocking and allocations' },
    category: 'booking',
    dependencies: [ModuleKey.CALENDAR],
    capabilities: ['allocations'],
    defaultEnabled: true,
    isCore: false,
  },

  // -------------------------------------------------------------------------
  // Communication
  // -------------------------------------------------------------------------
  [ModuleKey.MESSAGING]: {
    key: ModuleKey.MESSAGING,
    name: { no: 'Meldinger', en: 'Messaging' },
    description: { no: 'Samtaler og meldinger', en: 'Conversations and messages' },
    category: 'communication',
    dependencies: [ModuleKey.CORE_USERS],
    capabilities: ['messaging', 'conversations', 'templates'],
    defaultEnabled: false,
    isCore: false,
  },
  [ModuleKey.NOTIFICATIONS]: {
    key: ModuleKey.NOTIFICATIONS,
    name: { no: 'Varsler', en: 'Notifications' },
    description: { no: 'E-post og SMS-varsler', en: 'Email and SMS notifications' },
    category: 'communication',
    dependencies: [ModuleKey.CORE_USERS],
    capabilities: ['notifications', 'emailNotifications', 'smsNotifications'],
    defaultEnabled: true,
    isCore: false,
  },
  [ModuleKey.INTERNAL_NOTES]: {
    key: ModuleKey.INTERNAL_NOTES,
    name: { no: 'Interne notater', en: 'Internal Notes' },
    description: { no: 'Interne notater for saksbehandlere', en: 'Internal notes for case workers' },
    category: 'communication',
    dependencies: [ModuleKey.CORE_USERS],
    capabilities: ['internalNotes'],
    defaultEnabled: true,
    isCore: false,
  },

  // -------------------------------------------------------------------------
  // Economy
  // -------------------------------------------------------------------------
  [ModuleKey.PAYMENTS]: {
    key: ModuleKey.PAYMENTS,
    name: { no: 'Betalinger', en: 'Payments' },
    description: { no: 'Betalingshåndtering', en: 'Payment processing' },
    category: 'economy',
    dependencies: [ModuleKey.BOOKINGS],
    capabilities: ['payments', 'paymentHistory'],
    defaultEnabled: false,
    isCore: false,
  },
  [ModuleKey.INVOICING]: {
    key: ModuleKey.INVOICING,
    name: { no: 'Fakturering', en: 'Invoicing' },
    description: { no: 'Fakturagenerering og -håndtering', en: 'Invoice generation and management' },
    category: 'economy',
    dependencies: [ModuleKey.PAYMENTS],
    capabilities: ['invoicing', 'invoices'],
    defaultEnabled: false,
    isCore: false,
  },
  [ModuleKey.PAYMENTS_VIPPS]: {
    key: ModuleKey.PAYMENTS_VIPPS,
    name: { no: 'Vipps', en: 'Vipps' },
    description: { no: 'Vipps betalingsintegrasjon', en: 'Vipps payment integration' },
    category: 'economy',
    dependencies: [ModuleKey.PAYMENTS],
    capabilities: ['vipps', 'vippsPayments'],
    defaultEnabled: false,
    isCore: false,
  },
  [ModuleKey.PAYMENTS_STRIPE]: {
    key: ModuleKey.PAYMENTS_STRIPE,
    name: { no: 'Stripe', en: 'Stripe' },
    description: { no: 'Stripe betalingsintegrasjon', en: 'Stripe payment integration' },
    category: 'economy',
    dependencies: [ModuleKey.PAYMENTS],
    capabilities: ['stripe', 'stripePayments'],
    defaultEnabled: false,
    isCore: false,
  },

  // -------------------------------------------------------------------------
  // User Experience
  // -------------------------------------------------------------------------
  [ModuleKey.RATINGS]: {
    key: ModuleKey.RATINGS,
    name: { no: 'Vurderinger', en: 'Ratings' },
    description: { no: 'Brukeranmeldelser og vurderinger', en: 'User reviews and ratings' },
    category: 'experience',
    dependencies: [ModuleKey.BOOKINGS],
    capabilities: ['ratings', 'reviews'],
    defaultEnabled: false,
    isCore: false,
  },
  [ModuleKey.FAVORITES]: {
    key: ModuleKey.FAVORITES,
    name: { no: 'Favoritter', en: 'Favorites' },
    description: { no: 'Lagre favoritter', en: 'Save favorites' },
    category: 'experience',
    dependencies: [ModuleKey.RENTAL_OBJECTS],
    capabilities: ['favorites'],
    defaultEnabled: true,
    isCore: false,
  },
  [ModuleKey.SEARCH]: {
    key: ModuleKey.SEARCH,
    name: { no: 'Søk', en: 'Search' },
    description: { no: 'Avansert søk og filtrering', en: 'Advanced search and filtering' },
    category: 'experience',
    dependencies: [ModuleKey.RENTAL_OBJECTS],
    capabilities: ['search', 'filters'],
    defaultEnabled: true,
    isCore: false,
  },
  [ModuleKey.SEO]: {
    key: ModuleKey.SEO,
    name: { no: 'SEO', en: 'SEO' },
    description: { no: 'Søkemotoroptimalisering', en: 'Search engine optimization' },
    category: 'experience',
    dependencies: [],
    capabilities: ['seo', 'metaTags', 'sitemap'],
    defaultEnabled: true,
    isCore: false,
  },
  [ModuleKey.GEO]: {
    key: ModuleKey.GEO,
    name: { no: 'Geolokasjon', en: 'Geolocation' },
    description: { no: 'Kart og stedsbaserte tjenester', en: 'Maps and location-based services' },
    category: 'experience',
    dependencies: [ModuleKey.RENTAL_OBJECTS],
    capabilities: ['geo', 'maps', 'coordinates'],
    defaultEnabled: true,
    isCore: false,
  },

  // -------------------------------------------------------------------------
  // Integrations
  // -------------------------------------------------------------------------
  [ModuleKey.INTEGRATIONS_IDPORTEN]: {
    key: ModuleKey.INTEGRATIONS_IDPORTEN,
    name: { no: 'ID-porten', en: 'ID-porten' },
    description: { no: 'ID-porten innlogging', en: 'ID-porten authentication' },
    category: 'integrations',
    dependencies: [ModuleKey.CORE_AUTH],
    capabilities: ['idporten'],
    defaultEnabled: false,
    isCore: false,
  },
  [ModuleKey.INTEGRATIONS_BANKID]: {
    key: ModuleKey.INTEGRATIONS_BANKID,
    name: { no: 'BankID', en: 'BankID' },
    description: { no: 'BankID innlogging', en: 'BankID authentication' },
    category: 'integrations',
    dependencies: [ModuleKey.CORE_AUTH],
    capabilities: ['bankid'],
    defaultEnabled: false,
    isCore: false,
  },
  [ModuleKey.INTEGRATIONS_VIPPS]: {
    key: ModuleKey.INTEGRATIONS_VIPPS,
    name: { no: 'Vipps Login', en: 'Vipps Login' },
    description: { no: 'Vipps innlogging', en: 'Vipps authentication' },
    category: 'integrations',
    dependencies: [ModuleKey.CORE_AUTH],
    capabilities: ['vippsLogin'],
    defaultEnabled: false,
    isCore: false,
  },

  // -------------------------------------------------------------------------
  // Compliance & Admin
  // -------------------------------------------------------------------------
  [ModuleKey.AUDIT_LOGGING]: {
    key: ModuleKey.AUDIT_LOGGING,
    name: { no: 'Revisjonslogg', en: 'Audit Logging' },
    description: { no: 'Spor alle endringer', en: 'Track all changes' },
    category: 'compliance',
    dependencies: [ModuleKey.CORE_USERS],
    capabilities: ['auditLog', 'activityHistory'],
    defaultEnabled: true,
    isCore: false,
  },
  [ModuleKey.COMPLIANCE_GDPR]: {
    key: ModuleKey.COMPLIANCE_GDPR,
    name: { no: 'GDPR', en: 'GDPR' },
    description: { no: 'Personvernverktøy', en: 'Privacy compliance tools' },
    category: 'compliance',
    dependencies: [ModuleKey.CORE_USERS],
    capabilities: ['gdpr', 'dataExport', 'dataRetention', 'consent'],
    defaultEnabled: true,
    isCore: false,
  },
  [ModuleKey.ACTIVITIES]: {
    key: ModuleKey.ACTIVITIES,
    name: { no: 'Aktiviteter', en: 'Activities' },
    description: { no: 'Aktivitetshistorikk', en: 'Activity history' },
    category: 'compliance',
    dependencies: [ModuleKey.CORE_USERS],
    capabilities: ['activities'],
    defaultEnabled: true,
    isCore: false,
  },
  [ModuleKey.REPORTING]: {
    key: ModuleKey.REPORTING,
    name: { no: 'Rapporter', en: 'Reporting' },
    description: { no: 'Statistikker og rapporter', en: 'Statistics and reports' },
    category: 'compliance',
    dependencies: [ModuleKey.BOOKINGS],
    capabilities: ['reporting', 'statistics', 'exports'],
    defaultEnabled: false,
    isCore: false,
  },

  // -------------------------------------------------------------------------
  // Support
  // -------------------------------------------------------------------------
  [ModuleKey.HELP]: {
    key: ModuleKey.HELP,
    name: { no: 'Hjelp', en: 'Help' },
    description: { no: 'Hjelpesenter og dokumentasjon', en: 'Help center and documentation' },
    category: 'experience',
    dependencies: [],
    capabilities: ['help', 'documentation'],
    defaultEnabled: true,
    isCore: false,
  },
  [ModuleKey.RAG_SUPPORT]: {
    key: ModuleKey.RAG_SUPPORT,
    name: { no: 'AI-støtte', en: 'AI Support' },
    description: { no: 'AI-drevet brukerstøtte', en: 'AI-powered user support' },
    category: 'experience',
    dependencies: [ModuleKey.HELP, ModuleKey.SEARCH],
    capabilities: ['aiSupport', 'ragSearch'],
    defaultEnabled: false,
    isCore: false,
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get all modules in a category
 */
export function getModulesByCategory(category: ModuleCategory): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter((m) => m.category === category);
}

/**
 * Get module dependencies (recursive)
 */
export function getModuleDependencies(moduleKey: ModuleKeyType): ModuleKeyType[] {
  const deps: Set<ModuleKeyType> = new Set();
  const module = MODULE_REGISTRY[moduleKey];

  function addDeps(mod: ModuleDefinition) {
    for (const dep of mod.dependencies) {
      if (!deps.has(dep)) {
        deps.add(dep);
        const depModule = MODULE_REGISTRY[dep];
        if (depModule) {
          addDeps(depModule);
        }
      }
    }
  }

  if (module) {
    addDeps(module);
  }

  return Array.from(deps);
}

/**
 * Get modules that depend on a given module
 */
export function getModuleDependents(moduleKey: ModuleKeyType): ModuleKeyType[] {
  return Object.values(MODULE_REGISTRY)
    .filter((m) => m.dependencies.includes(moduleKey))
    .map((m) => m.key);
}

/**
 * Check if a module can be disabled (not core, no enabled dependents)
 */
export function canDisableModule(
  moduleKey: ModuleKeyType,
  enabledModules: Set<ModuleKeyType>
): { canDisable: boolean; blockers: ModuleKeyType[] } {
  const module = MODULE_REGISTRY[moduleKey];

  if (!module) {
    return { canDisable: false, blockers: [] };
  }

  if (module.isCore) {
    return { canDisable: false, blockers: [] };
  }

  const dependents = getModuleDependents(moduleKey);
  const enabledDependents = dependents.filter((d) => enabledModules.has(d));

  return {
    canDisable: enabledDependents.length === 0,
    blockers: enabledDependents,
  };
}

/**
 * Compute capabilities from enabled modules
 */
export function computeCapabilities(enabledModules: ModuleKeyType[]): Record<string, boolean> {
  const capabilities: Record<string, boolean> = {};

  for (const key of enabledModules) {
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
 * Get all capability names across all modules
 */
export function getAllCapabilities(): string[] {
  const caps = new Set<string>();
  for (const mod of Object.values(MODULE_REGISTRY)) {
    for (const cap of mod.capabilities) {
      caps.add(cap);
    }
  }
  return Array.from(caps).sort();
}
