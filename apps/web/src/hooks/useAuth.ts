/**
 * useAuth Hook
 * Provides authentication functionality with simulated login for development
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('web_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((provider: 'idporten' | 'microsoft' | 'vipps', returnTo?: string) => {
    if (USE_MOCK_AUTH) {
      // Simulate login with mock user
      const mockUser = MOCK_USERS[provider];
      if (mockUser) {
        localStorage.setItem('web_user', JSON.stringify(mockUser));
        setUser(mockUser);
        // Only navigate if returnTo is explicitly provided, otherwise stay on current page
        // This allows the booking widget to keep the user on the same page after login
        if (returnTo) {
          navigate(returnTo);
        }
        // No navigation by default - stay on current page
      }
      return;
    }

    // Real OAuth flow - redirect to API
    const baseUrl = import.meta.env.VITE_API_URL || 'https://api.digilist.no';
    // Use current path as return URL so user comes back to the same page
    const currentPath = returnTo || window.location.pathname + window.location.search;
    const returnUrl = encodeURIComponent(window.location.origin + currentPath);
    window.location.href = `${baseUrl}/auth/${provider}?returnUrl=${returnUrl}`;
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('web_user');
    setUser(null);

    if (!USE_MOCK_AUTH) {
      // Real logout - redirect to API
      const baseUrl = import.meta.env.VITE_API_URL || 'https://api.digilist.no';
      window.location.href = `${baseUrl}/auth/logout?returnUrl=${encodeURIComponent(window.location.origin)}`;
    }
  }, []);

  return {
    isAuthenticated: !!user,
    isLoading,
    user,
    login,
    logout,
  };
}
