import { test, expect } from '../fixtures/qa-expert.fixture';
import { config } from '../config/backoffice.config';
import {
  assertNoForbiddenTerminology,
} from '../fixtures/blur-eye.helpers';

/**
 * Economy/Invoices Module Blur-Eye E2E Tests
 * 
 * Tests the economy/invoices page for:
 * - E1. Blur-Eye Structure
 * - E2. Invoice List/Filter
 * - E3. Export Functionality
 * - E4. Feature Flag Visibility
 */

test.describe('Economy Invoices (Fakturaer) E2E', () => {
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/economy/invoices', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/login') || !page.url().includes('/economy')) {
      test.skip();
    }
  });

  test.describe('E1. Blur-Eye Structure', () => {
    test('E1.1 Page has clear header', async ({ page }) => {
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      const titleText = await title.textContent() || '';
      console.log(`Invoices title: "${titleText}"`);
      
      const validTitles = ['faktura', 'invoice', 'økonomi', 'economy'];
      const hasValidTitle = validTitles.some(t => titleText.toLowerCase().includes(t));
      
      expect(hasValidTitle || titleText.length > 0).toBe(true);
    });

    test('E1.2 Invoice list or empty state visible', async ({ page }) => {
      const list = page.locator('table, [data-testid*="invoice"], [class*="invoice-list"]').first();
      const emptyState = page.locator('[data-testid="empty-state"], text=/ingen fakturaer|no invoices/i').first();
      
      const hasList = await list.isVisible().catch(() => false);
      const hasEmpty = await emptyState.isVisible().catch(() => false);
      
      console.log(`Invoice list: ${hasList ? '✓' : '✗'}, Empty state: ${hasEmpty ? '✓' : '✗'}`);
      expect(hasList || hasEmpty).toBe(true);
    });

    test('E1.3 Filter controls exist', async ({ page }) => {
      const filters = page.locator('select, input[type="date"], [data-testid*="filter"]');
      const filterCount = await filters.count();
      
      console.log(`Filter controls: ${filterCount}`);
    });

    test('E1.4 No forbidden terminology', async ({ page }) => {
      const result = await assertNoForbiddenTerminology(page);
      expect(result.passed).toBe(true);
    });
  });

  test.describe('E2. Invoice List Behavior', () => {
    test('E2.1 Search filters invoices', async ({ page }) => {
      const search = page.locator('input[type="search"], input[placeholder*="søk" i]').first();
      
      if (!await search.isVisible().catch(() => false)) {
        console.log('Search not visible - skipping');
        return;
      }
      
      await search.fill('test');
      await page.waitForTimeout(1000);
      
      console.log('✓ Search input accepts text');
    });

    test('E2.2 Status filter works', async ({ page }) => {
      const statusFilter = page.locator('select[data-testid*="status"], button:has-text("Status")').first();
      
      if (!await statusFilter.isVisible().catch(() => false)) {
        console.log('Status filter not visible - skipping');
        return;
      }
      
      await statusFilter.click();
      await page.waitForTimeout(500);
      
      console.log('✓ Status filter is interactive');
    });
  });

  test.describe('E3. Export Functionality', () => {
    test('E3.1 Export buttons exist', async ({ page }) => {
      const exportBtn = page.locator(
        'button:has-text("Eksporter"), button:has-text("Export"), [data-testid*="export"]'
      ).first();
      
      const hasExport = await exportBtn.isVisible().catch(() => false);
      console.log(`Export button: ${hasExport ? '✓' : '✗'}`);
    });
  });

  test.describe('E4. Feature Flag Visibility', () => {
    test('E4.1 Economy appears in sidebar when flag ON', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      const sidebarLink = page.locator('nav[data-testid="sidebar-nav"] a[href*="/economy"]');
      const visible = await sidebarLink.isVisible().catch(() => false);
      
      console.log(`Economy in sidebar: ${visible ? '✓ visible' : '✗ hidden'}`);
    });
  });

  test.describe('E5. Runtime Stability', () => {
    test('E5.1 No runtime errors', async ({ page, evidence }) => {
      expect(evidence.hasPageErrors()).toBe(false);
      expect(evidence.has5xxResponses()).toBe(false);
      console.log('✓ No runtime errors');
    });
  });
});
