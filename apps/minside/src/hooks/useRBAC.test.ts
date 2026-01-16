import { renderHook } from '@testing-library/react';
import { useRBAC } from './useRBAC';
import { useAuth } from './useAuth';
import type { AuthContextType } from './useAuth';

// Mock the useAuth hook
vi.mock('./useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

describe('useRBAC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hasPermission', () => {
    it('should return true when admin has permission', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
        },
        isAuthenticated: true,
        isAdmin: true,
        isSaksbehandler: false,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(result.current.hasPermission('bookings.view')).toBe(true);
      expect(result.current.hasPermission('bookings.approve')).toBe(true);
      expect(result.current.hasPermission('listings.delete')).toBe(true);
      expect(result.current.hasPermission('users.manage')).toBe(true);
    });

    it('should return true when saksbehandler has allowed permission', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-2',
          name: 'Saksbehandler User',
          email: 'saksbehandler@example.com',
          role: 'saksbehandler',
        },
        isAuthenticated: true,
        isAdmin: false,
        isSaksbehandler: true,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(result.current.hasPermission('bookings.view')).toBe(true);
      expect(result.current.hasPermission('bookings.approve')).toBe(true);
      expect(result.current.hasPermission('listings.view')).toBe(true);
    });

    it('should return false when saksbehandler lacks permission', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-2',
          name: 'Saksbehandler User',
          email: 'saksbehandler@example.com',
          role: 'saksbehandler',
        },
        isAuthenticated: true,
        isAdmin: false,
        isSaksbehandler: true,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(result.current.hasPermission('listings.delete')).toBe(false);
      expect(result.current.hasPermission('users.manage')).toBe(false);
      expect(result.current.hasPermission('settings.edit')).toBe(false);
    });

    it('should return true when regular user has allowed permission', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-3',
          name: 'Regular User',
          email: 'user@example.com',
          role: 'user',
        },
        isAuthenticated: true,
        isAdmin: false,
        isSaksbehandler: false,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(result.current.hasPermission('bookings.view')).toBe(true);
      expect(result.current.hasPermission('listings.view')).toBe(true);
    });

    it('should return false when regular user lacks permission', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-3',
          name: 'Regular User',
          email: 'user@example.com',
          role: 'user',
        },
        isAuthenticated: true,
        isAdmin: false,
        isSaksbehandler: false,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(result.current.hasPermission('bookings.approve')).toBe(false);
      expect(result.current.hasPermission('listings.create')).toBe(false);
      expect(result.current.hasPermission('users.view')).toBe(false);
    });

    it('should return false when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isSaksbehandler: false,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(result.current.hasPermission('bookings.view')).toBe(false);
      expect(result.current.hasPermission('listings.view')).toBe(false);
    });

    it('should return false for unknown role', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-4',
          name: 'Unknown Role User',
          email: 'unknown@example.com',
          role: 'unknown-role' as any,
        },
        isAuthenticated: true,
        isAdmin: false,
        isSaksbehandler: false,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(result.current.hasPermission('bookings.view')).toBe(false);
      expect(result.current.hasPermission('listings.view')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true when user has at least one permission', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-3',
          name: 'Regular User',
          email: 'user@example.com',
          role: 'user',
        },
        isAuthenticated: true,
        isAdmin: false,
        isSaksbehandler: false,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(
        result.current.hasAnyPermission([
          'bookings.view',
          'bookings.approve',
          'users.manage',
        ])
      ).toBe(true);
    });

    it('should return false when user has none of the permissions', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-3',
          name: 'Regular User',
          email: 'user@example.com',
          role: 'user',
        },
        isAuthenticated: true,
        isAdmin: false,
        isSaksbehandler: false,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(
        result.current.hasAnyPermission([
          'bookings.approve',
          'listings.create',
          'users.manage',
        ])
      ).toBe(false);
    });

    it('should return false when permissions array is empty', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
        },
        isAuthenticated: true,
        isAdmin: true,
        isSaksbehandler: false,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(result.current.hasAnyPermission([])).toBe(false);
    });

    it('should return false when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isSaksbehandler: false,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(
        result.current.hasAnyPermission(['bookings.view', 'listings.view'])
      ).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when user has all permissions', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
        },
        isAuthenticated: true,
        isAdmin: true,
        isSaksbehandler: false,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(
        result.current.hasAllPermissions([
          'bookings.view',
          'bookings.approve',
          'listings.create',
        ])
      ).toBe(true);
    });

    it('should return false when user is missing one or more permissions', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-2',
          name: 'Saksbehandler User',
          email: 'saksbehandler@example.com',
          role: 'saksbehandler',
        },
        isAuthenticated: true,
        isAdmin: false,
        isSaksbehandler: true,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(
        result.current.hasAllPermissions([
          'bookings.view',
          'bookings.approve',
          'listings.delete', // saksbehandler doesn't have this
        ])
      ).toBe(false);
    });

    it('should return true when permissions array is empty', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
        },
        isAuthenticated: true,
        isAdmin: true,
        isSaksbehandler: false,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(result.current.hasAllPermissions([])).toBe(true);
    });

    it('should return false when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isSaksbehandler: false,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(
        result.current.hasAllPermissions(['bookings.view', 'listings.view'])
      ).toBe(false);
    });
  });

  describe('requirePermission', () => {
    it('should not throw when user has permission', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
        },
        isAuthenticated: true,
        isAdmin: true,
        isSaksbehandler: false,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(() =>
        result.current.requirePermission('bookings.view')
      ).not.toThrow();
    });

    it('should throw when user lacks permission', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-3',
          name: 'Regular User',
          email: 'user@example.com',
          role: 'user',
        },
        isAuthenticated: true,
        isAdmin: false,
        isSaksbehandler: false,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(() => result.current.requirePermission('bookings.approve')).toThrow(
        'Permission denied: bookings.approve'
      );
    });

    it('should throw when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isSaksbehandler: false,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(() => result.current.requirePermission('bookings.view')).toThrow(
        'Permission denied: bookings.view'
      );
    });
  });

  describe('permissions property', () => {
    it('should return all permissions for admin role', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
        },
        isAuthenticated: true,
        isAdmin: true,
        isSaksbehandler: false,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(result.current.permissions).toEqual([
        'bookings.view',
        'bookings.approve',
        'bookings.reject',
        'bookings.cancel',
        'listings.view',
        'listings.create',
        'listings.edit',
        'listings.delete',
        'users.view',
        'users.manage',
        'settings.view',
        'settings.edit',
        'reports.view',
        'reports.export',
      ]);
    });

    it('should return limited permissions for saksbehandler role', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-2',
          name: 'Saksbehandler User',
          email: 'saksbehandler@example.com',
          role: 'saksbehandler',
        },
        isAuthenticated: true,
        isAdmin: false,
        isSaksbehandler: true,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(result.current.permissions).toEqual([
        'bookings.view',
        'bookings.approve',
        'bookings.reject',
        'bookings.cancel',
        'listings.view',
        'reports.view',
      ]);
    });

    it('should return minimal permissions for user role', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-3',
          name: 'Regular User',
          email: 'user@example.com',
          role: 'user',
        },
        isAuthenticated: true,
        isAdmin: false,
        isSaksbehandler: false,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(result.current.permissions).toEqual([
        'bookings.view',
        'listings.view',
      ]);
    });

    it('should return empty array when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isSaksbehandler: false,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(result.current.permissions).toEqual([]);
    });

    it('should return empty array for unknown role', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-4',
          name: 'Unknown Role User',
          email: 'unknown@example.com',
          role: 'unknown-role' as any,
        },
        isAuthenticated: true,
        isAdmin: false,
        isSaksbehandler: false,
      } as AuthContextType);

      const { result } = renderHook(() => useRBAC());

      expect(result.current.permissions).toEqual([]);
    });
  });
});
