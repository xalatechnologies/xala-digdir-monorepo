/**
 * Tenant Service Unit Tests
 * Tests business logic with mocked repository and adapters
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TenantService } from '../../../src/modules/tenant/tenant.service';
import { createMockAdapters, fixtures, setupTestHooks } from '../../setup';

describe('TenantService', () => {
  let service: TenantService;
  let mockRepository: any;
  let mockAdapters: ReturnType<typeof createMockAdapters>;

  setupTestHooks();

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findByIdOrFail: vi.fn(),
      findBySlug: vi.fn(),
      isSlugAvailable: vi.fn(),
      findAll: vi.fn(),
      findWithFilters: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      softDelete: vi.fn(),
    };
    mockAdapters = createMockAdapters();
    service = new TenantService(mockRepository, mockAdapters);
  });

  describe('create', () => {
    it('should create tenant with valid data', async () => {
      // Complete valid data matching schema
      const createData = {
        name: 'New Tenant',
        slug: 'new-tenant',
        ownerEmail: 'owner@example.com',
        ownerName: 'Owner Name',
        plan: 'free' as const,
      };
      mockRepository.isSlugAvailable.mockResolvedValue(true);
      mockRepository.create.mockResolvedValue({ id: 'new-id', ...createData, status: 'active' });

      const result = await service.create(createData as any);

      expect(result.tenant.name).toBe('New Tenant');
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should throw error if slug already exists', async () => {
      const createData = {
        name: 'New Tenant',
        slug: 'existing-slug',
        ownerEmail: 'owner@example.com',
        ownerName: 'Owner Name',
        plan: 'free' as const,
      };
      mockRepository.isSlugAvailable.mockResolvedValue(false);

      await expect(service.create(createData as any)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should return tenant when found', async () => {
      mockRepository.findById.mockResolvedValue(fixtures.tenant);

      const result = await service.findById('tenant-123');

      expect(result).toEqual(fixtures.tenant);
    });

    it('should return null when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByIdOrFail', () => {
    it('should return tenant when found', async () => {
      mockRepository.findByIdOrFail.mockResolvedValue(fixtures.tenant);

      const result = await service.findByIdOrFail('tenant-123');

      expect(result).toEqual(fixtures.tenant);
    });

    it('should throw when not found', async () => {
      mockRepository.findByIdOrFail.mockRejectedValue(new Error('Not found'));

      await expect(service.findByIdOrFail('non-existent')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update tenant with valid data', async () => {
      const updateData = { name: 'Updated Tenant' };
      mockRepository.findById.mockResolvedValue(fixtures.tenant);
      mockRepository.update.mockResolvedValue({ ...fixtures.tenant, ...updateData });

      const result = await service.update('tenant-123', updateData as any);

      expect(result.name).toBe('Updated Tenant');
    });
  });

  describe('delete', () => {
    it('should delete existing tenant', async () => {
      mockRepository.findById.mockResolvedValue(fixtures.tenant);
      mockRepository.softDelete.mockResolvedValue(undefined);

      await expect(service.delete('tenant-123')).resolves.not.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return paginated tenants', async () => {
      const paginatedResult = {
        data: [fixtures.tenant],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      };
      mockRepository.findWithFilters.mockResolvedValue(paginatedResult);

      const result = await service.findAll({ page: 1, limit: 20 } as any);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.page).toBe(1);
    });
  });
});
