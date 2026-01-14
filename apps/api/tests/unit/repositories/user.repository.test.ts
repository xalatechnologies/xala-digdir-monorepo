/**
 * User Repository Unit Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRepository } from '../../../src/modules/user/user.repository';
import { createMockDb, fixtures, setupTestHooks } from '../../setup';

describe('UserRepository', () => {
  let repository: UserRepository;
  let mockDb: ReturnType<typeof createMockDb>;

  setupTestHooks();

  beforeEach(() => {
    mockDb = createMockDb();
    repository = new UserRepository(mockDb);
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      mockDb.limit.mockReturnValue([fixtures.user]);

      const result = await repository.findById('user-123');

      expect(result).toEqual(fixtures.user);
    });

    it('should return null when not found', async () => {
      mockDb.limit.mockReturnValue([]);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      mockDb.limit.mockReturnValue([fixtures.user]);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toEqual(fixtures.user);
    });

    it('should return null for unknown email', async () => {
      mockDb.limit.mockReturnValue([]);

      const result = await repository.findByEmail('unknown@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByTenant', () => {
    it('should return paginated users for tenant', async () => {
      mockDb.offset.mockReturnValue([fixtures.user]);

      const result = await repository.findByTenant('tenant-123', {
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.page).toBe(1);
    });

    it('should filter by status', async () => {
      mockDb.offset.mockReturnValue([]);

      const result = await repository.findByTenant('tenant-123', {
        page: 1,
        limit: 20,
        status: 'inactive',
      });

      expect(result.data).toHaveLength(0);
    });

    it('should filter by role', async () => {
      mockDb.offset.mockReturnValue([fixtures.user]);

      const result = await repository.findByTenant('tenant-123', {
        page: 1,
        limit: 20,
        role: 'admin',
      });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create new user', async () => {
      const newUser = {
        tenantId: 'tenant-123',
        email: 'new@example.com',
        name: 'New User',
        role: 'member',
        status: 'active',
      };
      mockDb.returning.mockResolvedValue([{ id: 'user-456', ...newUser }]);

      const result = await repository.create(newUser);

      expect(result.email).toBe('new@example.com');
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('updateRole', () => {
    it('should update user role', async () => {
      mockDb.returning.mockResolvedValue([{ ...fixtures.user, role: 'owner' }]);

      const result = await repository.updateRole('user-123', 'owner');

      expect(result.role).toBe('owner');
    });
  });

  describe('deactivate', () => {
    it('should set user status to inactive', async () => {
      mockDb.returning.mockResolvedValue([{ ...fixtures.user, status: 'inactive' }]);

      const result = await repository.deactivate('user-123');

      expect(result.status).toBe('inactive');
    });
  });
});
