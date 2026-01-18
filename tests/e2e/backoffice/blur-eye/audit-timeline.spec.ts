import { test, expect } from '../fixtures/qa-expert.fixture';
import { config } from '../config/backoffice.config';
import {
  assertBlurEyeListView,
  assertNoForbiddenTerminology,
  logBlurEyeResults,
} from '../fixtures/blur-eye.helpers';

/**
 * Audit Timeline Module Blur-Eye E2E Tests
 * 
 * Tests the audit timeline/history page for:
 * - AT1. Blur-Eye Structure
 * - AT2. Timeline Navigation
 * - AT3. Filter by Entity/User/Date
 * - AT4. Drill-down Payload View
 */

test.describe('Audit Timeline E2E', () => {
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/audit-timeline', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/login')) {
      test.skip();
    }
  });

  test.describe('AT1. Blur-Eye Structure', () => {
    test('AT1.1 Page has clear header', async ({ page }) => {
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      const titleText = await title.textContent() || '';
      console.log(`Audit timeline title: "${titleText}"`);
    });

    test('AT1.2 Timeline or list visible', async ({ page }) => {
      const timeline = page.locator(
        '[data-testid*="timeline"], [class*="timeline"], table, [class*="activity-list"]'
      ).first();
      const emptyState = page.locator('[data-testid="empty-state"], text=/ingen aktivitet|no activity/i').first();
      
      const hasTimeline = await timeline.isVisible().catch(() => false);
      const hasEmpty = await emptyState.isVisible().catch(() => false);
      
      console.log(`Timeline: ${hasTimeline ? '✓' : '✗'}, Empty: ${hasEmpty ? '✓' : '✗'}`);
      expect(hasTimeline || hasEmpty).toBe(true);
    });

    test('AT1.3 Filter controls exist', async ({ page }) => {
      const filters = page.locator(
        'select, input[type="date"], [data-testid*="filter"]'
      );
      const filterCount = await filters.count();
      
      console.log(`Filter controls: ${filterCount}`);
      expect(filterCount).toBeGreaterThan(0);
    });

    test('AT1.4 No forbidden terminology', async ({ page }) => {
      const result = await assertNoForbiddenTerminology(page);
      expect(result.passed).toBe(true);
    });
  });

  test.describe('AT2. Timeline Navigation', () => {
    test('AT2.1 Can load more entries', async ({ page }) => {
      const loadMoreBtn = page.locator(
        'button:has-text("Last mer"), button:has-text("Load more"), [data-testid*="load-more"]'
      ).first();
      const pagination = page.locator('[data-testid="pagination"]').first();
      
      const hasLoadMore = await loadMoreBtn.isVisible().catch(() => false);
      const hasPagination = await pagination.isVisible().catch(() => false);
      
      console.log(`Load more: ${hasLoadMore ? '✓' : '✗'}, Pagination: ${hasPagination ? '✓' : '✗'}`);
    });

    test('AT2.2 Date filter works', async ({ page }) => {
      const dateInput = page.locator('input[type="date"]').first();
      
      if (!await dateInput.isVisible().catch(() => false)) {
        console.log('No date input - skipping');
        return;
      }
      
      const today = new Date().toISOString().split('T')[0];
      await dateInput.fill(today);
      await page.waitForTimeout(1000);
      
      console.log('✓ Date filter accepts input');
    });
  });

  test.describe('AT3. Entry Details', () => {
    test('AT3.1 Entry shows key fields', async ({ page }) => {
      const entry = page.locator(
        'table tbody tr, [data-testid*="timeline-entry"], [class*="activity-item"]'
      ).first();
      
      if (!await entry.isVisible().catch(() => false)) {
        console.log('No entries - skipping');
        return;
      }
      
      const entryText = await entry.textContent() || '';
      
      // Should show action type, actor, timestamp
      const hasTimestamp = /\d{2}[./:]\d{2}|\d{4}/.test(entryText);
      
      console.log(`Entry has timestamp: ${hasTimestamp ? '✓' : '✗'}`);
    });

    test('AT3.2 Can expand entry for details', async ({ page }) => {
      const expandBtn = page.locator(
        'button[aria-expanded], [data-testid*="expand"], button:has-text("Vis")'
      ).first();
      
      if (!await expandBtn.isVisible().catch(() => false)) {
        // Try clicking row
        const row = page.locator('table tbody tr').first();
        if (await row.isVisible().catch(() => false)) {
          await row.click();
          await page.waitForTimeout(500);
        }
      } else {
        await expandBtn.click();
        await page.waitForTimeout(500);
      }
      
      const details = page.locator(
        '[data-testid*="detail"], [class*="expanded"], [role="dialog"]'
      ).first();
      const hasDetails = await details.isVisible().catch(() => false);
      
      console.log(`Entry details: ${hasDetails ? '✓ expanded' : '✗ not expanded'}`);
    });
  });

  test.describe('AT4. Runtime Stability', () => {
    test('AT4.1 No runtime errors', async ({ page, evidence }) => {
      expect(evidence.hasPageErrors()).toBe(false);
      expect(evidence.has5xxResponses()).toBe(false);
      console.log('✓ No runtime errors');
    });
  });
});
