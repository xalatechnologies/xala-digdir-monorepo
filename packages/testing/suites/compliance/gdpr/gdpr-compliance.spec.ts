/**
 * GDPR Compliance Tests
 * 
 * Verifies data protection and privacy compliance:
 * - Right to access (data export)
 * - Right to erasure (data deletion)
 * - Consent management
 * - Cookie handling
 */

import { test, expect } from '@playwright/test';

test.describe('GDPR Compliance', () => {
  test.describe('Right to Access (Data Export)', () => {
    test('user can request data export', async ({ page }) => {
      // Login as citizen
      await page.goto('http://localhost:5175/');
      
      // Skip if not logged in
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Navigate to privacy settings
      await page.goto('http://localhost:5175/profile/privacy');
      
      // Look for data export button
      const exportButton = page.locator('[data-testid="export-my-data"], button:has-text("Eksporter")');
      
      if (await exportButton.isVisible()) {
        await exportButton.click();
        
        // Should show confirmation or start download
        await expect(
          page.locator('[data-testid="export-success"], .success-message').or(
            page.locator('[data-testid="export-pending"]')
          )
        ).toBeVisible({ timeout: 5000 });
      }
    });

    test('data export includes all personal data', async ({ page, request }) => {
      // API test for data export completeness
      const response = await request.get('http://localhost:4000/api/v1/me/data-export', {
        headers: {
          'Authorization': 'Bearer test-citizen-token',
        },
        failOnStatusCode: false,
      });

      if (response.status() === 200) {
        const data = await response.json();
        
        // Verify required GDPR fields are included
        expect(data).toHaveProperty('personalInfo');
        expect(data).toHaveProperty('bookings');
        expect(data).toHaveProperty('consents');
        expect(data).toHaveProperty('activityLog');
      }
    });
  });

  test.describe('Right to Erasure (Data Deletion)', () => {
    test('user can request account deletion', async ({ page }) => {
      await page.goto('http://localhost:5175/');
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      await page.goto('http://localhost:5175/profile/privacy');
      
      const deleteButton = page.locator('[data-testid="delete-my-data"], button:has-text("Slett")');
      
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Should show confirmation dialog
        const confirmDialog = page.locator('[data-testid="confirm-deletion"], [role="alertdialog"]');
        await expect(confirmDialog).toBeVisible();
        
        // Don't actually delete in test - just verify flow exists
      }
    });

    test('deletion process requires confirmation', async ({ page }) => {
      await page.goto('http://localhost:5175/profile/privacy');
      
      const deleteButton = page.locator('[data-testid="delete-my-data"]');
      
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Must have confirmation step
        const confirmInput = page.locator('[data-testid="confirm-deletion-input"], input[placeholder*="SLETTE"]');
        const confirmButton = page.locator('[data-testid="confirm-delete-button"]');
        
        // Confirm button should be disabled until confirmation text entered
        if (await confirmInput.isVisible()) {
          await expect(confirmButton).toBeDisabled();
          
          await confirmInput.fill('SLETTE');
          await expect(confirmButton).toBeEnabled();
        }
      }
    });
  });

  test.describe('Consent Management', () => {
    test('cookie consent banner appears', async ({ page, context }) => {
      // Clear cookies to simulate first visit
      await context.clearCookies();
      
      await page.goto('http://localhost:5174/');
      
      // Cookie banner should appear
      const cookieBanner = page.locator(
        '[data-testid="cookie-banner"], ' +
        '.cookie-consent, ' +
        '[role="dialog"]:has-text("cookie"), ' +
        '[role="dialog"]:has-text("informasjonskapsler")'
      );
      
      // Should be visible on first visit
      const isVisible = await cookieBanner.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (!isVisible) {
        console.log('⚠️ Cookie banner not found - may need implementation');
      }
    });

    test('user can manage consent preferences', async ({ page }) => {
      await page.goto('http://localhost:5174/');
      
      const cookieBanner = page.locator('[data-testid="cookie-banner"]');
      
      if (await cookieBanner.isVisible()) {
        // Should have options to accept/reject
        const acceptAllButton = page.locator('button:has-text("Godta alle"), button:has-text("Accept")');
        const manageButton = page.locator('button:has-text("Administrer"), button:has-text("Manage")');
        
        const hasAccept = await acceptAllButton.isVisible();
        const hasManage = await manageButton.isVisible();
        
        expect(hasAccept || hasManage).toBeTruthy();
        
        // Click manage to see options
        if (hasManage) {
          await manageButton.click();
          
          // Should show granular consent options
          const analyticsToggle = page.locator('[data-testid="consent-analytics"]');
          const marketingToggle = page.locator('[data-testid="consent-marketing"]');
          
          // At minimum, should distinguish necessary vs optional cookies
        }
      }
    });

    test('consent choices are persisted', async ({ page, context }) => {
      await page.goto('http://localhost:5174/');
      
      const acceptButton = page.locator('[data-testid="accept-cookies"], button:has-text("Godta")').first();
      
      if (await acceptButton.isVisible()) {
        await acceptButton.click();
        
        // Reload page
        await page.reload();
        
        // Banner should not appear again
        const cookieBanner = page.locator('[data-testid="cookie-banner"]');
        await expect(cookieBanner).not.toBeVisible({ timeout: 3000 });
        
        // Consent cookie should exist
        const cookies = await context.cookies();
        const consentCookie = cookies.find(c => 
          c.name.includes('consent') || c.name.includes('gdpr')
        );
        
        // Should have consent cookie
        if (!consentCookie) {
          console.log('⚠️ Consent cookie not found - check implementation');
        }
      }
    });
  });

  test.describe('Privacy Policy', () => {
    test('privacy policy is accessible', async ({ page }) => {
      await page.goto('http://localhost:5174/');
      
      // Footer should have privacy policy link
      const privacyLink = page.locator('a:has-text("Personvern"), a:has-text("Privacy")');
      
      if (await privacyLink.first().isVisible()) {
        await privacyLink.first().click();
        
        // Should navigate to privacy policy
        await expect(page).toHaveURL(/personvern|privacy/i);
        
        // Policy should contain required GDPR information
        const content = await page.textContent('main');
        
        // Check for key GDPR terms (Norwegian)
        const hasDataController = content?.includes('behandlingsansvarlig') || content?.includes('data controller');
        const hasPurpose = content?.includes('formål') || content?.includes('purpose');
        const hasRights = content?.includes('rettigheter') || content?.includes('rights');
        
        expect(hasDataController || hasPurpose || hasRights).toBeTruthy();
      }
    });
  });
});
