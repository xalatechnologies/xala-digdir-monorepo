/**
 * LoginPage Unit Tests
 *
 * Tests for the SaaS Admin LoginPage component including:
 * - Initial rendering of login options
 * - Authentication state handling
 * - Post-login redirect behavior
 * - Login provider click handlers
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import * as React from 'react';

// =============================================================================
// Mock Dependencies
// =============================================================================

// Mock useNavigate - need to track calls
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useAuth hook
const mockLogin = vi.fn();
const mockLogout = vi.fn();

const defaultAuthContext = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isSuperAdmin: false,
  isBillingAdmin: false,
  isSupportAgent: false,
  login: mockLogin,
  logout: mockLogout,
  checkRole: vi.fn(),
};

let mockAuthReturn = { ...defaultAuthContext };

vi.mock('../../../../apps/saas-admin/src/hooks/useAuth', () => ({
  useAuth: () => mockAuthReturn,
}));

// Mock useT hook from @xala/i18n
vi.mock('@xala/i18n', () => ({
  useT: () => (key: string, params?: Record<string, string>) => {
    // Return test-friendly translations
    const translations: Record<string, string> = {
      'saasAdmin.login.brandName': 'SaaS Admin',
      'saasAdmin.login.brandTagline': 'Platform Administration',
      'saasAdmin.login.title': 'Log in',
      'saasAdmin.login.subtitle': 'Choose a login method to continue',
      'saasAdmin.login.panelTitle': 'Platform Admin',
      'saasAdmin.login.panelSubtitle': 'Complete Platform Management',
      'saasAdmin.login.panelDescription': 'Manage tenants, plans, and platform settings',
      'saasAdmin.login.feature.tenantAdmin.title': 'Tenant Management',
      'saasAdmin.login.feature.tenantAdmin.description': 'Manage all platform tenants',
      'saasAdmin.login.feature.platformConfig.title': 'Platform Configuration',
      'saasAdmin.login.feature.platformConfig.description': 'Configure platform settings',
      'saasAdmin.login.feature.security.title': 'Security & Compliance',
      'saasAdmin.login.feature.security.description': 'Enterprise-grade security',
      'saasAdmin.login.integration.multiTenant': 'Multi-tenant',
      'saasAdmin.login.integration.rbac': 'RBAC',
      'saasAdmin.login.integration.auditTrail': 'Audit Trail',
      'saasAdmin.login.integration.iso27001': 'ISO 27001',
      'saasAdmin.login.footer.privacy': 'Privacy',
      'saasAdmin.login.footer.terms': 'Terms',
      'saasAdmin.login.footer.support': 'Support',
      'saasAdmin.login.option.idporten.title': 'ID-porten',
      'saasAdmin.login.option.idporten.description': 'Login with BankID',
      'saasAdmin.login.option.internal.title': 'Internal SSO',
      'saasAdmin.login.option.internal.description': 'For Digilist employees',
    };

    let translation = translations[key] || key;

    // Handle parameters like {year}
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{${paramKey}}`, paramValue);
      });
    }

    if (key === 'saasAdmin.login.copyright') {
      return `© ${params?.year || '2025'} Digilist. All rights reserved.`;
    }

    return translation;
  },
}));

// Mock @xala/ds components
vi.mock('@xala/ds', () => ({
  LoginLayout: ({
    children,
    brandName,
    title,
    subtitle,
    features,
    integrations,
    footerLinks,
    copyright,
  }: {
    children: React.ReactNode;
    brandName?: string;
    brandTagline?: string;
    title?: string;
    subtitle?: string;
    panelTitle?: string;
    panelSubtitle?: string;
    panelDescription?: string;
    features?: Array<{ icon: React.ReactNode; title: string; description: string }>;
    integrations?: string[];
    footerLinks?: Array<{ href: string; label: string }>;
    copyright?: string;
  }) => (
    <div data-testid="login-layout">
      <div data-testid="brand-name">{brandName}</div>
      <h1 data-testid="login-title">{title}</h1>
      <p data-testid="login-subtitle">{subtitle}</p>
      <div data-testid="login-options">{children}</div>
      <div data-testid="features">
        {features?.map((f) => (
          <div key={f.title} data-testid={`feature-${f.title}`}>
            {f.title}: {f.description}
          </div>
        ))}
      </div>
      <div data-testid="integrations">
        {integrations?.map((i) => (
          <span key={i} data-testid={`integration-${i}`}>
            {i}
          </span>
        ))}
      </div>
      <div data-testid="footer">
        {footerLinks?.map((l) => (
          <a key={l.href} href={l.href} data-testid={`footer-link-${l.label}`}>
            {l.label}
          </a>
        ))}
        <span data-testid="copyright">{copyright}</span>
      </div>
    </div>
  ),
  LoginOption: ({
    title,
    description,
    onClick,
    icon,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
  }) => (
    <button
      type="button"
      data-testid={`login-option-${title.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
    >
      <span data-testid="icon">{icon}</span>
      <span data-testid="title">{title}</span>
      <span data-testid="description">{description}</span>
    </button>
  ),
  IdPortenIcon: () => <span data-testid="idporten-icon">ID-porten Icon</span>,
  MicrosoftIcon: () => <span data-testid="microsoft-icon">Microsoft Icon</span>,
  ShieldCheckIcon: () => <span data-testid="shield-icon">Shield Icon</span>,
  BuildingIcon: () => <span data-testid="building-icon">Building Icon</span>,
  SettingsIcon: () => <span data-testid="settings-icon">Settings Icon</span>,
}));

// Import the component after mocks are set up
import { LoginPage } from '../../../../apps/saas-admin/src/routes/login';

// =============================================================================
// Test Utilities
// =============================================================================

interface RenderOptions {
  initialEntries?: string[];
}

function renderWithRouter(ui: React.ReactElement, options: RenderOptions = {}) {
  const { initialEntries = ['/login'] } = options;

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>
  );
}

// =============================================================================
// Test Suite
// =============================================================================

describe('LoginPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    mockAuthReturn = { ...defaultAuthContext };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe('Basic rendering', () => {
    it('renders login layout when not authenticated', () => {
      renderWithRouter(<LoginPage />);

      expect(screen.getByTestId('login-layout')).toBeInTheDocument();
      expect(screen.getByTestId('login-title')).toHaveTextContent('Log in');
      expect(screen.getByTestId('login-subtitle')).toHaveTextContent('Choose a login method to continue');
    });

    it('renders brand name from i18n', () => {
      renderWithRouter(<LoginPage />);

      expect(screen.getByTestId('brand-name')).toHaveTextContent('SaaS Admin');
    });

    it('renders ID-porten login option', () => {
      renderWithRouter(<LoginPage />);

      const idPortenOption = screen.getByTestId('login-option-id-porten');
      expect(idPortenOption).toBeInTheDocument();
    });

    it('renders Internal SSO login option', () => {
      renderWithRouter(<LoginPage />);

      const internalOption = screen.getByTestId('login-option-internal-sso');
      expect(internalOption).toBeInTheDocument();
    });

    it('renders features section', () => {
      renderWithRouter(<LoginPage />);

      expect(screen.getByTestId('feature-Tenant Management')).toBeInTheDocument();
      expect(screen.getByTestId('feature-Platform Configuration')).toBeInTheDocument();
      expect(screen.getByTestId('feature-Security & Compliance')).toBeInTheDocument();
    });

    it('renders integrations section', () => {
      renderWithRouter(<LoginPage />);

      expect(screen.getByTestId('integration-Multi-tenant')).toBeInTheDocument();
      expect(screen.getByTestId('integration-RBAC')).toBeInTheDocument();
      expect(screen.getByTestId('integration-Audit Trail')).toBeInTheDocument();
      expect(screen.getByTestId('integration-ISO 27001')).toBeInTheDocument();
    });

    it('renders footer links', () => {
      renderWithRouter(<LoginPage />);

      expect(screen.getByTestId('footer-link-Privacy')).toBeInTheDocument();
      expect(screen.getByTestId('footer-link-Terms')).toBeInTheDocument();
      expect(screen.getByTestId('footer-link-Support')).toBeInTheDocument();
    });

    it('renders copyright with current year', () => {
      renderWithRouter(<LoginPage />);

      const copyright = screen.getByTestId('copyright');
      const currentYear = new Date().getFullYear().toString();
      expect(copyright.textContent).toContain(currentYear);
    });
  });

  // ===========================================================================
  // Loading State Tests
  // ===========================================================================

  describe('Loading state', () => {
    it('renders nothing when auth is loading', () => {
      mockAuthReturn = { ...defaultAuthContext, isLoading: true };

      const { container } = renderWithRouter(<LoginPage />);

      // Should render empty fragment
      expect(container.querySelector('[data-testid="login-layout"]')).toBeNull();
    });
  });

  // ===========================================================================
  // Authenticated State Tests
  // ===========================================================================

  describe('Authenticated state', () => {
    it('renders nothing when already authenticated', () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };

      const { container } = renderWithRouter(<LoginPage />);

      // Should render empty fragment (redirect will happen in useEffect)
      expect(container.querySelector('[data-testid="login-layout"]')).toBeNull();
    });

    it('redirects to dashboard when authenticated', async () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };

      renderWithRouter(<LoginPage />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });
  });

  // ===========================================================================
  // Interaction Tests
  // ===========================================================================

  describe('Login interactions', () => {
    it('calls login with idporten when ID-porten option is clicked', () => {
      renderWithRouter(<LoginPage />);

      const idPortenOption = screen.getByTestId('login-option-id-porten');
      fireEvent.click(idPortenOption);

      expect(mockLogin).toHaveBeenCalledWith('idporten');
      expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    it('calls login with internal when Internal SSO option is clicked', () => {
      renderWithRouter(<LoginPage />);

      const internalOption = screen.getByTestId('login-option-internal-sso');
      fireEvent.click(internalOption);

      expect(mockLogin).toHaveBeenCalledWith('internal');
      expect(mockLogin).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Icon Tests
  // ===========================================================================

  describe('Icons', () => {
    it('renders ID-porten icon', () => {
      renderWithRouter(<LoginPage />);

      expect(screen.getByTestId('idporten-icon')).toBeInTheDocument();
    });

    it('renders Microsoft icon for internal SSO', () => {
      renderWithRouter(<LoginPage />);

      expect(screen.getByTestId('microsoft-icon')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('Edge cases', () => {
    it('does not redirect when loading even if authenticated flag is true', () => {
      // This tests the guard clause in useEffect
      mockAuthReturn = { ...defaultAuthContext, isLoading: true, isAuthenticated: true };

      renderWithRouter(<LoginPage />);

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('does not call navigate when not authenticated', () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: false };

      renderWithRouter(<LoginPage />);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
