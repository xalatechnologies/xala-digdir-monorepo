// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@digilist/api/mocks/api-server.mock';
/**
 * No CRUD Modals Gate Test
 * Verifies that all create/edit operations use dedicated pages, not modals
 * 
 * Test ID: GATE-G2
 * PRD Principle: "No CRUD modals" - all data entry on dedicated pages
 */
import { test, expect } from '@playwright/test';

test.describe('GATE-G2: No CRUD Modals', () => {
  setupMockApi();
  
  test.describe('Backoffice', () => {
  setupMockApi();
    test('rental object creation uses dedicated page', async ({ page }) => {
      await page.goto('/backoffice/rental-objects');
      
      // Click create button
      await page.getByRole('button', { name: /ny|opprett|legg til/i }).click();
      
      // Verify we navigated to a new page (not a modal)
      await expect(page.url()).toContain('/rental-objects/new');
      
      // Verify no modal overlay exists
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
      
      // Verify page has proper form structure
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('rental object edit uses dedicated page', async ({ page }) => {
      await page.goto('/backoffice/rental-objects');
      
      // Click on first rental object
      await page.locator('tbody tr').first().click();
      
      // Click edit button
      await page.getByRole('button', { name: /rediger/i }).click();
      
      // Verify we navigated to edit page
      await expect(page.url()).toMatch(/\/rental-objects\/[^/]+\/edit/);
      
      // Verify no modal overlay
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('booking creation uses dedicated page', async ({ page }) => {
      await page.goto('/backoffice/bookings');
      
      await page.getByRole('button', { name: /ny|opprett/i }).click();
      
      // Verify navigation, not modal
      await expect(page.url()).toContain('/bookings/new');
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('organization creation uses dedicated page', async ({ page }) => {
      await page.goto('/backoffice/organizations');
      
      await page.getByRole('button', { name: /ny|opprett|legg til/i }).click();
      
      await expect(page.url()).toContain('/organizations/new');
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('template creation uses dedicated page', async ({ page }) => {
      await page.goto('/backoffice/templates');
      
      await page.getByRole('button', { name: /ny|opprett/i }).click();
      
      await expect(page.url()).toContain('/templates/new');
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });
  });

  test.describe('MinSide', () => {
  setupMockApi();
    test('organization creation uses dedicated page', async ({ page }) => {
      await page.goto('/minside/organizations');
      
      await page.getByRole('button', { name: /legg til|ny/i }).click();
      
      await expect(page.url()).toContain('/organizations/new');
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('booking creation uses dedicated flow', async ({ page }) => {
      // Navigate to a rental object
      await page.goto('/lokaler/test-object');
      
      await page.getByRole('button', { name: /book/i }).click();
      
      // Should navigate to booking flow, not open modal
      await expect(page.url()).toMatch(/\/(book|booking)/);
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });
  });

  test.describe('Allowed Modals (Exceptions)', () => {
  setupMockApi();
    test('confirmation dialogs ARE allowed', async ({ page }) => {
      await page.goto('/backoffice/rental-objects');
      
      // Select an item and try to delete
      await page.locator('tbody tr').first().click();
      await page.getByRole('button', { name: /slett/i }).click();
      
      // Confirmation dialog IS allowed
      const dialog = page.locator('[role="alertdialog"], [role="dialog"]');
      if (await dialog.isVisible()) {
        // This is acceptable - confirm/cancel dialogs are permitted
        await expect(dialog.getByRole('button', { name: /avbryt|nei/i })).toBeVisible();
      }
    });

    test('quick-view popovers ARE allowed', async ({ page }) => {
      await page.goto('/backoffice/calendar');
      
      // Click on a calendar event
      const event = page.locator('[data-testid="calendar-event"]').first();
      if (await event.isVisible()) {
        await event.click();
        
        // Quick view popover is allowed (just not full CRUD forms)
        // Should have "view details" link to full page
        await expect(page.getByRole('link', { name: /se detaljer|åpne/i })).toBeVisible();
      }
    });
  });
});
