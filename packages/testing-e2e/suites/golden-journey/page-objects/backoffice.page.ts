/**
 * Backoffice App Page Object Model
 * 
 * Page objects for the case handler portal (booking approvals, messaging, etc.).
 */

import { Page, Locator, expect } from '@playwright/test';

/**
 * Backoffice Dashboard Page
 */
export class BackofficeDashboardPage {
  readonly page: Page;
  readonly dashboardContainer: Locator;
  readonly pendingCount: Locator;
  readonly quickActions: Locator;
  readonly bookingsNav: Locator;
  readonly calendarNav: Locator;
  readonly rentalObjectsNav: Locator;
  readonly reportsNav: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.dashboardContainer = page.locator('[data-testid="backoffice-dashboard"]');
    this.pendingCount = page.locator('[data-testid="dashboard-pending-count"]');
    this.quickActions = page.locator('[data-testid="dashboard-quick-actions"]');
    this.bookingsNav = page.locator('[data-testid="bookings-nav"]');
    this.calendarNav = page.locator('[data-testid="calendar-nav"]');
    this.rentalObjectsNav = page.locator('[data-testid="rental-objects-nav"]');
    this.reportsNav = page.locator('[data-testid="reports-nav"]');
  }
  
  async goto() {
    await this.page.goto('/dashboard');
  }
  
  async waitForLoad() {
    await expect(this.dashboardContainer).toBeVisible({ timeout: 10000 });
  }
  
  async goToBookings() {
    await this.bookingsNav.click();
  }
}

/**
 * Bookings List Page
 */
export class BookingsListPage {
  readonly page: Page;
  readonly bookingsTable: Locator;
  readonly statusTabs: Locator;
  readonly allTab: Locator;
  readonly pendingTab: Locator;
  readonly approvedTab: Locator;
  readonly rejectedTab: Locator;
  readonly searchInput: Locator;
  readonly dateFilter: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.bookingsTable = page.locator('[data-testid="bookings-table"]');
    this.statusTabs = page.locator('[data-testid="bookings-status-tabs"]');
    this.allTab = page.locator('[data-testid="bookings-tab-all"]');
    this.pendingTab = page.locator('[data-testid="bookings-tab-pending"]');
    this.approvedTab = page.locator('[data-testid="bookings-tab-approved"]');
    this.rejectedTab = page.locator('[data-testid="bookings-tab-rejected"]');
    this.searchInput = page.locator('[data-testid="bookings-search"]');
    this.dateFilter = page.locator('[data-testid="bookings-filter-date"]');
  }
  
  async goto() {
    await this.page.goto('/bookings');
  }
  
  async waitForLoad() {
    await expect(this.bookingsTable).toBeVisible({ timeout: 10000 });
  }
  
  async clickTab(tab: 'all' | 'pending' | 'approved' | 'rejected') {
    const tabMap = {
      all: this.allTab,
      pending: this.pendingTab,
      approved: this.approvedTab,
      rejected: this.rejectedTab,
    };
    
    await tabMap[tab].click();
  }
  
  async searchBookings(query: string) {
    await this.searchInput.fill(query);
  }
  
  async getBookingRow(bookingId: string) {
    return this.page.locator(`[data-testid="booking-case-row-${bookingId}"]`);
  }
  
  async clickBookingRow(bookingId: string) {
    const row = await this.getBookingRow(bookingId);
    await expect(row).toBeVisible({ timeout: 5000 });
    await row.click();
  }
  
  async hasBooking(bookingId: string): Promise<boolean> {
    const row = await this.getBookingRow(bookingId);
    return row.isVisible({ timeout: 3000 }).catch(() => false);
  }
}

/**
 * Booking Case Details Page
 */
export class BookingCaseDetailsPage {
  readonly page: Page;
  readonly caseDetailsContainer: Locator;
  readonly caseTitle: Locator;
  readonly caseStatus: Locator;
  readonly requesterInfo: Locator;
  readonly timeRange: Locator;
  readonly notes: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly approvalReasonInput: Locator;
  readonly rejectionReasonInput: Locator;
  readonly confirmApproveButton: Locator;
  readonly confirmRejectButton: Locator;
  readonly messageInput: Locator;
  readonly sendMessageButton: Locator;
  readonly messageThread: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.caseDetailsContainer = page.locator('[data-testid="booking-case-details"]');
    this.caseTitle = page.locator('[data-testid="booking-case-title"]');
    this.caseStatus = page.locator('[data-testid="booking-case-status"]');
    this.requesterInfo = page.locator('[data-testid="booking-case-requester"]');
    this.timeRange = page.locator('[data-testid="booking-case-time"]');
    this.notes = page.locator('[data-testid="booking-case-notes"]');
    this.approveButton = page.locator('[data-testid="approve-booking"]');
    this.rejectButton = page.locator('[data-testid="reject-booking"]');
    this.approvalReasonInput = page.locator('[data-testid="approval-reason-input"]');
    this.rejectionReasonInput = page.locator('[data-testid="rejection-reason-input"]');
    this.confirmApproveButton = page.locator('[data-testid="confirm-approve"]');
    this.confirmRejectButton = page.locator('[data-testid="confirm-reject"]');
    this.messageInput = page.locator('[data-testid="casehandler-message-input"]');
    this.sendMessageButton = page.locator('[data-testid="send-message"]');
    this.messageThread = page.locator('[data-testid="message-thread"]');
  }
  
  async goto(bookingId: string) {
    await this.page.goto(`/bookings/${bookingId}`);
  }
  
  async waitForLoad() {
    await expect(this.caseDetailsContainer).toBeVisible({ timeout: 10000 });
  }
  
  async getStatus(): Promise<string> {
    const status = await this.caseStatus.textContent();
    return status?.trim() || '';
  }
  
  async approveBooking(reason?: string) {
    await this.approveButton.click();
    
    // Fill reason if provided and input is visible
    if (reason) {
      const inputVisible = await this.approvalReasonInput.isVisible({ timeout: 2000 }).catch(() => false);
      if (inputVisible) {
        await this.approvalReasonInput.fill(reason);
      }
    }
    
    // Confirm approval
    await this.confirmApproveButton.click();
  }
  
  async rejectBooking(reason: string) {
    await this.rejectButton.click();
    
    // Rejection reason is required
    await this.rejectionReasonInput.fill(reason);
    
    // Confirm rejection
    await this.confirmRejectButton.click();
  }
  
  async sendMessage(message: string) {
    await this.messageInput.fill(message);
    await this.sendMessageButton.click();
  }
  
  async waitForStatusUpdate(expectedStatus: string, timeout = 15000) {
    await expect(this.caseStatus).toContainText(expectedStatus, {
      ignoreCase: true,
      timeout,
    });
  }
  
  async hasMessage(messageText: string): Promise<boolean> {
    const messageLocator = this.messageThread.locator('[data-testid="message-content"]', {
      hasText: messageText,
    });
    
    return messageLocator.isVisible({ timeout: 3000 }).catch(() => false);
  }
  
  async waitForMessage(messageText: string, timeout = 15000) {
    const messageLocator = this.messageThread.locator('[data-testid="message-content"]', {
      hasText: messageText,
    });
    
    await expect(messageLocator).toBeVisible({ timeout });
  }
}

/**
 * Audit Log Section (Optional - for verification)
 */
export class AuditLogSection {
  readonly page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }
  
  async getAuditEntry(bookingId: string) {
    return this.page.locator(`[data-testid="audit-log-entry-${bookingId}"]`);
  }
  
  async hasAuditEntry(bookingId: string, action: string): Promise<boolean> {
    const entry = await this.getAuditEntry(bookingId);
    
    const entryVisible = await entry.isVisible({ timeout: 3000 }).catch(() => false);
    if (!entryVisible) {
      return false;
    }
    
    const actionLocator = entry.locator('[data-testid="audit-log-action"]', {
      hasText: action,
    });
    
    return actionLocator.isVisible({ timeout: 2000 }).catch(() => false);
  }
}
