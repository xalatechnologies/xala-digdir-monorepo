/**
 * AuthzService Unit Tests
 * Comprehensive test coverage for authorization service
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthzService, authzService } from '@xala/api/services/authz.service';
import type { AuthzResource, AuthzAction } from '@xala/api/services/authz.service';

// Mock the client factory
vi.mock('../core/client-factory', () => ({
  getClient: () => mockClient,
}));

const mockClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

describe('AuthzService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('creates service with correct base path', () => {
      const service = new AuthzService();
      expect(service).toBeDefined();
    });
  });

  describe('getPermissions', () => {
    it('calls correct endpoint', async () => {
      const mockResponse = {
        data: {
          role: 'admin',
          permissions: ['bookings:create', 'bookings:read'],
          resources: { bookings: ['create', 'read'] },
        },
      };
      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await authzService.getPermissions();

      expect(mockClient.get).toHaveBeenCalledWith('/api/authz/permissions');
      expect(result).toEqual(mockResponse);
    });

    it('returns admin permissions', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          role: 'admin',
          permissions: [
            'dashboard:read', 'dashboard:write',
            'bookings:create', 'bookings:read', 'bookings:update', 'bookings:delete',
            'rental-objects:create', 'rental-objects:read', 'rental-objects:update',
          ],
          resources: {
            dashboard: ['read', 'write'],
            bookings: ['create', 'read', 'update', 'delete'],
            'rental-objects': ['create', 'read', 'update'],
          },
        },
      });

      const result = await authzService.getPermissions();

      expect(result.data.role).toBe('admin');
      expect(result.data.permissions).toContain('bookings:create');
      expect(result.data.resources.bookings).toContain('create');
    });

    it('returns saksbehandler permissions', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          role: 'saksbehandler',
          permissions: ['dashboard:read', 'bookings:read', 'bookings:create'],
          resources: {
            dashboard: ['read'],
            bookings: ['read', 'create'],
          },
        },
      });

      const result = await authzService.getPermissions();

      expect(result.data.role).toBe('saksbehandler');
      expect(result.data.permissions).not.toContain('dashboard:write');
    });

    it('returns user permissions (limited)', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          role: 'user',
          permissions: ['bookings:read', 'bookings:create'],
          resources: { bookings: ['read', 'create'] },
        },
      });

      const result = await authzService.getPermissions();

      expect(result.data.role).toBe('user');
      expect(result.data.permissions).toHaveLength(2);
    });
  });

  describe('checkPermission', () => {
    const testCases: Array<{ resource: AuthzResource; action: AuthzAction; allowed: boolean }> = [
      { resource: 'bookings', action: 'create', allowed: true },
      { resource: 'bookings', action: 'read', allowed: true },
      { resource: 'bookings', action: 'delete', allowed: false },
      { resource: 'rental-objects', action: 'create', allowed: true },
      { resource: 'rental-objects', action: 'update', allowed: true },
      { resource: 'users', action: 'delete', allowed: false },
      { resource: 'audit', action: 'read', allowed: true },
      { resource: 'settings', action: 'write', allowed: false },
    ];

    it.each(testCases)(
      'checks $resource:$action permission (expected: $allowed)',
      async ({ resource, action, allowed }) => {
        mockClient.get.mockResolvedValueOnce({
          data: { allowed, role: 'saksbehandler', permissions: [`${resource}:${action}`] },
        });

        const result = await authzService.checkPermission(resource, action);

        expect(mockClient.get).toHaveBeenCalledWith('/api/authz/check', {
          params: { resource, action },
        });
        expect(result.data.allowed).toBe(allowed);
      }
    );

    it('returns anonymous role for unauthenticated user', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: { allowed: false, role: 'anonymous', permissions: [] },
      });

      const result = await authzService.checkPermission('bookings', 'create');

      expect(result.data.role).toBe('anonymous');
      expect(result.data.allowed).toBe(false);
    });
  });

  describe('checkPermissions (batch)', () => {
    it('checks multiple permissions at once', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          role: 'admin',
          permissions: ['bookings:create', 'bookings:read', 'rental-objects:update'],
          resources: {},
        },
      });

      const result = await authzService.checkPermissions([
        { resource: 'bookings', action: 'create' },
        { resource: 'bookings', action: 'delete' },
        { resource: 'rental-objects', action: 'update' },
      ]);

      expect(result.data['bookings:create']).toBe(true);
      expect(result.data['bookings:delete']).toBe(false);
      expect(result.data['rental-objects:update']).toBe(true);
    });

    it('returns all false for empty permissions', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: { role: 'user', permissions: [], resources: {} },
      });

      const result = await authzService.checkPermissions([
        { resource: 'users', action: 'delete' },
        { resource: 'settings', action: 'write' },
      ]);

      expect(result.data['users:delete']).toBe(false);
      expect(result.data['settings:write']).toBe(false);
    });
  });

  describe('can', () => {
    it('returns true for allowed permission', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: { allowed: true, role: 'admin', permissions: [] },
      });

      const result = await authzService.can('bookings', 'create');

      expect(result).toBe(true);
    });

    it('returns false for denied permission', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: { allowed: false, role: 'user', permissions: [] },
      });

      const result = await authzService.can('users', 'delete');

      expect(result).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('returns true if user has any of the permissions', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          role: 'saksbehandler',
          permissions: ['bookings:read', 'rental-objects:create'],
          resources: {},
        },
      });

      const result = await authzService.hasAnyPermission([
        'users:delete',
        'settings:write',
        'bookings:read',
      ]);

      expect(result).toBe(true);
    });

    it('returns false if user has none of the permissions', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          role: 'user',
          permissions: ['bookings:read'],
          resources: {},
        },
      });

      const result = await authzService.hasAnyPermission([
        'users:delete',
        'settings:write',
        'audit:read',
      ]);

      expect(result).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('returns true if user has all permissions', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          role: 'admin',
          permissions: ['bookings:create', 'bookings:read', 'bookings:delete'],
          resources: {},
        },
      });

      const result = await authzService.hasAllPermissions([
        'bookings:create',
        'bookings:read',
      ]);

      expect(result).toBe(true);
    });

    it('returns false if user is missing any permission', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          role: 'saksbehandler',
          permissions: ['bookings:create', 'bookings:read'],
          resources: {},
        },
      });

      const result = await authzService.hasAllPermissions([
        'bookings:create',
        'bookings:delete',
      ]);

      expect(result).toBe(false);
    });
  });
});

describe('AuthzService Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles network errors gracefully', async () => {
    mockClient.get.mockRejectedValueOnce(new Error('Network error'));

    await expect(authzService.getPermissions()).rejects.toThrow('Network error');
  });

  it('handles empty resources object', async () => {
    mockClient.get.mockResolvedValueOnce({
      data: { role: 'user', permissions: [], resources: {} },
    });

    const result = await authzService.getPermissions();

    expect(result.data.resources).toEqual({});
  });

  it('handles undefined response data', async () => {
    mockClient.get.mockResolvedValueOnce({});

    const result = await authzService.getPermissions();

    expect(result.data).toBeUndefined();
  });
});

describe('AuthzResource and AuthzAction Types', () => {
  it('validates all resource types', () => {
    const validResources: AuthzResource[] = [
      'dashboard',
      'rental-objects',
      'bookings',
      'users',
      'organizations',
      'reports',
      'settings',
      'calendar',
      'messages',
      'seasonal-leases',
      'audit',
    ];

    expect(validResources).toHaveLength(11);
  });

  it('validates all action types', () => {
    const validActions: AuthzAction[] = [
      'create', 'read', 'update', 'delete',
      'publish', 'archive', 'confirm', 'cancel',
      'verify', 'export', 'write', 'block',
      'resolve', 'terminate', 'deactivate', 'reactivate',
    ];

    expect(validActions).toHaveLength(16);
  });
});
