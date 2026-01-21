/**
 * Centralized Authentication Provider
 * ==================================
 *
 * Single source of truth for authentication across ALL Xala/Digilist applications.
 * Replaces 4 separate AuthProvider implementations (~1,400 lines) with one (~400 lines).
 *
 * SECURITY ARCHITECTURE: HTTP-Only Cookie-Based Authentication
 * -----------------------------------------------------------
 * - NO tokens in URLs or localStorage
 * - NO mock authentication in PRODUCTION (enforced at package level)
 * - HTTP-only cookies set by api.digilist.no
 * - Domain: .digilist.no (works across all subdomains = SSO!)
 * - OAuth 2.0 Authorization Code flow (RFC 8252 compliant)
 *
 * DEVELOPMENT MODE (VITE_ENABLE_DEV_MODE=true)
 * -------------------------------------------
 * - Auto-login with mock developer user (bypasses all auth)
 * - Skips API calls for session validation
 * - NEVER enabled in production builds
 * - Speeds up development by removing login friction
 *
 * ROLE-BASED ACCESS CONTROL
 * -------------------------
 * - minside: citizen, admin
 * - backoffice: admin, saksbehandler, super_admin
 * - saas-admin: super_admin, admin
 * - tenant-admin: tenant_admin, admin
 * - web: all authenticated users
 *
 * DEPENDENCY INJECTION
 * --------------------
 * This provider uses AuthServiceContext for dependency injection.
 * Auth services can be provided in two ways:
 *
 * 1. Via AuthServiceProvider (recommended):
 * ```tsx
 * <AuthServiceProvider authService={myAuthService}>
 *   <AuthProvider config={{ appType: 'my-app' }}>
 *     <App />
 *   </AuthProvider>
 * </AuthServiceProvider>
 * ```
 *
 * 2. Via config.injectedService (legacy, still supported):
 * ```tsx
 * <AuthProvider config={{
 *   appType: 'my-app',
 *   injectedService: { authService: myAuthService }
 * }}>
 *   <App />
 * </AuthProvider>
 * ```
 */

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useSyncExternalStore,
  createContext,
  useRef,
  useContext,
} from 'react';
import { useNavigate } from 'react-router-dom';

import type {
  User,
  UserRole,
  AppType,
  AuthConfig,
  AuthContextType,
  RestoreFlowContextResult,
  AuthServiceContract,
  FlowContextUtilities,
  FlowResumeResult,
} from '../types';

import {
  AuthServiceContext,
  defaultFlowContextUtils,
} from './AuthServiceContext';

// =============================================================================
// Role-Based Access Control Configuration
// =============================================================================

/**
 * Default role requirements per app type
 */
const DEFAULT_ALLOWED_ROLES: Record<AppType, UserRole[]> = {
  'minside': [], // All authenticated users allowed
  'backoffice': ['admin', 'saksbehandler', 'super_admin', 'case_handler'],
  'saas-admin': ['super_admin', 'admin'],
  'tenant-admin': ['tenant_admin', 'admin', 'super_admin'],
  'web': [], // All authenticated users allowed
};

/**
 * Default access denied messages per app type (Norwegian)
 */
const DEFAULT_ACCESS_DENIED_MESSAGES: Record<AppType, string> = {
  'minside': 'Du har ikke tilgang til Min Side. Kun innbyggere og administratorer har tilgang.',
  'backoffice': 'Du har ikke tilgang til administrasjonspanelet. Kun administratorer og saksbehandlere har tilgang.',
  'saas-admin': 'Du har ikke tilgang til dette panelet. Kun superadministratorer har tilgang.',
  'tenant-admin': 'Du har ikke tilgang til dette panelet. Kun leietakeradministratorer har tilgang.',
  'web': 'Du m\u00e5 v\u00e6re innlogget for \u00e5 f\u00e5 tilgang til denne siden.',
};

// =============================================================================
// Storage Event Subscription (for cross-tab sync)
// =============================================================================

const subscribers = new Set<() => void>();

// Current flow context key (can be customized via FlowContextUtilities)
let currentFlowContextKey = 'auth_flow_context';
let currentHasStoredFlowContext = defaultFlowContextUtils.hasStoredFlowContext;

function subscribe(callback: () => void): () => void {
  subscribers.add(callback);

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === currentFlowContextKey || event.key === null) {
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

function getSnapshot(): boolean {
  return currentHasStoredFlowContext();
}

function getServerSnapshot(): boolean {
  return false;
}

function notifySubscribers(): void {
  subscribers.forEach((callback) => callback());
}

// =============================================================================
// Auth Context
// =============================================================================

export const AuthContext = createContext<AuthContextType | null>(null);

// =============================================================================
// Auth Provider Component
// =============================================================================

interface AuthProviderProps {
  children: React.ReactNode;
  config: AuthConfig;
}

export function AuthProvider({ children, config }: AuthProviderProps) {
  // Check for dev mode (strict safeguards)
  const env = (import.meta as any).env;
  const isDevMode =
    env?.DEV === true &&           // Vite dev server running
    env?.PROD !== true &&          // NOT a production build
    env?.MODE === 'development' && // Explicit development mode
    env?.VITE_ENABLE_DEV_MODE === 'true'; // Explicit opt-in required

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessDeniedError, setAccessDeniedError] = useState<string | null>(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<Date | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  // =============================================================================
  // Get Auth Service (from context or config.injectedService)
  // =============================================================================

  const serviceContext = useContext(AuthServiceContext);

  // Determine auth service source:
  // 1. config.injectedService (legacy, direct injection)
  // 2. AuthServiceContext (recommended, via AuthServiceProvider)
  const authServiceRef = useRef<AuthServiceContract | null>(
    config.injectedService?.authService ?? null
  );
  const flowUtilsRef = useRef<FlowContextUtilities>(
    config.injectedService?.flowContextUtils ?? defaultFlowContextUtils
  );

  // If no injected service, try to get from context
  const [serviceReady, setServiceReady] = useState(!!config.injectedService);

  // Initialize service from context if not injected directly
  useEffect(() => {
    if (!config.injectedService && serviceContext.isInitialized) {
      authServiceRef.current = serviceContext.authService;
      flowUtilsRef.current = serviceContext.flowContextUtils;

      // Update subscription helpers
      currentFlowContextKey = serviceContext.flowContextUtils.FLOW_CONTEXT_KEY;
      currentHasStoredFlowContext = serviceContext.flowContextUtils.hasStoredFlowContext;

      setServiceReady(true);
    }
  }, [config.injectedService, serviceContext]);

  // Helper to get auth service (throws if not ready)
  const getAuthService = useCallback((): AuthServiceContract => {
    if (!authServiceRef.current) {
      throw new Error(
        '@xala/auth: Auth service not initialized. ' +
        'Either wrap your app with AuthServiceProvider or provide config.injectedService.'
      );
    }
    return authServiceRef.current;
  }, []);

  // Helper functions for flow context (use the loaded utilities)
  const hasStoredFlowContextFn = useCallback(() => flowUtilsRef.current.hasStoredFlowContext(), []);
  const clearFlowContextFromStorageFn = useCallback(() => flowUtilsRef.current.clearFlowContextFromStorage(), []);
  const getFlowContextTTLFn = useCallback(
    (ctx: FlowResumeResult['flowContext']) => flowUtilsRef.current.getFlowContextTTL(ctx),
    []
  );

  const hasStoredContext = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  // Determine allowed roles for this app
  const allowedRoles = config.allowedRoles
    ?? DEFAULT_ALLOWED_ROLES[config.appType as keyof typeof DEFAULT_ALLOWED_ROLES]
    ?? [];
  const accessDeniedMessage = config.accessDeniedMessage
    ?? DEFAULT_ACCESS_DENIED_MESSAGES[config.appType as keyof typeof DEFAULT_ACCESS_DENIED_MESSAGES]
    ?? 'You do not have access to this application.';

  // Debug logging helper
  const debug = useCallback((...args: unknown[]) => {
    if (config.debug) {
      console.log(`[XALA/AUTH:${config.appType.toUpperCase()}]`, ...args);
    }
  }, [config.debug, config.appType]);

  /**
   * Check if user has required role for this app
   */
  const hasRequiredRole = useCallback((user: User): boolean => {
    // If no role restrictions, allow all authenticated users
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    // Check if user's role is in allowed list
    const userHasRole = allowedRoles.includes(user.role);

    // For backoffice, also check grantedRoles
    if (config.appType === 'backoffice' && user.grantedRoles) {
      const grantedRoleMatch = user.grantedRoles.some(grantedRole =>
        allowedRoles.includes(grantedRole as UserRole)
      );
      return userHasRole || grantedRoleMatch;
    }

    return userHasRole;
  }, [allowedRoles, config.appType]);

  /**
   * Schedule token refresh before expiry
   */
  const scheduleTokenRefresh = useCallback((expiresAt: string) => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;

    // Refresh 2 minutes before expiry (120,000ms)
    const refreshDelay = Math.max(0, timeUntilExpiry - 120000);

    debug(`Scheduling token refresh in ${Math.round(refreshDelay / 1000)}s`);

    refreshTimerRef.current = setTimeout(async () => {
      debug('Auto-refreshing token...');
      try {
        const authService = getAuthService();
        const response = await authService.refreshToken();
        if (response.data?.expiresAt) {
          setTokenExpiresAt(new Date(response.data.expiresAt));
          scheduleTokenRefresh(response.data.expiresAt);
          debug('Token refreshed successfully');
        }
      } catch (error) {
        debug('Token refresh failed:', error);
        // Let 401 interceptor handle logout
      }
    }, refreshDelay);
  }, [debug, getAuthService]);

  /**
   * Clear refresh timer
   */
  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
      debug('Token refresh timer cleared');
    }
  }, [debug]);

  /**
   * Initialize authentication - check for existing session
   */
  useEffect(() => {
    // Wait for service to be ready
    if (!serviceReady) {
      debug('Waiting for auth service to be ready...');
      return;
    }

    const checkAuth = async () => {
      // Add auth:expired event listener
      const handleAuthExpired = () => {
        debug('Auth expired event received');
        setUser(null);
        setTokenExpiresAt(null);
        clearRefreshTimer();
        navigate(config.loginPath || '/login', { replace: true });
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('auth:expired', handleAuthExpired);
      }

      const authService = authServiceRef.current;

      if (!authService) {
        debug('No auth service available');
        setIsLoading(false);
        if (config.onAuthError) {
          config.onAuthError(new Error(
            '@xala/auth: No auth service available. ' +
            'Wrap your app with AuthServiceProvider or provide config.injectedService.'
          ));
        }
        return;
      }

      // Dev mode notification (mock auth removed)
      if (isDevMode) {
        debug('Dev mode enabled but mock auth removed - use demo token login');
      }

      debug('Checking authentication status...');

      // Check URL for OAuth callback with authorization code
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (code) {
        debug('OAuth callback detected, exchanging code for session...');
        debug('Authorization code:', code);
        debug('State parameter:', state || 'none');

        try {
          // Exchange authorization code for session
          const response = await authService.handleOAuthCallback(code, state || undefined);
          const session = response.data;

          const userData: User = {
            id: session.user.id,
            name: session.user.name || session.user.email,
            email: session.user.email,
            role: session.user.role as UserRole,
            grantedRoles: session.user.grantedRoles as User['grantedRoles'],
            tenantId: session.user.tenantId,
          };

          debug('OAuth callback successful:', userData.email, userData.role);

          // Check role-based access
          if (!hasRequiredRole(userData)) {
            debug('Access denied - role not allowed:', userData.role);
            setAccessDeniedError(accessDeniedMessage);
            setUser(null);

            // Clear session
            try {
              await authService.logout();
            } catch (error) {
              debug('Logout after access denied failed:', error);
            }

            setIsLoading(false);

            // Cleanup event listener
            if (typeof window !== 'undefined') {
              window.removeEventListener('auth:expired', handleAuthExpired);
            }
            return;
          }

          // Parse token expiry and schedule refresh
          if (session.expiresAt) {
            setTokenExpiresAt(new Date(session.expiresAt));
            scheduleTokenRefresh(session.expiresAt);
          }

          // Store user data in localStorage for quick access (NOT for auth)
          localStorage.setItem(`${config.appType}_user`, JSON.stringify(userData));
          setUser(userData);

          // Clean URL to remove authorization code
          window.history.replaceState({}, document.title, window.location.pathname);
          setIsLoading(false);

          // Cleanup event listener
          if (typeof window !== 'undefined') {
            window.removeEventListener('auth:expired', handleAuthExpired);
          }
          return;
        } catch (error) {
          debug('OAuth callback failed:', error);
          window.history.replaceState({}, document.title, window.location.pathname);
          setUser(null);
          setIsLoading(false);

          // Cleanup event listener
          if (typeof window !== 'undefined') {
            window.removeEventListener('auth:expired', handleAuthExpired);
          }
          return;
        }
      }

      // Check for existing session via HTTP-only cookie
      try {
        debug('Validating existing session...');
        const response = await authService.getSession();
        const session = response.data;

        const userData: User = {
          id: session.user.id,
          name: session.user.name || session.user.email,
          email: session.user.email,
          role: session.user.role as UserRole,
          grantedRoles: session.user.grantedRoles as User['grantedRoles'],
          tenantId: session.user.tenantId,
        };

        debug('Session valid:', userData.email, userData.role);

        // Check role-based access
        if (!hasRequiredRole(userData)) {
          debug('Access denied - role not allowed:', userData.role);
          setAccessDeniedError(accessDeniedMessage);
          setUser(null);

          // Clear session
          try {
            await authService.logout();
          } catch (error) {
            debug('Logout after access denied failed:', error);
          }

          setIsLoading(false);

          // Cleanup event listener
          if (typeof window !== 'undefined') {
            window.removeEventListener('auth:expired', handleAuthExpired);
          }
          return;
        }

        // Parse token expiry and schedule refresh
        if (session.expiresAt) {
          setTokenExpiresAt(new Date(session.expiresAt));
          scheduleTokenRefresh(session.expiresAt);
        }

        // Store user data in localStorage for quick access (NOT for auth)
        localStorage.setItem(`${config.appType}_user`, JSON.stringify(userData));
        setAccessDeniedError(null);
        setUser(userData);
      } catch (error) {
        // Session validation failed - clear ALL user data
        debug('Session validation failed - clearing user state');

        setUser(null);
        localStorage.removeItem(`${config.appType}_user`);
        localStorage.removeItem('backoffice_mock_user'); // Clean up legacy
        localStorage.removeItem('minside_user'); // Clean up legacy
      } finally {
        setIsLoading(false);

        // Cleanup event listener
        if (typeof window !== 'undefined') {
          window.removeEventListener('auth:expired', handleAuthExpired);
        }
      }
    };

    checkAuth();

    // Cleanup on unmount
    return () => {
      clearRefreshTimer();
    };
  }, [
    serviceReady,
    config.appType,
    config.loginPath,
    config.onAuthError,
    hasRequiredRole,
    accessDeniedMessage,
    debug,
    clearRefreshTimer,
    navigate,
    scheduleTokenRefresh,
    isDevMode,
  ]);

  /**
   * Re-check session on visibility change
   * When tab becomes visible, validate session is still active
   */
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && user && !isDevMode && authServiceRef.current) {
        debug('Tab became visible - checking session...');
        try {
          const response = await authServiceRef.current.getSession();
          // Session still valid, update expiry if needed
          if (response.data?.expiresAt) {
            setTokenExpiresAt(new Date(response.data.expiresAt));
            scheduleTokenRefresh(response.data.expiresAt);
            debug('Session validated on visibility change');
          }
        } catch (error) {
          debug('Session check failed on visibility change:', error);
          // Let 401 interceptor handle logout
        }
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [user, debug, scheduleTokenRefresh, isDevMode]);

  /**
   * Initiate OAuth login
   */
  const login = useCallback(async (provider: 'idporten' | 'microsoft' | 'vipps' = 'idporten') => {
    debug('Initiating OAuth login with provider:', provider);

    try {
      const authService = getAuthService();
      const callbackUrl = window.location.origin + '/';
      const response = await authService.initiateOAuth(provider, callbackUrl);

      debug('Redirecting to OAuth provider:', response.data.redirectUrl);
      window.location.href = response.data.redirectUrl;
    } catch (error) {
      debug('OAuth initiation failed:', error);
      if (config.onAuthError) {
        config.onAuthError(error as Error);
      }
    }
  }, [debug, config, getAuthService]);

  /**
   * Logout current user
   */
  const logout = useCallback(async () => {
    debug('Logging out...');

    // Clear local state FIRST
    setUser(null);
    localStorage.removeItem(`${config.appType}_user`);
    localStorage.removeItem('backoffice_mock_user'); // Clean up legacy
    localStorage.removeItem('minside_user'); // Clean up legacy

    // Clear role storage (backoffice)
    localStorage.removeItem('backoffice_effective_role');
    localStorage.removeItem('backoffice_remember_role_choice');

    clearFlowContextFromStorageFn();
    notifySubscribers();

    debug('Local state cleared');

    // Server-side session invalidation
    try {
      const authService = getAuthService();
      await authService.logout();
      debug('Server session cleared');
    } catch (error) {
      debug('Server logout failed (continuing anyway):', error);
    }

    debug('Redirecting to login...');
    navigate('/login', { replace: true });
  }, [config.appType, navigate, debug, clearFlowContextFromStorageFn, getAuthService]);

  /**
   * Handle auth callback - set user state directly (for demo login without page reload)
   */
  const handleAuthCallback = useCallback((userData: Pick<User, 'id' | 'name' | 'email'>) => {
    debug('handleAuthCallback called:', userData.email);

    const fullUser: User = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: 'citizen' as UserRole, // Default role for demo users
    };

    // Store in localStorage for persistence
    localStorage.setItem(`${config.appType}_user`, JSON.stringify(fullUser));
    setUser(fullUser);

    debug('User state updated via handleAuthCallback');
  }, [config.appType, debug]);

  /**
   * Check if user has specific role
   */
  const checkRole = useCallback((role: UserRole): boolean => {
    if (!user) return false;

    if (role === 'admin') return user.role === 'admin' || user.role === 'super_admin';
    if (role === 'saksbehandler') return user.role === 'admin' || user.role === 'saksbehandler';

    return user.role === role;
  }, [user]);

  /**
   * Restore flow context after authentication
   */
  const restoreFlowContext = useCallback((clearAfterLoad: boolean = true): RestoreFlowContextResult => {
    debug('Restoring flow context...');

    const authService = getAuthService();
    const result = authService.resumeFlow(clearAfterLoad);

    if (clearAfterLoad && result.hasContext) {
      notifySubscribers();
    }

    const ttl = result.flowContext
      ? getFlowContextTTLFn(result.flowContext)
      : undefined;

    debug('Flow context restored:', result.hasContext ? 'yes' : 'no');

    return {
      hasContext: result.hasContext,
      flowContext: result.flowContext,
      ttl,
      wasExpired: result.wasExpired,
      wasInvalid: result.wasInvalid,
    };
  }, [debug, getAuthService, getFlowContextTTLFn]);

  /**
   * Clear any stored flow context
   */
  const clearFlowContext = useCallback((): void => {
    debug('Clearing flow context');
    clearFlowContextFromStorageFn();
    notifySubscribers();
  }, [debug, clearFlowContextFromStorageFn]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
      isSaksbehandler:
        user?.role === 'admin' || user?.role === 'saksbehandler',
      accessDeniedError,
      hasStoredContext,
      login,
      logout,
      checkRole,
      restoreFlowContext,
      clearFlowContext,
      handleAuthCallback,
    }),
    [user, isLoading, accessDeniedError, hasStoredContext, login, logout, checkRole, restoreFlowContext, clearFlowContext, handleAuthCallback]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
