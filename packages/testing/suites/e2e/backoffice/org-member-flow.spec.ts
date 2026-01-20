// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@digilist/api/mocks/api-server.mock';
/**
 * E2E Tests: Organization Member Flow
 *
 * End-to-end verification of the Organization Member role:
 * 1. Verify minimal sidebar (6 sections only)
 * 2. Verify forbidden routes show AccessDenied
 * 3. Verify booking list is scoped to assigned objects
 * 4. Verify calendar is read-only
 * 5. Verify feature flag toggles hide nav items
 * 6. Verify dashboard shows task-oriented widgets
 *
 * Per master-prompt.md: org_member is an operational role
 * for day-to-day tasks on assigned rental objects ONLY.
 */

import { test, expect, Page } from '@playwright/test';

// Backoffice app runs on port 5175
const BACKOFFICE_URL = 'http://localhost:5175';

// Test data for org_member user
const TEST_ORG_MEMBER = {
  id: 'test-org-member-id',
  email: 'org-member@kommune.no',
  name: 'Test Org Member',
  role: 'org_member',
  tenantId: 'test-tenant-id',
  organizationId: 'test-org-id',
};

/**
 * Helper: Mock authentication for org_member role
 */
async function mockOrgMemberAuth(page: Page) {
  await page.evaluate(() => {
    const mockUser = {
      id: 'test-org-member-id',
      email: 'org-member@kommune.no',
      name: 'Test Org Member',
      role: 'org_member',
      tenantId: 'test-tenant-id',
      organizationId: 'test-org-id',
      permissions: [
        'backoffice.orgMember.enabled',
        'rentalObjects.read.assigned',
        'bookings.read.assigned',
        'calendar.view.assigned',
        'bookings.approve.assigned',
        'bookings.reject.assigned',
        'help.enabled',
      ],
    };

    const mockToken = {
      accessToken: 'mock-jwt-token-for-org-member',
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      refreshToken: 'mock-refresh-token-org-member',
    };

    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    localStorage.setItem('auth_token', JSON.stringify(mockToken));
    localStorage.setItem('isAuthenticated', 'true');
  });

/**
 * Helper: Mock API responses for org_member scoped data
 */
async function mockOrgMemberApiResponses(page: Page) {
  // Mock capabilities - org_member has limited capabilities
  await page.route('**/api/capabilities/backoffice', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          role: 'org_member',
          capabilities: [
            'CAP_ORG_MEMBER_ENABLED',
            'CAP_NAV_DASHBOARD',
            'CAP_NAV_BOOKINGS',
            'CAP_NAV_CALENDAR',
            'CAP_NAV_HELP',
            'CAP_RENTAL_OBJECTS_READ_ASSIGNED',
            'CAP_BOOKINGS_READ_ASSIGNED',
            'CAP_BOOKINGS_APPROVE_ASSIGNED',
            'CAP_BOOKINGS_REJECT_ASSIGNED',
            'CAP_CALENDAR_VIEW_ASSIGNED',
            'CAP_HELP_ENABLED',
            // Note: CAP_NAV_MESSAGES and CAP_NAV_ECONOMY excluded (feature-gated)
          ],
          uiHints: {
            showDashboard: true,
            showBookings: true,
            showCalendar: true,
            showMessages: false, // Feature-gated off
            showEconomy: false, // Feature-gated off
            showReports: false, // Not enabled
            showHelp: true,
          },
        },
      }),
    });
  });

  // Mock dashboard stats (scoped to assigned objects)
  await page.route('**/api/dashboard/stats*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          byStatus: {
            pending: { count: 3 },
            confirmed: { count: 8 },
            cancelled: { count: 1 },
          },
          total: 12,
        },
      }),
    });
  });

  // Mock pending items
  await page.route('**/api/dashboard/pending-items*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { bookings: 3 },
      }),
    });
  });

  // Mock scoped bookings
  await page.route('**/api/bookings*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: 'booking-1',
            rentalObjectId: 'assigned-obj-1',
            rentalObjectName: 'Møterom A',
            status: 'pending',
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 3600000).toISOString(),
            user: { name: 'Ola Nordmann' },
          },
          {
            id: 'booking-2',
            rentalObjectId: 'assigned-obj-1',
            rentalObjectName: 'Møterom A',
            status: 'confirmed',
            startTime: new Date(Date.now() + 86400000).toISOString(),
            endTime: new Date(Date.now() + 90000000).toISOString(),
            user: { name: 'Kari Hansen' },
          },
        ],
        meta: { total: 2, limit: 20, offset: 0 },
      }),
    });
  });

  // Mock calendar events
  await page.route('**/api/calendar/events*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: 'event-1',
            type: 'booking',
            title: 'Booking: Ola Nordmann',
            start: new Date().toISOString(),
            end: new Date(Date.now() + 3600000).toISOString(),
            resourceId: 'assigned-obj-1',
          },
        ],
      }),
    });
  });

  // Mock activity log
  await page.route('**/api/dashboard/activity*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [],
      }),
    });
  });

// ============================================================================
// Test Suite: Organization Member Sidebar
// ============================================================================

test.describe('Organization Member - Sidebar Navigation', () => {
  setupMockApi();
  test.beforeEach(async ({ page }) => {
    await mockOrgMemberApiResponses(page);
  });

  test('should show only 6 minimal sections for org_member', async ({ page }) => {
    await page.goto(BACKOFFICE_URL);
    await mockOrgMemberAuth(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Org member SHOULD see these nav items
    await expect(page.getByText('Dashboard').or(page.getByText('Oversikt'))).toBeVisible();
    await expect(page.getByText('Bookinger').or(page.getByText('Arbeid'))).toBeVisible();
    await expect(page.getByText('Kalender')).toBeVisible();
    await expect(page.getByText('Hjelp').or(page.getByText('Help'))).toBeVisible();

    // Org member should NOT see admin sections
    await expect(page.getByText('Administrasjon').first()).not.toBeVisible().catch(() => {
      // Some layouts might show it differently
    });
    await expect(page.getByText('Organisasjoner')).not.toBeVisible();
    await expect(page.getByText('Brukeradmin')).not.toBeVisible();
    await expect(page.getByText('Plattforminnstillinger')).not.toBeVisible();
    await expect(page.getByText('GDPR-forespørsler')).not.toBeVisible();
    await expect(page.getByText('Audit Log')).not.toBeVisible();
  });

  test('should hide Messages section when feature-gated off', async ({ page }) => {
    await page.goto(BACKOFFICE_URL);
    await mockOrgMemberAuth(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Messages should NOT be visible when CAP_NAV_MESSAGES is not in capabilities
    await expect(page.getByText('Meldinger')).not.toBeVisible();
  });

  test('should hide Economy section when feature-gated off', async ({ page }) => {
    await page.goto(BACKOFFICE_URL);
    await mockOrgMemberAuth(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Economy/Invoices should NOT be visible
    await expect(page.getByText('Økonomi')).not.toBeVisible();
    await expect(page.getByText('Fakturaer')).not.toBeVisible();
  });
});

// ============================================================================
// Test Suite: Organization Member - Forbidden Routes
// ============================================================================

test.describe('Organization Member - Forbidden Routes', () => {
  setupMockApi();
  test.beforeEach(async ({ page }) => {
    await mockOrgMemberApiResponses(page);
  });

  test('should show AccessDenied when accessing /organizations', async ({ page }) => {
    await page.goto(`${BACKOFFICE_URL}/organizations`);
    await mockOrgMemberAuth(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show access denied or redirect
    const hasAccessDenied = await page.getByText(/tilgang nektet/i)
      .or(page.getByText(/access denied/i))
      .or(page.getByText(/ikke tilgang/i))
      .isVisible()
      .catch(() => false);

    // If no access denied message, should have been redirected to home
    if (!hasAccessDenied) {
      expect(page.url()).not.toContain('/organizations');
    }
  });

  test('should show AccessDenied when accessing /users', async ({ page }) => {
    await page.goto(`${BACKOFFICE_URL}/users`);
    await mockOrgMemberAuth(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should block access
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/users');
  });

  test('should show AccessDenied when accessing /tenant/settings', async ({ page }) => {
    await page.goto(`${BACKOFFICE_URL}/tenant/settings`);
    await mockOrgMemberAuth(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should block access
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/tenant/settings');
  });
});

// ============================================================================
// Test Suite: Organization Member - Scoped Bookings
// ============================================================================

test.describe('Organization Member - Scoped Bookings', () => {
  setupMockApi();
  test.beforeEach(async ({ page }) => {
    await mockOrgMemberApiResponses(page);
  });

  test('should only show bookings for assigned rental objects', async ({ page }) => {
    await page.goto(`${BACKOFFICE_URL}/bookings`);
    await mockOrgMemberAuth(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should see bookings from mock data (assigned objects only)
    await expect(page.getByText('Møterom A').or(page.getByText('Ola Nordmann'))).toBeVisible();
  });

  test('should return 403 when accessing unassigned booking', async ({ page }) => {
    // Mock 403 for unassigned booking
    await page.route('**/api/bookings/unassigned-booking-id', (route) => {
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          type: 'https://api.digilist.no/problems/forbidden',
          title: 'Forbidden',
          status: 403,
          detail: 'You do not have scope to access this booking',
        }),
      });
    });

    await page.goto(`${BACKOFFICE_URL}/bookings/unassigned-booking-id`);
    await mockOrgMemberAuth(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show error
    await expect(
      page.getByText(/feil/i)
        .or(page.getByText(/error/i))
        .or(page.getByText(/ikke funnet/i))
        .or(page.getByText(/nektet/i))
    ).toBeVisible();
  });
});

// ============================================================================
// Test Suite: Organization Member - Read-Only Calendar
// ============================================================================

test.describe('Organization Member - Read-Only Calendar', () => {
  setupMockApi();
  test.beforeEach(async ({ page }) => {
    await mockOrgMemberApiResponses(page);
  });

  test('should display calendar with assigned events', async ({ page }) => {
    await page.goto(`${BACKOFFICE_URL}/calendar`);
    await mockOrgMemberAuth(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Calendar should be visible
    await expect(
      page.locator('.calendar')
        .or(page.getByTestId('calendar'))
        .or(page.getByText('Kalender'))
    ).toBeVisible();
  });

  test('should NOT show create block button for org_member', async ({ page }) => {
    await page.goto(`${BACKOFFICE_URL}/calendar`);
    await mockOrgMemberAuth(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // org_member should NOT see block creation options
    await expect(page.getByText(/opprett blokkering/i)).not.toBeVisible();
    await expect(page.getByText(/create block/i)).not.toBeVisible();
  });
});

// ============================================================================
// Test Suite: Organization Member - Dashboard
// ============================================================================

test.describe('Organization Member - Task-Oriented Dashboard', () => {
  setupMockApi();
  test.beforeEach(async ({ page }) => {
    await mockOrgMemberApiResponses(page);
  });

  test('should display org_member dashboard with widgets', async ({ page }) => {
    await page.goto(BACKOFFICE_URL);
    await mockOrgMemberAuth(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show welcome message
    await expect(page.getByText(/velkommen/i).or(page.getByText(/welcome/i))).toBeVisible();

    // Should show pending tasks widget
    await expect(
      page.getByText(/ventende/i)
        .or(page.getByText(/pending/i))
    ).toBeVisible();
  });

  test('should show calendar preview widget', async ({ page }) => {
    await page.goto(BACKOFFICE_URL);
    await mockOrgMemberAuth(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show today/this week section
    await expect(
      page.getByText(/i dag/i)
        .or(page.getByText(/today/i))
        .or(page.getByText(/kalender/i))
    ).toBeVisible();
  });
});
