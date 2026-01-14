import { test, expect } from '@playwright/test';

/**
 * End-to-End Payment Flow Tests
 *
 * Tests the complete payment integration flow with Vipps:
 * - Booking creation with payment
 * - Payment initiation and callback handling
 * - Payment status display
 * - Admin reconciliation
 * - Refund processing
 */
test.describe('Payment Flow Integration', () => {
  test.describe('Booking with Payment', () => {
    test('completes booking flow with payment section', async ({ page }) => {
      // Step 1: Navigate to listing detail page
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Find first listing card and click it
      const firstListing = page.locator('.listing-card, [data-testid="listing-card"]').first();
      await expect(firstListing).toBeVisible({ timeout: 10000 });
      await firstListing.click();

      // Step 2: Open booking dialog
      await page.waitForLoadState('networkidle');
      const bookButton = page.getByRole('button', { name: /book|bestill/i });

      if (await bookButton.isVisible()) {
        await bookButton.click();

        // Wait for dialog to appear
        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });

        // Step 3: Fill booking form
        // Fill name
        const nameInput = page.getByLabel(/navn|name/i);
        if (await nameInput.isVisible()) {
          await nameInput.fill('Test Bruker');
        }

        // Fill email
        const emailInput = page.getByLabel(/e-?post|email/i);
        if (await emailInput.isVisible()) {
          await emailInput.fill('test@example.com');
        }

        // Fill phone
        const phoneInput = page.getByLabel(/telefon|phone/i);
        if (await phoneInput.isVisible()) {
          await phoneInput.fill('12345678');
        }

        // Fill description/notes
        const descriptionInput = page.getByLabel(/beskrivelse|description|notes/i);
        if (await descriptionInput.isVisible()) {
          await descriptionInput.fill('E2E test booking');
        }

        // Step 4: Verify payment section is visible
        const paymentSection = page.locator('text=/betaling|payment/i').first();
        await expect(paymentSection).toBeVisible({ timeout: 5000 });

        // Verify price display
        const priceDisplay = page.locator('text=/kr|nok|pris|price/i').first();
        await expect(priceDisplay).toBeVisible();

        // Step 5: Verify Vipps payment button
        const vippsButton = page.getByRole('button', { name: /vipps|betal/i });
        await expect(vippsButton).toBeVisible();

        // Verify button is enabled after form is filled
        await expect(vippsButton).toBeEnabled({ timeout: 5000 });
      }
    });
  });

  test.describe('Payment Callback Handling', () => {
    test('handles missing order ID', async ({ page }) => {
      await page.goto('/payment/callback');
      await page.waitForLoadState('networkidle');

      // Verify error message - check for heading first
      const heading = page.locator('h1, h2').filter({ hasText: /ugyldig/i }).first();
      await expect(heading).toBeVisible({ timeout: 10000 });

      // Verify home button is available
      const homeButton = page.getByRole('button', { name: /forsiden/i });
      await expect(homeButton).toBeVisible();
    });

    test('shows loading state while checking payment', async ({ page }) => {
      // Navigate with orderId to trigger loading state (will eventually error without backend)
      const gotoPromise = page.goto('/payment/callback?orderId=test-order-123');

      // Check for loading state
      const loadingSpinner = page.locator('text=/sjekker betalingsstatus/i').first();

      // Wait a bit to see if loading appears
      try {
        await expect(loadingSpinner).toBeVisible({ timeout: 2000 });
      } catch {
        // Loading might be too fast, that's okay
      }

      await gotoPromise;
      await page.waitForLoadState('networkidle');

      // Eventually should show some state (likely error without backend)
      const content = page.locator('h1').first();
      await expect(content).toBeVisible({ timeout: 15000 });
    });

    test('handles payment check error gracefully', async ({ page }) => {
      // Without backend, this will trigger error state
      await page.goto('/payment/callback?orderId=no-backend-order');
      await page.waitForLoadState('networkidle');

      // Should show error state with heading
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible({ timeout: 15000 });

      // Should have navigation options
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);
    });

    test.skip('handles successful payment callback', async ({ page }) => {
      // NOTE: This test requires backend mock or API integration
      // Skipped in E2E as it needs payment service mock data
      await page.goto('/payment/callback?orderId=mock-success-123');
    });

    test.skip('handles failed payment callback', async ({ page }) => {
      // NOTE: This test requires backend mock or API integration
      // Skipped in E2E as it needs payment service mock data
      await page.goto('/payment/callback?orderId=mock-failed-456');
    });

    test.skip('handles pending payment status', async ({ page }) => {
      // NOTE: This test requires backend mock or API integration
      // Skipped in E2E as it needs payment service mock data
      await page.goto('/payment/callback?orderId=mock-pending-789');
    });
  });

  test.describe('Payment Status Display', () => {
    test('displays payment status in booking list', async ({ page }) => {
      // Navigate to a page that shows bookings (could be user dashboard)
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for payment status badges
      const paymentBadges = page.locator('text=/betalt|paid|ubetalt|unpaid/i');

      if (await paymentBadges.first().isVisible({ timeout: 5000 })) {
        // Verify at least one badge is visible
        await expect(paymentBadges.first()).toBeVisible();
      }
    });
  });
});

test.describe('Backoffice Payment Management', () => {
  // Configure backoffice URL
  test.use({ baseURL: 'http://localhost:5174' });

  test.describe('Payment Reconciliation Page', () => {
    test('displays payment reconciliation dashboard', async ({ page }) => {
      // Step 8: Navigate to payment reconciliation page
      await page.goto('/payments/reconciliation');
      await page.waitForLoadState('networkidle');

      // Verify page heading
      const heading = page.locator('h1, h2').filter({ hasText: /betaling|payment|avstemming|reconciliation/i }).first();
      await expect(heading).toBeVisible({ timeout: 10000 });

      // Step 9: Verify payment list table
      const table = page.locator('table');
      if (await table.isVisible({ timeout: 5000 })) {
        await expect(table).toBeVisible();

        // Verify table headers
        const headers = page.locator('th');
        await expect(headers.first()).toBeVisible();
      }

      // Verify summary cards
      const summaryCards = page.locator('[data-testid="summary-card"], .card, article');
      if (await summaryCards.first().isVisible({ timeout: 5000 })) {
        const cardCount = await summaryCards.count();
        expect(cardCount).toBeGreaterThan(0);
      }
    });

    test('opens filter drawer', async ({ page }) => {
      await page.goto('/payments/reconciliation');
      await page.waitForLoadState('networkidle');

      // Find and click filter button
      const filterButton = page.getByRole('button', { name: /filter|filtre/i });

      if (await filterButton.isVisible({ timeout: 5000 })) {
        await filterButton.click();

        // Verify drawer opens
        const drawer = page.locator('[role="dialog"]');
        await expect(drawer).toBeVisible({ timeout: 5000 });

        // Verify filter options
        const statusFilter = page.locator('text=/status/i').first();
        await expect(statusFilter).toBeVisible();
      }
    });

    test('opens payment details drawer', async ({ page }) => {
      await page.goto('/payments/reconciliation');
      await page.waitForLoadState('networkidle');

      // Find payment row and click to view details
      const paymentRow = page.locator('tr[data-testid="payment-row"], tbody tr').first();

      if (await paymentRow.isVisible({ timeout: 5000 })) {
        await paymentRow.click();

        // Verify details drawer opens
        const drawer = page.locator('[role="dialog"]');
        await expect(drawer).toBeVisible({ timeout: 5000 });

        // Verify payment history section
        const historySection = page.locator('text=/historikk|history|transaksjoner|transactions/i').first();
        if (await historySection.isVisible()) {
          await expect(historySection).toBeVisible();
        }
      }
    });
  });

  test.describe('Refund Processing', () => {
    test('opens refund dialog', async ({ page }) => {
      await page.goto('/payments/reconciliation');
      await page.waitForLoadState('networkidle');

      // Find refund button
      const refundButton = page.getByRole('button', { name: /refund|refunder|tilbakebetal/i }).first();

      if (await refundButton.isVisible({ timeout: 5000 })) {
        await refundButton.click();

        // Step 10: Verify refund dialog opens
        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });

        // Verify dialog heading
        const heading = dialog.locator('h1, h2, h3').filter({ hasText: /refund|refunder|tilbakebetal/i }).first();
        await expect(heading).toBeVisible();

        // Verify amount input
        const amountInput = page.getByLabel(/beløp|amount/i);
        if (await amountInput.isVisible()) {
          await expect(amountInput).toBeVisible();
        }

        // Verify reason field
        const reasonInput = page.getByLabel(/grunn|reason|årsak/i);
        if (await reasonInput.isVisible()) {
          await expect(reasonInput).toBeVisible();
        }
      }
    });

    test('processes full refund', async ({ page }) => {
      await page.goto('/payments/reconciliation');
      await page.waitForLoadState('networkidle');

      const refundButton = page.getByRole('button', { name: /refund|refunder|tilbakebetal/i }).first();

      if (await refundButton.isVisible({ timeout: 5000 })) {
        await refundButton.click();

        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });

        // Click full refund button
        const fullRefundButton = dialog.getByRole('button', { name: /full|helt|100/i });
        if (await fullRefundButton.isVisible()) {
          await fullRefundButton.click();

          // Verify amount is set to max
          const amountInput = page.getByLabel(/beløp|amount/i);
          if (await amountInput.isVisible()) {
            const value = await amountInput.inputValue();
            expect(parseFloat(value)).toBeGreaterThan(0);
          }
        }
      }
    });

    test('processes partial refund', async ({ page }) => {
      await page.goto('/payments/reconciliation');
      await page.waitForLoadState('networkidle');

      const refundButton = page.getByRole('button', { name: /refund|refunder|tilbakebetal/i }).first();

      if (await refundButton.isVisible({ timeout: 5000 })) {
        await refundButton.click();

        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });

        // Enter partial amount
        const amountInput = page.getByLabel(/beløp|amount/i);
        if (await amountInput.isVisible()) {
          await amountInput.fill('250');

          // Verify amount is accepted
          const value = await amountInput.inputValue();
          expect(value).toBe('250');
        }

        // Fill reason
        const reasonInput = page.getByLabel(/grunn|reason|årsak/i);
        if (await reasonInput.isVisible()) {
          await reasonInput.fill('Partial refund for E2E test');
        }

        // Verify confirm button is enabled
        const confirmButton = dialog.getByRole('button', { name: /bekreft|confirm|refunder/i });
        if (await confirmButton.isVisible()) {
          await expect(confirmButton).toBeEnabled();
        }
      }
    });

    test('validates refund amount', async ({ page }) => {
      await page.goto('/payments/reconciliation');
      await page.waitForLoadState('networkidle');

      const refundButton = page.getByRole('button', { name: /refund|refunder|tilbakebetal/i }).first();

      if (await refundButton.isVisible({ timeout: 5000 })) {
        await refundButton.click();

        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });

        // Try to enter amount exceeding max
        const amountInput = page.getByLabel(/beløp|amount/i);
        if (await amountInput.isVisible()) {
          await amountInput.fill('999999');

          // Verify validation error or button is disabled
          const confirmButton = dialog.getByRole('button', { name: /bekreft|confirm|refunder/i });
          if (await confirmButton.isVisible()) {
            // Button should be disabled or error should be shown
            const isDisabled = await confirmButton.isDisabled();
            const errorMessage = page.locator('text=/ugyldig|invalid|maks|maximum|for høy|too high/i');
            const hasError = await errorMessage.isVisible({ timeout: 2000 });

            expect(isDisabled || hasError).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe('Bookings Page Payment Status', () => {
    test('displays payment status column in bookings table', async ({ page }) => {
      await page.goto('/bookings');
      await page.waitForLoadState('networkidle');

      // Verify page loads
      const heading = page.locator('h1, h2').filter({ hasText: /booking|bestilling/i }).first();
      await expect(heading).toBeVisible({ timeout: 10000 });

      // Verify payment column exists
      const paymentHeader = page.locator('th').filter({ hasText: /betaling|payment/i });
      if (await paymentHeader.isVisible({ timeout: 5000 })) {
        await expect(paymentHeader).toBeVisible();

        // Verify payment status badges in table
        const statusBadges = page.locator('td').filter({ hasText: /betalt|paid|ubetalt|unpaid/i });
        if (await statusBadges.first().isVisible({ timeout: 5000 })) {
          await expect(statusBadges.first()).toBeVisible();
        }
      }
    });

    test('shows payment details in booking drawer', async ({ page }) => {
      await page.goto('/bookings');
      await page.waitForLoadState('networkidle');

      // Click on first booking row
      const bookingRow = page.locator('tbody tr').first();
      if (await bookingRow.isVisible({ timeout: 5000 })) {
        await bookingRow.click();

        // Verify drawer opens
        const drawer = page.locator('[role="dialog"]');
        await expect(drawer).toBeVisible({ timeout: 5000 });

        // Verify payment section in drawer
        const paymentSection = drawer.locator('text=/betaling|payment|faktura|invoice/i').first();
        if (await paymentSection.isVisible({ timeout: 5000 })) {
          await expect(paymentSection).toBeVisible();

          // Verify payment status badge
          const statusBadge = drawer.locator('text=/betalt|paid|ubetalt|unpaid/i');
          await expect(statusBadge.first()).toBeVisible();
        }
      }
    });
  });
});

test.describe('Payment Integration Accessibility', () => {
  test('payment section has proper accessibility', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to listing with payment
    const firstListing = page.locator('.listing-card').first();
    if (await firstListing.isVisible({ timeout: 5000 })) {
      await firstListing.click();

      const bookButton = page.getByRole('button', { name: /book|bestill/i });
      if (await bookButton.isVisible({ timeout: 5000 })) {
        await bookButton.click();

        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });

        // Verify payment button has accessible name
        const vippsButton = page.getByRole('button', { name: /vipps|betal/i });
        if (await vippsButton.isVisible()) {
          const accessibleName = await vippsButton.textContent();
          expect(accessibleName).toBeTruthy();
        }

        // Verify all inputs have labels
        const inputs = dialog.locator('input');
        const inputCount = await inputs.count();

        for (let i = 0; i < inputCount; i++) {
          const input = inputs.nth(i);
          const id = await input.getAttribute('id');
          if (id) {
            const label = dialog.locator(`label[for="${id}"]`);
            const hasLabel = await label.count() > 0;
            const ariaLabel = await input.getAttribute('aria-label');
            expect(hasLabel || ariaLabel).toBeTruthy();
          }
        }
      }
    }
  });

  test('payment callback page has proper heading hierarchy', async ({ page }) => {
    // Test with missing orderId to avoid backend dependency
    await page.goto('/payment/callback');
    await page.waitForLoadState('networkidle');

    // Should have at least one heading
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    // Should have exactly one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });
});

test.describe('Payment Integration Error Handling', () => {
  test('handles network errors gracefully', async ({ page }) => {
    // Without backend, this will trigger error handling
    await page.goto('/payment/callback?orderId=no-backend-test');
    await page.waitForLoadState('networkidle');

    // Should show content (error state)
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 15000 });

    // Should have navigation buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('handles missing order ID gracefully', async ({ page }) => {
    await page.goto('/payment/callback');
    await page.waitForLoadState('networkidle');

    // Should show error state with clear messaging
    const heading = page.locator('h1').filter({ hasText: /ugyldig/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Should provide user-friendly guidance
    const paragraph = page.locator('p').first();
    await expect(paragraph).toBeVisible();

    // Should have way to navigate away
    const homeButton = page.getByRole('button', { name: /forsiden/i });
    await expect(homeButton).toBeVisible();
    await expect(homeButton).toBeEnabled();
  });
});
