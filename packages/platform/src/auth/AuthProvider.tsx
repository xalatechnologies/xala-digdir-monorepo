/**
 * AuthProvider - Platform Authentication Context
 *
 * Provides authentication state and methods across the application.
 * Uses authService from platform/sdk for API operations.
 *
 * @example
 * ```tsx
 * import { AuthProvider, useAuth } from '@xalatechnologies/platform/auth';
 *
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <MyApp />
 *     </AuthProvider>
 *   );
 * }
 *
 * function Dashboard() {
 *   const { user, isAuthenticated, logout } = useAuth();
 *   if (!isAuthenticated) return <Redirect to="/login" />;
 *   return <div>Welcome, {user?.name}</div>;
 * }
 * ```
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { authService } from '../sdk/auth';
import type { AuthSession, AuthUser } from '../sdk/auth/types';

// =============================================================================
// Types
// =============================================================================

export interface AuthContextValue {
  /** Current authenticated user */
  user: AuthUser | null;
  /** Current session data */
  session: AuthSession | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth state is loading */
  isLoading: boolean;
  /** Auth error if any */
  error: Error | null;
  /** Logout the current user */
  logout: () => Promise<void>;
  /** Refresh the session */
  refresh: () => Promise<void>;
  /** Check if user has a specific role */
  hasRole: (role: string) => boolean;
  /** Check if user is super admin (for SaaS apps) */
  isSuperAdmin: boolean;
}

export interface AuthProviderProps {
  children: ReactNode;
  /** Skip initial session check (for login pages) */
  skipInitialCheck?: boolean;
  /** Custom error handler */
  onError?: (error: Error) => void;
  /** Callback when auth state changes */
  onAuthChange?: (isAuthenticated: boolean, user: AuthUser | null) => void;
}

// =============================================================================
// Context
// =============================================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// =============================================================================
// Provider
// =============================================================================

export function AuthProvider({
  children,
  skipInitialCheck = false,
  onError,
  onAuthChange,
}: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(!skipInitialCheck);
  const [error, setError] = useState<Error | null>(null);

  const user = session?.user ?? null;
  const isAuthenticated = !!user;

  // Check session on mount
  useEffect(() => {
    if (skipInitialCheck) return;

    let mounted = true;

    const checkSession = async () => {
      try {
        const response = await authService.getSession();
        if (mounted) {
          setSession(response.data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setSession(null);
          // Don't set error for 401 (expected when not logged in)
          if (err instanceof Error && !err.message.includes('401')) {
            setError(err);
            onError?.(err);
          }
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [skipInitialCheck, onError]);

  // Notify on auth changes
  useEffect(() => {
    onAuthChange?.(isAuthenticated, user);
  }, [isAuthenticated, user, onAuthChange]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setSession(null);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Logout failed');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await authService.getSession();
      setSession(response.data);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Session refresh failed');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  const hasRole = useCallback(
    (role: string) => {
      if (!user) return false;
      if (user.role === role) return true;
      if (user.permissions?.includes(role)) return true;
      return false;
    },
    [user]
  );

  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    return (
      user.role === 'super_admin' ||
      user.role === 'platform_admin' ||
      user.permissions?.includes('super_admin') ||
      user.permissions?.includes('platform:admin') ||
      false
    );
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isAuthenticated,
      isLoading,
      error,
      logout,
      refresh,
      hasRole,
      isSuperAdmin,
    }),
    [user, session, isAuthenticated, isLoading, error, logout, refresh, hasRole, isSuperAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to access authentication state and methods
 *
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// =============================================================================
// Exports
// =============================================================================

export { AuthContext };
export type { AuthUser, AuthSession };
