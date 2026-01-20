/**
 * MinSide App Page Object Model
 * 
 * Page objects for the citizen portal (my bookings, messages, etc.).
 */

import { Page, Locator, expect } from '@playwright/test';

/**
 * MinSide Dashboard Page
 */
export class DashboardPage {
  readonly page: Page;
  readonly dashboardContainer: Locator;
  readonly welcomeMessage: Locator;
  readonly statsSection: Locator;
  readonly myBookingsNav: Locator;
  readonly myOrganizationsNav: Locator;
  readonly myProfileNav: Locator;
  readonly messagesInboxNav: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.dashboardContainer = page.locator('[data-testid="minside-dashboard"]');
    this.welcomeMessage = page.locator('[data-testid="dashboard-welcome-message"]');
    this.statsSection = page.locator('[data-testid="dashboard-stats"]');
    this.myBookingsNav = page.locator('[data-testid="my-bookings-nav"]');
    this.myOrganizationsNav = page.locator('[data-testid="my-organizations-nav"]');
    this.myProfileNav = page.locator('[data-testid="my-profile-nav"]');
    this.messagesInboxNav = page.locator('[data-testid="messages-inbox-nav"]');
  }
  
  async goto() {
    await this.page.goto('/dashboard');
  }
  
  async waitForLoad() {
    await expect(this.dashboardContainer).toBeVisible({ timeout: 10000 });
  }
  
  async goToMyBookings() {
    await this.myBookingsNav.click();
  }
  
  async goToMessages() {
    await this.messagesInboxNav.click();
  }
}

/**
 * My Bookings Page
 */
export class MyBookingsPage {
  readonly page: Page;
  readonly bookingsTable: Locator;
  readonly statusFilter: Locator;
  readonly searchInput: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.bookingsTable = page.locator('[data-testid="my-bookings-table"]');
    this.statusFilter = page.locator('[data-testid="bookings-filter-status"]');
    this.searchInput = page.locator('[data-testid="bookings-search"]');
  }
  
  async goto() {
    await this.page.goto('/bookings');
  }
  
  async waitForLoad() {
    await expect(this.bookingsTable).toBeVisible({ timeout: 10000 });
  }
  
  async getBookingRow(bookingId: string) {
    return this.page.locator(`[data-testid="booking-row-${bookingId}"]`);
  }
  
  async clickBookingRow(bookingId: string) {
    const row = await this.getBookingRow(bookingId);
    await expect(row).toBeVisible({ timeout: 5000 });
    
    const viewButton = row.locator('[data-testid="booking-view-details"]');
    await viewButton.click();
  }
  
  async getBookingStatus(bookingId: string): Promise<string> {
    const row = await this.getBookingRow(bookingId);
    const statusBadge = row.locator('[data-testid="booking-status"]');
    
    const status = await statusBadge.textContent();
    return status?.trim() || '';
  }
  
  async waitForBookingStatus(bookingId: string, expectedStatus: string, timeout = 15000) {
    const row = await this.getBookingRow(bookingId);
    const statusBadge = row.locator('[data-testid="booking-status"]');
    
    await expect(statusBadge).toContainText(expectedStatus, { 
      ignoreCase: true, 
      timeout 
    });
  }
  
  async searchBookings(query: string) {
    await this.searchInput.fill(query);
  }
  
  async filterByStatus(status: string) {
    await this.statusFilter.selectOption(status);
  }
  
  async hasBooking(bookingId: string): Promise<boolean> {
    const row = await this.getBookingRow(bookingId);
    return row.isVisible({ timeout: 3000 }).catch(() => false);
  }
}

/**
 * Booking Details Page
 */
export class BookingDetailsPage {
  readonly page: Page;
  readonly detailsContainer: Locator;
  readonly title: Locator;
  readonly status: Locator;
  readonly timeRange: Locator;
  readonly price: Locator;
  readonly cancelButton: Locator;
  readonly cancelConfirmButton: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.detailsContainer = page.locator('[data-testid="booking-details-page"]');
    this.title = page.locator('[data-testid="booking-details-title"]');
    this.status = page.locator('[data-testid="booking-details-status"]');
    this.timeRange = page.locator('[data-testid="booking-details-time"]');
    this.price = page.locator('[data-testid="booking-details-price"]');
    this.cancelButton = page.locator('[data-testid="booking-cancel-button"]');
    this.cancelConfirmButton = page.locator('[data-testid="booking-cancel-confirm"]');
  }
  
  async goto(bookingId: string) {
    await this.page.goto(`/bookings/${bookingId}`);
  }
  
  async waitForLoad() {
    await expect(this.detailsContainer).toBeVisible({ timeout: 10000 });
  }
  
  async getStatus(): Promise<string> {
    const status = await this.status.textContent();
    return status?.trim() || '';
  }
  
  async waitForStatusUpdate(expectedStatus: string, timeout = 15000) {
    await expect(this.status).toContainText(expectedStatus, {
      ignoreCase: true,
      timeout,
    });
  }
  
  async cancelBooking() {
    await this.cancelButton.click();
    await this.cancelConfirmButton.click();
  }
}

/**
 * Messages Inbox Page
 */
export class MessagesInboxPage {
  readonly page: Page;
  readonly inboxContainer: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.inboxContainer = page.locator('[data-testid="messages-inbox"]');
  }
  
  async goto() {
    await this.page.goto('/messages');
  }
  
  async waitForLoad() {
    await expect(this.inboxContainer).toBeVisible({ timeout: 10000 });
  }
  
  async getMessageThread(bookingId: string) {
    return this.page.locator(`[data-testid="message-thread-${bookingId}"]`);
  }
  
  async openThread(bookingId: string) {
    const thread = await this.getMessageThread(bookingId);
    await expect(thread).toBeVisible({ timeout: 5000 });
    await thread.click();
  }
  
  async hasMessage(bookingId: string, messageText: string): Promise<boolean> {
    const thread = await this.getMessageThread(bookingId);
    
    // Wait for thread to be visible
    const threadVisible = await thread.isVisible({ timeout: 3000 }).catch(() => false);
    if (!threadVisible) {
      return false;
    }
    
    // Check if message exists in thread
    const messageLocator = thread.locator('[data-testid="message-content"]', {
      hasText: messageText,
    });
    
    return messageLocator.isVisible({ timeout: 3000 }).catch(() => false);
  }
  
  async replyToMessage(bookingId: string, replyText: string) {
    const thread = await this.getMessageThread(bookingId);
    
    const replyInput = thread.locator('[data-testid="message-reply-input"]');
    await replyInput.fill(replyText);
    
    const sendButton = thread.locator('[data-testid="message-send-button"]');
    await sendButton.click();
  }
  
  async waitForNewMessage(bookingId: string, messageText: string, timeout = 15000) {
    const thread = await this.getMessageThread(bookingId);
    const messageLocator = thread.locator('[data-testid="message-content"]', {
      hasText: messageText,
    });
    
    await expect(messageLocator).toBeVisible({ timeout });
  }
}
