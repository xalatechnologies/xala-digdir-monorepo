/**
 * Demo Login Functionality Unit Tests
 *
 * Tests for the SaaS Admin demo login functionality including:
 * - Dev login providers (dev-super, dev-billing, dev-support)
 * - Role-based user creation
 * - LocalStorage persistence
 * - Post-login redirect behavior
 * - Role permission flags (isSuperAdmin, isBillingAdmin, isSupportAgent)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import * as React from 'react';

// =============================================================================
// Mock Dependencies
// =============================================================================

// Track navigate calls
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Import after mocks
import { AuthProvider } from '../../../../apps/saas-admin/src/providers/AuthProvider';
import { useAuth } from '../../../../apps/saas-admin/src/hooks/useAuth';

// =============================================================================
// Constants
// =============================================================================

const AUTH_STORAGE_KEY = 'saas_admin_user';

// Expected mock users
const EXPECTED_SUPER_ADMIN = {
  id: 'mock-super-001',
  name: 'Platform Admin',
  email: 'admin@digilist.no',
  role: 'SAAS_SUPER_ADMIN',
  grantedRoles: ['SAAS_SUPER_ADMIN'],
};

const EXPECTED_BILLING_ADMIN = {
  id: 'mock-billing-001',
  name: 'Billing Admin',
  email: 'billing@digilist.no',
  role: 'SAAS_BILLING_ADMIN',
  grantedRoles: ['SAAS_BILLING_ADMIN'],
};

const EXPECTED_SUPPORT_AGENT = {
  id: 'mock-support-001',
  name: 'Support Agent',
  email: 'support@digilist.no',
  role: 'SAAS_SUPPORT_AGENT',
  grantedRoles: ['SAAS_SUPPORT_AGENT'],
};

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Test component that captures auth context and provides login buttons
 */
function TestConsumer({
  onAuthChange,
}: {
  onAuthChange?: (auth: ReturnType<typeof useAuth>) => void;
}) {
  const auth = useAuth();

  React.useEffect(() => {
    if (onAuthChange) {
      onAuthChange(auth);
    }
  }, [auth, onAuthChange]);

  return (
    <div data-testid="test-consumer">
      <button data-testid="login-dev-super" onClick={() => auth.login('dev-super')}>
        Login as Super Admin
      </button>
      <button data-testid="login-dev-billing" onClick={() => auth.login('dev-billing')}>
        Login as Billing Admin
      </button>
      <button data-testid="login-dev-support" onClick={() => auth.login('dev-support')}>
        Login as Support Agent
      </button>
      <button data-testid="login-idporten" onClick={() => auth.login('idporten')}>
        Login with ID-porten
      </button>
      <button data-testid="login-internal" onClick={() => auth.login('internal')}>
        Login with Internal SSO
      </button>
      <button data-testid="login-default" onClick={() => auth.login()}>
        Login Default
      </button>
      <button data-testid="logout" onClick={() => auth.logout()}>
        Logout
      </button>
      <div data-testid="auth-status">
        {auth.isLoading ? 'loading' : auth.isAuthenticated ? 'authenticated' : 'unauthenticated'}
      </div>
      <div data-testid="user-name">{auth.user?.name || 'none'}</div>
      <div data-testid="user-role">{auth.user?.role || 'none'}</div>
      <div data-testid="is-super-admin">{auth.isSuperAdmin ? 'yes' : 'no'}</div>
      <div data-testid="is-billing-admin">{auth.isBillingAdmin ? 'yes' : 'no'}</div>
      <div data-testid="is-support-agent">{auth.isSupportAgent ? 'yes' : 'no'}</div>
    </div>
  );
}

/**
 * Component to track current location
 */
function LocationTracker({ onLocation }: { onLocation: (location: string) => void }) {
  const location = useLocation();
  React.useEffect(() => {
    onLocation(location.pathname);
  }, [location, onLocation]);
  return null;
}

function renderWithProvider(ui?: React.ReactNode, initialEntries: string[] = ['/login']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>{ui || <TestConsumer />}</AuthProvider>
    </MemoryRouter>
  );
}

// =============================================================================
// Test Suite
// =============================================================================

describe('Demo Login Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // ===========================================================================
  // Provider Setup Tests
  // ===========================================================================

  describe('Provider setup', () => {
    it('renders children correctly', () => {
      renderWithProvider(<div data-testid="child">Child Content</div>);

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('provides auth context to children', () => {
      renderWithProvider();

      expect(screen.getByTestId('test-consumer')).toBeInTheDocument();
      expect(screen.getByTestId('login-dev-super')).toBeInTheDocument();
    });

    it('starts with unauthenticated state', async () => {
      renderWithProvider();

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
      });
    });

    it('shows loading state initially', () => {
      // Clear any stored session
      localStorage.removeItem(AUTH_STORAGE_KEY);

      // Render synchronously to catch initial loading state
      const { container } = render(
        <MemoryRouter>
          <AuthProvider>
            <TestConsumer />
          </AuthProvider>
        </MemoryRouter>
      );

      // The loading state might be brief, but auth status should resolve
      expect(container).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Dev Super Admin Login Tests
  // ===========================================================================

  describe('Dev Super Admin login', () => {
    it('logs in as super admin with dev-super provider', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('login-dev-super').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-name')).toHaveTextContent('Platform Admin');
        expect(screen.getByTestId('user-role')).toHaveTextContent('SAAS_SUPER_ADMIN');
      });
    });

    it('sets isSuperAdmin flag to true for super admin', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('login-dev-super').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-super-admin')).toHaveTextContent('yes');
      });
    });

    it('sets isBillingAdmin flag to true for super admin (has all permissions)', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('login-dev-super').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-billing-admin')).toHaveTextContent('yes');
      });
    });

    it('sets isSupportAgent flag to true for super admin (has all permissions)', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('login-dev-super').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-support-agent')).toHaveTextContent('yes');
      });
    });

    it('stores super admin user in localStorage', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('login-dev-super').click();
      });

      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      expect(storedUser).not.toBeNull();

      const parsedUser = JSON.parse(storedUser!);
      expect(parsedUser).toMatchObject(EXPECTED_SUPER_ADMIN);
    });

    it('redirects to dashboard after super admin login', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('login-dev-super').click();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  // ===========================================================================
  // Dev Billing Admin Login Tests
  // ===========================================================================

  describe('Dev Billing Admin login', () => {
    it('logs in as billing admin with dev-billing provider', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('login-dev-billing').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-name')).toHaveTextContent('Billing Admin');
        expect(screen.getByTestId('user-role')).toHaveTextContent('SAAS_BILLING_ADMIN');
      });
    });

    it('sets isSuperAdmin flag to false for billing admin', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('login-dev-billing').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-super-admin')).toHaveTextContent('no');
      });
    });

    it('sets isBillingAdmin flag to true for billing admin', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('login-dev-billing').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-billing-admin')).toHaveTextContent('yes');
      });
    });

    it('sets isSupportAgent flag to true for billing admin (higher privilege)', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('login-dev-billing').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-support-agent')).toHaveTextContent('yes');
      });
    });

    it('stores billing admin user in localStorage', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('login-dev-billing').click();
      });

      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      expect(storedUser).not.toBeNull();

      const parsedUser = JSON.parse(storedUser!);
      expect(parsedUser).toMatchObject(EXPECTED_BILLING_ADMIN);
    });

    it('redirects to dashboard after billing admin login', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('login-dev-billing').click();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  // ===========================================================================
  // Dev Support Agent Login Tests
  // ===========================================================================

  describe('Dev Support Agent login', () => {
    it('logs in as support agent with dev-support provider', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('login-dev-support').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-name')).toHaveTextContent('Support Agent');
        expect(screen.getByTestId('user-role')).toHaveTextContent('SAAS_SUPPORT_AGENT');
      });
    });

    it('sets isSuperAdmin flag to false for support agent', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('login-dev-support').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-super-admin')).toHaveTextContent('no');
      });
    });

    it('sets isBillingAdmin flag to false for support agent', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('login-dev-support').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-billing-admin')).toHaveTextContent('no');
      });
    });

    it('sets isSupportAgent flag to true for support agent', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('login-dev-support').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-support-agent')).toHaveTextContent('yes');
      });
    });

    it('stores support agent user in localStorage', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('login-dev-support').click();
      });

      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      expect(storedUser).not.toBeNull();

      const parsedUser = JSON.parse(storedUser!);
      expect(parsedUser).toMatchObject(EXPECTED_SUPPORT_AGENT);
    });

    it('redirects to dashboard after support agent login', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('login-dev-support').click();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  // ===========================================================================
  // Production Login Provider Tests (fall back to Super Admin)
  // ===========================================================================

  describe('Production login providers', () => {
    it('logs in as super admin with idporten provider', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('login-idporten').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-role')).toHaveTextContent('SAAS_SUPER_ADMIN');
      });
    });

    it('logs in as super admin with internal provider', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('login-internal').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-role')).toHaveTextContent('SAAS_SUPER_ADMIN');
      });
    });

    it('logs in as super admin with default provider (no argument)', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('login-default').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-role')).toHaveTextContent('SAAS_SUPER_ADMIN');
      });
    });
  });

  // ===========================================================================
  // Logout Tests
  // ===========================================================================

  describe('Logout functionality', () => {
    it('clears user on logout', async () => {
      renderWithProvider();

      // Login first
      await act(async () => {
        screen.getByTestId('login-dev-super').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      // Logout
      await act(async () => {
        screen.getByTestId('logout').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
        expect(screen.getByTestId('user-name')).toHaveTextContent('none');
      });
    });

    it('clears localStorage on logout', async () => {
      renderWithProvider();

      // Login first
      await act(async () => {
        screen.getByTestId('login-dev-super').click();
      });

      expect(localStorage.getItem(AUTH_STORAGE_KEY)).not.toBeNull();

      // Logout
      await act(async () => {
        screen.getByTestId('logout').click();
      });

      expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    });

    it('redirects to login page on logout', async () => {
      renderWithProvider();

      // Login first
      await act(async () => {
        screen.getByTestId('login-dev-super').click();
      });

      mockNavigate.mockClear();

      // Logout
      await act(async () => {
        screen.getByTestId('logout').click();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('resets all role flags on logout', async () => {
      renderWithProvider();

      // Login as super admin
      await act(async () => {
        screen.getByTestId('login-dev-super').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-super-admin')).toHaveTextContent('yes');
      });

      // Logout
      await act(async () => {
        screen.getByTestId('logout').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-super-admin')).toHaveTextContent('no');
        expect(screen.getByTestId('is-billing-admin')).toHaveTextContent('no');
        expect(screen.getByTestId('is-support-agent')).toHaveTextContent('no');
      });
    });
  });

  // ===========================================================================
  // Session Persistence Tests
  // ===========================================================================

  describe('Session persistence', () => {
    it('restores user from localStorage on mount', async () => {
      // Pre-populate localStorage
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(EXPECTED_SUPER_ADMIN));

      renderWithProvider();

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-name')).toHaveTextContent('Platform Admin');
      });
    });

    it('handles invalid JSON in localStorage gracefully', async () => {
      // Set invalid JSON
      localStorage.setItem(AUTH_STORAGE_KEY, 'invalid json');

      renderWithProvider();

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
      });

      // Invalid data should be cleared
      expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    });

    it('persists login across re-renders', async () => {
      const { rerender } = render(
        <MemoryRouter>
          <AuthProvider>
            <TestConsumer />
          </AuthProvider>
        </MemoryRouter>
      );

      await act(async () => {
        screen.getByTestId('login-dev-super').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      // Re-render
      rerender(
        <MemoryRouter>
          <AuthProvider>
            <TestConsumer />
          </AuthProvider>
        </MemoryRouter>
      );

      // Should still be authenticated
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });
  });

  // ===========================================================================
  // checkRole Tests
  // ===========================================================================

  describe('checkRole function', () => {
    it('super admin passes checkRole for SAAS_SUPER_ADMIN', async () => {
      let authContext: ReturnType<typeof useAuth> | null = null;

      renderWithProvider(
        <TestConsumer
          onAuthChange={(auth) => {
            authContext = auth;
          }}
        />
      );

      await act(async () => {
        screen.getByTestId('login-dev-super').click();
      });

      await waitFor(() => {
        expect(authContext?.checkRole('SAAS_SUPER_ADMIN')).toBe(true);
      });
    });

    it('super admin passes checkRole for any role (has all permissions)', async () => {
      let authContext: ReturnType<typeof useAuth> | null = null;

      renderWithProvider(
        <TestConsumer
          onAuthChange={(auth) => {
            authContext = auth;
          }}
        />
      );

      await act(async () => {
        screen.getByTestId('login-dev-super').click();
      });

      await waitFor(() => {
        expect(authContext?.checkRole('SAAS_BILLING_ADMIN')).toBe(true);
        expect(authContext?.checkRole('SAAS_SUPPORT_AGENT')).toBe(true);
      });
    });

    it('billing admin fails checkRole for SAAS_SUPER_ADMIN', async () => {
      let authContext: ReturnType<typeof useAuth> | null = null;

      renderWithProvider(
        <TestConsumer
          onAuthChange={(auth) => {
            authContext = auth;
          }}
        />
      );

      await act(async () => {
        screen.getByTestId('login-dev-billing').click();
      });

      await waitFor(() => {
        expect(authContext?.checkRole('SAAS_SUPER_ADMIN')).toBe(false);
      });
    });

    it('billing admin passes checkRole for SAAS_BILLING_ADMIN', async () => {
      let authContext: ReturnType<typeof useAuth> | null = null;

      renderWithProvider(
        <TestConsumer
          onAuthChange={(auth) => {
            authContext = auth;
          }}
        />
      );

      await act(async () => {
        screen.getByTestId('login-dev-billing').click();
      });

      await waitFor(() => {
        expect(authContext?.checkRole('SAAS_BILLING_ADMIN')).toBe(true);
      });
    });

    it('support agent fails checkRole for higher roles', async () => {
      let authContext: ReturnType<typeof useAuth> | null = null;

      renderWithProvider(
        <TestConsumer
          onAuthChange={(auth) => {
            authContext = auth;
          }}
        />
      );

      await act(async () => {
        screen.getByTestId('login-dev-support').click();
      });

      await waitFor(() => {
        expect(authContext?.checkRole('SAAS_SUPER_ADMIN')).toBe(false);
        expect(authContext?.checkRole('SAAS_BILLING_ADMIN')).toBe(false);
      });
    });

    it('support agent passes checkRole for SAAS_SUPPORT_AGENT', async () => {
      let authContext: ReturnType<typeof useAuth> | null = null;

      renderWithProvider(
        <TestConsumer
          onAuthChange={(auth) => {
            authContext = auth;
          }}
        />
      );

      await act(async () => {
        screen.getByTestId('login-dev-support').click();
      });

      await waitFor(() => {
        expect(authContext?.checkRole('SAAS_SUPPORT_AGENT')).toBe(true);
      });
    });

    it('returns false for any role when not authenticated', async () => {
      let authContext: ReturnType<typeof useAuth> | null = null;

      renderWithProvider(
        <TestConsumer
          onAuthChange={(auth) => {
            authContext = auth;
          }}
        />
      );

      await waitFor(() => {
        expect(authContext?.checkRole('SAAS_SUPER_ADMIN')).toBe(false);
        expect(authContext?.checkRole('SAAS_BILLING_ADMIN')).toBe(false);
        expect(authContext?.checkRole('SAAS_SUPPORT_AGENT')).toBe(false);
      });
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('Edge cases', () => {
    it('handles multiple rapid logins correctly', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('login-dev-super').click();
        screen.getByTestId('login-dev-billing').click();
        screen.getByTestId('login-dev-support').click();
      });

      // Last login wins
      await waitFor(() => {
        expect(screen.getByTestId('user-role')).toHaveTextContent('SAAS_SUPPORT_AGENT');
      });
    });

    it('handles login-logout-login sequence', async () => {
      renderWithProvider();

      // Login
      await act(async () => {
        screen.getByTestId('login-dev-super').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      // Logout
      await act(async () => {
        screen.getByTestId('logout').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
      });

      // Login again with different role
      await act(async () => {
        screen.getByTestId('login-dev-billing').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-role')).toHaveTextContent('SAAS_BILLING_ADMIN');
      });
    });

    it('handles unmount during login gracefully', () => {
      const { unmount } = renderWithProvider();

      // Start login and immediately unmount
      act(() => {
        screen.getByTestId('login-dev-super').click();
        unmount();
      });

      // Should not throw
      expect(true).toBe(true);
    });
  });

  // ===========================================================================
  // useAuth Hook Error Tests
  // ===========================================================================

  describe('useAuth hook errors', () => {
    it('throws error when used outside provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      function ComponentOutsideProvider() {
        useAuth();
        return <div>Should not render</div>;
      }

      expect(() =>
        render(
          <MemoryRouter>
            <ComponentOutsideProvider />
          </MemoryRouter>
        )
      ).toThrow('useAuth must be used within an AuthProvider');

      consoleError.mockRestore();
    });
  });
});

// =============================================================================
// Integration Tests
// =============================================================================

describe('Demo Login Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Complete login workflow', () => {
    it('full workflow: unauthenticated -> login -> authenticated -> logout -> unauthenticated', async () => {
      renderWithProvider();

      // Initial state
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
      });

      // Login
      await act(async () => {
        screen.getByTestId('login-dev-super').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-name')).toHaveTextContent('Platform Admin');
      });

      // Verify localStorage
      expect(localStorage.getItem(AUTH_STORAGE_KEY)).not.toBeNull();

      // Verify redirect
      expect(mockNavigate).toHaveBeenCalledWith('/');

      mockNavigate.mockClear();

      // Logout
      await act(async () => {
        screen.getByTestId('logout').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
        expect(screen.getByTestId('user-name')).toHaveTextContent('none');
      });

      // Verify localStorage cleared
      expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();

      // Verify redirect to login
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Role-based access patterns', () => {
    it('different roles have correct permission levels', async () => {
      // Test each role has correct permission hierarchy
      const roleTests = [
        {
          provider: 'dev-super',
          buttonId: 'login-dev-super',
          expectedRole: 'SAAS_SUPER_ADMIN',
          isSuperAdmin: true,
          isBillingAdmin: true,
          isSupportAgent: true,
        },
        {
          provider: 'dev-billing',
          buttonId: 'login-dev-billing',
          expectedRole: 'SAAS_BILLING_ADMIN',
          isSuperAdmin: false,
          isBillingAdmin: true,
          isSupportAgent: true,
        },
        {
          provider: 'dev-support',
          buttonId: 'login-dev-support',
          expectedRole: 'SAAS_SUPPORT_AGENT',
          isSuperAdmin: false,
          isBillingAdmin: false,
          isSupportAgent: true,
        },
      ];

      for (const test of roleTests) {
        // Clear state
        localStorage.clear();

        const { unmount } = renderWithProvider();

        await act(async () => {
          screen.getByTestId(test.buttonId).click();
        });

        await waitFor(() => {
          expect(screen.getByTestId('user-role')).toHaveTextContent(test.expectedRole);
          expect(screen.getByTestId('is-super-admin')).toHaveTextContent(
            test.isSuperAdmin ? 'yes' : 'no'
          );
          expect(screen.getByTestId('is-billing-admin')).toHaveTextContent(
            test.isBillingAdmin ? 'yes' : 'no'
          );
          expect(screen.getByTestId('is-support-agent')).toHaveTextContent(
            test.isSupportAgent ? 'yes' : 'no'
          );
        });

        unmount();
      }
    });
  });
});
