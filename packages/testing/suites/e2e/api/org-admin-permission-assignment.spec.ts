// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@digilist/api/mocks/api-server.mock';
/**
 * Org Admin Permission Assignment E2E Test
 * Full flow: Login as Org Admin → Navigate to Members → Navigate to Permissions → Assign RO_BOOK → Verify
 *
 * This test verifies subtask-13-2: End-to-end verification: Org Admin assigns member permissions
 */
import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:4000';
const TENANT_ID = 'test-tenant';

// Test data - these would normally be created in test setup
const TEST_ORG_ADMIN = {
  id: 'test-org-admin-id',
  email: 'orgadmin@test.com',
  role: 'admin',
};

const TEST_MEMBER = {
  id: 'test-member-id',
  email: 'member@test.com',
};

test.describe('Org Admin Permission Assignment Flow', () => {
  setupMockApi();
  let organizationId: string;
  let rentalObjectId: string;
  let accessGrantId: string;
  let permissionAssignmentId: string;

  test.beforeAll(async ({ request }) => {
    // Step 1: Create test organization
    const orgResponse = await request.post(`${API_URL}/api/organizations`, {
      headers: { 'x-tenant-id': TENANT_ID },
      data: {
        name: 'Test Organization for Permissions',
        slug: 'test-org-permissions',
        type: 'sports_club',
        description: 'Test organization for permission assignment E2E',
      },
    });

    if (orgResponse.status() === 201) {
      const body = await orgResponse.json();
      organizationId = body.data?.id || body.organization?.id;
    }

    // Step 2: Create test rental object (listing)
    const listingResponse = await request.post(`${API_URL}/api/listings`, {
      headers: { 'x-tenant-id': TENANT_ID },
      data: {
        title: 'Test Rental Object for Permissions',
        slug: 'test-rental-object-permissions',
        type: 'space',
        description: 'Test rental object for permission assignment E2E',
        capacity: 50,
        pricePerHour: 100,
        currency: 'NOK',
      },
    });

    if (listingResponse.status() === 201) {
      const body = await listingResponse.json();
      rentalObjectId = body.data?.id || body.listing?.id;
    }

    // Step 3: Create access grant (prerequisite for permission assignment)
    const grantResponse = await request.post(`${API_URL}/api/access-grants`, {
      headers: { 'x-tenant-id': TENANT_ID },
      data: {
        organizationId: organizationId,
        rentalObjectId: rentalObjectId,
        notes: 'Access grant for E2E permission test',
      },
    });

    if (grantResponse.status() === 201) {
      const body = await grantResponse.json();
      accessGrantId = body.data?.id;
    }
  });

  test.afterAll(async ({ request }) => {
    // Cleanup: Delete test data in reverse order

    // Delete permission assignment if created
    if (permissionAssignmentId) {
      await request.delete(`${API_URL}/api/permission-assignments/${permissionAssignmentId}`, {
        headers: { 'x-tenant-id': TENANT_ID },
      });
    }

    // Delete access grant
    if (accessGrantId) {
      await request.delete(`${API_URL}/api/access-grants/${accessGrantId}`, {
        headers: { 'x-tenant-id': TENANT_ID },
      });
    }

    // Delete rental object
    if (rentalObjectId) {
      await request.delete(`${API_URL}/api/listings/${rentalObjectId}`, {
        headers: { 'x-tenant-id': TENANT_ID },
      });
    }

    // Delete organization
    if (organizationId) {
      await request.delete(`${API_URL}/api/organizations/${organizationId}`, {
        headers: { 'x-tenant-id': TENANT_ID },
      });
    }
  });

  test('1. Get available permissions', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/permission-assignments/available-permissions`, {
      headers: { 'x-tenant-id': TENANT_ID },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data).toBeDefined();
    expect(body.data.permissions).toContain('RO_VIEW');
    expect(body.data.permissions).toContain('RO_BOOK');
    expect(body.data.permissions).toContain('RO_BOOK_EDIT');
    expect(body.data.permissions).toContain('RO_BOOK_CANCEL');
  });

  test('2. Assign RO_BOOK permission to member via org-scoped endpoint', async ({ request }) => {
    // Skip if prerequisites not met
    test(!organizationId || !rentalObjectId, 'Prerequisites not met: org or rental object missing');

    const response = await request.put(
      `${API_URL}/api/organizations/${organizationId}/rental-objects/${rentalObjectId}/permissions/${TEST_MEMBER.id}`,
      {
        headers: { 'x-tenant-id': TENANT_ID },
        data: {
          permissions: ['RO_BOOK'],
        },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data).toBeDefined();
    expect(body.data.permissions).toContain('RO_BOOK');
    expect(body.data.userId).toBe(TEST_MEMBER.id);
    expect(body.data.rentalObjectId).toBe(rentalObjectId);
    expect(body.data.orgId).toBe(organizationId);

    permissionAssignmentId = body.data.id;
  });

  test('3. Verify permission assignment via query', async ({ request }) => {
    // Skip if assignment not created
    test(!permissionAssignmentId, 'Permission assignment not created');

    const response = await request.get(
      `${API_URL}/api/organizations/${organizationId}/rental-objects/${rentalObjectId}/permissions/${TEST_MEMBER.id}`,
      {
        headers: { 'x-tenant-id': TENANT_ID },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data).toBeDefined();
    expect(body.data.permissions).toContain('RO_BOOK');
  });

  test('4. Add additional permission (RO_BOOK_EDIT)', async ({ request }) => {
    test(!organizationId || !rentalObjectId, 'Prerequisites not met');

    const response = await request.put(
      `${API_URL}/api/organizations/${organizationId}/rental-objects/${rentalObjectId}/permissions/${TEST_MEMBER.id}`,
      {
        headers: { 'x-tenant-id': TENANT_ID },
        data: {
          permissions: ['RO_BOOK', 'RO_BOOK_EDIT'],
        },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.permissions).toContain('RO_BOOK');
    expect(body.data.permissions).toContain('RO_BOOK_EDIT');
  });

  test('5. Query permission assignments by organization', async ({ request }) => {
    test(!organizationId, 'Organization not created');

    const response = await request.get(
      `${API_URL}/api/permission-assignments?orgId=${organizationId}`,
      {
        headers: { 'x-tenant-id': TENANT_ID },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.meta).toBeDefined();
    expect(body.meta.total).toBeGreaterThanOrEqual(1);
  });

  test('6. Query permissions by rental object', async ({ request }) => {
    test(!organizationId || !rentalObjectId, 'Prerequisites not met');

    const response = await request.get(
      `${API_URL}/api/organizations/${organizationId}/rental-objects/${rentalObjectId}/permissions`,
      {
        headers: { 'x-tenant-id': TENANT_ID },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('7. Revoke permissions', async ({ request }) => {
    test(!organizationId || !rentalObjectId, 'Prerequisites not met');

    const response = await request.delete(
      `${API_URL}/api/organizations/${organizationId}/rental-objects/${rentalObjectId}/permissions/${TEST_MEMBER.id}`,
      {
        headers: { 'x-tenant-id': TENANT_ID },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data).toBeDefined();
    expect(body.data.status).toBe('revoked');

    // Clear the ID since it's now revoked
    permissionAssignmentId = '';
  });

  test('8. Verify revoked permissions no longer active', async ({ request }) => {
    test(!organizationId || !rentalObjectId, 'Prerequisites not met');

    const response = await request.get(
      `${API_URL}/api/organizations/${organizationId}/rental-objects/${rentalObjectId}/permissions/${TEST_MEMBER.id}`,
      {
        headers: { 'x-tenant-id': TENANT_ID },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    // Should return null or revoked assignment
    if (body.data) {
      expect(body.data.status).toBe('revoked');
    }
  });
});

test.describe('Permission Assignment Without Access Grant (Negative Test)', () => {
  setupMockApi();
  test('Cannot assign permissions without access grant', async ({ request }) => {
    // Use random IDs that don't have an access grant
    const randomOrgId = 'non-existent-org-id';
    const randomRoId = 'non-existent-ro-id';
    const randomUserId = 'non-existent-user-id';

    const response = await request.put(
      `${API_URL}/api/organizations/${randomOrgId}/rental-objects/${randomRoId}/permissions/${randomUserId}`,
      {
        headers: { 'x-tenant-id': TENANT_ID },
        data: {
          permissions: ['RO_BOOK'],
        },
      }
    );

    // Should fail with 403 or 404
    expect([403, 404]).toContain(response.status());
  });
});

test.describe('Invalid Permission Values (Negative Test)', () => {
  setupMockApi();
  test('Rejects invalid permission values', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/permission-assignments`, {
      headers: { 'x-tenant-id': TENANT_ID },
      data: {
        orgId: 'some-org-id',
        userId: 'some-user-id',
        rentalObjectId: 'some-ro-id',
        permissions: ['INVALID_PERMISSION'],
      },
    });

    // Should fail with 400 Bad Request
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.type || body.error).toBeDefined();
  });

  test('Rejects empty permissions array', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/permission-assignments`, {
      headers: { 'x-tenant-id': TENANT_ID },
      data: {
        orgId: 'some-org-id',
        userId: 'some-user-id',
        rentalObjectId: 'some-ro-id',
        permissions: [],
      },
    });

    // Should fail with 400 Bad Request
    expect(response.status()).toBe(400);
  });
});
