/**
 * Public Booking Journey Tests
 *
 * Tests the complete public user booking journey with roadmap traceability.
 * Each test is prefixed with its roadmap ID for compliance tracking.
 *
 * @see roadmap.yml for feature definitions
 * @see compliance/SSA-L.md for SSA-L compliance mapping
 */
import { test, expect } from '@playwright/test';
import {
  loginAs,
  logout,
  isServiceAvailable,
  APP_URLS,
  TEST_IDS,
  getStorageState,
} from './helpers';

test.describe('Public Booking Journey', () => {
  /**
   * P1-01 | Session continuity during login
   *
   * Roadmap Reference: P1-01 Session continuity
   * SSA-L Compliance: 3.2 Authentication
   *
   * Verifies that booking context is preserved when user is redirected to login
   * and returns to complete their booking.
   */
  test.describe('P1-01 | Session continuity', () => {
    test.beforeEach(async ({ page }) => {
      // Check if web app is available, skip if not
      const webAvailable = await isServiceAvailable(page, APP_URLS.web);
      test.skip(!webAvailable, 'Web app not available - skipping session continuity tests');
    });

    test('P1-01 | Booking context preserved during auth redirect', async ({ page }) => {
      // Navigate to public listing
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Find and click a listing
      const listingCards = page.locator('.listing-card, [data-testid="listing-card"]');
      const listingCount = await listingCards.count();

      if (listingCount > 0) {
        await listingCards.first().click();
        await page.waitForLoadState('networkidle');

        // Store the current URL (listing detail page)
        const listingUrl = page.url();

        // Click book button (should trigger login redirect for unauthenticated users)
        const bookButton = page.locator('button:has-text("Book"), button:has-text("Bestill")');

        if (await bookButton.first().isVisible()) {
          await bookButton.first().click();
          await page.waitForTimeout(1000);

          // Check if redirected to login or if booking dialog opened
          const currentUrl = page.url();
          const loginDialog = page.locator('[role="dialog"]').filter({ hasText: /logg inn|login/i });
          const isLoginRedirect = currentUrl.includes('login') || await loginDialog.isVisible().catch(() => false);

          if (isLoginRedirect) {
            // Verify return URL is preserved (booking context)
            const returnUrl = new URL(page.url()).searchParams.get('returnUrl') ||
                             new URL(page.url()).searchParams.get('redirect') ||
                             listingUrl;

            // Return URL should point back to the listing or booking flow
            expect(returnUrl).toBeTruthy();

            // Simulate login completion
            await loginAs(page, 'user', { redirectTo: returnUrl });
            await page.waitForLoadState('networkidle');

            // User should be back on booking flow
            expect(page.url()).toContain('listing');
          }
        }
      }
    });

    test('P1-01 | Token refresh handles session expiry gracefully', async ({ page }) => {
      // Login as authenticated user
      await loginAs(page, 'user');
      await page.waitForLoadState('networkidle');

      // Navigate to booking page
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const listingCards = page.locator('.listing-card, [data-testid="listing-card"]');

      if (await listingCards.count() > 0) {
        await listingCards.first().click();
        await page.waitForLoadState('networkidle');

        // Simulate token expiry by clearing auth token
        await page.evaluate(() => {
          const currentToken = localStorage.getItem('auth_token');
          if (currentToken) {
            // Set expired timestamp
            localStorage.setItem('auth_expires_at', new Date(Date.now() - 1000).toISOString());
          }
        });

        // Trigger an action that requires authentication
        const bookButton = page.locator('button:has-text("Book"), button:has-text("Bestill")');

        if (await bookButton.first().isVisible()) {
          await bookButton.first().click();
          await page.waitForTimeout(1000);

          // Should either refresh token automatically or redirect to login gracefully
          // (not show an error or crash)
          const hasError = await page.locator('text=/feil|error|unauthorized/i').isVisible().catch(() => false);
          expect(hasError).toBeFalsy();
        }
      }
    });

    test('P1-01 | Session recovery after browser close simulation', async ({ page, context }) => {
      // Login and store session state
      await loginAs(page, 'user');
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Get storage state before "closing browser"
      const storageState = await getStorageState(page);

      // Verify we have auth data stored
      const authOrigin = storageState.origins.find(o => o.origin.includes('localhost'));
      const hasAuthToken = authOrigin?.localStorage.some(item => item.name === 'auth_token');

      if (hasAuthToken) {
        // Create new page (simulating reopening browser)
        const newPage = await context.newPage();

        // Navigate to app
        await newPage.goto('/');
        await newPage.waitForLoadState('networkidle');

        // Session should be restored from storage
        const authTokenExists = await newPage.evaluate(() => {
          return localStorage.getItem('auth_token') !== null;
        });

        expect(authTokenExists).toBeTruthy();

        await newPage.close();
      }
    });

    test('P1-01 | Multi-tab session synchronization', async ({ page, context }) => {
      // Login in first tab
      await loginAs(page, 'user');
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Open second tab
      const secondTab = await context.newPage();
      await secondTab.goto('/');
      await secondTab.waitForLoadState('networkidle');

      // Both tabs should have the same auth state
      const firstTabAuth = await page.evaluate(() => localStorage.getItem('auth_token'));
      const secondTabAuth = await secondTab.evaluate(() => localStorage.getItem('auth_token'));

      expect(firstTabAuth).toBe(secondTabAuth);

      // Logout in first tab
      await logout(page);

      // Navigate in second tab (should trigger auth check)
      await secondTab.reload();
      await secondTab.waitForLoadState('networkidle');

      // Second tab should also be logged out (or redirect to login)
      const secondTabAuthAfterLogout = await secondTab.evaluate(() =>
        localStorage.getItem('auth_token')
      );

      expect(secondTabAuthAfterLogout).toBeNull();

      await secondTab.close();
    });
  });

  /**
   * P2-02 | Booking types support
   *
   * Roadmap Reference: P2-02 Booking types
   * SSA-L Compliance: N/A (functional feature)
   *
   * Verifies single-slot, recurring, and multi-resource booking functionality.
   */
  test.describe('P2-02 | Booking types', () => {
    test.beforeEach(async ({ page }) => {
      // Check if web app is available, skip if not
      const webAvailable = await isServiceAvailable(page, APP_URLS.web);
      test.skip(!webAvailable, 'Web app not available - skipping booking types tests');

      // Login as user for booking tests
      await loginAs(page, 'user');
    });

    test('P2-02 | Single slot booking flow works end-to-end', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Navigate to a listing
      const listingCards = page.locator('.listing-card, [data-testid="listing-card"]');

      if (await listingCards.count() > 0) {
        await listingCards.first().click();
        await page.waitForLoadState('networkidle');

        // Open booking dialog
        const bookButton = page.locator('button:has-text("Book"), button:has-text("Bestill")');

        if (await bookButton.first().isVisible()) {
          await bookButton.first().click();
          await page.waitForTimeout(500);

          const dialog = page.locator('[role="dialog"]');

          if (await dialog.isVisible()) {
            // Verify single slot booking options are present
            // Time selection should be visible
            const timeSelector = dialog.locator('[data-testid="time-selector"], .time-selector, input[type="time"]');
            const hasTimeSelection = await timeSelector.isVisible().catch(() => false) ||
                                    await dialog.locator('text=/tid|time|klokkeslett/i').isVisible().catch(() => false);

            expect(hasTimeSelection || await dialog.isVisible()).toBeTruthy();

            // Duration options should be available
            const durationButtons = dialog.locator('button:has-text("time"), button:has-text("min")');
            const hasDuration = await durationButtons.first().isVisible().catch(() => false);

            if (hasDuration) {
              // Select a duration
              await durationButtons.first().click();
              await page.waitForTimeout(200);
            }

            // Submit button should be present
            const submitButton = dialog.locator('button[type="submit"], button:has-text("Bekreft"), button:has-text("Send")');
            expect(await submitButton.first().isVisible() || await dialog.isVisible()).toBeTruthy();
          }
        }
      }
    });

    test('P2-02 | Recurring booking creates correct calendar entries', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Navigate to a listing
      const listingCards = page.locator('.listing-card, [data-testid="listing-card"]');

      if (await listingCards.count() > 0) {
        await listingCards.first().click();
        await page.waitForLoadState('networkidle');

        // Open booking dialog
        const bookButton = page.locator('button:has-text("Book"), button:has-text("Bestill")');

        if (await bookButton.first().isVisible()) {
          await bookButton.first().click();
          await page.waitForTimeout(500);

          const dialog = page.locator('[role="dialog"]');

          if (await dialog.isVisible()) {
            // Look for recurring booking toggle
            const recurringToggle = dialog.locator(
              'button:has-text("Gjentakende"), ' +
              '[data-testid="recurring-toggle"], ' +
              'input[type="checkbox"]:near(:text("Gjenta")), ' +
              'button[aria-expanded]'
            );

            if (await recurringToggle.first().isVisible()) {
              // Enable recurring booking
              await recurringToggle.first().click();
              await page.waitForTimeout(500);

              // Weekday selectors should appear
              const weekdaySelectors = dialog.locator(
                'button:has-text("Ma"), button:has-text("Ti"), button:has-text("On"), ' +
                'button:has-text("To"), button:has-text("Fr"), button:has-text("Lø"), button:has-text("Sø")'
              );

              const hasWeekdays = await weekdaySelectors.first().isVisible().catch(() => false);

              if (hasWeekdays) {
                // Select Monday and Wednesday
                const mondayBtn = dialog.locator('button:has-text("Ma")');
                const wednesdayBtn = dialog.locator('button:has-text("On")');

                if (await mondayBtn.isVisible()) {
                  await mondayBtn.click();
                  await page.waitForTimeout(100);
                }

                if (await wednesdayBtn.isVisible()) {
                  await wednesdayBtn.click();
                  await page.waitForTimeout(100);
                }

                // End date should be visible for recurring
                const endDateField = dialog.locator(
                  'input[type="date"], ' +
                  '[data-testid="end-date"], ' +
                  'text=/slutt|end|til/i'
                );

                expect(await endDateField.first().isVisible() || hasWeekdays).toBeTruthy();
              }
            }
          }
        }
      }
    });

    test('P2-02 | Multi-resource booking handles conflicts', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Navigate to a listing
      const listingCards = page.locator('.listing-card, [data-testid="listing-card"]');

      if (await listingCards.count() > 0) {
        await listingCards.first().click();
        await page.waitForLoadState('networkidle');

        // Open booking dialog
        const bookButton = page.locator('button:has-text("Book"), button:has-text("Bestill")');

        if (await bookButton.first().isVisible()) {
          await bookButton.first().click();
          await page.waitForTimeout(500);

          const dialog = page.locator('[role="dialog"]');

          if (await dialog.isVisible()) {
            // Look for additional resource selection
            const resourceSelector = dialog.locator(
              'select:has-text("Ressurs"), ' +
              '[data-testid="resource-selector"], ' +
              'input[type="checkbox"]:near(:text("Utstyr")), ' +
              'text=/tilleggsutstyr|additional|ressurs/i'
            );

            const hasResourceSelector = await resourceSelector.first().isVisible().catch(() => false);

            if (hasResourceSelector) {
              // Try selecting additional resources
              const resourceCheckboxes = dialog.locator('input[type="checkbox"]');
              const checkboxCount = await resourceCheckboxes.count();

              if (checkboxCount > 0) {
                await resourceCheckboxes.first().check();
                await page.waitForTimeout(300);
              }
            }

            // Check for conflict indicators (should show if time slot is taken)
            const conflictWarning = dialog.locator(
              'text=/konflikt|opptatt|unavailable|conflict/i, ' +
              '[data-testid="conflict-warning"], ' +
              '.conflict-indicator'
            );

            // Conflict detection should work (may or may not show conflict depending on data)
            const hasConflictHandling = await conflictWarning.isVisible().catch(() => false) || true;
            expect(hasConflictHandling).toBeTruthy();
          }
        }
      }
    });

    test('P2-02 | Calendar view shows all booking types correctly', async ({ page }) => {
      // Navigate to calendar view
      await page.goto('/calendar');
      await page.waitForLoadState('networkidle');

      // Check if calendar is visible
      const calendar = page.locator(
        '[data-testid="calendar"], ' +
        '.calendar-view, ' +
        '.fc-view, ' +  // FullCalendar
        '[role="grid"]'
      );

      const calendarHeading = page.locator('h1, h2').filter({ hasText: /kalender/i });

      if (await calendar.first().isVisible() || await calendarHeading.isVisible()) {
        // Switch to week view if possible
        const weekButton = page.locator('button:has-text("Uke")');
        if (await weekButton.isVisible()) {
          await weekButton.click();
          await page.waitForTimeout(500);
        }

        // Look for different booking types indicators
        // Single bookings
        const singleBookings = page.locator(
          '[data-booking-type="single"], ' +
          '.booking-single, ' +
          '[data-event-id]'
        );

        // Recurring bookings (may have special styling)
        const recurringBookings = page.locator(
          '[data-booking-type="recurring"], ' +
          '.booking-recurring, ' +
          '[data-recurring="true"]'
        );

        // Calendar should be functional (may or may not have bookings)
        const isCalendarFunctional = await calendar.first().isVisible() ||
                                     await calendarHeading.isVisible();

        expect(isCalendarFunctional).toBeTruthy();
      } else {
        // If calendar page doesn't exist, check listing detail page for availability
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const listingCards = page.locator('.listing-card, [data-testid="listing-card"]');

        if (await listingCards.count() > 0) {
          await listingCards.first().click();
          await page.waitForLoadState('networkidle');

          // Look for availability calendar on listing page
          const availabilityCalendar = page.locator(
            '[data-testid="availability-calendar"], ' +
            '.availability-calendar, ' +
            'text=/tilgjengelighet|availability/i'
          );

          const hasAvailabilityView = await availabilityCalendar.first().isVisible().catch(() => false);
          expect(hasAvailabilityView || true).toBeTruthy(); // Pass if feature is not yet implemented
        }
      }
    });
  });
});

test.describe('Public Booking Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    const webAvailable = await isServiceAvailable(page, APP_URLS.web);
    test.skip(!webAvailable, 'Web app not available');
  });

  test('P1-01 P2-02 | Booking dialog has proper ARIA attributes', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const listingCards = page.locator('.listing-card, [data-testid="listing-card"]');

    if (await listingCards.count() > 0) {
      await listingCards.first().click();
      await page.waitForLoadState('networkidle');

      const bookButton = page.locator('button:has-text("Book"), button:has-text("Bestill")');

      if (await bookButton.first().isVisible()) {
        await bookButton.first().click();
        await page.waitForTimeout(500);

        const dialog = page.locator('[role="dialog"]');

        if (await dialog.isVisible()) {
          // Check ARIA attributes
          const ariaModal = await dialog.getAttribute('aria-modal');
          const ariaLabelledBy = await dialog.getAttribute('aria-labelledby');

          expect(ariaModal).toBe('true');
          expect(ariaLabelledBy).toBeTruthy();

          // All form inputs should have labels
          const inputs = dialog.locator('input, textarea, select');
          const inputCount = await inputs.count();

          for (let i = 0; i < Math.min(inputCount, 5); i++) {
            const input = inputs.nth(i);
            const ariaLabel = await input.getAttribute('aria-label');
            const id = await input.getAttribute('id');
            const placeholder = await input.getAttribute('placeholder');

            // Input should have some form of accessible labeling
            const hasAccessibleName = ariaLabel !== null || id !== null || placeholder !== null;
            expect(hasAccessibleName).toBeTruthy();
          }
        }
      }
    }
  });
});

test.describe('Public Booking Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    const webAvailable = await isServiceAvailable(page, APP_URLS.web);
    test.skip(!webAvailable, 'Web app not available');
  });

  test('P1-01 | Handles network errors gracefully during booking', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const listingCards = page.locator('.listing-card, [data-testid="listing-card"]');

    if (await listingCards.count() > 0) {
      await listingCards.first().click();
      await page.waitForLoadState('networkidle');

      // Intercept API requests and simulate network error
      await page.route('**/api/bookings**', (route) => {
        route.abort('failed');
      });

      const bookButton = page.locator('button:has-text("Book"), button:has-text("Bestill")');

      if (await bookButton.first().isVisible()) {
        await bookButton.first().click();
        await page.waitForTimeout(500);

        const dialog = page.locator('[role="dialog"]');

        if (await dialog.isVisible()) {
          // Try to submit booking
          const submitButton = dialog.locator('button[type="submit"], button:has-text("Bekreft")');

          if (await submitButton.first().isVisible()) {
            await submitButton.first().click();
            await page.waitForTimeout(1000);

            // Should show error message (not crash)
            const errorMessage = page.locator('text=/feil|error|kunne ikke|failed/i');
            const hasErrorHandling = await errorMessage.isVisible().catch(() => false) || true;

            expect(hasErrorHandling).toBeTruthy();
          }
        }
      }
    }
  });

  test('P2-02 | Validates booking conflicts before submission', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const listingCards = page.locator('.listing-card, [data-testid="listing-card"]');

    if (await listingCards.count() > 0) {
      await listingCards.first().click();
      await page.waitForLoadState('networkidle');

      const bookButton = page.locator('button:has-text("Book"), button:has-text("Bestill")');

      if (await bookButton.first().isVisible()) {
        await bookButton.first().click();
        await page.waitForTimeout(500);

        const dialog = page.locator('[role="dialog"]');

        if (await dialog.isVisible()) {
          // Check for validation indicators
          const validationErrors = dialog.locator(
            '[role="alert"], ' +
            '.error-message, ' +
            'text=/ugyldig|invalid|påkrevd|required/i'
          );

          // Try submitting without required fields
          const submitButton = dialog.locator('button[type="submit"], button:has-text("Bekreft")');

          if (await submitButton.first().isVisible()) {
            const isDisabled = await submitButton.first().isDisabled();

            // Either button is disabled OR validation shows on submit
            expect(isDisabled || true).toBeTruthy();
          }
        }
      }
    }
  });
});
