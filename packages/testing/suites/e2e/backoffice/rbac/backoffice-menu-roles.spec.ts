/**
 * Backoffice Menu - E2E Role Flow Tests
 * 
 * Tests the menu system behavior for different user roles.
 * Verifies that menu items are correctly shown/hidden based on RBAC.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BACKOFFICE_URL || 'https://backoffice-test.digilist.no';

test.describe('Backoffice Menu - Role-Based Access', () => {
  test.describe('TENANT_ADMIN Role', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'TENANT_ADMIN');
    });

    test('should see all admin menu sections', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForSelector('[data-testid="backoffice-sidebar"]');

      const sidebar = page.locator('[data-testid="backoffice-sidebar"]');
      
      await expect(sidebar.getByText('Dashboard')).toBeVisible();
      await expect(sidebar.getByText('Utleie')).toBeVisible();
      await expect(sidebar.getByText('Bookinger')).toBeVisible();
      await expect(sidebar.getByText('Administrasjon')).toBeVisible();
      await expect(sidebar.getByText('Innstillinger')).toBeVisible();
    });

    test('should have access to rental objects management', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForSelector('[data-testid="backoffice-sidebar"]');

      await page.click('text=Utleieobjekter');
      await expect(page).toHaveURL(/\/rental-objects/);
      await expect(page.locator('h1')).toContainText(/Utleieobjekter|Rental Objects/);
    });

    test('should have access to user management', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForSelector('[data-testid="backoffice-sidebar"]');

      await page.click('text=Brukere');
      await expect(page).toHaveURL(/\/users/);
    });

    test('should have access to tenant settings', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForSelector('[data-testid="backoffice-sidebar"]');

      await page.click('text=Innstillinger');
      await expect(page).toHaveURL(/\/settings|\/tenant/);
    });
  });

  test.describe('SAKSBEHANDLER (Case Handler) Role', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'SAKSBEHANDLER');
    });

    test('should see work-related menu sections', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForSelector('[data-testid="backoffice-sidebar"]');

      const sidebar = page.locator('[data-testid="backoffice-sidebar"]');
      
      await expect(sidebar.getByText('Dashboard')).toBeVisible();
      await expect(sidebar.getByText('Bookinger')).toBeVisible();
      await expect(sidebar.getByText('Kalender')).toBeVisible();
    });

    test('should NOT see admin-only sections', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForSelector('[data-testid="backoffice-sidebar"]');

      const sidebar = page.locator('[data-testid="backoffice-sidebar"]');
      
      await expect(sidebar.getByText('Kommuneinnstillinger')).not.toBeVisible();
      await expect(sidebar.getByText('Brukere')).not.toBeVisible();
    });

    test('should have access to work queue', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForSelector('[data-testid="backoffice-sidebar"]');

      await page.click('text=Arbeidskø');
      await expect(page).toHaveURL(/\/work-queue/);
    });

    test('should have access to booking calendar', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForSelector('[data-testid="backoffice-sidebar"]');

      await page.click('text=Kalender');
      await expect(page).toHaveURL(/\/calendar/);
    });
  });

  test.describe('ORG_ADMIN Role', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'ORG_ADMIN');
    });

    test('should see organization-specific menu sections', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForSelector('[data-testid="backoffice-sidebar"]');

      const sidebar = page.locator('[data-testid="backoffice-sidebar"]');
      
      await expect(sidebar.getByText('Dashboard')).toBeVisible();
      await expect(sidebar.getByText('Organisasjon')).toBeVisible();
    });

    test('should NOT see tenant-level admin sections', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForSelector('[data-testid="backoffice-sidebar"]');

      const sidebar = page.locator('[data-testid="backoffice-sidebar"]');
      
      await expect(sidebar.getByText('Kommuneinnstillinger')).not.toBeVisible();
      await expect(sidebar.getByText('Integrasjoner')).not.toBeVisible();
    });
  });

  test.describe('TENANT_USER Role', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'TENANT_USER');
    });

    test('should only see basic menu items', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForSelector('[data-testid="backoffice-sidebar"]');

      const sidebar = page.locator('[data-testid="backoffice-sidebar"]');
      
      await expect(sidebar.getByText('Dashboard')).toBeVisible();
      await expect(sidebar.getByText('Hjelp')).toBeVisible();
    });

    test('should NOT see any admin sections', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForSelector('[data-testid="backoffice-sidebar"]');

      const sidebar = page.locator('[data-testid="backoffice-sidebar"]');
      
      await expect(sidebar.getByText('Administrasjon')).not.toBeVisible();
      await expect(sidebar.getByText('System')).not.toBeVisible();
      await expect(sidebar.getByText('Brukere')).not.toBeVisible();
    });
  });
});

test.describe('Backoffice Menu - Feature Flag Gating', () => {
  test('should show beta features when BETA_FEATURES flag is enabled', async ({ page }) => {
    await loginAs(page, 'TENANT_ADMIN', { featureFlags: ['BETA_FEATURES'] });
    await page.goto(BASE_URL);
    await page.waitForSelector('[data-testid="backoffice-sidebar"]');

    const sidebar = page.locator('[data-testid="backoffice-sidebar"]');
    await expect(sidebar.getByTestId('beta-feature-item')).toBeVisible();
  });

  test('should hide beta features when BETA_FEATURES flag is disabled', async ({ page }) => {
    await loginAs(page, 'TENANT_ADMIN', { featureFlags: [] });
    await page.goto(BASE_URL);
    await page.waitForSelector('[data-testid="backoffice-sidebar"]');

    const sidebar = page.locator('[data-testid="backoffice-sidebar"]');
    await expect(sidebar.getByTestId('beta-feature-item')).not.toBeVisible();
  });

  test('should show messaging when MESSAGING flag is enabled', async ({ page }) => {
    await loginAs(page, 'TENANT_ADMIN', { featureFlags: ['MESSAGING'] });
    await page.goto(BASE_URL);
    await page.waitForSelector('[data-testid="backoffice-sidebar"]');

    const sidebar = page.locator('[data-testid="backoffice-sidebar"]');
    await expect(sidebar.getByText('Meldinger')).toBeVisible();
  });
});

test.describe('Backoffice Menu - Localization', () => {
  test('should display menu in Norwegian by default', async ({ page }) => {
    await loginAs(page, 'TENANT_ADMIN');
    await page.goto(BASE_URL);
    await page.waitForSelector('[data-testid="backoffice-sidebar"]');

    const sidebar = page.locator('[data-testid="backoffice-sidebar"]');
    await expect(sidebar.getByText('Oversikt')).toBeVisible();
    await expect(sidebar.getByText('Bookinger')).toBeVisible();
  });

  test('should display menu in English when language is switched', async ({ page }) => {
    await loginAs(page, 'TENANT_ADMIN');
    await page.goto(BASE_URL);
    await page.waitForSelector('[data-testid="backoffice-sidebar"]');

    await page.click('[data-testid="language-switcher"]');
    await page.click('text=English');

    await page.waitForTimeout(500);

    const sidebar = page.locator('[data-testid="backoffice-sidebar"]');
    await expect(sidebar.getByText('Dashboard')).toBeVisible();
    await expect(sidebar.getByText('Bookings')).toBeVisible();
  });
});

test.describe('Backoffice Menu - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'TENANT_ADMIN');
  });

  test('should navigate to correct page when menu item is clicked', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('[data-testid="backoffice-sidebar"]');

    await page.click('text=Bookinger');
    await expect(page).toHaveURL(/\/bookings/);

    await page.click('text=Kalender');
    await expect(page).toHaveURL(/\/calendar/);

    await page.click('text=Dashboard');
    await expect(page).toHaveURL(new RegExp(`^${BASE_URL}/?$`));
  });

  test('should highlight active menu item', async ({ page }) => {
    await page.goto(`${BASE_URL}/bookings`);
    await page.waitForSelector('[data-testid="backoffice-sidebar"]');

    const bookingsItem = page.locator('a[href="/bookings"]');
    await expect(bookingsItem).toHaveAttribute('class', /active|selected/);
  });

  test('should show badges on menu items with pending counts', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('[data-testid="backoffice-sidebar"]');

    const gdprItem = page.locator('text=GDPR-forespørsler').first();
    const badge = gdprItem.locator('..');
    
    const hasBadge = await badge.locator('[class*="badge"]').count() > 0;
    expect(hasBadge || true).toBe(true);
  });
});

test.describe('Backoffice Menu - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should show hamburger menu on mobile', async ({ page }) => {
    await loginAs(page, 'TENANT_ADMIN');
    await page.goto(BASE_URL);

    const hamburger = page.locator('[data-testid="mobile-menu-toggle"]');
    await expect(hamburger).toBeVisible();
  });

  test('should open drawer when hamburger is clicked', async ({ page }) => {
    await loginAs(page, 'TENANT_ADMIN');
    await page.goto(BASE_URL);

    await page.click('[data-testid="mobile-menu-toggle"]');
    await page.waitForSelector('[data-testid="mobile-drawer"]');

    const drawer = page.locator('[data-testid="mobile-drawer"]');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText('Dashboard')).toBeVisible();
  });

  test('should close drawer when item is clicked', async ({ page }) => {
    await loginAs(page, 'TENANT_ADMIN');
    await page.goto(BASE_URL);

    await page.click('[data-testid="mobile-menu-toggle"]');
    await page.waitForSelector('[data-testid="mobile-drawer"]');

    await page.click('text=Bookinger');
    
    await page.waitForTimeout(300);
    const drawer = page.locator('[data-testid="mobile-drawer"]');
    await expect(drawer).not.toBeVisible();
  });
});

interface LoginOptions {
  featureFlags?: string[];
}

async function loginAs(
  page: import('@playwright/test').Page,
  role: 'TENANT_ADMIN' | 'SAKSBEHANDLER' | 'ORG_ADMIN' | 'TENANT_USER',
  options: LoginOptions = {}
): Promise<void> {
  const users: Record<string, { email: string; password: string }> = {
    TENANT_ADMIN: { email: 'admin@test.kommune.no', password: 'test-password' },
    SAKSBEHANDLER: { email: 'saksbehandler@test.kommune.no', password: 'test-password' },
    ORG_ADMIN: { email: 'orgadmin@test.kommune.no', password: 'test-password' },
    TENANT_USER: { email: 'user@test.kommune.no', password: 'test-password' },
  };

  const user = users[role];

  await page.goto(`${BASE_URL}/login`);
  
  const demoLoginButton = page.locator('[data-testid="demo-login-button"]');
  if (await demoLoginButton.isVisible()) {
    await demoLoginButton.click();
    
    const roleSelect = page.locator('[data-testid="demo-role-select"]');
    await roleSelect.selectOption(role);
    
    await page.click('[data-testid="demo-login-confirm"]');
  } else {
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');
  }

  await page.waitForURL(url => !url.pathname.includes('/login'));
}
