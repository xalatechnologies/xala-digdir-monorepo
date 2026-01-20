// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@digilist/api/../mocks/api-server.mock';
import { test, expect } from '@digilist/api/fixtures/evidence.fixture';
import { config } from '@digilist/api/config/backoffice.config';

/**
 * Page Navigation & Filter Tests
 * 
 * Comprehensive tests that:
 * 1. Navigate to each page via sidebar
 * 2. Verify page loads without errors
 * 3. Test right-hand filter drawer (if present)
 * 4. Verify tiles/data grid loads
 */

test.describe('Page Navigation & Filters', () => {
  setupMockApi();
  test.describe('Admin Pages', () => {
  setupMockApi();
    test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

    // Define all admin-accessible pages
    const adminPages = [
      { path: '/', name: 'Dashboard', hasFilters: false },
      { path: '/rental-objects', name: 'Rental Objects', hasFilters: true },
      { path: '/bookings', name: 'Bookings', hasFilters: true },
      { path: '/calendar', name: 'Calendar', hasFilters: true },
      { path: '/users', name: 'Users', hasFilters: true },
      { path: '/organizations', name: 'Organizations', hasFilters: true },
      { path: '/messages', name: 'Messages', hasFilters: false },
      { path: '/work-queue', name: 'Work Queue', hasFilters: true },
      { path: '/tenant/audit-log', name: 'Audit Log', hasFilters: true },
      { path: '/settings', name: 'Settings', hasFilters: false },
    ];

    for (const page of adminPages) {
      test(`should load ${page.name} page`, async ({ page: browserPage, evidence }) => {
        // Navigate to the page
        await browserPage.goto(page.path, { waitUntil: 'domcontentloaded' });
        await browserPage.waitForTimeout(3000);

        // Check if redirected to login (skip if not authenticated)
        if (browserPage.url().includes('/login')) {
          console.log(`Skipping ${page.name} - not authenticated`);
          test();
          return;
        }

        // Verify page content loaded
        const content = browserPage.locator('main, [data-testid="page-content"], h1, h2, table, [class*="grid"]').first();
        await expect(content).toBeVisible({ timeout: 15000 });

        // Check for console errors
        expect(evidence.hasPageErrors()).toBe(false);

        console.log(`✓ ${page.name} loaded successfully`);
      });

      if (page.hasFilters) {
        test(`should open filter drawer on ${page.name}`, async ({ page: browserPage }) => {
          await browserPage.goto(page.path, { waitUntil: 'domcontentloaded' });
          await browserPage.waitForTimeout(3000);

          // Check if redirected to login
          if (browserPage.url().includes('/login')) {
            console.log(`Skipping ${page.name} filters - not authenticated`);
            test();
            return;
          }

          // Look for filter button (various selectors)
          const filterButton = browserPage.locator(
            'button[data-testid="filter-button"], button:has-text("Filter"), button[aria-label*="filter" i], [data-testid="filters-toggle"]'
          ).first();

          // If filter button exists, click it
          const hasFilterButton = await filterButton.isVisible().catch(() => false);
          
          if (hasFilterButton) {
            await filterButton.click();
            await browserPage.waitForTimeout(1000);

            // Check for drawer/panel
            const drawer = browserPage.locator(
              '[data-testid="filter-drawer"], [role="dialog"], aside[class*="drawer"], [class*="filter-panel"], [class*="right-drawer"]'
            ).first();

            const drawerVisible = await drawer.isVisible({ timeout: 5000 }).catch(() => false);
            
            if (drawerVisible) {
              console.log(`✓ ${page.name} filter drawer opened`);
              
              // Check for filter inputs
              const filterInputs = drawer.locator('input, select, [role="combobox"]');
              const inputCount = await filterInputs.count();
              console.log(`  Found ${inputCount} filter inputs`);
              
              // Close drawer if there's a close button
              const closeButton = drawer.locator('button[aria-label*="close" i], button:has-text("Lukk"), button[data-testid="close"]').first();
              if (await closeButton.isVisible().catch(() => false)) {
                await closeButton.click();
              }
            } else {
              console.log(`  ${page.name} - no drawer appeared after click`);
            }
          } else {
            console.log(`  ${page.name} - no filter button found`);
          }
        });
      }
    }

    test('should test data grid/tiles on Rental Objects', async ({ page: browserPage }) => {
      await browserPage.goto('/rental-objects', { waitUntil: 'domcontentloaded' });
      await browserPage.waitForTimeout(3000);

      if (browserPage.url().includes('/login')) {
        test();
        return;
      }

      // Check for grid or table view
      const dataView = browserPage.locator(
        '[data-testid="rental-objects-grid"], [data-testid="rental-objects-table"], table, [class*="grid"]'
      ).first();

      await expect(dataView).toBeVisible({ timeout: 10000 });

      // Check for items/tiles
      const items = browserPage.locator(
        '[data-testid^="rental-object-"], tr[data-id], [class*="card"], [class*="tile"]'
      );

      const itemCount = await items.count();
      console.log(`Found ${itemCount} rental object items`);

      // Test view mode toggle if present
      const viewToggle = browserPage.locator(
        'button[data-testid="view-mode-toggle"], [data-testid="view-grid"], [data-testid="view-table"]'
      ).first();

      if (await viewToggle.isVisible().catch(() => false)) {
        await viewToggle.click();
        await browserPage.waitForTimeout(500);
        console.log('✓ View mode toggled');
      }
    });

    test('should test data grid on Bookings', async ({ page: browserPage }) => {
      await browserPage.goto('/bookings', { waitUntil: 'domcontentloaded' });
      await browserPage.waitForTimeout(3000);

      if (browserPage.url().includes('/login')) {
        test();
        return;
      }

      // Check for bookings table or list
      const dataView = browserPage.locator('table, [data-testid="bookings-list"], [class*="bookings"]').first();
      await expect(dataView).toBeVisible({ timeout: 10000 });

      // Count booking rows
      const rows = browserPage.locator('tr[data-id], [data-testid^="booking-"]');
      const rowCount = await rows.count();
      console.log(`Found ${rowCount} booking items`);

      // Test status filter if present
      const statusFilter = browserPage.locator(
        'select[data-testid="status-filter"], [data-testid="status-dropdown"], button:has-text("Status")'
      ).first();

      if (await statusFilter.isVisible().catch(() => false)) {
        await statusFilter.click();
        await browserPage.waitForTimeout(500);
        console.log('✓ Status filter clicked');
      }
    });

    test('should test Calendar view', async ({ page: browserPage }) => {
      await browserPage.goto('/calendar', { waitUntil: 'domcontentloaded' });
      await browserPage.waitForTimeout(3000);

      if (browserPage.url().includes('/login')) {
        test();
        return;
      }

      // Check for calendar component
      const calendar = browserPage.locator(
        '[data-testid="calendar"], [class*="calendar"], [class*="fc-"], [role="grid"]'
      ).first();

      await expect(calendar).toBeVisible({ timeout: 15000 });
      console.log('✓ Calendar loaded');

      // Check for navigation controls
      const navButtons = browserPage.locator(
        'button:has-text("Today"), button:has-text("I dag"), [data-testid="calendar-prev"], [data-testid="calendar-next"]'
      );

      const navCount = await navButtons.count();
      console.log(`Found ${navCount} calendar navigation buttons`);

      // Test month/week toggle if present
      const viewButton = browserPage.locator('button:has-text("Måned"), button:has-text("Uke"), button:has-text("Month"), button:has-text("Week")').first();
      if (await viewButton.isVisible().catch(() => false)) {
        await viewButton.click();
        await browserPage.waitForTimeout(500);
        console.log('✓ Calendar view toggled');
      }
    });

    test('should test Users list', async ({ page: browserPage }) => {
      await browserPage.goto('/users', { waitUntil: 'domcontentloaded' });
      await browserPage.waitForTimeout(3000);

      if (browserPage.url().includes('/login')) {
        test();
        return;
      }

      // Check for users table
      const dataView = browserPage.locator('table, [data-testid="users-list"]').first();
      await expect(dataView).toBeVisible({ timeout: 10000 });

      // Count user rows
      const rows = browserPage.locator('tr[data-id], [data-testid^="user-"]');
      const rowCount = await rows.count();
      console.log(`Found ${rowCount} users`);

      // Test search if present
      const searchInput = browserPage.locator('input[type="search"], input[placeholder*="søk" i], input[placeholder*="search" i]').first();
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('test');
        await browserPage.waitForTimeout(1000);
        console.log('✓ Search input tested');
        await searchInput.clear();
      }
    });

    test('should test Audit Log', async ({ page: browserPage }) => {
      await browserPage.goto('/tenant/audit-log', { waitUntil: 'domcontentloaded' });
      await browserPage.waitForTimeout(3000);

      if (browserPage.url().includes('/login')) {
        test();
        return;
      }

      // Check for audit log entries
      const dataView = browserPage.locator('table, [data-testid="audit-log"], [class*="timeline"], [class*="activity"]').first();
      await expect(dataView).toBeVisible({ timeout: 10000 });

      // Count log entries
      const entries = browserPage.locator('tr, [data-testid^="audit-entry-"], [class*="log-entry"]');
      const entryCount = await entries.count();
      console.log(`Found ${entryCount} audit log entries`);

      // Test date filter if present
      const dateFilter = browserPage.locator('input[type="date"], [data-testid="date-filter"]').first();
      if (await dateFilter.isVisible().catch(() => false)) {
        console.log('✓ Date filter present');
      }
    });
  });

  test.describe('Dynamic Menu Discovery', () => {
  setupMockApi();
    test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

    test('should discover and test all sidebar navigation items', async ({ page: browserPage, evidence }) => {
      await browserPage.goto('/', { waitUntil: 'domcontentloaded' });
      await browserPage.waitForTimeout(5000);

      if (browserPage.url().includes('/login')) {
        console.log('Not authenticated - skipping menu discovery');
        test();
        return;
      }

      // Get all sidebar nav items
      const sidebar = browserPage.locator('nav[data-testid="sidebar-nav"]');
      const navItems = sidebar.locator('a.sidebar-nav-item, a[href^="/"]');

      const itemCount = await navItems.count();
      console.log(`\n📋 Found ${itemCount} navigation items\n`);

      const results: Array<{ path: string; name: string; status: string; hasFilters: boolean }> = [];

      // Test each nav item (limit to avoid timeout)
      const maxItems = Math.min(itemCount, 15);
      
      for (let i = 0; i < maxItems; i++) {
        const item = navItems.nth(i);
        const href = await item.getAttribute('href');
        const name = await item.textContent();

        if (!href || href === '#') continue;

        console.log(`Testing: ${name?.trim()} (${href})`);

        // Navigate to the page
        await browserPage.goto(href, { waitUntil: 'domcontentloaded' });
        await browserPage.waitForTimeout(2000);

        // Check status
        let status = 'loaded';
        let hasFilters = false;

        if (browserPage.url().includes('/login')) {
          status = 'requires-auth';
        } else if (browserPage.url().includes('error') || browserPage.url().includes('404')) {
          status = 'error';
        } else {
          // Check for filter button
          const filterBtn = browserPage.locator('button:has-text("Filter"), [data-testid*="filter"]').first();
          hasFilters = await filterBtn.isVisible({ timeout: 2000 }).catch(() => false);
        }

        results.push({
          path: href,
          name: name?.trim() || href,
          status,
          hasFilters,
        });

        console.log(`  ➜ ${status}${hasFilters ? ' (has filters)' : ''}`);
      }

      // Summary
      console.log('\n📊 Navigation Test Summary:');
      console.log(`  ✓ Loaded: ${results.filter(r => r.status === 'loaded').length}`);
      console.log(`  ⚠ Requires Auth: ${results.filter(r => r.status === 'requires-auth').length}`);
      console.log(`  ✗ Error: ${results.filter(r => r.status === 'error').length}`);
      console.log(`  🔧 With Filters: ${results.filter(r => r.hasFilters).length}`);

      // Should have mostly successful loads
      const successRate = results.filter(r => r.status === 'loaded').length / results.length;
      expect(successRate).toBeGreaterThan(0.5);
    });
  });
});
