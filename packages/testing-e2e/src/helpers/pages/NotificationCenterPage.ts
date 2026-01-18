import { Page, Locator, expect } from '@playwright/test';

export class NotificationCenterPage {
  readonly page: Page;
  readonly baseUrl: string;
  readonly notificationList: Locator;
  readonly toast: Locator;

  constructor(page: Page, baseUrl: string = 'http://localhost:5174') {
    this.page = page;
    this.baseUrl = baseUrl;
    this.notificationList = page.locator('[data-testid="notification-list"], .notification-list');
    this.toast = page.locator('[role="status"], .toast-notification');
  }

  async goto() {
    await this.page.goto(`${this.baseUrl}/notifications`);
  }

  async waitForToast(title: string, timeout: number = 5000): Promise<boolean> {
    try {
      await expect(this.toast.getByText(title)).toBeVisible({ timeout });
      return true;
    } catch (e) {
      return false;
    }
  }

  async hasNotification(title: string): Promise<boolean> {
    return await this.notificationList.getByText(title).isVisible();
  }

  async clickNotification(title: string) {
    await this.notificationList.getByText(title).first().click();
  }
}
