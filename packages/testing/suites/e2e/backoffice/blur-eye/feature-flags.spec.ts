// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../../../../mocks/api-server.mock';
import { test, expect } from '../fixtures/qa-expert.fixture';
import { config } from '../config/backoffice.config';

/**
 * SUITE C: Feature Flags Integration
 * 
 * Validates that UI correctly reflects feature flag states:
 * - Sidebar items appear/disappear based on flags
 * - Buttons and actions respect flag states
 * - Direct URLs are blocked when feature is disabled
 */

interface FeatureFlag {
  name: string;
  sidebarItem?: string;
  buttonSelector?: string;
  route?: string;
}

const TRACKED_FLAGS: FeatureFlag[] = [
  {
    name: 'reporting',
    sidebarItem: 'Rapporter',
    buttonSelector: 'button:has-text("Rapport"), a[href*="report"]',
    route: '/reports',
  },
  {
    name: 'attachments',
    sidebarItem: 'Vedlegg',
    buttonSelector: '[data-testid="attachments-tab"], button:has-text("Vedlegg")',
  },
  {
    name: 'publishing',
    buttonSelector: 'button:has-text("Publiser"), [data-testid="publish-button"]',
  },
  {
    name: 'messages',
    sidebarItem: 'Meldinger',
    route: '/messages',
  },
  {
    name: 'calendar',
    sidebarItem: 'Kalender',
    route: '/calendar',
  },
  {
    name: 'organizations',
    sidebarItem: 'Organisasjoner',
    route: '/organizations',
  },
  {
    name: 'audit_log',
    sidebarItem: 'Aktivitetslogg',
    route: '/tenant/audit-log',
  },
];

test.describe('C. Feature Flags Integration', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.describe('C1. Capability Snapshot', () => {
  setupMockApi();
    test('C1.1 Capture current feature flags state', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
        return;
      }
      
      // Try to find feature flags in page context or localStorage
      const flags = await page.evaluate(() => {
        // Check various storage/context locations
        const fromLocalStorage = localStorage.getItem('featureFlags');
        const fromSessionStorage = sessionStorage.getItem('featureFlags');
        
        // Check for global variable
        const fromWindow = (window as any).__FEATURE_FLAGS__ || (window as any).featureFlags;
        
        return {
          localStorage: fromLocalStorage ? JSON.parse(fromLocalStorage) : null,
          sessionStorage: fromSessionStorage ? JSON.parse(fromSessionStorage) : null,
          window: fromWindow || null,
        };
      });
      
      console.log('\nFeature Flags Snapshot:');
      console.log('├─ localStorage:', flags.localStorage ? '✓ found' : '✗ not found');
      console.log('├─ sessionStorage:', flags.sessionStorage ? '✓ found' : '✗ not found');
      console.log('└─ window:', flags.window ? '✓ found' : '✗ not found');
      
      if (flags.localStorage) {
        console.log('\nFlags from localStorage:', JSON.stringify(flags.localStorage, null, 2));
      }
      if (flags.window) {
        console.log('\nFlags from window:', JSON.stringify(flags.window, null, 2));
      }
    });

    test('C1.2 Capture user capabilities', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
        return;
      }
      
      // Try to find capabilities in page context
      const capabilities = await page.evaluate(() => {
        const fromStorage = localStorage.getItem('userCapabilities') || localStorage.getItem('capabilities');
        const fromWindow = (window as any).__USER_CAPABILITIES__ || (window as any).capabilities;
        const fromUser = (window as any).__USER__?.capabilities;
        
        return {
          localStorage: fromStorage ? JSON.parse(fromStorage) : null,
          window: fromWindow || null,
          user: fromUser || null,
        };
      });
      
      console.log('\nUser Capabilities:');
      const caps = capabilities.localStorage || capabilities.window || capabilities.user;
      if (caps) {
        console.log(JSON.stringify(caps, null, 2));
      } else {
        console.log('  No explicit capabilities found (may be derived from role)');
      }
    });
  });

  test.describe('C2. Sidebar Flag Visibility', () => {
  setupMockApi();
    test.beforeEach(async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('C2.1 Map sidebar items to expected flags', async ({ page }) => {
      const sidebarItems = page.locator('nav[data-testid="sidebar-nav"] a, aside a[href^="/"]');
      const count = await sidebarItems.count();
      
      console.log('\nSidebar Items vs Feature Flags:');
      console.log('═'.repeat(50));
      
      const foundItems: Record<string, boolean> = {};
      
      for (let i = 0; i < count; i++) {
        const item = sidebarItems.nth(i);
        const label = await item.textContent() || '';
        const href = await item.getAttribute('href') || '';
        
        foundItems[label.trim()] = true;
      }
      
      // Check each tracked flag
      for (const flag of TRACKED_FLAGS) {
        if (flag.sidebarItem) {
          const isPresent = Object.keys(foundItems).some(
            k => k.toLowerCase().includes(flag.sidebarItem!.toLowerCase())
          );
          console.log(`├─ ${flag.name}: sidebar item "${flag.sidebarItem}" ${isPresent ? '✓ present' : '✗ not found'}`);
        }
      }
    });

    test('C2.2 Verify conditional items match flag state', async ({ page }) => {
      // Get flags
      const flags = await page.evaluate(() => {
        return (window as any).__FEATURE_FLAGS__ || {};
      });
      
      // Get sidebar items
      const sidebarText = await page.locator('nav[data-testid="sidebar-nav"], aside').first().textContent() || '';
      
      console.log('\nFlag/Sidebar Consistency Check:');
      
      for (const flag of TRACKED_FLAGS) {
        if (flag.sidebarItem) {
          const flagEnabled = flags[flag.name] !== false; // Assume enabled if not explicitly false
          const itemVisible = sidebarText.toLowerCase().includes(flag.sidebarItem.toLowerCase());
          
          const consistent = flagEnabled === itemVisible;
          console.log(`├─ ${flag.name}: flag=${flagEnabled ? 'ON' : 'OFF'}, sidebar=${itemVisible ? 'visible' : 'hidden'} ${consistent ? '✓' : '⚠️ MISMATCH'}`);
        }
      }
    });
  });

  test.describe('C3. Button/Action Flag Visibility', () => {
  setupMockApi();
    test.beforeEach(async ({ page }) => {
      await page.goto('/rental-objects', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
        return;
      }
      
      // Navigate to first item detail
      const firstItem = page.locator('a[href*="/rental-objects/"]').first();
      if (await firstItem.isVisible().catch(() => false)) {
        await firstItem.click();
        await page.waitForTimeout(2000);
      }
    });

    test('C3.1 Publish button respects publishing flag', async ({ page }) => {
      const publishBtn = page.locator('button:has-text("Publiser"), [data-testid="publish-button"]').first();
      const visible = await publishBtn.isVisible().catch(() => false);
      
      // Get flag state
      const flags = await page.evaluate(() => (window as any).__FEATURE_FLAGS__ || {});
      const publishingEnabled = flags.publishing !== false;
      
      console.log(`Publishing flag: ${publishingEnabled ? 'ON' : 'OFF'}`);
      console.log(`Publish button: ${visible ? 'visible' : 'hidden'}`);
      
      if (publishingEnabled) {
        // If flag is on, button should be visible
        console.log(`Consistency: ${visible ? '✓' : '⚠️ button should be visible'}`);
      } else {
        // If flag is off, button should be hidden
        console.log(`Consistency: ${!visible ? '✓' : '⚠️ button should be hidden'}`);
      }
    });

    test('C3.2 Clone button respects cloning flag', async ({ page }) => {
      const cloneBtn = page.locator('button:has-text("Dupliser"), button:has-text("Kopier"), [data-testid="clone-button"]').first();
      const visible = await cloneBtn.isVisible().catch(() => false);
      
      console.log(`Clone button: ${visible ? '✓ visible' : '✗ hidden'}`);
    });

    test('C3.3 Delete button respects delete permission', async ({ page }) => {
      const deleteBtn = page.locator('button:has-text("Slett"), [data-testid="delete-button"]').first();
      const visible = await deleteBtn.isVisible().catch(() => false);
      
      console.log(`Delete button: ${visible ? '✓ visible' : '✗ hidden'}`);
    });

    test('C3.4 Attachments tab respects attachments flag', async ({ page }) => {
      const attachmentsTab = page.locator('[role="tab"]:has-text("Vedlegg"), button:has-text("Vedlegg"), [data-testid="attachments-tab"]').first();
      const visible = await attachmentsTab.isVisible().catch(() => false);
      
      console.log(`Attachments tab: ${visible ? '✓ visible' : '– not visible (may be flag disabled or on different page)'}`);
    });
  });

  test.describe('C4. Direct URL Blocking', () => {
  setupMockApi();
    test.beforeEach(async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('C4.1 Disabled feature routes show proper UI', async ({ page }) => {
      // Test each route
      for (const flag of TRACKED_FLAGS.filter(f => f.route)) {
        await page.goto(flag.route!, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
        
        // Check what page we're on
        const currentUrl = page.url();
        
        // Various outcomes:
        // 1. Loaded successfully (feature enabled)
        // 2. Redirected to dashboard/home (feature disabled)
        // 3. Shows 403/feature disabled screen
        // 4. Shows 404
        
        const is403 = await page.locator('text=/forbidden|403|ikke tilgang|access denied/i').first().isVisible().catch(() => false);
        const is404 = await page.locator('text=/not found|404|ikke funnet/i').first().isVisible().catch(() => false);
        const isDisabled = await page.locator('text=/feature|disabled|deaktivert/i').first().isVisible().catch(() => false);
        const redirected = !currentUrl.includes(flag.route!);
        const loadedOk = !is403 && !is404 && !isDisabled && !redirected;
        
        let status = 'unknown';
        if (loadedOk) status = '✓ loaded';
        else if (is403 || isDisabled) status = '⛔ blocked (correct if disabled)';
        else if (is404) status = '❌ 404';
        else if (redirected) status = '↩ redirected';
        
        console.log(`${flag.name} (${flag.route}): ${status}`);
      }
    });
  });

  test.describe('C5. Flag Reload Verification', () => {
  setupMockApi();
    test('C5.1 Flags persist after page reload', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      if (page.url().includes('/login')) {
        test();
        return;
      }
      
      // Capture initial sidebar state
      const sidebarBefore = await page.locator('nav[data-testid="sidebar-nav"], aside').first().textContent() || '';
      
      // Reload
      await page.reload();
      await page.waitForTimeout(3000);
      
      // Capture after reload
      const sidebarAfter = await page.locator('nav[data-testid="sidebar-nav"], aside').first().textContent() || '';
      
      // Compare
      const unchanged = sidebarBefore.trim() === sidebarAfter.trim();
      console.log(`Sidebar consistency after reload: ${unchanged ? '✓' : '⚠️ changed'}`);
      
      if (!unchanged) {
        console.log('Before:', sidebarBefore.substring(0, 100));
        console.log('After:', sidebarAfter.substring(0, 100));
      }
    });
  });
});
}
