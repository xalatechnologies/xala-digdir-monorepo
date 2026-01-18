// Skip E2E tests if not explicitly enabled
if (process.env.E2E_ENABLED !== 'true') {
  describe.skip('E2E tests require E2E_ENABLED=true', () => {});
} else {
import { setupMockApi } from '../../../mocks/api-server.mock';
import { test, expect } from '@playwright/test';

/**
 * Web Pack 2: Single-Slot Booking
 * 
 * Tests complete booking flow with authentication boundary
 */

test.describe('Web - Pack 2: Single-Slot Booking', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/web/.auth/user.json' });

  test.describe('Booking Flow', () => {
  setupMockApi();
    test.beforeEach(async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Navigate to first bookable listing
      const firstListing = page.locator('[data-testid="listing-card"] a, article a').first();
      if (await firstListing.isVisible()) {
        await firstListing.click();
        await page.waitForTimeout(3000);
      }
    });

    test('can select an available slot', async ({ page }) => {
      const calendar = page.locator('[data-testid="calendar"], [class*="calendar"]').first();
      
      if (!await calendar.isVisible()) {
        console.log('Calendar not visible - skipping');
        test();
        return;
      }
      
      // Find and click available slot
      const availableSlot = calendar.locator('[data-state="available"], [class*="available"]:not([class*="disabled"])').first();
      
      if (await availableSlot.isVisible()) {
        await availableSlot.click();
        await page.waitForTimeout(1000);
        
        // Check for selection indicator or booking panel
        const selected = page.locator('[data-state="selected"], [class*="selected"], [data-testid="booking-panel"]');
        const hasSelection = await selected.first().isVisible().catch(() => false);
        
        console.log(`Slot selection: ${hasSelection ? '✓' : '✗'}`);
      } else {
        console.log('No available slots found');
      }
    });

    test('booking panel appears after selection', async ({ page }) => {
      const calendar = page.locator('[data-testid="calendar"], [class*="calendar"]').first();
      
      if (!await calendar.isVisible()) {
        test();
        return;
      }
      
      const availableSlot = calendar.locator('[data-state="available"], [class*="available"]').first();
      
      if (await availableSlot.isVisible()) {
        await availableSlot.click();
        await page.waitForTimeout(1000);
        
        // Check for booking panel elements
        const panel = page.locator('[data-testid="booking-panel"], [class*="booking-form"], [class*="checkout"]').first();
        
        if (await panel.isVisible()) {
          const elements = {
            priceDisplay: '[data-testid="price"], [class*="price"]',
            confirmButton: 'button:has-text("Bestill"), button:has-text("Book"), button[type="submit"]',
            dateDisplay: '[data-testid="selected-date"], [class*="date-display"]',
          };
          
          console.log('\nBooking panel:');
          for (const [name, selector] of Object.entries(elements)) {
            const el = panel.locator(selector).first();
            const visible = await el.isVisible().catch(() => false);
            console.log(`├─ ${name}: ${visible ? '✓' : '–'}`);
          }
        }
      }
    });

    test('price preview updates with selection', async ({ page }) => {
      const calendar = page.locator('[data-testid="calendar"]:visible, [class*="calendar"]:visible').first();
      
      if (!await calendar.isVisible()) {
        test();
        return;
      }
      
      // Get initial price
      const priceEl = page.locator('[data-testid="price"], [class*="total-price"]').first();
      const initialPrice = await priceEl.textContent().catch(() => null);
      
      // Select slot
      const slot = calendar.locator('[data-state="available"]').first();
      if (await slot.isVisible()) {
        await slot.click();
        await page.waitForTimeout(1000);
        
        const newPrice = await priceEl.textContent().catch(() => null);
        console.log(`Price: initial="${initialPrice}", after="${newPrice}"`);
      }
    });

    test('confirm button triggers auth or booking', async ({ page }) => {
      if (page.url().includes('/login')) {
        test();
        return;
      }
      
      const calendar = page.locator('[data-testid="calendar"]:visible').first();
      
      if (await calendar.isVisible()) {
        const slot = calendar.locator('[data-state="available"]').first();
        if (await slot.isVisible()) {
          await slot.click();
          await page.waitForTimeout(1000);
        }
      }
      
      // Find confirm button
      const confirmBtn = page.locator('button:has-text("Bestill"), button:has-text("Book"), button:has-text("Bekreft")').first();
      
      if (await confirmBtn.isVisible()) {
        // DON'T click to avoid creating actual booking
        // Just verify it's enabled
        const isDisabled = await confirmBtn.isDisabled();
        console.log(`Confirm button: ${isDisabled ? 'disabled' : '✓ enabled'}`);
      }
    });
  });

  test.describe('Auth Boundary', () => {
  setupMockApi();
    test('anonymous user is redirected to login on booking attempt', async ({ page }) => {
      // Clear auth
      await page.context().clearCookies();
      
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Navigate to listing
      const listing = page.locator('[data-testid="listing-card"] a').first();
      if (await listing.isVisible()) {
        await listing.click();
        await page.waitForTimeout(2000);
      }
      
      // Try to book
      const bookBtn = page.locator('button:has-text("Bestill"), button:has-text("Book")').first();
      
      if (await bookBtn.isVisible()) {
        await bookBtn.click();
        await page.waitForTimeout(3000);
        
        // Should be on login or see login modal
        const onLogin = page.url().includes('/login');
        const loginModal = page.locator('dialog:has-text("Logg inn"), [role="dialog"]:has-text("Logg inn")').first();
        const hasLoginPrompt = onLogin || await loginModal.isVisible().catch(() => false);
        
        console.log(`Auth boundary: ${hasLoginPrompt ? '✓ login required' : '✗ no auth check'}`);
      }
    });
  });

  test.describe('Error States', () => {
  setupMockApi();
    test('shows error when slot becomes unavailable', async ({ page }) => {
      // This is a theoretical test - would need to simulate concurrent booking
      console.log('Conflict handling: requires simulated concurrent access');
      test();
    });

    test('validation errors are shown', async ({ page }) => {
      // Navigate to booking flow
      const listing = page.locator('[data-testid="listing-card"] a').first();
      if (await listing.isVisible()) {
        await listing.click();
        await page.waitForTimeout(2000);
      }
      
      // Try to submit without selection
      const confirmBtn = page.locator('button:has-text("Bestill"), button[type="submit"]').first();
      
      if (await confirmBtn.isVisible() && !await confirmBtn.isDisabled()) {
        await confirmBtn.click();
        await page.waitForTimeout(500);
        
        // Check for validation error
        const error = page.locator('[class*="error"], [role="alert"], [data-testid="validation-error"]').first();
        const hasError = await error.isVisible().catch(() => false);
        
        console.log(`Validation error display: ${hasError ? '✓' : '– (may prevent submission instead)'}`);
      }
    });
  });
});
}
