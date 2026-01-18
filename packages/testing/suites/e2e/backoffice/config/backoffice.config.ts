/**
 * Backoffice Test Configuration
 * 
 * Environment-specific configuration for backoffice E2E tests.
 * Includes comprehensive module registry with blur-eye expectations.
 */

export type ModuleType = 'list' | 'wizard' | 'settings' | 'workflow' | 'dashboard' | 'report' | 'calendar';

export interface ModuleConfig {
  path: string;
  name: string;
  capability: string;
  type: ModuleType;
  featureFlag?: string;
  blurEye: {
    expectedTitleContains?: string[];
    requirePrimaryAction: boolean;
    requireSearch: boolean;
    requireFilters: number;
    allowEmptyState: boolean;
  };

export const config = {
  // Base URLs
  baseUrl: process.env.BACKOFFICE_URL || 'https://backoffice.digilist.no',
  apiUrl: process.env.API_URL || 'https://api.digilist.no',
  
  // Timeouts
  timeouts: {
    navigation: 30_000,
    action: 10_000,
    assertion: 5_000,
    apiResponse: 20_000,
  },
  
  // Demo credentials (use environment variables in CI)
  credentials: {
    admin: {
      email: process.env.ADMIN_EMAIL || 'admin@skien.kommune.no',
      password: process.env.ADMIN_PASSWORD || 'skien-admin-001',
    },
    saksbehandler: {
      email: process.env.SAKSBEHANDLER_EMAIL || 'staff@skien.kommune.no',
      password: process.env.SAKSBEHANDLER_PASSWORD || 'skien-staff-001',
    },
  },
  
  // Module Registry with Blur-Eye Expectations
  modules: {
    // === OVERVIEW ===
    dashboard: {
      path: '/',
      name: 'Dashboard',
      capability: 'CAP_NAV_DASHBOARD',
      type: 'dashboard' as ModuleType,
      blurEye: {
        expectedTitleContains: ['dashboard', 'oversikt', 'hjem'],
        requirePrimaryAction: false,
        requireSearch: false,
        requireFilters: 0,
        allowEmptyState: true,
      },
    },
    
    // === WORK ===
    bookings: {
      path: '/bookings',
      name: 'Bookings',
      capability: 'CAP_NAV_BOOKINGS',
      type: 'list' as ModuleType,
      blurEye: {
        expectedTitleContains: ['booking', 'reservasjon'],
        requirePrimaryAction: true,
        requireSearch: true,
        requireFilters: 2,
        allowEmptyState: true,
      },
    },
    calendar: {
      path: '/calendar',
      name: 'Calendar',
      capability: 'CAP_NAV_CALENDAR',
      type: 'calendar' as ModuleType,
      blurEye: {
        expectedTitleContains: ['kalender', 'calendar'],
        requirePrimaryAction: false,
        requireSearch: false,
        requireFilters: 1,
        allowEmptyState: true,
      },
    },
    
    // === COMMUNICATION ===
    messages: {
      path: '/messages',
      name: 'Messages',
      capability: 'CAP_NAV_MESSAGES',
      type: 'list' as ModuleType,
      featureFlag: 'FEATURE_MESSAGING',
      blurEye: {
        expectedTitleContains: ['melding', 'message'],
        requirePrimaryAction: true,
        requireSearch: true,
        requireFilters: 1,
        allowEmptyState: true,
      },
    },
    
    // === ECONOMY ===
    invoices: {
      path: '/economy/invoices',
      name: 'Invoices',
      capability: 'CAP_NAV_ECONOMY',
      type: 'list' as ModuleType,
      featureFlag: 'FEATURE_ECONOMY',
      blurEye: {
        expectedTitleContains: ['faktura', 'invoice', 'økonomi'],
        requirePrimaryAction: false,
        requireSearch: true,
        requireFilters: 2,
        allowEmptyState: true,
      },
    },
    
    // === REPORTS ===
    reports: {
      path: '/reports',
      name: 'Reports',
      capability: 'CAP_NAV_REPORTS',
      type: 'report' as ModuleType,
      featureFlag: 'FEATURE_REPORTS',
      blurEye: {
        expectedTitleContains: ['rapport', 'report', 'statistikk'],
        requirePrimaryAction: false,
        requireSearch: false,
        requireFilters: 2,
        allowEmptyState: true,
      },
    },
    
    // === HELP ===
    help: {
      path: '/help',
      name: 'Help',
      capability: 'CAP_NAV_HELP',
      type: 'list' as ModuleType,
      blurEye: {
        expectedTitleContains: ['hjelp', 'help', 'support'],
        requirePrimaryAction: false,
        requireSearch: true,
        requireFilters: 0,
        allowEmptyState: true,
      },
    },
    
    // === ORGANIZATION ===
    blocks: {
      path: '/blocks',
      name: 'Blocks',
      capability: 'CAP_NAV_BLOCKS',
      type: 'list' as ModuleType,
      featureFlag: 'FEATURE_BLOCKS',
      blurEye: {
        expectedTitleContains: ['blokkering', 'block', 'sperr'],
        requirePrimaryAction: true,
        requireSearch: true,
        requireFilters: 1,
        allowEmptyState: true,
      },
    },
    
    // === ADMINISTRATION ===
    rentalObjects: {
      path: '/rental-objects',
      name: 'Rental Objects',
      capability: 'CAP_LISTING_EDIT',
      type: 'list' as ModuleType,
      blurEye: {
        expectedTitleContains: ['utleieobjekt', 'rental', 'objekt'],
        requirePrimaryAction: true,
        requireSearch: true,
        requireFilters: 2,
        allowEmptyState: true,
      },
    },
    rentalObjectWizard: {
      path: '/rental-objects/wizard',
      name: 'New Rental Object',
      capability: 'CAP_LISTING_CREATE',
      type: 'wizard' as ModuleType,
      blurEye: {
        expectedTitleContains: ['ny', 'opprett', 'wizard'],
        requirePrimaryAction: false,
        requireSearch: false,
        requireFilters: 0,
        allowEmptyState: true,
      },
    },
    seasons: {
      path: '/seasons',
      name: 'Seasons',
      capability: 'CAP_BOOKING_MANAGE',
      type: 'list' as ModuleType,
      blurEye: {
        expectedTitleContains: ['sesong', 'season'],
        requirePrimaryAction: true,
        requireSearch: true,
        requireFilters: 1,
        allowEmptyState: true,
      },
    },
    
    // === USERS & ORGANIZATIONS ===
    organizations: {
      path: '/organizations',
      name: 'Organizations',
      capability: 'CAP_ORG_ADMIN',
      type: 'list' as ModuleType,
      blurEye: {
        expectedTitleContains: ['organisasjon', 'organization'],
        requirePrimaryAction: true,
        requireSearch: true,
        requireFilters: 1,
        allowEmptyState: true,
      },
    },
    users: {
      path: '/users',
      name: 'Users',
      capability: 'CAP_USER_ADMIN',
      type: 'list' as ModuleType,
      blurEye: {
        expectedTitleContains: ['bruker', 'user'],
        requirePrimaryAction: true,
        requireSearch: true,
        requireFilters: 1,
        allowEmptyState: true,
      },
    },
    
    // === CASE HANDLER ===
    workQueue: {
      path: '/work-queue',
      name: 'Work Queue',
      capability: 'CAP_BOOKING_APPROVE',
      type: 'workflow' as ModuleType,
      blurEye: {
        expectedTitleContains: ['arbeidskø', 'queue', 'venter'],
        requirePrimaryAction: false,
        requireSearch: true,
        requireFilters: 2,
        allowEmptyState: true,
      },
    },
    seasonApplications: {
      path: '/season-applications',
      name: 'Season Applications',
      capability: 'CAP_BOOKING_APPROVE',
      type: 'workflow' as ModuleType,
      blurEye: {
        expectedTitleContains: ['søknad', 'application', 'sesong'],
        requirePrimaryAction: false,
        requireSearch: true,
        requireFilters: 2,
        allowEmptyState: true,
      },
    },
    allocationPlanner: {
      path: '/allocation-planner',
      name: 'Allocation Planner',
      capability: 'CAP_BOOKING_MANAGE',
      type: 'calendar' as ModuleType,
      blurEye: {
        expectedTitleContains: ['tildeling', 'allocation', 'planner'],
        requirePrimaryAction: false,
        requireSearch: false,
        requireFilters: 1,
        allowEmptyState: true,
      },
    },
    decisionForms: {
      path: '/decision-forms',
      name: 'Decision Forms',
      capability: 'CAP_BOOKING_APPROVE',
      type: 'list' as ModuleType,
      blurEye: {
        expectedTitleContains: ['vedtak', 'beslutning', 'decision'],
        requirePrimaryAction: true,
        requireSearch: true,
        requireFilters: 1,
        allowEmptyState: true,
      },
    },
    auditTimeline: {
      path: '/audit-timeline',
      name: 'Audit Timeline',
      capability: 'CAP_AUDIT_VIEW',
      type: 'list' as ModuleType,
      blurEye: {
        expectedTitleContains: ['tidslinje', 'timeline', 'aktivitet'],
        requirePrimaryAction: false,
        requireSearch: true,
        requireFilters: 2,
        allowEmptyState: true,
      },
    },
    
    // === ADMIN ===
    pricingRules: {
      path: '/pricing-rules',
      name: 'Pricing Rules',
      capability: 'CAP_SETTINGS_ADMIN',
      type: 'list' as ModuleType,
      blurEye: {
        expectedTitleContains: ['pris', 'pricing', 'regel'],
        requirePrimaryAction: true,
        requireSearch: true,
        requireFilters: 1,
        allowEmptyState: true,
      },
    },
    
    // === TENANT SETTINGS ===
    tenantFeatures: {
      path: '/tenant/features',
      name: 'Features',
      capability: 'CAP_SETTINGS_ADMIN',
      type: 'settings' as ModuleType,
      blurEye: {
        expectedTitleContains: ['funksjon', 'feature', 'toggle'],
        requirePrimaryAction: false,
        requireSearch: false,
        requireFilters: 0,
        allowEmptyState: true,
      },
    },
    tenantSettings: {
      path: '/tenant/settings',
      name: 'Platform Settings',
      capability: 'CAP_SETTINGS_ADMIN',
      type: 'settings' as ModuleType,
      blurEye: {
        expectedTitleContains: ['innstilling', 'setting', 'platform'],
        requirePrimaryAction: false,
        requireSearch: false,
        requireFilters: 0,
        allowEmptyState: true,
      },
    },
    tenantBranding: {
      path: '/tenant/branding',
      name: 'Branding',
      capability: 'CAP_SETTINGS_ADMIN',
      type: 'settings' as ModuleType,
      blurEye: {
        expectedTitleContains: ['branding', 'logo', 'tema'],
        requirePrimaryAction: false,
        requireSearch: false,
        requireFilters: 0,
        allowEmptyState: true,
      },
    },
    tenantAuditLog: {
      path: '/tenant/audit-log',
      name: 'System Log',
      capability: 'CAP_AUDIT_VIEW',
      type: 'list' as ModuleType,
      blurEye: {
        expectedTitleContains: ['logg', 'audit', 'system'],
        requirePrimaryAction: false,
        requireSearch: true,
        requireFilters: 2,
        allowEmptyState: true,
      },
    },
    
    // === SYSTEM ===
    gdprRequests: {
      path: '/gdpr-requests',
      name: 'GDPR Requests',
      capability: 'CAP_SETTINGS_ADMIN',
      type: 'workflow' as ModuleType,
      blurEye: {
        expectedTitleContains: ['gdpr', 'personvern', 'slett'],
        requirePrimaryAction: false,
        requireSearch: true,
        requireFilters: 1,
        allowEmptyState: true,
      },
    },
    reviewsModeration: {
      path: '/reviews/moderation',
      name: 'Reviews Moderation',
      capability: 'CAP_SETTINGS_ADMIN',
      type: 'workflow' as ModuleType,
      blurEye: {
        expectedTitleContains: ['anmeldelse', 'review', 'moderering'],
        requirePrimaryAction: false,
        requireSearch: true,
        requireFilters: 1,
        allowEmptyState: true,
      },
    },
    settings: {
      path: '/settings',
      name: 'Settings',
      capability: 'CAP_SYSTEM_CONFIG',
      type: 'settings' as ModuleType,
      blurEye: {
        expectedTitleContains: ['innstilling', 'setting'],
        requirePrimaryAction: false,
        requireSearch: false,
        requireFilters: 0,
        allowEmptyState: true,
      },
    },
  } as Record<string, ModuleConfig>,
  
  // Legacy route groups (for backward compatibility)
  routes: {
    public: ['/login'],
    shared: [
      { path: '/', name: 'Dashboard', capability: 'CAP_NAV_DASHBOARD' },
      { path: '/bookings', name: 'Bookings', capability: 'CAP_NAV_BOOKINGS' },
      { path: '/calendar', name: 'Calendar', capability: 'CAP_NAV_CALENDAR' },
      { path: '/help', name: 'Help', capability: 'CAP_NAV_HELP' },
      { path: '/work-queue', name: 'Work Queue', capability: 'CAP_BOOKING_APPROVE' },
      { path: '/decision-forms', name: 'Decision Forms', capability: 'CAP_BOOKING_APPROVE' },
    ],
    adminOnly: [
      { path: '/rental-objects', name: 'Rental Objects', capability: 'CAP_LISTING_EDIT' },
      { path: '/rental-objects/wizard', name: 'New Listing', capability: 'CAP_LISTING_CREATE' },
      { path: '/seasons', name: 'Seasons', capability: 'CAP_BOOKING_MANAGE' },
      { path: '/organizations', name: 'Organizations', capability: 'CAP_ORG_ADMIN' },
      { path: '/users', name: 'Users', capability: 'CAP_USER_ADMIN' },
      { path: '/users-management', name: 'User Management', capability: 'CAP_USER_ADMIN' },
      { path: '/pricing-rules', name: 'Pricing Rules', capability: 'CAP_SETTINGS_ADMIN' },
      { path: '/allocation-planner', name: 'Allocation Planner', capability: 'CAP_BOOKING_MANAGE' },
      { path: '/tenant/users', name: 'Tenant Users', capability: 'CAP_USER_ADMIN' },
      { path: '/tenant/features', name: 'Features', capability: 'CAP_SETTINGS_ADMIN' },
      { path: '/tenant/settings', name: 'Platform Settings', capability: 'CAP_SETTINGS_ADMIN' },
      { path: '/tenant/branding', name: 'Branding', capability: 'CAP_SETTINGS_ADMIN' },
      { path: '/tenant/audit-log', name: 'System Log', capability: 'CAP_AUDIT_VIEW' },
      { path: '/gdpr-requests', name: 'GDPR Requests', capability: 'CAP_SETTINGS_ADMIN' },
      { path: '/reviews/moderation', name: 'Reviews', capability: 'CAP_SETTINGS_ADMIN' },
      { path: '/audit', name: 'Audit Log', capability: 'CAP_AUDIT_VIEW' },
      { path: '/settings', name: 'Settings', capability: 'CAP_SYSTEM_CONFIG' },
    ],
    conditional: [
      { path: '/messages', name: 'Messages', capability: 'CAP_NAV_MESSAGES' },
      { path: '/blocks', name: 'Blocks', capability: 'CAP_NAV_BLOCKS' },
      { path: '/economy/invoices', name: 'Invoices', capability: 'CAP_NAV_ECONOMY' },
      { path: '/reports', name: 'Reports', capability: 'CAP_NAV_REPORTS' },
      { path: '/season-applications', name: 'Season Applications', capability: 'CAP_BOOKING_APPROVE' },
      { path: '/audit-timeline', name: 'Audit Timeline', capability: 'CAP_AUDIT_VIEW' },
    ],
  },
  
  // Feature Flags
  featureFlags: {
    FEATURE_MESSAGING: { modules: ['messages'], defaultValue: true },
    FEATURE_ECONOMY: { modules: ['invoices'], defaultValue: true },
    FEATURE_REPORTS: { modules: ['reports'], defaultValue: true },
    FEATURE_BLOCKS: { modules: ['blocks'], defaultValue: true },
  },
  
  // Selectors
  selectors: {
    sidebar: 'nav[data-testid="sidebar-nav"]',
    sidebarItem: 'a.sidebar-nav-item',
    pageTitle: 'h1, h2, [data-testid="page-title"]',
    dataTable: '[data-testid="data-table"], table',
    loadingSpinner: '[data-testid="loading"], .loading, [aria-busy="true"]',
    errorAlert: '[role="alert"][data-color="danger"], .error-message',
    emptyState: '[data-testid="empty-state"]',
    submitButton: 'button[type="submit"]',
    primaryAction: '[data-testid="primary-action"], button.primary',
    search: 'input[type="search"], input[placeholder*="søk" i], [data-testid="search-input"]',
    filterDropdown: 'select, button[aria-haspopup="listbox"]',
    pagination: '[data-testid="pagination"], nav[aria-label*="pagination" i]',
    rowAction: 'button:has-text("Rediger"), [data-testid*="row-action"]',
  },
  
  // Forbidden terminology
  forbiddenTerms: ['facility', 'facilities', 'Facility', 'Facilities'],
  
  // Allowlisted console warnings
  allowlistedWarnings: [
    'Download the React DevTools',
    'findDOMNode is deprecated',
    'React does not recognize the',
    'Warning: validateDOMNesting',
    '[vite]',
    '[HMR]',
  ],
};

export type TestConfig = typeof config;

// Helper to get all admin modules
export function getAdminModules(): ModuleConfig[] {
  return Object.values(config.modules);

// Helper to get modules by type
export function getModulesByType(type: ModuleType): ModuleConfig[] {
  return Object.values(config.modules).filter(m => m.type === type);

// Helper to get feature-flagged modules
export function getFeatureFlaggedModules(): ModuleConfig[] {
  return Object.values(config.modules).filter(m => m.featureFlag);
