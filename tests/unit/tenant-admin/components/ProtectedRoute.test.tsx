/**
 * ProtectedRoute Component Unit Tests
 *
 * Tests for authentication and role-based access control in the tenant admin app.
 * Covers: loading state, unauthenticated redirect, role-based access denied, authorized access.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import React, { type ReactNode } from 'react';

// =============================================================================
// Mocks - Must be defined before imports that use them
// =============================================================================

// Mock functions that need to be accessed in tests
const mockCheckRole = vi.fn();
const mockError = vi.fn();
let mockAuthState = {
  isLoading: false,
  isAuthenticated: false,
  checkRole: mockCheckRole,
  user: null as unknown,
};

// Mock @xala/auth - using multiple path variations to ensure the mock is applied
vi.mock('@xala/auth', () => ({
  useAuth: () => mockAuthState,
}));

// Also mock the direct path in case resolution differs
vi.mock('../../../../packages/auth/src/index.ts', () => ({
  useAuth: () => mockAuthState,
}));

// Mock ToastProvider
vi.mock('../../../../apps/tenant-admin/src/providers/ToastProvider', () => ({
  useToast: () => ({
    error: mockError,
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    addToast: vi.fn(),
  }),
}));

// Mock @xala/ds Spinner
vi.mock('@xala/ds', () => ({
  Spinner: (props: { 'aria-label'?: string; 'data-size'?: string }) =>
    React.createElement('div', {
      'data-testid': 'spinner',
      'aria-label': props['aria-label'],
      'data-size': props['data-size'],
    }, 'Loading...'),
}));

// Mock @xala/i18n - return the defaultValue or key
vi.mock('@xala/i18n', () => ({
  useT: () => (key: string, options?: { defaultValue?: string }) => {
    return options?.defaultValue || key;
  },
}));

// Import after mocks are set up
import { ProtectedRoute } from '../../../../apps/tenant-admin/src/components/ProtectedRoute';

// =============================================================================
// Test Helpers
// =============================================================================

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
  tenantName: string;
}

const setMockAuthState = (state: {
  isLoading?: boolean;
  isAuthenticated?: boolean;
  checkRole?: Mock;
  user?: MockUser | null;
}) => {
  mockAuthState = {
    isLoading: state.isLoading ?? false,
    isAuthenticated: state.isAuthenticated ?? false,
    checkRole: state.checkRole ?? mockCheckRole,
    user: state.user ?? null,
  };
};

// Helper component to capture navigation
function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

// Wrapper for rendering with router
function renderWithRouter(
  ui: ReactNode,
  { initialPath = '/protected' }: { initialPath?: string } = {}
) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        <Route path="/" element={<div data-testid="dashboard-page">Dashboard</div>} />
        <Route path="/protected" element={ui} />
        <Route path="/settings/branding" element={ui} />
      </Routes>
      <LocationDisplay />
    </MemoryRouter>
  );
}

// =============================================================================
// Tests
// =============================================================================

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRole.mockReturnValue(false);
    setMockAuthState({
      isLoading: false,
      isAuthenticated: false,
      checkRole: mockCheckRole,
      user: null,
    });
  });

  describe('Loading State', () => {
    it('renders spinner while authentication is loading', () => {
      setMockAuthState({
        isLoading: true,
        isAuthenticated: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      // The Spinner component renders with data-testid and aria-label
      // Mock returns defaultValue (English)
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-label', 'Loading...');
      expect(spinner).toHaveAttribute('data-size', 'lg');
    });

    it('does not render children while loading', () => {
      setMockAuthState({
        isLoading: true,
        isAuthenticated: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('does not navigate while loading', () => {
      setMockAuthState({
        isLoading: true,
        isAuthenticated: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      // Should still be on the protected route, not redirected
      expect(screen.getByTestId('location')).toHaveTextContent('/protected');
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });
  });

  describe('Unauthenticated Redirect', () => {
    it('redirects to login when user is not authenticated', () => {
      setMockAuthState({
        isLoading: false,
        isAuthenticated: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      // Should redirect to login
      expect(screen.getByTestId('location')).toHaveTextContent('/login');
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('does not render children when unauthenticated', () => {
      setMockAuthState({
        isLoading: false,
        isAuthenticated: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Role-Based Access Denied', () => {
    it('redirects to dashboard when user lacks required role', () => {
      const checkRole = vi.fn().mockReturnValue(false);
      setMockAuthState({
        isLoading: false,
        isAuthenticated: true,
        checkRole,
        user: {
          id: 'user-1',
          name: 'Billing Admin',
          email: 'billing@tenant.no',
          role: 'TENANT_BILLING_ADMIN',
          tenantId: 'tenant-001',
          tenantName: 'Demo Kommune',
        },
      });

      renderWithRouter(
        <ProtectedRoute requiredRole="TENANT_TECH_ADMIN">
          <div>Tech Admin Content</div>
        </ProtectedRoute>
      );

      // Should redirect to dashboard
      expect(screen.getByTestId('location')).toHaveTextContent('/');
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    it('calls checkRole with the required role', () => {
      const checkRole = vi.fn().mockReturnValue(false);
      setMockAuthState({
        isLoading: false,
        isAuthenticated: true,
        checkRole,
        user: {
          id: 'user-1',
          name: 'Billing Admin',
          email: 'billing@tenant.no',
          role: 'TENANT_BILLING_ADMIN',
          tenantId: 'tenant-001',
          tenantName: 'Demo Kommune',
        },
      });

      renderWithRouter(
        <ProtectedRoute requiredRole="TENANT_TECH_ADMIN">
          <div>Tech Admin Content</div>
        </ProtectedRoute>
      );

      expect(checkRole).toHaveBeenCalledWith('TENANT_TECH_ADMIN');
    });

    it('does not render children when role is denied', () => {
      const checkRole = vi.fn().mockReturnValue(false);
      setMockAuthState({
        isLoading: false,
        isAuthenticated: true,
        checkRole,
      });

      renderWithRouter(
        <ProtectedRoute requiredRole="TENANT_ADMIN">
          <div>Admin Only Content</div>
        </ProtectedRoute>
      );

      expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument();
    });

    it('shows error toast when access is denied', async () => {
      const checkRole = vi.fn().mockReturnValue(false);
      setMockAuthState({
        isLoading: false,
        isAuthenticated: true,
        checkRole,
      });

      renderWithRouter(
        <ProtectedRoute requiredRole="TENANT_ADMIN">
          <div>Admin Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        // Mock returns defaultValue (English)
        expect(mockError).toHaveBeenCalledWith(
          'No access',
          'You do not have access to this page. Contact tenant administrator if you believe this is an error.'
        );
      });
    });

    it('only shows error toast once per route', async () => {
      const checkRole = vi.fn().mockReturnValue(false);
      setMockAuthState({
        isLoading: false,
        isAuthenticated: true,
        checkRole,
      });

      const { rerender } = render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/" element={<div>Dashboard</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute requiredRole="TENANT_ADMIN">
                  <div>Admin Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      // Wait for initial toast
      await waitFor(() => {
        expect(mockError).toHaveBeenCalledTimes(1);
      });

      // Rerender the same route - toast should not be called again
      rerender(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/" element={<div>Dashboard</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute requiredRole="TENANT_ADMIN">
                  <div>Admin Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      // Toast should still only be called once
      expect(mockError).toHaveBeenCalledTimes(1);
    });
  });

  describe('Authorized Access', () => {
    it('renders children when authenticated without required role', () => {
      const checkRole = vi.fn().mockReturnValue(true);
      setMockAuthState({
        isLoading: false,
        isAuthenticated: true,
        checkRole,
        user: {
          id: 'user-1',
          name: 'Tenant Admin',
          email: 'admin@tenant.no',
          role: 'TENANT_ADMIN',
          tenantId: 'tenant-001',
          tenantName: 'Demo Kommune',
        },
      });

      renderWithRouter(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      // Should stay on protected route
      expect(screen.getByTestId('location')).toHaveTextContent('/protected');
    });

    it('renders children when authenticated with matching required role', () => {
      const checkRole = vi.fn().mockReturnValue(true);
      setMockAuthState({
        isLoading: false,
        isAuthenticated: true,
        checkRole,
        user: {
          id: 'user-1',
          name: 'Tech Admin',
          email: 'tech@tenant.no',
          role: 'TENANT_TECH_ADMIN',
          tenantId: 'tenant-001',
          tenantName: 'Demo Kommune',
        },
      });

      renderWithRouter(
        <ProtectedRoute requiredRole="TENANT_TECH_ADMIN">
          <div>Tech Admin Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Tech Admin Content')).toBeInTheDocument();
      expect(checkRole).toHaveBeenCalledWith('TENANT_TECH_ADMIN');
    });

    it('renders children when tenant admin accesses any route', () => {
      // Tenant admin should have access to everything
      const checkRole = vi.fn().mockReturnValue(true);
      setMockAuthState({
        isLoading: false,
        isAuthenticated: true,
        checkRole,
        user: {
          id: 'admin-1',
          name: 'Tenant Admin',
          email: 'admin@tenant.no',
          role: 'TENANT_ADMIN',
          tenantId: 'tenant-001',
          tenantName: 'Demo Kommune',
        },
      });

      renderWithRouter(
        <ProtectedRoute requiredRole="TENANT_BILLING_ADMIN">
          <div>Billing Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Billing Content')).toBeInTheDocument();
    });

    it('does not show error toast when access is granted', async () => {
      const checkRole = vi.fn().mockReturnValue(true);
      setMockAuthState({
        isLoading: false,
        isAuthenticated: true,
        checkRole,
      });

      renderWithRouter(
        <ProtectedRoute requiredRole="TENANT_ADMIN">
          <div>Admin Content</div>
        </ProtectedRoute>
      );

      // Wait a tick to ensure useEffect has run
      await waitFor(() => {
        expect(mockError).not.toHaveBeenCalled();
      });
    });

    it('renders complex children correctly', () => {
      const checkRole = vi.fn().mockReturnValue(true);
      setMockAuthState({
        isLoading: false,
        isAuthenticated: true,
        checkRole,
      });

      renderWithRouter(
        <ProtectedRoute>
          <div>
            <header>Header</header>
            <main>Main Content</main>
            <footer>Footer</footer>
          </div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Main Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles no requiredRole prop (public authenticated route)', () => {
      const checkRole = vi.fn().mockReturnValue(true);
      setMockAuthState({
        isLoading: false,
        isAuthenticated: true,
        checkRole,
      });

      renderWithRouter(
        <ProtectedRoute>
          <div>Authenticated Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Authenticated Content')).toBeInTheDocument();
    });

    it('handles transition from loading to authenticated', () => {
      const checkRole = vi.fn().mockReturnValue(true);

      // Start with loading state
      setMockAuthState({
        isLoading: true,
        isAuthenticated: false,
        checkRole,
      });

      const { rerender } = render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('spinner')).toBeInTheDocument();

      // Transition to authenticated
      setMockAuthState({
        isLoading: false,
        isAuthenticated: true,
        checkRole,
      });

      rerender(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('handles transition from loading to unauthenticated', () => {
      // Start with loading state
      setMockAuthState({
        isLoading: true,
        isAuthenticated: false,
      });

      const { rerender } = render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<div data-testid="login-page">Login</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('spinner')).toBeInTheDocument();

      // Transition to unauthenticated
      setMockAuthState({
        isLoading: false,
        isAuthenticated: false,
      });

      rerender(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<div data-testid="login-page">Login</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });
});
