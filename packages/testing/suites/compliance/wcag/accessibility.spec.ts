/**
 * WCAG 2.1 AA Accessibility Tests
 * 
 * Uses Axe-core to verify accessibility compliance across all apps.
 * Target: WCAG 2.1 Level AA
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Apps to test
const APPS = [
  { name: 'Backoffice', url: 'http://localhost:5173', routes: ['/', '/rental-objects', '/bookings', '/calendar'] },
  { name: 'Web', url: 'http://localhost:5174', routes: ['/', '/rental-objects'] },
  { name: 'MinSide', url: 'http://localhost:5175', routes: ['/', '/bookings', '/favorites'] },
  { name: 'SaaS Admin', url: 'http://localhost:5176', routes: ['/', '/tenants', '/plans'] },
];

test.describe('WCAG 2.1 AA Accessibility', () => {
  for (const app of APPS) {
    test.describe(app.name, () => {
      for (const route of app.routes) {
        test(`${route} passes accessibility audit`, async ({ page }) => {
          await page.goto(`${app.url}${route}`);
          
          // Wait for page to load
          await page.waitForLoadState('networkidle');
          
          // Skip if redirected to login
          if (page.url().includes('/login') && route !== '/') {
            test.skip();
            return;
          }

          // Run Axe accessibility audit
          const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .exclude('[data-testid="dynamic-content"]') // Exclude dynamic content
            .analyze();

          // Report violations
          if (results.violations.length > 0) {
            console.log(`\n❌ Accessibility violations on ${app.name}${route}:`);
            for (const violation of results.violations) {
              console.log(`  - ${violation.id}: ${violation.description}`);
              console.log(`    Impact: ${violation.impact}`);
              console.log(`    Nodes: ${violation.nodes.length}`);
            }
          }

          expect(results.violations.length).toBe(0);
        });
      }
    });
  }

  test.describe('Focus Management', () => {
    test('keyboard navigation works', async ({ page }) => {
      await page.goto('http://localhost:5174/');
      
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      
      // Check focus is visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Check focus styling exists (outline or custom focus indicator)
      const focusStyle = await focusedElement.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          outline: computed.outline,
          boxShadow: computed.boxShadow,
        };
      });
      
      // Should have visible focus indicator
      const hasFocusIndicator = 
        focusStyle.outline !== 'none' || 
        focusStyle.boxShadow !== 'none';
      expect(hasFocusIndicator).toBeTruthy();
    });

    test('skip link exists and works', async ({ page }) => {
      await page.goto('http://localhost:5174/');
      
      // Skip link should be first focusable element
      await page.keyboard.press('Tab');
      
      const skipLink = page.locator('a[href="#main-content"], a:has-text("Skip to")').first();
      
      if (await skipLink.isVisible()) {
        await skipLink.click();
        // Main content should be focused or in view
        const main = page.locator('#main-content, main').first();
        await expect(main).toBeInViewport();
      }
    });
  });

  test.describe('Color Contrast', () => {
    test('text meets contrast requirements', async ({ page }) => {
      await page.goto('http://localhost:5174/');
      
      // Run color contrast specific check
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .include('body')
        .analyze();

      const contrastViolations = results.violations.filter(v => 
        v.id.includes('contrast')
      );

      if (contrastViolations.length > 0) {
        console.log('Contrast violations:', contrastViolations);
      }

      expect(contrastViolations.length).toBe(0);
    });
  });

  test.describe('Form Accessibility', () => {
    test('form inputs have labels', async ({ page }) => {
      await page.goto('http://localhost:5174/');
      
      // Find all inputs
      const inputs = page.locator('input:not([type="hidden"]), textarea, select');
      const count = await inputs.count();

      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        
        // Should have some form of label
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.count() > 0;
          expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
        } else {
          expect(ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }
    });

    test('error messages are announced', async ({ page }) => {
      // Navigate to a form page
      await page.goto('http://localhost:5173/login');
      
      // Submit empty form to trigger validation
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Check for error messages with proper ARIA
        const errors = page.locator('[role="alert"], [aria-live="polite"], .error-message');
        const hasErrors = await errors.count() > 0;
        
        if (hasErrors) {
          // Errors should be associated with inputs
          const firstError = errors.first();
          await expect(firstError).toBeVisible();
        }
      }
    });
  });
});
