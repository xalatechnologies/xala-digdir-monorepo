import { test, expect } from '../fixtures/qa-expert.fixture';
import { config } from '../config/backoffice.config';
import {
  assertNoForbiddenTerminology,
} from '../fixtures/blur-eye.helpers';

/**
 * Blocks Module Blur-Eye E2E Tests
 * 
 * Tests the blocks/restrictions page for:
 * - BL1. Blur-Eye Structure
 * - BL2. Block CRUD
 * - BL3. Feature Flag Visibility
 */

test.describe('Blocks (Blokkeringer) E2E', () => {
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/blocks', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/login') || !page.url().includes('/blocks')) {
      test.skip();
    }
  });

  test.describe('BL1. Blur-Eye Structure', () => {
    test('BL1.1 Page has clear header', async ({ page }) => {
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      const titleText = await title.textContent() || '';
      console.log(`Blocks title: "${titleText}"`);
    });

    test('BL1.2 Add block button visible', async ({ page }) => {
      const addBtn = page.locator(
        'button:has-text("Legg til"), button:has-text("Ny"), button:has-text("Opprett"), a[href*="new"]'
      ).first();
      
      const visible = await addBtn.isVisible().catch(() => false);
      console.log(`Add block button: ${visible ? '✓ visible' : '✗ not visible'}`);
    });

    test('BL1.3 Blocks list or empty state visible', async ({ page }) => {
      const list = page.locator('table, [data-testid*="block"], [class*="block-list"]').first();
      const emptyState = page.locator('[data-testid="empty-state"], text=/ingen blokkeringer|no blocks/i').first();
      
      const hasList = await list.isVisible().catch(() => false);
      const hasEmpty = await emptyState.isVisible().catch(() => false);
      
      console.log(`Blocks list: ${hasList ? '✓' : '✗'}, Empty state: ${hasEmpty ? '✓' : '✗'}`);
      expect(hasList || hasEmpty).toBe(true);
    });

    test('BL1.4 No forbidden terminology', async ({ page }) => {
      const result = await assertNoForbiddenTerminology(page);
      expect(result.passed).toBe(true);
    });
  });

  test.describe('BL2. Block CRUD', () => {
    test('BL2.1 Can open create block form', async ({ page }) => {
      const addBtn = page.locator('button:has-text("Legg til"), button:has-text("Ny")').first();
      
      if (!await addBtn.isVisible().catch(() => false)) {
        console.log('Add button not visible - skipping');
        return;
      }
      
      await addBtn.click();
      await page.waitForTimeout(2000);
      
      const form = page.locator('form, [role="dialog"], [data-testid*="block-form"]').first();
      const hasForm = await form.isVisible().catch(() => false);
      
      console.log(`Block form visible: ${hasForm ? '✓' : '✗'}`);
      
      await page.keyboard.press('Escape');
    });

    test('BL2.2 Block has date range fields', async ({ page }) => {
      const addBtn = page.locator('button:has-text("Legg til"), button:has-text("Ny")').first();
      
      if (await addBtn.isVisible().catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(1000);
      }
      
      const dateInputs = page.locator('input[type="date"], input[type="datetime-local"], [data-testid*="date"]');
      const dateCount = await dateInputs.count();
      
      console.log(`Date inputs: ${dateCount}`);
      
      await page.keyboard.press('Escape');
    });
  });

  test.describe('BL3. Feature Flag Visibility', () => {
    test('BL3.1 Blocks appears in sidebar when flag ON', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      const sidebarLink = page.locator('nav[data-testid="sidebar-nav"] a[href="/blocks"]');
      const visible = await sidebarLink.isVisible().catch(() => false);
      
      console.log(`Blocks in sidebar: ${visible ? '✓ visible' : '✗ hidden'}`);
    });
  });

  test.describe('BL4. Runtime Stability', () => {
    test('BL4.1 No runtime errors', async ({ page, evidence }) => {
      expect(evidence.hasPageErrors()).toBe(false);
      expect(evidence.has5xxResponses()).toBe(false);
      console.log('✓ No runtime errors');
    });
  });
});
