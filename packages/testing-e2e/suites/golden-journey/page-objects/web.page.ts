/**
 * Web App Page Object Model
 * 
 * Page objects for the public web portal (listing discovery and booking flow).
 */

import { Page, Locator, expect } from '@playwright/test';

/**
 * Listing Search Page
 */
export class ListingSearchPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly filterPanel: Locator;
  readonly categoryFilter: Locator;
  readonly typeFilter: Locator;
  readonly capacityFilter: Locator;
  readonly applyFiltersButton: Locator;
  readonly clearFiltersButton: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('[data-testid="listing-search-input"]');
    this.filterPanel = page.locator('[data-testid="listing-filter-panel"]');
    this.categoryFilter = page.locator('[data-testid="listing-filter-category"]');
    this.typeFilter = page.locator('[data-testid="listing-filter-type"]');
    this.capacityFilter = page.locator('[data-testid="listing-filter-capacity"]');
    this.applyFiltersButton = page.locator('[data-testid="listing-filter-apply"]');
    this.clearFiltersButton = page.locator('[data-testid="listing-filter-clear"]');
  }
  
  async goto() {
    await this.page.goto('/');
  }
  
  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }
  
  async filterByCategory(category: string) {
    await this.categoryFilter.selectOption(category);
  }
  
  async filterByType(type: string) {
    await this.typeFilter.selectOption(type);
  }
  
  async filterByCapacity(capacity: number) {
    await this.capacityFilter.fill(capacity.toString());
  }
  
  async applyFilters() {
    await this.applyFiltersButton.click();
  }
  
  async clearFilters() {
    await this.clearFiltersButton.click();
  }
  
  async getListingCard(listingKey: string) {
    // Find listing card by test key in metadata
    return this.page.locator(`[data-testid="listing-card"][data-key="${listingKey}"]`);
  }
  
  async clickListingCard(listingKey: string) {
    const card = await this.getListingCard(listingKey);
    await card.click();
  }
}

/**
 * Listing Details Page
 */
export class ListingDetailsPage {
  readonly page: Page;
  readonly detailsContainer: Locator;
  readonly title: Locator;
  readonly description: Locator;
  readonly capacity: Locator;
  readonly address: Locator;
  readonly calendar: Locator;
  readonly prevWeekButton: Locator;
  readonly nextWeekButton: Locator;
  readonly bookingModeSelector: Locator;
  readonly bookingSummary: Locator;
  readonly selectedSlotTime: Locator;
  readonly totalPrice: Locator;
  readonly submitButton: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.detailsContainer = page.locator('[data-testid="listing-details-page"]');
    this.title = page.locator('[data-testid="listing-title"]');
    this.description = page.locator('[data-testid="listing-description"]');
    this.capacity = page.locator('[data-testid="listing-capacity"]');
    this.address = page.locator('[data-testid="listing-address"]');
    this.calendar = page.locator('[data-testid="listing-calendar"]');
    this.prevWeekButton = page.locator('[data-testid="calendar-prev-week"]');
    this.nextWeekButton = page.locator('[data-testid="calendar-next-week"]');
    this.bookingModeSelector = page.locator('[data-testid="booking-mode-selector"]');
    this.bookingSummary = page.locator('[data-testid="booking-summary"]');
    this.selectedSlotTime = page.locator('[data-testid="booking-selected-slot-time"]');
    this.totalPrice = page.locator('[data-testid="booking-total-price"]');
    this.submitButton = page.locator('[data-testid="booking-submit"]');
  }
  
  async goto(rentalObjectId: string) {
    await this.page.goto(`/rentals/${rentalObjectId}`);
  }
  
  async waitForLoad() {
    await expect(this.detailsContainer).toBeVisible({ timeout: 10000 });
  }
  
  async getCalendarSlot(isoTimestamp: string, status: 'available' | 'booked' | 'blocked' = 'available') {
    return this.page.locator(`[data-testid="calendar-slot-${status}-${isoTimestamp}"]`);
  }
  
  async clickSlot(isoTimestamp: string) {
    const slot = await this.getCalendarSlot(isoTimestamp, 'available');
    await expect(slot).toBeVisible();
    await slot.click();
  }
  
  async verifySlotBooked(isoTimestamp: string) {
    const slot = await this.getCalendarSlot(isoTimestamp, 'booked');
    await expect(slot).toBeVisible();
  }
  
  async verifySlotBlocked(isoTimestamp: string) {
    const slot = await this.getCalendarSlot(isoTimestamp, 'blocked');
    await expect(slot).toBeVisible();
  }
  
  async submitBooking() {
    await this.submitButton.click();
  }
  
  async getBookingReference(): Promise<string> {
    const successContainer = this.page.locator('[data-testid="booking-success"]');
    await expect(successContainer).toBeVisible({ timeout: 10000 });
    
    const referenceElement = this.page.locator('[data-testid="booking-reference"]');
    const reference = await referenceElement.textContent();
    
    if (!reference) {
      throw new Error('Booking reference not found');
    }
    
    return reference.trim();
  }
}

/**
 * Booking Success Page
 */
export class BookingSuccessPage {
  readonly page: Page;
  readonly successContainer: Locator;
  readonly bookingReference: Locator;
  readonly viewBookingButton: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.successContainer = page.locator('[data-testid="booking-success"]');
    this.bookingReference = page.locator('[data-testid="booking-reference"]');
    this.viewBookingButton = page.locator('[data-testid="view-booking-button"]');
  }
  
  async waitForSuccess() {
    await expect(this.successContainer).toBeVisible({ timeout: 15000 });
  }
  
  async getReference(): Promise<string> {
    const reference = await this.bookingReference.textContent();
    if (!reference) {
      throw new Error('Booking reference not found');
    }
    return reference.trim();
  }
  
  async viewBooking() {
    await this.viewBookingButton.click();
  }
}
