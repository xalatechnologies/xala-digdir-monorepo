/**
 * User Service Unit Tests
 * Tests business logic with mocked repository and adapters
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../../../src/modules/user/user.service';
import { createMockAdapters, fixtures, setupTestHooks } from '../../setup';

describe('UserService', () => {
  let service: UserService;
  let mockRepository: any;
  let mockAdapters: ReturnType<typeof createMockAdapters>;

  setupTestHooks();

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findByTenant: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateRole: vi.fn(),
      deactivate: vi.fn(),
      delete: vi.fn(),
    };
    mockAdapters = createMockAdapters();
    service = new UserService(mockRepository, mockAdapters);
  });

  describe('create', () => {
    it('should create user with valid data', async () => {
      const createData = {
        email: 'new@example.com',
        name: 'New User',
        role: 'member' as const,
      };
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({ id: 'user-456', tenantId: 'tenant-123', status: 'active', ...createData });

      const result = await service.create('tenant-123', createData as any);

      expect(result.email).toBe('new@example.com');
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should throw if email already exists', async () => {
      mockRepository.findByEmail.mockResolvedValue(fixtures.user);

      await expect(service.create('tenant-123', {
        email: 'test@example.com',
        name: 'Test',
        role: 'member' as const,
      } as any)).rejects.toThrow();
    });
  });

  describe('invite', () => {
    it('should invite user and send email', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({ id: 'user-456', status: 'pending' });

      const result = await service.invite('tenant-123', {
        email: 'invite@example.com',
        name: 'Invited User',
        role: 'member' as const,
      } as any);

      expect(result.invitationId).toBeDefined();
      expect(mockAdapters.email.send).toHaveBeenCalled();
    });

    it('should throw if user already exists', async () => {
      mockRepository.findByEmail.mockResolvedValue(fixtures.user);

      await expect(service.invite('tenant-123', {
        email: 'test@example.com',
        name: 'Test',
        role: 'member' as const,
      } as any)).rejects.toThrow();
    });
  });

  describe('findByIdOrFail', () => {
    it('should return user when found', async () => {
      mockRepository.findById.mockResolvedValue(fixtures.user);

      const result = await service.findByIdOrFail('user-123');

      expect(result).toEqual(fixtures.user);
    });

    it('should throw when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findByIdOrFail('non-existent')).rejects.toThrow();
    });
  });

  describe('assignRole', () => {
    it('should update user role', async () => {
      mockRepository.findById.mockResolvedValue(fixtures.user);
      mockRepository.updateRole.mockResolvedValue({ ...fixtures.user, role: 'owner' });

      const result = await service.assignRole('user-123', { role: 'owner' as const } as any);

      expect(result.role).toBe('owner');
    });
  });

  describe('deactivate', () => {
    it('should deactivate user', async () => {
      mockRepository.findById.mockResolvedValue(fixtures.user);
      mockRepository.deactivate.mockResolvedValue({ ...fixtures.user, status: 'inactive' });

      const result = await service.deactivate('user-123');

      expect(result.status).toBe('inactive');
    });
  });

  describe('findAll', () => {
    it('should return paginated users for tenant', async () => {
      const paginatedResult = {
        data: [fixtures.user],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      };
      mockRepository.findByTenant.mockResolvedValue(paginatedResult);

      const result = await service.findAll('tenant-123', { page: 1, limit: 20 } as any);

      expect(result.data).toHaveLength(1);
    });
  });
});
