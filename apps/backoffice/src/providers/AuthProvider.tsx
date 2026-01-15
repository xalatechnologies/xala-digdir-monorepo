import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, type AuthContextType, type BackofficeUser, type BackofficeRole } from '../hooks/useAuth';

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

// Simulated login - will be replaced with real OAuth when API is ready
const USE_MOCK_AUTH = true;

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<BackofficeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
    if (USE_MOCK_AUTH) {
      // Clear user session
      localStorage.removeItem('backoffice_mock_user');

      // Clear role selection state to ensure fresh role selection on next login
      // This prevents stale role data from persisting across different user logins
      localStorage.removeItem(ROLE_STORAGE_KEYS.EFFECTIVE_ROLE);
      localStorage.removeItem(ROLE_STORAGE_KEYS.REMEMBER_CHOICE);

      setUser(null);
      navigate('/login');
      return;
    }

    // Real logout - uncomment when API is ready
    // try {
    //   await apiLogout();
    //   // Also clear role storage on real logout
    //   localStorage.removeItem(ROLE_STORAGE_KEYS.EFFECTIVE_ROLE);
    //   localStorage.removeItem(ROLE_STORAGE_KEYS.REMEMBER_CHOICE);
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
    }),
    [user, isLoading, login, logout, checkRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
