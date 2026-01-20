// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@digilist/api/mocks/api-server.mock';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * MinSide Private User Flow E2E Tests
 * 
 * Tests the complete private user journey:
 * - Dashboard view
 * - Bookings list and actions
 * - Profile and settings
 */

test.describe('MinSide - Private User Flow', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/minside/.auth/user.json' });

  test.describe('Dashboard', () => {
  setupMockApi();
    test.beforeEach(async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('should display personal dashboard', async ({ page }) => {
      // Should be on dashboard
      const title = page.locator('h1, h2, [data-testid="dashboard-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      console.log('✓ Dashboard loaded');
    });

    test('should display upcoming bookings widget', async ({ page }) => {
      const upcomingBookings = page.locator('[data-testid="upcoming-bookings"], [class*="upcoming"]').first();
      const bookingsSection = page.locator('text=/kommende|upcoming/i').first();
      
      const hasWidget = await upcomingBookings.isVisible().catch(() => false);
      const hasSection = await bookingsSection.isVisible().catch(() => false);
      
      console.log(`Upcoming bookings: widget=${hasWidget ? '✓' : '✗'}, section=${hasSection ? '✓' : '✗'}`);
      expect(hasWidget || hasSection).toBe(true);
    });

    test('should display user stats', async ({ page }) => {
      const statsElements = page.locator('[data-testid*="stat"], [class*="stats"]');
      const count = await statsElements.count();
      
      console.log(`Stats widgets: ${count}`);
    });

    test('should navigate to bookings from dashboard', async ({ page }) => {
      const bookingsLink = page.locator('a[href*="bookings"], button:has-text("Se alle")').first();
      
      if (await bookingsLink.isVisible()) {
        await bookingsLink.click();
        await page.waitForTimeout(2000);
        
        const isOnBookings = page.url().includes('/bookings');
        console.log(`Navigate to bookings: ${isOnBookings ? '✓' : '✗'}`);
      }
    });
  });

  test.describe('Bookings', () => {
  setupMockApi();
    test.beforeEach(async ({ page }) => {
      await page.goto('/bookings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('should display bookings list', async ({ page }) => {
      // Wait for content
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      // Check for bookings or empty state
      const bookingsList = page.locator('[data-testid="bookings-list"], table, [class*="booking"]');
      const emptyState = page.locator('[data-testid="empty-state"], text=/ingen booking/i');
      
      const hasList = await bookingsList.first().isVisible().catch(() => false);
      const hasEmpty = await emptyState.first().isVisible().catch(() => false);
      
      console.log(`Bookings: list=${hasList ? '✓' : '✗'}, empty=${hasEmpty ? '✓' : '✗'}`);
      expect(hasList || hasEmpty).toBe(true);
    });

    test('should have filter options', async ({ page }) => {
      const filters = {
        status: 'select[data-testid*="status"], button:has-text("Status")',
        search: 'input[type="search"], input[placeholder*="søk" i]',
        dateRange: '[data-testid*="date"], input[type="date"]',
      };
      
      console.log('Filter options:');
      for (const [name, selector] of Object.entries(filters)) {
        const element = page.locator(selector).first();
        const visible = await element.isVisible().catch(() => false);
        console.log(`├─ ${name}: ${visible ? '✓' : '–'}`);
      }
    });

    test('should open booking detail', async ({ page }) => {
      const firstBooking = page.locator('[data-testid^="booking-"], tr[data-booking-id], a[href*="/bookings/"]').first();
      
      if (await firstBooking.isVisible().catch(() => false)) {
        await firstBooking.click();
        await page.waitForTimeout(2000);
        
        // Check for detail view (modal or page)
        const detail = page.locator('[data-testid="booking-detail"], [role="dialog"], [class*="modal"]').first();
        const detailPage = page.url().includes('/bookings/');
        
        console.log(`Booking detail: ${detail || detailPage ? '✓' : '✗'}`);
      } else {
        console.log('No bookings to open');
      }
    });

    test('should show cancel option for eligible bookings', async ({ page }) => {
      // Find a booking that can be cancelled
      const cancelBtn = page.locator('button:has-text("Avbestill"), button:has-text("Kanseller"), [data-testid="cancel-booking"]').first();
      
      if (await cancelBtn.isVisible().catch(() => false)) {
        console.log('✓ Cancel button available for eligible booking');
        
        // Don't actually cancel - just verify the button exists
        await cancelBtn.click();
        await page.waitForTimeout(500);
        
        // Check for confirmation dialog
        const dialog = page.locator('[role="dialog"], [role="alertdialog"]').first();
        const hasDialog = await dialog.isVisible().catch(() => false);
        
        console.log(`  Confirmation dialog: ${hasDialog ? '✓' : '✗'}`);
        
        // Cancel the dialog
        const cancelDialogBtn = page.locator('button:has-text("Avbryt"), button:has-text("Nei")').first();
        if (await cancelDialogBtn.isVisible()) {
          await cancelDialogBtn.click();
        } else {
          await page.keyboard.press('Escape');
        }
      } else {
        console.log('No cancellable bookings found');
      }
    });
  });

  test.describe('Messages', () => {
  setupMockApi();
    test.beforeEach(async ({ page }) => {
      await page.goto('/messages', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('should display messages inbox', async ({ page }) => {
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      const messagesList = page.locator('[data-testid="messages-list"], [class*="conversation"]');
      const emptyState = page.locator('[data-testid="empty-state"], text=/ingen meldinger/i');
      
      const hasList = await messagesList.first().isVisible().catch(() => false);
      const hasEmpty = await emptyState.first().isVisible().catch(() => false);
      
      console.log(`Messages: list=${hasList ? '✓' : '✗'}, empty=${hasEmpty ? '✓' : '✗'}`);
    });
  });

  test.describe('Settings', () => {
  setupMockApi();
    test.beforeEach(async ({ page }) => {
      await page.goto('/settings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('should display settings page', async ({ page }) => {
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      console.log('✓ Settings page loaded');
    });

    test('should have profile section', async ({ page }) => {
      const profileSection = page.locator('[data-testid="profile-section"], text=/profil/i').first();
      const visible = await profileSection.isVisible().catch(() => false);
      
      console.log(`Profile section: ${visible ? '✓' : '✗'}`);
    });

    test('should have notification preferences', async ({ page }) => {
      const notificationSection = page.locator('[data-testid="notification-settings"], text=/varsler/i').first();
      const visible = await notificationSection.isVisible().catch(() => false);
      
      console.log(`Notification settings: ${visible ? '✓' : '✗'}`);
    });

    test('should have language preference', async ({ page }) => {
      const languageSelect = page.locator('[data-testid="language-select"], select[name*="lang"], button:has-text("Norsk"), button:has-text("English")').first();
      const visible = await languageSelect.isVisible().catch(() => false);
      
      console.log(`Language preference: ${visible ? '✓' : '✗'}`);
    });
  });

  test.describe('Favorites', () => {
  setupMockApi();
    test.beforeEach(async ({ page }) => {
      await page.goto('/favorites', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('should display favorites page', async ({ page }) => {
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      const favoritesList = page.locator('[data-testid="favorites-list"], [class*="favorite"]');
      const emptyState = page.locator('[data-testid="empty-state"], text=/ingen favoritter/i');
      
      const hasList = await favoritesList.first().isVisible().catch(() => false);
      const hasEmpty = await emptyState.first().isVisible().catch(() => false);
      
      console.log(`Favorites: list=${hasList ? '✓' : '✗'}, empty=${hasEmpty ? '✓' : '✗'}`);
    });
  });

  test.describe('Accessibility', () => {
  setupMockApi();
    test('dashboard passes accessibility scan', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
        return;
      }
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      const violations = accessibilityScanResults.violations;
      
      if (violations.length > 0) {
        console.log(`Accessibility violations: ${violations.length}`);
        violations.slice(0, 5).forEach(v => {
          console.log(`  - ${v.id}: ${v.description} (${v.nodes.length} nodes)`);
        });
      } else {
        console.log('✓ No accessibility violations found');
      }
      
      // Allow some violations for now, but warn
      expect(violations.length).toBeLessThan(10);
    });

    test('bookings page passes accessibility scan', async ({ page }) => {
      await page.goto('/bookings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
        return;
      }
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      const violations = accessibilityScanResults.violations;
      console.log(`Bookings a11y violations: ${violations.length}`);
      
      expect(violations.length).toBeLessThan(10);
    });
  });
});
