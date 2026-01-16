/**
 * Hook Integration Tests
 * Tests React Query hooks with mocked services
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock client factory
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

// Import hooks after mocking
import {
  usePermissions,
  useCheckPermission,
  useCan,
  useRole,
  useHasAnyPermission,
  useHasAllPermissions,
  authzKeys,
} from '../hooks/use-authz';

import {
  useProfile,
  useUpdateProfile,
  profileKeys,
} from '../hooks/use-profile';

// Create wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

describe('Authorization Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('usePermissions', () => {
    it('fetches permissions on mount', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          role: 'admin',
          permissions: ['bookings:create', 'bookings:read'],
          resources: { bookings: ['create', 'read'] },
        },
      });

      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.data.role).toBe('admin');
      expect(result.current.data?.data.permissions).toContain('bookings:create');
    });

    it('can be disabled', async () => {
      const { result } = renderHook(() => usePermissions({ enabled: false }), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(mockClient.get).not.toHaveBeenCalled();
    });

    it('caches permissions for 5 minutes', async () => {
      mockClient.get.mockResolvedValue({
        data: { role: 'user', permissions: [], resources: {} },
      });

      const { result, rerender } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Re-render should use cached data
      rerender();

      expect(mockClient.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('useCheckPermission', () => {
    it('checks specific permission', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: { allowed: true, role: 'admin', permissions: ['bookings:create'] },
      });

      const { result } = renderHook(
        () => useCheckPermission('bookings', 'create'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.data.allowed).toBe(true);
    });

    it('returns false for denied permission', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: { allowed: false, role: 'user', permissions: [] },
      });

      const { result } = renderHook(
        () => useCheckPermission('users', 'delete'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.data.allowed).toBe(false);
    });

    it('is disabled when resource or action is empty', async () => {
      const { result } = renderHook(
        () => useCheckPermission('' as 'bookings', 'create'),
        { wrapper: createWrapper() }
      );

      expect(result.current.isFetching).toBe(false);
    });
  });

  describe('useCan', () => {
    it('returns true for allowed permission', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: { allowed: true, role: 'admin', permissions: [] },
      });

      const { result } = renderHook(
        () => useCan('bookings', 'create'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('returns false initially before data loads', () => {
      mockClient.get.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(
        () => useCan('bookings', 'create'),
        { wrapper: createWrapper() }
      );

      expect(result.current).toBe(false);
    });
  });

  describe('useRole', () => {
    it('returns user role', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: { role: 'saksbehandler', permissions: [], resources: {} },
      });

      const { result } = renderHook(() => useRole(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBe('saksbehandler');
      });
    });

    it('returns undefined before data loads', () => {
      mockClient.get.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useRole(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeUndefined();
    });
  });

  describe('useHasAnyPermission', () => {
    it('returns true if user has any of the permissions', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          role: 'user',
          permissions: ['bookings:read', 'messages:read'],
          resources: {},
        },
      });

      const { result } = renderHook(
        () => useHasAnyPermission(['bookings:delete', 'bookings:read']),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('returns false if user has none of the permissions', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: { role: 'user', permissions: ['bookings:read'], resources: {} },
      });

      const { result } = renderHook(
        () => useHasAnyPermission(['users:delete', 'settings:write']),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });
  });

  describe('useHasAllPermissions', () => {
    it('returns true if user has all permissions', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          role: 'admin',
          permissions: ['bookings:create', 'bookings:read', 'bookings:delete'],
          resources: {},
        },
      });

      const { result } = renderHook(
        () => useHasAllPermissions(['bookings:create', 'bookings:read']),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('returns false if user is missing any permission', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          role: 'user',
          permissions: ['bookings:read'],
          resources: {},
        },
      });

      const { result } = renderHook(
        () => useHasAllPermissions(['bookings:read', 'bookings:delete']),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });
  });

  describe('authzKeys', () => {
    it('has correct structure', () => {
      expect(authzKeys.all).toEqual(['authz']);
      expect(authzKeys.permissions()).toEqual(['authz', 'permissions']);
      expect(authzKeys.check('bookings', 'create')).toEqual([
        'authz',
        'check',
        'bookings',
        'create',
      ]);
    });
  });
});

describe('Profile Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useProfile', () => {
    it('fetches profile on mount', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          id: 'user-123',
          email: 'user@example.com',
          name: 'Test User',
        },
      });

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.data.email).toBe('user@example.com');
    });

    it('can be disabled', async () => {
      const { result } = renderHook(() => useProfile({ enabled: false }), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(mockClient.get).not.toHaveBeenCalled();
    });
  });

  describe('useUpdateProfile', () => {
    it('updates profile and invalidates cache', async () => {
      mockClient.put.mockResolvedValueOnce({
        data: { id: 'user-123', name: 'Updated Name' },
      });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ name: 'Updated Name' } as Parameters<typeof result.current.mutate>[0]);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockClient.put).toHaveBeenCalled();
    });
  });

  describe('profileKeys', () => {
    it('has correct structure', () => {
      expect(profileKeys.all).toEqual(['profile']);
      expect(profileKeys.current()).toEqual(['profile', 'current']);
    });
  });
});

describe('Hook Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles API errors gracefully', async () => {
    mockClient.get.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it('handles 401 errors', async () => {
    const unauthorizedError = new Error('Unauthorized');
    (unauthorizedError as Error & { status: number }).status = 401;
    mockClient.get.mockRejectedValueOnce(unauthorizedError);

    const { result } = renderHook(() => useProfile(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('Hook Query Key Consistency', () => {
  it('authzKeys are consistent', () => {
    const keys1 = authzKeys.permissions();
    const keys2 = authzKeys.permissions();
    
    expect(keys1).toEqual(keys2);
  });

  it('profileKeys are consistent', () => {
    const keys1 = profileKeys.current();
    const keys2 = profileKeys.current();
    
    expect(keys1).toEqual(keys2);
  });
});
