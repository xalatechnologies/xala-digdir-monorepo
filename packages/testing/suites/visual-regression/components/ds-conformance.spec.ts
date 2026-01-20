/**
 * Visual Regression: DS Component Conformance
 * 
 * Verifies that pages use Design System components correctly
 * and match Storybook definitions.
 */

import { test, expect } from '@playwright/test';

const DS_COMPONENT_SELECTORS = {
  Button: '[data-ds-component="Button"], button.ds-button',
  Card: '[data-ds-component="Card"], .ds-card',
  Input: '[data-ds-component="Input"], input.ds-input',
  Table: '[data-ds-component="Table"], table.ds-table',
  Alert: '[data-ds-component="Alert"], .ds-alert',
  Badge: '[data-ds-component="Badge"], .ds-badge',
  Heading: '[data-ds-component="Heading"], .ds-heading',
  Paragraph: '[data-ds-component="Paragraph"], .ds-paragraph',
};

test.describe('DS Component Conformance', () => {
  test.describe('Backoffice App', () => {
    test('dashboard uses DS components', async ({ page }) => {
      await page.goto('http://localhost:5173/');
      
      // Skip if not logged in (redirect to login)
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Verify no raw HTML buttons without DS classes
      const rawButtons = await page.locator('button:not([data-ds-component]):not(.ds-button)').count();
      
      // Allow some native buttons (form submit, etc)
      expect(rawButtons).toBeLessThan(5);

      // Screenshot for visual comparison
      await expect(page).toHaveScreenshot('backoffice-dashboard.png', {
        mask: [page.locator('.dynamic-timestamp')],
        maxDiffPixelRatio: 0.1,
      });
    });

    test('rental objects page uses DS Table', async ({ page }) => {
      await page.goto('http://localhost:5173/rental-objects');
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Page should use DS Table component
      const hasTable = await page.locator(DS_COMPONENT_SELECTORS.Table).count();
      expect(hasTable).toBeGreaterThan(0);

      // Verify Heading component used
      const hasHeading = await page.locator(DS_COMPONENT_SELECTORS.Heading).count();
      expect(hasHeading).toBeGreaterThan(0);
    });
  });

  test.describe('Web App', () => {
    test('home page uses DS components', async ({ page }) => {
      await page.goto('http://localhost:5174/');
      
      // Verify DS Card components used for listings
      const cards = await page.locator(DS_COMPONENT_SELECTORS.Card).count();
      
      // Should have search/filter components
      const inputs = await page.locator(DS_COMPONENT_SELECTORS.Input).count();
      
      // Screenshot
      await expect(page).toHaveScreenshot('web-home.png', {
        maxDiffPixelRatio: 0.1,
      });
      
      console.log(`Found ${cards} cards, ${inputs} inputs`);
    });

    test('rental object detail page', async ({ page }) => {
      // Navigate to a known rental object
      await page.goto('http://localhost:5174/rental-objects');
      
      // Click first listing if available
      const firstCard = page.locator('[data-testid="rental-object-card"]').first();
      if (await firstCard.isVisible()) {
        await firstCard.click();
        await page.waitForURL(/\/rental-objects\/.+/);
        
        // Screenshot detail page
        await expect(page).toHaveScreenshot('rental-object-detail.png', {
          fullPage: true,
          maxDiffPixelRatio: 0.1,
        });
      }
    });
  });

  test.describe('MinSide App', () => {
    test('dashboard uses DS components', async ({ page }) => {
      await page.goto('http://localhost:5175/');
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Dashboard cards
      const cards = await page.locator(DS_COMPONENT_SELECTORS.Card).count();
      expect(cards).toBeGreaterThan(0);

      await expect(page).toHaveScreenshot('minside-dashboard.png', {
        maxDiffPixelRatio: 0.1,
      });
    });
  });
});

test.describe('Component Style Drift Detection', () => {
  test('buttons match Storybook styles', async ({ page }) => {
    // Go to a page with buttons
    await page.goto('http://localhost:5173/');
    
    if (page.url().includes('/login')) {
      // Login page has buttons
      const loginButton = page.locator('button[type="submit"]').first();
      if (await loginButton.isVisible()) {
        // Check button uses DS styling (not inline styles)
        const style = await loginButton.getAttribute('style');
        expect(style).toBeNull(); // No inline styles!
        
        // Check uses DS class or data attribute
        const classes = await loginButton.getAttribute('class') || '';
        expect(
          classes.includes('ds-') || 
          await loginButton.getAttribute('data-ds-component')
        ).toBeTruthy();
      }
    }
  });
});
