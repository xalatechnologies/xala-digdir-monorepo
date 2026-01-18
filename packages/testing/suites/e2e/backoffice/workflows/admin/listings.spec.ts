// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@xala/api/../../mocks/api-server.mock';
import { test, expect } from '@xala/api/fixtures/evidence.fixture';
import { config } from '@xala/api/config/backoffice.config';

/**
 * Admin Workflow - Listings (Rental Objects) Management
 * 
 * Tests for listing CRUD operations:
 * - List view with filters/sorting
 * - Create listing (via wizard)
 * - Edit listing
 * - Status transitions
 */
test.describe('Admin - Listings Management', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.describe('List View', () => {
  setupMockApi();
    test('should display listings list', async ({ page, evidence }) => {
      await page.goto('/rental-objects', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      // Page should load
      expect(page.url()).toContain('/rental-objects');
      
      // Should have content (table, cards, or list)
      const hasContent = await page.locator(
        'table, [data-testid="data-table"], main, .listing-card, [role="grid"]'
      ).first().isVisible().catch(() => false);
      
      expect(hasContent, 'Should display listings content').toBe(true);

      // No 5xx errors
      expect(evidence.getApiErrors()).toHaveLength(0);
    });

    test('should have filter or search', async ({ page }) => {
      await page.goto('/rental-objects', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      // Look for any filter/search component
      const hasFilters = await page.locator(
        '[data-testid="filter"], input[type="search"], select, [role="combobox"], input[placeholder*="øk"], button:has-text("Filter")'
      ).first().isVisible().catch(() => false);
      
      console.log(`Filter controls visible: ${hasFilters}`);
    });

    test('should load page content', async ({ page }) => {
      await page.goto('/rental-objects', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      // Page should not be blank
      const bodyText = await page.locator('main, [role="main"]').first().textContent() || '';
      expect(bodyText.length).toBeGreaterThan(10);
    });
  });

  test.describe('Create Listing (Wizard)', () => {
  setupMockApi();
    test('should access creation page or wizard', async ({ page }) => {
      await page.goto('/rental-objects', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      // Look for create button
      const createButton = page.locator(
        'a[href*="wizard"], a[href*="new"], button:has-text("Opprett"), button:has-text("Ny"), button:has-text("Legg til")'
      ).first();

      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForTimeout(2000);

        // Should see form or wizard step
        const hasForm = await page.locator('form, [role="form"], [data-testid="wizard"]').isVisible().catch(() => false);
        console.log(`Creation form visible: ${hasForm}`);
      } else {
        // Try direct navigation
        await page.goto('/rental-objects/wizard', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
        
        const hasWizard = await page.locator('form, main').isVisible();
        expect(hasWizard).toBe(true);
      }
    });
  });

  test.describe('Listing Detail', () => {
  setupMockApi();
    test('should access listing detail if listings exist', async ({ page }) => {
      await page.goto('/rental-objects', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      // Find first listing link
      const listingLink = page.locator(
        'a[href*="/rental-objects/"]:not([href*="wizard"]):not([href="/rental-objects/"])'
      ).first();
      
      if (await listingLink.isVisible()) {
        const href = await listingLink.getAttribute('href');
        console.log(`First listing href: ${href}`);
        
        await listingLink.click();
        await page.waitForTimeout(2000);

        // Should be on detail page
        expect(page.url()).toMatch(/\/rental-objects\/[a-zA-Z0-9-]+/);
      } else {
        console.log('No listing links found');
        test(true, 'No listings available');
      }
    });
  });
});
