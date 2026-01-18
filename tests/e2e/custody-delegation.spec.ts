/**
 * E2E Tests: Rental Object Custody & Delegation (Backoffice Only)
 * 
 * Verifies the full delegation hierarchy within Backoffice:
 * 1. Tenant Admin assigns custody to a Backoffice Organization.
 * 2. Org Admin (backoffice) views custody grants in organization management.
 * 3. Org Admin sub-delegates to backoffice organization members.
 * 
 * NO MINSIDE INVOLVEMENT - This is backoffice-only functionality.
 */
import { test, expect, Page } from '@playwright/test';

const BACKOFFICE_URL = 'http://localhost:5175';

// Test Data
const TEST_ORG_ID = 'test-org-id';
const TEST_RENTAL_OBJECT_ID = 'test-ro-id';
const TEST_GRANT_ID = 'test-grant-id';

/**
 * Mock Auth for Tenant Admin (Backoffice)
 */
async function mockTenantAdminAuth(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('auth_user', JSON.stringify({
      id: 'admin-1',
      role: 'KOMMUNE_ADMIN',
      tenantId: 'test-tenant-id'
    }));
    localStorage.setItem('isAuthenticated', 'true');
  });
}

/**
 * Mock Auth for Org Admin (Backoffice Organization Management)
 */
async function mockOrgAdminAuth(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('auth_user', JSON.stringify({
      id: 'org-admin-1',
      role: 'ORG_ADMIN',
      tenantId: 'test-tenant-id',
      organizationId: 'test-org-id'
    }));
    localStorage.setItem('isAuthenticated', 'true');
  });
}

test.describe('Rental Object Custody & Delegation Flow (Backoffice Only)', () => {
  
  test('Tenant Admin assigns custody to Organization in Backoffice', async ({ page }) => {
    // 1. Setup API mocks
    await page.route('**/api/rental-objects/test-ro-id', async (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: { id: TEST_RENTAL_OBJECT_ID, name: 'Idrettshallen' } })
      });
    });

    await page.route('**/api/custody/rental-objects/test-ro-id', async (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: [] })
      });
    });

    await page.route('**/api/organizations', async (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: [{ id: TEST_ORG_ID, name: 'Kulturuus' }] })
      });
    });

    // 2. Navigate to Custody Tab
    await page.goto(`${BACKOFFICE_URL}/rental-objects/${TEST_RENTAL_OBJECT_ID}`);
    await mockTenantAdminAuth(page);
    await page.reload(); // Apply auth

    // Click Custody Tab (assuming it has a unique text or role)
    await page.getByText('Ansvar').click();

    // 3. Assign Custody
    await page.getByRole('button', { name: /Tildel ansvar/i }).click();
    
    // Fill form
    await page.selectOption('select', { label: 'Organisasjon' }); // Type
    await page.selectOption('select >> nth=1', { label: 'Kulturuus' }); // Grantee
    
    // Check "RO_DELEGATE" scope
    await page.getByLabel('RO_DELEGATE').check();

    // Submit
    await page.route('**/api/custody/rental-objects/test-ro-id/grants', async (route) => {
      route.fulfill({ status: 201, body: JSON.stringify({ data: { id: TEST_GRANT_ID } }) });
    });

    await page.getByRole('button', { name: /Tildel/i }).click();

    // Verify success (e.g., modal closed, grant appears in list)
    await expect(page.getByText('Kulturuus')).toBeVisible();
    await expect(page.getByText('RO_DELEGATE')).toBeVisible();
  });

  test('Org Admin sub-delegates to member in Backoffice Organization Management', async ({ page }) => {
    // 1. Setup API mocks for organization custody view
    await page.route(`**/api/organizations/${TEST_ORG_ID}/custody`, async (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ 
          data: [{ 
            id: TEST_GRANT_ID,
            rentalObjectId: TEST_RENTAL_OBJECT_ID,
            rentalObject: { id: TEST_RENTAL_OBJECT_ID, name: 'Idrettshallen' },
            scopes: ['RO_VIEW', 'RO_EDIT', 'RO_DELEGATE'],
            canSubdelegate: true,
            status: 'ACTIVE'
          }] 
        })
      });
    });

    await page.route(`**/api/organizations/${TEST_ORG_ID}/members`, async (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ 
          data: [{ userId: 'member-1', fullName: 'John Backoffice', role: 'ORG_MEMBER' }] 
        })
      });
    });

    // 2. Navigate to Backoffice Organization Management
    await page.goto(`${BACKOFFICE_URL}/organizations/${TEST_ORG_ID}`);
    await mockOrgAdminAuth(page);
    await page.reload();

    // 3. Navigate to Custody/Members tab
    await page.getByText('Members').click();

    // 4. Open Sub-delegation UI
    await expect(page.getByText('Idrettshallen')).toBeVisible();
    await page.getByRole('button', { name: /Delegate to Member/i }).click();

    // 5. Fill and Submit
    await page.selectOption('select', { label: 'John Backoffice' });
    await page.getByLabel('RO_VIEW').check();

    await page.route(`**/api/custody/grants/${TEST_GRANT_ID}/subgrants`, async (route) => {
      route.fulfill({ status: 201, body: JSON.stringify({ data: { id: 'subgrant-1' } }) });
    });

    await page.getByRole('button', { name: /Assign/i }).click();

    // Verify modal closed
    await expect(page.getByText('Delegate to Member')).not.toBeVisible();
  });
});
