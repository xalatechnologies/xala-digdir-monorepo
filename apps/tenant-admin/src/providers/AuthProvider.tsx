/**
 * Tenant Admin Auth Provider
 * Manages authentication state for tenant administrators
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, type AuthContextType, type TenantAdminUser, type TenantAdminRole } from '../hooks/useAuth';

// =============================================================================
// Local Storage Keys
// =============================================================================

const AUTH_STORAGE_KEY = 'tenant_admin_user';

// =============================================================================
// Mock Users for Development
// =============================================================================

/**
 * Tenant Admin user for testing full tenant access.
 * Has access to all tenant admin features including user management.
 *
 * Login provider: 'idporten' or 'dev-admin'
 */
const MOCK_TENANT_ADMIN: TenantAdminUser = {
  id: 'mock-tenant-admin-001',
  name: 'Tenant Admin',
  email: 'admin@tenant.no',
  tenantId: 'tenant-001',
  tenantName: 'Demo Kommune',
  role: 'TENANT_ADMIN',
  grantedRoles: ['TENANT_ADMIN'],
};

/**
 * Billing Admin user for testing billing-specific flows.
 * Has access to subscription, billing, and limited settings.
 *
 * Login provider: 'dev-billing'
 */
const MOCK_BILLING_ADMIN: TenantAdminUser = {
  id: 'mock-billing-001',
  name: 'Billing Admin',
  email: 'billing@tenant.no',
  tenantId: 'tenant-001',
  tenantName: 'Demo Kommune',
  role: 'TENANT_BILLING_ADMIN',
  grantedRoles: ['TENANT_BILLING_ADMIN'],
};

/**
 * Tech Admin user for testing technical administration flows.
 * Has access to branding, integrations, and technical settings.
 *
 * Login provider: 'dev-tech'
 */
const MOCK_TECH_ADMIN: TenantAdminUser = {
  id: 'mock-tech-001',
  name: 'Tech Admin',
  email: 'tech@tenant.no',
  tenantId: 'tenant-001',
  tenantName: 'Demo Kommune',
  role: 'TENANT_TECH_ADMIN',
  grantedRoles: ['TENANT_TECH_ADMIN'],
};

// Simulated login - will be replaced with real OAuth when API is ready
const USE_MOCK_AUTH = false; // SECURITY: Disabled for production

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<TenantAdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (USE_MOCK_AUTH) {
        // Check localStorage for mock session
        const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
        setIsLoading(false);
        return;
      }

      // Real auth flow - uncomment when API is ready
      // try {
      //   const response = await tenantService.getMe();
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

  const login = useCallback(
    (provider: 'idporten' | 'microsoft' | 'dev-admin' | 'dev-billing' | 'dev-tech' = 'idporten') => {
      if (USE_MOCK_AUTH) {
        // Simulate login with a mock user based on provider:
        // - idporten: Tenant Admin (default for production)
        // - microsoft: Tenant Admin (enterprise SSO)
        // - dev-admin: Tenant Admin (explicit for testing)
        // - dev-billing: Billing Admin (tests billing workflows)
        // - dev-tech: Tech Admin (tests technical workflows)
        let mockUser: TenantAdminUser;
        switch (provider) {
          case 'dev-billing':
            mockUser = MOCK_BILLING_ADMIN;
            break;
          case 'dev-tech':
            mockUser = MOCK_TECH_ADMIN;
            break;
          case 'idporten':
          case 'microsoft':
          case 'dev-admin':
          default:
            mockUser = MOCK_TENANT_ADMIN;
            break;
        }
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
        setUser(mockUser);

        // Navigate to dashboard after login
        navigate('/');
        return;
      }

      // Real OAuth flow - uncomment when API is ready
      // const apiUrl = getApiUrl();
      // window.location.href = `${apiUrl}/api/auth/oauth/${provider}`;
    },
    [navigate]
  );

  const logout = useCallback(async () => {
    if (USE_MOCK_AUTH) {
      // Clear user session
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      navigate('/login');
      return;
    }

    // Real logout - uncomment when API is ready
    // try {
    //   await tenantService.logout();
    // } finally {
    //   setUser(null);
    //   navigate('/login');
    // }
  }, [navigate]);

  const checkRole = useCallback(
    (role: TenantAdminRole): boolean => {
      if (!user) return false;

      // Tenant admin has access to everything within the tenant
      if (user.role === 'TENANT_ADMIN') return true;

      // Check direct role match
      return user.role === role;
    },
    [user]
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isTenantAdmin: user?.role === 'TENANT_ADMIN',
      isBillingAdmin: user?.role === 'TENANT_ADMIN' || user?.role === 'TENANT_BILLING_ADMIN',
      isTechAdmin: user?.role === 'TENANT_ADMIN' || user?.role === 'TENANT_TECH_ADMIN',
      login,
      logout,
      checkRole,
    }),
    [user, isLoading, login, logout, checkRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
