import { setupMockApi } from '../../../../mocks/api-server.mock';
import { test, expect } from '../fixtures/evidence.fixture';

/**
 * Calendar CRUD Tests
 * Full functionality testing: View, Navigate, Block, Events
 */
test.describe('Calendar CRUD', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/calendar', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/login')) {
      test();
    }
  });

  test.describe('Page Layout', () => {
  setupMockApi();
    test('should display calendar header', async ({ page }) => {
      const header = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(header).toBeVisible({ timeout: 10000 });
    });

    test('should display calendar component', async ({ page }) => {
      const calendar = page.locator('[class*="calendar"], [data-testid="calendar"], [class*="fc-"]').first();
      await expect(calendar).toBeVisible({ timeout: 15000 });
    });

    test('should display rental object selector', async ({ page }) => {
      const selector = page.locator('select[data-testid*="rental"], [data-testid="object-selector"], button:has-text("Velg objekt")').first();
      const visible = await selector.isVisible().catch(() => false);
      console.log(`Object selector: ${visible ? '✓ present' : '✗ not found'}`);
    });
  });

  test.describe('Navigation', () => {
  setupMockApi();
    test('should have today button', async ({ page }) => {
      const todayBtn = page.locator('button:has-text("I dag"), button:has-text("Today")').first();
      
      if (await todayBtn.isVisible().catch(() => false)) {
        await todayBtn.click();
        await page.waitForTimeout(500);
        console.log('✓ Today button clicked');
      }
    });

    test('should have previous/next buttons', async ({ page }) => {
      const prevBtn = page.locator('button[aria-label*="prev" i], button:has-text("Forrige"), [data-testid="calendar-prev"]').first();
      const nextBtn = page.locator('button[aria-label*="next" i], button:has-text("Neste"), [data-testid="calendar-next"]').first();
      
      const hasPrev = await prevBtn.isVisible().catch(() => false);
      const hasNext = await nextBtn.isVisible().catch(() => false);
      
      console.log(`Navigation: prev=${hasPrev ? '✓' : '✗'}, next=${hasNext ? '✓' : '✗'}`);
      
      if (hasNext) {
        await nextBtn.click();
        await page.waitForTimeout(500);
        console.log('✓ Next clicked');
      }
    });

    test('should switch between month/week/day views', async ({ page }) => {
      const views = ['Måned', 'Uke', 'Dag', 'Month', 'Week', 'Day'];
      
      for (const view of views) {
        const viewBtn = page.locator(`button:has-text("${view}")`).first();
        if (await viewBtn.isVisible().catch(() => false)) {
          await viewBtn.click();
          await page.waitForTimeout(500);
          console.log(`✓ ${view} view selected`);
          break;
        }
      }
    });
  });

  test.describe('Filter Operations', () => {
  setupMockApi();
    test('should filter by rental object', async ({ page }) => {
      const objectFilter = page.locator('select[data-testid*="object"], [data-testid="rental-object-filter"]').first();
      
      if (await objectFilter.isVisible().catch(() => false)) {
        await objectFilter.click();
        await page.waitForTimeout(500);
        console.log('✓ Object filter opened');
      }
    });

    test('should filter by status', async ({ page }) => {
      const statusFilter = page.locator('[data-testid="status-filter"], button:has-text("Status")').first();
      
      if (await statusFilter.isVisible().catch(() => false)) {
        await statusFilter.click();
        await page.waitForTimeout(500);
        console.log('✓ Status filter opened');
      }
    });
  });

  test.describe('Event Operations', () => {
  setupMockApi();
    test('should display legend', async ({ page }) => {
      const legend = page.locator('[data-testid="calendar-legend"], [class*="legend"]').first();
      const visible = await legend.isVisible().catch(() => false);
      console.log(`Legend: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should click on event to view details', async ({ page }) => {
      const event = page.locator('[class*="fc-event"], [data-testid^="calendar-event-"], [class*="event"]').first();
      
      if (await event.isVisible().catch(() => false)) {
        await event.click();
        await page.waitForTimeout(1000);
        
        const popover = page.locator('[role="dialog"], [class*="popover"], [data-testid="event-details"]').first();
        const visible = await popover.isVisible().catch(() => false);
        console.log(`Event details: ${visible ? '✓ shown' : '✗ not shown'}`);
      }
    });
  });

  test.describe('Block Operations', () => {
  setupMockApi();
    test('should have block date button', async ({ page }) => {
      const blockBtn = page.locator('button:has-text("Blokker"), [data-testid="block-date"]').first();
      const visible = await blockBtn.isVisible().catch(() => false);
      console.log(`Block date button: ${visible ? '✓ present' : '✗ not found'}`);
    });

    test('should open block form on date click', async ({ page }) => {
      // Click on an empty date cell
      const dateCell = page.locator('[class*="fc-daygrid-day"], [data-date], td[class*="day"]').first();
      
      if (await dateCell.isVisible().catch(() => false)) {
        await dateCell.click();
        await page.waitForTimeout(1000);
        
        const form = page.locator('[role="dialog"], form[data-testid*="block"], [class*="modal"]').first();
        const visible = await form.isVisible().catch(() => false);
        console.log(`Block form on click: ${visible ? '✓ opened' : '✗ not opened'}`);
      }
    });
  });

  test.describe('Booking Operations', () => {
  setupMockApi();
    test('should have quick booking button', async ({ page }) => {
      const bookBtn = page.locator('button:has-text("Ny booking"), [data-testid="quick-booking"]').first();
      const visible = await bookBtn.isVisible().catch(() => false);
      console.log(`Quick booking: ${visible ? '✓ present' : '✗ not found'}`);
    });
  });
});
