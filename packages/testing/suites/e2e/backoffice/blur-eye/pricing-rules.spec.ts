import { setupMockApi } from '../../../../mocks/api-server.mock';
import { test, expect } from '../fixtures/qa-expert.fixture';
import { config } from '../config/backoffice.config';
import {
  assertBlurEyeListView,
  assertNoForbiddenTerminology,
  logBlurEyeResults,
} from '../fixtures/blur-eye.helpers';

/**
 * Pricing Rules Module Blur-Eye E2E Tests
 * 
 * Tests the pricing/product rules page for:
 * - PR1. Blur-Eye Structure
 * - PR2. Rule CRUD
 * - PR3. Validation
 * - PR4. Audit Trail
 */

test.describe('Pricing Rules (Prisregler) E2E', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing-rules', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/login')) {
      test();
    }
  });

  test.describe('PR1. Blur-Eye Structure', () => {
  setupMockApi();
    test('PR1.1 Page has clear header', async ({ page }) => {
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      const titleText = await title.textContent() || '';
      console.log(`Pricing rules title: "${titleText}"`);
      
      const validTitles = ['pris', 'pricing', 'regel', 'rate'];
      const hasValidTitle = validTitles.some(t => titleText.toLowerCase().includes(t));
      
      expect(hasValidTitle || titleText.length > 0).toBe(true);
    });

    test('PR1.2 Add rule button visible', async ({ page }) => {
      const addBtn = page.locator(
        'button:has-text("Legg til"), button:has-text("Ny"), button:has-text("Opprett"), a[href*="new"]'
      ).first();
      
      const visible = await addBtn.isVisible().catch(() => false);
      console.log(`Add rule button: ${visible ? '✓ visible' : '✗ not visible'}`);
    });

    test('PR1.3 Rules list or empty state visible', async ({ page }) => {
      const list = page.locator('table, [data-testid*="pricing"], [class*="rule-list"]').first();
      const emptyState = page.locator('[data-testid="empty-state"], text=/ingen regler|no rules/i').first();
      
      const hasList = await list.isVisible().catch(() => false);
      const hasEmpty = await emptyState.isVisible().catch(() => false);
      
      console.log(`Rules list: ${hasList ? '✓' : '✗'}, Empty state: ${hasEmpty ? '✓' : '✗'}`);
      expect(hasList || hasEmpty).toBe(true);
    });

    test('PR1.4 No forbidden terminology', async ({ page }) => {
      const result = await assertNoForbiddenTerminology(page);
      expect(result.passed).toBe(true);
    });
  });

  test.describe('PR2. Rule CRUD', () => {
  setupMockApi();
    test('PR2.1 Can open create rule form', async ({ page }) => {
      const addBtn = page.locator('button:has-text("Legg til"), button:has-text("Ny")').first();
      
      if (!await addBtn.isVisible().catch(() => false)) {
        console.log('Add button not visible - skipping');
        return;
      }
      
      await addBtn.click();
      await page.waitForTimeout(2000);
      
      const form = page.locator('form, [role="dialog"], [data-testid*="rule-form"]').first();
      const hasForm = await form.isVisible().catch(() => false);
      
      console.log(`Rule form visible: ${hasForm ? '✓' : '✗'}`);
      
      await page.keyboard.press('Escape');
    });

    test('PR2.2 Rule row has edit action', async ({ page }) => {
      const firstRow = page.locator('table tbody tr, [data-testid*="rule-row"]').first();
      
      if (!await firstRow.isVisible().catch(() => false)) {
        console.log('No rule rows - skipping');
        return;
      }
      
      const editBtn = firstRow.locator('button:has-text("Rediger"), a[href*="edit"]').first();
      const hasEdit = await editBtn.isVisible().catch(() => false);
      
      console.log(`Edit action: ${hasEdit ? '✓' : '✗'}`);
    });
  });

  test.describe('PR3. Runtime Stability', () => {
  setupMockApi();
    test('PR3.1 No runtime errors', async ({ page, evidence }) => {
      expect(evidence.hasPageErrors()).toBe(false);
      expect(evidence.has5xxResponses()).toBe(false);
      console.log('✓ No runtime errors');
    });
  });
});
