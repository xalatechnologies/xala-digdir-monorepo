// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@digilist/api/mocks/api-server.mock';
/**
 * Review Moderation E2E Tests
 * Tests for review approval/rejection workflow
 * 
 * Test IDs from playwright.md:
 * - BO-BO8-01: Pending reviews queue
 * - BO-BO8-02: Approve review
 * - BO-BO8-03: Reject review with reason
 */
import { test, expect } from '@playwright/test';

test.describe('Review Moderation', () => {
  setupMockApi();
  test.beforeEach(async ({ page }) => {
    // Navigate to reviews moderation page
    await page.goto('/backoffice/reviews/moderation');
  });

  test('BO-BO8-01: should display pending reviews queue', async ({ page }) => {
    // Verify page header
    await expect(page.getByRole('heading', { name: /moderering/i })).toBeVisible();

    // Verify pending badge shows count
    await expect(page.getByTestId('pending-count')).toBeVisible();

    // Verify reviews list
    const reviewCards = page.locator('[data-testid="review-card"]');
    await expect(reviewCards).toHaveCount({ minimum: 0 });
  });

  test('BO-BO8-02: should approve review', async ({ page }) => {
    // Find first pending review
    const firstReview = page.locator('[data-testid="review-card"]').first();
    
    // Click approve button
    await firstReview.getByRole('button', { name: /godkjenn/i }).click();

    // Verify success feedback
    await expect(page.getByText(/anmeldelse godkjent/i)).toBeVisible();

    // Verify review removed from pending list
    await expect(firstReview).not.toBeVisible();
  });

  test('BO-BO8-03: should reject review with reason', async ({ page }) => {
    // Find first pending review
    const firstReview = page.locator('[data-testid="review-card"]').first();
    
    // Click reject button
    await firstReview.getByRole('button', { name: /avslå/i }).click();

    // Verify dialog appears for reason
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill in rejection reason
    await page.getByLabel(/begrunnelse/i).fill('Upassende innhold');

    // Confirm rejection
    await page.getByRole('button', { name: /bekreft avslag/i }).click();

    // Verify success feedback
    await expect(page.getByText(/anmeldelse avslått/i)).toBeVisible();
  });
});
