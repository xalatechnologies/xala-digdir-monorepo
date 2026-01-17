import { Page, Locator } from '@playwright/test';

/**
 * Page Object for Login functionality
 * Supports demo login for testing
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[data-testid="email"], [name="email"], input[type="email"]');
    this.passwordInput = page.locator('[data-testid="password"], [name="password"], input[type="password"]');
    this.loginButton = page.locator('[data-testid="login-button"], button[type="submit"]:has-text("Logg inn"), button:has-text("Login")');
  }

  /**
   * Navigate to login page
   */
  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/login`);
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Wait for successful login redirect
   */
  async waitForLoginSuccess() {
    await this.page.waitForURL(/\/(dashboard|bookings|home|minside)/, { timeout: 10000 });
  }
}
