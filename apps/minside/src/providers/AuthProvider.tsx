import { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  authService,
  FLOW_CONTEXT_KEY,
  hasStoredFlowContext as checkStoredFlowContext,
  clearFlowContextFromStorage,
  getFlowContextTTL,
} from '@digilist/client-sdk';
import { AuthContext, type AuthContextType, type BackofficeUser, type BackofficeRole, type RestoreFlowContextResult } from '../hooks/useAuth';
import { getClientConfig, setAuthToken, updateClientConfig } from '@digilist/client-sdk';

/**
 * Mock Authentication Users
 *
 * These users are ONLY used when VITE_USE_MOCK_AUTH is enabled for local development.
 * In production, set VITE_USE_MOCK_AUTH=false to use real OAuth authentication.
 *
 * Mock users match the seeded database for consistent testing.
 */
const MOCK_ADMIN_USER: BackofficeUser = {
  id: 'kari-nordmann-001',
  name: 'Kari Nordmann',
  email: 'admin@skien.kommune.no',
  role: 'admin',
};

const MOCK_USER: BackofficeUser = {
  id: '01a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
  name: 'Ola Hansen',
  email: 'ola.hansen@kommune.no',
  role: 'saksbehandler',
};

/**
 * Authentication Mode Toggle
 *
 * Controls whether to use mock authentication or real OAuth flow.
 *
 * - Development (default): USE_MOCK_AUTH = true
 *   - Uses mock users above for quick local testing
 *   - No API calls for authentication
 *
 * - Production: Set VITE_USE_MOCK_AUTH=false in .env
 *   - Uses real OAuth providers (ID-porten, Microsoft, Vipps)
 *   - Redirects to API for authentication
 *   - Receives token via OAuth callback
 */
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH !== 'false';

// =============================================================================
// Storage Event Subscription (for cross-tab sync of flow context)
// =============================================================================

/** Subscribers for storage changes */
const subscribers = new Set<() => void>();

/** Subscribe to storage changes */
function subscribe(callback: () => void): () => void {
  subscribers.add(callback);

  // Listen for storage events from other tabs
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === FLOW_CONTEXT_KEY || event.key === null) {
      callback();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageChange);
  }

  return () => {
    subscribers.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageChange);
    }
  };
}

/** Get current snapshot of whether context exists */
function getSnapshot(): boolean {
  return checkStoredFlowContext();
}

/** Server snapshot (always false since no sessionStorage) */
function getServerSnapshot(): boolean {
  return false;
}

/** Notify all subscribers of changes */
function notifySubscribers(): void {
  subscribers.forEach((callback) => callback());
}

// =============================================================================
// Provider Component
// =============================================================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<BackofficeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Subscribe to storage changes for cross-tab synchronization of flow context
  const hasStoredContext = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  // Get API URL from client config
  const getApiUrl = () => {
    const config = getClientConfig();
    return config?.baseUrl || 'https://api.digilist.no';
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Check URL for OAuth callback with token
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userId = urlParams.get('userId');
      const userName = urlParams.get('userName');
      const userEmail = urlParams.get('userEmail');

      if (token) {
        // OAuth callback - set token and user
        setAuthToken(token);
        const userData: BackofficeUser = {
          id: userId || '',
          name: userName || 'User',
          email: userEmail || '',
          role: 'saksbehandler',
        };
        localStorage.setItem('minside_user', JSON.stringify(userData));
        localStorage.setItem('minside_token', token);
        setUser(userData);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        setIsLoading(false);
        return;
      }

      // Check for saved session
      const savedUser = localStorage.getItem('minside_user');
      const savedToken = localStorage.getItem('minside_token');

      if (savedUser && savedToken) {
        setAuthToken(savedToken);
        setUser(JSON.parse(savedUser));
      } else if (USE_MOCK_AUTH) {
        // Mock auth - check for mock session
        const mockUser = localStorage.getItem('backoffice_mock_user');
        if (mockUser) {
          setUser(JSON.parse(mockUser));
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback((provider: 'idporten' | 'microsoft' | 'vipps' = 'idporten') => {
    if (USE_MOCK_AUTH) {
      // Simulate login - use Ola Hansen (the seeded user)
      const mockUser = provider === 'microsoft' ? MOCK_ADMIN_USER : MOCK_USER;
      localStorage.setItem('backoffice_mock_user', JSON.stringify(mockUser));
      localStorage.setItem('minside_user', JSON.stringify(mockUser));
      setUser(mockUser);
      navigate('/');
      return;
    }

    // Real OAuth flow - redirect to API
    const apiUrl = getApiUrl();
    const returnUrl = encodeURIComponent(window.location.origin + '/');
    window.location.href = `${apiUrl}/api/auth/oauth/${provider}?returnUrl=${returnUrl}`;
  }, [navigate]);

  const logout = useCallback(async () => {
    localStorage.removeItem('backoffice_mock_user');
    localStorage.removeItem('minside_user');
    localStorage.removeItem('minside_token');
    updateClientConfig({ token: undefined });

    // Clear any stored flow context on logout
    clearFlowContextFromStorage();
    notifySubscribers();

    setUser(null);
    navigate('/login');
  }, [navigate]);

  const checkRole = useCallback(
    (role: BackofficeRole): boolean => {
      if (!user) return false;
      if (role === 'admin') return user.role === 'admin';
      if (role === 'saksbehandler')
        return user.role === 'admin' || user.role === 'saksbehandler';
      return true;
    },
    [user]
  );

  /**
   * Restore flow context after authentication
   * Uses authService.resumeFlow internally
   */
  const restoreFlowContext = useCallback((clearAfterLoad: boolean = true): RestoreFlowContextResult => {
    const result = authService.resumeFlow(clearAfterLoad);

    // If we cleared context, notify subscribers
    if (clearAfterLoad && result.hasContext) {
      notifySubscribers();
    }

    // Calculate TTL if we have context
    const ttl = result.flowContext
      ? getFlowContextTTL(result.flowContext)
      : undefined;

    return {
      hasContext: result.hasContext,
      flowContext: result.flowContext,
      ttl,
      wasExpired: result.wasExpired,
      wasInvalid: result.wasInvalid,
    };
  }, []);

  /**
   * Clear any stored flow context
   * Call this after flow completion or on explicit logout
   */
  const clearFlowContext = useCallback((): void => {
    clearFlowContextFromStorage();
    notifySubscribers();
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isSaksbehandler:
        user?.role === 'admin' || user?.role === 'saksbehandler',
      login,
      logout,
      checkRole,
      hasStoredContext,
      restoreFlowContext,
      clearFlowContext,
    }),
    [user, isLoading, login, logout, checkRole, hasStoredContext, restoreFlowContext, clearFlowContext]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
