import { Page, Locator, expect } from '@playwright/test';

export class BookingDetailsPage {
  readonly page: Page;
  readonly baseUrl: string;
  readonly bookingTitle: Locator;
  readonly bookingStatus: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly cancelButton: Locator;
  readonly successToast: Locator;
  readonly pendingApprovalMessage: Locator;
  readonly approvalMessage: Locator;
  readonly approvedBy: Locator;

  constructor(page: Page, baseUrl: string = 'http://localhost:5175') {
    this.page = page;
    this.baseUrl = baseUrl;
    this.bookingTitle = page.locator('h1, [data-testid="booking-title"]');
    this.bookingStatus = page.locator('[data-testid="status-badge"], .status-badge');
    this.approveButton = page.locator('button:has-text("Approve"), button:has-text("Godkjenn")');
    this.rejectButton = page.locator('button:has-text("Reject"), button:has-text("Avvis")');
    this.cancelButton = page.locator('button:has-text("Cancel"), button:has-text("Avbryt")');
    this.successToast = page.locator('[role="alert"], .toast-success');
    this.pendingApprovalMessage = page.getByText(/venter på godkjenning/i).or(page.getByText(/pending approval/i));
    this.approvalMessage = page.getByText(/er godkjent/i).or(page.getByText(/is approved/i));
    this.approvedBy = page.locator('[data-testid="approved-by"]');
  }

  async canApprove(): Promise<boolean> {
    return await this.approveButton.isVisible({ timeout: 2000 }).catch(() => false);
  }

  async canCancel(): Promise<boolean> {
    return await this.cancelButton.isVisible({ timeout: 2000 }).catch(() => false);
  }

  async approveBooking(reason?: string) {
    await this.approveButton.click();
    if (reason) {
      const reasonInput = this.page.locator('textarea[name="reason"]');
      if (await reasonInput.isVisible()) {
        await reasonInput.fill(reason);
        await this.page.locator('button:has-text("Confirm"), button:has-text("Bekreft")').click();
      }
    }
  }

  async getStatus(): Promise<string> {
    return (await this.bookingStatus.textContent()) || '';
  }

  async waitForStatusUpdate(status: string, timeout: number = 10000) {
    await expect(this.bookingStatus).toContainText(status, { ignoreCase: true, timeout });
  }

  async verifyApprovalDetails(approverEmail: string) {
    await expect(this.approvedBy).toBeVisible();
    if (approverEmail) {
      await expect(this.approvedBy).toContainText(approverEmail);
    }
  }
}
