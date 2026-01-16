/**
 * SaaS Admin Auth Provider
 * Manages authentication state for platform administrators
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, type AuthContextType, type SaasAdminUser, type SaasAdminRole } from '../hooks/useAuth';

// =============================================================================
// Local Storage Keys
// =============================================================================

const AUTH_STORAGE_KEY = 'saas_admin_user';

// =============================================================================
// Mock Users for Development
// =============================================================================

/**
 * Super Admin user for testing full platform access.
 * Has access to all SaaS admin features including secret management.
 *
 * Login provider: 'idporten' or 'dev-super'
 */
const MOCK_SUPER_ADMIN: SaasAdminUser = {
  id: 'mock-super-001',
  name: 'Platform Admin',
  email: 'admin@digilist.no',
  role: 'SAAS_SUPER_ADMIN',
  grantedRoles: ['SAAS_SUPER_ADMIN'],
};

/**
 * Billing Admin user for testing billing-specific flows.
 * Has access to plans, billing, and limited tenant read access.
 *
 * Login provider: 'dev-billing'
 */
const MOCK_BILLING_ADMIN: SaasAdminUser = {
  id: 'mock-billing-001',
  name: 'Billing Admin',
  email: 'billing@digilist.no',
  role: 'SAAS_BILLING_ADMIN',
  grantedRoles: ['SAAS_BILLING_ADMIN'],
};

/**
 * Support Agent user for testing support workflows.
 * Has read access to help tenants and manage support tickets.
 *
 * Login provider: 'dev-support'
 */
const MOCK_SUPPORT_AGENT: SaasAdminUser = {
  id: 'mock-support-001',
  name: 'Support Agent',
  email: 'support@digilist.no',
  role: 'SAAS_SUPPORT_AGENT',
  grantedRoles: ['SAAS_SUPPORT_AGENT'],
};

// Simulated login - will be replaced with real OAuth when API is ready
const USE_MOCK_AUTH = true;

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SaasAdminUser | null>(null);
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
      //   const response = await saasService.getMe();
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
    (provider: 'idporten' | 'internal' | 'dev-super' | 'dev-billing' | 'dev-support' = 'idporten') => {
      if (USE_MOCK_AUTH) {
        // Simulate login with a mock user based on provider:
        // - idporten: Super Admin (default for production)
        // - internal: Super Admin (internal SSO)
        // - dev-super: Super Admin (explicit for testing)
        // - dev-billing: Billing Admin (tests billing workflows)
        // - dev-support: Support Agent (tests support workflows)
        let mockUser: SaasAdminUser;
        switch (provider) {
          case 'dev-billing':
            mockUser = MOCK_BILLING_ADMIN;
            break;
          case 'dev-support':
            mockUser = MOCK_SUPPORT_AGENT;
            break;
          case 'idporten':
          case 'internal':
          case 'dev-super':
          default:
            mockUser = MOCK_SUPER_ADMIN;
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
    //   await saasService.logout();
    // } finally {
    //   setUser(null);
    //   navigate('/login');
    // }
  }, [navigate]);

  const checkRole = useCallback(
    (role: SaasAdminRole): boolean => {
      if (!user) return false;

      // Super admin has access to everything
      if (user.role === 'SAAS_SUPER_ADMIN') return true;

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
      isSuperAdmin: user?.role === 'SAAS_SUPER_ADMIN',
      isBillingAdmin: user?.role === 'SAAS_SUPER_ADMIN' || user?.role === 'SAAS_BILLING_ADMIN',
      isSupportAgent:
        user?.role === 'SAAS_SUPER_ADMIN' ||
        user?.role === 'SAAS_BILLING_ADMIN' ||
        user?.role === 'SAAS_SUPPORT_AGENT',
      login,
      logout,
      checkRole,
    }),
    [user, isLoading, login, logout, checkRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
