/**
 * Test Environment Configuration
 * 
 * Centralized configuration for all test environments.
 * Tests should import from this file instead of hardcoding URLs.
 * 
 * Environment variables can be set to override defaults:
 * - API_URL: Base URL for API requests
 * - WS_URL: WebSocket URL
 * - WEB_URL: Web app URL
 * - MINSIDE_URL: MinSide app URL
 * - BACKOFFICE_URL: Backoffice app URL
 * - SAAS_ADMIN_URL: SaaS Admin app URL
 */

// Default ports for local development
const DEFAULTS = {
  API_PORT: 4000,
  WEB_PORT: 6001,
  MINSIDE_PORT: 6002,
  BACKOFFICE_PORT: 6003,
  DOCS_PORT: 6004,
  SAAS_ADMIN_PORT: 6005,
};

export const testConfig = {
  // API Configuration
  apiUrl: process.env.API_URL || `http://localhost:${DEFAULTS.API_PORT}`,
  wsUrl: process.env.WS_URL || `ws://localhost:${DEFAULTS.API_PORT}`,
  
  // Frontend App URLs
  webUrl: process.env.WEB_URL || `http://localhost:${DEFAULTS.WEB_PORT}`,
  minsideUrl: process.env.MINSIDE_URL || `http://localhost:${DEFAULTS.MINSIDE_PORT}`,
  backofficeUrl: process.env.BACKOFFICE_URL || `http://localhost:${DEFAULTS.BACKOFFICE_PORT}`,
  docsUrl: process.env.DOCS_URL || `http://localhost:${DEFAULTS.DOCS_PORT}`,
  saasAdminUrl: process.env.SAAS_ADMIN_URL || `http://localhost:${DEFAULTS.SAAS_ADMIN_PORT}`,
  
  // Staging environment (set via CI or .env)
  isStaging: process.env.TEST_ENV === 'staging',
  isProduction: process.env.TEST_ENV === 'production',
  
  // Database configuration (for integration tests)
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5433/digilist_test',
  
  // Redis configuration
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6380',
  
  // Test user credentials
  testUser: {
    email: process.env.TEST_USER_EMAIL || 'test@digilist.no',
    password: process.env.TEST_USER_PASSWORD || 'test123',
  },
  
  // Timeouts
  defaultTimeout: 10000,
  networkTimeout: 30000,
};

// Helper to get API endpoints
export const apiEndpoints = {
  health: () => `${testConfig.apiUrl}/health`,
  listings: () => `${testConfig.apiUrl}/api/listings`,
  bookings: () => `${testConfig.apiUrl}/api/bookings`,
  users: () => `${testConfig.apiUrl}/api/users`,
  auth: () => `${testConfig.apiUrl}/api/auth`,
  tenants: () => `${testConfig.apiUrl}/api/tenants`,
  rentalObjects: () => `${testConfig.apiUrl}/api/rental-objects`,
};

// Export for convenience
export const API_URL = testConfig.apiUrl;
export const WS_URL = testConfig.wsUrl;
export const API_BASE = testConfig.apiUrl;
