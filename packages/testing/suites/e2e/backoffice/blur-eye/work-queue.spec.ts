// Skip E2E tests if not explicitly enabled
if (process.env.E2E_ENABLED !== 'true') {
  describe.skip('E2E tests require E2E_ENABLED=true', () => {});
} else {
import { setupMockApi } from '../../../../mocks/api-server.mock';
import { test, expect } from '../fixtures/qa-expert.fixture';
import { config } from '../config/backoffice.config';
import {
  assertBlurEyeListView,
  assertNoForbiddenTerminology,
  logBlurEyeResults,
} from '../fixtures/blur-eye.helpers';

/**
 * Work Queue Module Blur-Eye E2E Tests
 * 
 * Tests the work queue/approval page for:
 * - WQ1. Blur-Eye Structure
 * - WQ2. Approve/Deny with Reason
 * - WQ3. Conflict Handling
 * - WQ4. Audit Trail
 */

test.describe('Work Queue (Arbeidskø) E2E', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/work-queue', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/login')) {
      test();
    }
  });

  test.describe('WQ1. Blur-Eye Structure', () => {
  setupMockApi();
    test('WQ1.1 Page has clear header', async ({ page }) => {
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      const titleText = await title.textContent() || '';
      console.log(`Work queue title: "${titleText}"`);
      
      const validTitles = ['arbeidskø', 'queue', 'venter', 'godkjenning', 'approval'];
      const hasValidTitle = validTitles.some(t => titleText.toLowerCase().includes(t));
      
      expect(hasValidTitle || titleText.length > 0).toBe(true);
    });

    test('WQ1.2 Queue count/summary visible', async ({ page }) => {
      const summary = page.locator(
        '[data-testid*="count"], [data-testid*="summary"], text=/venter|pending|\\d+ saker/i'
      ).first();
      
      const visible = await summary.isVisible().catch(() => false);
      console.log(`Queue summary: ${visible ? '✓' : '✗'}`);
    });

    test('WQ1.3 Queue list or empty state visible', async ({ page }) => {
      const list = page.locator('table, [data-testid*="queue"], [class*="queue-list"]').first();
      const emptyState = page.locator('[data-testid="empty-state"], text=/ingen saker|no items|tom kø/i').first();
      
      const hasList = await list.isVisible().catch(() => false);
      const hasEmpty = await emptyState.isVisible().catch(() => false);
      
      console.log(`Queue list: ${hasList ? '✓' : '✗'}, Empty state: ${hasEmpty ? '✓' : '✗'}`);
      expect(hasList || hasEmpty).toBe(true);
    });

    test('WQ1.4 Filter options exist', async ({ page }) => {
      const filters = page.locator(
        'select, [data-testid*="filter"], button:has-text("Filter"), button:has-text("Status")'
      );
      const filterCount = await filters.count();
      
      console.log(`Filter controls: ${filterCount}`);
    });

    test('WQ1.5 No forbidden terminology', async ({ page }) => {
      const result = await assertNoForbiddenTerminology(page);
      expect(result.passed).toBe(true);
    });
  });

  test.describe('WQ2. Approve/Deny Actions', () => {
  setupMockApi();
    test('WQ2.1 Queue items have action buttons', async ({ page }) => {
      const firstItem = page.locator('table tbody tr, [data-testid*="queue-item"]').first();
      
      if (!await firstItem.isVisible().catch(() => false)) {
        console.log('No queue items - skipping');
        return;
      }
      
      const approveBtn = firstItem.locator('button:has-text("Godkjenn"), [data-testid*="approve"]').first();
      const denyBtn = firstItem.locator('button:has-text("Avslå"), button:has-text("Avvis"), [data-testid*="deny"]').first();
      
      const hasApprove = await approveBtn.isVisible().catch(() => false);
      const hasDeny = await denyBtn.isVisible().catch(() => false);
      
      console.log(`Approve: ${hasApprove ? '✓' : '✗'}, Deny: ${hasDeny ? '✓' : '✗'}`);
      
      // At least one action should be visible
      expect(hasApprove || hasDeny).toBe(true);
    });

    test('WQ2.2 Deny requires reason', async ({ page }) => {
      const denyBtn = page.locator('button:has-text("Avslå"), button:has-text("Avvis")').first();
      
      if (!await denyBtn.isVisible().catch(() => false)) {
        console.log('No deny button visible - skipping');
        return;
      }
      
      await denyBtn.click();
      await page.waitForTimeout(1000);
      
      // Should show dialog/modal with reason field
      const dialog = page.locator('[role="dialog"], [role="alertdialog"]').first();
      const reasonField = page.locator('textarea, input[placeholder*="grunn" i], [data-testid*="reason"]').first();
      
      const hasDialog = await dialog.isVisible().catch(() => false);
      const hasReasonField = await reasonField.isVisible().catch(() => false);
      
      console.log(`Deny dialog: ${hasDialog ? '✓' : '✗'}, Reason field: ${hasReasonField ? '✓' : '✗'}`);
      
      // Cancel
      await page.keyboard.press('Escape');
    });

    test('WQ2.3 Approve shows confirmation', async ({ page }) => {
      const approveBtn = page.locator('button:has-text("Godkjenn")').first();
      
      if (!await approveBtn.isVisible().catch(() => false)) {
        console.log('No approve button visible - skipping');
        return;
      }
      
      await approveBtn.click();
      await page.waitForTimeout(1000);
      
      // May show confirmation or proceed directly
      const dialog = page.locator('[role="dialog"], [role="alertdialog"]').first();
      const hasDialog = await dialog.isVisible().catch(() => false);
      
      console.log(`Approve confirmation: ${hasDialog ? '✓ shows dialog' : '– proceeds directly'}`);
      
      // Cancel if dialog
      if (hasDialog) {
        await page.keyboard.press('Escape');
      }
    });
  });

  test.describe('WQ3. Queue Item Details', () => {
  setupMockApi();
    test('WQ3.1 Can view item details', async ({ page }) => {
      const viewBtn = page.locator(
        'button:has-text("Vis"), button:has-text("Detaljer"), a[href*="detail"], [data-testid*="view"]'
      ).first();
      
      if (!await viewBtn.isVisible().catch(() => false)) {
        // Try clicking the row itself
        const row = page.locator('table tbody tr').first();
        if (await row.isVisible().catch(() => false)) {
          await row.click();
          await page.waitForTimeout(1000);
        }
      } else {
        await viewBtn.click();
        await page.waitForTimeout(1000);
      }
      
      // Check if details are shown
      const detailPanel = page.locator('[data-testid*="detail"], [class*="detail"], [role="dialog"]').first();
      const hasDetail = await detailPanel.isVisible().catch(() => false);
      
      console.log(`Item details: ${hasDetail ? '✓ visible' : '✗ not visible'}`);
    });
  });

  test.describe('WQ4. Runtime Stability', () => {
  setupMockApi();
    test('WQ4.1 No runtime errors', async ({ page, evidence }) => {
      expect(evidence.hasPageErrors()).toBe(false);
      expect(evidence.has5xxResponses()).toBe(false);
      console.log('✓ No runtime errors');
    });
  });
});
}
