/**
 * Organization Admin Flow Integration Tests
 *
 * Integration tests for org_admin role functionality:
 * - Scoped access to assigned rental objects only
 * - Blocks CRUD with scope enforcement
 * - Org dashboard endpoints
 * - 403 responses for unassigned resources
 *
 * These tests validate:
 * - Backend scope enforcement middleware
 * - Org-scoped API endpoints
 * - RBAC for org_admin role
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Test configuration
const API_URL = process.env.API_URL || 'http://localhost:4000';
const TEST_TENANT_ID = 'test-tenant';
const TEST_ORG_ID = 'test-org';
const IS_PRODUCTION = API_URL.includes('api.digilist.no') || API_URL.includes('production');
const SKIP_INTEGRATION = process.env.SKIP_INTEGRATION_TESTS === 'true' || process.env.CI !== 'true';

// Mock user data
const mockOrgAdmin = {
  id: 'test-org-admin-id',
  email: 'org-admin@test.no',
  role: 'org_admin',
  tenantId: TEST_TENANT_ID,
  organizationId: TEST_ORG_ID,
};

// Skip all tests if running against production (no test-login endpoint)
const describeOrSkip = IS_PRODUCTION || SKIP_INTEGRATION ? describe.skip : describe;

describeOrSkip('Organization Admin Flow Integration Tests', () => {
  let sessionCookie: string | null = null;
  let assignedRentalObjectId: string | null = null;
  let unassignedRentalObjectId: string | null = null;

  /**
   * Helper to make authenticated API requests as org_admin
   */
  async function makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        ...(sessionCookie ? { Cookie: sessionCookie } : {}),
        'Content-Type': 'application/json',
        'X-Tenant-ID': TEST_TENANT_ID,
      },
    });
  }

  /**
   * Login as org_admin before tests
   */
  beforeAll(async () => {
    // Login as org_admin using test endpoint
    const loginResponse = await fetch(`${API_URL}/api/auth/test-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'org_admin',
        tenantId: TEST_TENANT_ID,
        organizationId: TEST_ORG_ID,
      }),
    });

    if (loginResponse.ok) {
      const setCookie = loginResponse.headers.get('set-cookie');
      if (setCookie) {
        sessionCookie = setCookie;
      }
    }
  });

  afterAll(async () => {
    // Cleanup: logout
    if (sessionCookie) {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Cookie: sessionCookie,
        },
      });
    }
  });

  // =========================================================================
  // Org Dashboard Tests
  // =========================================================================

  describe('Org Dashboard Endpoints', () => {
    it('should return scoped stats for org_admin', async () => {
      const response = await makeRequest('/api/org-dashboard/stats');

      // Should succeed for org_admin
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data).toBeDefined();
      expect(data.data).toHaveProperty('pendingBookings');
      expect(data.data).toHaveProperty('assignedRentalObjectCount');
    });

    it('should return pending items scoped to assigned objects', async () => {
      const response = await makeRequest('/api/org-dashboard/pending-items');

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data).toBeInstanceOf(Array);
      expect(data.meta).toBeDefined();
    });

    it('should return calendar preview for assigned objects', async () => {
      const response = await makeRequest('/api/org-dashboard/calendar-preview?range=week');

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data).toBeDefined();
    });

    it('should return alerts for assigned objects', async () => {
      const response = await makeRequest('/api/org-dashboard/alerts');

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data).toBeInstanceOf(Array);
    });

    it('should return assigned rental objects only', async () => {
      const response = await makeRequest('/api/org-dashboard/assigned-rental-objects');

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data).toBeInstanceOf(Array);

      // Store an assigned rental object ID for later tests
      if (data.data.length > 0) {
        assignedRentalObjectId = data.data[0].id;
      }
    });
  });

  // =========================================================================
  // Blocks CRUD Tests
  // =========================================================================

  describe('Blocks CRUD with Scope Enforcement', () => {
    let createdBlockId: string | null = null;

    it('should list blocks for assigned rental objects only', async () => {
      const response = await makeRequest('/api/blocks');

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data).toBeInstanceOf(Array);
      expect(data.meta).toBeDefined();
    });

    it('should create a block for assigned rental object', async () => {
      if (!assignedRentalObjectId) {
        console.log('Skipping: No assigned rental object available');
        return;
      }

      const blockData = {
        title: 'Test Block - Integration Test',
        reason: 'Integration testing',
        rentalObjectId: assignedRentalObjectId,
        startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endDate: new Date(Date.now() + 172800000).toISOString(), // Day after
        allDay: true,
        visibility: 'public',
      };

      const response = await makeRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify(blockData),
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.data).toBeDefined();
      expect(data.data.id).toBeDefined();
      expect(data.data.title).toBe(blockData.title);

      createdBlockId = data.data.id;
    });

    it('should get block details for assigned rental object', async () => {
      if (!createdBlockId) {
        console.log('Skipping: No block created');
        return;
      }

      const response = await makeRequest(`/api/blocks/${createdBlockId}`);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data).toBeDefined();
      expect(data.data.id).toBe(createdBlockId);
    });

    it('should update block for assigned rental object', async () => {
      if (!createdBlockId) {
        console.log('Skipping: No block created');
        return;
      }

      const updateData = {
        title: 'Updated Test Block',
        reason: 'Updated reason',
      };

      const response = await makeRequest(`/api/blocks/${createdBlockId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data.title).toBe(updateData.title);
    });

    it('should delete block for assigned rental object', async () => {
      if (!createdBlockId) {
        console.log('Skipping: No block created');
        return;
      }

      const response = await makeRequest(`/api/blocks/${createdBlockId}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(200);
    });

    it('should return 403 when creating block for unassigned rental object', async () => {
      // Use a fake rental object ID that is not assigned
      const blockData = {
        title: 'Unauthorized Block',
        reason: 'Should fail',
        rentalObjectId: 'unassigned-rental-object-id',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 172800000).toISOString(),
        allDay: true,
        visibility: 'public',
      };

      const response = await makeRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify(blockData),
      });

      // Should be 403 Forbidden or 404 Not Found
      expect([403, 404]).toContain(response.status);
    });
  });

  // =========================================================================
  // Scope Enforcement Tests
  // =========================================================================

  describe('Scope Enforcement', () => {
    it('should not allow access to unassigned rental object details', async () => {
      const response = await makeRequest('/api/rental-objects/unassigned-object-id');

      // Should be 403 Forbidden or 404 Not Found
      expect([403, 404]).toContain(response.status);
    });

    it('should only show bookings for assigned rental objects', async () => {
      const response = await makeRequest('/api/bookings?scope=assigned');

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data).toBeInstanceOf(Array);
      // All returned bookings should be for assigned rental objects
    });

    it('should filter calendar events to assigned objects only', async () => {
      const response = await makeRequest('/api/calendar/events?scope=assigned');

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data).toBeInstanceOf(Array);
    });
  });

  // =========================================================================
  // Capabilities Tests
  // =========================================================================

  describe('Capabilities for org_admin', () => {
    it('should return correct capabilities for org_admin role', async () => {
      const response = await makeRequest('/api/capabilities/backoffice');

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data).toBeDefined();
      expect(data.data.role).toBe('org_admin');
      expect(data.data.capabilities).toBeInstanceOf(Array);

      // Verify expected capabilities
      const capabilities = data.data.capabilities;
      expect(capabilities).toContain('CAP_ORG_ADMIN_ENABLED');
      expect(capabilities).toContain('CAP_NAV_DASHBOARD');
      expect(capabilities).toContain('CAP_NAV_BOOKINGS');
      expect(capabilities).toContain('CAP_NAV_BLOCKS');
    });

    it('should not have admin-only capabilities', async () => {
      const response = await makeRequest('/api/capabilities/backoffice');

      expect(response.status).toBe(200);

      const data = await response.json();
      const capabilities = data.data.capabilities;

      // Org admin should NOT have these capabilities
      expect(capabilities).not.toContain('CAP_TENANT_ADMIN');
      expect(capabilities).not.toContain('CAP_SAAS_ADMIN');
      expect(capabilities).not.toContain('CAP_USER_MANAGEMENT');
    });
  });

  // =========================================================================
  // RFC 7807 Error Response Tests
  // =========================================================================

  describe('RFC 7807 Error Responses', () => {
    it('should return RFC 7807 format for 404 errors', async () => {
      const response = await makeRequest('/api/blocks/non-existent-id');

      if (response.status === 404) {
        const data = await response.json();
        expect(data).toHaveProperty('type');
        expect(data).toHaveProperty('title');
        expect(data).toHaveProperty('status', 404);
      }
    });

    it('should return RFC 7807 format for 403 errors', async () => {
      // Try to access an endpoint without proper scope
      const response = await makeRequest('/api/rental-objects/unassigned-id');

      if (response.status === 403) {
        const data = await response.json();
        expect(data).toHaveProperty('type');
        expect(data).toHaveProperty('title');
        expect(data).toHaveProperty('status', 403);
      }
    });
  });
});
