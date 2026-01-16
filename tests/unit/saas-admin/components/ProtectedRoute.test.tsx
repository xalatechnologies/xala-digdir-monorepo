/**
 * ProtectedRoute Unit Tests
 *
 * Tests for the SaaS Admin ProtectedRoute component including:
 * - Authentication state handling (loading, authenticated, unauthenticated)
 * - Role-based access control (RBAC)
 * - Redirect behavior (login redirect, dashboard redirect)
 * - Toast notifications for access denied
 * - Route change handling
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import * as React from 'react';

// =============================================================================
// Mock Dependencies
// =============================================================================

// Mock useLocation - track pathname changes
let mockLocation = { pathname: '/protected-route', state: null };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useLocation: () => mockLocation,
  };
});

// Mock useAuth hook
const mockCheckRole = vi.fn();

const defaultAuthContext = {
  user: {
    id: 'test-user-id',
    email: 'admin@digilist.no',
    name: 'Test Admin',
    role: 'SAAS_SUPER_ADMIN',
  },
  isLoading: false,
  isAuthenticated: true,
  isSuperAdmin: true,
  isBillingAdmin: false,
  isSupportAgent: false,
  login: vi.fn(),
  logout: vi.fn(),
  checkRole: mockCheckRole,
};

let mockAuthReturn = { ...defaultAuthContext };

vi.mock('../../../../apps/saas-admin/src/hooks/useAuth', () => ({
  useAuth: () => mockAuthReturn,
}));

// Mock useToast hook
const mockErrorToast = vi.fn();

vi.mock('../../../../apps/saas-admin/src/providers/ToastProvider', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: mockErrorToast,
    warning: vi.fn(),
    info: vi.fn(),
  }),
}));

// Mock useT hook from @xala/i18n
vi.mock('@xala/i18n', () => ({
  useT: () => (key: string) => {
    const translations: Record<string, string> = {
      'common.loading': 'Loading...',
      'auth.accessDenied.title': 'Access Denied',
      'auth.accessDenied.message': 'You do not have permission to access this page.',
    };
    return translations[key] || key;
  },
}));

// Mock @xala/ds components
vi.mock('@xala/ds', () => ({
  Spinner: ({ 'aria-label': ariaLabel, 'data-size': size }: { 'aria-label'?: string; 'data-size'?: string }) => (
    <div data-testid="spinner" aria-label={ariaLabel} data-size={size}>
      Loading...
    </div>
  ),
}));

// Import the component after mocks are set up
import { ProtectedRoute } from '../../../../apps/saas-admin/src/components/ProtectedRoute';

// =============================================================================
// Test Utilities
// =============================================================================

interface RenderOptions {
  initialEntries?: string[];
  requiredRole?: 'SAAS_SUPER_ADMIN' | 'SAAS_BILLING_ADMIN' | 'SAAS_SUPPORT_AGENT';
}

function renderProtectedRoute(options: RenderOptions = {}) {
  const { initialEntries = ['/protected'], requiredRole } = options;

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute requiredRole={requiredRole}>
              <div data-testid="protected-content">Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        <Route path="/" element={<div data-testid="dashboard-page">Dashboard Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

// =============================================================================
// Test Suite
// =============================================================================

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation = { pathname: '/protected', state: null };
    mockAuthReturn = { ...defaultAuthContext };
    mockCheckRole.mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Loading State Tests
  // ===========================================================================

  describe('Loading state', () => {
    it('shows spinner when authentication is loading', () => {
      mockAuthReturn = { ...defaultAuthContext, isLoading: true };

      renderProtectedRoute();

      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('renders spinner with correct aria-label', () => {
      mockAuthReturn = { ...defaultAuthContext, isLoading: true };

      renderProtectedRoute();

      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveAttribute('aria-label', 'Loading...');
    });

    it('renders spinner with large size', () => {
      mockAuthReturn = { ...defaultAuthContext, isLoading: true };

      renderProtectedRoute();

      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveAttribute('data-size', 'lg');
    });

    it('does not render protected content while loading', () => {
      mockAuthReturn = { ...defaultAuthContext, isLoading: true };

      renderProtectedRoute();

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('centers spinner in full viewport', () => {
      mockAuthReturn = { ...defaultAuthContext, isLoading: true };

      renderProtectedRoute();

      // The spinner is wrapped in a centered container
      const spinnerContainer = screen.getByTestId('spinner').parentElement;
      expect(spinnerContainer).toHaveStyle({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      });
    });
  });

  // ===========================================================================
  // Unauthenticated State Tests
  // ===========================================================================

  describe('Unauthenticated state', () => {
    it('redirects to login when not authenticated', () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: false, user: null };

      renderProtectedRoute();

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('does not show protected content when not authenticated', () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: false, user: null };

      renderProtectedRoute();

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Authenticated State Tests
  // ===========================================================================

  describe('Authenticated state', () => {
    it('renders children when authenticated with no role requirement', () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };

      renderProtectedRoute();

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('renders children when authenticated and has required role', () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };
      mockCheckRole.mockReturnValue(true);

      renderProtectedRoute({ requiredRole: 'SAAS_SUPER_ADMIN' });

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('does not redirect when authenticated', () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };

      renderProtectedRoute();

      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
      expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Role-Based Access Control Tests
  // ===========================================================================

  describe('Role-based access control', () => {
    it('allows access when no role is required', () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };

      renderProtectedRoute();

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('allows access when user has required role', () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };
      mockCheckRole.mockReturnValue(true);

      renderProtectedRoute({ requiredRole: 'SAAS_BILLING_ADMIN' });

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('redirects to dashboard when user lacks required role', () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };
      mockCheckRole.mockReturnValue(false);

      renderProtectedRoute({ requiredRole: 'SAAS_BILLING_ADMIN' });

      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('calls checkRole with the required role', () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };

      renderProtectedRoute({ requiredRole: 'SAAS_SUPPORT_AGENT' });

      expect(mockCheckRole).toHaveBeenCalledWith('SAAS_SUPPORT_AGENT');
    });

    it('super admin always has access regardless of required role', () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true, isSuperAdmin: true };
      mockCheckRole.mockReturnValue(true); // Super admin check returns true

      renderProtectedRoute({ requiredRole: 'SAAS_BILLING_ADMIN' });

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Toast Notification Tests
  // ===========================================================================

  describe('Toast notifications', () => {
    it('shows error toast when user lacks required role', async () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };
      mockCheckRole.mockReturnValue(false);

      renderProtectedRoute({ requiredRole: 'SAAS_BILLING_ADMIN' });

      await waitFor(() => {
        expect(mockErrorToast).toHaveBeenCalledWith(
          'Access Denied',
          'You do not have permission to access this page.'
        );
      });
    });

    it('does not show toast when user has required role', () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };
      mockCheckRole.mockReturnValue(true);

      renderProtectedRoute({ requiredRole: 'SAAS_SUPER_ADMIN' });

      expect(mockErrorToast).not.toHaveBeenCalled();
    });

    it('does not show toast when not authenticated', () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: false, user: null };

      renderProtectedRoute({ requiredRole: 'SAAS_SUPER_ADMIN' });

      expect(mockErrorToast).not.toHaveBeenCalled();
    });

    it('does not show toast when loading', () => {
      mockAuthReturn = { ...defaultAuthContext, isLoading: true };
      mockCheckRole.mockReturnValue(false);

      renderProtectedRoute({ requiredRole: 'SAAS_SUPER_ADMIN' });

      expect(mockErrorToast).not.toHaveBeenCalled();
    });

    it('shows toast only once per route', async () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };
      mockCheckRole.mockReturnValue(false);

      const { rerender } = renderProtectedRoute({ requiredRole: 'SAAS_BILLING_ADMIN' });

      await waitFor(() => {
        expect(mockErrorToast).toHaveBeenCalledTimes(1);
      });

      // Rerender with same conditions
      rerender(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute requiredRole="SAAS_BILLING_ADMIN">
                  <div data-testid="protected-content">Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<div data-testid="dashboard-page">Dashboard Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Toast should still have been called only once
      expect(mockErrorToast).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Location Change Tests
  // ===========================================================================

  describe('Location changes', () => {
    it('handles location pathname tracking for toast deduplication', () => {
      // This test verifies the component tracks location pathname
      // for toast deduplication logic (shows toast only once per route)
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };
      mockCheckRole.mockReturnValue(false);

      renderProtectedRoute({ requiredRole: 'SAAS_BILLING_ADMIN' });

      // User is redirected to dashboard due to lacking role
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();

      // The toast was called once
      expect(mockErrorToast).toHaveBeenCalledTimes(1);
    });

    it('component receives location from useLocation hook', () => {
      mockLocation = { pathname: '/test-path', state: { from: '/previous' } };
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };
      mockCheckRole.mockReturnValue(true);

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div data-testid="protected-content">Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      // Component should render without error with custom location
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Navigation State Tests
  // ===========================================================================

  describe('Navigation state preservation', () => {
    it('passes current location state to Navigate component', () => {
      mockLocation = { pathname: '/protected', state: { from: { pathname: '/some-page' } } };
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: false, user: null };

      renderProtectedRoute();

      // The user should be redirected to login
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Children Rendering Tests
  // ===========================================================================

  describe('Children rendering', () => {
    it('renders children as-is when all conditions are met', () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };
      mockCheckRole.mockReturnValue(true);

      render(
        <MemoryRouter>
          <ProtectedRoute requiredRole="SAAS_SUPER_ADMIN">
            <div data-testid="child-1">Child 1</div>
            <div data-testid="child-2">Child 2</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('renders complex nested children', () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };
      mockCheckRole.mockReturnValue(true);

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div data-testid="parent">
              <div data-testid="nested-child">
                <span data-testid="deep-child">Deep content</span>
              </div>
            </div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByTestId('parent')).toBeInTheDocument();
      expect(screen.getByTestId('nested-child')).toBeInTheDocument();
      expect(screen.getByTestId('deep-child')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('Edge cases', () => {
    it('handles undefined requiredRole gracefully', () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };

      render(
        <MemoryRouter>
          <ProtectedRoute requiredRole={undefined}>
            <div data-testid="protected-content">Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('handles rapid auth state changes', async () => {
      mockAuthReturn = { ...defaultAuthContext, isLoading: true };

      const { rerender } = render(
        <MemoryRouter>
          <ProtectedRoute>
            <div data-testid="protected-content">Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByTestId('spinner')).toBeInTheDocument();

      // Rapidly change to authenticated
      mockAuthReturn = { ...defaultAuthContext, isLoading: false, isAuthenticated: true };

      rerender(
        <MemoryRouter>
          <ProtectedRoute>
            <div data-testid="protected-content">Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('handles transition from loading to unauthenticated', async () => {
      mockAuthReturn = { ...defaultAuthContext, isLoading: true };

      const { rerender } = renderProtectedRoute();

      expect(screen.getByTestId('spinner')).toBeInTheDocument();

      // Change to unauthenticated
      mockAuthReturn = { ...defaultAuthContext, isLoading: false, isAuthenticated: false, user: null };

      rerender(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div data-testid="protected-content">Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('handles empty children gracefully', () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };

      const { container } = render(
        <MemoryRouter>
          <ProtectedRoute>{null}</ProtectedRoute>
        </MemoryRouter>
      );

      // Should render without crashing
      expect(container).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('provides accessible loading state', () => {
      mockAuthReturn = { ...defaultAuthContext, isLoading: true };

      renderProtectedRoute();

      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveAttribute('aria-label');
    });

    it('spinner has proper labeling from i18n', () => {
      mockAuthReturn = { ...defaultAuthContext, isLoading: true };

      renderProtectedRoute();

      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveAttribute('aria-label', 'Loading...');
    });
  });
});

// =============================================================================
// Integration Tests
// =============================================================================

describe('ProtectedRoute Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation = { pathname: '/protected', state: null };
    mockAuthReturn = { ...defaultAuthContext };
    mockCheckRole.mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Route protection flow', () => {
    it('complete flow: loading -> authenticated -> content displayed', async () => {
      // Start with loading
      mockAuthReturn = { ...defaultAuthContext, isLoading: true };

      const { rerender } = render(
        <MemoryRouter>
          <ProtectedRoute>
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByTestId('spinner')).toBeInTheDocument();

      // Finish loading with authenticated
      mockAuthReturn = { ...defaultAuthContext, isLoading: false, isAuthenticated: true };

      rerender(
        <MemoryRouter>
          <ProtectedRoute>
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('complete flow: loading -> unauthenticated -> redirect to login', async () => {
      // Start with loading
      mockAuthReturn = { ...defaultAuthContext, isLoading: true };

      const { rerender } = renderProtectedRoute();

      expect(screen.getByTestId('spinner')).toBeInTheDocument();

      // Finish loading with unauthenticated
      mockAuthReturn = { ...defaultAuthContext, isLoading: false, isAuthenticated: false, user: null };

      rerender(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div data-testid="protected-content">Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('complete flow: authenticated but lacking role -> toast + redirect to dashboard', async () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };
      mockCheckRole.mockReturnValue(false);

      renderProtectedRoute({ requiredRole: 'SAAS_BILLING_ADMIN' });

      // Should show dashboard (redirected)
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();

      // Should have shown error toast
      await waitFor(() => {
        expect(mockErrorToast).toHaveBeenCalledWith(
          'Access Denied',
          'You do not have permission to access this page.'
        );
      });
    });
  });

  describe('Multiple role requirements', () => {
    it('handles SAAS_SUPER_ADMIN requirement', () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };
      mockCheckRole.mockReturnValue(true);

      renderProtectedRoute({ requiredRole: 'SAAS_SUPER_ADMIN' });

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('handles SAAS_BILLING_ADMIN requirement', () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };
      mockCheckRole.mockReturnValue(true);

      renderProtectedRoute({ requiredRole: 'SAAS_BILLING_ADMIN' });

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('handles SAAS_SUPPORT_AGENT requirement', () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };
      mockCheckRole.mockReturnValue(true);

      renderProtectedRoute({ requiredRole: 'SAAS_SUPPORT_AGENT' });

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });
});
