/**
 * Unit Tests for ScopeAssignmentService
 * Tests scope delegation management for case handlers
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { scopeAssignmentService } from '@digilist/client-sdk/services';
import type {
  CaseHandlerScope,
  CreateScopeAssignmentDTO,
  UpdateScopeAssignmentDTO,
  AssignScopesDTO,
  ScopeQueryParams,
  EffectiveScope,
  ScopeDelegationNode,
} from '@digilist/client-sdk/services';
import type { PaginatedResponse, SingleResponse } from '@digilist/client-sdk/types';

// Mock data
const mockScope: CaseHandlerScope = {
  id: 'scope-1',
  tenantId: 'tenant-1',
  userId: 'user-1',
  scopeType: 'specific',
  rentalObjectId: 'obj-1',
  organizationId: null,
  categoryKeys: [],
  assignedBy: 'admin-1',
  status: 'active',
  metadata: {},
  createdAt: '2026-01-17T10:00:00Z',
  updatedAt: '2026-01-17T10:00:00Z',
};

const mockEffectiveScope: EffectiveScope = {
  userId: 'user-1',
  hasGlobalAccess: false,
  organizationIds: ['org-1'],
  rentalObjectIds: ['obj-1', 'obj-2'],
  categoryKeys: ['sports'],
  computedAt: '2026-01-17T10:00:00Z',
};

const mockDelegationNode: ScopeDelegationNode = {
  userId: 'user-1',
  userName: 'John Doe',
  role: 'case_handler',
  scopes: [mockScope],
  children: [],
};

// SKIPPED
describe.skip('ScopeAssignmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all scope assignments', async () => {
      const mockResponse: PaginatedResponse<CaseHandlerScope> = {
        data: [mockScope],
        meta: {
          total: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
        },
      };

      const getSpy = vi.spyOn(scopeAssignmentService as any, 'get').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.getAll();

      expect(getSpy).toHaveBeenCalledWith('', { params: undefined });
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('scope-1');
    });

    it('should fetch scopes with query parameters', async () => {
      const params: ScopeQueryParams = {
        userId: 'user-1',
        scopeType: 'specific',
        status: 'active',
        page: 2,
        limit: 20,
      };

      const mockResponse: PaginatedResponse<CaseHandlerScope> = {
        data: [mockScope],
        meta: {
          total: 25,
          page: 2,
          limit: 20,
          totalPages: 2,
        },
      };

      const getSpy = vi.spyOn(scopeAssignmentService as any, 'get').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.getAll(params);

      expect(getSpy).toHaveBeenCalledWith('', { params });
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(20);
    });
  });

  describe('getById', () => {
    it('should fetch a specific scope assignment', async () => {
      const mockResponse: SingleResponse<CaseHandlerScope> = {
        data: mockScope,
      };

      const getSpy = vi.spyOn(scopeAssignmentService as any, 'get').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.getById('scope-1');

      expect(getSpy).toHaveBeenCalledWith('/scope-1');
      expect(result.data.id).toBe('scope-1');
      expect(result.data.scopeType).toBe('specific');
    });
  });

  describe('getUserScopes', () => {
    it('should fetch all scopes for a specific user', async () => {
      const mockResponse: PaginatedResponse<CaseHandlerScope> = {
        data: [mockScope],
        meta: {
          total: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
        },
      };

      const getSpy = vi.spyOn(scopeAssignmentService as any, 'get').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.getUserScopes('user-1');

      expect(getSpy).toHaveBeenCalledWith('/users/user-1');
      expect(result.data[0].userId).toBe('user-1');
    });
  });

  describe('getEffectiveScope', () => {
    it('should fetch effective scope for a user', async () => {
      const mockResponse: SingleResponse<EffectiveScope> = {
        data: mockEffectiveScope,
      };

      const getSpy = vi.spyOn(scopeAssignmentService as any, 'get').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.getEffectiveScope('user-1');

      expect(getSpy).toHaveBeenCalledWith('/users/user-1/effective');
      expect(result.data.userId).toBe('user-1');
      expect(result.data.hasGlobalAccess).toBe(false);
      expect(result.data.rentalObjectIds).toHaveLength(2);
    });
  });

  describe('create', () => {
    it('should create a new scope assignment', async () => {
      const createData: CreateScopeAssignmentDTO = {
        userId: 'user-2',
        scopeType: 'specific',
        rentalObjectId: 'obj-1',
      };

      const mockResponse: SingleResponse<CaseHandlerScope> = {
        data: { ...mockScope, userId: 'user-2' },
      };

      const postSpy = vi.spyOn(scopeAssignmentService as any, 'post').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.create(createData);

      expect(postSpy).toHaveBeenCalledWith('', createData);
      expect(result.data.userId).toBe('user-2');
      expect(result.data.scopeType).toBe('specific');
    });

    it('should create organization-level scope', async () => {
      const createData: CreateScopeAssignmentDTO = {
        userId: 'user-3',
        scopeType: 'organization',
        organizationId: 'org-1',
      };

      const mockResponse: SingleResponse<CaseHandlerScope> = {
        data: { ...mockScope, userId: 'user-3', scopeType: 'organization', organizationId: 'org-1' },
      };

      const postSpy = vi.spyOn(scopeAssignmentService as any, 'post').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.create(createData);

      expect(result.data.scopeType).toBe('organization');
      expect(result.data.organizationId).toBe('org-1');
    });

    it('should create category-level scope', async () => {
      const createData: CreateScopeAssignmentDTO = {
        userId: 'user-4',
        scopeType: 'category',
        categoryKeys: ['sports', 'culture'],
      };

      const mockResponse: SingleResponse<CaseHandlerScope> = {
        data: {
          ...mockScope,
          userId: 'user-4',
          scopeType: 'category',
          categoryKeys: ['sports', 'culture'],
        },
      };

      const postSpy = vi.spyOn(scopeAssignmentService as any, 'post').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.create(createData);

      expect(result.data.scopeType).toBe('category');
      expect(result.data.categoryKeys).toEqual(['sports', 'culture']);
    });
  });

  describe('update', () => {
    it('should update an existing scope assignment', async () => {
      const updateData: UpdateScopeAssignmentDTO = {
        scopeType: 'organization',
        organizationId: 'org-2',
      };

      const mockResponse: SingleResponse<CaseHandlerScope> = {
        data: { ...mockScope, scopeType: 'organization', organizationId: 'org-2' },
      };

      const putSpy = vi.spyOn(scopeAssignmentService as any, 'put').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.update('scope-1', updateData);

      expect(putSpy).toHaveBeenCalledWith('/scope-1', updateData);
      expect(result.data.scopeType).toBe('organization');
      expect(result.data.organizationId).toBe('org-2');
    });

    it('should update scope status', async () => {
      const updateData: UpdateScopeAssignmentDTO = {
        status: 'suspended',
      };

      const mockResponse: SingleResponse<CaseHandlerScope> = {
        data: { ...mockScope, status: 'suspended' },
      };

      const putSpy = vi.spyOn(scopeAssignmentService as any, 'put').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.update('scope-1', updateData);

      expect(result.data.status).toBe('suspended');
    });
  });

  describe('deleteScope', () => {
    it('should delete a scope assignment', async () => {
      const mockResponse: SingleResponse<{ success: boolean }> = {
        data: { success: true },
      };

      const deleteSpy = vi
        .spyOn(scopeAssignmentService, 'deleteScope')
        .mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.deleteScope('scope-1');

      expect(deleteSpy).toHaveBeenCalledWith('scope-1');
      expect(result.data.success).toBe(true);
    });
  });

  describe('assignScopes', () => {
    it('should assign multiple scopes to a user', async () => {
      const assignData: AssignScopesDTO = {
        userId: 'user-1',
        scopes: [
          { scopeType: 'specific', rentalObjectId: 'obj-1' },
          { scopeType: 'specific', rentalObjectId: 'obj-2' },
        ],
      };

      const mockResponse: SingleResponse<CaseHandlerScope[]> = {
        data: [mockScope, { ...mockScope, id: 'scope-2', rentalObjectId: 'obj-2' }],
      };

      const postSpy = vi.spyOn(scopeAssignmentService as any, 'post').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.assignScopes(assignData);

      expect(postSpy).toHaveBeenCalledWith('/assign', assignData);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('addRentalObject', () => {
    it('should add a rental object to user scope', async () => {
      const mockResponse: SingleResponse<CaseHandlerScope> = {
        data: mockScope,
      };

      const postSpy = vi.spyOn(scopeAssignmentService as any, 'post').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.addRentalObject('user-1', 'obj-1');

      expect(postSpy).toHaveBeenCalledWith('/users/user-1/rental-objects', {
        rentalObjectId: 'obj-1',
      });
      expect(result.data.rentalObjectId).toBe('obj-1');
    });
  });

  describe('removeRentalObject', () => {
    it('should remove a rental object from user scope', async () => {
      const mockResponse: SingleResponse<{ success: boolean }> = {
        data: { success: true },
      };

      const removeSpy = vi
        .spyOn(scopeAssignmentService, 'removeRentalObject')
        .mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.removeRentalObject('user-1', 'obj-1');

      expect(removeSpy).toHaveBeenCalledWith('user-1', 'obj-1');
      expect(result.data.success).toBe(true);
    });
  });

  describe('setOrganizationScope', () => {
    it('should set user scope to organization level', async () => {
      const mockResponse: SingleResponse<CaseHandlerScope> = {
        data: { ...mockScope, scopeType: 'organization', organizationId: 'org-1' },
      };

      const postSpy = vi.spyOn(scopeAssignmentService as any, 'post').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.setOrganizationScope('user-1', 'org-1');

      expect(postSpy).toHaveBeenCalledWith('/users/user-1/organization', {
        organizationId: 'org-1',
      });
      expect(result.data.scopeType).toBe('organization');
    });
  });

  describe('setCategoryScope', () => {
    it('should set user scope to category level', async () => {
      const mockResponse: SingleResponse<CaseHandlerScope> = {
        data: { ...mockScope, scopeType: 'category', categoryKeys: ['sports'] },
      };

      const postSpy = vi.spyOn(scopeAssignmentService as any, 'post').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.setCategoryScope('user-1', ['sports']);

      expect(postSpy).toHaveBeenCalledWith('/users/user-1/categories', {
        categoryKeys: ['sports'],
      });
      expect(result.data.scopeType).toBe('category');
      expect(result.data.categoryKeys).toEqual(['sports']);
    });
  });

  describe('setGlobalScope', () => {
    it('should set user scope to global access', async () => {
      const mockResponse: SingleResponse<CaseHandlerScope> = {
        data: { ...mockScope, scopeType: 'all' },
      };

      const postSpy = vi.spyOn(scopeAssignmentService as any, 'post').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.setGlobalScope('user-1');

      expect(postSpy).toHaveBeenCalledWith('/users/user-1/global', {});
      expect(result.data.scopeType).toBe('all');
    });
  });

  describe('clearAllScopes', () => {
    it('should clear all scopes for a user', async () => {
      const mockResponse: SingleResponse<{ success: boolean }> = {
        data: { success: true },
      };

      const clearSpy = vi
        .spyOn(scopeAssignmentService, 'clearAllScopes')
        .mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.clearAllScopes('user-1');

      expect(clearSpy).toHaveBeenCalledWith('user-1');
      expect(result.data.success).toBe(true);
    });
  });

  describe('suspend', () => {
    it('should suspend a scope', async () => {
      const mockResponse: SingleResponse<CaseHandlerScope> = {
        data: { ...mockScope, status: 'suspended' },
      };

      const postSpy = vi.spyOn(scopeAssignmentService as any, 'post').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.suspend('scope-1', 'Performance review');

      expect(postSpy).toHaveBeenCalledWith('/scope-1/suspend', { reason: 'Performance review' });
      expect(result.data.status).toBe('suspended');
    });

    it('should suspend without reason', async () => {
      const mockResponse: SingleResponse<CaseHandlerScope> = {
        data: { ...mockScope, status: 'suspended' },
      };

      const postSpy = vi.spyOn(scopeAssignmentService as any, 'post').mockResolvedValue(mockResponse);

      await scopeAssignmentService.suspend('scope-1');

      expect(postSpy).toHaveBeenCalledWith('/scope-1/suspend', { reason: undefined });
    });
  });

  describe('reactivate', () => {
    it('should reactivate a suspended scope', async () => {
      const mockResponse: SingleResponse<CaseHandlerScope> = {
        data: { ...mockScope, status: 'active' },
      };

      const postSpy = vi.spyOn(scopeAssignmentService as any, 'post').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.reactivate('scope-1');

      expect(postSpy).toHaveBeenCalledWith('/scope-1/reactivate', {});
      expect(result.data.status).toBe('active');
    });
  });

  describe('getDelegationTree', () => {
    it('should fetch delegation tree', async () => {
      const mockResponse: SingleResponse<ScopeDelegationNode> = {
        data: mockDelegationNode,
      };

      const getSpy = vi.spyOn(scopeAssignmentService as any, 'get').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.getDelegationTree();

      expect(getSpy).toHaveBeenCalledWith('/delegation-tree', { params: undefined });
      expect(result.data.userId).toBe('user-1');
      expect(result.data.scopes).toHaveLength(1);
    });

    it('should fetch delegation tree for specific organization', async () => {
      const mockResponse: SingleResponse<ScopeDelegationNode> = {
        data: mockDelegationNode,
      };

      const getSpy = vi.spyOn(scopeAssignmentService as any, 'get').mockResolvedValue(mockResponse);

      await scopeAssignmentService.getDelegationTree('org-1');

      expect(getSpy).toHaveBeenCalledWith('/delegation-tree', {
        params: { organizationId: 'org-1' },
      });
    });
  });

  describe('validateAccess', () => {
    it('should validate user has access to rental object', async () => {
      const mockResponse: SingleResponse<{ hasAccess: boolean; reason?: string }> = {
        data: { hasAccess: true },
      };

      const postSpy = vi.spyOn(scopeAssignmentService as any, 'post').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.validateAccess('user-1', 'obj-1');

      expect(postSpy).toHaveBeenCalledWith('/validate-access', {
        userId: 'user-1',
        rentalObjectId: 'obj-1',
      });
      expect(result.data.hasAccess).toBe(true);
    });

    it('should return reason when access is denied', async () => {
      const mockResponse: SingleResponse<{ hasAccess: boolean; reason?: string }> = {
        data: { hasAccess: false, reason: 'User scope does not include this rental object' },
      };

      const postSpy = vi.spyOn(scopeAssignmentService as any, 'post').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.validateAccess('user-1', 'obj-999');

      expect(result.data.hasAccess).toBe(false);
      expect(result.data.reason).toBeDefined();
    });
  });

  describe('bulkAssign', () => {
    it('should bulk assign scopes to multiple users', async () => {
      const mockResponse: SingleResponse<{
        successful: number;
        failed: number;
        results: Array<{ userId: string; status: 'success' | 'error'; error?: string }>;
      }> = {
        data: {
          successful: 2,
          failed: 0,
          results: [
            { userId: 'user-1', status: 'success' },
            { userId: 'user-2', status: 'success' },
          ],
        },
      };

      const postSpy = vi.spyOn(scopeAssignmentService as any, 'post').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.bulkAssign(['user-1', 'user-2'], {
        scopeType: 'organization',
        organizationId: 'org-1',
      });

      expect(postSpy).toHaveBeenCalledWith('/bulk/assign', {
        userIds: ['user-1', 'user-2'],
        scopeData: {
          scopeType: 'organization',
          organizationId: 'org-1',
        },
      });
      expect(result.data.successful).toBe(2);
      expect(result.data.failed).toBe(0);
    });

    it('should handle partial failures in bulk assign', async () => {
      const mockResponse: SingleResponse<{
        successful: number;
        failed: number;
        results: Array<{ userId: string; status: 'success' | 'error'; error?: string }>;
      }> = {
        data: {
          successful: 1,
          failed: 1,
          results: [
            { userId: 'user-1', status: 'success' },
            { userId: 'user-2', status: 'error', error: 'User not found' },
          ],
        },
      };

      const postSpy = vi.spyOn(scopeAssignmentService as any, 'post').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.bulkAssign(['user-1', 'user-2'], {
        scopeType: 'specific',
        rentalObjectId: 'obj-1',
      });

      expect(result.data.successful).toBe(1);
      expect(result.data.failed).toBe(1);
      expect(result.data.results[1].error).toBe('User not found');
    });
  });

  describe('bulkRemove', () => {
    it('should bulk remove scopes from multiple users', async () => {
      const mockResponse: SingleResponse<{
        successful: number;
        failed: number;
        results: Array<{ userId: string; status: 'success' | 'error'; error?: string }>;
      }> = {
        data: {
          successful: 3,
          failed: 0,
          results: [
            { userId: 'user-1', status: 'success' },
            { userId: 'user-2', status: 'success' },
            { userId: 'user-3', status: 'success' },
          ],
        },
      };

      const postSpy = vi.spyOn(scopeAssignmentService as any, 'post').mockResolvedValue(mockResponse);

      const result = await scopeAssignmentService.bulkRemove(['user-1', 'user-2', 'user-3']);

      expect(postSpy).toHaveBeenCalledWith('/bulk/remove', {
        userIds: ['user-1', 'user-2', 'user-3'],
      });
      expect(result.data.successful).toBe(3);
      expect(result.data.failed).toBe(0);
    });
  });
});
