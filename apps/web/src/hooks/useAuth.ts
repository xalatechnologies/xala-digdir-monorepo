/**
 * useAuth Hook
 * Wraps SDK auth functionality for convenient use in the webapp
 */

import { useSession } from '@digilist/client-sdk';

export function useAuth() {
  const { data: session, isLoading, error } = useSession();

  const isAuthenticated = !!session?.data?.user;

  const login = (provider: 'idporten' | 'microsoft') => {
    // OAuth providers use redirect flow
    const baseUrl = import.meta.env.VITE_API_URL || 'https://api.digilist.no';
    const returnUrl = encodeURIComponent(window.location.origin + '/auth/callback');
    window.location.href = `${baseUrl}/auth/${provider}?returnUrl=${returnUrl}`;
  };

  const logout = () => {
    // Clear local state and redirect to logout endpoint
    const baseUrl = import.meta.env.VITE_API_URL || 'https://api.digilist.no';
    window.location.href = `${baseUrl}/auth/logout?returnUrl=${encodeURIComponent(window.location.origin)}`;
  };

  return {
    isAuthenticated,
    isLoading,
    error,
    user: session?.data?.user,
    login,
    logout,
  };
}
