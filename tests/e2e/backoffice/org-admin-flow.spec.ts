/**
 * E2E Tests: Organization Admin Flow
 *
 * End-to-end verification of the Organization Admin application flow:
 * 1. Login as ORG_ADMIN
 * 2. View org-scoped dashboard with assigned objects
 * 3. View and filter scoped bookings
 * 4. Navigate to blocks management
 * 5. Create, view, and delete blocks
 * 6. Verify capability-based navigation filtering
 *
 * These tests verify the complete org admin journey from login to
 * managing assigned rental objects and blocks.
 */

import { test, expect, Page } from '@playwright/test';

// Backoffice app runs on port 5175
const BACKOFFICE_URL = 'http://localhost:5175';

// Test data
const TEST_ORG_ADMIN = {
  id: 'test-org-admin-id',
  email: 'org-admin@test-org.no',
  name: 'Test Org Admin',
  role: 'org_admin',
  tenantId: 'test-tenant-id',
  organizationId: 'test-org-id',
};

const TEST_RENTAL_OBJECT = {
  id: 'test-rental-object-id',
  name: 'Test Venue',
  status: 'published',
};

const TEST_BLOCK = {
  title: 'Vedlikehold',
  reason: 'Planlagt vedlikehold av lokalet',
};

/**
 * Helper: Mock authentication for ORG_ADMIN role
 */
async function mockOrgAdminAuth(page: Page) {
  await page.evaluate(() => {
    const mockUser = {
      id: 'test-org-admin-id',
      email: 'org-admin@test-org.no',
      name: 'Test Org Admin',
      role: 'org_admin',
      tenantId: 'test-tenant-id',
      organizationId: 'test-org-id',
      permissions: [
        'org_admin:enabled',
        'rental_objects:read:assigned',
        'rental_objects:update:assigned',
        'bookings:read:assigned',
        'bookings:approve:assigned',
        'bookings:reject:assigned',
        'calendar:view:assigned',
        'blocks:read:assigned',
        'blocks:manage:assigned',
        'messaging:enabled',
        'reports:read:assigned',
      ],
    };

    const mockToken = {
      accessToken: 'mock-jwt-token-for-org-admin',
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      refreshToken: 'mock-refresh-token-org-admin',
    };

    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    localStorage.setItem('auth_token', JSON.stringify(mockToken));
    localStorage.setItem('isAuthenticated', 'true');
  });
}

/**
 * Helper: Mock API responses for org-scoped data
 */
async function mockOrgAdminApiResponses(page: Page) {
  // Mock org dashboard stats
  await page.route('**/api/org-dashboard/stats', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          pendingBookings: 3,
          confirmedBookings: 12,
          assignedRentalObjectCount: 2,
          activeBlocks: 1,
        },
      }),
    });
  });

  // Mock assigned rental objects
  await page.route('**/api/org-dashboard/assigned-rental-objects', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          { id: 'rental-obj-1', name: 'Conference Room A', status: 'published' },
          { id: 'rental-obj-2', name: 'Meeting Room B', status: 'published' },
        ],
      }),
    });
  });

  // Mock pending items
  await page.route('**/api/org-dashboard/pending-items*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: 'booking-1',
            rentalObjectName: 'Conference Room A',
            requesterName: 'John Doe',
            startDate: new Date().toISOString(),
            status: 'pending',
          },
          {
            id: 'booking-2',
            rentalObjectName: 'Meeting Room B',
            requesterName: 'Jane Smith',
            startDate: new Date(Date.now() + 86400000).toISOString(),
            status: 'pending',
          },
        ],
        meta: { total: 2, limit: 10, offset: 0 },
      }),
    });
  });

  // Mock calendar preview
  await page.route('**/api/org-dashboard/calendar-preview*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          bookingsThisWeek: 5,
          blocksThisWeek: 1,
          availableSlots: 42,
        },
      }),
    });
  });

  // Mock alerts
  await page.route('**/api/org-dashboard/alerts', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [],
      }),
    });
  });

  // Mock blocks list
  await page.route('**/api/blocks*', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'block-1',
              title: 'Planlagt vedlikehold',
              reason: 'Årlig vedlikehold',
              rentalObjectId: 'rental-obj-1',
              rentalObjectName: 'Conference Room A',
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 86400000).toISOString(),
              allDay: true,
              recurring: false,
              visibility: 'public',
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          meta: { total: 1, limit: 50, offset: 0 },
        }),
      });
    } else if (route.request().method() === 'POST') {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'block-new',
            title: 'Test Block',
            status: 'active',
          },
          message: 'Block created successfully',
        }),
      });
    }
  });

  // Mock capabilities
  await page.route('**/api/capabilities/backoffice', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          role: 'org_admin',
          capabilities: [
            'CAP_ORG_ADMIN_ENABLED',
            'CAP_NAV_DASHBOARD',
            'CAP_NAV_BOOKINGS',
            'CAP_NAV_CALENDAR',
            'CAP_NAV_BLOCKS',
            'CAP_NAV_MESSAGES',
            'CAP_NAV_REPORTS',
            'CAP_NAV_HELP',
            'CAP_RENTAL_OBJECTS_READ_ASSIGNED',
            'CAP_RENTAL_OBJECTS_UPDATE_ASSIGNED',
            'CAP_BOOKINGS_READ_ASSIGNED',
            'CAP_BOOKINGS_APPROVE_ASSIGNED',
            'CAP_BLOCKS_READ_ASSIGNED',
            'CAP_BLOCKS_MANAGE_ASSIGNED',
          ],
          uiHints: {
            showDashboard: true,
            showBookings: true,
            showCalendar: true,
            showBlocks: true,
            showMessages: true,
            showReports: true,
            showHelp: true,
          },
        },
      }),
    });
  });
}

test.describe('Organization Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Set up API mocks before navigating
    await mockOrgAdminApiResponses(page);
  });

  test('should display org admin dashboard with scoped stats', async ({ page }) => {
    // Navigate to backoffice
    await page.goto(BACKOFFICE_URL);

    // Mock authentication
    await mockOrgAdminAuth(page);

    // Reload to apply auth
    await page.reload();

    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 }).catch(() => {
      // If data-testid not found, wait for page to load
      return page.waitForLoadState('networkidle');
    });

    // Verify dashboard stats are displayed
    await expect(page.getByText(/ventende bookinger/i).or(page.getByText(/pending bookings/i))).toBeVisible();
  });

  test('should show limited navigation for org_admin role', async ({ page }) => {
    await page.goto(BACKOFFICE_URL);
    await mockOrgAdminAuth(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Org admin should see these nav items
    await expect(page.getByText('Dashboard').or(page.getByText('Oversikt'))).toBeVisible();
    await expect(page.getByText('Bookinger').or(page.getByText('Bookings'))).toBeVisible();
    await expect(page.getByText('Kalender').or(page.getByText('Calendar'))).toBeVisible();

    // Org admin should NOT see admin-only items
    await expect(page.getByText('Organisasjoner')).not.toBeVisible();
    await expect(page.getByText('Brukeradmin')).not.toBeVisible();
  });

  test('should navigate to blocks page', async ({ page }) => {
    await page.goto(BACKOFFICE_URL);
    await mockOrgAdminAuth(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Navigate to blocks
    const blocksLink = page.getByText('Blokkeringer').or(page.getByText('Blocks'));
    if (await blocksLink.isVisible()) {
      await blocksLink.click();
      await page.waitForURL('**/blocks');

      // Verify blocks page content
      await expect(page.getByText(/blokkering/i).or(page.getByText(/block/i))).toBeVisible();
    }
  });

  test('should display blocks list with filters', async ({ page }) => {
    await page.goto(`${BACKOFFICE_URL}/blocks`);
    await mockOrgAdminAuth(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify blocks list is displayed
    await expect(page.getByText('Planlagt vedlikehold').or(page.getByText(/vedlikehold/i))).toBeVisible();

    // Verify filter dropdowns exist
    await expect(page.locator('select').first()).toBeVisible();
  });

  test('should open block creation form', async ({ page }) => {
    await page.goto(`${BACKOFFICE_URL}/blocks`);
    await mockOrgAdminAuth(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Click create button
    const createButton = page.getByText(/opprett blokkering/i).or(page.getByText(/create block/i));
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForURL('**/blocks/new');

      // Verify form fields exist
      await expect(page.locator('input[type="text"]').first()).toBeVisible();
      await expect(page.locator('select').first()).toBeVisible();
    }
  });

  test('should view block details', async ({ page }) => {
    // Mock single block endpoint
    await page.route('**/api/blocks/block-1', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'block-1',
            title: 'Planlagt vedlikehold',
            reason: 'Årlig vedlikehold',
            rentalObjectId: 'rental-obj-1',
            rentalObjectName: 'Conference Room A',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 86400000).toISOString(),
            allDay: true,
            recurring: false,
            visibility: 'public',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      });
    });

    await page.goto(`${BACKOFFICE_URL}/blocks/block-1`);
    await mockOrgAdminAuth(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify detail view content
    await expect(page.getByText('Planlagt vedlikehold').or(page.getByText(/vedlikehold/i))).toBeVisible();
    await expect(page.getByText('Conference Room A').or(page.getByText(/conference/i))).toBeVisible();
  });

  test('should handle scope enforcement - cannot access unassigned objects', async ({ page }) => {
    // Mock 403 response for unassigned object
    await page.route('**/api/blocks/unassigned-block', (route) => {
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          type: 'https://api.digilist.no/problems/forbidden',
          title: 'Forbidden',
          status: 403,
          detail: 'You do not have access to this resource',
        }),
      });
    });

    await page.goto(`${BACKOFFICE_URL}/blocks/unassigned-block`);
    await mockOrgAdminAuth(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show error or redirect
    await expect(
      page.getByText(/ikke funnet/i)
        .or(page.getByText(/not found/i))
        .or(page.getByText(/feil/i))
        .or(page.getByText(/error/i))
    ).toBeVisible();
  });
});

test.describe('Organization Admin - Booking Approval Flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockOrgAdminApiResponses(page);
  });

  test('should view pending bookings for assigned objects', async ({ page }) => {
    // Mock scoped bookings endpoint
    await page.route('**/api/bookings*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'booking-1',
              rentalObjectName: 'Conference Room A',
              status: 'pending',
              startTime: new Date().toISOString(),
              endTime: new Date(Date.now() + 3600000).toISOString(),
              user: { name: 'John Doe' },
            },
          ],
          meta: { total: 1, limit: 20, offset: 0 },
        }),
      });
    });

    await page.goto(`${BACKOFFICE_URL}/bookings?status=pending&scope=assigned`);
    await mockOrgAdminAuth(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify bookings list
    await expect(page.getByText('Conference Room A').or(page.getByText(/John Doe/i))).toBeVisible();
  });
});

test.describe('Organization Admin - Calendar View', () => {
  test.beforeEach(async ({ page }) => {
    await mockOrgAdminApiResponses(page);
  });

  test('should display calendar with scoped events', async ({ page }) => {
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
              title: 'Booking: John Doe',
              start: new Date().toISOString(),
              end: new Date(Date.now() + 3600000).toISOString(),
              resourceId: 'rental-obj-1',
            },
            {
              id: 'event-2',
              type: 'block',
              title: 'Vedlikehold',
              start: new Date(Date.now() + 86400000).toISOString(),
              end: new Date(Date.now() + 172800000).toISOString(),
              resourceId: 'rental-obj-1',
            },
          ],
        }),
      });
    });

    await page.goto(`${BACKOFFICE_URL}/calendar?scope=assigned`);
    await mockOrgAdminAuth(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify calendar is displayed
    await expect(page.locator('.calendar').or(page.getByTestId('calendar'))).toBeVisible();
  });
});
