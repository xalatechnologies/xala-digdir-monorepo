/**
 * E2E testing utilities for Xala governance.
 *
 * This module provides utilities for Playwright-based E2E testing,
 * including page object helpers, authentication utilities, and
 * common test patterns.
 */

/**
 * Configuration for E2E test environments
 */
export interface E2ETestConfig {
  baseUrl: string;
  apiUrl: string;
  timeout: number;
  retries: number;
}

/**
 * Default E2E test configuration
 */
export const defaultE2EConfig: E2ETestConfig = {
  baseUrl: 'http://localhost:5173',
  apiUrl: 'http://localhost:4000',
  timeout: 30000,
  retries: 2,
};

/**
 * Creates an E2E test configuration with overrides
 */
export function createE2EConfig(
  overrides?: Partial<E2ETestConfig>
): E2ETestConfig {
  return {
    ...defaultE2EConfig,
    ...overrides,
  };
}

/**
 * Test user roles for E2E authentication testing
 */
export type TestUserRole =
  | 'admin'
  | 'manager'
  | 'staff'
  | 'user'
  | 'guest';

/**
 * Test user credentials
 */
export interface TestUser {
  email: string;
  password: string;
  role: TestUserRole;
  tenantId: string;
}

/**
 * Creates test user credentials for a specific role
 */
export function createTestUser(
  role: TestUserRole,
  tenantId = 'test-tenant'
): TestUser {
  return {
    email: `${role}@test.digilist.no`,
    password: 'test-password-123',
    role,
    tenantId,
  };
}

/**
 * Page selectors for common UI elements
 */
export const selectors = {
  // Navigation
  nav: {
    main: '[data-testid="main-nav"]',
    userMenu: '[data-testid="user-menu"]',
    logout: '[data-testid="logout-button"]',
  },
  // Forms
  forms: {
    submit: 'button[type="submit"]',
    cancel: '[data-testid="cancel-button"]',
    error: '[data-testid="form-error"]',
  },
  // Common
  loading: '[data-testid="loading"]',
  error: '[data-testid="error"]',
  toast: '[data-testid="toast"]',
};

/**
 * Wait for network idle state
 */
export async function waitForNetworkIdle(
  page: { waitForLoadState: (state: string) => Promise<void> },
  timeout = 10000
): Promise<void> {
  await Promise.race([
    page.waitForLoadState('networkidle'),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network idle timeout')), timeout)
    ),
  ]);
}

/**
 * Screenshot helper for debugging
 */
export function screenshotPath(testName: string, step: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `packages/testing/reports/e2e/screenshots/${testName}-${step}-${timestamp}.png`;
}
