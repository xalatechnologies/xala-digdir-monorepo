/**
 * Integration Tests for SaaS Admin Tenant Management
 *
 * Tests the SDK service layer for tenant CRUD operations:
 * - getTenants: List tenants with pagination/filtering
 * - getTenant: Get single tenant details
 * - createTenant: Create new tenant
 * - updateTenant: Update tenant details
 * - suspendTenant: Suspend a tenant
 * - reactivateTenant: Reactivate a suspended tenant
 * - getTenantFlags: Get tenant feature flags
 * - updateTenantFlags: Update tenant feature flags
 * - rotateLicenseKey: Rotate tenant license key
 * - getTenantBilling: Get tenant billing summary
 * - getTenantSecrets: Get tenant secrets
 *
 * These tests mock the HTTP layer to verify SDK service behavior
 * and ensure proper API contract compliance.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// =============================================================================
// Test Fixtures
// =============================================================================

const mockTenant = {
  id: 'tenant-123',
  name: 'Oslo Kommune',
  slug: 'oslo-kommune',
  domain: 'oslo.kommune.no',
  status: 'active' as const,
  subscriptionPlanId: 'plan-enterprise',
  subscriptionPlanName: 'Enterprise',
  licenseKeyFingerprint: 'fp-abc123',
  licenseKeyRotatedAt: '2024-06-15T10:00:00Z',
  seatLimits: {
    maxUsers: 200,
    maxOrganizations: 20,
    maxListings: 1000,
    maxBookingsPerMonth: 5000,
    maxStorageMb: 5000,
  },
  settings: {},
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-06-20T14:30:00Z',
};

const mockTenantWithStats = {
  ...mockTenant,
  usage: {
    usersCount: 150,
    organizationsCount: 12,
    listingsCount: 500,
    bookingsThisMonth: 2500,
    storageMb: 1500,
  },
};

const mockTenantList = {
  data: [mockTenant, { ...mockTenant, id: 'tenant-456', name: 'Bergen Kommune', slug: 'bergen-kommune' }],
  meta: {
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

const mockFeatureFlags = [
  {
    flagKey: 'feature-calendar',
    value: true,
    enabled: true,
    reason: 'Enabled for Enterprise plan',
    updatedAt: '2024-06-10T10:00:00Z',
    updatedBy: 'admin@digilist.no',
  },
  {
    flagKey: 'feature-analytics',
    value: false,
    enabled: false,
    reason: null,
    updatedAt: null,
    updatedBy: null,
  },
];

const mockBillingSummary = {
  tenantId: 'tenant-123',
  status: 'paid' as const,
  currentPlan: 'Enterprise',
  amountPaid: 15000,
  amountDue: 0,
  currency: 'NOK',
  nextBillingDate: '2024-07-01T00:00:00Z',
  invoices: [
    {
      id: 'inv-1',
      number: 'INV-2024-001',
      amount: 15000,
      currency: 'NOK',
      status: 'paid' as const,
      dueDate: '2024-06-01T00:00:00Z',
    },
  ],
};

const mockSecrets = [
  {
    key: 'VIPPS_CLIENT_ID',
    provider: 'Vipps',
    isConfigured: true,
    fingerprint: 'abc123def456',
    lastRotatedAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-05-01T10:00:00Z',
  },
];

const mockLicenseKeyResponse = {
  tenantId: 'tenant-123',
  licenseKey: 'new-license-key-xyz789',
  fingerprint: 'fp-new123',
  rotatedAt: '2024-06-20T15:00:00Z',
};

const mockCategoryEntitlements = [
  {
    id: 'cat-1',
    tenantId: 'tenant-123',
    categoryKey: 'sports',
    enabled: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-06-20T14:30:00Z',
  },
];

// =============================================================================
// Mock HTTP Client
// =============================================================================

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();
const mockPut = vi.fn();

// Mock the client-factory module to return our mock client
vi.mock('../../../packages/client-sdk/src/core/client-factory', () => ({
  getClient: () => ({
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    put: mockPut,
  }),
}));

// Import after mocks are set up
import { saasService } from '../../../packages/client-sdk/src/services/saas.service';

// =============================================================================
// Test Suite: Tenant List Operations
// =============================================================================

describe('SaaS Tenant Management - List Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('saasService.getTenants()', () => {
    it('should fetch tenants list without parameters', async () => {
      mockGet.mockResolvedValueOnce(mockTenantList);

      const result = await saasService.getTenants();

      expect(mockGet).toHaveBeenCalledWith('/api/saas/tenants');
      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Oslo Kommune');
    });

    it('should fetch tenants with pagination parameters', async () => {
      mockGet.mockResolvedValueOnce(mockTenantList);

      await saasService.getTenants({ page: 1, limit: 20 });

      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('page=1'));
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('limit=20'));
    });

    it('should fetch tenants with search filter', async () => {
      mockGet.mockResolvedValueOnce({ data: [mockTenant], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } });

      await saasService.getTenants({ search: 'Oslo' });

      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('search=Oslo'));
    });

    it('should fetch tenants with status filter', async () => {
      mockGet.mockResolvedValueOnce({ data: [mockTenant], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } });

      await saasService.getTenants({ status: 'active' });

      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('status=active'));
    });

    it('should fetch tenants with sorting', async () => {
      mockGet.mockResolvedValueOnce(mockTenantList);

      await saasService.getTenants({ sortBy: 'name', sortOrder: 'asc' });

      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('sortBy=name'));
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('sortOrder=asc'));
    });

    it('should fetch tenants filtered by plan', async () => {
      mockGet.mockResolvedValueOnce(mockTenantList);

      await saasService.getTenants({ planId: 'plan-enterprise' });

      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('planId=plan-enterprise'));
    });

    it('should handle empty tenant list', async () => {
      mockGet.mockResolvedValueOnce({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      const result = await saasService.getTenants();

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('should combine multiple filter parameters', async () => {
      mockGet.mockResolvedValueOnce(mockTenantList);

      await saasService.getTenants({
        page: 2,
        limit: 25,
        status: 'active',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      const calledUrl = mockGet.mock.calls[0][0] as string;
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('limit=25');
      expect(calledUrl).toContain('status=active');
      expect(calledUrl).toContain('sortBy=createdAt');
      expect(calledUrl).toContain('sortOrder=desc');
    });
  });
});

// =============================================================================
// Test Suite: Tenant Detail Operations
// =============================================================================

describe('SaaS Tenant Management - Detail Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('saasService.getTenant()', () => {
    it('should fetch single tenant by ID', async () => {
      mockGet.mockResolvedValueOnce({ data: mockTenantWithStats });

      const result = await saasService.getTenant('tenant-123');

      expect(mockGet).toHaveBeenCalledWith('/api/saas/tenants/tenant-123');
      expect(result.data.name).toBe('Oslo Kommune');
      expect(result.data.usage.usersCount).toBe(150);
    });

    it('should include tenant usage statistics', async () => {
      mockGet.mockResolvedValueOnce({ data: mockTenantWithStats });

      const result = await saasService.getTenant('tenant-123');

      expect(result.data.usage).toBeDefined();
      expect(result.data.usage.usersCount).toBe(150);
      expect(result.data.usage.organizationsCount).toBe(12);
      expect(result.data.usage.listingsCount).toBe(500);
      expect(result.data.usage.bookingsThisMonth).toBe(2500);
      expect(result.data.usage.storageMb).toBe(1500);
    });

    it('should include seat limits', async () => {
      mockGet.mockResolvedValueOnce({ data: mockTenantWithStats });

      const result = await saasService.getTenant('tenant-123');

      expect(result.data.seatLimits).toBeDefined();
      expect(result.data.seatLimits.maxUsers).toBe(200);
      expect(result.data.seatLimits.maxOrganizations).toBe(20);
      expect(result.data.seatLimits.maxListings).toBe(1000);
    });

    it('should handle non-existent tenant with RFC 7807 error', async () => {
      mockGet.mockRejectedValueOnce({
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Tenant not found',
        status: 404,
        detail: 'Tenant with ID non-existent does not exist',
      });

      await expect(saasService.getTenant('non-existent')).rejects.toMatchObject({
        status: 404,
        title: 'Tenant not found',
      });
    });
  });
});

// =============================================================================
// Test Suite: Tenant Create Operations
// =============================================================================

describe('SaaS Tenant Management - Create Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('saasService.createTenant()', () => {
    it('should create a new tenant with minimal data', async () => {
      const newTenant = { ...mockTenant, id: 'new-tenant-789' };
      mockPost.mockResolvedValueOnce({ data: newTenant });

      const result = await saasService.createTenant({
        name: 'Oslo Kommune',
      });

      expect(mockPost).toHaveBeenCalledWith('/api/saas/tenants', {
        name: 'Oslo Kommune',
      });
      expect(result.data.name).toBe('Oslo Kommune');
    });

    it('should create tenant with full details', async () => {
      mockPost.mockResolvedValueOnce({ data: mockTenant });

      await saasService.createTenant({
        name: 'Oslo Kommune',
        slug: 'oslo-kommune',
        domain: 'oslo.kommune.no',
      });

      expect(mockPost).toHaveBeenCalledWith('/api/saas/tenants', {
        name: 'Oslo Kommune',
        slug: 'oslo-kommune',
        domain: 'oslo.kommune.no',
      });
    });

    it('should create tenant with plan assignment', async () => {
      mockPost.mockResolvedValueOnce({ data: mockTenant });

      await saasService.createTenant({
        name: 'Test Tenant',
        planId: 'plan-enterprise',
      });

      expect(mockPost).toHaveBeenCalledWith('/api/saas/tenants', expect.objectContaining({
        planId: 'plan-enterprise',
      }));
    });

    it('should create tenant with custom seat limits', async () => {
      mockPost.mockResolvedValueOnce({ data: mockTenant });

      await saasService.createTenant({
        name: 'Test Tenant',
        seatLimits: {
          maxUsers: 100,
          maxOrganizations: 10,
        },
      });

      expect(mockPost).toHaveBeenCalledWith('/api/saas/tenants', expect.objectContaining({
        seatLimits: {
          maxUsers: 100,
          maxOrganizations: 10,
        },
      }));
    });

    it('should create tenant with custom settings', async () => {
      mockPost.mockResolvedValueOnce({ data: mockTenant });

      await saasService.createTenant({
        name: 'Test Tenant',
        settings: { theme: 'dark', locale: 'nb' },
      });

      expect(mockPost).toHaveBeenCalledWith('/api/saas/tenants', expect.objectContaining({
        settings: { theme: 'dark', locale: 'nb' },
      }));
    });

    it('should handle validation error for duplicate slug', async () => {
      mockPost.mockRejectedValueOnce({
        type: 'https://api.digilist.no/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: 'A tenant with this slug already exists',
      });

      await expect(saasService.createTenant({
        name: 'Duplicate',
        slug: 'oslo-kommune',
      })).rejects.toMatchObject({
        status: 400,
        title: 'Validation Error',
      });
    });
  });
});

// =============================================================================
// Test Suite: Tenant Update Operations
// =============================================================================

describe('SaaS Tenant Management - Update Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('saasService.updateTenant()', () => {
    it('should update tenant name', async () => {
      const updatedTenant = { ...mockTenant, name: 'Oslo Municipality' };
      mockPatch.mockResolvedValueOnce({ data: updatedTenant });

      const result = await saasService.updateTenant('tenant-123', { name: 'Oslo Municipality' });

      expect(mockPatch).toHaveBeenCalledWith('/api/saas/tenants/tenant-123', { name: 'Oslo Municipality' });
      expect(result.data.name).toBe('Oslo Municipality');
    });

    it('should update tenant domain', async () => {
      const updatedTenant = { ...mockTenant, domain: 'new.oslo.no' };
      mockPatch.mockResolvedValueOnce({ data: updatedTenant });

      const result = await saasService.updateTenant('tenant-123', { domain: 'new.oslo.no' });

      expect(mockPatch).toHaveBeenCalledWith('/api/saas/tenants/tenant-123', { domain: 'new.oslo.no' });
      expect(result.data.domain).toBe('new.oslo.no');
    });

    it('should update tenant slug', async () => {
      const updatedTenant = { ...mockTenant, slug: 'oslo-municipality' };
      mockPatch.mockResolvedValueOnce({ data: updatedTenant });

      await saasService.updateTenant('tenant-123', { slug: 'oslo-municipality' });

      expect(mockPatch).toHaveBeenCalledWith('/api/saas/tenants/tenant-123', { slug: 'oslo-municipality' });
    });

    it('should update tenant plan', async () => {
      mockPatch.mockResolvedValueOnce({ data: { ...mockTenant, subscriptionPlanId: 'plan-pro' } });

      await saasService.updateTenant('tenant-123', { planId: 'plan-pro' });

      expect(mockPatch).toHaveBeenCalledWith('/api/saas/tenants/tenant-123', { planId: 'plan-pro' });
    });

    it('should update multiple fields at once', async () => {
      const updatedTenant = { ...mockTenant, name: 'New Name', domain: 'new.domain.no' };
      mockPatch.mockResolvedValueOnce({ data: updatedTenant });

      await saasService.updateTenant('tenant-123', {
        name: 'New Name',
        domain: 'new.domain.no'
      });

      expect(mockPatch).toHaveBeenCalledWith('/api/saas/tenants/tenant-123', {
        name: 'New Name',
        domain: 'new.domain.no',
      });
    });

    it('should handle 404 error when tenant does not exist', async () => {
      mockPatch.mockRejectedValueOnce({
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Tenant not found',
      });

      await expect(saasService.updateTenant('non-existent', { name: 'New Name' }))
        .rejects.toMatchObject({ status: 404 });
    });
  });
});

// =============================================================================
// Test Suite: Tenant Status Operations (Suspend/Reactivate)
// =============================================================================

describe('SaaS Tenant Management - Status Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('saasService.suspendTenant()', () => {
    it('should suspend a tenant with reason', async () => {
      const suspendedTenant = { ...mockTenant, status: 'suspended' as const };
      mockPost.mockResolvedValueOnce({ data: suspendedTenant });

      const result = await saasService.suspendTenant('tenant-123', {
        reason: 'Non-payment',
        notifyAdmins: true,
      });

      expect(mockPost).toHaveBeenCalledWith('/api/saas/tenants/tenant-123/suspend', {
        reason: 'Non-payment',
        notifyAdmins: true,
      });
      expect(result.data.status).toBe('suspended');
    });

    it('should suspend a tenant without reason', async () => {
      const suspendedTenant = { ...mockTenant, status: 'suspended' as const };
      mockPost.mockResolvedValueOnce({ data: suspendedTenant });

      await saasService.suspendTenant('tenant-123');

      expect(mockPost).toHaveBeenCalledWith('/api/saas/tenants/tenant-123/suspend', {});
    });

    it('should suspend tenant with notify admins disabled', async () => {
      const suspendedTenant = { ...mockTenant, status: 'suspended' as const };
      mockPost.mockResolvedValueOnce({ data: suspendedTenant });

      await saasService.suspendTenant('tenant-123', {
        reason: 'Maintenance',
        notifyAdmins: false,
      });

      expect(mockPost).toHaveBeenCalledWith('/api/saas/tenants/tenant-123/suspend', {
        reason: 'Maintenance',
        notifyAdmins: false,
      });
    });

    it('should handle error when suspending already suspended tenant', async () => {
      mockPost.mockRejectedValueOnce({
        type: 'https://api.digilist.no/errors/invalid-state',
        title: 'Invalid State',
        status: 409,
        detail: 'Tenant is already suspended',
      });

      await expect(saasService.suspendTenant('tenant-123'))
        .rejects.toMatchObject({ status: 409 });
    });
  });

  describe('saasService.reactivateTenant()', () => {
    it('should reactivate a suspended tenant', async () => {
      const reactivatedTenant = { ...mockTenant, status: 'active' as const };
      mockPost.mockResolvedValueOnce({ data: reactivatedTenant });

      const result = await saasService.reactivateTenant('tenant-123');

      expect(mockPost).toHaveBeenCalledWith('/api/saas/tenants/tenant-123/reactivate');
      expect(result.data.status).toBe('active');
    });

    it('should handle error when reactivating non-suspended tenant', async () => {
      mockPost.mockRejectedValueOnce({
        type: 'https://api.digilist.no/errors/invalid-state',
        title: 'Invalid State',
        status: 409,
        detail: 'Tenant is not suspended',
      });

      await expect(saasService.reactivateTenant('tenant-123'))
        .rejects.toMatchObject({ status: 409 });
    });
  });
});

// =============================================================================
// Test Suite: Seat Limits Operations
// =============================================================================

describe('SaaS Tenant Management - Seat Limits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('saasService.updateSeatLimits()', () => {
    it('should update a single seat limit', async () => {
      const updatedTenant = {
        ...mockTenant,
        seatLimits: { ...mockTenant.seatLimits, maxUsers: 500 },
      };
      mockPut.mockResolvedValueOnce({ data: updatedTenant });

      const result = await saasService.updateSeatLimits('tenant-123', { maxUsers: 500 });

      expect(mockPut).toHaveBeenCalledWith('/api/saas/tenants/tenant-123/seat-limits', { maxUsers: 500 });
      expect(result.data.seatLimits.maxUsers).toBe(500);
    });

    it('should update multiple seat limits', async () => {
      mockPut.mockResolvedValueOnce({ data: mockTenant });

      await saasService.updateSeatLimits('tenant-123', {
        maxUsers: 300,
        maxOrganizations: 30,
        maxListings: 2000,
      });

      expect(mockPut).toHaveBeenCalledWith('/api/saas/tenants/tenant-123/seat-limits', {
        maxUsers: 300,
        maxOrganizations: 30,
        maxListings: 2000,
      });
    });

    it('should update all seat limits', async () => {
      mockPut.mockResolvedValueOnce({ data: mockTenant });

      await saasService.updateSeatLimits('tenant-123', {
        maxUsers: 500,
        maxOrganizations: 50,
        maxListings: 5000,
        maxBookingsPerMonth: 10000,
        maxStorageMb: 10000,
      });

      expect(mockPut).toHaveBeenCalledWith('/api/saas/tenants/tenant-123/seat-limits', {
        maxUsers: 500,
        maxOrganizations: 50,
        maxListings: 5000,
        maxBookingsPerMonth: 10000,
        maxStorageMb: 10000,
      });
    });
  });
});

// =============================================================================
// Test Suite: Feature Flags Operations
// =============================================================================

describe('SaaS Tenant Management - Feature Flags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('saasService.getTenantFlags()', () => {
    it('should fetch tenant feature flags', async () => {
      mockGet.mockResolvedValueOnce({ data: mockFeatureFlags });

      const result = await saasService.getTenantFlags('tenant-123');

      expect(mockGet).toHaveBeenCalledWith('/api/saas/tenants/tenant-123/flags');
      expect(result.data).toHaveLength(2);
      expect(result.data[0].flagKey).toBe('feature-calendar');
    });

    it('should include flag metadata', async () => {
      mockGet.mockResolvedValueOnce({ data: mockFeatureFlags });

      const result = await saasService.getTenantFlags('tenant-123');

      expect(result.data[0].enabled).toBe(true);
      expect(result.data[0].reason).toBe('Enabled for Enterprise plan');
      expect(result.data[0].updatedBy).toBe('admin@digilist.no');
    });

    it('should handle tenant with no feature flags', async () => {
      mockGet.mockResolvedValueOnce({ data: [] });

      const result = await saasService.getTenantFlags('tenant-123');

      expect(result.data).toHaveLength(0);
    });
  });

  describe('saasService.updateTenantFlags()', () => {
    it('should update a single feature flag', async () => {
      const updatedFlags = [{ ...mockFeatureFlags[0], enabled: false, value: false }];
      mockPut.mockResolvedValueOnce({ data: updatedFlags });

      await saasService.updateTenantFlags('tenant-123', {
        flags: {
          'feature-calendar': { value: false, enabled: false, reason: 'Disabled by admin' },
        },
      });

      expect(mockPut).toHaveBeenCalledWith('/api/saas/tenants/tenant-123/flags', {
        flags: {
          'feature-calendar': { value: false, enabled: false, reason: 'Disabled by admin' },
        },
      });
    });

    it('should update multiple feature flags', async () => {
      mockPut.mockResolvedValueOnce({ data: mockFeatureFlags });

      await saasService.updateTenantFlags('tenant-123', {
        flags: {
          'feature-calendar': { value: false, enabled: false },
          'feature-analytics': { value: true, enabled: true, reason: 'Enabled' },
        },
      });

      expect(mockPut).toHaveBeenCalledWith('/api/saas/tenants/tenant-123/flags', {
        flags: {
          'feature-calendar': { value: false, enabled: false },
          'feature-analytics': { value: true, enabled: true, reason: 'Enabled' },
        },
      });
    });
  });

  describe('saasService.getFeatureFlagsCatalog()', () => {
    it('should fetch feature flags catalog', async () => {
      const catalog = [
        { id: 'flag-1', key: 'feature-calendar', name: 'Calendar', category: 'module', defaultValue: false, type: 'boolean', status: 'active' },
        { id: 'flag-2', key: 'feature-analytics', name: 'Analytics', category: 'module', defaultValue: false, type: 'boolean', status: 'active' },
      ];
      mockGet.mockResolvedValueOnce({ data: catalog });

      const result = await saasService.getFeatureFlagsCatalog();

      expect(mockGet).toHaveBeenCalledWith('/api/saas/feature-flags');
      expect(result.data).toHaveLength(2);
    });

    it('should filter catalog by category', async () => {
      mockGet.mockResolvedValueOnce({ data: [] });

      await saasService.getFeatureFlagsCatalog({ category: 'module' });

      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('category=module'));
    });
  });
});

// =============================================================================
// Test Suite: License Key Operations
// =============================================================================

describe('SaaS Tenant Management - License Key', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('saasService.rotateLicenseKey()', () => {
    it('should rotate tenant license key', async () => {
      mockPost.mockResolvedValueOnce({ data: mockLicenseKeyResponse });

      const result = await saasService.rotateLicenseKey('tenant-123');

      expect(mockPost).toHaveBeenCalledWith('/api/saas/tenants/tenant-123/rotate-license');
      expect(result.data.licenseKey).toBe('new-license-key-xyz789');
      expect(result.data.fingerprint).toBe('fp-new123');
    });

    it('should include rotation timestamp', async () => {
      mockPost.mockResolvedValueOnce({ data: mockLicenseKeyResponse });

      const result = await saasService.rotateLicenseKey('tenant-123');

      expect(result.data.rotatedAt).toBe('2024-06-20T15:00:00Z');
    });

    it('should generate new license for tenant without one', async () => {
      const newLicense = { ...mockLicenseKeyResponse, tenantId: 'tenant-no-license' };
      mockPost.mockResolvedValueOnce({ data: newLicense });

      const result = await saasService.rotateLicenseKey('tenant-no-license');

      expect(result.data.licenseKey).toBeDefined();
      expect(result.data.fingerprint).toBeDefined();
    });
  });

  describe('saasService.validateLicenseKey()', () => {
    it('should validate a valid license key', async () => {
      mockPost.mockResolvedValueOnce({ data: { valid: true, expiresAt: '2025-01-01T00:00:00Z' } });

      const result = await saasService.validateLicenseKey('tenant-123', 'valid-key');

      expect(mockPost).toHaveBeenCalledWith('/api/saas/tenants/tenant-123/validate-license', { licenseKey: 'valid-key' });
      expect(result.data.valid).toBe(true);
    });

    it('should reject an invalid license key', async () => {
      mockPost.mockResolvedValueOnce({ data: { valid: false } });

      const result = await saasService.validateLicenseKey('tenant-123', 'invalid-key');

      expect(result.data.valid).toBe(false);
    });
  });
});

// =============================================================================
// Test Suite: Billing Operations
// =============================================================================

describe('SaaS Tenant Management - Billing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('saasService.getTenantBilling()', () => {
    it('should fetch tenant billing summary', async () => {
      mockGet.mockResolvedValueOnce({ data: mockBillingSummary });

      const result = await saasService.getTenantBilling('tenant-123');

      expect(mockGet).toHaveBeenCalledWith('/api/saas/tenants/tenant-123/billing');
      expect(result.data.status).toBe('paid');
      expect(result.data.invoices).toHaveLength(1);
    });

    it('should include billing amounts', async () => {
      mockGet.mockResolvedValueOnce({ data: mockBillingSummary });

      const result = await saasService.getTenantBilling('tenant-123');

      expect(result.data.amountPaid).toBe(15000);
      expect(result.data.amountDue).toBe(0);
      expect(result.data.currency).toBe('NOK');
    });

    it('should include next billing date', async () => {
      mockGet.mockResolvedValueOnce({ data: mockBillingSummary });

      const result = await saasService.getTenantBilling('tenant-123');

      expect(result.data.nextBillingDate).toBe('2024-07-01T00:00:00Z');
    });

    it('should handle overdue billing status', async () => {
      const overdueBilling = { ...mockBillingSummary, status: 'overdue' as const, amountDue: 15000 };
      mockGet.mockResolvedValueOnce({ data: overdueBilling });

      const result = await saasService.getTenantBilling('tenant-123');

      expect(result.data.status).toBe('overdue');
      expect(result.data.amountDue).toBe(15000);
    });
  });

  describe('saasService.getBillingOverview()', () => {
    it('should fetch platform billing overview', async () => {
      const overview = {
        totalRevenue: 500000,
        monthlyRecurring: 150000,
        activeSubscriptions: 50,
        overdueCount: 3,
        currency: 'NOK',
      };
      mockGet.mockResolvedValueOnce({ data: overview });

      const result = await saasService.getBillingOverview();

      expect(mockGet).toHaveBeenCalledWith('/api/saas/billing');
      expect(result.data.totalRevenue).toBe(500000);
      expect(result.data.activeSubscriptions).toBe(50);
    });
  });
});

// =============================================================================
// Test Suite: Secrets Operations
// =============================================================================

describe('SaaS Tenant Management - Secrets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('saasService.getTenantSecrets()', () => {
    it('should fetch tenant secrets (masked)', async () => {
      mockGet.mockResolvedValueOnce({ data: mockSecrets });

      const result = await saasService.getTenantSecrets('tenant-123');

      expect(mockGet).toHaveBeenCalledWith('/api/saas/tenants/tenant-123/secrets');
      expect(result.data[0].key).toBe('VIPPS_CLIENT_ID');
      expect(result.data[0].isConfigured).toBe(true);
    });

    it('should include secret metadata', async () => {
      mockGet.mockResolvedValueOnce({ data: mockSecrets });

      const result = await saasService.getTenantSecrets('tenant-123');

      expect(result.data[0].provider).toBe('Vipps');
      expect(result.data[0].fingerprint).toBe('abc123def456');
    });

    it('should handle tenant with no secrets', async () => {
      mockGet.mockResolvedValueOnce({ data: [] });

      const result = await saasService.getTenantSecrets('tenant-123');

      expect(result.data).toHaveLength(0);
    });
  });

  describe('saasService.updateTenantSecret()', () => {
    it('should update a tenant secret', async () => {
      const updatedSecret = { ...mockSecrets[0], updatedAt: '2024-06-20T15:00:00Z' };
      mockPut.mockResolvedValueOnce({ data: updatedSecret });

      await saasService.updateTenantSecret('tenant-123', 'VIPPS_CLIENT_ID', { value: 'new-value' });

      expect(mockPut).toHaveBeenCalledWith('/api/saas/tenants/tenant-123/secrets/VIPPS_CLIENT_ID', { value: 'new-value' });
    });

    it('should update secret with rotation flag', async () => {
      mockPut.mockResolvedValueOnce({ data: mockSecrets[0] });

      await saasService.updateTenantSecret('tenant-123', 'VIPPS_CLIENT_ID', {
        value: 'new-value',
        rotateExisting: true
      });

      expect(mockPut).toHaveBeenCalledWith('/api/saas/tenants/tenant-123/secrets/VIPPS_CLIENT_ID', {
        value: 'new-value',
        rotateExisting: true,
      });
    });
  });
});

// =============================================================================
// Test Suite: Category Entitlements
// =============================================================================

describe('SaaS Tenant Management - Category Entitlements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('saasService.getTenantCategories()', () => {
    it('should fetch tenant category entitlements', async () => {
      mockGet.mockResolvedValueOnce({ data: mockCategoryEntitlements });

      const result = await saasService.getTenantCategories('tenant-123');

      expect(mockGet).toHaveBeenCalledWith('/api/saas/tenants/tenant-123/categories');
      expect(result.data[0].categoryKey).toBe('sports');
      expect(result.data[0].enabled).toBe(true);
    });
  });

  describe('saasService.updateTenantCategories()', () => {
    it('should update tenant category entitlements', async () => {
      mockPut.mockResolvedValueOnce({ data: mockCategoryEntitlements });

      await saasService.updateTenantCategories('tenant-123', {
        categories: [
          { categoryKey: 'sports', enabled: true },
          { categoryKey: 'culture', enabled: false, reason: 'Not in plan' },
        ],
      });

      expect(mockPut).toHaveBeenCalledWith('/api/saas/tenants/tenant-123/categories', {
        categories: [
          { categoryKey: 'sports', enabled: true },
          { categoryKey: 'culture', enabled: false, reason: 'Not in plan' },
        ],
      });
    });
  });
});

// =============================================================================
// Test Suite: Error Handling
// =============================================================================

describe('SaaS Tenant Management - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('RFC 7807 Error Responses', () => {
    it('should handle 404 not found error', async () => {
      mockGet.mockRejectedValueOnce({
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Tenant not found',
        status: 404,
        detail: 'Tenant with ID invalid-id does not exist',
      });

      await expect(saasService.getTenant('invalid-id')).rejects.toMatchObject({
        status: 404,
        title: 'Tenant not found',
      });
    });

    it('should handle 400 validation error', async () => {
      mockPost.mockRejectedValueOnce({
        type: 'https://api.digilist.no/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: 'Name is required',
      });

      await expect(saasService.createTenant({ name: '' })).rejects.toMatchObject({
        status: 400,
        title: 'Validation Error',
      });
    });

    it('should handle 403 forbidden error', async () => {
      mockGet.mockRejectedValueOnce({
        type: 'https://api.digilist.no/errors/forbidden',
        title: 'Forbidden',
        status: 403,
        detail: 'You do not have permission to access this tenant',
      });

      await expect(saasService.getTenant('restricted-tenant')).rejects.toMatchObject({
        status: 403,
        title: 'Forbidden',
      });
    });

    it('should handle 409 conflict error', async () => {
      mockPost.mockRejectedValueOnce({
        type: 'https://api.digilist.no/errors/conflict',
        title: 'Conflict',
        status: 409,
        detail: 'A tenant with this slug already exists',
      });

      await expect(saasService.createTenant({ name: 'Test', slug: 'existing' })).rejects.toMatchObject({
        status: 409,
      });
    });

    it('should handle 500 server error', async () => {
      mockGet.mockRejectedValueOnce({
        type: 'https://api.digilist.no/errors/internal-error',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An unexpected error occurred',
      });

      await expect(saasService.getTenants()).rejects.toMatchObject({
        status: 500,
      });
    });
  });

  describe('Network Errors', () => {
    it('should handle network timeout', async () => {
      mockGet.mockRejectedValueOnce(new Error('Network timeout'));

      await expect(saasService.getTenants()).rejects.toThrow('Network timeout');
    });

    it('should handle connection refused', async () => {
      mockGet.mockRejectedValueOnce(new Error('Connection refused'));

      await expect(saasService.getTenants()).rejects.toThrow('Connection refused');
    });
  });
});

// =============================================================================
// Test Suite: Edge Cases
// =============================================================================

describe('SaaS Tenant Management - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Special Characters in Data', () => {
    it('should handle tenant name with special characters', async () => {
      const specialTenant = { ...mockTenant, name: "Oslo's Kommune & Friends" };
      mockPost.mockResolvedValueOnce({ data: specialTenant });

      const result = await saasService.createTenant({
        name: "Oslo's Kommune & Friends",
      });

      expect(result.data.name).toBe("Oslo's Kommune & Friends");
    });

    it('should handle tenant name with Norwegian characters', async () => {
      const norwegianTenant = { ...mockTenant, name: 'Bodø Kommuneærving' };
      mockPost.mockResolvedValueOnce({ data: norwegianTenant });

      const result = await saasService.createTenant({
        name: 'Bodø Kommuneærving',
      });

      expect(result.data.name).toBe('Bodø Kommuneærving');
    });

    it('should handle search with special characters', async () => {
      mockGet.mockResolvedValueOnce({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      await saasService.getTenants({ search: 'Oslo & Bergen' });

      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('search='));
    });
  });

  describe('Pagination Edge Cases', () => {
    it('should handle large page numbers', async () => {
      mockGet.mockResolvedValueOnce({ data: [], meta: { total: 1000, page: 100, limit: 10, totalPages: 100 } });

      const result = await saasService.getTenants({ page: 100, limit: 10 });

      expect(result.meta.page).toBe(100);
      expect(result.meta.totalPages).toBe(100);
    });

    it('should handle large data sets', async () => {
      const largeTenantList = {
        data: Array(100).fill(mockTenant).map((t, i) => ({ ...t, id: `tenant-${i}` })),
        meta: { total: 10000, page: 1, limit: 100, totalPages: 100 },
      };
      mockGet.mockResolvedValueOnce(largeTenantList);

      const result = await saasService.getTenants({ limit: 100 });

      expect(result.data).toHaveLength(100);
      expect(result.meta.total).toBe(10000);
    });
  });

  describe('Tenant Status Transitions', () => {
    it('should correctly represent active status', async () => {
      mockGet.mockResolvedValueOnce({ data: { ...mockTenantWithStats, status: 'active' } });

      const result = await saasService.getTenant('tenant-123');

      expect(result.data.status).toBe('active');
    });

    it('should correctly represent suspended status', async () => {
      mockGet.mockResolvedValueOnce({ data: { ...mockTenantWithStats, status: 'suspended' } });

      const result = await saasService.getTenant('tenant-123');

      expect(result.data.status).toBe('suspended');
    });

    it('should correctly represent pending status', async () => {
      mockGet.mockResolvedValueOnce({ data: { ...mockTenantWithStats, status: 'pending' } });

      const result = await saasService.getTenant('tenant-123');

      expect(result.data.status).toBe('pending');
    });

    it('should correctly represent inactive status', async () => {
      mockGet.mockResolvedValueOnce({ data: { ...mockTenantWithStats, status: 'inactive' } });

      const result = await saasService.getTenant('tenant-123');

      expect(result.data.status).toBe('inactive');
    });
  });

  describe('Optional Fields Handling', () => {
    it('should handle tenant without domain', async () => {
      const tenantNoDomain = { ...mockTenantWithStats, domain: undefined };
      mockGet.mockResolvedValueOnce({ data: tenantNoDomain });

      const result = await saasService.getTenant('tenant-123');

      expect(result.data.domain).toBeUndefined();
    });

    it('should handle tenant without subscription plan', async () => {
      const tenantNoPlan = { ...mockTenantWithStats, subscriptionPlanId: undefined, subscriptionPlanName: undefined };
      mockGet.mockResolvedValueOnce({ data: tenantNoPlan });

      const result = await saasService.getTenant('tenant-123');

      expect(result.data.subscriptionPlanId).toBeUndefined();
      expect(result.data.subscriptionPlanName).toBeUndefined();
    });

    it('should handle tenant without license key', async () => {
      const tenantNoLicense = { ...mockTenantWithStats, licenseKeyFingerprint: undefined, licenseKeyRotatedAt: undefined };
      mockGet.mockResolvedValueOnce({ data: tenantNoLicense });

      const result = await saasService.getTenant('tenant-123');

      expect(result.data.licenseKeyFingerprint).toBeUndefined();
    });
  });
});
