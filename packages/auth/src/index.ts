/**
 * @xala/auth - Authentication Package
 *
 * Provides authentication hooks and types for Xala applications.
 * Includes support for tenant admin roles and RBAC.
 */

import * as React from 'react';
import { createContext, useContext } from 'react';

// =============================================================================
// Tenant Admin Role Types
// =============================================================================

/**
 * Tenant-level roles for tenant-wide administration
 */
export type TenantAdminRole = 'TENANT_ADMIN' | 'TENANT_BILLING_ADMIN' | 'TENANT_TECH_ADMIN';

/**
 * Tenant Admin user type
 */
export interface TenantAdminUser {
  id: string;
  name: string;
  email: string;
  /**
   * ID of the tenant this user belongs to
   */
  tenantId: string;
  /**
   * Name of the tenant for display purposes
   */
  tenantName: string;
  /**
   * Primary role for the user
   */
  role: TenantAdminRole;
  /**
   * Array of roles the user has been granted
   * Used for multi-role support in future
   */
  grantedRoles?: TenantAdminRole[];
}

// =============================================================================
// Auth Context Type
// =============================================================================

export interface AuthContextType {
  user: TenantAdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** User has tenant admin privileges (full access) */
  isTenantAdmin: boolean;
  /** User has billing admin privileges */
  isBillingAdmin: boolean;
  /** User has tech admin privileges */
  isTechAdmin: boolean;
  login: (provider?: 'idporten' | 'microsoft' | 'dev-admin' | 'dev-billing' | 'dev-tech') => void;
  logout: () => Promise<void>;
  checkRole: (role: TenantAdminRole) => boolean;
}

// =============================================================================
// Auth Context
// =============================================================================

export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Hook to access auth context
 * Must be used within an AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// =============================================================================
// Auth Provider
// =============================================================================

export interface AuthProviderConfig {
  /** Application type for role validation */
  appType?: 'tenant-admin' | 'backoffice' | 'minside' | 'web';
  /** Enable debug logging */
  debug?: boolean;
}

export interface AuthProviderProps {
  /** Configuration options */
  config?: AuthProviderConfig;
  /** Child components */
  children: React.ReactNode;
}

/**
 * Auth Provider component
 * Provides authentication context to the application
 */
export function AuthProvider({ config, children }: AuthProviderProps): React.ReactElement {
  const [user, setUser] = React.useState<TenantAdminUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Check for existing session on mount
  React.useEffect(() => {
    const checkSession = async () => {
      try {
        // Check for stored user session
        const storedUser = localStorage.getItem('tenant_admin_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          if (config?.debug) {
            console.log('[AuthProvider] Restored session:', parsed);
          }
        }
      } catch (error) {
        if (config?.debug) {
          console.error('[AuthProvider] Session check failed:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [config?.debug]);

  // Login function
  const login = (provider?: 'idporten' | 'microsoft' | 'dev-admin' | 'dev-billing' | 'dev-tech') => {
    if (config?.debug) {
      console.log('[AuthProvider] Login requested:', provider);
    }

    // For demo/dev providers, create a mock user
    if (provider?.startsWith('dev-')) {
      const roleMap: Record<string, TenantAdminRole> = {
        'dev-admin': 'TENANT_ADMIN',
        'dev-billing': 'TENANT_BILLING_ADMIN',
        'dev-tech': 'TENANT_TECH_ADMIN',
      };

      const mockUser: TenantAdminUser = {
        id: `user-${Date.now()}`,
        name: 'Demo User',
        email: 'demo@tenant.local',
        tenantId: 'tenant-demo',
        tenantName: 'Demo Tenant',
        role: roleMap[provider] || 'TENANT_ADMIN',
      };

      localStorage.setItem('tenant_admin_user', JSON.stringify(mockUser));
      setUser(mockUser);

      if (config?.debug) {
        console.log('[AuthProvider] Dev login successful:', mockUser);
      }
    }
  };

  // Logout function
  const logout = async () => {
    if (config?.debug) {
      console.log('[AuthProvider] Logout requested');
    }
    localStorage.removeItem('tenant_admin_user');
    setUser(null);
  };

  // Check if user has a specific role
  const checkRole = (role: TenantAdminRole): boolean => {
    if (!user) return false;
    if (user.role === role) return true;
    if (user.grantedRoles?.includes(role)) return true;
    // Tenant admins have all permissions
    if (user.role === 'TENANT_ADMIN') return true;
    return false;
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isTenantAdmin: checkRole('TENANT_ADMIN'),
    isBillingAdmin: checkRole('TENANT_BILLING_ADMIN') || checkRole('TENANT_ADMIN'),
    isTechAdmin: checkRole('TENANT_TECH_ADMIN') || checkRole('TENANT_ADMIN'),
    login,
    logout,
    checkRole,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}
