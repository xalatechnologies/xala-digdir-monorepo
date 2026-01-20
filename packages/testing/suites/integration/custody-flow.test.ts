import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupMockApi } from '@digilist/api/mocks/api-server.mock';
import { CustodyService } from '@testing/stubs/api-imports';
import { CustodyEvaluator } from '@testing/stubs/api-imports';
import { CustodyScope, UserContext } from '@testing/stubs/api-imports';
import { Roles } from '@testing/stubs/api-imports';

describe('Custody Flow Integration', () => {
  setupMockApi();
  let custodyService: CustodyService;
  let custodyEvaluator: CustodyEvaluator;
  let mockDb: any;
  let mockAdapters: any;

  const tenantId = 'tenant-1';
  const adminId = 'admin-1';
  const userId = 'user-1';
  const orgId = 'org-1';
  const rentalObjectId = 'ro-1';

  beforeEach(() => {
    mockDb = {
      query: {
        rentalObjects: { findFirst: vi.fn() },
        organizations: { findFirst: vi.fn() },
        users: { findFirst: vi.fn() },
        rentalObjectCustodyGrants: { findMany: vi.fn(), findFirst: vi.fn() },
        rentalObjectCustodySubgrants: { findMany: vi.fn() },
        orgMemberships: { findFirst: vi.fn(), findMany: vi.fn() },
      },
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'new-id' }])
        })
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: 'updated-id' }])
          })
        })
      }),
    };

    mockAdapters = {
      log: { info: vi.fn(), error: vi.fn() }
    };

    custodyService = new CustodyService(mockDb, mockAdapters);
    custodyEvaluator = new CustodyEvaluator(mockDb);
  });

  describe('Grant and Evaluate Flow', () => {
  setupMockApi();
    it('should create a grant and then allow access', async () => {
      // 1. Create Grant
      mockDb.query.rentalObjects.findFirst.mockResolvedValue({ id: rentalObjectId, tenantId });
      mockDb.query.users.findFirst.mockResolvedValue({ id: userId });
      
      const grantData = {
        tenantId,
        rentalObjectId,
        granteeType: 'USER' as const,
        granteeId: userId,
        scopes: [CustodyScope.RO_VIEW],
        createdByUserId: adminId,
      };

      const grant = await custodyService.createGrant(grantData);
      expect(grant.id).toBe('new-id');

      // 2. Evaluate Access
      const userContext: UserContext = { userId, tenantId, role: Roles.USER };
      
      // Setup mock for evaluation
      mockDb.query.orgMemberships.findMany.mockResolvedValue([]);
      mockDb.query.rentalObjectCustodyGrants.findMany.mockResolvedValue([
        { scopes: [CustodyScope.RO_VIEW], status: 'ACTIVE', effectiveFrom: null, effectiveTo: null }
      ]);

      const canView = await custodyEvaluator.can(userContext, CustodyScope.RO_VIEW, rentalObjectId);
      expect(canView).toBe(true);

      const canEdit = await custodyEvaluator.can(userContext, CustodyScope.RO_EDIT, rentalObjectId);
      expect(canEdit).toBe(false);
    });

    it('should handle subdelegation correctly', async () => {
      // 1. Setup Parent Grant (Org)
      const parentGrantId = 'parent-grant-id';
      mockDb.query.rentalObjectCustodyGrants.findFirst.mockResolvedValue({
        id: parentGrantId,
        tenantId,
        rentalObjectId,
        granteeType: 'ORG',
        granteeId: orgId,
        scopes: [CustodyScope.RO_VIEW, CustodyScope.RO_EDIT],
        canSubdelegate: true,
        status: 'ACTIVE'
      });

      mockDb.query.orgMemberships.findFirst.mockResolvedValue({ userId, organizationId: orgId });

      // 2. Create Subgrant
      const subgrantData = {
        tenantId,
        parentGrantId,
        memberUserId: userId,
        scopes: [CustodyScope.RO_VIEW], // Valid subset
        createdByUserId: adminId,
      };

      const subgrant = await custodyService.createSubgrant(subgrantData);
      expect(subgrant.id).toBe('new-id');

      // 3. Evaluate Subgrant Access
      const userContext: UserContext = { userId, tenantId, role: Roles.USER };
      
      mockDb.query.orgMemberships.findMany.mockResolvedValue([{ organizationId: orgId }]);
      mockDb.query.rentalObjectCustodyGrants.findMany.mockResolvedValue([]); // No direct/org grants
      mockDb.query.rentalObjectCustodySubgrants.findMany.mockResolvedValue([
        { 
          scopes: [CustodyScope.RO_VIEW], 
          status: 'ACTIVE',
          parentGrant: { rentalObjectId, status: 'ACTIVE' }
        }
      ]);

      const canView = await custodyEvaluator.can(userContext, CustodyScope.RO_VIEW, rentalObjectId);
      expect(canView).toBe(true);

      const canEdit = await custodyEvaluator.can(userContext, CustodyScope.RO_EDIT, rentalObjectId);
      expect(canEdit).toBe(false); // Only RO_VIEW was subgranted
    });
  });
});
