import { test as base, expect, Page, BrowserContext } from '@playwright/test';
import { config } from '@digilist/api/config/backoffice.config';

/**
 * Evidence Collector
 * 
 * Captures comprehensive failure evidence: trace, screenshot, console logs,
 * API calls, and current URL for every test failure.
 */

export interface Evidence {
  url: string;
  timestamp: string;
  screenshotPath?: string;
  consoleLogs: ConsoleMessage[];
  apiCalls: ApiCall[];
  pageErrors: string[];
}

export interface ConsoleMessage {
  type: string;
  text: string;
  timestamp: string;
}

export interface ApiCall {
  method: string;
  url: string;
  status: number;
  duration: number;
  timestamp: string;
}

export class EvidenceCollector {
  private consoleLogs: ConsoleMessage[] = [];
  private apiCalls: ApiCall[] = [];
  private pageErrors: string[] = [];
  private page: Page;

  constructor(page: Page) {
    this.page = page;
    this.setupListeners();
  }

  private setupListeners() {
    // Console messages
    this.page.on('console', (msg) => {
      this.consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString(),
      });
    });

    // Page errors
    this.page.on('pageerror', (error) => {
      this.pageErrors.push(error.message);
    });

    // API calls
    this.page.on('response', (response) => {
      const timing = response.request().timing();
      this.apiCalls.push({
        method: response.request().method(),
        url: response.url(),
        status: response.status(),
        duration: timing.responseEnd - timing.requestStart,
        timestamp: new Date().toISOString(),
      });
    });
  }

  async collect(): Promise<Evidence> {
    return {
      url: this.page.url(),
      timestamp: new Date().toISOString(),
      consoleLogs: this.consoleLogs.slice(-20), // Last 20 logs
      apiCalls: this.apiCalls.slice(-10), // Last 10 API calls
      pageErrors: this.pageErrors,
    };
  }

  getConsoleErrors(): ConsoleMessage[] {
    return this.consoleLogs.filter(
      (log) =>
        log.type === 'error' &&
        !config.allowlistedWarnings.some((w) => log.text.includes(w))
    );
  }

  getApiErrors(): ApiCall[] {
    return this.apiCalls.filter((call) => call.status >= 500);
  }

  getApi4xxErrors(): ApiCall[] {
    return this.apiCalls.filter(
      (call) => call.status >= 400 && call.status < 500 && call.status !== 401
    );
  }

  hasPageErrors(): boolean {
    return this.pageErrors.length > 0;
  }

  reset() {
    this.consoleLogs = [];
    this.apiCalls = [];
    this.pageErrors = [];
  }
}

/**
 * Extended test fixture with evidence collection
 */
export const test = base.extend<{
  evidence: EvidenceCollector;
}>({
  evidence: async ({ page }, use) => {
    const collector = new EvidenceCollector(page);
    await use(collector);
  },
});

export { expect };
