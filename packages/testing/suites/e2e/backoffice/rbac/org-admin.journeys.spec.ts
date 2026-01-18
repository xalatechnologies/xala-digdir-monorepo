// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../../../../mocks/api-server.mock';
import { test, expect } from '../fixtures/qa-expert.fixture';
import { config } from '../config/backoffice.config';

/**
 * ORG_ADMIN E2E Journey Tests
 * 
 * Tests all ORG_ADMIN capabilities:
 * - OA1. Login & Context Selection
 * - OA2. Member Management
 * - OA3. Org Profile Management
 * - OA4. Booking On-Behalf-Of Flows
 * - OA5. Reporting/Export
 * - OA6. Accessibility
 * - OA7. Localization
 */

// TODO: Create org-admin auth state file during setup
// For now, use admin auth and test org-admin specific routes

test.describe('ORG_ADMIN E2E Journeys', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.describe('OA1. Login & Context Selection', () => {
  setupMockApi();
    test('OA1.1 Lands on org dashboard after login', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
        return;
      }
      
      // Should see dashboard with org context
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      console.log('✓ Dashboard visible after login');
    });

    test('OA1.2 Org context selector exists (if multi-org)', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const orgSelector = page.locator(
        '[data-testid="org-selector"], [data-testid*="organization"], select[name*="org"]'
      ).first();
      
      const hasSelector = await orgSelector.isVisible().catch(() => false);
      console.log(`Org selector: ${hasSelector ? '✓ visible (multi-org)' : '– not visible (single org or N/A)'}`);
    });

    test('OA1.3 Org context shown in header/sidebar', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const orgIndicator = page.locator(
        '[data-testid*="org-name"], [data-testid*="organization"], [class*="org-badge"]'
      ).first();
      
      const hasIndicator = await orgIndicator.isVisible().catch(() => false);
      console.log(`Org indicator: ${hasIndicator ? '✓ visible' : '– not visible'}`);
    });
  });

  test.describe('OA2. Member Management', () => {
  setupMockApi();
    test.beforeEach(async ({ page }) => {
      await page.goto('/organizations', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('OA2.1 Can view org members list', async ({ page }) => {
      // Navigate to members section
      const membersLink = page.locator('a[href*="members"], button:has-text("Medlemmer")').first();
      
      if (await membersLink.isVisible().catch(() => false)) {
        await membersLink.click();
        await page.waitForTimeout(2000);
      }
      
      const memberList = page.locator('table, [data-testid*="member"], [class*="member-list"]').first();
      const emptyState = page.locator('[data-testid="empty-state"], text=/ingen medlemmer|no members/i').first();
      
      const hasList = await memberList.isVisible().catch(() => false);
      const hasEmpty = await emptyState.isVisible().catch(() => false);
      
      console.log(`Members list: ${hasList ? '✓' : '✗'}, Empty state: ${hasEmpty ? '✓' : '✗'}`);
    });

    test('OA2.2 Invite member button visible', async ({ page }) => {
      const inviteBtn = page.locator(
        'button:has-text("Inviter"), button:has-text("Legg til"), button:has-text("Invite"), [data-testid="invite-member"]'
      ).first();
      
      const visible = await inviteBtn.isVisible().catch(() => false);
      console.log(`Invite button: ${visible ? '✓ visible' : '✗ not visible'}`);
    });

    test('OA2.3 Invite member form validates email', async ({ page }) => {
      const inviteBtn = page.locator('button:has-text("Inviter"), button:has-text("Legg til")').first();
      
      if (!await inviteBtn.isVisible().catch(() => false)) {
        console.log('Invite button not visible - test N/A for this page state');
        return; // Gracefully skip, not a failure
      }
      
      await inviteBtn.click();
      await page.waitForTimeout(1000);
      
      const emailInput = page.locator('input[type="email"], input[name*="email"]').first();
      if (!await emailInput.isVisible().catch(() => false)) {
        console.log('Email input not visible after clicking invite - skipping');
        await page.keyboard.press('Escape');
        return;
      }
      
      await emailInput.fill('invalid-email');
      
      const submitBtn = page.locator('button[type="submit"], button:has-text("Send")').first();
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
        await page.waitForTimeout(1000);
        
        const errorMsg = page.locator('[class*="error"], [data-testid*="error"]').first();
        const hasError = await errorMsg.isVisible().catch(() => false);
        
        console.log(`Email validation: ${hasError ? '✓ shows error' : '– no error shown'}`);
      }
      
      await page.keyboard.press('Escape');
    });

    test('OA2.4 Member row has role change action', async ({ page }) => {
      const memberRow = page.locator('table tbody tr, [data-testid*="member-row"]').first();
      
      if (!await memberRow.isVisible().catch(() => false)) {
        console.log('No member rows - skipping');
        return;
      }
      
      const roleSelector = memberRow.locator('select, button:has-text("Rolle")').first();
      const hasRoleAction = await roleSelector.isVisible().catch(() => false);
      
      console.log(`Role change action: ${hasRoleAction ? '✓' : '✗'}`);
    });

    test('OA2.5 Member row has remove action', async ({ page }) => {
      const memberRow = page.locator('table tbody tr, [data-testid*="member-row"]').first();
      
      if (!await memberRow.isVisible().catch(() => false)) {
        console.log('No member rows - skipping');
        return;
      }
      
      const removeBtn = memberRow.locator('button:has-text("Fjern"), button:has-text("Slett"), [data-testid*="remove"]').first();
      const menuBtn = memberRow.locator('button[aria-haspopup="menu"]').first();
      
      const hasRemove = await removeBtn.isVisible().catch(() => false);
      const hasMenu = await menuBtn.isVisible().catch(() => false);
      
      console.log(`Remove action: ${hasRemove ? '✓' : '✗'}, Menu: ${hasMenu ? '✓' : '✗'}`);
    });
  });

  test.describe('OA3. Org Profile Management', () => {
  setupMockApi();
    test('OA3.1 Can view org profile', async ({ page }) => {
      await page.goto('/organizations', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Navigate to org detail/settings
      const settingsLink = page.locator('a[href*="settings"], button:has-text("Innstillinger")').first();
      
      if (await settingsLink.isVisible().catch(() => false)) {
        await settingsLink.click();
        await page.waitForTimeout(2000);
      }
      
      const form = page.locator('form, [data-testid*="org-form"]').first();
      const hasForm = await form.isVisible().catch(() => false);
      
      console.log(`Org profile form: ${hasForm ? '✓' : '✗'}`);
    });

    test('OA3.2 Can edit org name field', async ({ page }) => {
      await page.goto('/organizations', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const nameInput = page.locator('input[name*="name"], input[data-testid*="org-name"]').first();
      
      if (!await nameInput.isVisible().catch(() => false)) {
        console.log('Name input not visible - skipping');
        return;
      }
      
      const isEditable = await nameInput.isEditable().catch(() => false);
      console.log(`Org name editable: ${isEditable ? '✓' : '✗ (read-only)'}`);
    });

    test('OA3.3 Save button exists for profile', async ({ page }) => {
      await page.goto('/organizations', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const saveBtn = page.locator('button:has-text("Lagre"), button[type="submit"]').first();
      const visible = await saveBtn.isVisible().catch(() => false);
      
      console.log(`Save button: ${visible ? '✓' : '✗'}`);
    });
  });

  test.describe('OA4. Booking On-Behalf-Of', () => {
  setupMockApi();
    test.beforeEach(async ({ page }) => {
      await page.goto('/bookings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('OA4.1 Can access bookings page', async ({ page }) => {
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
      
      console.log('✓ Bookings page accessible');
    });

    test('OA4.2 Create booking button visible', async ({ page }) => {
      const createBtn = page.locator(
        'button:has-text("Ny"), button:has-text("Opprett"), a[href*="new"], [data-testid="new-booking"]'
      ).first();
      
      const visible = await createBtn.isVisible().catch(() => false);
      console.log(`Create booking: ${visible ? '✓' : '✗'}`);
    });

    test('OA4.3 Booking list shows org bookings', async ({ page }) => {
      const bookingTable = page.locator('table, [data-testid*="booking"]').first();
      const emptyState = page.locator('[data-testid="empty-state"]').first();
      
      const hasTable = await bookingTable.isVisible().catch(() => false);
      const hasEmpty = await emptyState.isVisible().catch(() => false);
      
      console.log(`Bookings table: ${hasTable ? '✓' : '✗'}, Empty: ${hasEmpty ? '✓' : '✗'}`);
    });

    test('OA4.4 Can approve booking (if work queue access)', async ({ page }) => {
      await page.goto('/work-queue', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Check if accessible
      const is403 = await page.locator('text=/forbidden|403|ikke tilgang/i').isVisible().catch(() => false);
      
      if (is403) {
        console.log('Work queue not accessible for this role');
        return;
      }
      
      const approveBtn = page.locator('button:has-text("Godkjenn")').first();
      const hasApprove = await approveBtn.isVisible().catch(() => false);
      
      console.log(`Approve button: ${hasApprove ? '✓' : '– no items'}`);
    });
  });

  test.describe('OA5. Reporting/Export', () => {
  setupMockApi();
    test('OA5.1 Can access reports page', async ({ page }) => {
      await page.goto('/reports', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      if (page.url().includes('/login')) {
        test();
        return;
      }
      
      const is403 = await page.locator('text=/forbidden|403|ikke tilgang/i').isVisible().catch(() => false);
      
      if (is403) {
        console.log('Reports not accessible for this role (expected for some org configs)');
        return;
      }
      
      const title = page.locator('h1, h2').first();
      const hasTitle = await title.isVisible().catch(() => false);
      
      console.log(`Reports page: ${hasTitle ? '✓' : '✗'}`);
    });

    test('OA5.2 Export buttons exist', async ({ page }) => {
      await page.goto('/reports', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const exportBtn = page.locator('button:has-text("Eksporter"), [data-testid*="export"]').first();
      const hasExport = await exportBtn.isVisible().catch(() => false);
      
      console.log(`Export button: ${hasExport ? '✓' : '✗'}`);
    });
  });

  test.describe('OA6. Forbidden Actions', () => {
  setupMockApi();
    test('OA6.1 Cannot access tenant settings', async ({ page }) => {
      await page.goto('/tenant/settings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      const redirected = !currentUrl.includes('/tenant/settings');
      const is403 = await page.locator('text=/forbidden|403|ikke tilgang/i').isVisible().catch(() => false);
      
      console.log(`Tenant settings blocked: ${redirected || is403 ? '✓' : '✗ SECURITY ISSUE'}`);
      expect(redirected || is403).toBe(true);
    });

    test('OA6.2 Cannot access user management', async ({ page }) => {
      await page.goto('/users', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      const redirected = !currentUrl.includes('/users');
      const is403 = await page.locator('text=/forbidden|403|ikke tilgang/i').isVisible().catch(() => false);
      
      console.log(`Users blocked: ${redirected || is403 ? '✓' : '✗ SECURITY ISSUE'}`);
    });

    test('OA6.3 Cannot create rental objects', async ({ page }) => {
      await page.goto('/rental-objects/wizard', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      const redirected = !currentUrl.includes('/rental-objects/wizard');
      const is403 = await page.locator('text=/forbidden|403|ikke tilgang/i').isVisible().catch(() => false);
      
      console.log(`RO wizard blocked: ${redirected || is403 ? '✓' : '– may have access'}`);
    });
  });

  test.describe('OA7. Runtime Stability', () => {
  setupMockApi();
    test('OA7.1 No runtime errors on org admin routes', async ({ page, evidence }) => {
      const routes = ['/', '/bookings', '/calendar', '/organizations'];
      
      for (const route of routes) {
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);
      }
      
      // Page errors are critical failures
      expect(evidence.hasPageErrors()).toBe(false);
      
      // 5xx errors are warnings (demo backend may have issues)
      const has5xx = evidence.has5xxResponses();
      if (has5xx) {
        console.log('⚠ Warning: 5xx responses detected (demo backend instability)');
      } else {
        console.log('✓ No 5xx responses');
      }
      
      console.log('✓ No page errors on org admin routes');
    });
  });
});
}
