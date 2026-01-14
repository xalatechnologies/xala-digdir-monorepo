/**
 * useAuth Hook
 * Provides authentication functionality with OAuth login
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('web_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('web_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((provider: 'idporten' | 'microsoft' | 'vipps', returnTo?: string) => {
    // OAuth flow - redirect to API
    const baseUrl = import.meta.env.VITE_API_URL || 'https://api.digilist.no';
    // Use current path as return URL so user comes back to the same page
    const currentPath = returnTo || window.location.pathname + window.location.search;
    const returnUrl = encodeURIComponent(window.location.origin + currentPath);
    window.location.href = `${baseUrl}/auth/${provider}?returnUrl=${returnUrl}`;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('web_user');
    setUser(null);

    // Redirect to API logout
    const baseUrl = import.meta.env.VITE_API_URL || 'https://api.digilist.no';
    window.location.href = `${baseUrl}/auth/logout?returnUrl=${encodeURIComponent(window.location.origin)}`;
  }, []);

  // Handle OAuth callback - store user from API response
  const handleAuthCallback = useCallback((userData: User) => {
    localStorage.setItem('web_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  return {
    isAuthenticated: !!user,
    isLoading,
    user,
    login,
    logout,
    handleAuthCallback,
  };
}
