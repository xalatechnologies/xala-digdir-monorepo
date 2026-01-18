import { setupMockApi } from '../../../mocks/api-server.mock';
/**
 * Tenant Onboarding Journey E2E Test
 * Full flow: Create tenant → Invite users → Assign roles → Verify
 */
import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:4000';

test.describe('Tenant Onboarding Journey', () => {
  setupMockApi();
  let tenantId: string;
  let userId: string;

  test('1. Create new tenant', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/tenants`, {
      data: {
        name: 'Acme Corporation',
        slug: 'acme-corp',
        ownerEmail: 'admin@acme.com',
        ownerName: 'Admin User',
        plan: 'pro',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.tenant.name).toBe('Acme Corporation');
    tenantId = body.tenant.id;
  });

  test('2. Verify tenant was created', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/tenants/${tenantId}`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.tenant.slug).toBe('acme-corp');
  });

  test('3. Invite team member', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/users/invite`, {
      headers: { 'x-tenant-id': tenantId },
      data: {
        email: 'team@acme.com',
        name: 'Team Member',
        role: 'member',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.invitationId).toBeDefined();
  });

  test('4. Create admin user', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/users`, {
      headers: { 'x-tenant-id': tenantId },
      data: {
        email: 'manager@acme.com',
        name: 'Manager User',
        role: 'manager',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    userId = body.user.id;
  });

  test('5. Promote user to admin', async ({ request }) => {
    const response = await request.put(`${API_URL}/api/users/${userId}/role`, {
      headers: { 'x-tenant-id': tenantId },
      data: { role: 'owner' },
    });

    expect(response.status()).toBe(200);
  });

  test('6. List all tenant users', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/users`, {
      headers: { 'x-tenant-id': tenantId },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.length).toBeGreaterThan(0);
  });

  test('7. Update tenant settings', async ({ request }) => {
    const response = await request.put(`${API_URL}/api/tenants/${tenantId}`, {
      data: {
        settings: {
          features: { rbac: true, invitations: true, auditLogs: true },
        },
      },
    });

    expect(response.status()).toBe(200);
  });
});
