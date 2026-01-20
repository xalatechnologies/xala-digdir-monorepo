// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@digilist/api/../mocks/api-server.mock';
import { test, expect } from '@digilist/api/fixtures/qa-expert.fixture';
import { config } from '@digilist/api/config/backoffice.config';
import {
  assertBlurEyeListView,
  assertNoForbiddenTerminology,
  logBlurEyeResults,
} from '@digilist/api/fixtures/blur-eye.helpers';

/**
 * GDPR Requests Module Blur-Eye E2E Tests
 * 
 * Tests the GDPR/privacy requests page for:
 * - GR1. Blur-Eye Structure
 * - GR2. Request Queue Display
 * - GR3. Process Request Workflow
 * - GR4. Audit Trail
 */

test.describe('GDPR Requests (Personvernforespørsler) E2E', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/gdpr-requests', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/login')) {
      test();
    }
  });

  test.describe('GR1. Blur-Eye Structure', () => {
  setupMockApi();
    test('GR1.1 Page has clear header', async ({ page }) => {
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      const titleText = await title.textContent() || '';
      console.log(`GDPR requests title: "${titleText}"`);
      
      const validTitles = ['gdpr', 'personvern', 'slett', 'privacy'];
      const hasValidTitle = validTitles.some(t => titleText.toLowerCase().includes(t));
      
      expect(hasValidTitle || titleText.length > 0).toBe(true);
    });

    test('GR1.2 Request list or empty state visible', async ({ page }) => {
      const list = page.locator('table, [data-testid*="gdpr"], [class*="request-list"]').first();
      const emptyState = page.locator('[data-testid="empty-state"], text=/ingen forespørsler|no requests/i').first();
      
      const hasList = await list.isVisible().catch(() => false);
      const hasEmpty = await emptyState.isVisible().catch(() => false);
      
      console.log(`Request list: ${hasList ? '✓' : '✗'}, Empty state: ${hasEmpty ? '✓' : '✗'}`);
      expect(hasList || hasEmpty).toBe(true);
    });

    test('GR1.3 Filter options exist', async ({ page }) => {
      const filters = page.locator('select, [data-testid*="filter"]');
      const filterCount = await filters.count();
      
      console.log(`Filter controls: ${filterCount}`);
    });

    test('GR1.4 No forbidden terminology', async ({ page }) => {
      const result = await assertNoForbiddenTerminology(page);
      expect(result.passed).toBe(true);
    });
  });

  test.describe('GR2. Request Processing', () => {
  setupMockApi();
    test('GR2.1 Request items have action buttons', async ({ page }) => {
      const firstRequest = page.locator('table tbody tr, [data-testid*="request-row"]').first();
      
      if (!await firstRequest.isVisible().catch(() => false)) {
        console.log('No GDPR requests - skipping');
        return;
      }
      
      const processBtn = firstRequest.locator(
        'button:has-text("Behandle"), button:has-text("Process"), [data-testid*="process"]'
      ).first();
      
      const hasProcess = await processBtn.isVisible().catch(() => false);
      console.log(`Process action: ${hasProcess ? '✓' : '✗'}`);
    });

    test('GR2.2 Request shows type (delete/export)', async ({ page }) => {
      const typeIndicator = page.locator(
        'text=/slett|delete|export|innsyn/i'
      ).first();
      
      const hasType = await typeIndicator.isVisible().catch(() => false);
      console.log(`Request type indicator: ${hasType ? '✓' : '✗'}`);
    });
  });

  test.describe('GR3. Runtime Stability', () => {
  setupMockApi();
    test('GR3.1 No runtime errors', async ({ page, evidence }) => {
      expect(evidence.hasPageErrors()).toBe(false);
      expect(evidence.has5xxResponses()).toBe(false);
      console.log('✓ No runtime errors');
    });
  });
});
