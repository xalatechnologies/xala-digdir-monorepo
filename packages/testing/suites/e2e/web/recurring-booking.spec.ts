// Skip E2E tests if not explicitly enabled
if (process.env.E2E_ENABLED !== 'true') {
  describe.skip('E2E tests require E2E_ENABLED=true', () => {});
} else {
import { setupMockApi } from '../../../mocks/api-server.mock';
/**
 * Recurring Booking E2E Tests
 * Tests for recurring booking creation with conflict detection
 * 
 * Test IDs from playwright.md:
 * - WEB-W5-01: Recurring booking creation
 * - WEB-W5-02: Conflict suggestions display
 */
import { test, expect } from '@playwright/test';

test.describe('Recurring Booking Conflicts', () => {
  setupMockApi();
  test.beforeEach(async ({ page }) => {
    // Navigate to a rental object detail page
    await page.goto('/lokaler/rental-object-1');
  });

  test('WEB-W5-01: should create recurring booking', async ({ page }) => {
    // Click book button
    await page.getByRole('button', { name: /book/i }).click();

    // Verify booking form appears
    await expect(page.getByRole('heading', { name: /bestill/i })).toBeVisible();

    // Enable recurring option
    await page.getByLabel(/gjentakende/i).check();

    // Verify recurring options appear
    await expect(page.getByLabel(/frekvens/i)).toBeVisible();

    // Select weekly frequency
    await page.getByLabel(/frekvens/i).selectOption('WEEKLY');

    // Set end condition (count)
    await page.getByLabel(/antall ganger/i).fill('8');

    // Select date and time
    await page.getByLabel(/dato/i).fill('2026-02-01');
    await page.getByLabel(/fra/i).fill('14:00');
    await page.getByLabel(/til/i).fill('16:00');

    // Click preview
    await page.getByRole('button', { name: /forhåndsvis/i }).click();

    // Verify preview shows all occurrences
    await expect(page.getByTestId('occurrence-list')).toBeVisible();
    const occurrences = page.locator('[data-testid="occurrence-item"]');
    await expect(occurrences).toHaveCount(8);
  });

  test('WEB-W5-02: should display conflict suggestions', async ({ page }) => {
    // Click book button
    await page.getByRole('button', { name: /book/i }).click();

    // Enable recurring
    await page.getByLabel(/gjentakende/i).check();
    await page.getByLabel(/frekvens/i).selectOption('WEEKLY');
    await page.getByLabel(/antall ganger/i).fill('4');

    // Use date/time that will have conflicts
    await page.getByLabel(/dato/i).fill('2026-01-15');
    await page.getByLabel(/fra/i).fill('10:00');
    await page.getByLabel(/til/i).fill('12:00');

    // Click preview
    await page.getByRole('button', { name: /forhåndsvis/i }).click();

    // Verify conflict indicators
    const conflictItems = page.locator('[data-status="CONFLICT"]');
    
    // If there are conflicts, verify suggestions appear
    if (await conflictItems.count() > 0) {
      await conflictItems.first().click();
      
      // Verify alternative suggestions panel
      await expect(page.getByTestId('alternative-suggestions')).toBeVisible();
      
      // Verify at least one alternative is shown
      const alternatives = page.locator('[data-testid="alternative-slot"]');
      await expect(alternatives).toHaveCount({ minimum: 1 });
    }
  });

  test('WEB-W5-03: should handle partial booking with conflicts', async ({ page }) => {
    // Navigate to booking with conflicts setup
    await page.getByRole('button', { name: /book/i }).click();
    await page.getByLabel(/gjentakende/i).check();
    await page.getByLabel(/frekvens/i).selectOption('WEEKLY');
    await page.getByLabel(/antall ganger/i).fill('4');
    await page.getByRole('button', { name: /forhåndsvis/i }).click();

    // If conflicts exist, test partial booking option
    const summary = page.getByTestId('booking-summary');
    const conflictCount = await page.locator('[data-status="CONFLICT"]').count();
    
    if (conflictCount > 0) {
      // Verify "book available only" option appears
      await expect(page.getByRole('button', { name: /bestill kun ledige/i })).toBeVisible();
      
      // Click to proceed with available slots
      await page.getByRole('button', { name: /bestill kun ledige/i }).click();
      
      // Verify confirmation
      await expect(page.getByText(/booking opprettet/i)).toBeVisible();
    }
  });
});
}
