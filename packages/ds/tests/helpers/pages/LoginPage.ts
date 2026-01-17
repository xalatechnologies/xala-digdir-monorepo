import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly demoLoginButton: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly tokenInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.demoLoginButton = page.getByTestId('login-option-demo-innlogging').or(page.getByTestId('login-option-demo-login'));
    this.nameInput = page.getByTestId('demo-name');
    this.emailInput = page.getByTestId('demo-email');
    this.tokenInput = page.getByTestId('demo-token');
    this.loginButton = page.getByTestId('demo-submit');
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/login`);
  }

  async openDemoLogin() {
    await this.demoLoginButton.click();
    await this.nameInput.waitFor({ state: 'visible', timeout: 5000 });
  }

  async login(name: string, email: string, token: string) {
    const isVisible = await this.nameInput.isVisible().catch(() => false);
    if (!isVisible) {
      await this.openDemoLogin();
    }
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.tokenInput.fill(token);
    await this.loginButton.click();
  }

  async waitForLoginSuccess() {
    await this.page.waitForURL(/\/(dashboard|bookings|home|minside)/, { timeout: 10000 });
  }
}
