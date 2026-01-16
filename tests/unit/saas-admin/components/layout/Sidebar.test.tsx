/**
 * Sidebar Component Unit Tests
 *
 * Tests for the SaaS Admin Sidebar component including:
 * - Navigation rendering
 * - Role-based visibility
 * - Active state handling
 * - User info display
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as React from 'react';

// =============================================================================
// Mock Dependencies
// =============================================================================

// Mock useLocation
let mockLocation = { pathname: '/' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useLocation: () => mockLocation,
    NavLink: ({
      to,
      children,
      className,
      style,
      end
    }: {
      to: string;
      children: React.ReactNode;
      className?: string;
      style?: React.CSSProperties;
      end?: boolean;
    }) => (
      <a
        href={to}
        data-testid={`navlink-${to.replace(/\//g, '-').replace(/^-/, '')}`}
        className={className}
        style={style}
        data-end={end}
      >
        {children}
      </a>
    ),
  };
});

// Mock useAuth hook with different roles
type SaasAdminRole = 'SAAS_SUPER_ADMIN' | 'SAAS_BILLING_ADMIN' | 'SAAS_SUPPORT_AGENT';

interface MockUser {
  id: string;
  email: string;
  name: string;
  role: SaasAdminRole;
}

const defaultAuthContext = {
  user: {
    id: 'test-user-id',
    email: 'admin@digilist.no',
    name: 'Test Admin',
    role: 'SAAS_SUPER_ADMIN' as SaasAdminRole,
  } as MockUser,
  isLoading: false,
  isAuthenticated: true,
  isSuperAdmin: true,
  isBillingAdmin: false,
  isSupportAgent: false,
  login: vi.fn(),
  logout: vi.fn(),
  checkRole: vi.fn(),
};

let mockAuthReturn = { ...defaultAuthContext };

vi.mock('../../../../../apps/saas-admin/src/hooks/useAuth', () => ({
  useAuth: () => mockAuthReturn,
}));

// Mock @xala/ds components
vi.mock('@xala/ds', () => ({
  Paragraph: ({
    children,
    'data-size': dataSize,
    style
  }: {
    children: React.ReactNode;
    'data-size'?: string;
    style?: React.CSSProperties;
  }) => (
    <p data-testid="paragraph" data-size={dataSize} style={style}>{children}</p>
  ),
  HomeIcon: () => <span data-testid="home-icon">Home</span>,
  BuildingIcon: () => <span data-testid="building-icon">Building</span>,
  SettingsIcon: () => <span data-testid="settings-icon">Settings</span>,
  ArrowRightIcon: () => <span data-testid="arrow-icon">Arrow</span>,
  ChartIcon: () => <span data-testid="chart-icon">Chart</span>,
  ShieldIcon: () => <span data-testid="shield-icon">Shield</span>,
  ClockIcon: () => <span data-testid="clock-icon">Clock</span>,
  UsersIcon: () => <span data-testid="users-icon">Users</span>,
}));

// Import component after mocks
import { Sidebar } from '../../../../../apps/saas-admin/src/components/layout/Sidebar';

// =============================================================================
// Test Utilities
// =============================================================================

function renderSidebar(pathname: string = '/') {
  mockLocation = { pathname };
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Sidebar />
    </MemoryRouter>
  );
}

// =============================================================================
// Test Suite
// =============================================================================

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation = { pathname: '/' };
    mockAuthReturn = { ...defaultAuthContext };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Structure Tests
  // ===========================================================================

  describe('Structure', () => {
    it('renders as an aside element', () => {
      renderSidebar();

      const aside = document.querySelector('aside');
      expect(aside).toBeInTheDocument();
    });

    it('renders the logo section', () => {
      renderSidebar();

      const logo = document.querySelector('img[alt="Digilist"]');
      expect(logo).toBeInTheDocument();
    });

    it('renders DIGILIST brand text', () => {
      renderSidebar();

      expect(screen.getByText('DIGILIST')).toBeInTheDocument();
    });

    it('renders SaaS Admin subtitle', () => {
      renderSidebar();

      expect(screen.getByText('SaaS Admin')).toBeInTheDocument();
    });

    it('renders navigation element', () => {
      renderSidebar();

      const nav = document.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });

    it('renders navigation items as list', () => {
      renderSidebar();

      const lists = document.querySelectorAll('ul');
      expect(lists.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // Navigation Items Tests
  // ===========================================================================

  describe('Navigation Items', () => {
    it('renders Dashboard link', () => {
      renderSidebar();

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Plattformoversikt')).toBeInTheDocument();
    });

    it('renders Tenants link', () => {
      renderSidebar();

      expect(screen.getByText('Tenants')).toBeInTheDocument();
      expect(screen.getByText('Administrer leietakere')).toBeInTheDocument();
    });

    it('renders Plans link for super admin', () => {
      renderSidebar();

      expect(screen.getByText('Planer')).toBeInTheDocument();
      expect(screen.getByText('Abonnementsplaner')).toBeInTheDocument();
    });

    it('renders Feature Flags link for super admin', () => {
      renderSidebar();

      expect(screen.getByText('Feature Flags')).toBeInTheDocument();
      expect(screen.getByText('Funksjonsbrytere')).toBeInTheDocument();
    });

    it('renders Billing link for super admin', () => {
      renderSidebar();

      expect(screen.getByText('Fakturering')).toBeInTheDocument();
      expect(screen.getByText('Oversikt og fakturaer')).toBeInTheDocument();
    });

    it('renders Users link', () => {
      renderSidebar();

      expect(screen.getByText('Brukere')).toBeInTheDocument();
      expect(screen.getByText('Plattformbrukere')).toBeInTheDocument();
    });

    it('renders Audit Log link for super admin', () => {
      renderSidebar();

      expect(screen.getByText('Audit Log')).toBeInTheDocument();
      expect(screen.getByText('Systemhendelser')).toBeInTheDocument();
    });

    it('renders Settings link for super admin', () => {
      renderSidebar();

      expect(screen.getByText('Innstillinger')).toBeInTheDocument();
      expect(screen.getByText('Plattformkonfigurasjon')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Section Headers Tests
  // ===========================================================================

  describe('Section Headers', () => {
    it('renders Administrasjon section header', () => {
      renderSidebar();

      expect(screen.getByText('Administrasjon')).toBeInTheDocument();
    });

    it('renders Finans section header', () => {
      renderSidebar();

      expect(screen.getByText('Finans')).toBeInTheDocument();
    });

    it('renders Support section header', () => {
      renderSidebar();

      expect(screen.getByText('Support')).toBeInTheDocument();
    });

    it('renders System section header', () => {
      renderSidebar();

      expect(screen.getByText('System')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Role-Based Visibility Tests
  // ===========================================================================

  describe('Role-Based Visibility', () => {
    describe('Super Admin', () => {
      beforeEach(() => {
        mockAuthReturn = {
          ...defaultAuthContext,
          user: { ...defaultAuthContext.user, role: 'SAAS_SUPER_ADMIN' },
          isSuperAdmin: true,
        };
      });

      it('shows all navigation items', () => {
        renderSidebar();

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Tenants')).toBeInTheDocument();
        expect(screen.getByText('Planer')).toBeInTheDocument();
        expect(screen.getByText('Feature Flags')).toBeInTheDocument();
        expect(screen.getByText('Fakturering')).toBeInTheDocument();
        expect(screen.getByText('Brukere')).toBeInTheDocument();
        expect(screen.getByText('Audit Log')).toBeInTheDocument();
        expect(screen.getByText('Innstillinger')).toBeInTheDocument();
      });
    });

    describe('Billing Admin', () => {
      beforeEach(() => {
        mockAuthReturn = {
          ...defaultAuthContext,
          user: { ...defaultAuthContext.user, role: 'SAAS_BILLING_ADMIN' },
          isSuperAdmin: false,
          isBillingAdmin: true,
        };
      });

      it('shows Dashboard and Tenants', () => {
        renderSidebar();

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Tenants')).toBeInTheDocument();
      });

      it('shows Planer for billing admin', () => {
        renderSidebar();

        expect(screen.getByText('Planer')).toBeInTheDocument();
      });

      it('shows Fakturering for billing admin', () => {
        renderSidebar();

        expect(screen.getByText('Fakturering')).toBeInTheDocument();
      });

      it('hides Feature Flags from billing admin', () => {
        renderSidebar();

        expect(screen.queryByText('Feature Flags')).not.toBeInTheDocument();
      });

      it('hides Audit Log from billing admin', () => {
        renderSidebar();

        expect(screen.queryByText('Audit Log')).not.toBeInTheDocument();
      });

      it('hides Innstillinger from billing admin', () => {
        renderSidebar();

        expect(screen.queryByText('Innstillinger')).not.toBeInTheDocument();
      });
    });

    describe('Support Agent', () => {
      beforeEach(() => {
        mockAuthReturn = {
          ...defaultAuthContext,
          user: { ...defaultAuthContext.user, role: 'SAAS_SUPPORT_AGENT' },
          isSuperAdmin: false,
          isBillingAdmin: false,
          isSupportAgent: true,
        };
      });

      it('shows Dashboard and Tenants', () => {
        renderSidebar();

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Tenants')).toBeInTheDocument();
      });

      it('shows Brukere for support agent', () => {
        renderSidebar();

        expect(screen.getByText('Brukere')).toBeInTheDocument();
      });

      it('hides Planer from support agent', () => {
        renderSidebar();

        expect(screen.queryByText('Planer')).not.toBeInTheDocument();
      });

      it('hides Feature Flags from support agent', () => {
        renderSidebar();

        expect(screen.queryByText('Feature Flags')).not.toBeInTheDocument();
      });

      it('hides Fakturering from support agent', () => {
        renderSidebar();

        expect(screen.queryByText('Fakturering')).not.toBeInTheDocument();
      });

      it('hides Audit Log from support agent', () => {
        renderSidebar();

        expect(screen.queryByText('Audit Log')).not.toBeInTheDocument();
      });

      it('hides Innstillinger from support agent', () => {
        renderSidebar();

        expect(screen.queryByText('Innstillinger')).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Active State Tests
  // ===========================================================================

  describe('Active State', () => {
    it('Dashboard link has correct href', () => {
      renderSidebar('/');

      const link = screen.getByTestId('navlink-');
      expect(link).toHaveAttribute('href', '/');
    });

    it('Tenants link has correct href', () => {
      renderSidebar('/tenants');

      const link = screen.getByTestId('navlink-tenants');
      expect(link).toHaveAttribute('href', '/tenants');
    });

    it('Plans link has correct href', () => {
      renderSidebar('/plans');

      const link = screen.getByTestId('navlink-plans');
      expect(link).toHaveAttribute('href', '/plans');
    });

    it('Feature Flags link has correct href', () => {
      renderSidebar('/feature-flags');

      const link = screen.getByTestId('navlink-feature-flags');
      expect(link).toHaveAttribute('href', '/feature-flags');
    });
  });

  // ===========================================================================
  // User Info Tests
  // ===========================================================================

  describe('User Info', () => {
    it('displays user info section when user is logged in', () => {
      renderSidebar();

      // User name should be displayed
      expect(screen.getByText('Test Admin')).toBeInTheDocument();
    });

    it('displays user avatar with first letter of name', () => {
      renderSidebar();

      // Avatar shows 'T' for 'Test Admin'
      expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('displays role for super admin', () => {
      mockAuthReturn = {
        ...defaultAuthContext,
        user: { ...defaultAuthContext.user, role: 'SAAS_SUPER_ADMIN' },
      };
      renderSidebar();

      expect(screen.getByText('Super Admin')).toBeInTheDocument();
    });

    it('displays role for billing admin', () => {
      mockAuthReturn = {
        ...defaultAuthContext,
        user: { ...defaultAuthContext.user, role: 'SAAS_BILLING_ADMIN' },
        isSuperAdmin: false,
        isBillingAdmin: true,
      };
      renderSidebar();

      expect(screen.getByText('Billing Admin')).toBeInTheDocument();
    });

    it('displays role for support agent', () => {
      mockAuthReturn = {
        ...defaultAuthContext,
        user: { ...defaultAuthContext.user, role: 'SAAS_SUPPORT_AGENT' },
        isSuperAdmin: false,
        isSupportAgent: true,
      };
      renderSidebar();

      expect(screen.getByText('Support Agent')).toBeInTheDocument();
    });

    it('does not display user info when no user', () => {
      mockAuthReturn = {
        ...defaultAuthContext,
        user: null as unknown as MockUser,
      };
      renderSidebar();

      // User name should not be displayed
      expect(screen.queryByText('Test Admin')).not.toBeInTheDocument();
    });

    it('displays default Admin role for unknown role', () => {
      mockAuthReturn = {
        ...defaultAuthContext,
        user: { ...defaultAuthContext.user, role: 'UNKNOWN_ROLE' as SaasAdminRole },
        isSuperAdmin: false,
      };
      renderSidebar();

      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Icons Tests
  // ===========================================================================

  describe('Icons', () => {
    it('renders home icon for dashboard', () => {
      renderSidebar();

      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    });

    it('renders building icon for tenants', () => {
      renderSidebar();

      expect(screen.getByTestId('building-icon')).toBeInTheDocument();
    });

    it('renders chart icon for plans', () => {
      renderSidebar();

      const chartIcons = screen.getAllByTestId('chart-icon');
      expect(chartIcons.length).toBeGreaterThan(0);
    });

    it('renders shield icon for feature flags', () => {
      renderSidebar();

      expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
    });

    it('renders users icon for users page', () => {
      renderSidebar();

      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    });

    it('renders clock icon for audit log', () => {
      renderSidebar();

      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    });

    it('renders settings icon for settings page', () => {
      renderSidebar();

      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    });

    it('renders arrow icons for navigation items', () => {
      renderSidebar();

      const arrowIcons = screen.getAllByTestId('arrow-icon');
      expect(arrowIcons.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // Styling Tests
  // ===========================================================================

  describe('Styling', () => {
    it('sidebar has correct width', () => {
      renderSidebar();

      const aside = document.querySelector('aside');
      expect(aside).toHaveStyle({ width: '360px' });
    });

    it('sidebar has flex column direction', () => {
      renderSidebar();

      const aside = document.querySelector('aside');
      expect(aside).toHaveStyle({ flexDirection: 'column' });
    });

    it('sidebar has full height', () => {
      renderSidebar();

      const aside = document.querySelector('aside');
      expect(aside).toHaveStyle({ height: '100%' });
    });

    it('contains style element for hover effects', () => {
      renderSidebar();

      const style = document.querySelector('style');
      expect(style).toBeInTheDocument();
    });

    it('logo section has correct height', () => {
      renderSidebar();

      const logoSection = document.querySelector('div[style*="height: 72px"]');
      expect(logoSection).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Empty Section Filtering Tests
  // ===========================================================================

  describe('Empty Section Filtering', () => {
    it('hides Finans section when billing items are not visible', () => {
      mockAuthReturn = {
        ...defaultAuthContext,
        user: { ...defaultAuthContext.user, role: 'SAAS_SUPPORT_AGENT' },
        isSuperAdmin: false,
      };
      renderSidebar();

      // Finans section should be hidden for support agent
      expect(screen.queryByText('Finans')).not.toBeInTheDocument();
    });

    it('hides System section when system items are not visible', () => {
      mockAuthReturn = {
        ...defaultAuthContext,
        user: { ...defaultAuthContext.user, role: 'SAAS_SUPPORT_AGENT' },
        isSuperAdmin: false,
      };
      renderSidebar();

      // System section should be hidden for support agent
      expect(screen.queryByText('System')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('uses semantic aside element', () => {
      renderSidebar();

      expect(document.querySelector('aside')).toBeInTheDocument();
    });

    it('uses semantic nav element', () => {
      renderSidebar();

      expect(document.querySelector('nav')).toBeInTheDocument();
    });

    it('navigation uses ul list structure', () => {
      renderSidebar();

      const nav = document.querySelector('nav');
      const ul = nav?.querySelector('ul');
      expect(ul).toBeInTheDocument();
    });

    it('each navigation item is in a li element', () => {
      renderSidebar();

      const listItems = document.querySelectorAll('li');
      expect(listItems.length).toBeGreaterThan(0);
    });

    it('logo has alt text', () => {
      renderSidebar();

      const logo = document.querySelector('img');
      expect(logo).toHaveAttribute('alt', 'Digilist');
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('Edge Cases', () => {
    it('handles user with no role gracefully', () => {
      mockAuthReturn = {
        ...defaultAuthContext,
        user: { ...defaultAuthContext.user, role: undefined as unknown as SaasAdminRole },
        isSuperAdmin: false,
      };

      expect(() => renderSidebar()).not.toThrow();
    });

    it('renders consistently on rerender', () => {
      const { rerender } = renderSidebar();

      expect(screen.getByText('Dashboard')).toBeInTheDocument();

      rerender(
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('handles pathname at nested routes', () => {
      expect(() => renderSidebar('/tenants/123')).not.toThrow();
    });
  });
});
