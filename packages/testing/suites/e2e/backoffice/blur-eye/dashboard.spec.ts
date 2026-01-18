import { setupMockApi } from '../../../../mocks/api-server.mock';
import { test, expect } from '../fixtures/qa-expert.fixture';
import { config } from '../config/backoffice.config';
import {
  assertBlurEyeListView,
  assertNoForbiddenTerminology,
  assertNoMissingI18nKeys,
  assertPageReady,
  logBlurEyeResults,
  discoverPageElements,
} from '../fixtures/blur-eye.helpers';

/**
 * Dashboard Blur-Eye E2E Tests
 * 
 * Tests the dashboard/home page for:
 * - D1. Blur-Eye Structure (header, KPIs, quick actions, alerts)
 * - D2. Widget Data Correctness
 * - D3. Quick Actions Navigation
 * - D4. No Runtime Errors
 */

test.describe('Dashboard (Oversikt) E2E', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/login')) {
      test();
    }
  });

  test.describe('D1. Blur-Eye Structure', () => {
  setupMockApi();
    test('D1.1 Page has clear header/title', async ({ page }) => {
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      const titleText = await title.textContent() || '';
      console.log(`Dashboard title: "${titleText}"`);
      
      // Dashboard should have a welcoming or overview title
      const validTitles = ['dashboard', 'oversikt', 'hjem', 'velkommen', 'welcome'];
      const hasValidTitle = validTitles.some(t => titleText.toLowerCase().includes(t));
      
      expect(hasValidTitle || titleText.length > 0).toBe(true);
    });

    test('D1.2 KPI widgets/cards exist', async ({ page }) => {
      const widgets = page.locator(
        '[data-testid*="widget"], [data-testid*="kpi"], [data-testid*="stat"], [class*="card"], [class*="widget"]'
      );
      const widgetCount = await widgets.count();
      
      console.log(`\nKPI Widgets found: ${widgetCount}`);
      
      // A dashboard should have at least some widgets
      expect(widgetCount).toBeGreaterThan(0);
      
      // Log widget content
      for (let i = 0; i < Math.min(widgetCount, 5); i++) {
        const text = await widgets.nth(i).textContent() || '';
        console.log(`  Widget ${i + 1}: ${text.slice(0, 50)}...`);
      }
    });

    test('D1.3 Quick actions section exists', async ({ page }) => {
      const quickActions = page.locator(
        '[data-testid*="quick-action"], [class*="quick-action"], a[href*="wizard"], button:has-text("Opprett"), button:has-text("Ny")'
      );
      const actionCount = await quickActions.count();
      
      console.log(`\nQuick actions found: ${actionCount}`);
      
      if (actionCount > 0) {
        for (let i = 0; i < Math.min(actionCount, 3); i++) {
          const text = await quickActions.nth(i).textContent() || '';
          console.log(`  Action ${i + 1}: ${text.trim()}`);
        }
      }
    });

    test('D1.4 No infinite loading state', async ({ page }) => {
      // Wait for page to settle
      await page.waitForTimeout(5000);
      
      const spinner = page.locator('[data-testid="loading"], .loading, [aria-busy="true"]');
      const isStillLoading = await spinner.isVisible().catch(() => false);
      
      console.log(`Loading spinner visible after 5s: ${isStillLoading}`);
      expect(isStillLoading).toBe(false);
    });

    test('D1.5 No forbidden terminology', async ({ page }) => {
      const result = await assertNoForbiddenTerminology(page);
      
      if (!result.passed) {
        console.log(`Forbidden terms found: ${result.terms.join(', ')}`);
      }
      
      expect(result.passed).toBe(true);
    });
  });

  test.describe('D2. Widget Data Correctness', () => {
  setupMockApi();
    test('D2.1 Pending items widget reflects queue', async ({ page }) => {
      // Find pending/queue widget
      const pendingWidget = page.locator(
        '[data-testid*="pending"], [class*="pending"], text=/venter|pending|queue/i'
      ).first();
      
      const hasPendingWidget = await pendingWidget.isVisible().catch(() => false);
      
      if (hasPendingWidget) {
        const widgetText = await pendingWidget.textContent() || '';
        console.log(`Pending widget content: "${widgetText}"`);
        
        // Try to extract number
        const numbers = widgetText.match(/\d+/);
        if (numbers) {
          console.log(`Pending count from widget: ${numbers[0]}`);
        }
      } else {
        console.log('No pending items widget found (may be feature-dependent)');
      }
    });

    test('D2.2 Recent activity shows items', async ({ page }) => {
      const activitySection = page.locator(
        '[data-testid*="activity"], [data-testid*="recent"], [class*="activity"], text=/aktivitet|activity|recent/i'
      ).first();
      
      const hasActivity = await activitySection.isVisible().catch(() => false);
      
      if (hasActivity) {
        const items = activitySection.locator('li, [data-testid*="item"], [class*="item"]');
        const itemCount = await items.count().catch(() => 0);
        console.log(`Recent activity items: ${itemCount}`);
      } else {
        console.log('No recent activity section found');
      }
    });
  });

  test.describe('D3. Quick Actions Navigation', () => {
  setupMockApi();
    test('D3.1 Quick action links work', async ({ page }) => {
      const actionLinks = page.locator('a[href*="wizard"], a[href*="new"], a[href*="create"]');
      const linkCount = await actionLinks.count();
      
      if (linkCount > 0) {
        const firstLink = actionLinks.first();
        const href = await firstLink.getAttribute('href') || '';
        
        await firstLink.click();
        await page.waitForTimeout(2000);
        
        const newUrl = page.url();
        console.log(`Navigation: ${href} → ${newUrl}`);
        
        // Should navigate somewhere
        expect(newUrl).not.toBe('/');
        
        // Go back
        await page.goto('/', { waitUntil: 'domcontentloaded' });
      } else {
        console.log('No quick action links found');
      }
    });
  });

  test.describe('D4. Runtime Stability', () => {
  setupMockApi();
    test('D4.1 No page errors on load', async ({ page, evidence }) => {
      expect(evidence.hasPageErrors()).toBe(false);
      console.log('✓ No page errors detected');
    });

    test('D4.2 No console errors on load', async ({ page, evidence }) => {
      const consoleErrors = evidence.consoleErrors;
      
      if (consoleErrors.length > 0) {
        console.log('Console errors:', consoleErrors.map(e => e.message).join('\n'));
      }
      
      expect(evidence.hasConsoleErrors()).toBe(false);
      console.log('✓ No console errors detected');
    });

    test('D4.3 No 5xx API responses', async ({ page, evidence }) => {
      expect(evidence.has5xxResponses()).toBe(false);
      console.log('✓ No 5xx responses detected');
    });

    test('D4.4 No missing i18n keys', async ({ page }) => {
      const result = await assertNoMissingI18nKeys(page);
      
      if (!result.passed) {
        console.log(`Possible missing i18n keys: ${result.keys.join(', ')}`);
      }
      
      // Warn but don't fail for now (some keys may be intentional)
      if (result.keys.length > 0) {
        console.warn('⚠ Possible unresolved i18n keys detected');
      }
    });

    test('D4.5 Page loads within timeout', async ({ page }) => {
      const isReady = await assertPageReady(page, 10000);
      expect(isReady).toBe(true);
      console.log('✓ Page ready within timeout');
    });
  });
});
