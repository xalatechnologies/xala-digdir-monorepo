import { Page, Locator } from '@playwright/test';

/**
 * Page Object for Notification Center
 * Used in Minside (user portal)
 */
export class NotificationCenterPage {
  readonly page: Page;
  readonly baseUrl: string;

  // Notification bell and badge
  readonly notificationBell: Locator;
  readonly notificationBadge: Locator;
  readonly notificationDropdown: Locator;

  // Notification list
  readonly notificationsList: Locator;

  // Toast notifications
  readonly notificationToast: Locator;

  constructor(page: Page, baseUrl: string) {
    this.page = page;
    this.baseUrl = baseUrl;

    // Bell and badge
    this.notificationBell = page.locator('[data-testid="notification-bell"]');
    this.notificationBadge = page.locator('[data-testid="notification-badge"]');
    this.notificationDropdown = page.locator('[data-testid="notification-dropdown"]');

    // List
    this.notificationsList = page.locator('[data-testid="notifications-list"], .notifications-list');

    // Toast
    this.notificationToast = page.locator('[data-testid="notification-toast"], .notification-toast, [role="alert"]');
  }

  /**
   * Navigate to notification center page
   */
  async goto() {
    await this.page.goto(`${this.baseUrl}/notifications`);
  }

  /**
   * Click notification bell to open dropdown or navigate
   */
  async clickBell() {
    await this.notificationBell.click();

    // Wait for either dropdown or navigation
    await Promise.race([
      this.notificationDropdown.waitFor({ state: 'visible', timeout: 3000 }),
      this.page.waitForURL(/\/notifications/, { timeout: 3000 })
    ]).catch(() => {
      // If neither happens, we might already be on the page
    });
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const badgeText = await this.notificationBadge.textContent({ timeout: 2000 });
      return badgeText ? parseInt(badgeText, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Wait for unread count to update
   */
  async waitForUnreadCountUpdate(expectedCount: number, timeout = 10000) {
    await this.page.waitForFunction(
      (count) => {
        const badge = document.querySelector('[data-testid="notification-badge"]');
        if (!badge) return count === 0;
        const badgeText = badge.textContent || '0';
        return parseInt(badgeText, 10) === count;
      },
      expectedCount,
      { timeout }
    );
  }

  /**
   * Get notification item by partial text match
   */
  getNotificationItem(textContent: string): Locator {
    return this.page.locator(`[data-testid^="notification-item-"]:has-text("${textContent}")`);
  }

  /**
   * Check if notification exists
   */
  async hasNotification(textContent: string): Promise<boolean> {
    const notification = this.getNotificationItem(textContent);
    return await notification.isVisible({ timeout: 5000 }).catch(() => false);
  }

  /**
   * Click on a notification
   */
  async clickNotification(textContent: string) {
    const notification = this.getNotificationItem(textContent);
    await notification.click();
  }

  /**
   * Wait for real-time toast notification
   */
  async waitForToast(textContent: string, timeout = 10000): Promise<boolean> {
    try {
      const toast = this.page.locator(`[data-testid="notification-toast"]:has-text("${textContent}"), [role="alert"]:has-text("${textContent}")`);
      await toast.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get notification type
   */
  async getNotificationType(textContent: string): Promise<string | null> {
    const notification = this.getNotificationItem(textContent);
    const typeElement = notification.locator('[data-testid="notification-type"]');

    try {
      return await typeElement.getAttribute('data-type');
    } catch {
      return null;
    }
  }
}
