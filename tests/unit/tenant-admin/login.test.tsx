/**
 * LoginPage Component Unit Tests
 *
 * Tests for the login page of the tenant admin app.
 * Covers: render login options, demo login dialog, redirect when authenticated.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import React, { type ReactNode } from 'react';

// =============================================================================
// Mocks - Must be defined before imports that use them
// =============================================================================

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock auth state
const mockLogin = vi.fn();
let mockAuthState = {
  isAuthenticated: false,
  isLoading: false,
  login: mockLogin,
};

vi.mock('@xala/auth', () => ({
  useAuth: () => mockAuthState,
}));

// Mock i18n - return the key for testing
vi.mock('@xala/i18n', () => ({
  useT: () => (key: string) => key,
}));

// Mock SDK
vi.mock('@digilist/client-sdk', () => ({
  authService: {
    loginWithDemoToken: vi.fn().mockResolvedValue({
      data: {
        user: {
          id: 'demo-user',
          name: 'Demo User',
          email: 'demo@test.no',
          role: 'tenant_admin',
        },
      },
    }),
  },
}));

// Mock useDemoLogin hook
const mockOpenDemoLogin = vi.fn();
const mockCloseDemoLogin = vi.fn();
const mockHandleDemoLogin = vi.fn();
let mockDemoLoginState = {
  showDialog: false,
  openDemoLogin: mockOpenDemoLogin,
  closeDemoLogin: mockCloseDemoLogin,
  handleDemoLogin: mockHandleDemoLogin,
};

vi.mock('../../../apps/tenant-admin/src/hooks/useDemoLogin', () => ({
  useDemoLogin: () => mockDemoLoginState,
}));

// Mock @xala/ds components
vi.mock('@xala/ds', () => ({
  LoginLayout: ({
    children,
    brandName,
    brandTagline,
    title,
    subtitle,
    panelTitle,
    features,
    integrations,
    footerLinks,
  }: {
    children: ReactNode;
    brandName: string;
    brandTagline: string;
    title: string;
    subtitle: string;
    panelTitle: string;
    panelSubtitle?: string;
    panelDescription?: string;
    features?: Array<{ icon: ReactNode; title: string; description: string }>;
    integrations?: string[];
    footerLinks?: Array<{ href: string; label: string }>;
    copyright?: string;
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'login-layout' },
      React.createElement('h1', { 'data-testid': 'brand-name' }, brandName),
      React.createElement('span', { 'data-testid': 'brand-tagline' }, brandTagline),
      React.createElement('h2', { 'data-testid': 'title' }, title),
      React.createElement('p', { 'data-testid': 'subtitle' }, subtitle),
      React.createElement('h3', { 'data-testid': 'panel-title' }, panelTitle),
      features &&
        React.createElement(
          'div',
          { 'data-testid': 'features' },
          features.map((f, i) => React.createElement('div', { key: i, 'data-testid': `feature-${i}` }, f.title))
        ),
      integrations &&
        React.createElement(
          'div',
          { 'data-testid': 'integrations' },
          integrations.map((int, i) => React.createElement('span', { key: i }, int))
        ),
      footerLinks &&
        React.createElement(
          'div',
          { 'data-testid': 'footer-links' },
          footerLinks.map((link, i) =>
            React.createElement('a', { key: i, href: link.href, 'data-testid': `footer-link-${i}` }, link.label)
          )
        ),
      React.createElement('div', { 'data-testid': 'login-options' }, children)
    ),
  LoginOption: ({
    icon,
    title,
    description,
    onClick,
  }: {
    icon: ReactNode;
    title: string;
    description: string;
    onClick?: () => void;
  }) =>
    React.createElement(
      'button',
      {
        'data-testid': `login-option-${title.replace(/\./g, '-')}`,
        onClick,
        type: 'button',
      },
      React.createElement('span', { 'data-testid': 'option-icon' }, icon),
      React.createElement('span', { 'data-testid': 'option-title' }, title),
      React.createElement('span', { 'data-testid': 'option-description' }, description)
    ),
  DemoLoginDialog: ({
    open,
    onClose,
    onSubmit,
    title,
    description,
  }: {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; email: string; token: string }) => Promise<void>;
    title: string;
    description: string;
    cancelText?: string;
    submitText?: string;
    loadingText?: string;
    validationMessages?: Record<string, string>;
    labels?: Record<string, string>;
    placeholders?: Record<string, string>;
  }) =>
    open
      ? React.createElement(
          'div',
          { 'data-testid': 'demo-login-dialog', role: 'dialog' },
          React.createElement('h2', { 'data-testid': 'dialog-title' }, title),
          React.createElement('p', { 'data-testid': 'dialog-description' }, description),
          React.createElement(
            'button',
            {
              'data-testid': 'dialog-close',
              onClick: onClose,
              type: 'button',
            },
            'Close'
          ),
          React.createElement(
            'button',
            {
              'data-testid': 'dialog-submit',
              onClick: () => onSubmit({ name: 'Test User', email: 'test@test.no', token: 'demo-token' }),
              type: 'button',
            },
            'Submit'
          )
        )
      : null,
  IdPortenIcon: () => React.createElement('span', { 'data-testid': 'idporten-icon' }, 'IdPorten'),
  MicrosoftIcon: () => React.createElement('span', { 'data-testid': 'microsoft-icon' }, 'Microsoft'),
  KeyIcon: () => React.createElement('span', { 'data-testid': 'key-icon' }, 'Key'),
  PlatformIcon: () => React.createElement('span', { 'data-testid': 'platform-icon' }, 'Platform'),
  SettingsIcon: () => React.createElement('span', { 'data-testid': 'settings-icon' }, 'Settings'),
  ShieldCheckIcon: () => React.createElement('span', { 'data-testid': 'shield-check-icon' }, 'Shield'),
}));

// Import component after mocks
import { LoginPage } from '../../../apps/tenant-admin/src/routes/login';

// =============================================================================
// Test Helpers
// =============================================================================

const setMockAuthState = (state: {
  isAuthenticated?: boolean;
  isLoading?: boolean;
  login?: Mock;
}) => {
  mockAuthState = {
    isAuthenticated: state.isAuthenticated ?? false,
    isLoading: state.isLoading ?? false,
    login: state.login ?? mockLogin,
  };
};

const setMockDemoLoginState = (state: {
  showDialog?: boolean;
  openDemoLogin?: Mock;
  closeDemoLogin?: Mock;
  handleDemoLogin?: Mock;
}) => {
  mockDemoLoginState = {
    showDialog: state.showDialog ?? false,
    openDemoLogin: state.openDemoLogin ?? mockOpenDemoLogin,
    closeDemoLogin: state.closeDemoLogin ?? mockCloseDemoLogin,
    handleDemoLogin: state.handleDemoLogin ?? mockHandleDemoLogin,
  };
};

// Helper component to display current location
function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

// Helper to render with router
function renderWithRouter(
  ui: ReactNode,
  { initialPath = '/login', from }: { initialPath?: string; from?: string } = {}
) {
  const state = from ? { from: { pathname: from } } : undefined;

  return render(
    <MemoryRouter initialEntries={[{ pathname: initialPath, state }]}>
      <Routes>
        <Route path="/login" element={ui} />
        <Route path="/" element={<div data-testid="dashboard-page">Dashboard</div>} />
        <Route path="/subscription" element={<div data-testid="subscription-page">Subscription</div>} />
      </Routes>
      <LocationDisplay />
    </MemoryRouter>
  );
}

// =============================================================================
// Tests
// =============================================================================

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockAuthState({
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
    });
    setMockDemoLoginState({
      showDialog: false,
      openDemoLogin: mockOpenDemoLogin,
      closeDemoLogin: mockCloseDemoLogin,
      handleDemoLogin: mockHandleDemoLogin,
    });
  });

  describe('Render Login Options', () => {
    it('renders the login layout with brand info', () => {
      renderWithRouter(<LoginPage />);

      expect(screen.getByTestId('login-layout')).toBeInTheDocument();
      expect(screen.getByTestId('brand-name')).toHaveTextContent('DIGILIST');
      expect(screen.getByTestId('brand-tagline')).toHaveTextContent('TENANT ADMIN');
    });

    it('renders the login title and subtitle', () => {
      renderWithRouter(<LoginPage />);

      expect(screen.getByTestId('title')).toHaveTextContent('auth.login');
      expect(screen.getByTestId('subtitle')).toHaveTextContent('auth.selectMethod');
    });

    it('renders the panel title', () => {
      renderWithRouter(<LoginPage />);

      expect(screen.getByTestId('panel-title')).toHaveTextContent('tenantAdmin.panelTitle');
    });

    it('renders ID-porten login option', () => {
      renderWithRouter(<LoginPage />);

      const idPortenOption = screen.getByTestId('login-option-auth-idporten');
      expect(idPortenOption).toBeInTheDocument();
      expect(screen.getByTestId('idporten-icon')).toBeInTheDocument();
    });

    it('renders Microsoft login option', () => {
      renderWithRouter(<LoginPage />);

      const microsoftOption = screen.getByTestId('login-option-auth-microsoft');
      expect(microsoftOption).toBeInTheDocument();
      expect(screen.getByTestId('microsoft-icon')).toBeInTheDocument();
    });

    it('renders demo login option', () => {
      renderWithRouter(<LoginPage />);

      const demoOption = screen.getByTestId('login-option-auth-demoLogin');
      expect(demoOption).toBeInTheDocument();
      expect(screen.getByTestId('key-icon')).toBeInTheDocument();
    });

    it('renders features section', () => {
      renderWithRouter(<LoginPage />);

      const features = screen.getByTestId('features');
      expect(features).toBeInTheDocument();
      expect(screen.getByTestId('feature-0')).toHaveTextContent('tenantAdmin.featureBranding');
      expect(screen.getByTestId('feature-1')).toHaveTextContent('tenantAdmin.featureSettings');
      expect(screen.getByTestId('feature-2')).toHaveTextContent('tenantAdmin.featureAudit');
    });

    it('renders integrations', () => {
      renderWithRouter(<LoginPage />);

      const integrations = screen.getByTestId('integrations');
      expect(integrations).toBeInTheDocument();
      expect(integrations).toHaveTextContent('BankID');
      expect(integrations).toHaveTextContent('Vipps');
      expect(integrations).toHaveTextContent('Azure AD');
      expect(integrations).toHaveTextContent('ISO 27001');
    });

    it('renders footer links', () => {
      renderWithRouter(<LoginPage />);

      const footerLinks = screen.getByTestId('footer-links');
      expect(footerLinks).toBeInTheDocument();

      const privacyLink = screen.getByTestId('footer-link-0');
      expect(privacyLink).toHaveTextContent('auth.privacy');
      expect(privacyLink).toHaveAttribute('href', 'https://digilist.no/personvern');

      const termsLink = screen.getByTestId('footer-link-1');
      expect(termsLink).toHaveTextContent('auth.terms');
      expect(termsLink).toHaveAttribute('href', 'https://digilist.no/cookies');

      const supportLink = screen.getByTestId('footer-link-2');
      expect(supportLink).toHaveTextContent('auth.contactSupport');
      expect(supportLink).toHaveAttribute('href', 'https://digilist.no/#book-demo');
    });

    it('calls login with idporten provider when ID-porten option is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      const idPortenOption = screen.getByTestId('login-option-auth-idporten');
      await user.click(idPortenOption);

      expect(mockLogin).toHaveBeenCalledTimes(1);
      expect(mockLogin).toHaveBeenCalledWith('idporten');
    });

    it('calls login with microsoft provider when Microsoft option is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      const microsoftOption = screen.getByTestId('login-option-auth-microsoft');
      await user.click(microsoftOption);

      expect(mockLogin).toHaveBeenCalledTimes(1);
      expect(mockLogin).toHaveBeenCalledWith('microsoft');
    });

    it('opens demo login dialog when demo login option is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      const demoOption = screen.getByTestId('login-option-auth-demoLogin');
      await user.click(demoOption);

      expect(mockOpenDemoLogin).toHaveBeenCalledTimes(1);
    });
  });

  describe('Demo Login Dialog', () => {
    it('does not render demo login dialog when showDialog is false', () => {
      setMockDemoLoginState({ showDialog: false });
      renderWithRouter(<LoginPage />);

      expect(screen.queryByTestId('demo-login-dialog')).not.toBeInTheDocument();
    });

    it('renders demo login dialog when showDialog is true', () => {
      setMockDemoLoginState({ showDialog: true });
      renderWithRouter(<LoginPage />);

      expect(screen.getByTestId('demo-login-dialog')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders dialog title', () => {
      setMockDemoLoginState({ showDialog: true });
      renderWithRouter(<LoginPage />);

      expect(screen.getByTestId('dialog-title')).toHaveTextContent('auth.demoForm.title');
    });

    it('renders dialog description', () => {
      setMockDemoLoginState({ showDialog: true });
      renderWithRouter(<LoginPage />);

      expect(screen.getByTestId('dialog-description')).toHaveTextContent('auth.demoForm.description');
    });

    it('calls closeDemoLogin when close button is clicked', async () => {
      const user = userEvent.setup();
      setMockDemoLoginState({ showDialog: true });
      renderWithRouter(<LoginPage />);

      const closeButton = screen.getByTestId('dialog-close');
      await user.click(closeButton);

      expect(mockCloseDemoLogin).toHaveBeenCalledTimes(1);
    });

    it('calls handleDemoLogin when form is submitted', async () => {
      const user = userEvent.setup();
      setMockDemoLoginState({ showDialog: true });
      renderWithRouter(<LoginPage />);

      const submitButton = screen.getByTestId('dialog-submit');
      await user.click(submitButton);

      expect(mockHandleDemoLogin).toHaveBeenCalledTimes(1);
      expect(mockHandleDemoLogin).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@test.no',
        token: 'demo-token',
      });
    });
  });

  describe('Loading State', () => {
    it('renders nothing while auth is loading', () => {
      setMockAuthState({ isLoading: true });
      renderWithRouter(<LoginPage />);

      expect(screen.queryByTestId('login-layout')).not.toBeInTheDocument();
    });

    it('does not redirect while loading', () => {
      setMockAuthState({ isLoading: true, isAuthenticated: true });
      renderWithRouter(<LoginPage />);

      expect(screen.getByTestId('location')).toHaveTextContent('/login');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Redirect When Authenticated', () => {
    it('redirects to dashboard when user is already authenticated', async () => {
      setMockAuthState({ isAuthenticated: true, isLoading: false });
      renderWithRouter(<LoginPage />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    it('redirects to intended destination when from state is provided', async () => {
      setMockAuthState({ isAuthenticated: true, isLoading: false });
      renderWithRouter(<LoginPage />, { from: '/subscription' });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/subscription', { replace: true });
      });
    });

    it('does not redirect when user is not authenticated', async () => {
      setMockAuthState({ isAuthenticated: false, isLoading: false });
      renderWithRouter(<LoginPage />);

      // Wait a tick to ensure useEffect has run
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it('renders login options when user is not authenticated', () => {
      setMockAuthState({ isAuthenticated: false, isLoading: false });
      renderWithRouter(<LoginPage />);

      expect(screen.getByTestId('login-layout')).toBeInTheDocument();
      expect(screen.getByTestId('login-options')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles transition from loading to authenticated', async () => {
      // Start with loading state
      setMockAuthState({ isLoading: true, isAuthenticated: false });

      const { rerender } = render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<div>Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByTestId('login-layout')).not.toBeInTheDocument();

      // Transition to authenticated
      setMockAuthState({ isLoading: false, isAuthenticated: true });

      rerender(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<div>Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    it('handles transition from loading to unauthenticated', async () => {
      // Start with loading state
      setMockAuthState({ isLoading: true, isAuthenticated: false });

      const { rerender } = render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByTestId('login-layout')).not.toBeInTheDocument();

      // Transition to unauthenticated
      setMockAuthState({ isLoading: false, isAuthenticated: false });

      rerender(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('login-layout')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('handles missing from state gracefully', async () => {
      setMockAuthState({ isAuthenticated: true, isLoading: false });

      render(
        <MemoryRouter initialEntries={[{ pathname: '/login' }]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<div>Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    it('handles null from state gracefully', async () => {
      setMockAuthState({ isAuthenticated: true, isLoading: false });

      render(
        <MemoryRouter initialEntries={[{ pathname: '/login', state: null }]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<div>Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });
  });
});
