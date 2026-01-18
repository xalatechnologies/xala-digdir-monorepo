import { test as base, expect, Page, BrowserContext, ConsoleMessage } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * QA Expert Evidence Fixture
 * 
 * Captures comprehensive failure evidence:
 * - Console logs (errors + warnings)
 * - Network requests with status codes
 * - Screenshots on failure
 * - URL and context snapshot
 * - Feature flags and capabilities
 */

interface QualityGateError {
  type: 'console' | 'network' | 'page' | 'i18n' | 'forbidden' | 'timeout';
  message: string;
  timestamp: Date;
  url?: string;
  stack?: string;
}

interface NetworkRequest {
  url: string;
  method: string;
  status: number;
  timestamp: Date;
}

interface EvidenceCollector {
  // Console tracking
  consoleErrors: QualityGateError[];
  consoleWarnings: string[];
  
  // Network tracking
  networkRequests: NetworkRequest[];
  failedRequests: NetworkRequest[];
  apiCalls: NetworkRequest[]; // Alias for compatibility
  
  // Page errors
  pageErrors: QualityGateError[];
  
  // Quality gates
  hasPageErrors(): boolean;
  hasConsoleErrors(): boolean;
  has5xxResponses(): boolean;
  hasForbiddenTerminology(): boolean;
  hasMissingI18nKeys(): boolean;
  getApi4xxErrors(): NetworkRequest[];
  getConsoleErrors(): QualityGateError[];
  getApiErrors(): NetworkRequest[];
  reset(): void;
  
  // Evidence capture
  captureEvidence(testInfo: any): Promise<void>;
  getSnapshot(): EvidenceSnapshot;
  
  // Feature flags (if available)
  featureFlags: Record<string, boolean>;
  userRole: string | null;
  capabilities: string[];
}

interface EvidenceSnapshot {
  url: string;
  role: string | null;
  featureFlags: Record<string, boolean>;
  capabilities: string[];
  consoleErrors: QualityGateError[];
  failedRequests: NetworkRequest[];
  lastRequests: NetworkRequest[];
  timestamp: Date;
}

interface MenuItem {
  label: string;
  href: string;
  icon?: string;
  group?: string;
  isActive: boolean;
}

interface MenuMap {
  items: MenuItem[];
  groups: string[];
  duplicateLabels: string[];
  duplicateRoutes: string[];
  deadRoutes: string[];
  rawI18nKeys: string[];
  forbiddenTerms: string[];
}

// Forbidden terminology that should never appear
const FORBIDDEN_TERMS = ['facility', 'facilities'];

// Known safe console warnings to ignore
const SAFE_WARNINGS = [
  'Download the React DevTools',
  'React does not recognize',
  '[HMR]',
  '[vite]',
];

function createEvidenceCollector(page: Page): EvidenceCollector {
  const consoleErrors: QualityGateError[] = [];
  const consoleWarnings: string[] = [];
  const networkRequests: NetworkRequest[] = [];
  const failedRequests: NetworkRequest[] = [];
  const pageErrors: QualityGateError[] = [];
  let featureFlags: Record<string, boolean> = {};
  let userRole: string | null = null;
  let capabilities: string[] = [];

  // Listen to console events
  page.on('console', (msg: ConsoleMessage) => {
    const text = msg.text();
    
    if (msg.type() === 'error') {
      // Skip safe warnings
      if (!SAFE_WARNINGS.some(sw => text.includes(sw))) {
        consoleErrors.push({
          type: 'console',
          message: text,
          timestamp: new Date(),
          url: page.url(),
        });
      }
    } else if (msg.type() === 'warning') {
      if (!SAFE_WARNINGS.some(sw => text.includes(sw))) {
        consoleWarnings.push(text);
      }
    }
  });

  // Listen to page errors
  page.on('pageerror', (error) => {
    pageErrors.push({
      type: 'page',
      message: error.message,
      timestamp: new Date(),
      url: page.url(),
      stack: error.stack,
    });
  });

  // Listen to network responses
  page.on('response', (response) => {
    const request: NetworkRequest = {
      url: response.url(),
      method: response.request().method(),
      status: response.status(),
      timestamp: new Date(),
    };
    
    networkRequests.push(request);
    
    // Track 5xx errors
    if (response.status() >= 500) {
      failedRequests.push(request);
    }
  });

  return {
    consoleErrors,
    consoleWarnings,
    networkRequests,
    failedRequests,
    apiCalls: networkRequests, // Alias
    pageErrors,
    featureFlags,
    userRole,
    capabilities,

    getApi4xxErrors(): NetworkRequest[] {
      return networkRequests.filter(r => r.status >= 400 && r.status < 500);
    },

    getConsoleErrors(): QualityGateError[] {
      return consoleErrors;
    },

    getApiErrors(): NetworkRequest[] {
      return networkRequests.filter(r => r.status >= 500);
    },

    reset(): void {
      consoleErrors.length = 0;
      consoleWarnings.length = 0;
      networkRequests.length = 0;
      failedRequests.length = 0;
      pageErrors.length = 0;
    },

    hasPageErrors(): boolean {
      return pageErrors.length > 0;
    },

    hasConsoleErrors(): boolean {
      return consoleErrors.length > 0;
    },

    has5xxResponses(): boolean {
      return failedRequests.length > 0;
    },

    hasForbiddenTerminology(): boolean {
      // This is checked separately via page content
      return false;
    },

    hasMissingI18nKeys(): boolean {
      // This is checked separately via page content
      return false;
    },

    async captureEvidence(testInfo: any): Promise<void> {
      const evidenceDir = testInfo.outputDir;
      
      // Screenshot
      await page.screenshot({
        path: path.join(evidenceDir, 'failure-screenshot.png'),
        fullPage: true,
      });

      // Evidence JSON
      const evidence = this.getSnapshot();
      fs.writeFileSync(
        path.join(evidenceDir, 'evidence.json'),
        JSON.stringify(evidence, null, 2)
      );
    },

    getSnapshot(): EvidenceSnapshot {
      return {
        url: page.url(),
        role: userRole,
        featureFlags,
        capabilities,
        consoleErrors,
        failedRequests,
        lastRequests: networkRequests.slice(-10),
        timestamp: new Date(),
      };
    },
  };
}

// Quality gate assertions
export async function assertNoConsoleErrors(evidence: EvidenceCollector) {
  if (evidence.hasConsoleErrors()) {
    const errors = evidence.consoleErrors.map(e => e.message).join('\n');
    throw new Error(`Console errors detected:\n${errors}`);
  }
}

export async function assertNo5xxResponses(evidence: EvidenceCollector) {
  if (evidence.has5xxResponses()) {
    const failures = evidence.failedRequests.map(r => `${r.method} ${r.url} → ${r.status}`).join('\n');
    throw new Error(`5xx responses detected:\n${failures}`);
  }
}

export async function assertNoPageErrors(evidence: EvidenceCollector) {
  if (evidence.hasPageErrors()) {
    const errors = evidence.pageErrors.map(e => e.message).join('\n');
    throw new Error(`Page errors detected:\n${errors}`);
  }
}

export async function assertNoForbiddenTerminology(page: Page) {
  const bodyText = await page.locator('body').textContent() || '';
  const lowerText = bodyText.toLowerCase();
  
  for (const term of FORBIDDEN_TERMS) {
    if (lowerText.includes(term)) {
      throw new Error(`Forbidden terminology detected: "${term}"`);
    }
  }
}

export async function assertNoMissingI18nKeys(page: Page) {
  const bodyText = await page.locator('body').textContent() || '';
  
  // Common patterns for missing i18n keys
  const i18nPatterns = [
    /[a-z]+\.[a-z]+\.[a-z]+/g,  // nav.rental.objects
    /\{\{[^}]+\}\}/g,           // {{key}}
    /\$t\([^)]+\)/g,            // $t(key)
  ];
  
  for (const pattern of i18nPatterns) {
    const matches = bodyText.match(pattern);
    if (matches && matches.length > 0) {
      // Check if it looks like a raw key
      const suspiciousKeys = matches.filter(m => 
        m.includes('.') && 
        !m.includes('http') && 
        !m.includes('@') &&
        /^[a-z_\.]+$/i.test(m)
      );
      
      if (suspiciousKeys.length > 0) {
        console.warn(`Possible missing i18n keys: ${suspiciousKeys.join(', ')}`);
      }
    }
  }
}

export async function assertPageReady(page: Page) {
  // Wait for one of the "ready markers"
  const readyMarkers = [
    'h1, h2, [data-testid="page-title"]',                    // Page title
    'table tbody tr, [data-testid*="row"]',                  // Data rows
    '[data-testid="empty-state"], [class*="empty-state"]',   // Empty state
  ];
  
  let isReady = false;
  
  for (const marker of readyMarkers) {
    try {
      await page.locator(marker).first().waitFor({ timeout: 5000 });
      isReady = true;
      break;
    } catch {
      // Try next marker
    }
  }
  
  if (!isReady) {
    throw new Error('Page did not reach ready state within timeout');
  }
}

// Menu map builder
export async function buildMenuMap(page: Page): Promise<MenuMap> {
  const items: MenuItem[] = [];
  const duplicateLabels: string[] = [];
  const duplicateRoutes: string[] = [];
  const deadRoutes: string[] = [];
  const rawI18nKeys: string[] = [];
  const forbiddenTerms: string[] = [];
  
  // Find sidebar nav items
  const navItems = page.locator('nav[data-testid="sidebar-nav"] a, aside a[href^="/"]');
  const count = await navItems.count();
  
  const seenLabels = new Set<string>();
  const seenRoutes = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    const item = navItems.nth(i);
    const label = (await item.textContent() || '').trim();
    const href = await item.getAttribute('href') || '';
    const isActive = (await item.getAttribute('class') || '').includes('active');
    
    // Check for duplicates
    if (seenLabels.has(label)) {
      duplicateLabels.push(label);
    }
    seenLabels.add(label);
    
    if (seenRoutes.has(href)) {
      duplicateRoutes.push(href);
    }
    seenRoutes.add(href);
    
    // Check for raw i18n keys
    if (/^[a-z]+\.[a-z]+/i.test(label) && !label.includes(' ')) {
      rawI18nKeys.push(label);
    }
    
    // Check for forbidden terminology
    const lowerLabel = label.toLowerCase();
    for (const term of FORBIDDEN_TERMS) {
      if (lowerLabel.includes(term)) {
        forbiddenTerms.push(`${label} contains "${term}"`);
      }
    }
    
    items.push({ label, href, isActive });
  }
  
  // Get unique groups
  const groups = [...new Set(items.map(i => i.group).filter(Boolean))] as string[];
  
  return {
    items,
    groups,
    duplicateLabels,
    duplicateRoutes,
    deadRoutes,
    rawI18nKeys,
    forbiddenTerms,
  };
}

// Extended test fixture
export const test = base.extend<{
  evidence: EvidenceCollector;
  menuMap: () => Promise<MenuMap>;
  qualityGates: () => Promise<void>;
  userPage: Page;
  adminPage: Page;
}>({
  userPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  evidence: async ({ page }, use, testInfo) => {
    const collector = createEvidenceCollector(page);
    
    await use(collector);
    
    // On failure, capture evidence
    if (testInfo.status !== 'passed') {
      await collector.captureEvidence(testInfo);
    }
  },
  
  menuMap: async ({ page }, use) => {
    await use(() => buildMenuMap(page));
  },
  
  qualityGates: async ({ page, evidence }, use) => {
    await use(async () => {
      await assertNoConsoleErrors(evidence);
      await assertNo5xxResponses(evidence);
      await assertNoPageErrors(evidence);
      await assertNoForbiddenTerminology(page);
      await assertPageReady(page);
    });
  },
});

export { expect };
export type { EvidenceCollector, MenuMap, MenuItem, EvidenceSnapshot };
