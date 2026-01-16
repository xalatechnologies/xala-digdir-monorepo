/**
 * ProtectedRoute Component Tests
 *
 * Tests for protected route authorization, role-based access control, and context validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import type { Organization } from '@digilist/client-sdk/types';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockLocation = { pathname: '/protected', search: '', hash: '', state: null };
vi.mock('react-router-dom', () => ({
  Navigate: ({ to, state, replace }: any) => {
    mockNavigate(to, state, replace);
    return <div data-testid="navigate">{`Navigate to ${to}`}</div>;
  },
  useLocation: () => mockLocation,
}));

// Mock @digilist/client-sdk hooks
vi.mock('@digilist/client-sdk/hooks', () => ({
  useOrganizations: vi.fn(() => ({
    data: { data: [] },
    isLoading: false,
  })),
}));

// Import after mocking
import { useOrganizations } from '@digilist/client-sdk/hooks';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthContext, type AuthContextType } from '../hooks/useAuth';
import { AccountContextProvider } from '../providers/AccountContextProvider';

describe('ProtectedRoute', () => {
  const mockOrganizations: Organization[] = [
    {
      id: 'org-1',
      name: 'Test Kommune',
      organizationNumber: '123456789',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  const createAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
    user: {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      role: 'saksbehandler',
    },
    isLoading: false,
    isAuthenticated: true,
    isAdmin: false,
    isSaksbehandler: true,
    login: vi.fn(),
    logout: vi.fn(),
    checkRole: vi.fn((role) => role === 'saksbehandler'),
    ...overrides,
  });

  const createWrapper = (
    authContext: AuthContextType,
    organizations: Organization[] = []
  ) => {
    // Mock useOrganizations to return test data
    vi.mocked(useOrganizations).mockReturnValue({
      data: { data: organizations },
      isLoading: false,
    } as any);

    return ({ children }: { children: ReactNode }) => (
      <AuthContext.Provider value={authContext}>
        <AccountContextProvider userId="test-user" userName="Test User">
          {children}
        </AccountContextProvider>
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    // Clear localStorage and mocks before each test
    localStorage.clear();
    mockNavigate.mockClear();
    vi.clearAllMocks();
  });

  describe('Loading States', () => {
    it('should show spinner when auth is loading', () => {
      const authContext = createAuthContext({ isLoading: true });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext) }
      );

      expect(screen.getByLabelText('Laster...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should show spinner when context is loading and requiredContext is set', () => {
      const authContext = createAuthContext();

      // Create a custom wrapper that mocks isLoadingOrganizations as true
      const CustomWrapper = ({ children }: { children: ReactNode }) => {
        // Mock useOrganizations to return loading state
        vi.mocked(useOrganizations).mockReturnValue({
          data: { data: [] },
          isLoading: true,
        } as any);

        return (
          <AuthContext.Provider value={authContext}>
            <AccountContextProvider userId="test-user" userName="Test User">
              {children}
            </AccountContextProvider>
          </AuthContext.Provider>
        );
      };

      render(
        <ProtectedRoute requiredContext="organization">
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: CustomWrapper }
      );

      expect(screen.getByLabelText('Laster...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should not show spinner when context is loading but no requiredContext', () => {
      const authContext = createAuthContext();

      // Mock isLoadingOrganizations as true
      vi.mocked(useOrganizations).mockReturnValue({
        data: { data: [] },
        isLoading: true,
      } as any);

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext) }
      );

      // Should render content, not spinner
      expect(screen.queryByLabelText('Laster...')).not.toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should use design tokens for loading spinner container', () => {
      const authContext = createAuthContext({ isLoading: true });

      const { container } = render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext) }
      );

      const spinnerContainer = screen.getByLabelText('Laster...').parentElement;
      expect(spinnerContainer).toHaveStyle({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
      });
    });

    it('should render spinner with correct size', () => {
      const authContext = createAuthContext({ isLoading: true });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext) }
      );

      const spinner = screen.getByLabelText('Laster...');
      expect(spinner).toHaveAttribute('data-size', 'lg');
    });
  });

  describe('Authentication Check', () => {
    it('should redirect to /login when not authenticated', () => {
      const authContext = createAuthContext({ isAuthenticated: false });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext) }
      );

      expect(screen.getByTestId('navigate')).toHaveTextContent('Navigate to /login');
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should include location state in redirect when not authenticated', () => {
      const authContext = createAuthContext({ isAuthenticated: false });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext) }
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        '/login',
        { from: mockLocation },
        true
      );
    });

    it('should render children when authenticated', () => {
      const authContext = createAuthContext({ isAuthenticated: true });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext) }
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Role-Based Access Control', () => {
    it('should show "Ingen tilgang" when user lacks required role', () => {
      const authContext = createAuthContext({
        checkRole: vi.fn(() => false),
      });

      render(
        <ProtectedRoute requiredRole="admin">
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext) }
      );

      expect(screen.getByText('Ingen tilgang')).toBeInTheDocument();
      expect(screen.getByText(/Du har ikke tilgang til denne siden/)).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render children when user has required role', () => {
      const authContext = createAuthContext({
        checkRole: vi.fn(() => true),
      });

      render(
        <ProtectedRoute requiredRole="saksbehandler">
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext) }
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Ingen tilgang')).not.toBeInTheDocument();
    });

    it('should render children when no role is required', () => {
      const authContext = createAuthContext();

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext) }
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should use design tokens for access denied message', () => {
      const authContext = createAuthContext({
        checkRole: vi.fn(() => false),
      });

      const { container } = render(
        <ProtectedRoute requiredRole="admin">
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext) }
      );

      const messageContainer = screen.getByText('Ingen tilgang').parentElement;
      expect(messageContainer).toHaveStyle({
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 'var(--ds-spacing-4)',
        padding: 'var(--ds-spacing-6)',
        textAlign: 'center',
      });
    });

    it('should render Heading with correct level and size', () => {
      const authContext = createAuthContext({
        checkRole: vi.fn(() => false),
      });

      render(
        <ProtectedRoute requiredRole="admin">
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext) }
      );

      const heading = screen.getByText('Ingen tilgang');
      expect(heading.tagName).toBe('H1');
      expect(heading).toHaveAttribute('data-size', 'lg');
      expect(heading).toHaveStyle({
        color: 'var(--ds-color-danger-text-default)',
      });
    });

    it('should display contact administrator message', () => {
      const authContext = createAuthContext({
        checkRole: vi.fn(() => false),
      });

      render(
        <ProtectedRoute requiredRole="admin">
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext) }
      );

      expect(screen.getByText(/Kontakt administrator hvis du mener dette er feil/)).toBeInTheDocument();
    });
  });

  describe('Context Validation', () => {
    it('should redirect to / when in organization mode but personal required', async () => {
      const authContext = createAuthContext();

      // Set context to organization mode
      localStorage.setItem('minside_account_type', 'organization');
      localStorage.setItem('minside_selected_organization', 'org-1');

      render(
        <ProtectedRoute requiredContext="personal">
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext, mockOrganizations) }
      );

      await waitFor(() => {
        expect(screen.getByTestId('navigate')).toHaveTextContent('Navigate to /');
      });

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should redirect to / when in personal mode but organization required', () => {
      const authContext = createAuthContext();

      // Set context to personal mode
      localStorage.setItem('minside_account_type', 'personal');

      render(
        <ProtectedRoute requiredContext="organization">
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext, mockOrganizations) }
      );

      // Redirects to current context's home (personal = /)
      expect(screen.getByTestId('navigate')).toHaveTextContent('Navigate to /');
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should include redirect message in state when context mismatch (org to personal)', async () => {
      const authContext = createAuthContext();

      // Set context to organization mode
      localStorage.setItem('minside_account_type', 'organization');
      localStorage.setItem('minside_selected_organization', 'org-1');

      render(
        <ProtectedRoute requiredContext="personal">
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext, mockOrganizations) }
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          '/org',
          expect.objectContaining({
            contextRedirectMessage: 'Denne siden krever personlig modus. Du har blitt omdirigert.',
            from: mockLocation,
          }),
          true
        );
      });
    });

    it('should include redirect message in state when context mismatch (personal to org)', () => {
      const authContext = createAuthContext();

      // Set context to personal mode
      localStorage.setItem('minside_account_type', 'personal');

      render(
        <ProtectedRoute requiredContext="organization">
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext, mockOrganizations) }
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        '/',
        expect.objectContaining({
          contextRedirectMessage: 'Denne siden krever organisasjonsmodus. Du har blitt omdirigert.',
          from: mockLocation,
        }),
        true
      );
    });

    it('should render children when in correct context (personal)', () => {
      const authContext = createAuthContext();

      // Set context to personal mode
      localStorage.setItem('minside_account_type', 'personal');

      render(
        <ProtectedRoute requiredContext="personal">
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext, mockOrganizations) }
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should render children when in correct context (organization)', async () => {
      const authContext = createAuthContext();

      // Set context to organization mode
      localStorage.setItem('minside_account_type', 'organization');
      localStorage.setItem('minside_selected_organization', 'org-1');

      render(
        <ProtectedRoute requiredContext="organization">
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext, mockOrganizations) }
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });

    it('should render children when no context required', () => {
      const authContext = createAuthContext();

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext, mockOrganizations) }
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Combined Requirements', () => {
    it('should check authentication before role', () => {
      const authContext = createAuthContext({
        isAuthenticated: false,
        checkRole: vi.fn(() => false),
      });

      render(
        <ProtectedRoute requiredRole="admin">
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext) }
      );

      // Should redirect to login, not show access denied
      expect(screen.getByTestId('navigate')).toHaveTextContent('Navigate to /login');
      expect(screen.queryByText('Ingen tilgang')).not.toBeInTheDocument();
    });

    it('should check role before context', async () => {
      const authContext = createAuthContext({
        checkRole: vi.fn(() => false),
      });

      // Set context to wrong mode
      localStorage.setItem('minside_account_type', 'personal');

      render(
        <ProtectedRoute requiredRole="admin" requiredContext="organization">
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext, mockOrganizations) }
      );

      // Should show access denied, not redirect for context
      expect(screen.getByText('Ingen tilgang')).toBeInTheDocument();
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });

    it('should pass all checks when authenticated with correct role and context', async () => {
      const authContext = createAuthContext({
        checkRole: vi.fn(() => true),
      });

      // Set context to organization mode
      localStorage.setItem('minside_account_type', 'organization');
      localStorage.setItem('minside_selected_organization', 'org-1');

      render(
        <ProtectedRoute requiredRole="saksbehandler" requiredContext="organization">
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext, mockOrganizations) }
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null children gracefully', () => {
      const authContext = createAuthContext();

      render(
        <ProtectedRoute>{null}</ProtectedRoute>,
        { wrapper: createWrapper(authContext) }
      );

      // Should not crash
      expect(screen.queryByText('Ingen tilgang')).not.toBeInTheDocument();
    });

    it('should handle multiple children', () => {
      const authContext = createAuthContext();

      render(
        <ProtectedRoute>
          <div>First Child</div>
          <div>Second Child</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext) }
      );

      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
    });

    it('should handle loading state transition to authenticated', async () => {
      const authContext = createAuthContext({ isLoading: true });

      const { rerender } = render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext) }
      );

      expect(screen.getByLabelText('Laster...')).toBeInTheDocument();

      // Update auth context to loaded
      const updatedAuthContext = createAuthContext({ isLoading: false });

      rerender(
        <AuthContext.Provider value={updatedAuthContext}>
          <AccountContextProvider userId="test-user" userName="Test User">
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          </AccountContextProvider>
        </AuthContext.Provider>
      );

      await waitFor(() => {
        expect(screen.queryByLabelText('Laster...')).not.toBeInTheDocument();
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
  });

  describe('Redirect Messages', () => {
    it('should use correct message when organization requires personal', async () => {
      const authContext = createAuthContext();

      // Set context to organization mode, but page requires personal
      localStorage.setItem('minside_account_type', 'organization');
      localStorage.setItem('minside_selected_organization', 'org-1');

      render(
        <ProtectedRoute requiredContext="personal">
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext, mockOrganizations) }
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          '/org',
          expect.objectContaining({
            contextRedirectMessage: 'Denne siden krever personlig modus. Du har blitt omdirigert.',
          }),
          true
        );
      });
    });

    it('should use correct message when personal requires organization', () => {
      const authContext = createAuthContext();

      // Set context to personal mode, but page requires organization
      localStorage.setItem('minside_account_type', 'personal');

      render(
        <ProtectedRoute requiredContext="organization">
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext, mockOrganizations) }
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        '/',
        expect.objectContaining({
          contextRedirectMessage: 'Denne siden krever organisasjonsmodus. Du har blitt omdirigert.',
        }),
        true
      );
    });
  });

  describe('Design Token Compliance', () => {
    it('should use design tokens for loading state background', () => {
      const authContext = createAuthContext({ isLoading: true });

      const { container } = render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext) }
      );

      const spinnerContainer = screen.getByLabelText('Laster...').parentElement;
      expect(spinnerContainer).toHaveStyle({
        backgroundColor: 'var(--ds-color-neutral-background-default)',
      });
    });

    it('should use design tokens for access denied container', () => {
      const authContext = createAuthContext({
        checkRole: vi.fn(() => false),
      });

      render(
        <ProtectedRoute requiredRole="admin">
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext) }
      );

      const container = screen.getByText('Ingen tilgang').parentElement;
      expect(container).toHaveStyle({
        gap: 'var(--ds-spacing-4)',
        padding: 'var(--ds-spacing-6)',
      });
    });

    it('should use design tokens for text colors', () => {
      const authContext = createAuthContext({
        checkRole: vi.fn(() => false),
      });

      render(
        <ProtectedRoute requiredRole="admin">
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext) }
      );

      const heading = screen.getByText('Ingen tilgang');
      expect(heading).toHaveStyle({
        color: 'var(--ds-color-danger-text-default)',
      });

      const paragraph = screen.getByText(/Du har ikke tilgang til denne siden/);
      expect(paragraph).toHaveStyle({
        color: 'var(--ds-color-neutral-text-subtle)',
      });
    });
  });

  describe('Accessibility', () => {
    it('should provide accessible loading state', () => {
      const authContext = createAuthContext({ isLoading: true });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext) }
      );

      const spinner = screen.getByLabelText('Laster...');
      expect(spinner).toBeInTheDocument();
    });

    it('should use semantic heading for access denied', () => {
      const authContext = createAuthContext({
        checkRole: vi.fn(() => false),
      });

      render(
        <ProtectedRoute requiredRole="admin">
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper(authContext) }
      );

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Ingen tilgang');
    });
  });
});
