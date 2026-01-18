import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustodyEvaluator } from '../../apps/api/src/modules/custody/custody.evaluator';
import { CustodyScope } from '../../apps/api/src/modules/custody/types';
import { Roles } from '../../apps/api/src/modules/auth/rbac';

describe('CustodyEvaluator', () => {
  let evaluator: CustodyEvaluator;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      query: {
        orgMemberships: {
          findMany: vi.fn(),
        },
        rentalObjectCustodyGrants: {
          findMany: vi.fn(),
        },
        rentalObjectCustodySubgrants: {
          findMany: vi.fn(),
        },
      },
    };
    evaluator = new CustodyEvaluator(mockDb);
  });

  const user = {
    userId: 'user-1',
    tenantId: 'tenant-1',
    role: Roles.USER,
  };

  const rentalObjectId = 'ro-1';

  describe('can', () => {
    it('should allow SAAS_SUPER_ADMIN full access', async () => {
      const adminUser = { ...user, role: Roles.SAAS_SUPER_ADMIN };
      const result = await evaluator.can(adminUser, CustodyScope.RO_EDIT, rentalObjectId);
      expect(result).toBe(true);
      expect(mockDb.query.orgMemberships.findMany).not.toHaveBeenCalled();
    });

    it('should allow TENANT_ADMIN full access', async () => {
      const adminUser = { ...user, role: Roles.TENANT_ADMIN };
      const result = await evaluator.can(adminUser, CustodyScope.RO_EDIT, rentalObjectId);
      expect(result).toBe(true);
    });

    it('should allow COMMUNE_ADMIN full access', async () => {
      const adminUser = { ...user, role: 'admin' };
      const result = await evaluator.can(adminUser, CustodyScope.RO_EDIT, rentalObjectId);
      expect(result).toBe(true);
    });

    it('should allow if direct USER grant exists', async () => {
      mockDb.query.orgMemberships.findMany.mockResolvedValue([]);
      mockDb.query.rentalObjectCustodyGrants.findMany.mockResolvedValue([
        { scopes: [CustodyScope.RO_VIEW, CustodyScope.RO_EDIT] },
      ]);

      const result = await evaluator.can(user, CustodyScope.RO_EDIT, rentalObjectId);
      expect(result).toBe(true);
      expect(mockDb.query.rentalObjectCustodyGrants.findMany).toHaveBeenCalled();
    });

    it('should deny if direct USER grant does not have required scope', async () => {
      mockDb.query.orgMemberships.findMany.mockResolvedValue([]);
      mockDb.query.rentalObjectCustodyGrants.findMany.mockResolvedValue([
        { scopes: [CustodyScope.RO_VIEW] },
      ]);

      const result = await evaluator.can(user, CustodyScope.RO_EDIT, rentalObjectId);
      expect(result).toBe(false);
    });

    it('should allow if ORG grant exists and user is member', async () => {
      mockDb.query.orgMemberships.findMany.mockResolvedValue([
        { organizationId: 'org-1' },
      ]);
      mockDb.query.rentalObjectCustodyGrants.findMany
        .mockResolvedValueOnce([]) // USER grants
        .mockResolvedValueOnce([{ scopes: [CustodyScope.RO_MAINTENANCE] }]); // ORG grants

      const result = await evaluator.can(user, CustodyScope.RO_MAINTENANCE, rentalObjectId);
      expect(result).toBe(true);
    });

    it('should allow if subgrant exists', async () => {
      mockDb.query.orgMemberships.findMany.mockResolvedValue([
        { organizationId: 'org-1' },
      ]);
      mockDb.query.rentalObjectCustodyGrants.findMany
        .mockResolvedValueOnce([]) // USER grants
        .mockResolvedValueOnce([]); // ORG grants
      
      mockDb.query.rentalObjectCustodySubgrants.findMany.mockResolvedValue([
        {
          scopes: [CustodyScope.RO_BOOKING_MANAGE],
          parentGrant: {
            rentalObjectId: rentalObjectId,
            status: 'ACTIVE',
          },
        },
      ]);

      const result = await evaluator.can(user, CustodyScope.RO_BOOKING_MANAGE, rentalObjectId);
      expect(result).toBe(true);
    });

    it('should deny if subgrant exists but parent is for different object', async () => {
      mockDb.query.orgMemberships.findMany.mockResolvedValue([
        { organizationId: 'org-1' },
      ]);
      mockDb.query.rentalObjectCustodyGrants.findMany
        .mockResolvedValueOnce([]) // USER grants
        .mockResolvedValueOnce([]); // ORG grants
      
      mockDb.query.rentalObjectCustodySubgrants.findMany.mockResolvedValue([
        {
          scopes: [CustodyScope.RO_BOOKING_MANAGE],
          parentGrant: {
            rentalObjectId: 'other-ro',
            status: 'ACTIVE',
          },
        },
      ]);

      const result = await evaluator.can(user, CustodyScope.RO_BOOKING_MANAGE, rentalObjectId);
      expect(result).toBe(false);
    });
  });

  describe('getEffectiveScopes', () => {
    it('should return all scopes for admin', async () => {
      const adminUser = { ...user, role: Roles.TENANT_ADMIN };
      const result = await evaluator.getEffectiveScopes(adminUser, rentalObjectId);
      expect(result.size).toBe(Object.values(CustodyScope).length);
      expect(result.has(CustodyScope.RO_VIEW)).toBe(true);
    });

    it('should combine scopes from all sources', async () => {
      mockDb.query.orgMemberships.findMany.mockResolvedValue([
        { organizationId: 'org-1' },
      ]);
      
      mockDb.query.rentalObjectCustodyGrants.findMany
        .mockResolvedValueOnce([{ scopes: [CustodyScope.RO_VIEW] }]) // USER grants
        .mockResolvedValueOnce([{ scopes: [CustodyScope.RO_EDIT] }]); // ORG grants
      
      mockDb.query.rentalObjectCustodySubgrants.findMany.mockResolvedValue([
        {
          scopes: [CustodyScope.RO_MAINTENANCE],
          parentGrant: {
            rentalObjectId: rentalObjectId,
            status: 'ACTIVE',
          },
        },
      ]);

      const result = await evaluator.getEffectiveScopes(user, rentalObjectId);
      expect(result.has(CustodyScope.RO_VIEW)).toBe(true);
      expect(result.has(CustodyScope.RO_EDIT)).toBe(true);
      expect(result.has(CustodyScope.RO_MAINTENANCE)).toBe(true);
      expect(result.has(CustodyScope.RO_BOOKING_MANAGE)).toBe(false);
    });
  });
});
