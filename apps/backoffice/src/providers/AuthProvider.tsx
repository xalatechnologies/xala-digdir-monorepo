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

// =============================================================================
// Local Storage Keys
// =============================================================================

/**
 * Storage keys for role persistence.
 * Must match the keys in BackofficeRoleProvider to clear on logout.
 */
const ROLE_STORAGE_KEYS = {
  EFFECTIVE_ROLE: 'backoffice_effective_role',
  REMEMBER_CHOICE: 'backoffice_remember_role_choice',
} as const;

// =============================================================================
// Mock Users for Development
// =============================================================================

/**
 * Admin-only user for testing admin-specific flows.
 * Can access all admin features, skips role selection.
 *
 * Login provider: 'idporten' or 'dev-admin'
 */
const MOCK_ADMIN_USER: BackofficeUser = {
  id: 'mock-admin-001',
  name: 'Kari Nordmann',
  email: 'kari.nordmann@kommune.no',
  role: 'admin',
  grantedRoles: ['admin'],
};

/**
 * Case handler-only user for testing saksbehandler-specific flows.
 * Limited access to booking/approval workflows, skips role selection.
 *
 * Login provider: 'microsoft'
 */
const MOCK_SAKSBEHANDLER_USER: BackofficeUser = {
  id: 'mock-saksbehandler-001',
  name: 'Ola Hansen',
  email: 'ola.hansen@kommune.no',
  role: 'saksbehandler',
  grantedRoles: ['case_handler'],
};

/**
 * Dual-role user for testing role selection flow.
 * Has both admin and case_handler roles, will be prompted to select.
 *
 * Login provider: 'dev-dual'
 */
const MOCK_DUAL_ROLE_USER: BackofficeUser = {
  id: 'mock-dual-001',
  name: 'Per Eriksen',
  email: 'per.eriksen@kommune.no',
  role: 'admin', // Legacy field - kept for backward compatibility
  grantedRoles: ['admin', 'case_handler'],
};

// Use real auth - fetches session from API
const USE_MOCK_AUTH = false;

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

      // Real auth flow - fetch session from API
      try {
        const response = await authService.getSession();
        if (response.data?.user) {
          const apiUser = response.data.user;
          // Map API role to BackofficeRole (legacy) and EffectiveBackofficeRole
          // API uses: 'admin', 'saksbehandler', etc.
          // BackofficeRole (legacy): 'admin' | 'saksbehandler'
          // EffectiveBackofficeRole: 'admin' | 'case_handler'
          const legacyRole: BackofficeRole = apiUser.role === 'admin' ? 'admin' : 'saksbehandler';
          const effectiveRole: import('../lib/capabilities').EffectiveBackofficeRole = 
            apiUser.role === 'admin' ? 'admin' : 'case_handler';
          
          // Map API user to BackofficeUser format
          const backofficeUser: BackofficeUser = {
            id: apiUser.id,
            name: apiUser.name || apiUser.email,
            email: apiUser.email,
            role: legacyRole,
            grantedRoles: [effectiveRole], // Single role from DB
          };

          console.log('========================================');
          console.log('[BACKOFFICE AUTH] User loaded from session:');
          console.log('  Email:', backofficeUser.email);
          console.log('  Name:', backofficeUser.name);
          console.log('  API Role:', apiUser.role);
          console.log('  Legacy Role:', backofficeUser.role);
          console.log('  Granted Roles:', backofficeUser.grantedRoles);
          console.log('  Effective Role (will be assigned):', effectiveRole);
          console.log('========================================');

          setUser(backofficeUser);
        } else {
          setUser(null);
        }
      } catch {
        // No session or error - user not authenticated
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback((provider: 'idporten' | 'microsoft' | 'dev-admin' | 'dev-dual' = 'idporten') => {
    if (USE_MOCK_AUTH) {
      // Simulate login with a mock user based on provider:
      // - ID-porten: Admin-only user (tests single-role admin flow)
      // - Microsoft: Case handler only (tests single-role auto-assignment)
      // - dev-admin: Admin-only user (same as ID-porten, for explicit testing)
      // - dev-dual: Dual-role user (tests role selection flow)
      let mockUser: BackofficeUser;
      switch (provider) {
        case 'idporten':
        case 'dev-admin':
          mockUser = MOCK_ADMIN_USER;
          break;
        case 'dev-dual':
          mockUser = MOCK_DUAL_ROLE_USER;
          break;
        case 'microsoft':
        default:
          mockUser = MOCK_SAKSBEHANDLER_USER;
          break;
      }
      localStorage.setItem('backoffice_mock_user', JSON.stringify(mockUser));
      setUser(mockUser);

      // Don't navigate directly - let ProtectedRoute handle the redirect
      // based on whether role selection is needed
      // For single-role users: auto-redirects to appropriate home
      // For dual-role users: redirects to /role-selection
      navigate('/');
      return;
    }

    // Real OAuth flow - uncomment when API is ready
    // const apiUrl = getApiUrl();
    // window.location.href = `${apiUrl}/api/auth/oauth/${provider}`;
  }, [navigate]);

  const logout = useCallback(async () => {
    console.log('========================================');
    console.log('[BACKOFFICE AUTH] Logging out...');
    console.log('========================================');

    if (USE_MOCK_AUTH) {
      // Clear user session
      localStorage.removeItem('backoffice_mock_user');

      // Clear role selection state to ensure fresh role selection on next login
      // This prevents stale role data from persisting across different user logins
      localStorage.removeItem(ROLE_STORAGE_KEYS.EFFECTIVE_ROLE);
      localStorage.removeItem(ROLE_STORAGE_KEYS.REMEMBER_CHOICE);

      console.log('[BACKOFFICE AUTH] Mock auth cleared');
      setUser(null);
      navigate('/login');
      return;
    }

    // Real logout - call API to clear session cookie
    try {
      await authService.logout();
      console.log('[BACKOFFICE AUTH] API logout successful');

      // Clear role storage on logout
      localStorage.removeItem(ROLE_STORAGE_KEYS.EFFECTIVE_ROLE);
      localStorage.removeItem(ROLE_STORAGE_KEYS.REMEMBER_CHOICE);
      console.log('[BACKOFFICE AUTH] Role storage cleared');
    } catch (error) {
      console.error('[BACKOFFICE AUTH] Logout failed:', error);
      // Continue with logout even if API call fails
    } finally {
      setUser(null);
      console.log('[BACKOFFICE AUTH] User cleared, redirecting to login...');
      console.log('========================================');
      navigate('/login');
    }
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
