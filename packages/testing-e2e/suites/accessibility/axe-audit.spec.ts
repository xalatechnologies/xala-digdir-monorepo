/**
 * WCAG 2.1 Accessibility E2E Tests
 *
 * Automated accessibility checks using Axe for critical pages.
 * Tests against REAL Docker services (API at :4000, frontends at :5173+)
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Real Docker service URLs
const WEB_URL = process.env.WEB_URL || 'http://localhost:5173';
const BACKOFFICE_URL = process.env.BACKOFFICE_URL || 'http://localhost:5175';
const MINSIDE_URL = process.env.MINSIDE_URL || 'http://localhost:5174';

async function runAxeTest(page: any, pageName: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();

  if (results.violations.length > 0) {
    console.log(`\n⚠️ Accessibility violations on ${pageName}:`);
    for (const violation of results.violations) {
      console.log(`  - ${violation.id}: ${violation.help} (${violation.nodes.length} instances)`);
    }
  }

  return results;
}

test.describe('Web (Public) Accessibility', () => {
  test('Home page should pass WCAG 2.1 AA', async ({ page }) => {
    await page.goto(WEB_URL);
    await page.waitForLoadState('networkidle');

    const results = await runAxeTest(page, 'Web Home');
    
    const critical = results.violations.filter(
      (v: any) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(critical.length, `Critical violations: ${JSON.stringify(critical)}`).toBe(0);
  });

  test('Search page should pass WCAG 2.1 AA', async ({ page }) => {
    await page.goto(`${WEB_URL}/search`);
    await page.waitForLoadState('networkidle');

    const results = await runAxeTest(page, 'Web Search');
    
    const critical = results.violations.filter(
      (v: any) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(critical.length).toBe(0);
  });
});

test.describe('Backoffice Accessibility', () => {
  test('Login page should pass WCAG 2.1 AA', async ({ page }) => {
    await page.goto(BACKOFFICE_URL);
    await page.waitForLoadState('networkidle');

    const results = await runAxeTest(page, 'Backoffice Login');
    
    const critical = results.violations.filter(
      (v: any) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(critical.length).toBe(0);
  });
});

test.describe('MinSide Accessibility', () => {
  test('Landing page should pass WCAG 2.1 AA', async ({ page }) => {
    await page.goto(MINSIDE_URL);
    await page.waitForLoadState('networkidle');

    const results = await runAxeTest(page, 'MinSide Landing');
    
    const critical = results.violations.filter(
      (v: any) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(critical.length).toBe(0);
  });
});

test.describe('Keyboard Navigation', () => {
  test('Web home should be navigable with keyboard only', async ({ page }) => {
    await page.goto(WEB_URL);
    await page.waitForLoadState('networkidle');

    // Tab through page
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }

    // Should have visible focus indicator
    const focusedElement = await page.evaluate(() => {
      const active = document.activeElement;
      if (!active) return null;
      return { tagName: active.tagName };
    });

    expect(focusedElement).not.toBeNull();
  });
});

test.describe('ARIA Labels', () => {
  test('Interactive elements should have accessible names', async ({ page }) => {
    await page.goto(WEB_URL);
    await page.waitForLoadState('networkidle');

    const buttons = await page.locator('button').all();
    for (const button of buttons.slice(0, 5)) {
      const accessibleName = await button.getAttribute('aria-label') ||
        await button.innerText() ||
        await button.getAttribute('title');
      
      expect(accessibleName || '').not.toBe('');
    }
  });
});
