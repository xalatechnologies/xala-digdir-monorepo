import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustodyEvaluator } from '@testing/stubs/api-importsmodules/custody/custody.evaluator';
import { CustodyScope, UserContext } from '@testing/stubs/api-importsmodules/custody/types';
import { Roles } from '@testing/stubs/api-importsmodules/auth/rbac';

describe('CustodyEvaluator', () => {
  let evaluator: CustodyEvaluator;
  let mockDb: any;

  const tenantId = 'tenant-1';
  const userId = 'user-1';
  const rentalObjectId = 'ro-1';
  const orgId = 'org-1';

  const userContext: UserContext = {
    userId,
    tenantId,
    role: Roles.USER,
  };

  const adminContext: UserContext = {
    userId: 'admin-1',
    tenantId,
    role: Roles.TENANT_ADMIN,
  };

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

  describe('can()', () => {
    it('should allow TENANT_ADMIN full access', async () => {
      const result = await evaluator.can(adminContext, CustodyScope.RO_EDIT, rentalObjectId);
      expect(result).toBe(true);
      // Should not even query DB
      expect(mockDb.query.orgMemberships.findMany).not.toHaveBeenCalled();
    });

    it('should allow access via direct USER grant', async () => {
      mockDb.query.orgMemberships.findMany.mockResolvedValue([]);
      mockDb.query.rentalObjectCustodyGrants.findMany.mockResolvedValue([
        { scopes: [CustodyScope.RO_VIEW, CustodyScope.RO_EDIT] },
      ]);

      const result = await evaluator.can(userContext, CustodyScope.RO_EDIT, rentalObjectId);
      expect(result).toBe(true);
      expect(mockDb.query.rentalObjectCustodyGrants.findMany).toHaveBeenCalled();
    });

    it('should deny access if scope is missing in direct grant', async () => {
      mockDb.query.orgMemberships.findMany.mockResolvedValue([]);
      mockDb.query.rentalObjectCustodyGrants.findMany.mockResolvedValue([
        { scopes: [CustodyScope.RO_VIEW] },
      ]);

      const result = await evaluator.can(userContext, CustodyScope.RO_EDIT, rentalObjectId);
      expect(result).toBe(false);
    });

    it('should allow access via ORG grant', async () => {
      mockDb.query.orgMemberships.findMany.mockResolvedValue([{ organizationId: orgId }]);
      // First call is for direct grants (returning empty)
      mockDb.query.rentalObjectCustodyGrants.findMany
        .mockResolvedValueOnce([]) // Direct
        .mockResolvedValueOnce([ // Org
          { scopes: [CustodyScope.RO_MAINTENANCE] }
        ]);

      const result = await evaluator.can(userContext, CustodyScope.RO_MAINTENANCE, rentalObjectId);
      expect(result).toBe(true);
    });

    it('should allow access via subgrant', async () => {
      mockDb.query.orgMemberships.findMany.mockResolvedValue([{ organizationId: orgId }]);
      mockDb.query.rentalObjectCustodyGrants.findMany
        .mockResolvedValueOnce([]) // Direct
        .mockResolvedValueOnce([]); // Org

      mockDb.query.rentalObjectCustodySubgrants.findMany.mockResolvedValue([
        { 
          scopes: [CustodyScope.RO_MEDIA],
          parentGrant: {
            rentalObjectId,
            status: 'ACTIVE'
          }
        }
      ]);

      const result = await evaluator.can(userContext, CustodyScope.RO_MEDIA, rentalObjectId);
      expect(result).toBe(true);
    });

    it('should deny access if subgrant is for different rental object', async () => {
      mockDb.query.orgMemberships.findMany.mockResolvedValue([{ organizationId: orgId }]);
      mockDb.query.rentalObjectCustodyGrants.findMany.mockResolvedValue([]);
      
      mockDb.query.rentalObjectCustodySubgrants.findMany.mockResolvedValue([
        { 
          scopes: [CustodyScope.RO_MEDIA],
          parentGrant: {
            rentalObjectId: 'different-ro',
            status: 'ACTIVE'
          }
        }
      ]);

      const result = await evaluator.can(userContext, CustodyScope.RO_MEDIA, rentalObjectId);
      expect(result).toBe(false);
    });
  });

  describe('getEffectiveScopes()', () => {
    it('should combine scopes from all sources', async () => {
      mockDb.query.orgMemberships.findMany.mockResolvedValue([{ organizationId: orgId }]);
      
      mockDb.query.rentalObjectCustodyGrants.findMany
        .mockResolvedValueOnce([{ scopes: [CustodyScope.RO_VIEW] }]) // Direct
        .mockResolvedValueOnce([{ scopes: [CustodyScope.RO_EDIT] }]); // Org

      mockDb.query.rentalObjectCustodySubgrants.findMany.mockResolvedValue([
        { 
          scopes: [CustodyScope.RO_MEDIA],
          parentGrant: {
            rentalObjectId,
            status: 'ACTIVE'
          }
        }
      ]);

      const result = await evaluator.getEffectiveScopes(userContext, rentalObjectId);
      expect(result.has(CustodyScope.RO_VIEW)).toBe(true);
      expect(result.has(CustodyScope.RO_EDIT)).toBe(true);
      expect(result.has(CustodyScope.RO_MEDIA)).toBe(true);
      expect(result.has(CustodyScope.RO_MAINTENANCE)).toBe(false);
    });
  });
});
