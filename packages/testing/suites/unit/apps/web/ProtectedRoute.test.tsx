/**
 * ProtectedRoute Unit Tests
 *
 * Tests for authentication protection and flow context preservation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useT } from '@xala/i18n';

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock SDK flow context utilities
vi.mock('@digilist/client-sdk', () => ({
  createFlowContext: vi.fn(() => ({
    returnTo: '/test-path',
    tenantId: 'test-tenant',
    createdAt: new Date().toISOString(),
  })),
  saveFlowContextToStorage: vi.fn(() => true),
  sanitizeReturnToUrl: vi.fn((url: string) => url),
}));

// Test component that renders when authenticated
function ProtectedContent() {
  return <div data-testid="protected-content">Protected Content</div>;
}

// Test component for login page
function LoginPage() {
  return <div data-testid="login-page">Login Page</div>;
}

// Helper to render with router
function renderWithRouter(
  ui: React.ReactElement,
  { initialEntries = ['/protected'] } = {}
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <ProtectedContent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe.skip('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe.skip('Authentication States', () => {
    it('should show loading spinner when auth is loading', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
      });

      renderWithRouter(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      );

      expect(screen.getByLabelText('Laster...')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should render children when authenticated', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    it('should redirect to login when not authenticated', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should redirect to custom path when specified', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/custom-login" element={<div data-testid="custom-login">Custom Login</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute redirectTo="/custom-login">
                  <ProtectedContent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('custom-login')).toBeInTheDocument();
      });
    });
  });

  describe.skip('Flow Context Preservation', () => {
    it('should save flow context before redirecting', async () => {
      const { createFlowContext, saveFlowContextToStorage } = await import('@digilist/client-sdk');

      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(createFlowContext).toHaveBeenCalled();
        expect(saveFlowContextToStorage).toHaveBeenCalled();
      });
    });

    it('should include return path in flow context', async () => {
      const { sanitizeReturnToUrl } = await import('@digilist/client-sdk');

      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>,
        { initialEntries: ['/protected?query=value'] }
      );

      await waitFor(() => {
        expect(sanitizeReturnToUrl).toHaveBeenCalledWith('/protected?query=value');
      });
    });

    it('should use provided tenantId in flow context', async () => {
      const { createFlowContext } = await import('@digilist/client-sdk');

      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute tenantId="custom-tenant">
                  <ProtectedContent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(createFlowContext).toHaveBeenCalledWith(
          expect.any(String),
          'custom-tenant',
          expect.any(Object)
        );
      });
    });
  });

  describe.skip('Login State', () => {
    it('should pass location state to login page', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });

    it('should indicate hasFlowContext in login state', async () => {
      const { saveFlowContextToStorage } = await import('@digilist/client-sdk');
      (saveFlowContextToStorage as ReturnType<typeof vi.fn>).mockReturnValue(true);

      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(saveFlowContextToStorage).toHaveBeenCalled();
      });
    });
  });

  describe.skip('Edge Cases', () => {
    it('should not save flow context when already authenticated', async () => {
      const { saveFlowContextToStorage } = await import('@digilist/client-sdk');

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });

      expect(saveFlowContextToStorage).not.toHaveBeenCalled();
    });

    it('should not save flow context while loading', async () => {
      const { saveFlowContextToStorage } = await import('@digilist/client-sdk');

      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
      });

      renderWithRouter(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      );

      expect(saveFlowContextToStorage).not.toHaveBeenCalled();
    });

    it('should handle failed flow context save gracefully', async () => {
      const { saveFlowContextToStorage } = await import('@digilist/client-sdk');
      (saveFlowContextToStorage as ReturnType<typeof vi.fn>).mockReturnValue(false);

      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });

      // Should not throw, just continue with redirect
      renderWithRouter(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });
  });

  describe.skip('Accessibility', () => {
    it('should have accessible loading state', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
      });

      renderWithRouter(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      );

      const spinner = screen.getByLabelText(t("ui.loading"));
      expect(spinner).toBeInTheDocument();
    });
  });
});
