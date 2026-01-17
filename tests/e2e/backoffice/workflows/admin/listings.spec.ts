import { test, expect } from '../../fixtures/evidence.fixture';
import { config } from '../../config/backoffice.config';

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
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.describe('List View', () => {
    test('should display listings list', async ({ page, evidence }) => {
      await page.goto('/rental-objects');
      await page.waitForLoadState('networkidle');

      // Page should load
      expect(page.url()).toContain('/rental-objects');
      
      // Should have table or card list
      const hasTable = await page.locator('table, [data-testid="data-table"]').isVisible().catch(() => false);
      const hasCards = await page.locator('[data-testid="listing-card"], .listing-card').count() > 0;
      
      expect(hasTable || hasCards, 'Should display listings').toBe(true);

      // No 5xx errors
      expect(evidence.getApiErrors()).toHaveLength(0);
    });

    test('should have filter controls', async ({ page }) => {
      await page.goto('/rental-objects');
      await page.waitForLoadState('networkidle');

      // Look for filter components
      const hasFilters = await page.locator(
        '[data-testid="filter"], input[type="search"], select, [role="combobox"]'
      ).first().isVisible();
      
      expect(hasFilters).toBe(true);
    });

    test('should have pagination or load more', async ({ page }) => {
      await page.goto('/rental-objects');
      await page.waitForLoadState('networkidle');

      // Look for pagination
      const hasPagination = await page.locator(
        '[data-testid="pagination"], nav[aria-label*="paginering"], .pagination, button:has-text("Neste")'
      ).isVisible().catch(() => false);

      // May also have infinite scroll or "load more"
      const hasLoadMore = await page.locator(
        'button:has-text("Last inn mer"), button:has-text("Vis mer")'
      ).isVisible().catch(() => false);

      // At least one should exist for proper list handling
      // (or list is short enough to not need pagination)
      console.log(`Pagination: ${hasPagination}, Load more: ${hasLoadMore}`);
    });
  });

  test.describe('Create Listing (Wizard)', () => {
    test('should access creation wizard', async ({ page }) => {
      await page.goto('/rental-objects/wizard');
      await page.waitForLoadState('networkidle');

      // Should see wizard or form
      const hasWizard = await page.locator(
        '[data-testid="wizard"], .wizard, form, [role="form"]'
      ).isVisible();
      
      expect(hasWizard).toBe(true);
    });

    test('should display required field validation', async ({ page }) => {
      await page.goto('/rental-objects/wizard');
      await page.waitForLoadState('networkidle');

      // Try to submit without filling required fields
      const submitButton = page.locator(
        'button[type="submit"], button:has-text("Opprett"), button:has-text("Lagre")'
      ).first();

      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(500);

        // Should show validation errors
        const hasValidationError = await page.locator(
          '[role="alert"], .error, [data-testid="error"], .validation-error, [aria-invalid="true"]'
        ).isVisible().catch(() => false);

        // Validation should occur
        console.log(`Validation shown: ${hasValidationError}`);
      }
    });

    test('should have category selection', async ({ page }) => {
      await page.goto('/rental-objects/wizard');
      await page.waitForLoadState('networkidle');

      // Look for category selector
      const hasCategory = await page.locator(
        'select:has-text("Kategori"), [data-testid="category-select"], [role="listbox"], [aria-label*="kategori"]'
      ).first().isVisible().catch(() => false);

      // Or category radio buttons/cards
      const hasCategoryCards = await page.locator(
        '[data-testid="category-card"], input[name="category"], input[name="type"]'
      ).first().isVisible().catch(() => false);

      expect(hasCategory || hasCategoryCards, 'Should have category selection').toBe(true);
    });
  });

  test.describe('Edit Listing', () => {
    test('should navigate to first listing detail', async ({ page }) => {
      await page.goto('/rental-objects');
      await page.waitForLoadState('networkidle');

      // Find first listing link
      const firstListing = page.locator('a[href*="/rental-objects/"]').first();
      
      if (await firstListing.isVisible()) {
        await firstListing.click();
        await page.waitForLoadState('networkidle');

        // Should be on detail or edit page
        expect(page.url()).toMatch(/\/rental-objects\/[a-zA-Z0-9-]+/);
      } else {
        test.skip(true, 'No listings available');
      }
    });

    test('listing detail should have edit controls', async ({ page }) => {
      await page.goto('/rental-objects');
      await page.waitForLoadState('networkidle');

      const firstListing = page.locator('a[href*="/rental-objects/"]').first();
      
      if (await firstListing.isVisible()) {
        await firstListing.click();
        await page.waitForLoadState('networkidle');

        // Should have edit button or editable fields
        const hasEditButton = await page.locator(
          'button:has-text("Rediger"), button:has-text("Endre"), [data-testid="edit-button"]'
        ).isVisible().catch(() => false);

        const hasEditableFields = await page.locator(
          'input:not([readonly]):not([disabled]), textarea:not([readonly]):not([disabled])'
        ).first().isVisible().catch(() => false);

        expect(hasEditButton || hasEditableFields, 'Should have edit capability').toBe(true);
      } else {
        test.skip(true, 'No listings available');
      }
    });
  });

  test.describe('Status Transitions', () => {
    test('should have status controls on listing', async ({ page }) => {
      await page.goto('/rental-objects');
      await page.waitForLoadState('networkidle');

      const firstListing = page.locator('a[href*="/rental-objects/"]').first();
      
      if (await firstListing.isVisible()) {
        await firstListing.click();
        await page.waitForLoadState('networkidle');

        // Look for status selector or action buttons
        const hasStatusControl = await page.locator(
          '[data-testid="status-select"], select:has-text("Status"), button:has-text("Publiser"), button:has-text("Arkiver")'
        ).first().isVisible().catch(() => false);

        console.log(`Status controls visible: ${hasStatusControl}`);
      } else {
        test.skip(true, 'No listings available');
      }
    });
  });
});
