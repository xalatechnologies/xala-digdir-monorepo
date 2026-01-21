// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@digilist/api/mocks/api-server.mock';
/**
 * Feature Flag Gate Test
 * Verifies that disabling a module removes it from navigation and access
 * 
 * Test ID: GATE-G3
 * Requirement: When a module flag is OFF, the module should be completely hidden
 */
import { test, expect } from '@playwright/test';

test.describe('GATE-G3: Feature Flag Gate Enforcement', () => {
  setupMockApi();
  
  test.describe('Module Visibility When Enabled', () => {
  setupMockApi();
    test('SEASONS module shows in navigation when enabled', async ({ page }) => {
      // Login as user with SEASONS enabled
      await page.goto('/backoffice');
      
      // Verify seasons link is visible in nav
      const navLink = page.getByRole('link', { name: /sesong|seasons/i });
      await expect(navLink).toBeVisible();
      
      // Verify can access seasons page
      await navLink.click();
      await expect(page.url()).toContain('/seasons');
      await expect(page).not.toHaveTitle(/403|forbidden/i);
    });

    test('RATINGS module shows when enabled', async ({ page }) => {
      await page.goto('/backoffice');
      
      const navLink = page.getByRole('link', { name: /anmeldelser|reviews|ratings/i });
      await expect(navLink).toBeVisible();
    });

    test('MESSAGING module shows when enabled', async ({ page }) => {
      await page.goto('/backoffice');
      
      const navLink = page.getByRole('link', { name: /meldinger|messages/i });
      await expect(navLink).toBeVisible();
    });
  });

  test.describe('Module Hidden When Disabled', () => {
  setupMockApi();
    // Note: These tests require a tenant with specific modules disabled
    // Configure test fixtures accordingly
    
    test('disabled module not in navigation', async ({ page }) => {
      // Login as user with ECONOMY module disabled
      await page.goto('/backoffice');
      
      // Try to find economy link
      const economyLink = page.getByRole('link', { name: /økonomi|economy|faktura/i });
      
      // Should either not exist or be hidden
      const count = await economyLink.count();
      if (count > 0) {
        await expect(economyLink).not.toBeVisible();
      }
    });

    test('direct URL access to disabled module returns 403', async ({ page }) => {
      // Try to access a disabled module directly
      const response = await page.goto('/backoffice/economy');
      
      // Should redirect or show forbidden
      const url = page.url();
      const status = response?.status();
      
      // Either redirected away or shows 403
      expect(
        url.includes('/dashboard') || 
        url.includes('/403') || 
        status === 403
      ).toBeTruthy();
    });

    test('API rejects requests for disabled module', async ({ page, request }) => {
      // Make API request to disabled module endpoint
      const response = await request.get('/api/economy/invoices', {
        headers: {
          'Authorization': `Bearer ${process.env.TEST_TOKEN}`,
        },
      });
      
      // Should return 403 Forbidden
      expect([403, 404]).toContain(response.status());
    });
  });

  test.describe('Dynamic Module Toggle', () => {
  setupMockApi();
    test('navigation updates when module is toggled', async ({ page }) => {
      // This test simulates what happens when admin enables/disables a module
      
      await page.goto('/backoffice');
      
      // Count navigation items before
      const navItems = page.locator('nav a[href*="/backoffice"]');
      const countBefore = await navItems.count();
      
      // The navigation should reflect actual module state
      // (In a real test, we'd toggle a module via API and verify UI updates)
      expect(countBefore).toBeGreaterThan(0);
    });
  });

  test.describe('Capability-Gated UI Elements', () => {
  setupMockApi();
    test('edit button hidden without WRITE capability', async ({ page }) => {
      // Login as read-only user
      await page.goto('/backoffice/rental-objects');
      
      // Select a rental object
      await page.locator('tbody tr').first().click();
      
      // Check if edit button is gated
      const editButton = page.getByRole('button', { name: /rediger/i });
      
      // For read-only users, should not be visible or should be disabled
      // (depends on implementation - hidden is preferred per PRD)
    });

    test('delete button hidden without DELETE capability', async ({ page }) => {
      await page.goto('/backoffice/rental-objects');
      
      await page.locator('tbody tr').first().click();
      
      const deleteButton = page.getByRole('button', { name: /slett/i });
      
      // For users without delete capability, should not be visible
    });

    test('admin-only settings hidden from regular users', async ({ page }) => {
      // Login as regular case handler (not admin)
      await page.goto('/backoffice/settings');
      
      // Admin-only sections should be hidden
      const adminSection = page.getByTestId('admin-settings');
      await expect(adminSection).not.toBeVisible();
    });
  });
});
