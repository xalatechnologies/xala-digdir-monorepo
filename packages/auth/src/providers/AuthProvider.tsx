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
 * - NO mock authentication (enforced at package level)
 * - HTTP-only cookies set by api.digilist.no
 * - Domain: .digilist.no (works across all subdomains = SSO!)
 * - OAuth 2.0 Authorization Code flow (RFC 8252 compliant)
 * 
 * ROLE-BASED ACCESS CONTROL
 * -------------------------
 * - minside: citizen, admin
 * - backoffice: admin, saksbehandler, super_admin
 * - saas-admin: super_admin, admin
 * - tenant-admin: tenant_admin, admin
 * - web: all authenticated users
 */

import { useState, useEffect, useCallback, useMemo, useSyncExternalStore, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@digilist/client-sdk/services';
import {
  FLOW_CONTEXT_KEY,
  hasStoredFlowContext as checkStoredFlowContext,
  clearFlowContextFromStorage,
  getFlowContextTTL,
} from '@digilist/client-sdk';

import type {
  User,
  UserRole,
  AppType,
  AuthConfig,
  AuthContextType,
  RestoreFlowContextResult,
} from '../types';

// =============================================================================
// Role-Based Access Control Configuration
// =============================================================================

/**
 * Default role requirements per app type
 */
const DEFAULT_ALLOWED_ROLES: Record<AppType, UserRole[]> = {
  'minside': ['citizen', 'admin', 'super_admin'],
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
  'web': 'Du må være innlogget for å få tilgang til denne siden.',
};

// =============================================================================
// Storage Event Subscription (for cross-tab sync)
// =============================================================================

const subscribers = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  subscribers.add(callback);

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

function getSnapshot(): boolean {
  return checkStoredFlowContext();
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessDeniedError, setAccessDeniedError] = useState<string | null>(null);
  const navigate = useNavigate();

  const hasStoredContext = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  // Determine allowed roles for this app
  const allowedRoles = config.allowedRoles ?? DEFAULT_ALLOWED_ROLES[config.appType];
  const accessDeniedMessage = config.accessDeniedMessage ?? DEFAULT_ACCESS_DENIED_MESSAGES[config.appType];

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
   * Initialize authentication - check for existing session
   */
  useEffect(() => {
    const checkAuth = async () => {
      debug('Checking authentication status...');

      // Check URL for OAuth callback with authorization code
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        debug('OAuth callback detected, exchanging code for session...');
        
        try {
          // Exchange authorization code for session
          const response = await authService.handleOAuthCallback(code);
          const session = response.data;

          const userData: User = {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: session.user.role as UserRole,
            grantedRoles: session.user.grantedRoles,
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
            return;
          }

          // Store user data in localStorage for quick access (NOT for auth)
          localStorage.setItem(`${config.appType}_user`, JSON.stringify(userData));
          setUser(userData);

          // Clean URL to remove authorization code
          window.history.replaceState({}, document.title, window.location.pathname);
          setIsLoading(false);
          return;
        } catch (error) {
          debug('OAuth callback failed:', error);
          window.history.replaceState({}, document.title, window.location.pathname);
          setUser(null);
          setIsLoading(false);
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
          grantedRoles: session.user.grantedRoles,
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
          return;
        }

        // Store user data in localStorage for quick access (NOT for auth)
        localStorage.setItem(`${config.appType}_user`, JSON.stringify(userData));
        setAccessDeniedError(null);
        setUser(userData);
      } catch (error) {
        // ✅ SECURITY FIX: Session validation failed - clear ALL user data
        // HTTP-only session cookie is the ONLY source of authentication truth
        debug('Session validation failed - clearing user state');
        
        setUser(null);
        localStorage.removeItem(`${config.appType}_user`);
        localStorage.removeItem('backoffice_mock_user'); // Clean up legacy
        localStorage.removeItem('minside_user'); // Clean up legacy
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [config.appType, hasRequiredRole, accessDeniedMessage, debug]);

  /**
   * Initiate OAuth login
   */
  const login = useCallback(async (provider: 'idporten' | 'microsoft' | 'vipps' = 'idporten') => {
    debug('Initiating OAuth login with provider:', provider);

    try {
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
  }, [debug, config]);

  /**
   * Logout current user
   */
  const logout = useCallback(async () => {
    debug('Logging out...');

    // ✅ CRITICAL: Clear local state FIRST
    setUser(null);
    localStorage.removeItem(`${config.appType}_user`);
    localStorage.removeItem('backoffice_mock_user'); // Clean up legacy
    localStorage.removeItem('minside_user'); // Clean up legacy
    
    // Clear role storage (backoffice)
    localStorage.removeItem('backoffice_effective_role');
    localStorage.removeItem('backoffice_remember_role_choice');
    
    clearFlowContextFromStorage();
    notifySubscribers();

    debug('Local state cleared');

    // Server-side session invalidation
    try {
      await authService.logout();
      debug('Server session cleared');
    } catch (error) {
      debug('Server logout failed (continuing anyway):', error);
    }

    debug('Redirecting to login...');
    navigate('/login', { replace: true });
  }, [config.appType, navigate, debug]);

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
    
    const result = authService.resumeFlow(clearAfterLoad);

    if (clearAfterLoad && result.hasContext) {
      notifySubscribers();
    }

    const ttl = result.flowContext
      ? getFlowContextTTL(result.flowContext)
      : undefined;

    debug('Flow context restored:', result.hasContext ? 'yes' : 'no');

    return {
      hasContext: result.hasContext,
      flowContext: result.flowContext,
      ttl,
      wasExpired: result.wasExpired,
      wasInvalid: result.wasInvalid,
    };
  }, [debug]);

  /**
   * Clear any stored flow context
   */
  const clearFlowContext = useCallback((): void => {
    debug('Clearing flow context');
    clearFlowContextFromStorage();
    notifySubscribers();
  }, [debug]);

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
    }),
    [user, isLoading, accessDeniedError, hasStoredContext, login, logout, checkRole, restoreFlowContext, clearFlowContext]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
