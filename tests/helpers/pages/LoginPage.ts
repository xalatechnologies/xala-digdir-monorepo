import { Page, Locator } from '@playwright/test';

/**
 * Page Object for Login functionality
 * Supports demo login for testing
 */
export class LoginPage {
  readonly page: Page;
  readonly demoLoginButton: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly tokenInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Find Demo Login button by partial text match (supports both Norwegian and English)
    this.demoLoginButton = page.locator('button.login-option').filter({ hasText: /Demo.*[Ll]ogin|Demo.*[Ii]nnlogging/i });
    this.nameInput = page.locator('[data-testid="name"], [name="name"], input[name="name"]');
    this.emailInput = page.locator('[data-testid="email"], [name="email"], input[type="email"]');
    this.tokenInput = page.locator('[data-testid="token"], [name="token"], input[name="token"]');
    this.loginButton = page.locator('[data-testid="login-button"], button[type="submit"]:has-text("Logg inn"), button:has-text("Login")');
  }

  /**
   * Navigate to login page
   */
  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/login`);
  }

  /**
   * Open demo login dialog
   */
  async openDemoLogin() {
    await this.demoLoginButton.click();
    // Wait for dialog to be visible
    await this.nameInput.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Login with demo credentials (name, email, token)
   */
  async login(name: string, email: string, token: string) {
    // Check if name input is visible, if not, open demo dialog
    const isVisible = await this.nameInput.isVisible().catch(() => false);
    if (!isVisible) {
      await this.openDemoLogin();
    }

    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.tokenInput.fill(token);
    await this.loginButton.click();
  }

  /**
   * Backward compatibility: login with email and default password
   * (converts to demo login format)
   */
  async loginEmailPassword(email: string, password: string) {
    // For demo login, use email as name and password as token
    await this.login(email.split('@')[0], email, password);
  }

  /**
   * Wait for successful login redirect
   */
  async waitForLoginSuccess() {
    await this.page.waitForURL(/\/(dashboard|bookings|home|minside)/, { timeout: 10000 });
  }
}
