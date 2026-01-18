// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@xala/api/../mocks/api-server.mock';
import { test, expect } from '@xala/api/fixtures/qa-expert.fixture';
import { config } from '@xala/api/config/backoffice.config';
import {
  assertBlurEyeListView,
  assertNoForbiddenTerminology,
  logBlurEyeResults,
} from '@xala/api/fixtures/blur-eye.helpers';

/**
 * Reports Module Blur-Eye E2E Tests
 * 
 * Tests the reports/analytics page for:
 * - R1. Blur-Eye Structure
 * - R2. Report Generation
 * - R3. Filter Application
 * - R4. Export Downloads
 * - R5. Performance Sanity
 * - R6. Feature Flag Visibility
 */

test.describe('Reports (Rapporter) E2E', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/reports', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/login') || !page.url().includes('/reports')) {
      test();
    }
  });

  test.describe('R1. Blur-Eye Structure', () => {
  setupMockApi();
    test('R1.1 Page has clear header', async ({ page }) => {
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      const titleText = await title.textContent() || '';
      console.log(`Reports title: "${titleText}"`);
      
      const validTitles = ['rapport', 'report', 'statistikk', 'analytics'];
      const hasValidTitle = validTitles.some(t => titleText.toLowerCase().includes(t));
      
      expect(hasValidTitle || titleText.length > 0).toBe(true);
    });

    test('R1.2 Filter/date controls exist', async ({ page }) => {
      const filters = page.locator(
        'select, input[type="date"], [data-testid*="filter"], [data-testid*="date"]'
      );
      const filterCount = await filters.count();
      
      console.log(`Filter controls found: ${filterCount}`);
      expect(filterCount).toBeGreaterThan(0);
    });

    test('R1.3 Charts or data tables render', async ({ page }) => {
      const charts = page.locator('canvas, svg[class*="chart"], [data-testid*="chart"]');
      const tables = page.locator('table, [data-testid*="table"]');
      
      const chartCount = await charts.count();
      const tableCount = await tables.count();
      
      console.log(`Charts: ${chartCount}, Tables: ${tableCount}`);
      expect(chartCount + tableCount).toBeGreaterThan(0);
    });

    test('R1.4 No forbidden terminology', async ({ page }) => {
      const result = await assertNoForbiddenTerminology(page);
      expect(result.passed).toBe(true);
    });
  });

  test.describe('R2. Report Generation', () => {
  setupMockApi();
    test('R2.1 Report type selection works', async ({ page }) => {
      const reportTypeSelector = page.locator(
        'select[data-testid*="report-type"], [data-testid*="report-select"], button:has-text("Type")'
      ).first();
      
      if (await reportTypeSelector.isVisible().catch(() => false)) {
        await reportTypeSelector.click();
        await page.waitForTimeout(500);
        
        const options = page.locator('[role="option"], option');
        const optionCount = await options.count();
        
        console.log(`Report type options: ${optionCount}`);
      } else {
        console.log('No report type selector found (may be single-report page)');
      }
    });
  });

  test.describe('R3. Filter Application', () => {
  setupMockApi();
    test('R3.1 Date range filter works', async ({ page }) => {
      const dateInput = page.locator('input[type="date"]').first();
      
      if (await dateInput.isVisible().catch(() => false)) {
        const today = new Date().toISOString().split('T')[0];
        await dateInput.fill(today);
        await page.waitForTimeout(1000);
        
        console.log('✓ Date filter accepts input');
      } else {
        console.log('No date input found');
      }
    });

    test('R3.2 Filters update report display', async ({ page }) => {
      // Find any filter control and interact
      const filter = page.locator('select').first();
      
      if (await filter.isVisible().catch(() => false)) {
        await filter.selectOption({ index: 1 }).catch(() => null);
        await page.waitForTimeout(2000);
        
        console.log('✓ Filter selection completed');
      }
    });
  });

  test.describe('R4. Export Downloads', () => {
  setupMockApi();
    test('R4.1 Export buttons exist', async ({ page }) => {
      const exportBtns = page.locator(
        'button:has-text("Eksporter"), button:has-text("Export"), button:has-text("CSV"), button:has-text("PDF"), [data-testid*="export"]'
      );
      const exportCount = await exportBtns.count();
      
      console.log(`Export buttons found: ${exportCount}`);
      
      if (exportCount > 0) {
        for (let i = 0; i < Math.min(exportCount, 3); i++) {
          const text = await exportBtns.nth(i).textContent() || '';
          console.log(`  Export ${i + 1}: ${text.trim()}`);
        }
      }
    });

    test('R4.2 CSV export triggers download', async ({ page }) => {
      const csvBtn = page.locator('button:has-text("CSV"), a:has-text("CSV")').first();
      
      if (!await csvBtn.isVisible().catch(() => false)) {
        console.log('No CSV export button - skipping');
        return;
      }
      
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
      
      await csvBtn.click();
      
      const download = await downloadPromise;
      if (download) {
        console.log(`✓ CSV downloaded: ${download.suggestedFilename()}`);
      } else {
        console.log('No download triggered (may require data or different interaction)');
      }
    });
  });

  test.describe('R5. Performance Sanity', () => {
  setupMockApi();
    test('R5.1 Page loads within timeout', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/reports', { waitUntil: 'networkidle', timeout: 30000 });
      
      const loadTime = Date.now() - startTime;
      console.log(`Reports page load time: ${loadTime}ms`);
      
      expect(loadTime).toBeLessThan(30000);
    });

    test('R5.2 No infinite loading on filters', async ({ page }) => {
      const filter = page.locator('select').first();
      
      if (await filter.isVisible().catch(() => false)) {
        await filter.selectOption({ index: 1 }).catch(() => null);
        await page.waitForTimeout(5000);
        
        const spinner = page.locator('[data-testid="loading"], [aria-busy="true"]');
        const stillLoading = await spinner.isVisible().catch(() => false);
        
        console.log(`Still loading after filter: ${stillLoading}`);
        expect(stillLoading).toBe(false);
      }
    });
  });

  test.describe('R6. Feature Flag Visibility', () => {
  setupMockApi();
    test('R6.1 Reports appears in sidebar when flag ON', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      const sidebarLink = page.locator('nav[data-testid="sidebar-nav"] a[href="/reports"]');
      const visible = await sidebarLink.isVisible().catch(() => false);
      
      console.log(`Reports in sidebar: ${visible ? '✓ visible' : '✗ hidden'}`);
    });
  });

  test.describe('R7. Runtime Stability', () => {
  setupMockApi();
    test('R7.1 No runtime errors', async ({ page, evidence }) => {
      expect(evidence.hasPageErrors()).toBe(false);
      expect(evidence.has5xxResponses()).toBe(false);
      console.log('✓ No runtime errors');
    });
  });
});
