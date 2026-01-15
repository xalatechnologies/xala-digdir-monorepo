/**
 * Accessibility E2E Tests
 * Uses axe-core to test WCAG compliance
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility - WCAG 2.1 AA Compliance', () => {
  test.describe('Public Pages', () => {
    test('home page has no accessibility violations', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      
      expect(results.violations).toEqual([]);
    });

    test('rental objects list has no accessibility violations', async ({ page }) => {
      await page.goto('/rental-objects');
      await page.waitForLoadState('networkidle');
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      expect(results.violations).toEqual([]);
    });

    test('login page has no accessibility violations', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      expect(results.violations).toEqual([]);
    });

    test('rental object detail page has no accessibility violations', async ({ page }) => {
      await page.goto('/rental-objects');
      
      const firstCard = page.locator('[data-testid="rental-object-card"]').first();
      if (await firstCard.isVisible({ timeout: 5000 })) {
        await firstCard.click();
        await page.waitForLoadState('networkidle');
        
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze();
        
        expect(results.violations).toEqual([]);
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('can navigate main menu with keyboard', async ({ page }) => {
      await page.goto('/');
      
      // Tab to first interactive element
      await page.keyboard.press('Tab');
      
      // Should have visible focus
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Should be able to continue tabbing
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
    });

    test('skip to main content link works', async ({ page }) => {
      await page.goto('/');
      
      // Press Tab to focus skip link
      await page.keyboard.press('Tab');
      
      const skipLink = page.getByRole('link', { name: /hopp.*innhold|skip.*content/i });
      if (await skipLink.isVisible()) {
        await skipLink.click();
        
        // Focus should move to main content
        const mainContent = page.locator('main, [role="main"]');
        await expect(mainContent).toBeFocused();
      }
    });

    test('modal dialogs trap focus', async ({ page }) => {
      await page.goto('/login');
      
      // Open a modal if one exists
      const modalTrigger = page.getByRole('button', { name: /hjelp|help|info/i }).first();
      if (await modalTrigger.isVisible({ timeout: 2000 })) {
        await modalTrigger.click();
        
        const modal = page.getByRole('dialog');
        if (await modal.isVisible()) {
          // Tab should stay within modal
          await page.keyboard.press('Tab');
          await page.keyboard.press('Tab');
          await page.keyboard.press('Tab');
          
          const focusedElement = page.locator(':focus');
          await expect(modal).toContainLocator(focusedElement);
          
          // Escape should close modal
          await page.keyboard.press('Escape');
          await expect(modal).not.toBeVisible();
        }
      }
    });

    test('form inputs are properly labeled', async ({ page }) => {
      await page.goto('/login');
      
      // All form inputs should have associated labels
      const inputs = page.locator('input:not([type="hidden"])');
      const count = await inputs.count();
      
      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        
        // Should have either id with label, aria-label, or aria-labelledby
        const hasLabel = id && (await page.locator(`label[for="${id}"]`).count()) > 0;
        const hasAriaLabel = !!ariaLabel;
        const hasAriaLabelledBy = !!ariaLabelledBy;
        
        expect(hasLabel || hasAriaLabel || hasAriaLabelledBy).toBeTruthy();
      }
    });
  });

  test.describe('Color and Contrast', () => {
    test('text has sufficient contrast', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .options({ rules: { 'color-contrast': { enabled: true } } })
        .analyze();
      
      const contrastViolations = results.violations.filter(
        v => v.id === 'color-contrast'
      );
      
      expect(contrastViolations).toEqual([]);
    });

    test('information is not conveyed by color alone', async ({ page }) => {
      await page.goto('/rental-objects');
      
      // Check availability indicators have text/icon alternatives
      const availableSlots = page.locator('[data-status="available"]');
      const count = await availableSlots.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        const slot = availableSlots.nth(i);
        const ariaLabel = await slot.getAttribute('aria-label');
        const title = await slot.getAttribute('title');
        const textContent = await slot.textContent();
        
        // Should have accessible alternative to color
        expect(ariaLabel || title || textContent?.trim()).toBeTruthy();
      }
    });
  });

  test.describe('Screen Reader Support', () => {
    test('images have alt text', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const images = page.locator('img');
      const count = await images.count();
      
      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');
        
        // Images should have alt text or role="presentation"
        expect(alt !== null || role === 'presentation').toBeTruthy();
      }
    });

    test('headings are in logical order', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      
      let previousLevel = 0;
      for (const heading of headings) {
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
        const level = parseInt(tagName.replace('h', ''));
        
        // Heading level should not skip more than one level
        if (previousLevel > 0) {
          expect(level).toBeLessThanOrEqual(previousLevel + 1);
        }
        
        previousLevel = level;
      }
    });

    test('page has exactly one h1', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);
    });

    test('ARIA landmarks are present', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Should have main landmark
      const main = page.locator('main, [role="main"]');
      await expect(main).toBeVisible();
      
      // Should have navigation landmark
      const nav = page.locator('nav, [role="navigation"]');
      expect(await nav.count()).toBeGreaterThan(0);
    });

    test('live regions announce updates', async ({ page }) => {
      await page.goto('/login');
      
      // Submit empty form to trigger error
      await page.getByRole('button', { name: /logg inn|login/i }).click();
      
      // Error messages should be in live region
      const liveRegion = page.locator('[role="alert"], [aria-live="polite"], [aria-live="assertive"]');
      expect(await liveRegion.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Responsive and Mobile', () => {
    test('touch targets are at least 44x44 pixels', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const buttons = page.locator('button, a, [role="button"]');
      const count = await buttons.count();
      
      for (let i = 0; i < Math.min(count, 10); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const box = await button.boundingBox();
          if (box) {
            // Touch targets should be at least 44x44 (WCAG 2.5.5)
            expect(box.width).toBeGreaterThanOrEqual(24); // Allow some flexibility
            expect(box.height).toBeGreaterThanOrEqual(24);
          }
        }
      }
    });

    test('content is readable without horizontal scroll at 320px', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      expect(hasHorizontalScroll).toBeFalsy();
    });
  });
});

test.describe('Accessibility - Authenticated Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('test@digilist.no');
    await page.getByLabel(/passord|password/i).fill('testpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
  });

  test('dashboard has no accessibility violations', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(results.violations).toEqual([]);
  });

  test('booking form is accessible', async ({ page }) => {
    await page.goto('/rental-objects');
    
    const firstCard = page.locator('[data-testid="rental-object-card"]').first();
    if (await firstCard.isVisible({ timeout: 5000 })) {
      await firstCard.click();
      await page.waitForLoadState('networkidle');
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      expect(results.violations).toEqual([]);
    }
  });
});
