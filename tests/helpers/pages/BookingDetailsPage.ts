import { Page, Locator } from '@playwright/test';

/**
 * Page Object for Booking Details and Actions
 * Used in both Minside (user view) and Backoffice (admin view)
 */
export class BookingDetailsPage {
  readonly page: Page;
  readonly baseUrl: string;

  // Booking information
  readonly bookingTitle: Locator;
  readonly bookingStatus: Locator;
  readonly bookingStatusBadge: Locator;
  readonly bookingDate: Locator;
  readonly bookingTime: Locator;
  readonly rentalObjectName: Locator;
  readonly bookingNotes: Locator;
  readonly bookingUser: Locator;

  // Status messages
  readonly pendingApprovalMessage: Locator;
  readonly approvalMessage: Locator;
  readonly approvedBy: Locator;
  readonly approvalDate: Locator;
  readonly approvalReason: Locator;

  // Actions (User)
  readonly cancelButton: Locator;
  readonly viewDetailsButton: Locator;

  // Actions (Admin)
  readonly approveButton: Locator;
  readonly denyButton: Locator;

  // Approval Modal (Admin)
  readonly approvalModal: Locator;
  readonly modalTitle: Locator;
  readonly approvalReasonTextarea: Locator;
  readonly confirmApproveButton: Locator;
  readonly cancelModalButton: Locator;

  // Success/Error Messages
  readonly successToast: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page, baseUrl: string) {
    this.page = page;
    this.baseUrl = baseUrl;

    // Booking information
    this.bookingTitle = page.locator('[data-testid="booking-title"]');
    this.bookingStatus = page.locator('[data-testid="booking-status"]');
    this.bookingStatusBadge = page.locator('[data-testid="booking-status-badge"]');
    this.bookingDate = page.locator('[data-testid="booking-date"]');
    this.bookingTime = page.locator('[data-testid="booking-time"]');
    this.rentalObjectName = page.locator('[data-testid="rental-object-name"], [data-testid="booking-rental-object"]');
    this.bookingNotes = page.locator('[data-testid="booking-notes"]');
    this.bookingUser = page.locator('[data-testid="booking-user"], [data-testid="booking-user-info"]');

    // Status messages
    this.pendingApprovalMessage = page.locator('[data-testid="pending-approval-message"]');
    this.approvalMessage = page.locator('[data-testid="approval-message"]');
    this.approvedBy = page.locator('[data-testid="approved-by"]');
    this.approvalDate = page.locator('[data-testid="approval-date"], [data-testid="approved-at"]');
    this.approvalReason = page.locator('[data-testid="approval-reason"]');

    // User actions
    this.cancelButton = page.locator('[data-testid="cancel-button"]');
    this.viewDetailsButton = page.locator('[data-testid="view-details-button"]');

    // Admin actions
    this.approveButton = page.locator('[data-testid="approve-button"]');
    this.denyButton = page.locator('[data-testid="deny-button"]');

    // Approval modal
    this.approvalModal = page.locator('[data-testid="approve-modal"], [role="dialog"]:has-text("Godkjenn"), [role="dialog"]:has-text("Approve")');
    this.modalTitle = page.locator('[data-testid="modal-title"]');
    this.approvalReasonTextarea = page.locator('[data-testid="approval-reason"], textarea[name="reason"]');
    this.confirmApproveButton = page.locator('[data-testid="confirm-approve-button"], button:has-text("Godkjenn"):not([data-testid="approve-button"]), button:has-text("Confirm")');
    this.cancelModalButton = page.locator('button:has-text("Avbryt"), button:has-text("Cancel")');

    // Messages
    this.successToast = page.locator('[data-testid="success-toast"], .toast.success, [role="alert"]:has-text("godkjent"), [role="alert"]:has-text("approved")');
    this.successMessage = page.locator('[data-testid="success-message"]');
    this.errorMessage = page.locator('[data-testid="error-message"], .error-message');
  }

  /**
   * Navigate to booking details by ID
   */
  async goto(bookingId: string) {
    await this.page.goto(`${this.baseUrl}/bookings/${bookingId}`);
  }

  /**
   * Get current booking status text
   */
  async getStatus(): Promise<string> {
    return await this.bookingStatus.textContent() || '';
  }

  /**
   * Check if approve button is visible (admin permission check)
   */
  async canApprove(): Promise<boolean> {
    return await this.approveButton.isVisible({ timeout: 2000 }).catch(() => false);
  }

  /**
   * Check if cancel button is visible (user permission check)
   */
  async canCancel(): Promise<boolean> {
    return await this.cancelButton.isVisible({ timeout: 2000 }).catch(() => false);
  }

  /**
   * Approve booking with optional reason
   */
  async approveBooking(reason?: string) {
    // Click approve button
    await this.approveButton.click();

    // Wait for modal to appear
    await this.approvalModal.waitFor({ state: 'visible', timeout: 5000 });

    // Fill reason if provided
    if (reason) {
      await this.approvalReasonTextarea.fill(reason);
    }

    // Confirm approval
    await this.confirmApproveButton.click();

    // Wait for modal to close
    await this.approvalModal.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Wait for booking status to update
   */
  async waitForStatusUpdate(expectedStatus: string, timeout = 10000) {
    await this.page.waitForFunction(
      (status) => {
        const statusElement = document.querySelector('[data-testid="booking-status"]');
        return statusElement?.textContent?.toLowerCase().includes(status.toLowerCase());
      },
      expectedStatus,
      { timeout }
    );
  }

  /**
   * Verify approval metadata is visible
   */
  async verifyApprovalDetails(expectedApprover?: string) {
    // Check that approval message is visible
    await this.approvalMessage.waitFor({ state: 'visible', timeout: 5000 });

    // Check approved by is visible
    await this.approvedBy.waitFor({ state: 'visible', timeout: 5000 });

    // Optionally verify approver
    if (expectedApprover) {
      const approverText = await this.approvedBy.textContent();
      if (!approverText?.includes(expectedApprover)) {
        throw new Error(`Expected approver ${expectedApprover}, but got ${approverText}`);
      }
    }

    // Check approval date is visible
    await this.approvalDate.waitFor({ state: 'visible', timeout: 5000 });
  }
}
