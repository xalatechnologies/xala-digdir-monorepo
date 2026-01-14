/**
 * Tenant Repository Unit Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TenantRepository } from '../../../src/modules/tenant/tenant.repository';
import { createMockDb, fixtures, setupTestHooks } from '../../setup';

describe('TenantRepository', () => {
  let repository: TenantRepository;
  let mockDb: ReturnType<typeof createMockDb>;

  setupTestHooks();

  beforeEach(() => {
    mockDb = createMockDb();
    repository = new TenantRepository(mockDb);
  });

  describe('findById', () => {
    it('should return tenant when found', async () => {
      mockDb.limit.mockReturnValue([fixtures.tenant]);

      const result = await repository.findById('tenant-123');

      expect(result).toEqual(fixtures.tenant);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('should return null when not found', async () => {
      mockDb.limit.mockReturnValue([]);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should return tenant by slug', async () => {
      mockDb.limit.mockReturnValue([fixtures.tenant]);

      const result = await repository.findBySlug('test-tenant');

      expect(result).toEqual(fixtures.tenant);
    });
  });

  describe('create', () => {
    it('should create and return new tenant', async () => {
      const newTenant = { name: 'New Tenant', slug: 'new-tenant' };
      mockDb.returning.mockResolvedValue([{ ...fixtures.tenant, ...newTenant }]);

      const result = await repository.create(newTenant);

      expect(result.name).toBe('New Tenant');
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith(newTenant);
    });
  });

  describe('update', () => {
    it('should update and return tenant', async () => {
      const updates = { name: 'Updated Tenant' };
      mockDb.returning.mockResolvedValue([{ ...fixtures.tenant, ...updates }]);

      const result = await repository.update('tenant-123', updates);

      expect(result.name).toBe('Updated Tenant');
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete tenant', async () => {
      mockDb.returning.mockResolvedValue([fixtures.tenant]);

      await expect(repository.delete('tenant-123')).resolves.not.toThrow();
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      mockDb.offset.mockReturnValue([fixtures.tenant]);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.page).toBe(1);
    });
  });
});
