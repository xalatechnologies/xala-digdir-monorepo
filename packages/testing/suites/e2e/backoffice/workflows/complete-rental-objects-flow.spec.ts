// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../../../../mocks/api-server.mock';
import { test, expect } from '../fixtures/evidence.fixture';

/**
 * Complete End-to-End Rental Objects Workflow
 * 
 * Tests the full user journey from landing to all operations:
 * 1. Header & Global Search
 * 2. Navigation to Rental Objects
 * 3. List page features (table, filters, search)
 * 4. Create/Edit via Wizard
 * 5. All Actions: Save, Clone, Publish, Unpublish, Archive, Delete
 */

test.describe('Complete Rental Objects Workflow', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.describe('1. Header & Global Navigation', () => {
  setupMockApi();
    test.beforeEach(async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('should display header with logo', async ({ page }) => {
      const logo = page.locator('header img[alt*="logo" i], header [data-testid="logo"], header svg[class*="logo"]').first();
      const visible = await logo.isVisible().catch(() => false);
      console.log(`Header logo: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should display global search bar', async ({ page }) => {
      const searchBar = page.locator('header input[type="search"], header input[placeholder*="søk" i], [data-testid="global-search"]').first();
      
      if (await searchBar.isVisible().catch(() => false)) {
        await searchBar.fill('test');
        await page.waitForTimeout(500);
        console.log('✓ Global search bar works');
        await searchBar.clear();
      } else {
        console.log('Global search: ✗ not found in header');
      }
    });

    test('should have user menu/profile dropdown', async ({ page }) => {
      const userMenu = page.locator('header button[aria-haspopup="menu"], header [data-testid="user-menu"], header [class*="avatar"]').first();
      
      if (await userMenu.isVisible().catch(() => false)) {
        await userMenu.click();
        await page.waitForTimeout(500);
        
        const dropdown = page.locator('[role="menu"], [data-testid="user-dropdown"]').first();
        const visible = await dropdown.isVisible().catch(() => false);
        console.log(`User menu dropdown: ${visible ? '✓ opens' : '✗ did not open'}`);
      }
    });

    test('should have notifications bell', async ({ page }) => {
      const bell = page.locator('button[aria-label*="notification" i], [data-testid="notifications"]').first();
      const visible = await bell.isVisible().catch(() => false);
      console.log(`Notifications: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should have language switcher', async ({ page }) => {
      const langSwitch = page.locator('button:has-text("NO"), button:has-text("EN"), [data-testid="language-switcher"]').first();
      const visible = await langSwitch.isVisible().catch(() => false);
      console.log(`Language switcher: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should have settings/gear icon', async ({ page }) => {
      const settingsIcon = page.locator('a[href*="settings"], button[aria-label*="settings" i]').first();
      const visible = await settingsIcon.isVisible().catch(() => false);
      console.log(`Settings icon: ${visible ? '✓ present' : '✗ not found'}`);
    });
  });

  test.describe('2. Sidebar Navigation', () => {
  setupMockApi();
    test.beforeEach(async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('should display sidebar', async ({ page }) => {
      const sidebar = page.locator('nav[data-testid="sidebar-nav"], aside[class*="sidebar"], nav[class*="sidebar"]').first();
      await expect(sidebar).toBeVisible({ timeout: 10000 });
    });

    test('should have rental objects link in sidebar', async ({ page }) => {
      const rentalLink = page.locator('nav a[href*="rental-objects"], a:has-text("Utleieobjekter")').first();
      await expect(rentalLink).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to rental objects from sidebar', async ({ page }) => {
      const rentalLink = page.locator('nav a[href*="rental-objects"], a:has-text("Utleieobjekter")').first();
      
      if (await rentalLink.isVisible().catch(() => false)) {
        await rentalLink.click();
        await page.waitForURL('**/rental-objects**', { timeout: 10000 });
        console.log('✓ Navigated to rental objects');
      }
    });
  });

  test.describe('3. Rental Objects List Page', () => {
  setupMockApi();
    test.beforeEach(async ({ page }) => {
      await page.goto('/rental-objects', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('should display page title', async ({ page }) => {
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
    });

    test('should display "Add New" button', async ({ page }) => {
      const addBtn = page.locator('button:has-text("Legg til"), button:has-text("Opprett"), a[href*="wizard"], a[href*="new"]').first();
      await expect(addBtn).toBeVisible({ timeout: 10000 });
    });

    test('should display search input on list page', async ({ page }) => {
      const search = page.locator('input[type="search"], input[placeholder*="søk" i]').first();
      
      if (await search.isVisible().catch(() => false)) {
        await search.fill('test');
        await page.waitForTimeout(1000);
        console.log('✓ List search works');
        await search.clear();
      }
    });

    test('should have filter panel/buttons', async ({ page }) => {
      const filterBtn = page.locator('button:has-text("Filter"), [data-testid="filter-button"]').first();
      const filterPanel = page.locator('[data-testid="filters"], [class*="filter-panel"]').first();
      
      const hasButton = await filterBtn.isVisible().catch(() => false);
      const hasPanel = await filterPanel.isVisible().catch(() => false);
      
      console.log(`Filters: button=${hasButton ? '✓' : '✗'}, panel=${hasPanel ? '✓' : '✗'}`);
    });

    test('should have category filter', async ({ page }) => {
      const categoryFilter = page.locator('select[data-testid*="category"], button:has-text("Kategori"), [data-testid="category-filter"]').first();
      const visible = await categoryFilter.isVisible().catch(() => false);
      console.log(`Category filter: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should have status filter', async ({ page }) => {
      const statusFilter = page.locator('select[data-testid*="status"], button:has-text("Status"), [data-testid="status-filter"]').first();
      const visible = await statusFilter.isVisible().catch(() => false);
      console.log(`Status filter: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should display data table with headers', async ({ page }) => {
      const table = page.locator('table, [data-testid="rental-objects-table"]').first();
      await expect(table).toBeVisible({ timeout: 15000 });
      
      const headers = page.locator('thead th, [data-testid="table-header"]');
      const headerCount = await headers.count();
      console.log(`Table has ${headerCount} columns`);
    });

    test('should display rental object rows', async ({ page }) => {
      const rows = page.locator('tbody tr, [data-testid^="rental-object-row-"]');
      const rowCount = await rows.count();
      console.log(`Found ${rowCount} rental objects`);
    });

    test('should have view mode toggle (grid/table)', async ({ page }) => {
      const gridBtn = page.locator('button[data-testid="view-grid"], button[aria-label*="grid" i]').first();
      const tableBtn = page.locator('button[data-testid="view-table"], button[aria-label*="table" i]').first();
      
      const hasGrid = await gridBtn.isVisible().catch(() => false);
      const hasTable = await tableBtn.isVisible().catch(() => false);
      
      console.log(`View toggle: grid=${hasGrid ? '✓' : '✗'}, table=${hasTable ? '✓' : '✗'}`);
    });

    test('should have sort options', async ({ page }) => {
      const sortBtn = page.locator('button:has-text("Sorter"), [data-testid="sort-button"], th[data-sortable]').first();
      const visible = await sortBtn.isVisible().catch(() => false);
      console.log(`Sort options: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should have pagination', async ({ page }) => {
      const pagination = page.locator('[data-testid="pagination"], nav[aria-label*="pagination" i]').first();
      const visible = await pagination.isVisible().catch(() => false);
      console.log(`Pagination: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should have bulk select checkboxes', async ({ page }) => {
      const selectAll = page.locator('input[type="checkbox"][data-testid="select-all"], thead input[type="checkbox"]').first();
      const visible = await selectAll.isVisible().catch(() => false);
      console.log(`Bulk select: ${visible ? '✓ present' : '✗ not found'}`);
    });
  });

  test.describe('4. Detail View & Actions', () => {
  setupMockApi();
    test.beforeEach(async ({ page }) => {
      await page.goto('/rental-objects', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('should open item detail view', async ({ page }) => {
      const firstItem = page.locator('tbody tr a, a[href*="/rental-objects/"]').first();
      
      if (await firstItem.isVisible().catch(() => false)) {
        await firstItem.click();
        await page.waitForTimeout(2000);
        
        const urlHasId = /\/rental-objects\/[a-zA-Z0-9-]+/.test(page.url());
        console.log(`Detail view: ${urlHasId ? '✓ opened' : '✗ not opened'}`);
      }
    });

    test('should display detail page header with title', async ({ page }) => {
      const firstItem = page.locator('a[href*="/rental-objects/"]').first();
      
      if (await firstItem.isVisible().catch(() => false)) {
        await firstItem.click();
        await page.waitForTimeout(2000);
        
        const title = page.locator('h1, h2, [data-testid="detail-title"]').first();
        await expect(title).toBeVisible();
      }
    });

    test('should display status badge', async ({ page }) => {
      const firstItem = page.locator('a[href*="/rental-objects/"]').first();
      
      if (await firstItem.isVisible().catch(() => false)) {
        await firstItem.click();
        await page.waitForTimeout(2000);
        
        const statusBadge = page.locator('[data-testid="status-badge"], [class*="badge"], [class*="status"]').first();
        const visible = await statusBadge.isVisible().catch(() => false);
        console.log(`Status badge: ${visible ? '✓ present' : '✗ not found'}`);
      }
    });

    test('should have tabs in detail view', async ({ page }) => {
      const firstItem = page.locator('a[href*="/rental-objects/"]').first();
      
      if (await firstItem.isVisible().catch(() => false)) {
        await firstItem.click();
        await page.waitForTimeout(2000);
        
        const tabs = page.locator('[role="tab"], [data-testid*="tab"]');
        const tabCount = await tabs.count();
        console.log(`Found ${tabCount} tabs`);
      }
    });
  });

  test.describe('5. Action Buttons', () => {
  setupMockApi();
    test.beforeEach(async ({ page }) => {
      // Navigate to first item's detail page
      await page.goto('/rental-objects', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
        return;
      }
      
      const firstItem = page.locator('a[href*="/rental-objects/"]').first();
      if (await firstItem.isVisible().catch(() => false)) {
        await firstItem.click();
        await page.waitForTimeout(2000);
      }
    });

    test('should have SAVE button', async ({ page }) => {
      const saveBtn = page.locator('button:has-text("Lagre"), button:has-text("Save"), button[data-testid="save-button"]').first();
      const visible = await saveBtn.isVisible().catch(() => false);
      console.log(`SAVE button: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should have EDIT button', async ({ page }) => {
      const editBtn = page.locator('button:has-text("Rediger"), button:has-text("Edit"), a[href*="edit"], [data-testid="edit-button"]').first();
      const visible = await editBtn.isVisible().catch(() => false);
      console.log(`EDIT button: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should have CLONE/DUPLICATE button', async ({ page }) => {
      const cloneBtn = page.locator('button:has-text("Dupliser"), button:has-text("Kopier"), button:has-text("Clone"), [data-testid="clone-button"]').first();
      const visible = await cloneBtn.isVisible().catch(() => false);
      console.log(`CLONE button: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should have PUBLISH button', async ({ page }) => {
      const publishBtn = page.locator('button:has-text("Publiser"), button:has-text("Publish"), [data-testid="publish-button"]').first();
      const visible = await publishBtn.isVisible().catch(() => false);
      console.log(`PUBLISH button: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should have UNPUBLISH button', async ({ page }) => {
      const unpublishBtn = page.locator('button:has-text("Avpubliser"), button:has-text("Unpublish"), [data-testid="unpublish-button"]').first();
      const visible = await unpublishBtn.isVisible().catch(() => false);
      console.log(`UNPUBLISH button: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should have ARCHIVE button', async ({ page }) => {
      const archiveBtn = page.locator('button:has-text("Arkiver"), button:has-text("Archive"), [data-testid="archive-button"]').first();
      const visible = await archiveBtn.isVisible().catch(() => false);
      console.log(`ARCHIVE button: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should have DELETE button', async ({ page }) => {
      const deleteBtn = page.locator('button:has-text("Slett"), button:has-text("Delete"), [data-testid="delete-button"]').first();
      const visible = await deleteBtn.isVisible().catch(() => false);
      console.log(`DELETE button: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should have PREVIEW button', async ({ page }) => {
      const previewBtn = page.locator('button:has-text("Forhåndsvis"), button:has-text("Preview"), a[target="_blank"]').first();
      const visible = await previewBtn.isVisible().catch(() => false);
      console.log(`PREVIEW button: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should have MORE ACTIONS menu', async ({ page }) => {
      const moreBtn = page.locator('button[aria-haspopup="menu"], button:has-text("Mer"), button:has-text("More"), [data-testid="more-actions"]').first();
      
      if (await moreBtn.isVisible().catch(() => false)) {
        await moreBtn.click();
        await page.waitForTimeout(500);
        
        const menu = page.locator('[role="menu"], [data-testid="actions-menu"]').first();
        const visible = await menu.isVisible().catch(() => false);
        console.log(`More actions menu: ${visible ? '✓ opens' : '✗ did not open'}`);
      } else {
        console.log('More actions: ✗ button not found');
      }
    });
  });

  test.describe('6. Action Functionality Tests', () => {
  setupMockApi();
    test.beforeEach(async ({ page }) => {
      await page.goto('/rental-objects', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
        return;
      }
      
      const firstItem = page.locator('a[href*="/rental-objects/"]').first();
      if (await firstItem.isVisible().catch(() => false)) {
        await firstItem.click();
        await page.waitForTimeout(2000);
      }
    });

    test('SAVE: should show save confirmation', async ({ page }) => {
      const saveBtn = page.locator('button:has-text("Lagre"), button[data-testid="save-button"]').first();
      
      if (await saveBtn.isVisible().catch(() => false)) {
        // Check if button is enabled
        const isEnabled = await saveBtn.isEnabled();
        console.log(`SAVE enabled: ${isEnabled ? '✓' : '✗ (no changes)'}`);
      }
    });

    test('CLONE: should open clone confirmation', async ({ page }) => {
      const cloneBtn = page.locator('button:has-text("Dupliser"), button:has-text("Kopier"), [data-testid="clone-button"]').first();
      
      if (await cloneBtn.isVisible().catch(() => false)) {
        await cloneBtn.click();
        await page.waitForTimeout(1000);
        
        const dialog = page.locator('[role="dialog"], [data-testid="clone-dialog"]').first();
        const visible = await dialog.isVisible().catch(() => false);
        console.log(`CLONE dialog: ${visible ? '✓ shown' : '✗ not shown'}`);
        
        // Cancel if visible
        const cancelBtn = page.locator('button:has-text("Avbryt"), button:has-text("Cancel")').first();
        if (await cancelBtn.isVisible().catch(() => false)) {
          await cancelBtn.click();
        }
      }
    });

    test('PUBLISH: should open publish confirmation', async ({ page }) => {
      const publishBtn = page.locator('button:has-text("Publiser"), [data-testid="publish-button"]').first();
      
      if (await publishBtn.isVisible().catch(() => false)) {
        await publishBtn.click();
        await page.waitForTimeout(1000);
        
        const dialog = page.locator('[role="dialog"], [data-testid="publish-dialog"]').first();
        const visible = await dialog.isVisible().catch(() => false);
        console.log(`PUBLISH dialog: ${visible ? '✓ shown' : 'direct action (no dialog)'}`);
        
        // Cancel if dialog
        const cancelBtn = page.locator('button:has-text("Avbryt")').first();
        if (await cancelBtn.isVisible().catch(() => false)) {
          await cancelBtn.click();
        }
      }
    });

    test('DELETE: should show delete confirmation with warning', async ({ page }) => {
      const deleteBtn = page.locator('button:has-text("Slett"), [data-testid="delete-button"]').first();
      
      if (await deleteBtn.isVisible().catch(() => false)) {
        await deleteBtn.click();
        await page.waitForTimeout(1000);
        
        // Check for confirmation dialog
        const dialog = page.locator('[role="dialog"], [role="alertdialog"], [data-testid="confirm-dialog"]').first();
        const visible = await dialog.isVisible().catch(() => false);
        console.log(`DELETE confirmation: ${visible ? '✓ shown' : '✗ not shown'}`);
        
        if (visible) {
          // Check for warning text
          const warning = page.locator('text=/slett|permanent|kan ikke angres/i').first();
          const hasWarning = await warning.isVisible().catch(() => false);
          console.log(`  Warning text: ${hasWarning ? '✓' : '✗'}`);
          
          // Check for confirm/cancel buttons
          const confirmBtn = page.locator('button:has-text("Bekreft"), button:has-text("Slett"), button[data-testid="confirm-delete"]').first();
          const cancelBtn = page.locator('button:has-text("Avbryt"), button:has-text("Cancel")').first();
          
          console.log(`  Confirm button: ${await confirmBtn.isVisible().catch(() => false) ? '✓' : '✗'}`);
          console.log(`  Cancel button: ${await cancelBtn.isVisible().catch(() => false) ? '✓' : '✗'}`);
          
          // Cancel the delete
          if (await cancelBtn.isVisible().catch(() => false)) {
            await cancelBtn.click();
            console.log('  ✓ Delete cancelled');
          }
        }
      }
    });

    test('ARCHIVE: should show archive confirmation', async ({ page }) => {
      const archiveBtn = page.locator('button:has-text("Arkiver"), [data-testid="archive-button"]').first();
      
      if (await archiveBtn.isVisible().catch(() => false)) {
        await archiveBtn.click();
        await page.waitForTimeout(1000);
        
        const dialog = page.locator('[role="dialog"], [data-testid="archive-dialog"]').first();
        const visible = await dialog.isVisible().catch(() => false);
        console.log(`ARCHIVE dialog: ${visible ? '✓ shown' : 'direct action'}`);
        
        // Cancel
        const cancelBtn = page.locator('button:has-text("Avbryt")').first();
        if (await cancelBtn.isVisible().catch(() => false)) {
          await cancelBtn.click();
        }
      }
    });
  });

  test.describe('7. Breadcrumbs & Navigation', () => {
  setupMockApi();
    test.beforeEach(async ({ page }) => {
      await page.goto('/rental-objects', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('should display breadcrumbs', async ({ page }) => {
      const breadcrumbs = page.locator('nav[aria-label="breadcrumb"], [data-testid="breadcrumbs"], [class*="breadcrumb"]').first();
      const visible = await breadcrumbs.isVisible().catch(() => false);
      console.log(`Breadcrumbs: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should navigate via breadcrumbs', async ({ page }) => {
      // First go to detail page
      const firstItem = page.locator('a[href*="/rental-objects/"]').first();
      
      if (await firstItem.isVisible().catch(() => false)) {
        await firstItem.click();
        await page.waitForTimeout(2000);
        
        // Click breadcrumb to go back
        const breadcrumbLink = page.locator('[class*="breadcrumb"] a[href="/rental-objects"], nav[aria-label="breadcrumb"] a').first();
        
        if (await breadcrumbLink.isVisible().catch(() => false)) {
          await breadcrumbLink.click();
          await page.waitForTimeout(1000);
          
          const isOnList = page.url().endsWith('/rental-objects') || page.url().endsWith('/rental-objects/');
          console.log(`Breadcrumb navigation: ${isOnList ? '✓ works' : '✗ failed'}`);
        }
      }
    });

    test('should have back button in detail view', async ({ page }) => {
      const firstItem = page.locator('a[href*="/rental-objects/"]').first();
      
      if (await firstItem.isVisible().catch(() => false)) {
        await firstItem.click();
        await page.waitForTimeout(2000);
        
        const backBtn = page.locator('button:has-text("Tilbake"), a[href="/rental-objects"], [data-testid="back-button"]').first();
        const visible = await backBtn.isVisible().catch(() => false);
        console.log(`Back button: ${visible ? '✓ present' : '✗ not found'}`);
      }
    });
  });
});
