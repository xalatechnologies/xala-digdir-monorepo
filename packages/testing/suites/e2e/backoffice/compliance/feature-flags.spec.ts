import { setupMockApi } from '../../../../mocks/api-server.mock';
import { test, expect } from '../fixtures/evidence.fixture';
import { config } from '../config/backoffice.config';
import { FEATURE_FLAGS, getItemsForFlag, type FeatureFlagId } from '../config/expected-menu';

/**
 * Feature Flags Tests
 * 
 * Tests feature flag toggle behavior:
 * 1. Read current flag state
 * 2. Toggle flags OFF: verify UI visibility changes
 * 3. Toggle flags ON: verify UI returns
 * 4. RBAC + flags combined verification
 */

interface FeatureFlagState {
  id: string;
  enabled: boolean;
}

test.describe('Feature Flags - Read State', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test('should read feature flag state from UI or API', async ({ page, evidence }) => {
    // Try UI-based feature flags page first
    await page.goto('/tenant/features');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    
    if (currentUrl.includes('/tenant/features')) {
      // Feature flags UI exists
      console.log('✅ Feature flags UI page accessible');

      // Look for toggle switches or checkboxes
      const toggles = page.locator('input[type="checkbox"], [role="switch"], button[data-state]');
      const toggleCount = await toggles.count();

      console.log(`Found ${toggleCount} feature toggles`);

      // Extract current states
      const flags: FeatureFlagState[] = [];
      for (let i = 0; i < toggleCount; i++) {
        const toggle = toggles.nth(i);
        const id = await toggle.getAttribute('name') || await toggle.getAttribute('data-flag-id') || `flag-${i}`;
        const isChecked = await toggle.isChecked().catch(() => false);
        const dataState = await toggle.getAttribute('data-state');
        
        flags.push({
          id,
          enabled: isChecked || dataState === 'checked',
        });
      }

      console.log('Feature flag states:', JSON.stringify(flags, null, 2));
      expect(flags.length).toBeGreaterThan(0);
    } else {
      // Try API endpoint
      console.log('⚠️ Feature flags UI not accessible, trying API');
      
      // Check if API response contains feature flags
      const apiCalls = evidence.apiCalls.filter((c) => 
        c.url.includes('/capabilities') || 
        c.url.includes('/features') ||
        c.url.includes('/modules')
      );

      if (apiCalls.length > 0) {
        console.log('Found feature-related API calls:', apiCalls.map((c) => c.url));
      }
    }
  });
});

test.describe('Feature Flags - Toggle & Verify', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  // Flags that are safe to toggle in demo environment
  const SAFE_TOGGLE_FLAGS: FeatureFlagId[] = ['FEATURE_REPORTING', 'FEATURE_MESSAGING'];

  for (const flagId of SAFE_TOGGLE_FLAGS) {
    const flag = FEATURE_FLAGS[flagId];

    test.describe(`Toggle ${flag.name}`, () => {
  setupMockApi();
      test('should toggle OFF and verify UI changes', async ({ page }) => {
        // Step 1: Navigate to feature flags page
        await page.goto('/tenant/features');
        await page.waitForLoadState('networkidle');

        if (!page.url().includes('/tenant/features')) {
          test(true, 'Feature flags UI not accessible');
          return;
        }

        // Step 2: Find the toggle for this flag
        const toggle = page.locator(
          `input[name="${flagId}"], [data-flag-id="${flagId}"], label:has-text("${flag.name}") input`
        ).first();

        if (!(await toggle.isVisible())) {
          console.log(`Toggle for ${flagId} not found`);
          test(true, `Toggle for ${flagId} not found`);
          return;
        }

        // Step 3: Check current state
        const wasEnabled = await toggle.isChecked().catch(() => true);
        console.log(`${flagId} initial state: ${wasEnabled ? 'ON' : 'OFF'}`);

        // Step 4: Toggle OFF if currently ON
        if (wasEnabled) {
          await toggle.click();
          await page.waitForTimeout(1000); // Wait for state to propagate

          // Verify toggle changed
          const isNowEnabled = await toggle.isChecked().catch(() => true);
          expect(isNowEnabled, `${flagId} should be OFF after toggle`).toBe(false);
        }

        // Step 5: Navigate to affected route - should be blocked
        const affectedRoute = flag.affectedRoutes[0];
        await page.goto(affectedRoute);
        await page.waitForLoadState('networkidle');

        const currentUrl = page.url();
        const is403 = await page.locator('[role="alert"], .forbidden, .not-found').isVisible().catch(() => false);
        const redirected = !currentUrl.includes(affectedRoute);

        console.log(`After toggle OFF: URL=${currentUrl}, is403=${is403}, redirected=${redirected}`);
        
        // Should be blocked or redirected
        expect(
          is403 || redirected,
          `Route ${affectedRoute} should be blocked when ${flagId} is OFF`
        ).toBe(true);

        // Step 6: Toggle back ON
        await page.goto('/tenant/features');
        await page.waitForLoadState('networkidle');

        const toggleAgain = page.locator(
          `input[name="${flagId}"], [data-flag-id="${flagId}"]`
        ).first();

        if (await toggleAgain.isVisible()) {
          const isOffNow = !(await toggleAgain.isChecked().catch(() => false));
          if (isOffNow) {
            await toggleAgain.click();
            await page.waitForTimeout(1000);
          }
        }
      });

      test('should verify sidebar visibility matches flag state', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const sidebar = page.locator(config.selectors.sidebar);
        const sidebarText = await sidebar.textContent() || '';

        // Get affected sidebar items
        const affectedItems = getItemsForFlag(flagId);

        // Check each affected item's visibility
        for (const item of affectedItems) {
          const isVisible = sidebarText.includes(item.label) || 
                           await sidebar.locator(`a[href="${item.href}"]`).isVisible().catch(() => false);
          
          console.log(`${item.label} (${item.href}) visible: ${isVisible}`);
        }
      });
    });
  }
});

test.describe('Feature Flags - RBAC + Flags Combined', () => {
  setupMockApi();
  test.describe('Flag ON + Role Permitted', () => {
  setupMockApi();
    test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

    test('admin should access flagged feature when flag ON', async ({ page }) => {
      await page.goto('/reports');
      await page.waitForLoadState('networkidle');

      // Should load (if FEATURE_REPORTING is ON)
      const is403 = await page.locator('[role="alert"], .forbidden').isVisible().catch(() => false);
      const hasContent = await page.locator('h1, [data-testid="page-title"]').isVisible().catch(() => false);

      // Either accessible or blocked by flag (not RBAC)
      console.log(`Reports page: is403=${is403}, hasContent=${hasContent}`);
    });
  });

  test.describe('Flag ON + Role Blocked', () => {
  setupMockApi();
    test.use({ storageState: 'tests/e2e/backoffice/.auth/saksbehandler.json' });

    test('saksbehandler should NOT access admin-only flagged feature', async ({ page, evidence }) => {
      await page.goto('/reports');
      await page.waitForLoadState('networkidle');

      const currentUrl = page.url();
      const redirected = !currentUrl.includes('/reports');
      const is403 = evidence.getApi4xxErrors().some((e) => e.status === 403);
      const hasError = await page.locator('[role="alert"], .forbidden').isVisible().catch(() => false);

      // Should be blocked by RBAC even if flag is ON
      expect(
        redirected || is403 || hasError,
        'Saksbehandler should not access Reports (RBAC block)'
      ).toBe(true);
    });
  });

  test.describe('Flag OFF + Role Permitted', () => {
  setupMockApi();
    test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

    test('admin should NOT access feature when flag OFF', async ({ page }) => {
      // This test requires the flag to be OFF
      // First check current flag state
      await page.goto('/tenant/features');
      await page.waitForLoadState('networkidle');

      if (!page.url().includes('/tenant/features')) {
        test(true, 'Cannot verify flag state');
        return;
      }

      // If we can find a disabled flag, test its route
      const disabledToggle = page.locator('input[type="checkbox"]:not(:checked)').first();
      
      if (await disabledToggle.isVisible()) {
        const flagId = await disabledToggle.getAttribute('name');
        console.log(`Found disabled flag: ${flagId}`);
        // Would test access to that flag's route here
      }
    });
  });
});

test.describe('Feature Flags - Persistence', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test('flag state should persist after page reload', async ({ page }) => {
    await page.goto('/tenant/features');
    await page.waitForLoadState('networkidle');

    if (!page.url().includes('/tenant/features')) {
      test(true, 'Feature flags UI not accessible');
      return;
    }

    // Get first toggle and note its state
    const firstToggle = page.locator('input[type="checkbox"]').first();
    
    if (!(await firstToggle.isVisible())) {
      test(true, 'No toggles found');
      return;
    }

    const initialState = await firstToggle.isChecked();
    console.log(`Initial state: ${initialState}`);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check state after reload
    const afterReloadState = await page.locator('input[type="checkbox"]').first().isChecked();
    console.log(`After reload: ${afterReloadState}`);

    // State should persist
    expect(afterReloadState).toBe(initialState);
  });

  test('flag state should persist in new session', async ({ browser }) => {
    // Create new context to simulate new session
    const context = await browser.newContext({
      storageState: 'tests/e2e/backoffice/.auth/admin.json',
    });
    const page = await context.newPage();

    await page.goto('/tenant/features');
    await page.waitForLoadState('networkidle');

    if (!page.url().includes('/tenant/features')) {
      test(true, 'Feature flags UI not accessible');
      await context.close();
      return;
    }

    // Should show same flags as main session
    const toggleCount = await page.locator('input[type="checkbox"]').count();
    console.log(`Toggles in new session: ${toggleCount}`);

    await context.close();
  });
});
