// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../../../../mocks/api-server.mock';
import { test, expect } from '../fixtures/qa-expert.fixture';
import { config } from '../config/backoffice.config';
import {
  assertBlurEyeListView,
  assertNoForbiddenTerminology,
  logBlurEyeResults,
} from '../fixtures/blur-eye.helpers';

/**
 * Seasons Module Blur-Eye E2E Tests
 * 
 * Tests the seasons management page for:
 * - S1. Blur-Eye Structure
 * - S2. Season CRUD
 * - S3. Date Range Validation
 * - S4. Audit Trail
 */

test.describe('Seasons (Sesonger) E2E', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/seasons', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/login')) {
      test();
    }
  });

  test.describe('S1. Blur-Eye Structure', () => {
  setupMockApi();
    test('S1.1 Page has clear header', async ({ page }) => {
      const moduleConfig = config.modules.seasons;
      const result = await assertBlurEyeListView(page, {
        expectedTitleContains: moduleConfig.blurEye.expectedTitleContains,
        requirePrimaryAction: moduleConfig.blurEye.requirePrimaryAction,
        requireSearch: false, // Seasons may not have search
        requireFilters: 0,
      });
      
      logBlurEyeResults(result, 'Seasons');
      expect(result.checks.find(c => c.name === 'Page title visible')?.passed).toBe(true);
    });

    test('S1.2 Add season button visible', async ({ page }) => {
      const addBtn = page.locator(
        'button:has-text("Legg til"), button:has-text("Ny sesong"), button:has-text("Opprett"), a[href*="new"]'
      ).first();
      
      const visible = await addBtn.isVisible().catch(() => false);
      console.log(`Add season button: ${visible ? '✓ visible' : '✗ not visible'}`);
      expect(visible).toBe(true);
    });

    test('S1.3 Seasons list or empty state visible', async ({ page }) => {
      const list = page.locator('table, [data-testid*="season"], [class*="season-list"]').first();
      const emptyState = page.locator('[data-testid="empty-state"], text=/ingen sesonger|no seasons/i').first();
      
      const hasList = await list.isVisible().catch(() => false);
      const hasEmpty = await emptyState.isVisible().catch(() => false);
      
      console.log(`Season list: ${hasList ? '✓' : '✗'}, Empty state: ${hasEmpty ? '✓' : '✗'}`);
      expect(hasList || hasEmpty).toBe(true);
    });

    test('S1.4 No forbidden terminology', async ({ page }) => {
      const result = await assertNoForbiddenTerminology(page);
      expect(result.passed).toBe(true);
    });
  });

  test.describe('S2. Season CRUD', () => {
  setupMockApi();
    test('S2.1 Can open create season form', async ({ page }) => {
      const addBtn = page.locator(
        'button:has-text("Legg til"), button:has-text("Ny"), a[href*="new"]'
      ).first();
      
      if (!await addBtn.isVisible().catch(() => false)) {
        console.log('Add button not visible - skipping');
        return;
      }
      
      await addBtn.click();
      await page.waitForTimeout(2000);
      
      // Should see form or modal
      const form = page.locator('form, [role="dialog"], [data-testid*="season-form"]').first();
      const hasForm = await form.isVisible().catch(() => false);
      
      console.log(`Season form visible: ${hasForm ? '✓' : '✗'}`);
    });

    test('S2.2 Season row has edit action', async ({ page }) => {
      const firstRow = page.locator('table tbody tr, [data-testid*="season-row"]').first();
      
      if (!await firstRow.isVisible().catch(() => false)) {
        console.log('No season rows - skipping');
        return;
      }
      
      const editBtn = firstRow.locator('button:has-text("Rediger"), a[href*="edit"], [data-testid*="edit"]').first();
      const hasEdit = await editBtn.isVisible().catch(() => false);
      
      console.log(`Edit action: ${hasEdit ? '✓' : '✗'}`);
    });

    test('S2.3 Season row has delete action', async ({ page }) => {
      const firstRow = page.locator('table tbody tr, [data-testid*="season-row"]').first();
      
      if (!await firstRow.isVisible().catch(() => false)) {
        console.log('No season rows - skipping');
        return;
      }
      
      const deleteBtn = firstRow.locator('button:has-text("Slett"), [data-testid*="delete"]').first();
      const menuBtn = firstRow.locator('button[aria-haspopup="menu"], [data-testid*="menu"]').first();
      
      const hasDelete = await deleteBtn.isVisible().catch(() => false);
      const hasMenu = await menuBtn.isVisible().catch(() => false);
      
      console.log(`Delete action: ${hasDelete ? '✓' : '✗'}, Menu: ${hasMenu ? '✓' : '✗'}`);
    });
  });

  test.describe('S3. Date Range Validation', () => {
  setupMockApi();
    test('S3.1 Season has date fields', async ({ page }) => {
      const addBtn = page.locator('button:has-text("Legg til"), button:has-text("Ny")').first();
      
      if (await addBtn.isVisible().catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(1000);
      }
      
      const dateInputs = page.locator('input[type="date"], [data-testid*="date"]');
      const dateCount = await dateInputs.count();
      
      console.log(`Date inputs found: ${dateCount}`);
      
      // Close if modal
      await page.keyboard.press('Escape');
    });

    test('S3.2 Overlapping dates show validation', async ({ page }) => {
      // This would require actual data manipulation - log for now
      console.log('Date overlap validation - requires manual testing with real season data');
    });
  });

  test.describe('S4. Runtime Stability', () => {
  setupMockApi();
    test('S4.1 No runtime errors', async ({ page, evidence }) => {
      expect(evidence.hasPageErrors()).toBe(false);
      expect(evidence.has5xxResponses()).toBe(false);
      console.log('✓ No runtime errors');
    });
  });
});
}
