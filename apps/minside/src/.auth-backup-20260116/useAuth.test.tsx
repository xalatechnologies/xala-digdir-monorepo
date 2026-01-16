import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReactNode } from 'react';
import { useAuth, AuthContext, AuthContextType, BackofficeUser } from './useAuth';

describe('useAuth', () => {
  const mockUser: User = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
  };

  const mockSaksbehandlerUser: User = {
    id: 'user-2',
    name: 'Saksbehandler User',
    email: 'saksbehandler@example.com',
    role: 'saksbehandler',
  };

  const createWrapper = (contextValue: AuthContextType | null) => {
    return ({ children }: { children: ReactNode }) => (
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    );
  };

  it('should throw error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleError.mockRestore();
  });

  it('should return context value when used within AuthProvider', () => {
    const mockContext: AuthContextType = {
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      isAdmin: true,
      isSaksbehandler: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkRole: vi.fn(),
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    });

    expect(result.current).toEqual(mockContext);
  });

  it('should return unauthenticated state when user is null', () => {
    const mockContext: AuthContextType = {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isAdmin: false,
      isSaksbehandler: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkRole: vi.fn(),
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isSaksbehandler).toBe(false);
  });

  it('should return loading state correctly', () => {
    const mockContext: AuthContextType = {
      user: null,
      isLoading: true,
      isAuthenticated: false,
      isAdmin: false,
      isSaksbehandler: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkRole: vi.fn(),
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should return admin role correctly', () => {
    const mockContext: AuthContextType = {
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      isAdmin: true,
      isSaksbehandler: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkRole: vi.fn((role) => role === 'admin'),
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    });

    expect(result.current.user?.role).toBe('admin');
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isSaksbehandler).toBe(false);
    expect(result.current.checkRole('admin')).toBe(true);
    expect(result.current.checkRole('saksbehandler')).toBe(false);
  });

  it('should return saksbehandler role correctly', () => {
    const mockContext: AuthContextType = {
      user: mockSaksbehandlerUser,
      isLoading: false,
      isAuthenticated: true,
      isAdmin: false,
      isSaksbehandler: true,
      login: vi.fn(),
      logout: vi.fn(),
      checkRole: vi.fn((role) => role === 'saksbehandler'),
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    });

    expect(result.current.user?.role).toBe('saksbehandler');
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isSaksbehandler).toBe(true);
    expect(result.current.checkRole('saksbehandler')).toBe(true);
    expect(result.current.checkRole('admin')).toBe(false);
  });

  it('should expose login function', () => {
    const mockLogin = vi.fn();
    const mockContext: AuthContextType = {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isAdmin: false,
      isSaksbehandler: false,
      login: mockLogin,
      logout: vi.fn(),
      checkRole: vi.fn(),
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    });

    result.current.login('idporten');
    expect(mockLogin).toHaveBeenCalledWith('idporten');
  });

  it('should expose logout function', async () => {
    const mockLogout = vi.fn().mockResolvedValue(undefined);
    const mockContext: AuthContextType = {
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      isAdmin: true,
      isSaksbehandler: false,
      login: vi.fn(),
      logout: mockLogout,
      checkRole: vi.fn(),
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    });

    await result.current.logout();
    expect(mockLogout).toHaveBeenCalled();
  });

  it('should handle authentication state transitions', () => {
    // Test loading state
    const loadingContext: AuthContextType = {
      user: null,
      isLoading: true,
      isAuthenticated: false,
      isAdmin: false,
      isSaksbehandler: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkRole: vi.fn(),
    };

    const { result: loadingResult } = renderHook(() => useAuth(), {
      wrapper: createWrapper(loadingContext),
    });

    expect(loadingResult.current.isLoading).toBe(true);
    expect(loadingResult.current.isAuthenticated).toBe(false);

    // Test authenticated state
    const authenticatedContext: AuthContextType = {
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      isAdmin: true,
      isSaksbehandler: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkRole: vi.fn(),
    };

    const { result: authResult } = renderHook(() => useAuth(), {
      wrapper: createWrapper(authenticatedContext),
    });

    expect(authResult.current.isLoading).toBe(false);
    expect(authResult.current.isAuthenticated).toBe(true);
    expect(authResult.current.user).toEqual(mockUser);
  });

  it('should expose checkRole function', () => {
    const mockCheckRole = vi.fn((role) => role === 'admin');
    const mockContext: AuthContextType = {
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      isAdmin: true,
      isSaksbehandler: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkRole: mockCheckRole,
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    });

    expect(result.current.checkRole('admin')).toBe(true);
    expect(result.current.checkRole('saksbehandler')).toBe(false);
    expect(mockCheckRole).toHaveBeenCalledTimes(2);
  });

  it('should handle user data correctly', () => {
    const mockContext: AuthContextType = {
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      isAdmin: true,
      isSaksbehandler: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkRole: vi.fn(),
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockContext),
    });

    expect(result.current.user).toEqual({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin',
    });
  });
});
