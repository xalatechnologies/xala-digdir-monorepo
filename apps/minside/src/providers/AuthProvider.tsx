import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, type AuthContextType, type BackofficeUser, type BackofficeRole } from '../hooks/useAuth';
import { getClientConfig, updateClientConfig } from '@digilist/client-sdk';
import { authService } from '@digilist/client-sdk/services/auth.service';
import type { AuthUser } from '@digilist/client-sdk/types/auth';

// Users matching seeded database
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

// Toggle between mock and real auth
// Set to false to use real OAuth with production API
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH !== 'false';

/**
 * Map SDK AuthUser to minside BackofficeUser
 */
function mapAuthUserToBackofficeUser(authUser: AuthUser): BackofficeUser {
  return {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
    role: authUser.role === 'admin' ? 'admin' : 'saksbehandler',
  };
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<BackofficeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Get API URL from client config
  const getApiUrl = () => {
    const config = getClientConfig();
    return config?.baseUrl || 'https://api.digilist.no';
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Handle OAuth callback with token in URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (token) {
        // OAuth callback - token will be set as httpOnly cookie by backend
        // Clean URL and validate session
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Mock auth mode - use localStorage for development
      if (USE_MOCK_AUTH) {
        const mockUserType = localStorage.getItem('backoffice_mock_user_type');
        if (mockUserType) {
          // Map stored user type to predefined typed object (no JSON.parse to prevent prototype pollution)
          const mockUser = mockUserType === 'admin' ? MOCK_ADMIN_USER : MOCK_USER;
          setUser(mockUser);
        }
        setIsLoading(false);
        return;
      }

      // Real auth mode - validate session from httpOnly cookie
      try {
        const response = await authService.getSession();
        if (response.data?.user) {
          const backofficeUser = mapAuthUserToBackofficeUser(response.data.user);
          setUser(backofficeUser);
        }
      } catch (error) {
        // No valid session - user stays null
        setUser(null);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback((provider: 'idporten' | 'microsoft' | 'vipps' = 'idporten') => {
    if (USE_MOCK_AUTH) {
      // Simulate login - use Ola Hansen (the seeded user)
      const mockUser = provider === 'microsoft' ? MOCK_ADMIN_USER : MOCK_USER;
      const mockUserType = provider === 'microsoft' ? 'admin' : 'user';
      // Store only user type identifier to avoid JSON.parse prototype pollution
      localStorage.setItem('backoffice_mock_user_type', mockUserType);
      localStorage.setItem('minside_user_type', mockUserType);
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
    // Mock auth mode - clear localStorage
    if (USE_MOCK_AUTH) {
      localStorage.removeItem('backoffice_mock_user_type');
      localStorage.removeItem('minside_user_type');
    } else {
      // Real auth mode - call API to clear httpOnly cookie
      try {
        await authService.logout();
      } catch (error) {
        // Continue logout even if API call fails
      }
    }

    updateClientConfig({ token: undefined });
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
