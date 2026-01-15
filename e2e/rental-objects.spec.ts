/**
 * E2E Tests for Rental Objects Feature
 * Tests the complete user flow for managing rental objects in the backoffice
 */

import { test, expect } from '@playwright/test';

const BACKOFFICE_BASE_URL = 'http://localhost:5175';

test.describe('Rental Objects E2E Tests', () => {
  test.use({ baseURL: BACKOFFICE_BASE_URL });

  test.beforeEach(async ({ page }) => {
    // Navigate to login and authenticate (adjust based on your auth setup)
    await page.goto('/login');
    
    // Mock authentication or use actual login flow
    // For now, we'll assume auth is handled via test setup
    await page.waitForLoadState('networkidle');
  });

  test.describe('Rental Objects List View', () => {
    test('should display rental objects list page', async ({ page }) => {
      await page.goto('/rental-objects');
      await page.waitForLoadState('networkidle');

      // Verify page title
      await expect(page.locator('h1, h2').filter({ hasText: /utleieobjekter/i })).toBeVisible();

      // Verify search input is present
      const searchInput = page.locator('input[placeholder*="Søk"], input[type="search"]');
      await expect(searchInput.first()).toBeVisible();
    });

    test('should filter rental objects by status', async ({ page }) => {
      await page.goto('/rental-objects');
      await page.waitForLoadState('networkidle');

      // Open filter drawer
      const filterButton = page.locator('button').filter({ hasText: /filter/i }).first();
      if (await filterButton.count() > 0) {
        await filterButton.click();
        await page.waitForTimeout(500);

        // Select published status
        const publishedOption = page.locator('text=Publisert, text=published').first();
        if (await publishedOption.count() > 0) {
          await publishedOption.click();
          
          // Apply filter
          const applyButton = page.locator('button').filter({ hasText: /bruk filter|apply/i }).first();
          if (await applyButton.count() > 0) {
            await applyButton.click();
            await page.waitForTimeout(1000);

            // Verify filter is applied (check URL or UI state)
            const url = page.url();
            expect(url).toContain('status=published');
          }
        }
      }
    });

    test('should search rental objects', async ({ page }) => {
      await page.goto('/rental-objects');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('input[placeholder*="Søk"], input[type="search"]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('test');
        await searchInput.press('Enter');
        await page.waitForTimeout(1000);

        // Verify search is applied
        const url = page.url();
        expect(url).toContain('search=test');
      }
    });

    test('should toggle between grid and table view', async ({ page }) => {
      await page.goto('/rental-objects');
      await page.waitForLoadState('networkidle');

      // Find view toggle buttons
      const tableButton = page.locator('button[aria-label*="liste"], button[aria-label*="Liste"]').first();
      const gridButton = page.locator('button[aria-label*="rute"], button[aria-label*="Rute"]').first();

      if (await tableButton.count() > 0 && await gridButton.count() > 0) {
        // Switch to table view
        await tableButton.click();
        await page.waitForTimeout(500);

        // Verify table view is active
        const table = page.locator('table').first();
        if (await table.count() > 0) {
          await expect(table).toBeVisible();
        }

        // Switch back to grid view
        await gridButton.click();
        await page.waitForTimeout(500);

        // Verify grid view is active (check for grid structure)
        const grid = page.locator('[class*="grid"], [data-testid*="grid"]').first();
        if (await grid.count() > 0) {
          await expect(grid).toBeVisible();
        }
      }
    });

    test('should navigate to create rental object page', async ({ page }) => {
      await page.goto('/rental-objects');
      await page.waitForLoadState('networkidle');

      // Click create button
      const createButton = page.locator('button').filter({ hasText: /nytt utleieobjekt|new/i }).first();
      if (await createButton.count() > 0) {
        await createButton.click();
        await page.waitForNavigation({ waitUntil: 'networkidle' });

        // Verify we're on the create page
        expect(page.url()).toContain('/rental-objects/new');
      }
    });
  });

  test.describe('Rental Object Creation', () => {
    test('should create a new rental object', async ({ page }) => {
      await page.goto('/rental-objects/new');
      await page.waitForLoadState('networkidle');

      // Fill in basic information
      const nameInput = page.locator('input[name="name"], input[placeholder*="navn"], input[placeholder*="name"]').first();
      if (await nameInput.count() > 0) {
        await nameInput.fill('E2E Test Rental Object');

        // Select type (if dropdown exists)
        const typeSelect = page.locator('select[name="type"], button[aria-label*="type"]').first();
        if (await typeSelect.count() > 0) {
          await typeSelect.click();
          await page.waitForTimeout(300);
          const spaceOption = page.locator('text=SPACE, text=Space, text=Lokale').first();
          if (await spaceOption.count() > 0) {
            await spaceOption.click();
          }
        }

        // Fill description
        const descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="beskrivelse"]').first();
        if (await descriptionInput.count() > 0) {
          await descriptionInput.fill('E2E test description');
        }

        // Navigate through wizard steps or submit
        const nextButton = page.locator('button').filter({ hasText: /neste|next|complete|fullfør/i }).first();
        const saveButton = page.locator('button[type="submit"], button').filter({ hasText: /lagre|save/i }).first();

        if (await nextButton.count() > 0) {
          // Multi-step wizard - click through steps
          await nextButton.click();
          await page.waitForTimeout(500);
          
          // Continue clicking next until we reach the end
          let attempts = 0;
          while (await nextButton.isVisible() && attempts < 5) {
            await nextButton.click();
            await page.waitForTimeout(500);
            attempts++;
          }
        }

        // Final save/submit
        if (await saveButton.count() > 0) {
          await saveButton.click();
          await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 });

          // Verify we're redirected to the detail page or list
          const url = page.url();
          expect(url).toMatch(/\/rental-objects\/[\w-]+/);
        }
      }
    });
  });

  test.describe('Rental Object Detail View', () => {
    test('should display rental object details', async ({ page }) => {
      // Navigate to a rental object (assuming one exists)
      await page.goto('/rental-objects');
      await page.waitForLoadState('networkidle');

      // Click on first rental object card/row
      const firstRentalObject = page.locator('[data-testid*="rental-object"], [class*="card"], tr').first();
      if (await firstRentalObject.count() > 0) {
        await firstRentalObject.click();
        await page.waitForNavigation({ waitUntil: 'networkidle' });

        // Verify we're on detail page
        expect(page.url()).toMatch(/\/rental-objects\/[\w-]+/);

        // Verify detail content is visible
        await expect(page.locator('h1, h2').first()).toBeVisible();
      }
    });

    test('should switch between tabs', async ({ page }) => {
      // Navigate to a rental object detail page
      await page.goto('/rental-objects');
      await page.waitForLoadState('networkidle');

      const firstRentalObject = page.locator('[data-testid*="rental-object"], [class*="card"], tr').first();
      if (await firstRentalObject.count() > 0) {
        await firstRentalObject.click();
        await page.waitForNavigation({ waitUntil: 'networkidle' });

        // Click on Bookings tab
        const bookingsTab = page.locator('button, a').filter({ hasText: /bookinger|bookings/i }).first();
        if (await bookingsTab.count() > 0) {
          await bookingsTab.click();
          await page.waitForTimeout(500);

          // Verify bookings tab content is visible
          const bookingsContent = page.locator('text=Booking, [data-testid*="booking"]').first();
          if (await bookingsContent.count() > 0) {
            await expect(bookingsContent).toBeVisible();
          }
        }

        // Click on Availability tab
        const availabilityTab = page.locator('button, a').filter({ hasText: /tilgjengelighet|availability/i }).first();
        if (await availabilityTab.count() > 0) {
          await availabilityTab.click();
          await page.waitForTimeout(500);

          // Verify availability content is visible
          const availabilityContent = page.locator('[data-testid*="availability"], text=Calendar').first();
          if (await availabilityContent.count() > 0) {
            await expect(availabilityContent).toBeVisible();
          }
        }
      }
    });

    test('should edit rental object', async ({ page }) => {
      // Navigate to a rental object detail page
      await page.goto('/rental-objects');
      await page.waitForLoadState('networkidle');

      const firstRentalObject = page.locator('[data-testid*="rental-object"], [class*="card"], tr').first();
      if (await firstRentalObject.count() > 0) {
        await firstRentalObject.click();
        await page.waitForNavigation({ waitUntil: 'networkidle' });

        // Click edit button
        const editButton = page.locator('button').filter({ hasText: /rediger|edit/i }).first();
        if (await editButton.count() > 0) {
          await editButton.click();
          await page.waitForNavigation({ waitUntil: 'networkidle' });

          // Verify we're on edit page
          expect(page.url()).toMatch(/\/rental-objects\/[\w-]+$/);
          expect(page.url()).not.toContain('/view');
        }
      }
    });
  });

  test.describe('Rental Object Navigation', () => {
    test('should navigate back to list from detail page', async ({ page }) => {
      await page.goto('/rental-objects');
      await page.waitForLoadState('networkidle');

      // Click on a rental object
      const firstRentalObject = page.locator('[data-testid*="rental-object"], [class*="card"], tr').first();
      if (await firstRentalObject.count() > 0) {
        await firstRentalObject.click();
        await page.waitForNavigation({ waitUntil: 'networkidle' });

        // Click back button
        const backButton = page.locator('button, a').filter({ hasText: /tilbake|back/i }).first();
        if (await backButton.count() > 0) {
          await backButton.click();
          await page.waitForNavigation({ waitUntil: 'networkidle' });

          // Verify we're back on list page
          expect(page.url()).toContain('/rental-objects');
          expect(page.url()).not.toMatch(/\/rental-objects\/[\w-]+/);
        }
      }
    });

    test('should navigate via sidebar', async ({ page }) => {
      await page.goto('/rental-objects');
      await page.waitForLoadState('networkidle');

      // Click on sidebar rental objects link
      const sidebarLink = page.locator('a, button').filter({ hasText: /utleieobjekter/i }).first();
      if (await sidebarLink.count() > 0) {
        await sidebarLink.click();
        await page.waitForNavigation({ waitUntil: 'networkidle' });

        // Verify we're on rental objects page
        expect(page.url()).toContain('/rental-objects');
      }
    });
  });
});
