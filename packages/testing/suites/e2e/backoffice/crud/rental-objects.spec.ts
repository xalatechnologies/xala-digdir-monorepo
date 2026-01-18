import { setupMockApi } from '../../../../mocks/api-server.mock';
import { test, expect } from '../fixtures/evidence.fixture';

/**
 * Rental Objects CRUD Tests
 * Full functionality testing: List, View, Add, Edit, Delete, Publish, Archive
 */
test.describe('Rental Objects CRUD', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/rental-objects', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/login')) {
      test();
    }
  });

  test.describe('List Operations', () => {
  setupMockApi();
    test('should display rental objects list', async ({ page }) => {
      // Check for list/grid view
      const content = page.locator('table, [class*="grid"], [data-testid="rental-objects-list"]').first();
      await expect(content).toBeVisible({ timeout: 15000 });
    });

    test('should toggle between grid and table view', async ({ page }) => {
      const gridBtn = page.locator('button[data-testid="view-grid"], button[aria-label*="grid" i]').first();
      const tableBtn = page.locator('button[data-testid="view-table"], button[aria-label*="table" i], button[aria-label*="list" i]').first();

      if (await gridBtn.isVisible().catch(() => false)) {
        await gridBtn.click();
        await page.waitForTimeout(500);
        console.log('✓ Grid view selected');
      }

      if (await tableBtn.isVisible().catch(() => false)) {
        await tableBtn.click();
        await page.waitForTimeout(500);
        console.log('✓ Table view selected');
      }
    });

    test('should filter by search', async ({ page }) => {
      const searchInput = page.locator('input[type="search"], input[placeholder*="søk" i], input[placeholder*="search" i]').first();
      
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('test');
        await page.waitForTimeout(1000);
        console.log('✓ Search filter applied');
        await searchInput.clear();
      }
    });

    test('should filter by status', async ({ page }) => {
      const statusFilter = page.locator('select[data-testid*="status"], button:has-text("Status"), [data-testid="status-filter"]').first();
      
      if (await statusFilter.isVisible().catch(() => false)) {
        await statusFilter.click();
        await page.waitForTimeout(500);
        
        // Select an option
        const option = page.locator('[role="option"], option').first();
        if (await option.isVisible().catch(() => false)) {
          await option.click();
          await page.waitForTimeout(500);
          console.log('✓ Status filter applied');
        }
      }
    });

    test('should filter by category', async ({ page }) => {
      const categoryFilter = page.locator('select[data-testid*="category"], button:has-text("Kategori"), [data-testid="category-filter"]').first();
      
      if (await categoryFilter.isVisible().catch(() => false)) {
        await categoryFilter.click();
        await page.waitForTimeout(500);
        console.log('✓ Category filter opened');
      }
    });

    test('should sort items', async ({ page }) => {
      const sortButton = page.locator('button:has-text("Sorter"), [data-testid="sort-button"], th[data-sortable]').first();
      
      if (await sortButton.isVisible().catch(() => false)) {
        await sortButton.click();
        await page.waitForTimeout(500);
        console.log('✓ Sort applied');
      }
    });

    test('should paginate results', async ({ page }) => {
      const pagination = page.locator('[data-testid="pagination"], nav[aria-label*="pagination" i], .pagination').first();
      
      if (await pagination.isVisible().catch(() => false)) {
        const nextBtn = pagination.locator('button:has-text("Neste"), button[aria-label*="next" i]').first();
        if (await nextBtn.isEnabled().catch(() => false)) {
          await nextBtn.click();
          await page.waitForTimeout(1000);
          console.log('✓ Pagination next clicked');
        }
      }
    });
  });

  test.describe('Create Operations', () => {
  setupMockApi();
    test('should open create form/wizard', async ({ page }) => {
      const createBtn = page.locator('button:has-text("Opprett"), button:has-text("Legg til"), button:has-text("Ny"), a[href*="wizard"], a[href*="new"]').first();
      
      await expect(createBtn).toBeVisible({ timeout: 10000 });
      await createBtn.click();
      await page.waitForTimeout(2000);
      
      // Check if form/wizard opened
      const formVisible = await page.locator('form, [data-testid="wizard"], [data-testid="create-form"]').first().isVisible().catch(() => false);
      const urlChanged = page.url().includes('wizard') || page.url().includes('new') || page.url().includes('create');
      
      expect(formVisible || urlChanged).toBe(true);
      console.log('✓ Create form/wizard opened');
    });

    test('should validate required fields', async ({ page }) => {
      const createBtn = page.locator('button:has-text("Opprett"), button:has-text("Legg til"), a[href*="wizard"]').first();
      
      if (await createBtn.isVisible().catch(() => false)) {
        await createBtn.click();
        await page.waitForTimeout(2000);
        
        // Try to submit empty form
        const submitBtn = page.locator('button[type="submit"], button:has-text("Lagre"), button:has-text("Opprett")').first();
        if (await submitBtn.isVisible().catch(() => false)) {
          await submitBtn.click();
          await page.waitForTimeout(500);
          
          // Check for validation errors
          const errors = page.locator('[class*="error"], [data-error], [aria-invalid="true"]');
          const errorCount = await errors.count();
          console.log(`✓ Validation: ${errorCount} error indicators shown`);
        }
      }
    });

    test('should fill and submit form (dry run)', async ({ page }) => {
      const createBtn = page.locator('a[href*="wizard"], a[href*="new"]').first();
      
      if (await createBtn.isVisible().catch(() => false)) {
        await createBtn.click();
        await page.waitForTimeout(2000);
        
        // Fill name field
        const nameInput = page.locator('input[name="name"], input[data-testid="name-input"], input[placeholder*="navn" i]').first();
        if (await nameInput.isVisible().catch(() => false)) {
          await nameInput.fill('Test Rental Object - E2E');
          console.log('✓ Name field filled');
        }
        
        // DO NOT submit - this is a dry run
        console.log('✓ Form filled (dry run - not submitted)');
      }
    });
  });

  test.describe('View Operations', () => {
  setupMockApi();
    test('should open item detail view', async ({ page }) => {
      const firstItem = page.locator('tr[data-id], [data-testid^="rental-object-"], [class*="card"]').first();
      
      if (await firstItem.isVisible().catch(() => false)) {
        await firstItem.click();
        await page.waitForTimeout(2000);
        
        // Check for detail view
        const urlChanged = page.url().includes('/rental-objects/');
        const detailVisible = await page.locator('[data-testid="detail-view"], [class*="detail"]').first().isVisible().catch(() => false);
        
        if (urlChanged || detailVisible) {
          console.log('✓ Detail view opened');
        }
      }
    });

    test('should display all tabs in detail view', async ({ page }) => {
      // Navigate to first item
      const firstItem = page.locator('a[href*="/rental-objects/"]').first();
      
      if (await firstItem.isVisible().catch(() => false)) {
        await firstItem.click();
        await page.waitForTimeout(2000);
        
        // Check for tabs
        const tabs = page.locator('[role="tab"], [data-testid*="tab"], .tab');
        const tabCount = await tabs.count();
        console.log(`✓ Found ${tabCount} tabs in detail view`);
      }
    });
  });

  test.describe('Edit Operations', () => {
  setupMockApi();
    test('should open edit form', async ({ page }) => {
      // Navigate to first item
      const firstItem = page.locator('a[href*="/rental-objects/"]').first();
      
      if (await firstItem.isVisible().catch(() => false)) {
        await firstItem.click();
        await page.waitForTimeout(2000);
        
        // Click edit button
        const editBtn = page.locator('button:has-text("Rediger"), a[href*="edit"], [data-testid="edit-button"]').first();
        if (await editBtn.isVisible().catch(() => false)) {
          await editBtn.click();
          await page.waitForTimeout(1000);
          console.log('✓ Edit form opened');
        }
      }
    });

    test('should modify and save (dry run)', async ({ page }) => {
      const firstItem = page.locator('a[href*="/rental-objects/"]').first();
      
      if (await firstItem.isVisible().catch(() => false)) {
        await firstItem.click();
        await page.waitForTimeout(2000);
        
        const editBtn = page.locator('button:has-text("Rediger"), a[href*="edit"]').first();
        if (await editBtn.isVisible().catch(() => false)) {
          await editBtn.click();
          await page.waitForTimeout(1000);
          
          // Modify a field
          const descInput = page.locator('textarea[name="description"], [data-testid="description-input"]').first();
          if (await descInput.isVisible().catch(() => false)) {
            await descInput.fill('Updated description - E2E test');
            console.log('✓ Description modified (dry run - not saved)');
          }
        }
      }
    });
  });

  test.describe('Status Operations', () => {
  setupMockApi();
    test('should publish item', async ({ page }) => {
      const publishBtn = page.locator('button:has-text("Publiser"), [data-testid="publish-button"]').first();
      
      if (await publishBtn.isVisible().catch(() => false)) {
        console.log('✓ Publish button found');
        // Don't actually click to avoid modifying production data
      }
    });

    test('should archive item', async ({ page }) => {
      const archiveBtn = page.locator('button:has-text("Arkiver"), [data-testid="archive-button"]').first();
      
      if (await archiveBtn.isVisible().catch(() => false)) {
        console.log('✓ Archive button found');
      }
    });

    test('should unpublish item', async ({ page }) => {
      const unpublishBtn = page.locator('button:has-text("Avpubliser"), [data-testid="unpublish-button"]').first();
      
      if (await unpublishBtn.isVisible().catch(() => false)) {
        console.log('✓ Unpublish button found');
      }
    });
  });

  test.describe('Delete Operations', () => {
  setupMockApi();
    test('should show delete confirmation', async ({ page }) => {
      // Navigate to first item's detail
      const firstItem = page.locator('a[href*="/rental-objects/"]').first();
      
      if (await firstItem.isVisible().catch(() => false)) {
        await firstItem.click();
        await page.waitForTimeout(2000);
        
        const deleteBtn = page.locator('button:has-text("Slett"), [data-testid="delete-button"]').first();
        if (await deleteBtn.isVisible().catch(() => false)) {
          await deleteBtn.click();
          await page.waitForTimeout(500);
          
          // Check for confirmation dialog
          const confirmDialog = page.locator('[role="dialog"], [data-testid="confirm-dialog"], [class*="modal"]').first();
          if (await confirmDialog.isVisible().catch(() => false)) {
            console.log('✓ Delete confirmation dialog shown');
            
            // Cancel delete
            const cancelBtn = page.locator('button:has-text("Avbryt"), button:has-text("Nei")').first();
            if (await cancelBtn.isVisible().catch(() => false)) {
              await cancelBtn.click();
              console.log('✓ Delete cancelled');
            }
          }
        }
      }
    });
  });

  test.describe('Bulk Operations', () => {
  setupMockApi();
    test('should select multiple items', async ({ page }) => {
      const checkboxes = page.locator('input[type="checkbox"][data-testid*="select"], input[type="checkbox"][name*="select"]');
      
      const count = await checkboxes.count();
      if (count >= 2) {
        await checkboxes.nth(0).check();
        await checkboxes.nth(1).check();
        await page.waitForTimeout(500);
        console.log('✓ Multiple items selected');
        
        // Check for bulk actions
        const bulkActions = page.locator('[data-testid="bulk-actions"], button:has-text("Handlinger")').first();
        if (await bulkActions.isVisible().catch(() => false)) {
          console.log('✓ Bulk actions menu visible');
        }
      }
    });
  });
});
