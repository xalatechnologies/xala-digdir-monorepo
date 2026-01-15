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

// Mock users for development
const MOCK_ADMIN_USER: BackofficeUser = {
  id: 'mock-admin-001',
  name: 'Kari Nordmann',
  email: 'kari.nordmann@kommune.no',
  role: 'admin',
};

const MOCK_SAKSBEHANDLER_USER: BackofficeUser = {
  id: 'mock-saksbehandler-001',
  name: 'Ola Hansen',
  email: 'ola.hansen@kommune.no',
  role: 'saksbehandler',
};

// Simulated login - will be replaced with real OAuth when API is ready
const USE_MOCK_AUTH = true;

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

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (USE_MOCK_AUTH) {
        // Check localStorage for mock session
        const savedUser = localStorage.getItem('backoffice_mock_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
        return;
      }

      // Real auth flow - uncomment when API is ready
      // try {
      //   const response = await getMe();
      //   setUser(response.data);
      // } catch {
      //   setUser(null);
      // } finally {
      //   setIsLoading(false);
      // }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback((provider: 'idporten' | 'microsoft' = 'idporten') => {
    if (USE_MOCK_AUTH) {
      // Simulate login with a mock user based on provider
      // ID-porten gives admin, Microsoft gives saksbehandler (for demo purposes)
      const mockUser = provider === 'idporten' ? MOCK_ADMIN_USER : MOCK_SAKSBEHANDLER_USER;
      localStorage.setItem('backoffice_mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      navigate('/');
      return;
    }

    // Real OAuth flow - uncomment when API is ready
    // const apiUrl = getApiUrl();
    // window.location.href = `${apiUrl}/api/auth/oauth/${provider}`;
  }, [navigate]);

  const logout = useCallback(async () => {
    if (USE_MOCK_AUTH) {
      localStorage.removeItem('backoffice_mock_user');
      setUser(null);
      navigate('/login');
      return;
    }

    // Real logout - uncomment when API is ready
    // try {
    //   await apiLogout();
    // } finally {
    //   setUser(null);
    //   navigate('/login');
    // }
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
