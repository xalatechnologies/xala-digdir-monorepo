/**
 * useAuth Hook
 * Provides authentication functionality with simulated login for development
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@digilist/client-sdk/services/auth.service';
import type { AuthUser } from '@digilist/client-sdk/types/auth';

// Toggle between mock and real auth
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH !== 'false';

interface User {
  id: string;
  name: string;
  email: string;
}

// Mock users for development
const MOCK_USERS: Record<string, User> = {
  vipps: {
    id: 'vipps-user-001',
    name: 'Ola Nordmann',
    email: 'ola.nordmann@gmail.com',
  },
  idporten: {
    id: 'idporten-user-001',
    name: 'Kari Nordmann',
    email: 'kari.nordmann@gmail.com',
  },
  microsoft: {
    id: 'microsoft-user-001',
    name: 'Per Hansen',
    email: 'per.hansen@kommune.no',
  },
};

/**
 * Map SDK AuthUser to web app User
 */
function mapAuthUserToUser(authUser: AuthUser): User {
  return {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Mock auth mode - in-memory state only
      if (USE_MOCK_AUTH) {
        setIsLoading(false);
        return;
      }

      // Real auth mode - validate session from httpOnly cookie
      try {
        const response = await authService.getSession();
        if (response.data?.user) {
          const webUser = mapAuthUserToUser(response.data.user);
          setUser(webUser);
        }
      } catch (error) {
        // No valid session - user stays null
        setUser(null);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback((provider: 'idporten' | 'microsoft' | 'vipps') => {
    if (USE_MOCK_AUTH) {
      // Simulate login with mock user (in-memory only)
      const mockUser = MOCK_USERS[provider];
      if (mockUser) {
        setUser(mockUser);
        navigate('/');
      }
      return;
    }

    // Real OAuth flow - redirect to API
    const baseUrl = import.meta.env.VITE_API_URL || 'https://api.digilist.no';
    const returnUrl = encodeURIComponent(window.location.origin + '/auth/callback');
    window.location.href = `${baseUrl}/auth/${provider}?returnUrl=${returnUrl}`;
  }, [navigate]);

  const logout = useCallback(async () => {
    // Real auth mode - call API to clear httpOnly cookie
    if (!USE_MOCK_AUTH) {
      try {
        await authService.logout();
      } catch (error) {
        // Continue logout even if API call fails
      }
    }

    setUser(null);
  }, []);

  return {
    isAuthenticated: !!user,
    isLoading,
    user,
    login,
    logout,
  };
}
