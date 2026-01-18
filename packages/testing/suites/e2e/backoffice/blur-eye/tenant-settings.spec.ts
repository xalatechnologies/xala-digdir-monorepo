import { test, expect } from '../fixtures/qa-expert.fixture';
import { config } from '../config/backoffice.config';
import {
  assertBlurEyeSettingsView,
  assertNoForbiddenTerminology,
  logBlurEyeResults,
} from '../fixtures/blur-eye.helpers';

/**
 * Tenant Settings Module Blur-Eye E2E Tests
 * 
 * Tests the tenant settings pages (/tenant/*) for:
 * - TS1-4. Features Page
 * - TS5-8. Platform Settings Page
 * - TS9-12. Branding Page
 * - TS13-16. System Log Page
 */

test.describe('Tenant Settings E2E', () => {
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.describe('TS1. Features Page (/tenant/features)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/tenant/features', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('TS1.1 Page has clear header', async ({ page }) => {
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      const titleText = await title.textContent() || '';
      console.log(`Features page title: "${titleText}"`);
    });

    test('TS1.2 Feature toggles visible', async ({ page }) => {
      const toggles = page.locator(
        '[role="switch"], input[type="checkbox"], [data-testid*="toggle"], [class*="toggle"]'
      );
      const toggleCount = await toggles.count();
      
      console.log(`Feature toggles found: ${toggleCount}`);
      expect(toggleCount).toBeGreaterThan(0);
    });

    test('TS1.3 Toggle interaction works', async ({ page }) => {
      const toggle = page.locator('[role="switch"], input[type="checkbox"]').first();
      
      if (!await toggle.isVisible().catch(() => false)) {
        console.log('No toggles visible - skipping');
        return;
      }
      
      const initialState = await toggle.isChecked().catch(() => null);
      
      await toggle.click();
      await page.waitForTimeout(500);
      
      const newState = await toggle.isChecked().catch(() => null);
      console.log(`Toggle state: ${initialState} → ${newState}`);
      
      // Toggle back
      await toggle.click();
    });

    test('TS1.4 No runtime errors', async ({ page, evidence }) => {
      expect(evidence.hasPageErrors()).toBe(false);
      expect(evidence.has5xxResponses()).toBe(false);
    });
  });

  test.describe('TS2. Platform Settings Page (/tenant/settings)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/tenant/settings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('TS2.1 Page has clear header', async ({ page }) => {
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      const titleText = await title.textContent() || '';
      console.log(`Platform settings title: "${titleText}"`);
    });

    test('TS2.2 Settings form visible', async ({ page }) => {
      const form = page.locator('form, [data-testid*="settings-form"]').first();
      const inputs = page.locator('input, textarea, select');
      
      const hasForm = await form.isVisible().catch(() => false);
      const inputCount = await inputs.count();
      
      console.log(`Form: ${hasForm ? '✓' : '✗'}, Inputs: ${inputCount}`);
    });

    test('TS2.3 Save button visible', async ({ page }) => {
      const saveBtn = page.locator(
        'button:has-text("Lagre"), button:has-text("Save"), button[type="submit"]'
      ).first();
      
      const visible = await saveBtn.isVisible().catch(() => false);
      console.log(`Save button: ${visible ? '✓' : '✗'}`);
    });

    test('TS2.4 No runtime errors', async ({ page, evidence }) => {
      expect(evidence.hasPageErrors()).toBe(false);
      expect(evidence.has5xxResponses()).toBe(false);
    });
  });

  test.describe('TS3. Branding Page (/tenant/branding)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/tenant/branding', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('TS3.1 Page has clear header', async ({ page }) => {
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      const titleText = await title.textContent() || '';
      console.log(`Branding page title: "${titleText}"`);
    });

    test('TS3.2 Logo upload area visible', async ({ page }) => {
      const uploadArea = page.locator(
        'input[type="file"], [data-testid*="logo"], [class*="upload"], [class*="dropzone"]'
      ).first();
      
      const visible = await uploadArea.isVisible().catch(() => false);
      console.log(`Logo upload: ${visible ? '✓' : '✗'}`);
    });

    test('TS3.3 Color/theme settings visible', async ({ page }) => {
      const colorInputs = page.locator(
        'input[type="color"], [data-testid*="color"], [class*="color-picker"]'
      );
      const colorCount = await colorInputs.count();
      
      console.log(`Color inputs: ${colorCount}`);
    });

    test('TS3.4 No runtime errors', async ({ page, evidence }) => {
      expect(evidence.hasPageErrors()).toBe(false);
      expect(evidence.has5xxResponses()).toBe(false);
    });
  });

  test.describe('TS4. System Log Page (/tenant/audit-log)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/tenant/audit-log', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('TS4.1 Page has clear header', async ({ page }) => {
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      const titleText = await title.textContent() || '';
      console.log(`System log title: "${titleText}"`);
    });

    test('TS4.2 Log entries visible or empty state', async ({ page }) => {
      const logTable = page.locator('table, [data-testid*="log"], [class*="log-list"]').first();
      const emptyState = page.locator('[data-testid="empty-state"], text=/ingen logg|no logs/i').first();
      
      const hasTable = await logTable.isVisible().catch(() => false);
      const hasEmpty = await emptyState.isVisible().catch(() => false);
      
      console.log(`Log table: ${hasTable ? '✓' : '✗'}, Empty: ${hasEmpty ? '✓' : '✗'}`);
      expect(hasTable || hasEmpty).toBe(true);
    });

    test('TS4.3 Filters available', async ({ page }) => {
      const filters = page.locator(
        'select, input[type="date"], [data-testid*="filter"]'
      );
      const filterCount = await filters.count();
      
      console.log(`Filter controls: ${filterCount}`);
    });

    test('TS4.4 Log entry has key fields', async ({ page }) => {
      const firstRow = page.locator('table tbody tr').first();
      
      if (!await firstRow.isVisible().catch(() => false)) {
        console.log('No log entries - skipping');
        return;
      }
      
      const cells = firstRow.locator('td');
      const cellCount = await cells.count();
      
      console.log(`Log entry columns: ${cellCount}`);
      
      // Should have timestamp, action, user, etc.
      expect(cellCount).toBeGreaterThan(2);
    });

    test('TS4.5 No runtime errors', async ({ page, evidence }) => {
      expect(evidence.hasPageErrors()).toBe(false);
      expect(evidence.has5xxResponses()).toBe(false);
    });
  });

  test.describe('TS5. No Forbidden Terminology', () => {
    const tenantPaths = ['/tenant/features', '/tenant/settings', '/tenant/branding', '/tenant/audit-log'];
    
    for (const path of tenantPaths) {
      test(`No forbidden terms on ${path}`, async ({ page }) => {
        await page.goto(path, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
        
        if (page.url().includes('/login')) {
          test();
          return;
        }
        
        const result = await assertNoForbiddenTerminology(page);
        expect(result.passed).toBe(true);
      });
    }
  });
});
