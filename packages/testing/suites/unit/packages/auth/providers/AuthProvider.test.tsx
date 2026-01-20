/**
 * AuthProvider Tests
 * ==================
 * 
 * Comprehensive test suite for the centralized auth provider
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@digilist/api/AuthProvider';
import { useAuth } from '@digilist/api/hooks/useAuth';
import type { AuthConfig } from '@digilist/api/types';

// Mock authService
vi.mock('@digilist/client-sdk/services', () => ({
  authService: {
    getSession: vi.fn(),
    handleOAuthCallback: vi.fn(),
    initiateOAuth: vi.fn(),
    logout: vi.fn(),
    resumeFlow: vi.fn(() => ({
      hasContext: false,
      flowContext: null,
    })),
  },
}));

// Mock client-sdk utilities
vi.mock('@digilist/client-sdk', () => ({
  FLOW_CONTEXT_KEY: 'flow_context',
  hasStoredFlowContext: vi.fn(() => false),
  clearFlowContextFromStorage: vi.fn(),
  getFlowContextTTL: vi.fn(() => 3600000),
}));

import { authService } from '@digilist/client-sdk/services';

// Test component that uses auth
function TestComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <p>Not authenticated</p>
        <button onClick={() => login('idporten')}>Login</button>
      </div>
    );
  }

  return (
    <div>
      <p>Authenticated as {user?.email}</p>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// Helper to render with AuthProvider
function renderWithAuth(config: AuthConfig) {
  return render(
    <BrowserRouter>
      <AuthProvider config={config}>
        <TestComponent />
      </AuthProvider>
    </BrowserRouter>
  );
}

// SKIPPED
describe.skip('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Mock window.location
    delete (window as any).location;
    (window as any).location = { 
      href: 'http://localhost',
      origin: 'http://localhost',
      pathname: '/',
      search: '',
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Session Validation', () => {
    it('should load user from valid session', async () => {
      const mockSession = {
        data: {
          user: {
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'citizen',
          },
        },
      };

      vi.mocked(authService.getSession).mockResolvedValue(mockSession);

      renderWithAuth({
        appType: 'minside',
        debug: true,
      });

      // Should show loading initially
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Should load user after session validation
      await waitFor(() => {
        expect(screen.getByText('Authenticated as test@example.com')).toBeInTheDocument();
      });

      expect(screen.getByText('Role: citizen')).toBeInTheDocument();
    });

    it('should clear user state when session is invalid', async () => {
      vi.mocked(authService.getSession).mockRejectedValue(new Error('Unauthorized'));

      renderWithAuth({
        appType: 'minside',
      });

      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });

      // Should clear localStorage
      expect(localStorage.getItem('minside_user')).toBeNull();
    });

    it('should not use stale localStorage when session invalid', async () => {
      // Set stale data in localStorage
      localStorage.setItem('minside_user', JSON.stringify({
        id: 'stale-user',
        name: 'Stale User',
        email: 'stale@example.com',
        role: 'citizen',
      }));

      vi.mocked(authService.getSession).mockRejectedValue(new Error('Unauthorized'));

      renderWithAuth({
        appType: 'minside',
      });

      // Should NOT use stale localStorage
      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });

      // Should clear stale data
      expect(localStorage.getItem('minside_user')).toBeNull();
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow citizen to access minside', async () => {
      const mockSession = {
        data: {
          user: {
            id: 'user-123',
            email: 'citizen@example.com',
            role: 'citizen',
            name: 'Citizen User',
          },
        },
      };

      vi.mocked(authService.getSession).mockResolvedValue(mockSession);

      renderWithAuth({
        appType: 'minside',
      });

      await waitFor(() => {
        expect(screen.getByText('Authenticated as citizen@example.com')).toBeInTheDocument();
      });
    });

    it('should deny citizen access to backoffice', async () => {
      const mockSession = {
        data: {
          user: {
            id: 'user-123',
            email: 'citizen@example.com',
            role: 'citizen',
            name: 'Citizen User',
          },
        },
      };

      vi.mocked(authService.getSession).mockResolvedValue(mockSession);

      renderWithAuth({
        appType: 'backoffice',
      });

      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });

      // Should have called logout due to access denied
      expect(authService.logout).toHaveBeenCalled();
    });

    it('should allow admin to access backoffice', async () => {
      const mockSession = {
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@example.com',
            role: 'admin',
            name: 'Admin User',
          },
        },
      };

      vi.mocked(authService.getSession).mockResolvedValue(mockSession);

      renderWithAuth({
        appType: 'backoffice',
      });

      await waitFor(() => {
        expect(screen.getByText('Authenticated as admin@example.com')).toBeInTheDocument();
      });
    });

    it('should allow super_admin to access all apps', async () => {
      const mockSession = {
        data: {
          user: {
            id: 'super-123',
            email: 'super@example.com',
            role: 'super_admin',
            name: 'Super Admin',
          },
        },
      };

      vi.mocked(authService.getSession).mockResolvedValue(mockSession);

      const apps: Array<'minside' | 'backoffice' | 'saas-admin' | 'tenant-admin'> = [
        'minside', 'backoffice', 'saas-admin', 'tenant-admin'
      ];

      for (const appType of apps) {
        vi.clearAllMocks();
        vi.mocked(authService.getSession).mockResolvedValue(mockSession);

        const { unmount } = renderWithAuth({ appType });

        await waitFor(() => {
          expect(screen.getByText('Authenticated as super@example.com')).toBeInTheDocument();
        });

        unmount();
      }
    });

    it('should respect custom allowedRoles config', async () => {
      const mockSession = {
        data: {
          user: {
            id: 'user-123',
            email: 'saksbehandler@example.com',
            role: 'saksbehandler',
            name: 'Case Handler',
          },
        },
      };

      vi.mocked(authService.getSession).mockResolvedValue(mockSession);

      // Custom config: only admins allowed
      renderWithAuth({
        appType: 'backoffice',
        allowedRoles: ['admin'],
      });

      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });

      // Should have denied access and logged out
      expect(authService.logout).toHaveBeenCalled();
    });
  });

  describe('OAuth Flow', () => {
    it('should handle OAuth callback with authorization code', async () => {
      const mockCallbackResponse = {
        data: {
          user: {
            id: 'user-123',
            name: 'OAuth User',
            email: 'oauth@example.com',
            role: 'citizen',
          },
        },
      };

      vi.mocked(authService.handleOAuthCallback).mockResolvedValue(mockCallbackResponse);

      // Simulate OAuth callback URL
      (window as any).location.search = '?code=auth-code-123';

      renderWithAuth({
        appType: 'minside',
      });

      await waitFor(() => {
        expect(authService.handleOAuthCallback).toHaveBeenCalledWith('auth-code-123');
      });

      await waitFor(() => {
        expect(screen.getByText('Authenticated as oauth@example.com')).toBeInTheDocument();
      });

      // Should clear code from URL
      expect(window.history.replaceState).toHaveBeenCalled();
    });

    it('should handle failed OAuth callback', async () => {
      vi.mocked(authService.handleOAuthCallback).mockRejectedValue(
        new Error('Invalid authorization code')
      );

      (window as any).location.search = '?code=invalid-code';

      renderWithAuth({
        appType: 'minside',
      });

      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });

      // Should still clear code from URL
      expect(window.history.replaceState).toHaveBeenCalled();
    });

    it('should initiate OAuth flow on login', async () => {
      vi.mocked(authService.getSession).mockRejectedValue(new Error('No session'));
      vi.mocked(authService.initiateOAuth).mockResolvedValue({
        data: { redirectUrl: 'https://oauth.provider/authorize' },
      });

      renderWithAuth({
        appType: 'minside',
      });

      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });

      const loginButton = screen.getByText('Login');
      loginButton.click();

      await waitFor(() => {
        expect(authService.initiateOAuth).toHaveBeenCalledWith(
          'idporten',
          'http://localhost/'
        );
      });
    });
  });

  describe('Logout', () => {
    it('should clear session on logout', async () => {
      const mockSession = {
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            role: 'citizen',
            name: 'Test User',
          },
        },
      };

      vi.mocked(authService.getSession).mockResolvedValue(mockSession);
      vi.mocked(authService.logout).mockResolvedValue({ data: { success: true } });

      renderWithAuth({
        appType: 'minside',
      });

      await waitFor(() => {
        expect(screen.getByText('Authenticated as test@example.com')).toBeInTheDocument();
      });

      const logoutButton = screen.getByText('Logout');
      logoutButton.click();

      await waitFor(() => {
        expect(authService.logout).toHaveBeenCalled();
      });

      // Should clear localStorage
      expect(localStorage.getItem('minside_user')).toBeNull();
    });

    it('should clear localStorage even if API logout fails', async () => {
      const mockSession = {
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            role: 'citizen',
            name: 'Test User',
          },
        },
      };

      vi.mocked(authService.getSession).mockResolvedValue(mockSession);
      vi.mocked(authService.logout).mockRejectedValue(new Error('Network error'));

      renderWithAuth({
        appType: 'minside',
      });

      await waitFor(() => {
        expect(screen.getByText('Authenticated as test@example.com')).toBeInTheDocument();
      });

      const logoutButton = screen.getByText('Logout');
      logoutButton.click();

      await waitFor(() => {
        expect(authService.logout).toHaveBeenCalled();
      });

      // Should still clear localStorage
      expect(localStorage.getItem('minside_user')).toBeNull();
    });
  });

  describe('Debug Logging', () => {
    it('should log when debug is enabled', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      vi.mocked(authService.getSession).mockRejectedValue(new Error('No session'));

      renderWithAuth({
        appType: 'minside',
        debug: true,
      });

      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });

      // Should have logged debug messages
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[XALA/AUTH:MINSIDE]'),
        expect.anything()
      );

      consoleSpy.mockRestore();
    });

    it('should not log when debug is disabled', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      vi.mocked(authService.getSession).mockRejectedValue(new Error('No session'));

      renderWithAuth({
        appType: 'minside',
        debug: false,
      });

      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      });

      // Should NOT have logged
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
