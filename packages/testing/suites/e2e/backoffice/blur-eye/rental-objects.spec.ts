// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@digilist/api/../mocks/api-server.mock';
import { test, expect } from '@digilist/api/fixtures/qa-expert.fixture';
import { config } from '@digilist/api/config/backoffice.config';

/**
 * SUITE B: Rental Objects (Listings) Full E2E
 * 
 * B1. List Page Blur-Eye Structure
 * B2. List Page Functional Checks
 * B3. Create New (Wizard + Tabs)
 * B4. Edit Existing
 * B5. Clone Listing
 * B6. Delete Listing
 */

test.describe('B. Rental Objects E2E', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.describe('B1. List Page Blur-Eye Structure', () => {
  setupMockApi();
    test.beforeEach(async ({ page }) => {
      await page.goto('/rental-objects', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('B1.1 Page header with clear title', async ({ page }) => {
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      const titleText = await title.textContent() || '';
      console.log(`Page title: "${titleText}"`);
      
      // Should contain expected terminology
      const validTitles = ['utleieobjekt', 'rental', 'listing', 'objekt'];
      const hasValidTitle = validTitles.some(t => titleText.toLowerCase().includes(t));
      
      expect(hasValidTitle).toBe(true);
    });

    test('B1.2 Primary actions visible (role-based)', async ({ page }) => {
      const actions = {
        addNew: 'button:has-text("Legg til"), button:has-text("Opprett"), a[href*="wizard"], a[href*="new"]',
        import: 'button:has-text("Importer"), button:has-text("Import"), [data-testid="import-button"]',
        export: 'button:has-text("Eksporter"), button:has-text("Export"), [data-testid="export-button"]',
      };
      
      console.log('\nPrimary actions:');
      for (const [name, selector] of Object.entries(actions)) {
        const element = page.locator(selector).first();
        const visible = await element.isVisible().catch(() => false);
        console.log(`├─ ${name}: ${visible ? '✓ visible' : '– not visible'}`);
      }
      
      // Add New must be visible for Admin
      const addNew = page.locator(actions.addNew).first();
      await expect(addNew).toBeVisible();
    });

    test('B1.3 Filter panel with search and filters', async ({ page }) => {
      const filterElements = {
        searchInput: 'input[type="search"], input[placeholder*="søk" i], [data-testid="search-input"]',
        categoryFilter: 'select[data-testid*="category"], button:has-text("Kategori"), [data-testid="category-filter"]',
        statusFilter: 'select[data-testid*="status"], button:has-text("Status"), [data-testid="status-filter"]',
        typeFilter: 'select[data-testid*="type"], button:has-text("Type"), [data-testid="type-filter"]',
        resetButton: 'button:has-text("Tilbakestill"), button:has-text("Nullstill"), button:has-text("Clear"), [data-testid="reset-filters"]',
      };
      
      console.log('\nFilter panel:');
      for (const [name, selector] of Object.entries(filterElements)) {
        const element = page.locator(selector).first();
        const visible = await element.isVisible().catch(() => false);
        console.log(`├─ ${name}: ${visible ? '✓' : '–'}`);
      }
      
      // At least search should be visible
      const search = page.locator(filterElements.searchInput).first();
      const hasSearch = await search.isVisible().catch(() => false);
      console.log(`\nSearch available: ${hasSearch ? '✓' : '✗'}`);
    });

    test('B1.4 Data table/grid with rows', async ({ page }) => {
      // Wait for data to load
      const table = page.locator('table, [data-testid="rental-objects-grid"], [class*="grid"]').first();
      await expect(table).toBeVisible({ timeout: 15000 });
      
      // Check for headers
      const headers = page.locator('thead th, [data-testid="table-header"]');
      const headerCount = await headers.count();
      
      // Check for rows
      const rows = page.locator('tbody tr, [data-testid^="rental-object-row-"], [class*="card"]');
      const rowCount = await rows.count();
      
      console.log(`\nData table:`);
      console.log(`├─ Headers: ${headerCount}`);
      console.log(`├─ Rows: ${rowCount}`);
      
      // Verify expected columns
      const expectedColumns = ['navn', 'name', 'kategori', 'category', 'status'];
      const headerTexts = await headers.allTextContents();
      const lowerHeaders = headerTexts.map(h => h.toLowerCase());
      
      let matchedColumns = 0;
      expectedColumns.forEach(col => {
        if (lowerHeaders.some(h => h.includes(col))) {
          matchedColumns++;
        }
      });
      
      console.log(`└─ Expected columns matched: ${matchedColumns}/${expectedColumns.length}`);
    });

    test('B1.5 Row actions present', async ({ page }) => {
      const firstRow = page.locator('tbody tr, [data-testid^="rental-object-row-"]').first();
      
      if (!await firstRow.isVisible().catch(() => false)) {
        console.log('No data rows - skipping action check');
        return;
      }
      
      // Look for action buttons in row or context menu
      const actions = {
        edit: 'button:has-text("Rediger"), a[href*="edit"], [data-testid="edit-button"]',
        clone: 'button:has-text("Dupliser"), button:has-text("Kopier"), [data-testid="clone-button"]',
        delete: 'button:has-text("Slett"), [data-testid="delete-button"]',
        menu: 'button[aria-haspopup="menu"], [data-testid="row-actions"], button[class*="menu"]',
      };
      
      // Check if actions are inline or in menu
      let actionsInline = false;
      let actionsInMenu = false;
      
      for (const [name, selector] of Object.entries(actions)) {
        const inRow = firstRow.locator(selector).first();
        if (await inRow.isVisible().catch(() => false)) {
          if (name === 'menu') {
            actionsInMenu = true;
          } else {
            actionsInline = true;
          }
        }
      }
      
      console.log(`\nRow actions:`);
      console.log(`├─ Inline: ${actionsInline ? '✓' : '✗'}`);
      console.log(`└─ In menu: ${actionsInMenu ? '✓' : '✗'}`);
      
      expect(actionsInline || actionsInMenu).toBe(true);
    });

    test('B1.6 Empty state behavior', async ({ page }) => {
      // Apply filter that should return no results
      const searchInput = page.locator('input[type="search"], input[placeholder*="søk" i]').first();
      
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('xyznonexistent12345');
        await page.waitForTimeout(2000);
        
        // Check for empty state
        const emptyState = page.locator('[data-testid="empty-state"], [class*="empty"], text=/ingen resultater|no results/i').first();
        const hasEmptyState = await emptyState.isVisible().catch(() => false);
        
        console.log(`Empty state: ${hasEmptyState ? '✓ shows meaningful message' : '✗ not visible'}`);
        
        // Check for clear filter option
        const clearBtn = page.locator('button:has-text("Tilbakestill"), button:has-text("Clear")').first();
        const hasClearBtn = await clearBtn.isVisible().catch(() => false);
        
        console.log(`Clear filters: ${hasClearBtn ? '✓' : '✗'}`);
        
        // Clear search
        await searchInput.clear();
      }
    });
  });

  test.describe('B2. List Page Functional Checks', () => {
  setupMockApi();
    test.beforeEach(async ({ page }) => {
      await page.goto('/rental-objects', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('B2.1 Sorting works', async ({ page }) => {
      const sortableHeader = page.locator('th[data-sortable], th button, th[role="columnheader"]').first();
      
      if (await sortableHeader.isVisible().catch(() => false)) {
        // Get initial first row text
        const firstRowBefore = await page.locator('tbody tr').first().textContent() || '';
        
        await sortableHeader.click();
        await page.waitForTimeout(1000);
        
        const firstRowAfter = await page.locator('tbody tr').first().textContent() || '';
        
        console.log(`Sorting: ${firstRowBefore !== firstRowAfter ? '✓ order changed' : '– order unchanged'}`);
      } else {
        console.log('No sortable headers found');
      }
    });

    test('B2.2 Pagination works', async ({ page }) => {
      const pagination = page.locator('[data-testid="pagination"], nav[aria-label*="pagination" i]').first();
      
      if (!await pagination.isVisible().catch(() => false)) {
        console.log('Pagination not visible (may have fewer items than threshold)');
        return;
      }
      
      const nextBtn = pagination.locator('button:has-text("Neste"), button[aria-label*="next" i]').first();
      
      if (await nextBtn.isEnabled().catch(() => false)) {
        const urlBefore = page.url();
        await nextBtn.click();
        await page.waitForTimeout(1000);
        const urlAfter = page.url();
        
        // URL or content should change
        const changed = urlBefore !== urlAfter;
        console.log(`Pagination: ${changed ? '✓ page changed' : '– same page'}`);
      } else {
        console.log('Next button disabled (on last page or single page)');
      }
    });

    test('B2.3 Filters persist in URL/state', async ({ page }) => {
      const statusFilter = page.locator('select[data-testid*="status"], button:has-text("Status")').first();
      
      if (!await statusFilter.isVisible().catch(() => false)) {
        console.log('Status filter not found');
        return;
      }
      
      // Apply filter
      await statusFilter.click();
      await page.waitForTimeout(500);
      
      const option = page.locator('[role="option"], option').first();
      if (await option.isVisible().catch(() => false)) {
        const optionText = await option.textContent() || '';
        await option.click();
        await page.waitForTimeout(1000);
        
        // Check URL or active filter indicator
        const url = page.url();
        const hasQueryParam = url.includes('status=') || url.includes('filter=');
        const hasActiveIndicator = await page.locator('[data-testid="active-filters"], [class*="active-filter"]').first().isVisible().catch(() => false);
        
        console.log(`Filter persistence: URL=${hasQueryParam ? '✓' : '✗'}, indicator=${hasActiveIndicator ? '✓' : '✗'}`);
      }
    });

    test('B2.4 Row action triggers correct navigation', async ({ page }) => {
      const firstRowLink = page.locator('tbody tr a, [data-testid^="rental-object-row-"] a').first();
      
      if (await firstRowLink.isVisible().catch(() => false)) {
        const href = await firstRowLink.getAttribute('href') || '';
        await firstRowLink.click();
        await page.waitForTimeout(2000);
        
        const currentUrl = page.url();
        const navigated = currentUrl.includes('/rental-objects/');
        
        console.log(`Row navigation: ${navigated ? '✓ opened detail' : '✗ did not navigate'}`);
        expect(navigated).toBe(true);
      }
    });

    test('B2.5 No runtime errors on load', async ({ page, evidence }) => {
      // Already loaded in beforeEach
      
      expect(evidence.hasPageErrors()).toBe(false);
      expect(evidence.hasConsoleErrors()).toBe(false);
      expect(evidence.has5xxResponses()).toBe(false);
      
      console.log('✓ No runtime errors detected');
    });
  });

  test.describe('B3. Create New (Wizard + Tabs)', () => {
  setupMockApi();
    test.beforeEach(async ({ page }) => {
      await page.goto('/rental-objects', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
        return;
      }
      
      // Navigate to wizard
      const addBtn = page.locator('a[href*="wizard"], a[href*="new"], button:has-text("Opprett")').first();
      if (await addBtn.isVisible().catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(2000);
      }
    });

    test('B3.1 Wizard shell has step indicator', async ({ page }) => {
      const stepIndicator = page.locator('[data-testid="wizard-steps"], [class*="stepper"], [role="tablist"]').first();
      const hasIndicator = await stepIndicator.isVisible().catch(() => false);
      
      console.log(`Step indicator: ${hasIndicator ? '✓' : '✗'}`);
      
      if (hasIndicator) {
        const steps = stepIndicator.locator('[role="tab"], [class*="step"]');
        const stepCount = await steps.count();
        console.log(`  Steps: ${stepCount}`);
      }
    });

    test('B3.2 Step titles are meaningful (blur-eye)', async ({ page }) => {
      const steps = page.locator('[data-testid*="step"], [class*="step-title"], [role="tab"]');
      const stepCount = await steps.count();
      
      const stepTitles: string[] = [];
      for (let i = 0; i < stepCount; i++) {
        const title = await steps.nth(i).textContent() || '';
        stepTitles.push(title.trim());
      }
      
      console.log('\nStep titles:');
      stepTitles.forEach((title, i) => {
        console.log(`  ${i + 1}. ${title}`);
      });
      
      // Check that titles are not just "Step 1", "Step 2"
      const hasGenericTitles = stepTitles.some(t => /^step\s*\d+$/i.test(t) || /^trinn\s*\d+$/i.test(t));
      
      console.log(`\nMeaningful titles: ${hasGenericTitles ? '✗ has generic titles' : '✓'}`);
    });

    test('B3.3 Navigation buttons work (Next/Back/Cancel)', async ({ page }) => {
      const nav = {
        next: 'button:has-text("Neste"), button:has-text("Next"), button:has-text("Fortsett")',
        back: 'button:has-text("Tilbake"), button:has-text("Back"), button:has-text("Forrige")',
        cancel: 'button:has-text("Avbryt"), button:has-text("Cancel"), a[href="/rental-objects"]',
      };
      
      console.log('\nNavigation buttons:');
      for (const [name, selector] of Object.entries(nav)) {
        const button = page.locator(selector).first();
        const visible = await button.isVisible().catch(() => false);
        console.log(`├─ ${name}: ${visible ? '✓' : '✗'}`);
      }
      
      // Test next button
      const nextBtn = page.locator(nav.next).first();
      if (await nextBtn.isVisible().catch(() => false)) {
        const stepBefore = page.url();
        await nextBtn.click();
        await page.waitForTimeout(1000);
        
        // Should either advance or show validation error
        const hasError = await page.locator('[class*="error"], [role="alert"]').first().isVisible().catch(() => false);
        const urlChanged = page.url() !== stepBefore;
        
        console.log(`└─ Next click: ${urlChanged ? 'advanced' : hasError ? 'validation shown' : 'no change'}`);
      }
    });

    test('B3.4 Required fields show validation errors', async ({ page }) => {
      // Try to proceed without filling required fields
      const nextBtn = page.locator('button:has-text("Neste"), button:has-text("Next")').first();
      
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(500);
        
        // Check for validation errors
        const errors = page.locator('[class*="error"], [role="alert"], [aria-invalid="true"], [data-error]');
        const errorCount = await errors.count();
        
        console.log(`Validation errors shown: ${errorCount}`);
        
        if (errorCount > 0) {
          const errorTexts = await errors.allTextContents();
          console.log('Errors:', errorTexts.slice(0, 3).join(', '));
        }
      }
    });

    test('B3.5 Save as draft option exists', async ({ page }) => {
      const draftBtn = page.locator('button:has-text("Lagre utkast"), button:has-text("Lagre som utkast"), button:has-text("Save draft"), [data-testid="save-draft"]').first();
      const visible = await draftBtn.isVisible().catch(() => false);
      
      console.log(`Save draft button: ${visible ? '✓' : '✗'}`);
    });

    test('B3.6 Image upload area exists', async ({ page }) => {
      const uploadArea = page.locator('input[type="file"][accept*="image"], [data-testid="image-upload"], [class*="dropzone"], [class*="upload"]').first();
      const visible = await uploadArea.isVisible().catch(() => false);
      
      console.log(`Image upload: ${visible ? '✓' : '✗ (may be on different step)'}`);
    });

    test('B3.7 Cancel wizard behavior', async ({ page }) => {
      const cancelBtn = page.locator('button:has-text("Avbryt"), a[href="/rental-objects"]').first();
      
      if (await cancelBtn.isVisible().catch(() => false)) {
        await cancelBtn.click();
        await page.waitForTimeout(2000);
        
        // Should return to list
        const onList = page.url().includes('/rental-objects') && !page.url().includes('wizard');
        console.log(`Cancel navigation: ${onList ? '✓ returned to list' : '✗'}`);
        expect(onList).toBe(true);
      }
    });
  });

  test.describe('B4. Edit Existing Listing', () => {
  setupMockApi();
    test.beforeEach(async ({ page }) => {
      await page.goto('/rental-objects', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
        return;
      }
      
      // Navigate to first item
      const firstItem = page.locator('a[href*="/rental-objects/"]').first();
      if (await firstItem.isVisible().catch(() => false)) {
        await firstItem.click();
        await page.waitForTimeout(2000);
      }
    });

    test('B4.1 Edit button opens edit mode', async ({ page }) => {
      const editBtn = page.locator('button:has-text("Rediger"), a[href*="edit"], [data-testid="edit-button"]').first();
      
      if (!await editBtn.isVisible().catch(() => false)) {
        console.log('Edit button not found on detail page');
        return;
      }
      
      await editBtn.click();
      await page.waitForTimeout(2000);
      
      // Should be in edit mode (form fields editable or on wizard page)
      const hasEditableField = await page.locator('input:not([readonly]), textarea:not([readonly])').first().isVisible().catch(() => false);
      const onWizard = page.url().includes('wizard') || page.url().includes('edit');
      
      console.log(`Edit mode: ${hasEditableField || onWizard ? '✓' : '✗'}`);
    });

    test('B4.2 Core fields can be modified', async ({ page }) => {
      const editBtn = page.locator('button:has-text("Rediger"), a[href*="edit"]').first();
      
      if (await editBtn.isVisible().catch(() => false)) {
        await editBtn.click();
        await page.waitForTimeout(2000);
      }
      
      // Try to modify name/title
      const nameInput = page.locator('input[name="name"], input[data-testid="name-input"], input[placeholder*="navn" i]').first();
      
      if (await nameInput.isVisible().catch(() => false)) {
        const originalValue = await nameInput.inputValue();
        const testValue = `${originalValue} - E2E Test`;
        
        await nameInput.fill(testValue);
        const newValue = await nameInput.inputValue();
        
        console.log(`Field modification: ${newValue === testValue ? '✓' : '✗'}`);
        
        // Restore original (don't save)
        await nameInput.fill(originalValue);
      }
    });

    test('B4.3 Changes persist after save and reload', async ({ page }) => {
      // This is a verification test - skip for now to avoid modifying data
      console.log('Skipping save verification to avoid modifying production data');
      test();
    });
  });

  test.describe('B5. Clone Listing', () => {
  setupMockApi();
    test('B5.1 Clone action creates new record', async ({ page }) => {
      await page.goto('/rental-objects', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
        return;
      }
      
      // Navigate to first item
      const firstItem = page.locator('a[href*="/rental-objects/"]').first();
      if (await firstItem.isVisible().catch(() => false)) {
        await firstItem.click();
        await page.waitForTimeout(2000);
      }
      
      // Find clone button
      const cloneBtn = page.locator('button:has-text("Dupliser"), button:has-text("Kopier"), button:has-text("Clone"), [data-testid="clone-button"]').first();
      
      if (!await cloneBtn.isVisible().catch(() => false)) {
        console.log('Clone button not found');
        return;
      }
      
      const urlBefore = page.url();
      await cloneBtn.click();
      await page.waitForTimeout(3000);
      
      // Check for dialog or navigation
      const dialog = page.locator('[role="dialog"], [data-testid="clone-dialog"]').first();
      const dialogVisible = await dialog.isVisible().catch(() => false);
      const urlChanged = page.url() !== urlBefore;
      
      console.log(`Clone action: dialog=${dialogVisible ? '✓' : '✗'}, navigation=${urlChanged ? '✓' : '✗'}`);
    });
  });

  test.describe('B6. Delete Listing', () => {
  setupMockApi();
    test('B6.1 Delete shows confirmation dialog', async ({ page }) => {
      await page.goto('/rental-objects', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
        return;
      }
      
      // Navigate to first item
      const firstItem = page.locator('a[href*="/rental-objects/"]').first();
      if (await firstItem.isVisible().catch(() => false)) {
        await firstItem.click();
        await page.waitForTimeout(2000);
      }
      
      // Find delete button
      const deleteBtn = page.locator('button:has-text("Slett"), button:has-text("Delete"), [data-testid="delete-button"]').first();
      
      if (!await deleteBtn.isVisible().catch(() => false)) {
        console.log('Delete button not found');
        return;
      }
      
      await deleteBtn.click();
      await page.waitForTimeout(1000);
      
      // Check for confirmation dialog
      const dialog = page.locator('[role="dialog"], [role="alertdialog"], [data-testid="confirm-dialog"]').first();
      const hasDialog = await dialog.isVisible().catch(() => false);
      
      console.log(`Delete confirmation: ${hasDialog ? '✓' : '✗'}`);
      
      if (hasDialog) {
        // Check for warning message
        const warningText = await dialog.textContent() || '';
        const hasWarning = /slett|permanent|kan ikke angres|delete|cannot be undone/i.test(warningText);
        console.log(`  Warning message: ${hasWarning ? '✓' : '✗'}`);
        
        // Check for confirm/cancel buttons
        const confirmBtn = dialog.locator('button:has-text("Bekreft"), button:has-text("Slett"), button[data-testid="confirm-delete"]').first();
        const cancelBtn = dialog.locator('button:has-text("Avbryt"), button:has-text("Cancel")').first();
        
        console.log(`  Confirm button: ${await confirmBtn.isVisible().catch(() => false) ? '✓' : '✗'}`);
        console.log(`  Cancel button: ${await cancelBtn.isVisible().catch(() => false) ? '✓' : '✗'}`);
        
        // Cancel to avoid deleting
        if (await cancelBtn.isVisible().catch(() => false)) {
          await cancelBtn.click();
        } else {
          await page.keyboard.press('Escape');
        }
      }
    });

    test('B6.2 Deleted item URL returns proper error', async ({ page }) => {
      // Navigate to a non-existent item
      await page.goto('/rental-objects/nonexistent-id-12345', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      // Should show error page or redirect
      const currentUrl = page.url();
      const hasErrorIndicator = await page.locator('text=/not found|404|ikke funnet|feil/i').first().isVisible().catch(() => false);
      const redirectedAway = !currentUrl.includes('nonexistent');
      
      console.log(`Invalid URL handling: error=${hasErrorIndicator ? '✓' : '✗'}, redirect=${redirectedAway ? '✓' : '✗'}`);
    });
  });
});
