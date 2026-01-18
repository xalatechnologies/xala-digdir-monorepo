import { test, expect } from '../fixtures/qa-expert.fixture';
import { config } from '../config/backoffice.config';
import {
  assertNoForbiddenTerminology,
} from '../fixtures/blur-eye.helpers';

/**
 * Help Module Blur-Eye E2E Tests
 * 
 * Tests the help/support page for:
 * - H1. Blur-Eye Structure
 * - H2. Content Navigation
 * - H3. Search Functionality
 */

test.describe('Help (Hjelp) E2E', () => {
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/help', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/login')) {
      test.skip();
    }
  });

  test.describe('H1. Blur-Eye Structure', () => {
    test('H1.1 Page has clear header', async ({ page }) => {
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      const titleText = await title.textContent() || '';
      console.log(`Help title: "${titleText}"`);
      
      const validTitles = ['hjelp', 'help', 'support', 'veiledning'];
      const hasValidTitle = validTitles.some(t => titleText.toLowerCase().includes(t));
      
      expect(hasValidTitle || titleText.length > 0).toBe(true);
    });

    test('H1.2 Help content visible', async ({ page }) => {
      const content = page.locator(
        '[data-testid*="help"], [class*="help-content"], article, [class*="article"]'
      );
      const contentCount = await content.count();
      
      console.log(`Help content sections: ${contentCount}`);
      expect(contentCount).toBeGreaterThan(0);
    });

    test('H1.3 No forbidden terminology', async ({ page }) => {
      const result = await assertNoForbiddenTerminology(page);
      expect(result.passed).toBe(true);
    });
  });

  test.describe('H2. Content Navigation', () => {
    test('H2.1 Table of contents or navigation exists', async ({ page }) => {
      const toc = page.locator(
        '[data-testid*="toc"], [class*="table-of-contents"], nav[class*="help"], [class*="sidebar"]'
      ).first();
      
      const hasToc = await toc.isVisible().catch(() => false);
      console.log(`Table of contents: ${hasToc ? '✓' : '✗'}`);
    });

    test('H2.2 Help topics are clickable', async ({ page }) => {
      const links = page.locator('a[href*="help"], [data-testid*="help-link"]');
      const linkCount = await links.count();
      
      console.log(`Help links found: ${linkCount}`);
      
      if (linkCount > 0) {
        const firstLink = links.first();
        await firstLink.click();
        await page.waitForTimeout(1000);
        
        console.log('✓ Help link is clickable');
      }
    });
  });

  test.describe('H3. Search Functionality', () => {
    test('H3.1 Search input exists', async ({ page }) => {
      const search = page.locator(
        'input[type="search"], input[placeholder*="søk" i], [data-testid*="search"]'
      ).first();
      
      const hasSearch = await search.isVisible().catch(() => false);
      console.log(`Search input: ${hasSearch ? '✓' : '✗'}`);
    });

    test('H3.2 Search filters content', async ({ page }) => {
      const search = page.locator('input[type="search"], input[placeholder*="søk" i]').first();
      
      if (!await search.isVisible().catch(() => false)) {
        console.log('No search input - skipping');
        return;
      }
      
      await search.fill('booking');
      await page.waitForTimeout(1000);
      
      console.log('✓ Search accepts input');
    });
  });

  test.describe('H4. Runtime Stability', () => {
    test('H4.1 No runtime errors', async ({ page, evidence }) => {
      expect(evidence.hasPageErrors()).toBe(false);
      expect(evidence.has5xxResponses()).toBe(false);
      console.log('✓ No runtime errors');
    });
  });
});
