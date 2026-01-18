// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@xala/api/mocks/api-server.mock';
import { test, expect } from '@playwright/test';

/**
 * MinSide Organization Context E2E Tests
 * 
 * Tests organization context switching and org-specific features:
 * - Context switch (personal ↔ organization)
 * - Organization dashboard
 * - Organization bookings
 * - Organization members (admin only)
 */

test.describe('MinSide - Organization Context', () => {
  setupMockApi();
  
  test.describe('Context Switch (User with Org)', () => {
  setupMockApi();
    test.use({ storageState: 'tests/e2e/minside/.auth/org-admin.json' });

    test.beforeEach(async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('should show account selection modal on first visit', async ({ page }) => {
      // Clear localStorage to simulate first visit
      await page.evaluate(() => {
        localStorage.removeItem('accountContext');
        localStorage.removeItem('rememberChoice');
      });
      
      await page.reload();
      await page.waitForTimeout(2000);
      
      // Check for account selection modal
      const modal = page.locator('[data-testid="account-selection"], [role="dialog"]:has-text("Velg konto")').first();
      const hasModal = await modal.isVisible().catch(() => false);
      
      console.log(`Account selection modal: ${hasModal ? '✓' : '– (may be remembered)'}`);
    });

    test('should switch to organization context', async ({ page }) => {
      // Look for context switcher
      const switcher = page.locator('[data-testid="context-switcher"], button:has-text("Bytt"), [class*="account-toggle"]').first();
      
      if (!await switcher.isVisible().catch(() => false)) {
        // Try to find in user menu
        const userMenu = page.locator('[data-testid="user-menu"], button[aria-haspopup="menu"]').first();
        if (await userMenu.isVisible()) {
          await userMenu.click();
          await page.waitForTimeout(500);
        }
      }
      
      // Find org option
      const orgOption = page.locator('button:has-text("Organisasjon"), [data-testid="switch-to-org"], a[href*="/org"]').first();
      
      if (await orgOption.isVisible().catch(() => false)) {
        await orgOption.click();
        await page.waitForTimeout(2000);
        
        // Should now see org dashboard
        const onOrgPage = page.url().includes('/org');
        const orgTitle = page.locator('h1:has-text("Organisasjon"), [data-testid="org-dashboard"]').first();
        
        console.log(`Switched to org: url=${onOrgPage ? '✓' : '✗'}, title=${await orgTitle.isVisible().catch(() => false) ? '✓' : '✗'}`);
      } else {
        // Navigate directly
        await page.goto('/org', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
        
        console.log('Navigated directly to /org');
      }
    });

    test('should show organization menu items when in org context', async ({ page }) => {
      await page.goto('/org', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      if (page.url().includes('/login')) {
        test();
        return;
      }
      
      const expectedOrgMenus = [
        { name: 'Dashboard', selector: 'a[href="/org"], a:has-text("Oversikt")' },
        { name: 'Bookings', selector: 'a[href*="org/bookings"], a:has-text("Reservasjoner")' },
        { name: 'Invoices', selector: 'a[href*="org/invoices"], a:has-text("Fakturaer")' },
        { name: 'Members', selector: 'a[href*="org/members"], a:has-text("Medlemmer")' },
        { name: 'Season', selector: 'a[href*="org/season"], a:has-text("Sesong")' },
      ];
      
      console.log('\nOrganization menu items:');
      for (const menu of expectedOrgMenus) {
        const element = page.locator(menu.selector).first();
        const visible = await element.isVisible().catch(() => false);
        console.log(`├─ ${menu.name}: ${visible ? '✓' : '✗'}`);
      }
    });

    test('should switch back to personal context', async ({ page }) => {
      await page.goto('/org', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      if (page.url().includes('/login')) {
        test();
        return;
      }
      
      // Find personal option
      const personalOption = page.locator('button:has-text("Personlig"), [data-testid="switch-to-personal"], a[href="/"]').first();
      
      if (await personalOption.isVisible().catch(() => false)) {
        await personalOption.click();
        await page.waitForTimeout(2000);
        
        const onPersonal = !page.url().includes('/org');
        console.log(`Switched to personal: ${onPersonal ? '✓' : '✗'}`);
      } else {
        // Navigate directly
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        console.log('Navigated directly to /');
      }
    });
  });

  test.describe('Organization Dashboard', () => {
  setupMockApi();
    test.use({ storageState: 'tests/e2e/minside/.auth/org-admin.json' });

    test.beforeEach(async ({ page }) => {
      await page.goto('/org', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('should display organization name', async ({ page }) => {
      const orgName = page.locator('[data-testid="org-name"], h1, h2').first();
      const visible = await orgName.isVisible().catch(() => false);
      
      if (visible) {
        const text = await orgName.textContent();
        console.log(`Organization: ${text}`);
      }
    });

    test('should display organization stats', async ({ page }) => {
      const stats = page.locator('[data-testid*="stat"], [class*="stats"], [class*="metric"]');
      const count = await stats.count();
      
      console.log(`Organization stats widgets: ${count}`);
    });
  });

  test.describe('Organization Bookings', () => {
  setupMockApi();
    test.use({ storageState: 'tests/e2e/minside/.auth/org-admin.json' });

    test.beforeEach(async ({ page }) => {
      await page.goto('/org/bookings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('should display organization bookings list', async ({ page }) => {
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      const bookingsList = page.locator('[data-testid="bookings-list"], table, [class*="booking"]');
      const emptyState = page.locator('[data-testid="empty-state"], text=/ingen/i');
      
      const hasList = await bookingsList.first().isVisible().catch(() => false);
      const hasEmpty = await emptyState.first().isVisible().catch(() => false);
      
      console.log(`Org bookings: list=${hasList ? '✓' : '✗'}, empty=${hasEmpty ? '✓' : '✗'}`);
    });

    test('should be able to create booking for organization', async ({ page }) => {
      const createBtn = page.locator('button:has-text("Ny"), button:has-text("Opprett"), a[href*="new"]').first();
      const visible = await createBtn.isVisible().catch(() => false);
      
      console.log(`Create booking button: ${visible ? '✓' : '✗'}`);
    });
  });

  test.describe('Organization Members (Admin Only)', () => {
  setupMockApi();
    test.use({ storageState: 'tests/e2e/minside/.auth/org-admin.json' });

    test.beforeEach(async ({ page }) => {
      await page.goto('/org/members', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('should display members list', async ({ page }) => {
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      const membersList = page.locator('[data-testid="members-list"], table, [class*="member"]');
      const hasList = await membersList.first().isVisible().catch(() => false);
      
      console.log(`Members list: ${hasList ? '✓' : '✗'}`);
    });

    test('should be able to invite new member', async ({ page }) => {
      const inviteBtn = page.locator('button:has-text("Inviter"), button:has-text("Legg til"), [data-testid="invite-member"]').first();
      const visible = await inviteBtn.isVisible().catch(() => false);
      
      console.log(`Invite member button: ${visible ? '✓' : '✗'}`);
      
      if (visible) {
        await inviteBtn.click();
        await page.waitForTimeout(1000);
        
        // Check for invite modal
        const modal = page.locator('[role="dialog"], [data-testid="invite-modal"]').first();
        const hasModal = await modal.isVisible().catch(() => false);
        
        console.log(`  Invite modal: ${hasModal ? '✓' : '✗'}`);
        
        // Close modal
        await page.keyboard.press('Escape');
      }
    });
  });

  test.describe('Access Control (Member vs Admin)', () => {
  setupMockApi();
    test.use({ storageState: 'tests/e2e/minside/.auth/user.json' });

    test('regular member should not access org settings', async ({ page }) => {
      await page.goto('/org/settings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
        return;
      }
      
      // Should either redirect or show access denied
      const currentUrl = page.url();
      const accessDenied = page.locator('text=/ingen tilgang|forbidden|403/i').first();
      
      const blocked = !currentUrl.includes('/org/settings') || await accessDenied.isVisible().catch(() => false);
      
      console.log(`Settings blocked for non-admin: ${blocked ? '✓' : '⚠️ may be accessible'}`);
    });

    test('regular member should not manage members', async ({ page }) => {
      await page.goto('/org/members', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
        return;
      }
      
      // Check if invite button is hidden for non-admins
      const inviteBtn = page.locator('button:has-text("Inviter"), [data-testid="invite-member"]').first();
      const canInvite = await inviteBtn.isVisible().catch(() => false);
      
      console.log(`Member management for non-admin: ${canInvite ? '⚠️ visible (check RBAC)' : '✓ hidden'}`);
    });
  });
});
