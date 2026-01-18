// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@xala/api/mocks/api-server.mock';
/**
 * E2E Test: Tenant Admin User Management
 *
 * Tests the complete user management workflow for tenant admins:
 * - User list viewing and filtering
 * - User invitation
 * - Role assignment
 * - Scope delegation
 * - Effective permissions viewing
 *
 * @see docs/roles/tenant-admin-backoffice/master-prompt.md
 */
import { test, expect } from '@playwright/test';

test.describe('Tenant Admin User Management', () => {
  setupMockApi();
  test.beforeEach(async ({ page }) => {
    // Login as tenant admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Verify login successful
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should display tenant users list', async ({ page }) => {
    // Navigate to tenant users
    await page.click('[data-testid="nav-tenant-users"]');
    await expect(page).toHaveURL('/tenant/users');

    // Verify page elements
    await expect(page.locator('[data-testid="page-heading"]')).toHaveText(/tenant users/i);
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="invite-user-button"]')).toBeVisible();

    // Verify table columns
    await expect(page.locator('[data-testid="table-header-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-header-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-header-role"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-header-status"]')).toBeVisible();
  });

  test('should filter users by search query', async ({ page }) => {
    await page.goto('/tenant/users');

    // Get initial row count
    const initialRows = await page.locator('[data-testid^="user-row-"]').count();

    // Search for specific user
    await page.fill('[data-testid="search-input"]', 'john@example.com');
    await page.waitForTimeout(500); // Debounce

    // Verify filtered results
    const filteredRows = await page.locator('[data-testid^="user-row-"]').count();
    expect(filteredRows).toBeLessThanOrEqual(initialRows);

    // Verify search result contains query
    if (filteredRows > 0) {
      await expect(page.locator('[data-testid^="user-row-"]').first()).toContainText('john');
    }
  });

  test('should filter users by role', async ({ page }) => {
    await page.goto('/tenant/users');

    // Select role filter
    await page.click('[data-testid="filter-role"]');
    await page.click('[data-testid="filter-role-option-org-admin"]');

    // Wait for table to update
    await page.waitForTimeout(500);

    // Verify all visible users have selected role
    const roleElements = await page.locator('[data-testid^="user-role-"]').all();
    for (const element of roleElements) {
      await expect(element).toContainText(/org.admin/i);
    }
  });

  test('should filter users by status', async ({ page }) => {
    await page.goto('/tenant/users');

    // Select status filter
    await page.click('[data-testid="filter-status"]');
    await page.click('[data-testid="filter-status-option-active"]');

    // Wait for table to update
    await page.waitForTimeout(500);

    // Verify all visible users have active status
    const statusElements = await page.locator('[data-testid^="user-status-"]').all();
    for (const element of statusElements) {
      await expect(element).toContainText(/active/i);
    }
  });

  test('should invite a new user', async ({ page }) => {
    await page.goto('/tenant/users');

    // Click invite button
    await page.click('[data-testid="invite-user-button"]');
    await expect(page).toHaveURL('/tenant/users/invite');

    // Verify form elements
    await expect(page.locator('[data-testid="invite-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="role-select"]')).toBeVisible();

    // Fill form
    const testEmail = `test-${Date.now()}@example.com`;
    await page.fill('[data-testid="email-input"]', testEmail);
    await page.selectOption('[data-testid="role-select"]', 'org_member');

    // Optionally select organization
    const orgSelectVisible = await page.locator('[data-testid="organization-select"]').isVisible();
    if (orgSelectVisible) {
      await page.selectOption('[data-testid="organization-select"]', { index: 1 });
    }

    // Submit form
    await page.click('[data-testid="submit-button"]');

    // Verify success
    await expect(page).toHaveURL('/tenant/users');
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText(/invitation sent/i);

    // Verify user appears in list
    await page.fill('[data-testid="search-input"]', testEmail);
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid^="user-row-"]').first()).toContainText(testEmail);
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/tenant/users/invite');

    // Fill invalid email
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.selectOption('[data-testid="role-select"]', 'org_member');

    // Submit form
    await page.click('[data-testid="submit-button"]');

    // Verify validation error
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toContainText(/invalid email/i);

    // Verify still on invite page
    await expect(page).toHaveURL('/tenant/users/invite');
  });

  test('should require role selection', async ({ page }) => {
    await page.goto('/tenant/users/invite');

    // Fill email but not role
    await page.fill('[data-testid="email-input"]', 'test@example.com');

    // Submit form
    await page.click('[data-testid="submit-button"]');

    // Verify validation error
    await expect(page.locator('[data-testid="role-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="role-error"]')).toContainText(/required/i);
  });

  test('should navigate to user detail page', async ({ page }) => {
    await page.goto('/tenant/users');

    // Click on first user
    const firstUserRow = page.locator('[data-testid^="user-row-"]').first();
    const userId = await firstUserRow.getAttribute('data-user-id');
    await firstUserRow.click();

    // Verify navigation to detail page
    await expect(page).toHaveURL(new RegExp(`/tenant/users/${userId}`));

    // Verify detail page elements
    await expect(page.locator('[data-testid="user-detail-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-detail-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-detail-role"]')).toBeVisible();
  });

  test('should assign scope to user', async ({ page }) => {
    await page.goto('/tenant/users');

    // Navigate to first user's scope page
    const firstUserRow = page.locator('[data-testid^="user-row-"]').first();
    const userId = await firstUserRow.getAttribute('data-user-id');
    await page.goto(`/tenant/users/${userId}/scopes`);

    // Verify scope selector
    await expect(page.locator('[data-testid="scope-selector"]')).toBeVisible();

    // Select specific objects scope
    await page.click('[data-testid="scope-type-specific"]');

    // Wait for object list
    await expect(page.locator('[data-testid="rental-objects-list"]')).toBeVisible();

    // Select first rental object
    const firstObject = page.locator('[data-testid^="rental-object-checkbox-"]').first();
    await firstObject.check();

    // Save changes
    await page.click('[data-testid="save-scope-button"]');

    // Verify success
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText(/scope updated/i);
  });

  test('should view effective permissions', async ({ page }) => {
    await page.goto('/tenant/users');

    // Navigate to first user's permissions page
    const firstUserRow = page.locator('[data-testid^="user-row-"]').first();
    const userId = await firstUserRow.getAttribute('data-user-id');
    await page.goto(`/tenant/users/${userId}/permissions`);

    // Verify effective permissions view
    await expect(page.locator('[data-testid="effective-permissions"]')).toBeVisible();
    await expect(page.locator('[data-testid="permissions-count"]')).toBeVisible();

    // Verify permission categories
    await expect(page.locator('[data-testid="permissions-by-category"]')).toBeVisible();

    // Verify source indicators
    const permissions = await page.locator('[data-testid^="permission-item-"]').all();
    expect(permissions.length).toBeGreaterThan(0);

    // Verify first permission has source badge
    await expect(permissions[0].locator('[data-testid="permission-source"]')).toBeVisible();
  });

  test('should deactivate user', async ({ page }) => {
    await page.goto('/tenant/users');

    // Navigate to first user detail
    const firstUserRow = page.locator('[data-testid^="user-row-"]').first();
    const userId = await firstUserRow.getAttribute('data-user-id');
    await page.goto(`/tenant/users/${userId}`);

    // Click deactivate button
    await page.click('[data-testid="deactivate-user-button"]');

    // Confirm in dialog
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
    await page.click('[data-testid="confirm-button"]');

    // Verify success
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-status"]')).toContainText(/inactive/i);
  });

  test('should resend invitation', async ({ page }) => {
    await page.goto('/tenant/users');

    // Filter for pending invitations
    await page.click('[data-testid="filter-status"]');
    await page.click('[data-testid="filter-status-option-pending"]');
    await page.waitForTimeout(500);

    // Check if any pending users exist
    const pendingUsers = await page.locator('[data-testid^="user-row-"]').count();
    if (pendingUsers > 0) {
      // Click resend invitation for first user
      const firstUserRow = page.locator('[data-testid^="user-row-"]').first();
      await firstUserRow.locator('[data-testid="resend-invitation-button"]').click();

      // Verify success
      await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-toast"]')).toContainText(/invitation resent/i);
    }
  });

  test('should paginate user list', async ({ page }) => {
    await page.goto('/tenant/users');

    // Check if pagination is visible (only if > 50 users)
    const paginationVisible = await page.locator('[data-testid="pagination"]').isVisible();
    if (paginationVisible) {
      // Get current page
      const currentPage = await page.locator('[data-testid="current-page"]').textContent();
      expect(currentPage).toBe('1');

      // Go to next page
      await page.click('[data-testid="next-page-button"]');
      await page.waitForTimeout(500);

      // Verify page changed
      const newPage = await page.locator('[data-testid="current-page"]').textContent();
      expect(newPage).toBe('2');

      // Verify URL updated
      await expect(page).toHaveURL(/page=2/);
    }
  });

  test('should assign organization to user', async ({ page }) => {
    await page.goto('/tenant/users');

    // Navigate to first user's organizations page
    const firstUserRow = page.locator('[data-testid^="user-row-"]').first();
    const userId = await firstUserRow.getAttribute('data-user-id');
    await page.goto(`/tenant/users/${userId}/organizations`);

    // Verify organization selector
    await expect(page.locator('[data-testid="organization-selector"]')).toBeVisible();

    // Select an organization
    await page.click('[data-testid="add-organization-button"]');
    await page.selectOption('[data-testid="organization-select"]', { index: 1 });
    await page.click('[data-testid="confirm-button"]');

    // Verify success
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid^="assigned-org-"]').first()).toBeVisible();
  });

  test('should bulk invite users via CSV', async ({ page }) => {
    await page.goto('/tenant/users');

    // Click bulk invite button
    await page.click('[data-testid="bulk-invite-button"]');

    // Verify bulk invite modal
    await expect(page.locator('[data-testid="bulk-invite-modal"]')).toBeVisible();

    // Upload CSV file
    const csvContent = 'email,role\nuser1@test.com,org_member\nuser2@test.com,org_admin';
    await page.setInputFiles('[data-testid="csv-upload-input"]', {
      name: 'users.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    // Verify preview
    await expect(page.locator('[data-testid="csv-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="csv-row"]')).toHaveCount(2);

    // Submit bulk invite
    await page.click('[data-testid="bulk-invite-submit-button"]');

    // Verify success
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText(/2 invitations sent/i);
  });
});
