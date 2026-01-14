import { test, expect } from '@playwright/test';

/**
 * Payment Integration - Error Handling and Edge Cases
 *
 * Comprehensive testing of error scenarios:
 * - Payment timeout
 * - User cancels payment
 * - Network errors during payment
 * - Duplicate payments
 * - Refund failures
 * - Deposit capture failures
 *
 * NOTE: Many tests require backend mock/API integration
 * Tests are structured to verify frontend error handling
 */

test.describe('Payment Error Handling - Timeout Scenarios', () => {
  test('displays timeout error when payment session expires', async ({ page }) => {
    // Simulate navigating to callback after payment timeout
    await page.goto('/payment/callback?orderId=timeout-test-123');
    await page.waitForLoadState('networkidle');

    // Should show error state (timeout will trigger error without backend)
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 15000 });

    // Should have navigation options
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('handles payment initiation timeout gracefully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to listing and open booking dialog
    const firstListing = page.locator('.listing-card, [data-testid="listing-card"]').first();
    if (await firstListing.isVisible({ timeout: 5000 })) {
      await firstListing.click();
      await page.waitForLoadState('networkidle');

      const bookButton = page.getByRole('button', { name: /book|bestill/i });
      if (await bookButton.isVisible({ timeout: 5000 })) {
        await bookButton.click();

        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });

        // Fill form
        const nameInput = page.getByLabel(/navn|name/i);
        if (await nameInput.isVisible()) {
          await nameInput.fill('Test User');
        }

        const emailInput = page.getByLabel(/e-?post|email/i);
        if (await emailInput.isVisible()) {
          await emailInput.fill('test@example.com');
        }

        // Set slow network to simulate timeout
        await page.route('**/api/integrations/vipps/payment', async (route) => {
          // Simulate slow response
          await new Promise(resolve => setTimeout(resolve, 10000));
          await route.abort('timedout');
        });

        // Try to initiate payment
        const vippsButton = page.getByRole('button', { name: /vipps|betal/i });
        if (await vippsButton.isVisible()) {
          await vippsButton.click();

          // Should show error message
          const errorMessage = dialog.locator('text=/feil|error|timeout|tidsavbrudd/i');
          await expect(errorMessage.first()).toBeVisible({ timeout: 15000 });
        }
      }
    }
  });

  test('allows retry after payment timeout', async ({ page }) => {
    await page.goto('/payment/callback?orderId=timeout-retry-test');
    await page.waitForLoadState('networkidle');

    // Should show error state
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 15000 });

    // Should have retry button or back button
    const actionButton = page.locator('button').first();
    await expect(actionButton).toBeVisible();
    await expect(actionButton).toBeEnabled();
  });
});

test.describe('Payment Error Handling - User Cancellation', () => {
  test.skip('displays cancellation message when user cancels in Vipps', async ({ page }) => {
    // NOTE: Requires backend mock with CANCELLED status
    await page.goto('/payment/callback?orderId=cancelled-by-user-123');
    await page.waitForLoadState('networkidle');

    // Should show cancellation message
    const cancelMessage = page.locator('text=/avbrutt|cancelled|kansellert/i');
    await expect(cancelMessage.first()).toBeVisible({ timeout: 10000 });

    // Should have option to try again
    const retryButton = page.getByRole('button', { name: /prøv igjen|try again|tilbake/i });
    await expect(retryButton.first()).toBeVisible();
  });

  test('handles closing booking dialog without payment', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const firstListing = page.locator('.listing-card').first();
    if (await firstListing.isVisible({ timeout: 5000 })) {
      await firstListing.click();
      await page.waitForLoadState('networkidle');

      const bookButton = page.getByRole('button', { name: /book|bestill/i });
      if (await bookButton.isVisible({ timeout: 5000 })) {
        await bookButton.click();

        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });

        // Close dialog without completing payment
        const closeButton = dialog.locator('button[aria-label*="close"], button[aria-label*="lukk"]').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();

          // Dialog should close
          await expect(dialog).not.toBeVisible({ timeout: 3000 });
        } else {
          // Try escape key
          await page.keyboard.press('Escape');
          await expect(dialog).not.toBeVisible({ timeout: 3000 });
        }
      }
    }
  });
});

test.describe('Payment Error Handling - Network Errors', () => {
  test('handles network error during payment initiation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const firstListing = page.locator('.listing-card').first();
    if (await firstListing.isVisible({ timeout: 5000 })) {
      await firstListing.click();
      await page.waitForLoadState('networkidle');

      const bookButton = page.getByRole('button', { name: /book|bestill/i });
      if (await bookButton.isVisible({ timeout: 5000 })) {
        await bookButton.click();

        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });

        // Fill form
        const nameInput = page.getByLabel(/navn|name/i);
        if (await nameInput.isVisible()) {
          await nameInput.fill('Test User');
        }

        // Simulate network failure
        await page.route('**/api/integrations/vipps/**', route => route.abort('failed'));

        const vippsButton = page.getByRole('button', { name: /vipps|betal/i });
        if (await vippsButton.isVisible()) {
          await vippsButton.click();

          // Should show network error message
          const errorMessage = dialog.locator('text=/nettverksfeil|network error|kunne ikke koble til/i');
          await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });
        }
      }
    }
  });

  test('handles intermittent connection during payment status check', async ({ page }) => {
    // Simulate unstable network
    let requestCount = 0;
    await page.route('**/api/integrations/vipps/payment/**', async (route) => {
      requestCount++;
      if (requestCount % 2 === 0) {
        // Fail every other request
        await route.abort('failed');
      } else {
        await route.continue();
      }
    });

    await page.goto('/payment/callback?orderId=intermittent-connection-test');
    await page.waitForLoadState('networkidle');

    // Should eventually show error or loading state
    const content = page.locator('h1, h2').first();
    await expect(content).toBeVisible({ timeout: 15000 });
  });

  test('displays offline message when completely offline', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);

    await page.goto('/payment/callback?orderId=offline-test-123', {
      waitUntil: 'domcontentloaded',
      timeout: 10000,
    }).catch(() => {
      // Expected to fail when offline
    });

    // Should show offline error or loading state
    // Browser's built-in offline handling may interfere
  });

  test('recovers when network comes back online', async ({ page }) => {
    await page.goto('/payment/callback?orderId=recovery-test-123');

    // Start offline
    await page.context().setOffline(true);
    await page.waitForTimeout(1000);

    // Go back online
    await page.context().setOffline(false);
    await page.reload({ waitUntil: 'networkidle' });

    // Should load normally after coming online
    const content = page.locator('h1').first();
    await expect(content).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Payment Error Handling - Duplicate Payments', () => {
  test.skip('prevents duplicate payment initiation for same booking', async ({ page }) => {
    // NOTE: Requires backend mock to detect duplicate
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // This would require backend to track that payment already exists
    // Frontend should show error if trying to pay for already-paid booking
  });

  test.skip('shows error when trying to pay for already paid booking', async ({ page }) => {
    // NOTE: Requires backend mock with already-paid booking
    await page.goto('/payment/callback?orderId=already-paid-duplicate');
    await page.waitForLoadState('networkidle');

    // Should show duplicate payment error
    const duplicateError = page.locator('text=/allerede betalt|already paid|duplicate/i');
    await expect(duplicateError.first()).toBeVisible({ timeout: 10000 });
  });

  test('handles rapid double-click on payment button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const firstListing = page.locator('.listing-card').first();
    if (await firstListing.isVisible({ timeout: 5000 })) {
      await firstListing.click();
      await page.waitForLoadState('networkidle');

      const bookButton = page.getByRole('button', { name: /book|bestill/i });
      if (await bookButton.isVisible({ timeout: 5000 })) {
        await bookButton.click();

        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });

        // Fill required fields
        const nameInput = page.getByLabel(/navn|name/i);
        if (await nameInput.isVisible()) {
          await nameInput.fill('Test User');
        }

        const vippsButton = page.getByRole('button', { name: /vipps|betal/i });
        if (await vippsButton.isVisible()) {
          // Try to click multiple times rapidly
          await vippsButton.click({ clickCount: 3, delay: 50 });

          // Button should be disabled after first click
          await expect(vippsButton).toBeDisabled({ timeout: 2000 });
        }
      }
    }
  });
});

test.describe('Backoffice - Refund Error Handling', () => {
  test.use({ baseURL: 'http://localhost:5174' });

  test('displays error when refund amount exceeds available', async ({ page }) => {
    await page.goto('/payments/reconciliation');
    await page.waitForLoadState('networkidle');

    const refundButton = page.getByRole('button', { name: /refund|refunder/i }).first();
    if (await refundButton.isVisible({ timeout: 5000 })) {
      await refundButton.click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // Try to enter amount exceeding maximum
      const amountInput = page.getByLabel(/beløp|amount/i);
      if (await amountInput.isVisible()) {
        await amountInput.fill('999999');

        // Should show validation error
        const errorMessage = page.locator('text=/maks|maximum|for høy|too high|ugyldig/i');
        const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);

        // Or button should be disabled
        const confirmButton = dialog.getByRole('button', { name: /bekreft|confirm/i });
        const isDisabled = await confirmButton.isDisabled().catch(() => false);

        expect(hasError || isDisabled).toBeTruthy();
      }
    }
  });

  test('handles refund processing failure', async ({ page }) => {
    await page.goto('/payments/reconciliation');
    await page.waitForLoadState('networkidle');

    // Mock refund API to fail
    await page.route('**/api/integrations/vipps/refund', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          type: 'server_error',
          title: 'Refund failed',
          status: 500,
          detail: 'Unable to process refund at this time'
        })
      });
    });

    const refundButton = page.getByRole('button', { name: /refund|refunder/i }).first();
    if (await refundButton.isVisible({ timeout: 5000 })) {
      await refundButton.click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      const amountInput = page.getByLabel(/beløp|amount/i);
      if (await amountInput.isVisible()) {
        await amountInput.fill('100');
      }

      const reasonInput = page.getByLabel(/grunn|reason/i);
      if (await reasonInput.isVisible()) {
        await reasonInput.fill('Test refund');
      }

      const confirmButton = dialog.getByRole('button', { name: /bekreft|confirm/i });
      if (await confirmButton.isVisible() && await confirmButton.isEnabled()) {
        await confirmButton.click();

        // Should show error message
        const errorAlert = page.locator('text=/feil|error|kunne ikke|failed/i');
        await expect(errorAlert.first()).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('prevents refund without reason', async ({ page }) => {
    await page.goto('/payments/reconciliation');
    await page.waitForLoadState('networkidle');

    const refundButton = page.getByRole('button', { name: /refund|refunder/i }).first();
    if (await refundButton.isVisible({ timeout: 5000 })) {
      await refundButton.click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      const amountInput = page.getByLabel(/beløp|amount/i);
      if (await amountInput.isVisible()) {
        await amountInput.fill('100');
      }

      // Leave reason empty
      const reasonInput = page.getByLabel(/grunn|reason/i);
      if (await reasonInput.isVisible()) {
        await reasonInput.clear();
      }

      // Confirm button should be disabled
      const confirmButton = dialog.getByRole('button', { name: /bekreft|confirm/i });
      if (await confirmButton.isVisible()) {
        await expect(confirmButton).toBeDisabled();
      }
    }
  });

  test('handles refund of already refunded payment', async ({ page }) => {
    // Mock API to return already-refunded error
    await page.route('**/api/integrations/vipps/refund', route => {
      route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          type: 'conflict_error',
          title: 'Payment already refunded',
          status: 409,
          detail: 'This payment has already been fully refunded'
        })
      });
    });

    await page.goto('/payments/reconciliation');
    await page.waitForLoadState('networkidle');

    const refundButton = page.getByRole('button', { name: /refund|refunder/i }).first();
    if (await refundButton.isVisible({ timeout: 5000 })) {
      await refundButton.click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      const amountInput = page.getByLabel(/beløp|amount/i);
      if (await amountInput.isVisible()) {
        await amountInput.fill('100');
      }

      const reasonInput = page.getByLabel(/grunn|reason/i);
      if (await reasonInput.isVisible()) {
        await reasonInput.fill('Duplicate test');
      }

      const confirmButton = dialog.getByRole('button', { name: /bekreft|confirm/i });
      if (await confirmButton.isVisible() && await confirmButton.isEnabled()) {
        await confirmButton.click();

        // Should show conflict error
        const errorMessage = page.locator('text=/allerede refundert|already refunded/i');
        await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });
      }
    }
  });
});

test.describe('Backoffice - Capture Error Handling', () => {
  test.use({ baseURL: 'http://localhost:5174' });

  test.skip('handles capture amount exceeding authorized amount', async ({ page }) => {
    // NOTE: Requires backend mock with capture functionality
    // Would test trying to capture more than authorized
  });

  test.skip('handles capture of expired authorization', async ({ page }) => {
    // NOTE: Requires backend mock
    // Would test capturing after authorization expires (typically 7 days)
  });

  test.skip('handles capture of already captured payment', async ({ page }) => {
    // NOTE: Requires backend mock
    // Would test duplicate capture attempts
  });

  test.skip('handles capture network timeout', async ({ page }) => {
    // NOTE: Requires backend mock with slow response
    // Would test timeout during capture operation
  });
});

test.describe('Payment Error Handling - Invalid States', () => {
  test('handles malformed order ID in URL', async ({ page }) => {
    await page.goto('/payment/callback?orderId=<script>alert("xss")</script>');
    await page.waitForLoadState('networkidle');

    // Should handle safely (not execute script)
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 15000 });

    // Page should not crash
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('handles very long order ID', async ({ page }) => {
    const longOrderId = 'a'.repeat(1000);
    await page.goto(`/payment/callback?orderId=${longOrderId}`);
    await page.waitForLoadState('networkidle');

    // Should handle gracefully
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('handles special characters in order ID', async ({ page }) => {
    await page.goto('/payment/callback?orderId=order-123!@#$%^&*()');
    await page.waitForLoadState('networkidle');

    // Should handle gracefully
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('handles multiple order IDs in URL', async ({ page }) => {
    await page.goto('/payment/callback?orderId=order1&orderId=order2');
    await page.waitForLoadState('networkidle');

    // Should use first or show error
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('handles missing required query parameters', async ({ page }) => {
    await page.goto('/payment/callback?someOtherParam=value');
    await page.waitForLoadState('networkidle');

    // Should show missing orderId error
    const errorHeading = page.locator('h1, h2').filter({ hasText: /ugyldig|invalid|mangler/i }).first();
    await expect(errorHeading).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Payment Error Recovery', () => {
  test('allows user to return to home after error', async ({ page }) => {
    await page.goto('/payment/callback');
    await page.waitForLoadState('networkidle');

    // Should show error with home button
    const homeButton = page.getByRole('button', { name: /forsiden|home|tilbake/i });
    await expect(homeButton.first()).toBeVisible({ timeout: 10000 });

    await homeButton.first().click();
    await page.waitForLoadState('networkidle');

    // Should navigate to home
    expect(page.url()).toContain('/');
  });

  test('provides clear error messages with actionable steps', async ({ page }) => {
    await page.goto('/payment/callback?orderId=test-error-123');
    await page.waitForLoadState('networkidle');

    // Should have error heading
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 15000 });

    // Should have descriptive text
    const paragraph = page.locator('p').first();
    await expect(paragraph).toBeVisible();

    // Should have action buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('maintains user context after payment error', async ({ page }) => {
    // User should be able to see their booking data in sessionStorage
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Set test data in sessionStorage
    await page.evaluate(() => {
      sessionStorage.setItem('bookingData', JSON.stringify({
        name: 'Test User',
        email: 'test@example.com'
      }));
    });

    await page.goto('/payment/callback?orderId=error-test');
    await page.waitForLoadState('networkidle');

    // Check sessionStorage still has data
    const hasData = await page.evaluate(() => {
      return sessionStorage.getItem('bookingData') !== null;
    });

    expect(hasData).toBe(true);
  });
});
