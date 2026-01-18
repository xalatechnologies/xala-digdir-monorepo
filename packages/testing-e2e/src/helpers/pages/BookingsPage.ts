import { Page, Locator, expect } from '@playwright/test';

export class BookingsPage {
  readonly page: Page;
  readonly baseUrl: string;
  readonly bookingList: Locator;
  readonly searchInput: Locator;
  readonly filterButton: Locator;

  constructor(page: Page, baseUrl: string = 'http://localhost:5175') {
    this.page = page;
    this.baseUrl = baseUrl;
    this.bookingList = page.locator('[data-testid="booking-list"], .booking-list');
    this.searchInput = page.locator('input[type="search"], [placeholder*="søk" i]');
    this.filterButton = page.locator('button:has-text("Filter")');
  }

  async goto() {
    await this.page.goto(`${this.baseUrl}/bookings`);
  }

  async search(term: string) {
    await this.searchInput.fill(term);
    await this.page.keyboard.press('Enter');
  }

  async filterByStatus(status: 'pending' | 'confirmed' | 'cancelled') {
    if (await this.filterButton.isVisible()) {
      await this.filterButton.click();
      const statusOption = this.page.locator(`[role="option"]:has-text("${status}")`);
      if (await statusOption.isVisible()) {
        await statusOption.click();
      }
    }
  }

  async hasBooking(title: string): Promise<boolean> {
    return await this.page.getByText(title).isVisible();
  }

  async clickBooking(title: string) {
    await this.page.getByText(title).first().click();
  }
}
