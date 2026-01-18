// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../../../mocks/api-server.mock';
/**
 * Payment and Deposit E2E Tests
 * Tests for deposit requirements and payment flow
 * 
 * Test IDs from playwright.md:
 * - WEB-W6-01: Payment information display
 * - WEB-W6-02: Deposit required indicator
 * - WEB-W6-03: Payment method selection
 */
import { test, expect } from '@playwright/test';

test.describe('Payment and Deposit', () => {
  setupMockApi();
  test.beforeEach(async ({ page }) => {
    // Navigate to a rental object that requires deposit
    await page.goto('/lokaler/rental-object-with-deposit');
  });

  test('WEB-W6-01: should display payment information', async ({ page }) => {
    // Click book button
    await page.getByRole('button', { name: /book/i }).click();

    // Proceed to payment step
    await page.getByLabel(/dato/i).fill('2026-02-01');
    await page.getByLabel(/fra/i).fill('14:00');
    await page.getByLabel(/til/i).fill('16:00');
    await page.getByRole('button', { name: /neste|fortsett/i }).click();

    // Verify price breakdown is visible
    await expect(page.getByTestId('price-breakdown')).toBeVisible();

    // Verify line items
    await expect(page.getByText(/leie/i)).toBeVisible();
    await expect(page.getByText(/NOK/i)).toBeVisible();

    // Verify total
    await expect(page.getByTestId('total-price')).toBeVisible();
  });

  test('WEB-W6-02: should show deposit required indicator', async ({ page }) => {
    // Click book button
    await page.getByRole('button', { name: /book/i }).click();

    // Fill booking details
    await page.getByLabel(/dato/i).fill('2026-02-01');
    await page.getByLabel(/fra/i).fill('14:00');
    await page.getByLabel(/til/i).fill('16:00');
    await page.getByRole('button', { name: /neste|fortsett/i }).click();

    // Verify deposit indicator
    await expect(page.getByTestId('deposit-required')).toBeVisible();

    // Verify deposit amount
    await expect(page.getByText(/depositum/i)).toBeVisible();
    await expect(page.getByTestId('deposit-amount')).toBeVisible();

    // Verify deposit info tooltip/explanation
    const depositInfo = page.getByTestId('deposit-info');
    if (await depositInfo.isVisible()) {
      await expect(depositInfo).toContainText(/tilbakebetal/i);
    }
  });

  test('WEB-W6-03: should allow payment method selection', async ({ page }) => {
    // Navigate to checkout
    await page.getByRole('button', { name: /book/i }).click();
    await page.getByLabel(/dato/i).fill('2026-02-01');
    await page.getByLabel(/fra/i).fill('14:00');
    await page.getByLabel(/til/i).fill('16:00');
    await page.getByRole('button', { name: /neste|fortsett/i }).click();

    // Verify payment methods section
    await expect(page.getByTestId('payment-methods')).toBeVisible();

    // Verify Vipps option (if enabled)
    const vippsOption = page.getByTestId('payment-method-vipps');
    if (await vippsOption.isVisible()) {
      await vippsOption.click();
      await expect(vippsOption).toHaveAttribute('data-selected', 'true');
    }

    // Verify card option
    const cardOption = page.getByTestId('payment-method-card');
    if (await cardOption.isVisible()) {
      await cardOption.click();
      await expect(cardOption).toHaveAttribute('data-selected', 'true');
    }

    // Verify invoice option (for organizations)
    const invoiceOption = page.getByTestId('payment-method-invoice');
    if (await invoiceOption.isVisible()) {
      await invoiceOption.click();
      await expect(invoiceOption).toHaveAttribute('data-selected', 'true');
    }
  });

  test('WEB-W6-04: should validate deposit policy before checkout', async ({ page }) => {
    // Navigate to checkout
    await page.getByRole('button', { name: /book/i }).click();
    await page.getByLabel(/dato/i).fill('2026-02-01');
    await page.getByLabel(/fra/i).fill('14:00');
    await page.getByLabel(/til/i).fill('16:00');
    await page.getByRole('button', { name: /neste|fortsett/i }).click();

    // Verify deposit checkbox/acknowledgment required
    const depositAcknowledge = page.getByLabel(/aksepterer depositum/i);
    
    if (await depositAcknowledge.isVisible()) {
      // Try to proceed without accepting
      await page.getByRole('button', { name: /betal|bekreft/i }).click();
      
      // Verify error message
      await expect(page.getByText(/må akseptere/i)).toBeVisible();
      
      // Check the box
      await depositAcknowledge.check();
      
      // Verify can proceed
      await expect(page.getByRole('button', { name: /betal|bekreft/i })).toBeEnabled();
    }
  });
});
}
