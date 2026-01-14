import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, type AuthContextType, type BackofficeUser, type BackofficeRole } from '../hooks/useAuth';
import { authService } from '@digilist/client-sdk/services';
import type { AuthSession } from '@digilist/client-sdk/types';

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
      // Check URL for OAuth callback with authorization code
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        try {
          // OAuth callback - exchange authorization code for session
          // The backend will set HTTP-only cookie automatically
          const response = await authService.handleOAuthCallback(code);
          const session: AuthSession = response.data;

          const userData: BackofficeUser = {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: session.user.role as BackofficeRole,
          };

          // Store user data (but NOT token - managed by HTTP-only cookie)
          localStorage.setItem('minside_user', JSON.stringify(userData));
          setUser(userData);

          // Clean URL to remove authorization code
          window.history.replaceState({}, document.title, window.location.pathname);
          setIsLoading(false);
          return;
        } catch (error) {
          // Handle OAuth callback error
          window.history.replaceState({}, document.title, window.location.pathname);
          setIsLoading(false);
          return;
        }
      }

      // Check for existing session via HTTP-only cookie
      try {
        const response = await authService.getSession();
        const session: AuthSession = response.data;

        const userData: BackofficeUser = {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role as BackofficeRole,
        };

        localStorage.setItem('minside_user', JSON.stringify(userData));
        setUser(userData);
      } catch (error) {
        // No valid session - check for saved user data or mock auth
        const savedUser = localStorage.getItem('minside_user');

        if (savedUser) {
          // User data exists but session expired - clear it
          localStorage.removeItem('minside_user');
        } else if (USE_MOCK_AUTH) {
          // Mock auth - check for mock session
          const mockUser = localStorage.getItem('backoffice_mock_user');
          if (mockUser) {
            setUser(JSON.parse(mockUser));
          }
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (provider: 'idporten' | 'microsoft' | 'vipps' = 'idporten') => {
    if (USE_MOCK_AUTH) {
      // Simulate login - use Ola Hansen (the seeded user)
      const mockUser = provider === 'microsoft' ? MOCK_ADMIN_USER : MOCK_USER;
      localStorage.setItem('backoffice_mock_user', JSON.stringify(mockUser));
      localStorage.setItem('minside_user', JSON.stringify(mockUser));
      setUser(mockUser);
      navigate('/');
      return;
    }

    // Real OAuth flow - use SDK to initiate OAuth
    try {
      const callbackUrl = window.location.origin + '/';
      const response = await authService.initiateOAuth(provider, callbackUrl);
      // Redirect to OAuth provider's authorization page
      window.location.href = response.data.redirectUrl;
    } catch (error) {
      // Handle OAuth initiation error
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      // Call SDK logout to clear HTTP-only session cookie
      await authService.logout();
    } catch (error) {
      // Handle logout error - still clear local state
    }

    // Clear local storage (but not tokens - managed by HTTP-only cookie)
    localStorage.removeItem('backoffice_mock_user');
    localStorage.removeItem('minside_user');
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
