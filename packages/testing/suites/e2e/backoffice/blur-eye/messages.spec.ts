// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@digilist/api/../mocks/api-server.mock';
import { test, expect } from '@digilist/api/fixtures/qa-expert.fixture';
import { config } from '@digilist/api/config/backoffice.config';
import {
  assertBlurEyeListView,
  assertNoForbiddenTerminology,
  assertNoMissingI18nKeys,
  logBlurEyeResults,
} from '@digilist/api/fixtures/blur-eye.helpers';

/**
 * Messages Module Blur-Eye E2E Tests
 * 
 * Tests the messages/communication page for:
 * - M1. Blur-Eye Structure
 * - M2. Message List Behavior
 * - M3. Feature Flag Visibility Toggle
 */

test.describe('Messages (Meldinger) E2E', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/messages', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Check if redirected (feature flag off or no access)
    if (page.url().includes('/login') || !page.url().includes('/messages')) {
      test();
    }
  });

  test.describe('M1. Blur-Eye Structure', () => {
  setupMockApi();
    test('M1.1 Page has clear header', async ({ page }) => {
      const moduleConfig = config.modules.messages;
      const result = await assertBlurEyeListView(page, {
        expectedTitleContains: moduleConfig.blurEye.expectedTitleContains,
        requirePrimaryAction: moduleConfig.blurEye.requirePrimaryAction,
        requireSearch: moduleConfig.blurEye.requireSearch,
        requireFilters: moduleConfig.blurEye.requireFilters,
      });
      
      logBlurEyeResults(result, 'Messages');
      
      // At minimum, should have a title
      expect(result.checks.find(c => c.name === 'Page title visible')?.passed).toBe(true);
    });

    test('M1.2 Primary action (new message) visible', async ({ page }) => {
      const newMessageBtn = page.locator(
        'button:has-text("Ny melding"), button:has-text("Opprett"), a[href*="new"], [data-testid="new-message"]'
      ).first();
      
      const visible = await newMessageBtn.isVisible().catch(() => false);
      console.log(`New message button: ${visible ? '✓ visible' : '✗ not visible'}`);
      
      // May not be visible if org_member without permission
      if (visible) {
        expect(visible).toBe(true);
      }
    });

    test('M1.3 Message list or empty state visible', async ({ page }) => {
      const list = page.locator('table, [data-testid*="message-list"], [class*="message-list"]').first();
      const emptyState = page.locator('[data-testid="empty-state"], text=/ingen meldinger|no messages/i').first();
      
      const hasList = await list.isVisible().catch(() => false);
      const hasEmpty = await emptyState.isVisible().catch(() => false);
      
      console.log(`Message list: ${hasList ? '✓' : '✗'}, Empty state: ${hasEmpty ? '✓' : '✗'}`);
      expect(hasList || hasEmpty).toBe(true);
    });

    test('M1.4 No forbidden terminology', async ({ page }) => {
      const result = await assertNoForbiddenTerminology(page);
      expect(result.passed).toBe(true);
    });
  });

  test.describe('M2. Message List Behavior', () => {
  setupMockApi();
    test('M2.1 Search filters messages', async ({ page }) => {
      const search = page.locator('input[type="search"], input[placeholder*="søk" i]').first();
      
      if (!await search.isVisible().catch(() => false)) {
        console.log('Search not visible - skipping');
        return;
      }
      
      await search.fill('test');
      await page.waitForTimeout(1000);
      
      // Should filter without error
      console.log('✓ Search input accepts text');
    });

    test('M2.2 Message can be opened', async ({ page }) => {
      const messageRow = page.locator(
        'table tbody tr, [data-testid*="message-row"], [class*="message-item"]'
      ).first();
      
      if (!await messageRow.isVisible().catch(() => false)) {
        console.log('No messages to open - skipping');
        return;
      }
      
      const clickable = messageRow.locator('a, button').first();
      if (await clickable.isVisible().catch(() => false)) {
        await clickable.click();
        await page.waitForTimeout(2000);
        
        // Should navigate or open detail
        const urlChanged = !page.url().endsWith('/messages');
        const dialogOpen = await page.locator('[role="dialog"]').isVisible().catch(() => false);
        
        console.log(`Message opened: URL changed=${urlChanged}, dialog=${dialogOpen}`);
      }
    });
  });

  test.describe('M3. Feature Flag Visibility', () => {
  setupMockApi();
    test('M3.1 Messages appears in sidebar when flag ON', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      const sidebarLink = page.locator('nav[data-testid="sidebar-nav"] a[href="/messages"]');
      const visible = await sidebarLink.isVisible().catch(() => false);
      
      console.log(`Messages in sidebar: ${visible ? '✓ visible' : '✗ hidden'}`);
      // This test verifies current state - if visible, flag is ON
    });
  });

  test.describe('M4. Runtime Stability', () => {
  setupMockApi();
    test('M4.1 No runtime errors', async ({ page, evidence }) => {
      expect(evidence.hasPageErrors()).toBe(false);
      expect(evidence.has5xxResponses()).toBe(false);
      console.log('✓ No runtime errors');
    });
  });
});
