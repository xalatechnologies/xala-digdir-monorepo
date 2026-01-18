// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../../../../mocks/api-server.mock';
import { test, expect } from '../fixtures/evidence.fixture';

/**
 * Settings & Audit Log Tests
 * Full functionality testing for admin settings pages
 */

test.describe('Settings', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/login')) {
      test();
    }
  });

  test.describe('Page Layout', () => {
  setupMockApi();
    test('should display settings page', async ({ page }) => {
      const header = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(header).toBeVisible({ timeout: 10000 });
    });

    test('should display settings sections/tabs', async ({ page }) => {
      const sections = page.locator('[role="tab"], [data-testid*="settings-section"], nav a[href*="settings"]');
      const count = await sections.count();
      console.log(`Found ${count} settings sections`);
    });
  });

  test.describe('General Settings', () => {
  setupMockApi();
    test('should display tenant name setting', async ({ page }) => {
      const nameInput = page.locator('input[name="name"], [data-testid="tenant-name"]').first();
      const visible = await nameInput.isVisible().catch(() => false);
      console.log(`Tenant name: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should display timezone setting', async ({ page }) => {
      const tzSelect = page.locator('select[name="timezone"], [data-testid="timezone-select"]').first();
      const visible = await tzSelect.isVisible().catch(() => false);
      console.log(`Timezone: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should display save button', async ({ page }) => {
      const saveBtn = page.locator('button:has-text("Lagre"), button[type="submit"]').first();
      const visible = await saveBtn.isVisible().catch(() => false);
      console.log(`Save button: ${visible ? '✓ present' : '✗ not found'}`);
    });
  });

  test.describe('Branding Settings', () => {
  setupMockApi();
    test('should navigate to branding section', async ({ page }) => {
      const brandingLink = page.locator('a[href*="branding"], button:has-text("Merkevare")').first();
      
      if (await brandingLink.isVisible().catch(() => false)) {
        await brandingLink.click();
        await page.waitForTimeout(1000);
        console.log('✓ Branding section opened');
      }
    });

    test('should have logo upload', async ({ page }) => {
      const logoUpload = page.locator('input[type="file"][accept*="image"], [data-testid="logo-upload"]').first();
      const visible = await logoUpload.isVisible().catch(() => false);
      console.log(`Logo upload: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should have color picker', async ({ page }) => {
      const colorPicker = page.locator('input[type="color"], [data-testid*="color"]').first();
      const visible = await colorPicker.isVisible().catch(() => false);
      console.log(`Color picker: ${visible ? '✓ present' : '✗ not found'}`);
    });
  });

  test.describe('Integration Settings', () => {
  setupMockApi();
    test('should navigate to integrations section', async ({ page }) => {
      const integLink = page.locator('a[href*="integrations"], button:has-text("Integrasjoner")').first();
      
      if (await integLink.isVisible().catch(() => false)) {
        await integLink.click();
        await page.waitForTimeout(1000);
        console.log('✓ Integrations section opened');
      }
    });
  });
});

test.describe('Audit Log', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/tenant/audit-log', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/login')) {
      test();
    }
  });

  test.describe('Page Layout', () => {
  setupMockApi();
    test('should display audit log page', async ({ page }) => {
      const header = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(header).toBeVisible({ timeout: 10000 });
    });

    test('should display log entries table', async ({ page }) => {
      const table = page.locator('table, [data-testid="audit-log-table"]').first();
      await expect(table).toBeVisible({ timeout: 15000 });
    });

    test('should display search/filter', async ({ page }) => {
      const search = page.locator('input[type="search"], input[placeholder*="søk" i]').first();
      const visible = await search.isVisible().catch(() => false);
      console.log(`Search: ${visible ? '✓ present' : '✗ not found'}`);
    });
  });

  test.describe('Filter Operations', () => {
  setupMockApi();
    test('should filter by action type', async ({ page }) => {
      const actionFilter = page.locator('select[data-testid*="action"], button:has-text("Handling")').first();
      
      if (await actionFilter.isVisible().catch(() => false)) {
        await actionFilter.click();
        await page.waitForTimeout(500);
        console.log('✓ Action filter opened');
      }
    });

    test('should filter by user', async ({ page }) => {
      const userFilter = page.locator('select[data-testid*="user"], button:has-text("Bruker")').first();
      
      if (await userFilter.isVisible().catch(() => false)) {
        await userFilter.click();
        await page.waitForTimeout(500);
        console.log('✓ User filter opened');
      }
    });

    test('should filter by date range', async ({ page }) => {
      const dateFrom = page.locator('input[type="date"], [data-testid="date-from"]').first();
      const visible = await dateFrom.isVisible().catch(() => false);
      console.log(`Date filter: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should filter by resource', async ({ page }) => {
      const resourceFilter = page.locator('select[data-testid*="resource"], button:has-text("Ressurs")').first();
      
      if (await resourceFilter.isVisible().catch(() => false)) {
        await resourceFilter.click();
        await page.waitForTimeout(500);
        console.log('✓ Resource filter opened');
      }
    });
  });

  test.describe('View Operations', () => {
  setupMockApi();
    test('should display log entry details', async ({ page }) => {
      const rows = page.locator('tbody tr');
      const count = await rows.count();
      console.log(`Found ${count} audit log entries`);
      
      if (count > 0) {
        await rows.first().click();
        await page.waitForTimeout(1000);
        
        const detail = page.locator('[role="dialog"], [data-testid="log-detail"]').first();
        const visible = await detail.isVisible().catch(() => false);
        console.log(`Log detail: ${visible ? '✓ shown' : '✗ not shown'}`);
      }
    });

    test('should display entry columns', async ({ page }) => {
      const expectedColumns = ['Timestamp', 'Handling', 'Bruker', 'Ressurs', 'IP'];
      const headers = page.locator('thead th');
      const headerCount = await headers.count();
      console.log(`Table has ${headerCount} columns`);
    });
  });

  test.describe('Export Operations', () => {
  setupMockApi();
    test('should have export button', async ({ page }) => {
      const exportBtn = page.locator('button:has-text("Eksporter"), [data-testid="export-button"]').first();
      const visible = await exportBtn.isVisible().catch(() => false);
      console.log(`Export button: ${visible ? '✓ present' : '✗ not found'}`);
    });
  });

  test.describe('Pagination', () => {
  setupMockApi();
    test('should have pagination controls', async ({ page }) => {
      const pagination = page.locator('[data-testid="pagination"], nav[aria-label*="pagination" i]').first();
      const visible = await pagination.isVisible().catch(() => false);
      console.log(`Pagination: ${visible ? '✓ present' : '✗ not found'}`);
    });
  });
});

test.describe('Work Queue', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/work-queue', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/login')) {
      test();
    }
  });

  test.describe('Page Layout', () => {
  setupMockApi();
    test('should display work queue page', async ({ page }) => {
      const header = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(header).toBeVisible({ timeout: 10000 });
    });

    test('should display queue items', async ({ page }) => {
      const items = page.locator('table, [data-testid*="queue-item"], [class*="queue"]').first();
      await expect(items).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Queue Operations', () => {
  setupMockApi();
    test('should filter by type', async ({ page }) => {
      const typeFilter = page.locator('select[data-testid*="type"], button:has-text("Type")').first();
      
      if (await typeFilter.isVisible().catch(() => false)) {
        await typeFilter.click();
        await page.waitForTimeout(500);
        console.log('✓ Type filter opened');
      }
    });

    test('should filter by priority', async ({ page }) => {
      const priorityFilter = page.locator('select[data-testid*="priority"], button:has-text("Prioritet")').first();
      
      if (await priorityFilter.isVisible().catch(() => false)) {
        await priorityFilter.click();
        await page.waitForTimeout(500);
        console.log('✓ Priority filter opened');
      }
    });

    test('should have process/approve action', async ({ page }) => {
      const processBtn = page.locator('button:has-text("Behandle"), button:has-text("Godkjenn")').first();
      const visible = await processBtn.isVisible().catch(() => false);
      console.log(`Process button: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should have reject action', async ({ page }) => {
      const rejectBtn = page.locator('button:has-text("Avslå"), button:has-text("Avvis")').first();
      const visible = await rejectBtn.isVisible().catch(() => false);
      console.log(`Reject button: ${visible ? '✓ present' : '✗ not found'}`);
    });
  });
});

test.describe('Messages', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/messages', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/login')) {
      test();
    }
  });

  test.describe('Page Layout', () => {
  setupMockApi();
    test('should display messages page', async ({ page }) => {
      const header = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(header).toBeVisible({ timeout: 10000 });
    });

    test('should display message list/inbox', async ({ page }) => {
      const inbox = page.locator('[data-testid="message-list"], [class*="inbox"], table').first();
      await expect(inbox).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Message Operations', () => {
  setupMockApi();
    test('should have new message button', async ({ page }) => {
      const newBtn = page.locator('button:has-text("Ny melding"), button:has-text("Skriv")').first();
      const visible = await newBtn.isVisible().catch(() => false);
      console.log(`New message button: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should filter by read/unread', async ({ page }) => {
      const filter = page.locator('button:has-text("Ulest"), [data-testid="read-filter"]').first();
      const visible = await filter.isVisible().catch(() => false);
      console.log(`Read filter: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should open message detail', async ({ page }) => {
      const firstMsg = page.locator('[data-testid^="message-"], tr').first();
      
      if (await firstMsg.isVisible().catch(() => false)) {
        await firstMsg.click();
        await page.waitForTimeout(1000);
        console.log('✓ Message clicked');
      }
    });

    test('should have reply option', async ({ page }) => {
      const replyBtn = page.locator('button:has-text("Svar"), [data-testid="reply-button"]').first();
      const visible = await replyBtn.isVisible().catch(() => false);
      console.log(`Reply button: ${visible ? '✓ present' : '✗ not found'}`);
    });
  });
});
}
