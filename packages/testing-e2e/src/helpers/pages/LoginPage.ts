import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly demoLoginLink: Locator;
  readonly demoNameInput: Locator;
  readonly demoEmailInput: Locator;
  readonly demoTokenInput: Locator;
  readonly demoSubmitButton: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.demoLoginLink = page.getByTestId('login-option-demo-innlogging');
    this.demoNameInput = page.getByTestId('demo-name');
    this.demoEmailInput = page.getByTestId('demo-email');
    this.demoTokenInput = page.getByTestId('demo-token');
    this.demoSubmitButton = page.getByTestId('demo-submit');
  }

  async goto(url: string = '/login') {
    await this.page.goto(url);
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginViaDemo(name: string, email: string, token: string = 'demo-token-123') {
    if (await this.demoLoginLink.isVisible()) {
      await this.demoLoginLink.click();
    }
    await this.demoNameInput.fill(name);
    await this.demoEmailInput.fill(email);
    await this.demoTokenInput.fill(token);
    await this.demoSubmitButton.click();
  }

  async waitForLoginSuccess() {
    await this.page.waitForURL(/\/(dashboard|bookings|home|minside|calendar)/, { timeout: 10000 });
  }
}
