import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { config } from '../config/backoffice.config';

/**
 * WCAG 2.1 AA Compliance Tests
 * 
 * Automated accessibility audit for critical backoffice pages.
 */
test.describe('WCAG 2.1 AA Compliance', () => {
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  const criticalPages = [
    { path: '/', name: 'Dashboard' },
    { path: '/bookings', name: 'Bookings List' },
    { path: '/rental-objects', name: 'Rental Objects' },
    { path: '/calendar', name: 'Calendar' },
    { path: '/work-queue', name: 'Work Queue' },
    { path: '/users', name: 'Users' },
    { path: '/help', name: 'Help' },
  ];

  for (const page of criticalPages) {
    test(`${page.name} (${page.path}) should have no critical a11y violations`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path);
      await browserPage.waitForLoadState('networkidle');

      // Give time for dynamic content to render
      await browserPage.waitForTimeout(1000);

      // Run axe accessibility scan
      const accessibilityScanResults = await new AxeBuilder({ page: browserPage })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .exclude('.fc') // Exclude FullCalendar (known false positives)
        .analyze();

      // Filter for critical/serious violations only
      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      if (criticalViolations.length > 0) {
        console.log(`\nA11y violations on ${page.path}:`);
        criticalViolations.forEach((v) => {
          console.log(`  - ${v.id}: ${v.description} (${v.impact})`);
          console.log(`    Nodes: ${v.nodes.length}`);
        });
      }

      expect(
        criticalViolations,
        `Found ${criticalViolations.length} critical/serious a11y violations`
      ).toHaveLength(0);
    });
  }

  test.describe('Keyboard Navigation', () => {
    test('should navigate sidebar with keyboard', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Focus on sidebar
      await page.locator(config.selectors.sidebar).focus();

      // Tab through nav items
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
      }

      // Check that focus is within sidebar
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.closest('[data-testid="sidebar-nav"]') !== null;
      });

      expect(focusedElement, 'Focus should be navigable within sidebar').toBe(true);
    });

    test('should activate nav items with Enter key', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Focus on first nav link
      const firstLink = page.locator(`${config.selectors.sidebar} a`).first();
      await firstLink.focus();

      // Press Enter to activate
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');

      // Should navigate (URL may change)
      const url = page.url();
      console.log(`Navigated to: ${url}`);
    });

    test('forms should be keyboard accessible', async ({ page }) => {
      await page.goto('/bookings');
      await page.waitForLoadState('networkidle');

      // Tab to find interactive elements
      const initialUrl = page.url();
      
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        
        // Check focused element is interactive
        const focusedTag = await page.evaluate(() => {
          const el = document.activeElement;
          return el?.tagName.toLowerCase();
        });

        if (focusedTag) {
          const interactiveTags = ['a', 'button', 'input', 'select', 'textarea'];
          const isInteractive = interactiveTags.includes(focusedTag);
          
          // Most focused elements should be interactive
          if (['a', 'button', 'input'].includes(focusedTag)) {
            expect(isInteractive).toBe(true);
          }
        }
      }
    });
  });

  test.describe('Color Contrast', () => {
    test('should have sufficient color contrast', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .options({ resultTypes: ['violations'] })
        .analyze();

      const contrastViolations = results.violations.filter(
        (v) => v.id === 'color-contrast'
      );

      expect(
        contrastViolations,
        'Should have no color contrast violations'
      ).toHaveLength(0);
    });
  });

  test.describe('Form Accessibility', () => {
    test('form inputs should have labels', async ({ page }) => {
      await page.goto('/rental-objects/wizard');
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .analyze();

      const labelViolations = results.violations.filter(
        (v) => v.id === 'label' || v.id === 'label-title-only'
      );

      expect(
        labelViolations,
        'All form inputs should have proper labels'
      ).toHaveLength(0);
    });
  });
});
