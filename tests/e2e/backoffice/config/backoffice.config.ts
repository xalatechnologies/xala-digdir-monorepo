/**
 * Backoffice Test Configuration
 * 
 * Environment-specific configuration for backoffice E2E tests.
 */

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
  
  // Routes to test
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
  },
  
  // Forbidden terminology
  forbiddenTerms: ['facility', 'facilities', 'Facility', 'Facilities'],
  
  // Allowlisted console warnings
  allowlistedWarnings: [
    'Download the React DevTools',
    'findDOMNode is deprecated',
    'React does not recognize the',
    'Warning: validateDOMNesting',
  ],
};

export type TestConfig = typeof config;
