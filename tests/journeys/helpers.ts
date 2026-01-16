/**
 * Journey Test Helpers
 *
 * Provides utilities for Playwright E2E journey tests with roadmap traceability.
 * These helpers support authentication, role-based testing, and environment handling.
 *
 * @see roadmap.yml for feature traceability
 * @see compliance/SSA-L.md for SSA-L compliance mapping
 */
import { type Page, type BrowserContext } from '@playwright/test';

/**
 * User roles supported by the system (aligned with RBAC)
 * @see apps/api/src/__tests__/test-utils.ts for reference
 */
export type UserRole = 'admin' | 'saksbehandler' | 'super_admin' | 'user' | 'citizen' | 'guest';

/**
 * Test user configuration
 */
export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string;
}

/**
 * Login options for loginAs utility
 */
export interface LoginOptions {
  /** Navigate to this path after login completes */
  redirectTo?: string;
  /** Skip waiting for network idle after login */
  skipWaitForIdle?: boolean;
  /** Custom timeout for login operations (ms) */
  timeout?: number;
}

/**
 * Mock UUIDs for testing (matching apps/api test-utils pattern)
 */
export const TEST_IDS = {
  tenantId: 'a1b2c3d4-1234-5678-9abc-def012345678',
  adminUserId: 'admin007-0000-0000-0000-000000000001',
  saksbehandlerUserId: 'saksbe01-0000-0000-0000-000000000002',
  userId: 'user0001-0000-0000-0000-000000000003',
  listingId: 'listing1-0000-0000-0000-000000000001',
  bookingId: 'booking1-0000-0000-0000-000000000001',
  organizationId: 'organi01-0000-0000-0000-000000000001',
} as const;

/**
 * Pre-configured test users for journey tests
 */
export const TEST_USERS: Record<Exclude<UserRole, 'guest'>, TestUser> = {
  admin: {
    id: TEST_IDS.adminUserId,
    email: 'admin@test.kommune.no',
    name: 'Test Admin',
    role: 'admin',
    password: 'test-admin-password',
  },
  saksbehandler: {
    id: TEST_IDS.saksbehandlerUserId,
    email: 'saksbehandler@test.kommune.no',
    name: 'Test Saksbehandler',
    role: 'saksbehandler',
    password: 'test-saksbehandler-password',
  },
  super_admin: {
    id: 'superadm-0000-0000-0000-000000000004',
    email: 'super-admin@test.kommune.no',
    name: 'Test Super Admin',
    role: 'super_admin',
    password: 'test-super-admin-password',
  },
  user: {
    id: TEST_IDS.userId,
    email: 'user@test.kommune.no',
    name: 'Test User',
    role: 'user',
    password: 'test-user-password',
  },
  citizen: {
    id: 'citizen01-0000-0000-0000-000000000005',
    email: 'citizen@test.kommune.no',
    name: 'Test Citizen',
    role: 'citizen',
    password: 'test-citizen-password',
  },
};

/**
 * Application URLs (aligned with playwright.config.ts)
 */
export const APP_URLS = {
  web: 'http://localhost:5173',
  backoffice: 'http://localhost:5175',
  minside: 'http://localhost:5174',
  api: 'http://localhost:4000',
} as const;

/**
 * Login as a specific role for journey tests
 *
 * This utility handles authentication setup for E2E tests using real backend API.
 * Creates real session cookies via /api/auth/test-login endpoint.
 *
 * @param page - Playwright Page instance
 * @param role - User role to authenticate as
 * @param options - Optional login configuration
 *
 * @example
 * ```typescript
 * test('P3-01 | Case handler can approve booking', async ({ page }) => {
 *   await loginAs(page, 'saksbehandler');
 *   await page.goto('/approvals');
 *   // ... rest of test
 * });
 * ```
 *
 * @roadmap P1-01 Session continuity
 * @roadmap P0-02 RBAC as source of truth
 */
export async function loginAs(
  page: Page,
  role: Exclude<UserRole, 'guest'>,
  options: LoginOptions = {}
): Promise<void> {
  const user = TEST_USERS[role];
  const timeout = options.timeout ?? 10000;

  // Call real backend test-login endpoint to create session cookie
  const response = await page.request.post(`${APP_URLS.api}/api/auth/test-login`, {
    data: {
      role,
      tenantId: TEST_IDS.tenantId,
    },
  });

  if (!response.ok()) {
    const error = await response.text();
    throw new Error(`Test login failed for role ${role}: ${response.status()} ${error}`);
  }

  const result = await response.json();

  // Session cookie is automatically set by the API response
  // Store user data in localStorage for frontend apps
  await page.addInitScript((userData) => {
    localStorage.setItem('auth_user', JSON.stringify(userData.user));
    localStorage.setItem('auth_expires_at', userData.expiresAt);
    localStorage.setItem('auth_token', `test-jwt-token-${userData.user.role}`);
  }, result.data);

  // Navigate to initial page (triggers auth state hydration)
  const targetUrl = options.redirectTo ?? '/';
  await page.goto(targetUrl, { timeout });

  // Wait for network to settle unless explicitly skipped
  if (!options.skipWaitForIdle) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  console.log(`✓ Authenticated as ${role} (${user.email}) via real backend`);
}

/**
 * Clear authentication state (logout)
 *
 * @param page - Playwright Page instance
 */
export async function logout(page: Page): Promise<void> {
  // Call backend logout endpoint to clear session cookie
  await page.request.post(`${APP_URLS.api}/api/auth/logout`);

  await page.evaluate(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_expires_at');
  });
}

/**
 * Clear all session data (cookies + localStorage + sessionStorage)
 *
 * @param page - Playwright Page instance
 */
export async function clearSession(page: Page): Promise<void> {
  // Clear cookies
  await page.context().clearCookies();

  // Navigate to blank page to avoid localStorage access errors
  await page.goto('about:blank');

  // Clear all storage
  try {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  } catch (error) {
    // Ignore errors (might happen if storage is already inaccessible)
  }
}

/**
 * Check if session cookie exists
 *
 * @param page - Playwright Page instance
 * @returns true if digilist_session cookie exists
 */
export async function hasSessionCookie(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  return cookies.some(cookie => cookie.name === 'digilist_session');
}

/**
 * Check if services are available before running tests
 *
 * Use this to gracefully skip tests when backend services are unavailable.
 *
 * @param page - Playwright Page instance
 * @param serviceUrl - URL to check
 * @returns true if service is available
 *
 * @example
 * ```typescript
 * test('P2-02 | Slot calendar shows availability', async ({ page }) => {
 *   const apiAvailable = await isServiceAvailable(page, APP_URLS.api);
 *   test.skip(!apiAvailable, 'API not available');
 *   // ... rest of test
 * });
 * ```
 */
export async function isServiceAvailable(
  page: Page,
  serviceUrl: string
): Promise<boolean> {
  try {
    const response = await page.request.get(`${serviceUrl}/api/health`, {
      timeout: 5000,
    });
    return response.ok();
  } catch {
    return false;
  }
}

/**
 * Wait for API to be ready
 *
 * @param page - Playwright Page instance
 * @param maxRetries - Maximum number of retry attempts
 * @param retryDelay - Delay between retries in ms
 * @returns true if API became available
 */
export async function waitForApiReady(
  page: Page,
  maxRetries = 5,
  retryDelay = 1000
): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    if (await isServiceAvailable(page, APP_URLS.api)) {
      return true;
    }
    await page.waitForTimeout(retryDelay);
  }
  return false;
}

/**
 * Create a test context with role-based authentication
 *
 * This is useful for tests that need to switch between users or
 * maintain separate auth states.
 *
 * @param context - Playwright BrowserContext
 * @param role - User role to authenticate as
 * @returns Configured page with auth state
 */
export async function createAuthenticatedPage(
  context: BrowserContext,
  role: Exclude<UserRole, 'guest'>
): Promise<Page> {
  const page = await context.newPage();
  await loginAs(page, role);
  return page;
}

/**
 * Roadmap ID extractor for test reporting
 *
 * Extracts roadmap IDs from test names following the pattern: "P{phase}-{item}"
 *
 * @param testName - Full test name
 * @returns Extracted roadmap IDs
 *
 * @example
 * extractRoadmapIds('P1-01 | Session continuity during login')
 * // Returns: ['P1-01']
 */
export function extractRoadmapIds(testName: string): string[] {
  const pattern = /P\d+-\d+/g;
  return testName.match(pattern) ?? [];
}

/**
 * Assert element is accessible
 *
 * Helper for accessibility checks in journey tests.
 *
 * @param page - Playwright Page instance
 * @param selector - Element selector
 * @param options - Accessibility check options
 */
export async function assertAccessible(
  page: Page,
  selector: string,
  options: { checkAriaLabel?: boolean; checkRole?: string } = {}
): Promise<void> {
  const element = page.locator(selector);

  if (options.checkAriaLabel) {
    const ariaLabel = await element.getAttribute('aria-label');
    if (!ariaLabel) {
      const textContent = await element.textContent();
      if (!textContent?.trim()) {
        throw new Error(`Element ${selector} has no accessible name`);
      }
    }
  }

  if (options.checkRole) {
    const role = await element.getAttribute('role');
    if (role !== options.checkRole) {
      throw new Error(`Element ${selector} has role '${role}', expected '${options.checkRole}'`);
    }
  }
}

/**
 * Storage state helper for session persistence tests
 *
 * @roadmap P1-01 Session continuity
 */
export interface StorageState {
  cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
  }>;
  origins: Array<{
    origin: string;
    localStorage: Array<{ name: string; value: string }>;
  }>;
}

/**
 * Get current storage state from page
 *
 * @param page - Playwright Page instance
 * @returns Current storage state
 */
export async function getStorageState(page: Page): Promise<StorageState> {
  const context = page.context();
  return await context.storageState() as StorageState;
}
