import { setupMockApi } from '../../../../mocks/api-server.mock';
import { test, expect } from '../fixtures/evidence.fixture';
import { config } from '../config/backoffice.config';
import { EXPECTED_MENU_MODEL, MenuItem } from '../config/expected-menu';

/**
 * Menu Map Builder
 * 
 * Dynamically discovers sidebar structure and compares against expected model.
 * Produces a diff report for mismatches.
 */

interface DiscoveredMenuItem {
  label: string;
  href: string;
  section?: string;
}

interface MenuDiscoveryResult {
  items: DiscoveredMenuItem[];
  sections: string[];
  totalItems: number;
}

test.describe('Menu Map Builder', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test('should discover all sidebar items', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator(config.selectors.sidebar);
    await expect(sidebar).toBeVisible();

    // Extract all nav items
    const navItems = sidebar.locator('a[href]');
    const count = await navItems.count();

    const discovered: DiscoveredMenuItem[] = [];

    for (let i = 0; i < count; i++) {
      const item = navItems.nth(i);
      const href = await item.getAttribute('href') || '';
      const label = await item.textContent() || '';
      
      // Try to get section from parent
      const section = await item.evaluate((el) => {
        const sectionHeader = el.closest('div')?.querySelector('p[data-size="xs"]');
        return sectionHeader?.textContent || undefined;
      });

      discovered.push({
        label: label.trim(),
        href,
        section,
      });
    }

    console.log(`\n📍 DISCOVERED MENU ITEMS (${discovered.length}):`);
    console.log(JSON.stringify(discovered, null, 2));

    // Compare against expected model
    const expectedItems = EXPECTED_MENU_MODEL.flatMap((s) => s.items);
    
    const missing: MenuItem[] = [];
    const extra: DiscoveredMenuItem[] = [];

    // Find missing (expected but not found)
    for (const expected of expectedItems) {
      const found = discovered.some((d) => d.href === expected.href);
      if (!found) {
        missing.push(expected);
      }
    }

    // Find extra (found but not expected)
    for (const found of discovered) {
      const expected = expectedItems.some((e) => e.href === found.href);
      if (!expected && found.href && found.href !== '#') {
        extra.push(found);
      }
    }

    if (missing.length > 0) {
      console.log(`\n⚠️ MISSING ITEMS (expected but not visible):`);
      missing.forEach((m) => console.log(`  - ${m.label} (${m.href})`));
    }

    if (extra.length > 0) {
      console.log(`\n➕ EXTRA ITEMS (visible but not in expected model):`);
      extra.forEach((e) => console.log(`  - ${e.label} (${e.href})`));
    }

    // Store result for other tests
    const result: MenuDiscoveryResult = {
      items: discovered,
      sections: [...new Set(discovered.map((d) => d.section).filter(Boolean) as string[])],
      totalItems: discovered.length,
    };

    // Should have discovered items
    expect(discovered.length).toBeGreaterThan(5);
  });

  test('should extract section headers', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator(config.selectors.sidebar);
    
    // Find section headers (typically uppercase text)
    const sectionHeaders = sidebar.locator('p[data-size="xs"]');
    const headerCount = await sectionHeaders.count();

    const sections: string[] = [];
    for (let i = 0; i < headerCount; i++) {
      const text = await sectionHeaders.nth(i).textContent();
      if (text) {
        sections.push(text.trim());
      }
    }

    console.log(`\n📂 DISCOVERED SECTIONS (${sections.length}):`);
    sections.forEach((s) => console.log(`  - ${s}`));

    // Compare with expected sections
    const expectedSections = EXPECTED_MENU_MODEL.filter((s) => s.title).map((s) => s.title);

    console.log(`\n📋 EXPECTED SECTIONS (${expectedSections.length}):`);
    expectedSections.forEach((s) => console.log(`  - ${s}`));
  });

  test('should validate menu structure matches expected model', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator(config.selectors.sidebar);
    const navItems = sidebar.locator('a[href]');
    const count = await navItems.count();

    const discoveredHrefs = new Set<string>();
    for (let i = 0; i < count; i++) {
      const href = await navItems.nth(i).getAttribute('href');
      if (href) {
        discoveredHrefs.add(href);
      }
    }

    // Critical paths that must exist
    const criticalPaths = ['/', '/bookings', '/calendar'];
    
    for (const path of criticalPaths) {
      expect(
        discoveredHrefs.has(path),
        `Critical path "${path}" must be visible in sidebar`
      ).toBe(true);
    }
  });
});

test.describe('Menu Map Builder - Saksbehandler', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/saksbehandler.json' });

  test('should have restricted menu for saksbehandler', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator(config.selectors.sidebar);
    const navItems = sidebar.locator('a[href]');
    const count = await navItems.count();

    const discoveredHrefs = new Set<string>();
    for (let i = 0; i < count; i++) {
      const href = await navItems.nth(i).getAttribute('href');
      if (href) {
        discoveredHrefs.add(href);
      }
    }

    console.log(`\n🔒 SAKSBEHANDLER MENU (${count} items):`);
    discoveredHrefs.forEach((h) => console.log(`  - ${h}`));

    // Admin-only paths should NOT be visible
    const adminOnlyPaths = ['/settings', '/users-management', '/tenant/settings'];
    
    for (const path of adminOnlyPaths) {
      expect(
        discoveredHrefs.has(path),
        `Admin-only path "${path}" should NOT be visible to saksbehandler`
      ).toBe(false);
    }

    // Allowed paths should be visible
    const allowedPaths = ['/', '/bookings', '/work-queue'];
    
    for (const path of allowedPaths) {
      expect(
        discoveredHrefs.has(path),
        `Allowed path "${path}" should be visible to saksbehandler`
      ).toBe(true);
    }
  });
});
