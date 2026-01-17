import { Page, Locator } from '@playwright/test';

/**
 * Page Object for Bookings List and Management
 * Used in both Minside (user view) and Backoffice (admin view)
 */
export class BookingsPage {
  readonly page: Page;
  readonly baseUrl: string;

  // Navigation
  readonly navBookingsLink: Locator;

  // List view
  readonly createBookingButton: Locator;
  readonly searchInput: Locator;
  readonly bookingsList: Locator;

  // Filter buttons (Backoffice)
  readonly statusFilterButton: Locator;
  readonly statusPendingButton: Locator;
  readonly statusApprovedButton: Locator;
  readonly statusCancelledButton: Locator;

  constructor(page: Page, baseUrl: string) {
    this.page = page;
    this.baseUrl = baseUrl;

    // Navigation
    this.navBookingsLink = page.locator('[data-testid="nav-bookings"], a:has-text("Bookings"), a:has-text("Bestillinger")');

    // List view
    this.createBookingButton = page.locator('[data-testid="create-booking-button"]');
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.bookingsList = page.locator('[data-testid="bookings-list"], .bookings-list, [role="table"]');

    // Filters (Backoffice)
    this.statusFilterButton = page.locator('[data-testid="filter-status"]');
    this.statusPendingButton = page.locator('[data-testid="status-pending"]');
    this.statusApprovedButton = page.locator('[data-testid="status-approved"]');
    this.statusCancelledButton = page.locator('[data-testid="status-cancelled"]');
  }

  /**
   * Navigate to bookings list page
   */
  async goto() {
    await this.page.goto(`${this.baseUrl}/bookings`);
  }

  /**
   * Navigate via navigation menu
   */
  async navigateViaMenu() {
    await this.navBookingsLink.click();
    await this.page.waitForURL(/\/bookings/);
  }

  /**
   * Search for a booking by title or ID
   */
  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Filter bookings by status (Backoffice)
   */
  async filterByStatus(status: 'pending' | 'approved' | 'cancelled') {
    // Try clicking status tab directly or use filter button
    const statusButton = this.page.locator(`[data-testid="status-${status}"]`);

    if (await statusButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await statusButton.click();
    } else {
      // Fallback: use filter dropdown
      await this.statusFilterButton.click();

      switch (status) {
        case 'pending':
          await this.statusPendingButton.click();
          break;
        case 'approved':
          await this.statusApprovedButton.click();
          break;
        case 'cancelled':
          await this.statusCancelledButton.click();
          break;
      }
    }

    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get booking row by ID
   */
  getBookingRow(bookingId: string): Locator {
    return this.page.locator(`[data-testid="booking-row-${bookingId}"]`);
  }

  /**
   * Check if a booking exists in the list
   */
  async hasBooking(bookingTitle: string): Promise<boolean> {
    const bookingElement = this.page.locator(`[data-testid="booking-title"]:has-text("${bookingTitle}")`);
    return await bookingElement.isVisible({ timeout: 5000 }).catch(() => false);
  }

  /**
   * Click on a booking to view details
   */
  async clickBooking(bookingId: string) {
    const bookingRow = this.getBookingRow(bookingId);
    await bookingRow.click();
  }

  /**
   * Get booking status badge
   */
  getBookingStatus(bookingId: string): Locator {
    return this.page.locator(`[data-testid="booking-row-${bookingId}"] [data-testid="booking-status"]`);
  }
}
