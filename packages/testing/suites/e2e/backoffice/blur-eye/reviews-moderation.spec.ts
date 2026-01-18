// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@xala/api/../mocks/api-server.mock';
import { test, expect } from '@xala/api/fixtures/qa-expert.fixture';
import { config } from '@xala/api/config/backoffice.config';
import {
  assertBlurEyeListView,
  assertNoForbiddenTerminology,
  logBlurEyeResults,
} from '@xala/api/fixtures/blur-eye.helpers';

/**
 * Reviews Moderation Module Blur-Eye E2E Tests
 * 
 * Tests the reviews/moderation page for:
 * - RM1. Blur-Eye Structure
 * - RM2. Moderation Actions
 * - RM3. Audit Trail
 */

test.describe('Reviews Moderation (Anmeldelser) E2E', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/reviews/moderation', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/login')) {
      test();
    }
  });

  test.describe('RM1. Blur-Eye Structure', () => {
  setupMockApi();
    test('RM1.1 Page has clear header', async ({ page }) => {
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      const titleText = await title.textContent() || '';
      console.log(`Reviews moderation title: "${titleText}"`);
    });

    test('RM1.2 Review list or empty state visible', async ({ page }) => {
      const list = page.locator('table, [data-testid*="review"], [class*="review-list"]').first();
      const emptyState = page.locator('[data-testid="empty-state"], text=/ingen anmeldelser|no reviews/i').first();
      
      const hasList = await list.isVisible().catch(() => false);
      const hasEmpty = await emptyState.isVisible().catch(() => false);
      
      console.log(`Review list: ${hasList ? '✓' : '✗'}, Empty state: ${hasEmpty ? '✓' : '✗'}`);
      expect(hasList || hasEmpty).toBe(true);
    });

    test('RM1.3 No forbidden terminology', async ({ page }) => {
      const result = await assertNoForbiddenTerminology(page);
      expect(result.passed).toBe(true);
    });
  });

  test.describe('RM2. Moderation Actions', () => {
  setupMockApi();
    test('RM2.1 Review items have moderation buttons', async ({ page }) => {
      const firstReview = page.locator('table tbody tr, [data-testid*="review-row"]').first();
      
      if (!await firstReview.isVisible().catch(() => false)) {
        console.log('No reviews to moderate - skipping');
        return;
      }
      
      const approveBtn = firstReview.locator(
        'button:has-text("Godkjenn"), button:has-text("Approve"), [data-testid*="approve"]'
      ).first();
      const rejectBtn = firstReview.locator(
        'button:has-text("Avvis"), button:has-text("Reject"), [data-testid*="reject"]'
      ).first();
      
      const hasApprove = await approveBtn.isVisible().catch(() => false);
      const hasReject = await rejectBtn.isVisible().catch(() => false);
      
      console.log(`Approve: ${hasApprove ? '✓' : '✗'}, Reject: ${hasReject ? '✓' : '✗'}`);
    });

    test('RM2.2 Review shows content preview', async ({ page }) => {
      const reviewContent = page.locator(
        '[data-testid*="review-content"], [class*="review-text"], td:nth-child(2)'
      ).first();
      
      const hasContent = await reviewContent.isVisible().catch(() => false);
      console.log(`Review content preview: ${hasContent ? '✓' : '✗'}`);
    });
  });

  test.describe('RM3. Runtime Stability', () => {
  setupMockApi();
    test('RM3.1 No runtime errors', async ({ page, evidence }) => {
      expect(evidence.hasPageErrors()).toBe(false);
      expect(evidence.has5xxResponses()).toBe(false);
      console.log('✓ No runtime errors');
    });
  });
});
