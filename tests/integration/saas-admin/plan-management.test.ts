/**
 * Integration Tests for SaaS Admin Plan Management
 *
 * Tests the SDK service layer for plan CRUD operations:
 * - getPlans: List plans with pagination/filtering
 * - getPlan: Get single plan details
 * - createPlan: Create new subscription plan
 * - updatePlan: Update plan details
 *
 * These tests mock the HTTP layer to verify SDK service behavior
 * and ensure proper API contract compliance.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// =============================================================================
// Test Fixtures
// =============================================================================

const mockEntitlements = {
  modules: {
    rating: true,
    recommendations: true,
    feedback: true,
    favorites: true,
    share: true,
    recurringBookings: true,
  },
  integrations: {
    visma: true,
    rco: true,
    acos: true,
    outlook: true,
    vipps: true,
  },
  features: {
    customBranding: true,
    apiAccess: true,
    webhooks: true,
    advancedReporting: true,
    prioritySupport: true,
  },
};

const mockBasicEntitlements = {
  modules: {
    rating: true,
    recommendations: false,
    feedback: true,
    favorites: true,
    share: false,
    recurringBookings: false,
  },
  integrations: {
    visma: false,
    rco: false,
    acos: false,
    outlook: true,
    vipps: false,
  },
  features: {
    customBranding: false,
    apiAccess: false,
    webhooks: false,
    advancedReporting: false,
    prioritySupport: false,
  },
};

const mockPlan = {
  id: 'plan-enterprise',
  name: 'Enterprise',
  slug: 'enterprise',
  description: 'Full-featured enterprise plan for large municipalities',
  seatLimits: {
    maxUsers: 200,
    maxOrganizations: 20,
    maxListings: 1000,
    maxBookingsPerMonth: 5000,
    maxStorageMb: 5000,
  },
  entitlements: mockEntitlements,
  basePrice: 15000,
  currency: 'NOK',
  billingPeriod: 'monthly' as const,
  trialDays: 30,
  isPublic: true,
  status: 'active' as const,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-06-20T14:30:00Z',
};

const mockBasicPlan = {
  id: 'plan-basic',
  name: 'Basic',
  slug: 'basic',
  description: 'Basic plan for small organizations',
  seatLimits: {
    maxUsers: 10,
    maxOrganizations: 1,
    maxListings: 50,
    maxBookingsPerMonth: 200,
    maxStorageMb: 500,
  },
  entitlements: mockBasicEntitlements,
  basePrice: 2500,
  currency: 'NOK',
  billingPeriod: 'monthly' as const,
  trialDays: 14,
  isPublic: true,
  status: 'active' as const,
  createdAt: '2024-01-10T10:00:00Z',
  updatedAt: '2024-06-15T14:30:00Z',
};

const mockProPlan = {
  id: 'plan-pro',
  name: 'Professional',
  slug: 'professional',
  description: 'Professional plan for medium municipalities',
  seatLimits: {
    maxUsers: 50,
    maxOrganizations: 5,
    maxListings: 250,
    maxBookingsPerMonth: 1500,
    maxStorageMb: 2000,
  },
  entitlements: {
    ...mockEntitlements,
    features: {
      ...mockEntitlements.features,
      prioritySupport: false,
    },
  },
  basePrice: 7500,
  currency: 'NOK',
  billingPeriod: 'monthly' as const,
  trialDays: 14,
  isPublic: true,
  status: 'active' as const,
  createdAt: '2024-01-12T10:00:00Z',
  updatedAt: '2024-06-18T14:30:00Z',
};

const mockPlanList = {
  data: [mockBasicPlan, mockProPlan, mockPlan],
  meta: {
    total: 3,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

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
// Test Suite: Plan List Operations
// =============================================================================

describe('SaaS Plan Management - List Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('saasService.getPlans()', () => {
    it('should fetch plans list without parameters', async () => {
      mockGet.mockResolvedValueOnce(mockPlanList);

      const result = await saasService.getPlans();

      expect(mockGet).toHaveBeenCalledWith('/api/saas/plans');
      expect(result.data).toHaveLength(3);
      expect(result.data[0].name).toBe('Basic');
    });

    it('should fetch plans with pagination parameters', async () => {
      mockGet.mockResolvedValueOnce(mockPlanList);

      await saasService.getPlans({ page: 1, limit: 20 });

      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('page=1'));
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('limit=20'));
    });

    it('should fetch plans with status filter', async () => {
      mockGet.mockResolvedValueOnce({ data: [mockPlan], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } });

      await saasService.getPlans({ status: 'active' });

      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('status=active'));
    });

    it('should fetch plans with isPublic filter', async () => {
      mockGet.mockResolvedValueOnce({ data: [mockPlan], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } });

      await saasService.getPlans({ isPublic: true });

      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('isPublic=true'));
    });

    it('should handle empty plans list', async () => {
      mockGet.mockResolvedValueOnce({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });

      const result = await saasService.getPlans();

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('should combine multiple filter parameters', async () => {
      mockGet.mockResolvedValueOnce(mockPlanList);

      await saasService.getPlans({
        page: 2,
        limit: 25,
        status: 'active',
        isPublic: true,
      });

      const calledUrl = mockGet.mock.calls[0][0] as string;
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('limit=25');
      expect(calledUrl).toContain('status=active');
      expect(calledUrl).toContain('isPublic=true');
    });

    it('should return plans sorted by name', async () => {
      mockGet.mockResolvedValueOnce(mockPlanList);

      const result = await saasService.getPlans();

      expect(result.data[0].name).toBe('Basic');
      expect(result.data[1].name).toBe('Professional');
      expect(result.data[2].name).toBe('Enterprise');
    });
  });
});

// =============================================================================
// Test Suite: Plan Detail Operations
// =============================================================================

describe('SaaS Plan Management - Detail Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('saasService.getPlan()', () => {
    it('should fetch single plan by ID', async () => {
      mockGet.mockResolvedValueOnce({ data: mockPlan });

      const result = await saasService.getPlan('plan-enterprise');

      expect(mockGet).toHaveBeenCalledWith('/api/saas/plans/plan-enterprise');
      expect(result.data.name).toBe('Enterprise');
      expect(result.data.basePrice).toBe(15000);
    });

    it('should include seat limits', async () => {
      mockGet.mockResolvedValueOnce({ data: mockPlan });

      const result = await saasService.getPlan('plan-enterprise');

      expect(result.data.seatLimits).toBeDefined();
      expect(result.data.seatLimits.maxUsers).toBe(200);
      expect(result.data.seatLimits.maxOrganizations).toBe(20);
      expect(result.data.seatLimits.maxListings).toBe(1000);
      expect(result.data.seatLimits.maxBookingsPerMonth).toBe(5000);
      expect(result.data.seatLimits.maxStorageMb).toBe(5000);
    });

    it('should include entitlements', async () => {
      mockGet.mockResolvedValueOnce({ data: mockPlan });

      const result = await saasService.getPlan('plan-enterprise');

      expect(result.data.entitlements).toBeDefined();
      expect(result.data.entitlements.modules.rating).toBe(true);
      expect(result.data.entitlements.integrations.visma).toBe(true);
      expect(result.data.entitlements.features.apiAccess).toBe(true);
    });

    it('should include billing information', async () => {
      mockGet.mockResolvedValueOnce({ data: mockPlan });

      const result = await saasService.getPlan('plan-enterprise');

      expect(result.data.basePrice).toBe(15000);
      expect(result.data.currency).toBe('NOK');
      expect(result.data.billingPeriod).toBe('monthly');
      expect(result.data.trialDays).toBe(30);
    });

    it('should handle non-existent plan with RFC 7807 error', async () => {
      mockGet.mockRejectedValueOnce({
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Plan not found',
        status: 404,
        detail: 'Plan with ID non-existent does not exist',
      });

      await expect(saasService.getPlan('non-existent')).rejects.toMatchObject({
        status: 404,
        title: 'Plan not found',
      });
    });
  });
});

// =============================================================================
// Test Suite: Plan Create Operations
// =============================================================================

describe('SaaS Plan Management - Create Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('saasService.createPlan()', () => {
    it('should create a new plan with required fields', async () => {
      const newPlan = { ...mockBasicPlan, id: 'new-plan-123' };
      mockPost.mockResolvedValueOnce({ data: newPlan });

      const result = await saasService.createPlan({
        name: 'Basic',
        seatLimits: mockBasicPlan.seatLimits,
        entitlements: mockBasicEntitlements,
        basePrice: 2500,
        billingPeriod: 'monthly',
      });

      expect(mockPost).toHaveBeenCalledWith('/api/saas/plans', {
        name: 'Basic',
        seatLimits: mockBasicPlan.seatLimits,
        entitlements: mockBasicEntitlements,
        basePrice: 2500,
        billingPeriod: 'monthly',
      });
      expect(result.data.name).toBe('Basic');
    });

    it('should create plan with full details', async () => {
      mockPost.mockResolvedValueOnce({ data: mockPlan });

      await saasService.createPlan({
        name: 'Enterprise',
        slug: 'enterprise',
        description: 'Full-featured enterprise plan',
        seatLimits: mockPlan.seatLimits,
        entitlements: mockEntitlements,
        basePrice: 15000,
        currency: 'NOK',
        billingPeriod: 'monthly',
        trialDays: 30,
        isPublic: true,
      });

      expect(mockPost).toHaveBeenCalledWith('/api/saas/plans', {
        name: 'Enterprise',
        slug: 'enterprise',
        description: 'Full-featured enterprise plan',
        seatLimits: mockPlan.seatLimits,
        entitlements: mockEntitlements,
        basePrice: 15000,
        currency: 'NOK',
        billingPeriod: 'monthly',
        trialDays: 30,
        isPublic: true,
      });
    });

    it('should create plan with yearly billing period', async () => {
      const yearlyPlan = { ...mockPlan, billingPeriod: 'yearly' as const, basePrice: 150000 };
      mockPost.mockResolvedValueOnce({ data: yearlyPlan });

      await saasService.createPlan({
        name: 'Enterprise Yearly',
        seatLimits: mockPlan.seatLimits,
        entitlements: mockEntitlements,
        basePrice: 150000,
        billingPeriod: 'yearly',
      });

      expect(mockPost).toHaveBeenCalledWith('/api/saas/plans', expect.objectContaining({
        billingPeriod: 'yearly',
        basePrice: 150000,
      }));
    });

    it('should create plan with lifetime billing period', async () => {
      const lifetimePlan = { ...mockPlan, billingPeriod: 'lifetime' as const, basePrice: 500000 };
      mockPost.mockResolvedValueOnce({ data: lifetimePlan });

      await saasService.createPlan({
        name: 'Enterprise Lifetime',
        seatLimits: mockPlan.seatLimits,
        entitlements: mockEntitlements,
        basePrice: 500000,
        billingPeriod: 'lifetime',
      });

      expect(mockPost).toHaveBeenCalledWith('/api/saas/plans', expect.objectContaining({
        billingPeriod: 'lifetime',
      }));
    });

    it('should create plan with custom trial days', async () => {
      mockPost.mockResolvedValueOnce({ data: { ...mockPlan, trialDays: 60 } });

      await saasService.createPlan({
        name: 'Enterprise',
        seatLimits: mockPlan.seatLimits,
        entitlements: mockEntitlements,
        basePrice: 15000,
        billingPeriod: 'monthly',
        trialDays: 60,
      });

      expect(mockPost).toHaveBeenCalledWith('/api/saas/plans', expect.objectContaining({
        trialDays: 60,
      }));
    });

    it('should create private (non-public) plan', async () => {
      mockPost.mockResolvedValueOnce({ data: { ...mockPlan, isPublic: false } });

      await saasService.createPlan({
        name: 'Enterprise Custom',
        seatLimits: mockPlan.seatLimits,
        entitlements: mockEntitlements,
        basePrice: 20000,
        billingPeriod: 'monthly',
        isPublic: false,
      });

      expect(mockPost).toHaveBeenCalledWith('/api/saas/plans', expect.objectContaining({
        isPublic: false,
      }));
    });

    it('should handle validation error for duplicate slug', async () => {
      mockPost.mockRejectedValueOnce({
        type: 'https://api.digilist.no/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: 'A plan with this slug already exists',
      });

      await expect(saasService.createPlan({
        name: 'Another Enterprise',
        slug: 'enterprise',
        seatLimits: mockPlan.seatLimits,
        entitlements: mockEntitlements,
        basePrice: 15000,
        billingPeriod: 'monthly',
      })).rejects.toMatchObject({
        status: 400,
        title: 'Validation Error',
      });
    });

    it('should handle validation error for invalid price', async () => {
      mockPost.mockRejectedValueOnce({
        type: 'https://api.digilist.no/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: 'Base price must be a positive number',
      });

      await expect(saasService.createPlan({
        name: 'Invalid Plan',
        seatLimits: mockPlan.seatLimits,
        entitlements: mockEntitlements,
        basePrice: -100,
        billingPeriod: 'monthly',
      })).rejects.toMatchObject({
        status: 400,
      });
    });
  });
});

// =============================================================================
// Test Suite: Plan Update Operations
// =============================================================================

describe('SaaS Plan Management - Update Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('saasService.updatePlan()', () => {
    it('should update plan name', async () => {
      const updatedPlan = { ...mockPlan, name: 'Enterprise Plus' };
      mockPatch.mockResolvedValueOnce({ data: updatedPlan });

      const result = await saasService.updatePlan('plan-enterprise', { name: 'Enterprise Plus' });

      expect(mockPatch).toHaveBeenCalledWith('/api/saas/plans/plan-enterprise', { name: 'Enterprise Plus' });
      expect(result.data.name).toBe('Enterprise Plus');
    });

    it('should update plan description', async () => {
      const updatedPlan = { ...mockPlan, description: 'Updated enterprise description' };
      mockPatch.mockResolvedValueOnce({ data: updatedPlan });

      const result = await saasService.updatePlan('plan-enterprise', { description: 'Updated enterprise description' });

      expect(mockPatch).toHaveBeenCalledWith('/api/saas/plans/plan-enterprise', { description: 'Updated enterprise description' });
      expect(result.data.description).toBe('Updated enterprise description');
    });

    it('should update plan price', async () => {
      const updatedPlan = { ...mockPlan, basePrice: 18000 };
      mockPatch.mockResolvedValueOnce({ data: updatedPlan });

      const result = await saasService.updatePlan('plan-enterprise', { basePrice: 18000 });

      expect(mockPatch).toHaveBeenCalledWith('/api/saas/plans/plan-enterprise', { basePrice: 18000 });
      expect(result.data.basePrice).toBe(18000);
    });

    it('should update plan trial days', async () => {
      const updatedPlan = { ...mockPlan, trialDays: 45 };
      mockPatch.mockResolvedValueOnce({ data: updatedPlan });

      await saasService.updatePlan('plan-enterprise', { trialDays: 45 });

      expect(mockPatch).toHaveBeenCalledWith('/api/saas/plans/plan-enterprise', { trialDays: 45 });
    });

    it('should update plan status to inactive', async () => {
      const updatedPlan = { ...mockPlan, status: 'inactive' as const };
      mockPatch.mockResolvedValueOnce({ data: updatedPlan });

      const result = await saasService.updatePlan('plan-enterprise', { status: 'inactive' });

      expect(mockPatch).toHaveBeenCalledWith('/api/saas/plans/plan-enterprise', { status: 'inactive' });
      expect(result.data.status).toBe('inactive');
    });

    it('should update plan status to deprecated', async () => {
      const updatedPlan = { ...mockPlan, status: 'deprecated' as const };
      mockPatch.mockResolvedValueOnce({ data: updatedPlan });

      const result = await saasService.updatePlan('plan-enterprise', { status: 'deprecated' });

      expect(mockPatch).toHaveBeenCalledWith('/api/saas/plans/plan-enterprise', { status: 'deprecated' });
      expect(result.data.status).toBe('deprecated');
    });

    it('should update plan isPublic flag', async () => {
      const updatedPlan = { ...mockPlan, isPublic: false };
      mockPatch.mockResolvedValueOnce({ data: updatedPlan });

      await saasService.updatePlan('plan-enterprise', { isPublic: false });

      expect(mockPatch).toHaveBeenCalledWith('/api/saas/plans/plan-enterprise', { isPublic: false });
    });

    it('should update partial seat limits', async () => {
      const updatedPlan = {
        ...mockPlan,
        seatLimits: { ...mockPlan.seatLimits, maxUsers: 300 },
      };
      mockPatch.mockResolvedValueOnce({ data: updatedPlan });

      await saasService.updatePlan('plan-enterprise', {
        seatLimits: { maxUsers: 300 },
      });

      expect(mockPatch).toHaveBeenCalledWith('/api/saas/plans/plan-enterprise', {
        seatLimits: { maxUsers: 300 },
      });
    });

    it('should update multiple seat limits', async () => {
      mockPatch.mockResolvedValueOnce({ data: mockPlan });

      await saasService.updatePlan('plan-enterprise', {
        seatLimits: {
          maxUsers: 500,
          maxOrganizations: 50,
          maxListings: 2000,
        },
      });

      expect(mockPatch).toHaveBeenCalledWith('/api/saas/plans/plan-enterprise', {
        seatLimits: {
          maxUsers: 500,
          maxOrganizations: 50,
          maxListings: 2000,
        },
      });
    });

    it('should update partial entitlements', async () => {
      mockPatch.mockResolvedValueOnce({ data: mockPlan });

      await saasService.updatePlan('plan-enterprise', {
        entitlements: {
          features: { prioritySupport: false },
        },
      });

      expect(mockPatch).toHaveBeenCalledWith('/api/saas/plans/plan-enterprise', {
        entitlements: {
          features: { prioritySupport: false },
        },
      });
    });

    it('should update multiple fields at once', async () => {
      const updatedPlan = {
        ...mockPlan,
        name: 'New Name',
        basePrice: 20000,
        status: 'active' as const,
      };
      mockPatch.mockResolvedValueOnce({ data: updatedPlan });

      await saasService.updatePlan('plan-enterprise', {
        name: 'New Name',
        basePrice: 20000,
        status: 'active',
      });

      expect(mockPatch).toHaveBeenCalledWith('/api/saas/plans/plan-enterprise', {
        name: 'New Name',
        basePrice: 20000,
        status: 'active',
      });
    });

    it('should handle 404 error when plan does not exist', async () => {
      mockPatch.mockRejectedValueOnce({
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Plan not found',
      });

      await expect(saasService.updatePlan('non-existent', { name: 'New Name' }))
        .rejects.toMatchObject({ status: 404 });
    });

    it('should handle 403 forbidden error', async () => {
      mockPatch.mockRejectedValueOnce({
        type: 'https://api.digilist.no/errors/forbidden',
        title: 'Forbidden',
        status: 403,
        detail: 'You do not have permission to update this plan',
      });

      await expect(saasService.updatePlan('plan-enterprise', { name: 'New Name' }))
        .rejects.toMatchObject({ status: 403 });
    });
  });
});

// =============================================================================
// Test Suite: Plan Status Transitions
// =============================================================================

describe('SaaS Plan Management - Status Transitions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('status lifecycle', () => {
    it('should activate an inactive plan', async () => {
      const activatedPlan = { ...mockPlan, status: 'active' as const };
      mockPatch.mockResolvedValueOnce({ data: activatedPlan });

      const result = await saasService.updatePlan('plan-enterprise', { status: 'active' });

      expect(result.data.status).toBe('active');
    });

    it('should deactivate an active plan', async () => {
      const deactivatedPlan = { ...mockPlan, status: 'inactive' as const };
      mockPatch.mockResolvedValueOnce({ data: deactivatedPlan });

      const result = await saasService.updatePlan('plan-enterprise', { status: 'inactive' });

      expect(result.data.status).toBe('inactive');
    });

    it('should deprecate a plan', async () => {
      const deprecatedPlan = { ...mockPlan, status: 'deprecated' as const };
      mockPatch.mockResolvedValueOnce({ data: deprecatedPlan });

      const result = await saasService.updatePlan('plan-enterprise', { status: 'deprecated' });

      expect(result.data.status).toBe('deprecated');
    });

    it('should handle invalid status transition', async () => {
      mockPatch.mockRejectedValueOnce({
        type: 'https://api.digilist.no/errors/invalid-state',
        title: 'Invalid State Transition',
        status: 409,
        detail: 'Cannot transition from deprecated to active. Deprecated plans must be cloned.',
      });

      await expect(saasService.updatePlan('deprecated-plan', { status: 'active' }))
        .rejects.toMatchObject({ status: 409 });
    });
  });
});

// =============================================================================
// Test Suite: Error Handling
// =============================================================================

describe('SaaS Plan Management - Error Handling', () => {
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
        title: 'Plan not found',
        status: 404,
        detail: 'Plan with ID invalid-id does not exist',
      });

      await expect(saasService.getPlan('invalid-id')).rejects.toMatchObject({
        status: 404,
        title: 'Plan not found',
      });
    });

    it('should handle 400 validation error', async () => {
      mockPost.mockRejectedValueOnce({
        type: 'https://api.digilist.no/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: 'Name is required',
      });

      await expect(saasService.createPlan({
        name: '',
        seatLimits: mockPlan.seatLimits,
        entitlements: mockEntitlements,
        basePrice: 15000,
        billingPeriod: 'monthly',
      })).rejects.toMatchObject({
        status: 400,
        title: 'Validation Error',
      });
    });

    it('should handle 403 forbidden error', async () => {
      mockGet.mockRejectedValueOnce({
        type: 'https://api.digilist.no/errors/forbidden',
        title: 'Forbidden',
        status: 403,
        detail: 'You do not have permission to access this plan',
      });

      await expect(saasService.getPlan('restricted-plan')).rejects.toMatchObject({
        status: 403,
        title: 'Forbidden',
      });
    });

    it('should handle 409 conflict error', async () => {
      mockPost.mockRejectedValueOnce({
        type: 'https://api.digilist.no/errors/conflict',
        title: 'Conflict',
        status: 409,
        detail: 'A plan with this slug already exists',
      });

      await expect(saasService.createPlan({
        name: 'Test',
        slug: 'existing',
        seatLimits: mockPlan.seatLimits,
        entitlements: mockEntitlements,
        basePrice: 15000,
        billingPeriod: 'monthly',
      })).rejects.toMatchObject({
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

      await expect(saasService.getPlans()).rejects.toMatchObject({
        status: 500,
      });
    });
  });

  describe('Network Errors', () => {
    it('should handle network timeout', async () => {
      mockGet.mockRejectedValueOnce(new Error('Network timeout'));

      await expect(saasService.getPlans()).rejects.toThrow('Network timeout');
    });

    it('should handle connection refused', async () => {
      mockGet.mockRejectedValueOnce(new Error('Connection refused'));

      await expect(saasService.getPlans()).rejects.toThrow('Connection refused');
    });
  });
});

// =============================================================================
// Test Suite: Edge Cases
// =============================================================================

describe('SaaS Plan Management - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Special Characters in Data', () => {
    it('should handle plan name with special characters', async () => {
      const specialPlan = { ...mockPlan, name: "Enterprise Plus +" };
      mockPost.mockResolvedValueOnce({ data: specialPlan });

      const result = await saasService.createPlan({
        name: "Enterprise Plus +",
        seatLimits: mockPlan.seatLimits,
        entitlements: mockEntitlements,
        basePrice: 20000,
        billingPeriod: 'monthly',
      });

      expect(result.data.name).toBe("Enterprise Plus +");
    });

    it('should handle plan name with Norwegian characters', async () => {
      const norwegianPlan = { ...mockPlan, name: 'Bedrift Høy' };
      mockPost.mockResolvedValueOnce({ data: norwegianPlan });

      const result = await saasService.createPlan({
        name: 'Bedrift Høy',
        seatLimits: mockPlan.seatLimits,
        entitlements: mockEntitlements,
        basePrice: 15000,
        billingPeriod: 'monthly',
      });

      expect(result.data.name).toBe('Bedrift Høy');
    });

    it('should handle description with HTML entities', async () => {
      const htmlPlan = { ...mockPlan, description: 'Plan with <strong>features</strong> & benefits' };
      mockPost.mockResolvedValueOnce({ data: htmlPlan });

      const result = await saasService.createPlan({
        name: 'Test Plan',
        description: 'Plan with <strong>features</strong> & benefits',
        seatLimits: mockPlan.seatLimits,
        entitlements: mockEntitlements,
        basePrice: 15000,
        billingPeriod: 'monthly',
      });

      expect(result.data.description).toBe('Plan with <strong>features</strong> & benefits');
    });
  });

  describe('Pagination Edge Cases', () => {
    it('should handle large page numbers', async () => {
      mockGet.mockResolvedValueOnce({ data: [], meta: { total: 1000, page: 100, limit: 10, totalPages: 100 } });

      const result = await saasService.getPlans({ page: 100, limit: 10 });

      expect(result.meta.page).toBe(100);
      expect(result.meta.totalPages).toBe(100);
    });

    it('should handle large data sets', async () => {
      const largePlanList = {
        data: Array(50).fill(mockPlan).map((p, i) => ({ ...p, id: `plan-${i}`, name: `Plan ${i}` })),
        meta: { total: 500, page: 1, limit: 50, totalPages: 10 },
      };
      mockGet.mockResolvedValueOnce(largePlanList);

      const result = await saasService.getPlans({ limit: 50 });

      expect(result.data).toHaveLength(50);
      expect(result.meta.total).toBe(500);
    });
  });

  describe('Billing Period Variations', () => {
    it('should correctly represent monthly billing', async () => {
      mockGet.mockResolvedValueOnce({ data: { ...mockPlan, billingPeriod: 'monthly' } });

      const result = await saasService.getPlan('plan-enterprise');

      expect(result.data.billingPeriod).toBe('monthly');
    });

    it('should correctly represent yearly billing', async () => {
      mockGet.mockResolvedValueOnce({ data: { ...mockPlan, billingPeriod: 'yearly', basePrice: 150000 } });

      const result = await saasService.getPlan('plan-enterprise');

      expect(result.data.billingPeriod).toBe('yearly');
      expect(result.data.basePrice).toBe(150000);
    });

    it('should correctly represent lifetime billing', async () => {
      mockGet.mockResolvedValueOnce({ data: { ...mockPlan, billingPeriod: 'lifetime', basePrice: 500000 } });

      const result = await saasService.getPlan('plan-enterprise');

      expect(result.data.billingPeriod).toBe('lifetime');
    });
  });

  describe('Entitlements Edge Cases', () => {
    it('should handle plan with all entitlements disabled', async () => {
      const minimalEntitlements = {
        modules: {
          rating: false,
          recommendations: false,
          feedback: false,
          favorites: false,
          share: false,
          recurringBookings: false,
        },
        integrations: {
          visma: false,
          rco: false,
          acos: false,
          outlook: false,
          vipps: false,
        },
        features: {
          customBranding: false,
          apiAccess: false,
          webhooks: false,
          advancedReporting: false,
          prioritySupport: false,
        },
      };
      const minimalPlan = { ...mockPlan, entitlements: minimalEntitlements };
      mockGet.mockResolvedValueOnce({ data: minimalPlan });

      const result = await saasService.getPlan('plan-minimal');

      expect(result.data.entitlements.modules.rating).toBe(false);
      expect(result.data.entitlements.integrations.visma).toBe(false);
      expect(result.data.entitlements.features.apiAccess).toBe(false);
    });

    it('should handle plan with all entitlements enabled', async () => {
      mockGet.mockResolvedValueOnce({ data: mockPlan });

      const result = await saasService.getPlan('plan-enterprise');

      expect(result.data.entitlements.modules.rating).toBe(true);
      expect(result.data.entitlements.modules.recurringBookings).toBe(true);
      expect(result.data.entitlements.integrations.visma).toBe(true);
      expect(result.data.entitlements.features.prioritySupport).toBe(true);
    });
  });

  describe('Seat Limits Edge Cases', () => {
    it('should handle plan with minimum seat limits', async () => {
      const minimalLimits = {
        maxUsers: 1,
        maxOrganizations: 1,
        maxListings: 1,
        maxBookingsPerMonth: 1,
        maxStorageMb: 100,
      };
      const minimalPlan = { ...mockPlan, seatLimits: minimalLimits };
      mockGet.mockResolvedValueOnce({ data: minimalPlan });

      const result = await saasService.getPlan('plan-minimal');

      expect(result.data.seatLimits.maxUsers).toBe(1);
      expect(result.data.seatLimits.maxOrganizations).toBe(1);
    });

    it('should handle plan with unlimited seat limits (high values)', async () => {
      const unlimitedLimits = {
        maxUsers: 999999,
        maxOrganizations: 999999,
        maxListings: 999999,
        maxBookingsPerMonth: 999999,
        maxStorageMb: 999999,
      };
      const unlimitedPlan = { ...mockPlan, seatLimits: unlimitedLimits };
      mockGet.mockResolvedValueOnce({ data: unlimitedPlan });

      const result = await saasService.getPlan('plan-unlimited');

      expect(result.data.seatLimits.maxUsers).toBe(999999);
    });
  });

  describe('Optional Fields Handling', () => {
    it('should handle plan without description', async () => {
      const planNoDescription = { ...mockPlan, description: undefined };
      mockGet.mockResolvedValueOnce({ data: planNoDescription });

      const result = await saasService.getPlan('plan-enterprise');

      expect(result.data.description).toBeUndefined();
    });

    it('should handle plan without slug', async () => {
      const planNoSlug = { ...mockPlan, slug: undefined };
      mockGet.mockResolvedValueOnce({ data: planNoSlug });

      const result = await saasService.getPlan('plan-enterprise');

      expect(result.data.slug).toBeUndefined();
    });

    it('should handle plan with zero trial days', async () => {
      const noTrialPlan = { ...mockPlan, trialDays: 0 };
      mockGet.mockResolvedValueOnce({ data: noTrialPlan });

      const result = await saasService.getPlan('plan-enterprise');

      expect(result.data.trialDays).toBe(0);
    });

    it('should handle plan with zero base price (free plan)', async () => {
      const freePlan = { ...mockPlan, basePrice: 0 };
      mockGet.mockResolvedValueOnce({ data: freePlan });

      const result = await saasService.getPlan('plan-free');

      expect(result.data.basePrice).toBe(0);
    });
  });

  describe('Currency Handling', () => {
    it('should handle NOK currency', async () => {
      mockGet.mockResolvedValueOnce({ data: { ...mockPlan, currency: 'NOK' } });

      const result = await saasService.getPlan('plan-enterprise');

      expect(result.data.currency).toBe('NOK');
    });

    it('should handle EUR currency', async () => {
      mockGet.mockResolvedValueOnce({ data: { ...mockPlan, currency: 'EUR' } });

      const result = await saasService.getPlan('plan-enterprise');

      expect(result.data.currency).toBe('EUR');
    });

    it('should handle USD currency', async () => {
      mockGet.mockResolvedValueOnce({ data: { ...mockPlan, currency: 'USD' } });

      const result = await saasService.getPlan('plan-enterprise');

      expect(result.data.currency).toBe('USD');
    });
  });
});
