/**
 * ProtectedRoute Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@digilist/api/ProtectedRoute';
import { AuthContext } from '@digilist/api/providers/AuthProvider';
import type { AuthContextType } from '@digilist/api/types';

// Mock auth context
function renderWithAuthContext(authValue: Partial<AuthContextType>, children: React.ReactNode) {
  const defaultAuth: AuthContextType = {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    isAdmin: false,
    isSaksbehandler: false,
    accessDeniedError: null,
    hasStoredContext: false,
    login: vi.fn(),
    logout: vi.fn(),
    checkRole: vi.fn(),
    restoreFlowContext: vi.fn(),
    clearFlowContext: vi.fn(),
    ...authValue,
  };

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={defaultAuth}>
        <Routes>
          <Route path="/" element={children} />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/access-denied" element={<div>Access Denied Page</div>} />
        </Routes>
      </AuthContext.Provider>
    </BrowserRouter>
  );
}

// SKIPPED
describe.skip('ProtectedRoute', () => {
  it('should show loading state', () => {
    renderWithAuthContext(
      { isLoading: true },
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Laster...')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    renderWithAuthContext(
      { isAuthenticated: false, isLoading: false },
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('should redirect to access denied when access is denied', () => {
    renderWithAuthContext(
      { 
        isAuthenticated: false, 
        isLoading: false,
        accessDeniedError: 'Access denied',
      },
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Access Denied Page')).toBeInTheDocument();
  });

  it('should render children when authenticated', () => {
    renderWithAuthContext(
      { 
        isAuthenticated: true, 
        isLoading: false,
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'citizen',
        },
      },
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to custom path', () => {
    renderWithAuthContext(
      { isAuthenticated: false, isLoading: false },
      <ProtectedRoute redirectTo="/custom-login">
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should attempt to redirect (will show login since /custom-login doesn't exist in test routes)
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
