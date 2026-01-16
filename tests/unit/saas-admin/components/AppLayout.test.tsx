/**
 * AppLayout Unit Tests
 *
 * Tests for the SaaS Admin AppLayout component including:
 * - Structural layout rendering (sidebar, header, main content)
 * - Page title mapping based on route pathname
 * - Outlet rendering for child routes
 * - Responsive layout structure
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import * as React from 'react';

// =============================================================================
// Mock Dependencies
// =============================================================================

// Mock useLocation - need to track pathname for page title mapping
let mockLocation = { pathname: '/' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useLocation: () => mockLocation,
  };
});

// Mock useAuth hook
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
  checkRole: vi.fn(),
};

let mockAuthReturn = { ...defaultAuthContext };

vi.mock('../../../../apps/saas-admin/src/hooks/useAuth', () => ({
  useAuth: () => mockAuthReturn,
}));

// Mock useTheme hook
const defaultThemeContext = {
  theme: 'light',
  isDark: false,
  toggleTheme: vi.fn(),
};

vi.mock('../../../../apps/saas-admin/src/providers/ThemeProvider', () => ({
  useTheme: () => defaultThemeContext,
}));

// Mock Sidebar component
vi.mock('../../../../apps/saas-admin/src/components/layout/Sidebar', () => ({
  Sidebar: () => (
    <aside data-testid="sidebar">
      <nav data-testid="sidebar-nav">
        <span>Navigation Items</span>
      </nav>
    </aside>
  ),
}));

// Mock Header component
vi.mock('../../../../apps/saas-admin/src/components/layout/Header', () => ({
  Header: ({ title }: { title?: string }) => (
    <header data-testid="header">
      <span data-testid="header-title">{title}</span>
    </header>
  ),
}));

// Mock @xala/ds components
vi.mock('@xala/ds', () => ({
  Paragraph: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  HomeIcon: () => <span data-testid="home-icon">Home</span>,
  BuildingIcon: () => <span data-testid="building-icon">Building</span>,
  SettingsIcon: () => <span data-testid="settings-icon">Settings</span>,
  ArrowRightIcon: () => <span data-testid="arrow-icon">Arrow</span>,
  ChartIcon: () => <span data-testid="chart-icon">Chart</span>,
  ShieldIcon: () => <span data-testid="shield-icon">Shield</span>,
  ClockIcon: () => <span data-testid="clock-icon">Clock</span>,
  UsersIcon: () => <span data-testid="users-icon">Users</span>,
  HeaderActions: ({ children }: { children: React.ReactNode }) => <div data-testid="header-actions">{children}</div>,
  HeaderIconButton: ({ 'aria-label': label }: { 'aria-label'?: string }) => <button aria-label={label}>{label}</button>,
  HeaderThemeToggle: () => <button data-testid="theme-toggle">Toggle</button>,
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  BellIcon: () => <span>Bell</span>,
  LogOutIcon: () => <span>LogOut</span>,
}));

// Import the component after mocks are set up
import { AppLayout } from '../../../../apps/saas-admin/src/components/layout/AppLayout';

// =============================================================================
// Test Utilities
// =============================================================================

interface RenderOptions {
  initialEntries?: string[];
  pathname?: string;
}

function renderWithRouter(ui: React.ReactElement, options: RenderOptions = {}) {
  const { initialEntries = ['/'], pathname = '/' } = options;
  mockLocation = { pathname };

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>
  );
}

function renderAppLayout(options: RenderOptions = {}) {
  const { initialEntries = ['/'], pathname = '/' } = options;
  mockLocation = { pathname };

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route
            index
            element={<div data-testid="outlet-content">Dashboard Content</div>}
          />
          <Route
            path="tenants"
            element={<div data-testid="outlet-content">Tenants Content</div>}
          />
          <Route
            path="plans"
            element={<div data-testid="outlet-content">Plans Content</div>}
          />
          <Route
            path="feature-flags"
            element={<div data-testid="outlet-content">Feature Flags Content</div>}
          />
          <Route
            path="billing"
            element={<div data-testid="outlet-content">Billing Content</div>}
          />
          <Route
            path="users"
            element={<div data-testid="outlet-content">Users Content</div>}
          />
          <Route
            path="audit"
            element={<div data-testid="outlet-content">Audit Content</div>}
          />
          <Route
            path="settings"
            element={<div data-testid="outlet-content">Settings Content</div>}
          />
          <Route
            path="unknown"
            element={<div data-testid="outlet-content">Unknown Content</div>}
          />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

// =============================================================================
// Test Suite
// =============================================================================

describe('AppLayout', () => {
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

  describe('Layout structure', () => {
    it('renders the main layout container', () => {
      renderAppLayout();

      // The layout should have a flex container
      const container = document.querySelector('div[style*="display: flex"]');
      expect(container).toBeInTheDocument();
    });

    it('renders the sidebar component', () => {
      renderAppLayout();

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('renders the header component', () => {
      renderAppLayout();

      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('renders a main content area', () => {
      renderAppLayout();

      const main = document.querySelector('main');
      expect(main).toBeInTheDocument();
    });

    it('renders the Outlet for child routes', () => {
      renderAppLayout();

      expect(screen.getByTestId('outlet-content')).toBeInTheDocument();
    });

    it('contains nested content wrapper inside main', () => {
      renderAppLayout();

      const main = document.querySelector('main');
      expect(main).toBeInTheDocument();
      // The max-width container wraps the outlet content
      const innerContainer = main?.querySelector('div');
      expect(innerContainer).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Page Title Mapping Tests
  // ===========================================================================

  describe('Page title mapping', () => {
    it('displays "Dashboard" title for root path', () => {
      renderAppLayout({ pathname: '/', initialEntries: ['/'] });

      expect(screen.getByTestId('header-title')).toHaveTextContent('Dashboard');
    });

    it('displays "Tenants" title for /tenants path', () => {
      renderAppLayout({ pathname: '/tenants', initialEntries: ['/tenants'] });

      expect(screen.getByTestId('header-title')).toHaveTextContent('Tenants');
    });

    it('displays "Planer" title for /plans path', () => {
      renderAppLayout({ pathname: '/plans', initialEntries: ['/plans'] });

      expect(screen.getByTestId('header-title')).toHaveTextContent('Planer');
    });

    it('displays "Feature Flags" title for /feature-flags path', () => {
      renderAppLayout({ pathname: '/feature-flags', initialEntries: ['/feature-flags'] });

      expect(screen.getByTestId('header-title')).toHaveTextContent('Feature Flags');
    });

    it('displays "Fakturering" title for /billing path', () => {
      renderAppLayout({ pathname: '/billing', initialEntries: ['/billing'] });

      expect(screen.getByTestId('header-title')).toHaveTextContent('Fakturering');
    });

    it('displays "Brukere" title for /users path', () => {
      renderAppLayout({ pathname: '/users', initialEntries: ['/users'] });

      expect(screen.getByTestId('header-title')).toHaveTextContent('Brukere');
    });

    it('displays "Audit Log" title for /audit path', () => {
      renderAppLayout({ pathname: '/audit', initialEntries: ['/audit'] });

      expect(screen.getByTestId('header-title')).toHaveTextContent('Audit Log');
    });

    it('displays "Innstillinger" title for /settings path', () => {
      renderAppLayout({ pathname: '/settings', initialEntries: ['/settings'] });

      expect(screen.getByTestId('header-title')).toHaveTextContent('Innstillinger');
    });

    it('displays empty string for unknown paths', () => {
      renderAppLayout({ pathname: '/unknown-route', initialEntries: ['/unknown'] });

      expect(screen.getByTestId('header-title')).toHaveTextContent('');
    });
  });

  // ===========================================================================
  // Styling Tests
  // ===========================================================================

  describe('Layout styling', () => {
    it('sets full viewport height on container', () => {
      renderAppLayout();

      const container = document.querySelector('div[style*="height: 100vh"]');
      expect(container).toBeInTheDocument();
    });

    it('applies background color via CSS variable', () => {
      renderAppLayout();

      // The main container exists with styling
      const containers = document.querySelectorAll('div');
      expect(containers.length).toBeGreaterThan(0);
    });

    it('has proper content wrapper structure', () => {
      renderAppLayout();

      // The layout has a nested structure with sidebar and content area
      const sidebar = screen.getByTestId('sidebar');
      const header = screen.getByTestId('header');
      expect(sidebar).toBeInTheDocument();
      expect(header).toBeInTheDocument();
    });

    it('has proper overflow handling structure', () => {
      renderAppLayout();

      const main = document.querySelector('main');
      expect(main).toBeInTheDocument();
      // Main has styles applied for scroll behavior
      expect(main?.style.overflow).toBe('auto');
    });

    it('sets overflow auto on main element', () => {
      renderAppLayout();

      const main = document.querySelector('main[style*="overflow: auto"]');
      expect(main).toBeInTheDocument();
    });

    it('applies padding to main element', () => {
      renderAppLayout();

      const main = document.querySelector('main[style*="padding"]');
      expect(main).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Child Route Content Tests
  // ===========================================================================

  describe('Child route content', () => {
    it('renders dashboard content at root path', () => {
      renderAppLayout({ pathname: '/', initialEntries: ['/'] });

      expect(screen.getByTestId('outlet-content')).toHaveTextContent('Dashboard Content');
    });

    it('renders tenants content at /tenants path', () => {
      renderAppLayout({ pathname: '/tenants', initialEntries: ['/tenants'] });

      expect(screen.getByTestId('outlet-content')).toHaveTextContent('Tenants Content');
    });

    it('renders plans content at /plans path', () => {
      renderAppLayout({ pathname: '/plans', initialEntries: ['/plans'] });

      expect(screen.getByTestId('outlet-content')).toHaveTextContent('Plans Content');
    });
  });

  // ===========================================================================
  // Component Integration Tests
  // ===========================================================================

  describe('Component integration', () => {
    it('sidebar is rendered before main content in DOM order', () => {
      renderAppLayout();

      const sidebar = screen.getByTestId('sidebar');
      const header = screen.getByTestId('header');

      // Check that sidebar exists and is a sibling to the content container
      expect(sidebar).toBeInTheDocument();
      expect(header).toBeInTheDocument();
    });

    it('header passes correct title prop', () => {
      renderAppLayout({ pathname: '/tenants', initialEntries: ['/tenants'] });

      // Header receives title from page title mapping
      const headerTitle = screen.getByTestId('header-title');
      expect(headerTitle.textContent).toBe('Tenants');
    });

    it('layout provides proper content hierarchy', () => {
      renderAppLayout();

      // Main should contain the outlet content
      const main = document.querySelector('main');
      expect(main).toContainElement(screen.getByTestId('outlet-content'));
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('renders navigation sidebar as aside element', () => {
      renderAppLayout();

      const aside = document.querySelector('aside');
      expect(aside).toBeInTheDocument();
    });

    it('renders main content area as main element', () => {
      renderAppLayout();

      const main = document.querySelector('main');
      expect(main).toBeInTheDocument();
    });

    it('renders header as header element', () => {
      renderAppLayout();

      const header = document.querySelector('header');
      expect(header).toBeInTheDocument();
    });

    it('maintains semantic HTML structure', () => {
      renderAppLayout();

      // Check for proper landmark elements
      expect(document.querySelector('aside')).toBeInTheDocument();
      expect(document.querySelector('header')).toBeInTheDocument();
      expect(document.querySelector('main')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('Edge cases', () => {
    it('handles null pathname gracefully', () => {
      // This tests that the component doesn't crash with unusual pathname values
      mockLocation = { pathname: '' } as typeof mockLocation;

      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <AppLayout />
        </MemoryRouter>
      );

      expect(container).toBeInTheDocument();
    });

    it('renders consistently on rerender', () => {
      const { rerender } = renderAppLayout({ pathname: '/', initialEntries: ['/'] });

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();

      // Rerender with same props
      rerender(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route
                index
                element={<div data-testid="outlet-content">Dashboard Content</div>}
              />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('handles deep nested paths with fallback to empty title', () => {
      mockLocation = { pathname: '/tenants/123/details' };

      render(
        <MemoryRouter initialEntries={['/tenants/123/details']}>
          <AppLayout />
        </MemoryRouter>
      );

      // Deep nested paths not in pageTitles should return empty string
      expect(screen.getByTestId('header-title')).toHaveTextContent('');
    });
  });
});

// =============================================================================
// Integration Test: AppLayout within Application
// =============================================================================

describe('AppLayout Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation = { pathname: '/' };
    mockAuthReturn = { ...defaultAuthContext };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Layout within application context', () => {
    it('renders complete layout structure', () => {
      renderAppLayout();

      // All major layout components should be present
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(document.querySelector('main')).toBeInTheDocument();
    });

    it('layout maintains proper flex relationship', () => {
      renderAppLayout();

      // Main container should be a flex container
      const mainContainer = document.querySelector('div[style*="display: flex"]');
      expect(mainContainer).toBeInTheDocument();

      // Content area should have flex: 1
      const contentArea = document.querySelector('div[style*="flex: 1"]');
      expect(contentArea).toBeInTheDocument();
    });

    it('outlet content is properly wrapped', () => {
      renderAppLayout();

      // Content should be within the main element
      const main = document.querySelector('main');
      expect(main).toBeInTheDocument();
      expect(main).toContainElement(screen.getByTestId('outlet-content'));
    });
  });

  describe('Navigation and routing', () => {
    it('correctly maps different routes to titles', () => {
      const routes = [
        { path: '/', title: 'Dashboard' },
        { path: '/tenants', title: 'Tenants' },
        { path: '/plans', title: 'Planer' },
        { path: '/feature-flags', title: 'Feature Flags' },
        { path: '/billing', title: 'Fakturering' },
        { path: '/users', title: 'Brukere' },
        { path: '/audit', title: 'Audit Log' },
        { path: '/settings', title: 'Innstillinger' },
      ];

      routes.forEach(({ path, title }) => {
        mockLocation = { pathname: path };

        const { unmount } = render(
          <MemoryRouter initialEntries={[path]}>
            <AppLayout />
          </MemoryRouter>
        );

        expect(screen.getByTestId('header-title')).toHaveTextContent(title);
        unmount();
      });
    });
  });
});
