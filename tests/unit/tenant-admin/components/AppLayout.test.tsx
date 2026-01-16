/**
 * AppLayout, Header, and Sidebar Component Unit Tests
 *
 * Tests for the main layout components of the tenant admin app.
 * Covers: structure, rendering, navigation, theme toggle, role-based visibility, and user info.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
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
const mockLogout = vi.fn();
let mockAuthState = {
  user: null as unknown,
  logout: mockLogout,
  isTenantAdmin: false,
};

vi.mock('@xala/auth', () => ({
  useAuth: () => mockAuthState,
}));

// Mock theme state
const mockToggleTheme = vi.fn();
let mockThemeState = {
  isDark: false,
  toggleTheme: mockToggleTheme,
  colorScheme: 'auto' as const,
  setColorScheme: vi.fn(),
  resetToAuto: vi.fn(),
};

vi.mock('../../../../apps/tenant-admin/src/providers/ThemeProvider', () => ({
  useTheme: () => mockThemeState,
}));

// Mock i18n - return the key for testing
vi.mock('@xala/i18n', () => ({
  useT: () => (key: string) => key,
}));

// Mock CSS modules
vi.mock('../../../../apps/tenant-admin/src/components/layout/AppLayout.module.css', () => ({
  default: {
    appLayout: 'appLayout',
    contentArea: 'contentArea',
    mainContent: 'mainContent',
    maxWidthWrapper: 'maxWidthWrapper',
  },
}));

vi.mock('../../../../apps/tenant-admin/src/components/layout/Header.module.css', () => ({
  default: {
    header: 'header',
    headerContent: 'headerContent',
    leftSpacer: 'leftSpacer',
    centerContent: 'centerContent',
    rightActions: 'rightActions',
    divider: 'divider',
    logoutButton: 'logoutButton',
  },
}));

vi.mock('../../../../apps/tenant-admin/src/components/layout/Sidebar.module.css', () => ({
  default: {
    sidebar: 'sidebar',
    logoSection: 'logoSection',
    brandContainer: 'brandContainer',
    logoImage: 'logoImage',
    brandName: 'brandName',
    brandTagline: 'brandTagline',
    navigation: 'navigation',
    navSection: 'navSection',
    navSectionTitle: 'navSectionTitle',
    navList: 'navList',
    sidebarNavItem: 'sidebarNavItem',
    active: 'active',
    sidebarNavIcon: 'sidebarNavIcon',
    sidebarNavTextContent: 'sidebarNavTextContent',
    sidebarNavName: 'sidebarNavName',
    sidebarNavDescription: 'sidebarNavDescription',
    sidebarNavBadgeArrow: 'sidebarNavBadgeArrow',
    sidebarNavBadge: 'sidebarNavBadge',
    sidebarNavArrow: 'sidebarNavArrow',
    userInfoSection: 'userInfoSection',
    userAvatarContainer: 'userAvatarContainer',
    userAvatar: 'userAvatar',
    userDetails: 'userDetails',
    userName: 'userName',
    userRole: 'userRole',
  },
}));

// Mock @xala/ds components
vi.mock('@xala/ds', () => ({
  HeaderActions: ({ children }: { children: ReactNode }) =>
    React.createElement('div', { 'data-testid': 'header-actions' }, children),
  HeaderIconButton: ({
    icon,
    'aria-label': ariaLabel,
    onClick,
  }: {
    icon: ReactNode;
    'aria-label'?: string;
    title?: string;
    size?: string;
    onClick?: () => void;
  }) =>
    React.createElement(
      'button',
      {
        'data-testid': `icon-button-${ariaLabel?.toLowerCase().replace(/\./g, '-')}`,
        'aria-label': ariaLabel,
        onClick,
        type: 'button',
      },
      icon
    ),
  HeaderThemeToggle: ({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) =>
    React.createElement(
      'button',
      {
        'data-testid': 'theme-toggle',
        onClick: onToggle,
        'aria-label': isDark ? 'Switch to light mode' : 'Switch to dark mode',
        type: 'button',
      },
      isDark ? 'Dark' : 'Light'
    ),
  Button: ({
    children,
    onClick,
    'aria-label': ariaLabel,
    type,
  }: {
    children: ReactNode;
    onClick?: () => void;
    'aria-label'?: string;
    variant?: string;
    'data-size'?: string;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
  }) =>
    React.createElement(
      'button',
      {
        onClick,
        'aria-label': ariaLabel,
        type: type || 'button',
      },
      children
    ),
  Paragraph: ({
    children,
    className,
    'data-size': dataSize,
  }: {
    children: ReactNode;
    className?: string;
    'data-size'?: string;
  }) => React.createElement('p', { className, 'data-size': dataSize }, children),
  // Icons
  BellIcon: () => React.createElement('span', { 'data-testid': 'bell-icon' }, 'Bell'),
  SettingsIcon: () => React.createElement('span', { 'data-testid': 'settings-icon' }, 'Settings'),
  LogOutIcon: () => React.createElement('span', { 'data-testid': 'logout-icon' }, 'LogOut'),
  HomeIcon: () => React.createElement('span', { 'data-testid': 'home-icon' }, 'Home'),
  ArrowRightIcon: () => React.createElement('span', { 'data-testid': 'arrow-right-icon' }, '>'),
  ChartIcon: () => React.createElement('span', { 'data-testid': 'chart-icon' }, 'Chart'),
  ClockIcon: () => React.createElement('span', { 'data-testid': 'clock-icon' }, 'Clock'),
  UsersIcon: () => React.createElement('span', { 'data-testid': 'users-icon' }, 'Users'),
  SparklesIcon: () => React.createElement('span', { 'data-testid': 'sparkles-icon' }, 'Sparkles'),
  ShieldIcon: () => React.createElement('span', { 'data-testid': 'shield-icon' }, 'Shield'),
}));

// Import components after mocks
import { AppLayout } from '../../../../apps/tenant-admin/src/components/layout/AppLayout';
import { Header } from '../../../../apps/tenant-admin/src/components/layout/Header';
import { Sidebar } from '../../../../apps/tenant-admin/src/components/layout/Sidebar';

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

const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: 'user-1',
  name: 'Test Admin',
  email: 'admin@tenant.no',
  role: 'TENANT_ADMIN',
  tenantId: 'tenant-001',
  tenantName: 'Demo Kommune',
  ...overrides,
});

const setMockAuthState = (state: {
  user?: MockUser | null;
  logout?: Mock;
  isTenantAdmin?: boolean;
}) => {
  mockAuthState = {
    user: state.user ?? null,
    logout: state.logout ?? mockLogout,
    isTenantAdmin: state.isTenantAdmin ?? false,
  };
};

const setMockThemeState = (state: { isDark?: boolean }) => {
  mockThemeState = {
    ...mockThemeState,
    isDark: state.isDark ?? false,
  };
};

// Helper to render with router
function renderWithRouter(ui: ReactNode, { initialPath = '/' }: { initialPath?: string } = {}) {
  return render(<MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>);
}

// Helper component to display current location
function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

// =============================================================================
// AppLayout Tests
// =============================================================================

describe('AppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockAuthState({
      user: createMockUser(),
      isTenantAdmin: true,
    });
    setMockThemeState({ isDark: false });
  });

  describe('Structure', () => {
    it('renders the main layout structure', () => {
      renderWithRouter(<AppLayout />);

      // Should have sidebar
      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toBeInTheDocument();

      // Should have header
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();

      // Should have main content area
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('renders Sidebar component', () => {
      renderWithRouter(<AppLayout />);

      // Check for sidebar specific elements (logo, navigation)
      expect(screen.getByAltText('Digilist')).toBeInTheDocument();
    });

    it('renders Header component', () => {
      renderWithRouter(<AppLayout />);

      // Check for header-specific elements
      expect(screen.getByTestId('header-actions')).toBeInTheDocument();
    });
  });
});

// =============================================================================
// Header Tests
// =============================================================================

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockAuthState({
      user: createMockUser(),
      isTenantAdmin: true,
    });
    setMockThemeState({ isDark: false });
  });

  describe('Rendering', () => {
    it('renders the header element', () => {
      renderWithRouter(<Header />);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('renders theme toggle button', () => {
      renderWithRouter(<Header />);

      const themeToggle = screen.getByTestId('theme-toggle');
      expect(themeToggle).toBeInTheDocument();
    });

    it('renders notification button', () => {
      renderWithRouter(<Header />);

      const notificationButton = screen.getByRole('button', { name: 'common.notifications' });
      expect(notificationButton).toBeInTheDocument();
    });

    it('renders settings button', () => {
      renderWithRouter(<Header />);

      const settingsButton = screen.getByRole('button', { name: 'common.settings' });
      expect(settingsButton).toBeInTheDocument();
    });

    it('renders logout button when user is authenticated', () => {
      setMockAuthState({
        user: createMockUser(),
        isTenantAdmin: true,
      });

      renderWithRouter(<Header />);

      const logoutButton = screen.getByRole('button', { name: 'auth.logout' });
      expect(logoutButton).toBeInTheDocument();
      expect(screen.getByText('auth.logout')).toBeInTheDocument();
    });

    it('does not render logout button when user is not authenticated', () => {
      setMockAuthState({
        user: null,
        isTenantAdmin: false,
      });

      renderWithRouter(<Header />);

      // The logout button aria-label is 'auth.logout'
      const logoutButton = screen.queryByRole('button', { name: 'auth.logout' });
      expect(logoutButton).not.toBeInTheDocument();
    });
  });

  describe('Theme Toggle', () => {
    it('displays light mode when isDark is false', () => {
      setMockThemeState({ isDark: false });

      renderWithRouter(<Header />);

      const themeToggle = screen.getByTestId('theme-toggle');
      expect(themeToggle).toHaveTextContent('Light');
    });

    it('displays dark mode when isDark is true', () => {
      setMockThemeState({ isDark: true });

      renderWithRouter(<Header />);

      const themeToggle = screen.getByTestId('theme-toggle');
      expect(themeToggle).toHaveTextContent('Dark');
    });

    it('calls toggleTheme when theme toggle is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Header />);

      const themeToggle = screen.getByTestId('theme-toggle');
      await user.click(themeToggle);

      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('Navigation', () => {
    it('navigates to notifications when notification button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Header />);

      const notificationButton = screen.getByRole('button', { name: 'common.notifications' });
      await user.click(notificationButton);

      expect(mockNavigate).toHaveBeenCalledWith('/notifications');
    });

    it('navigates to settings when settings button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Header />);

      const settingsButton = screen.getByRole('button', { name: 'common.settings' });
      await user.click(settingsButton);

      expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });
  });

  describe('Logout', () => {
    it('calls logout when logout button is clicked', async () => {
      const user = userEvent.setup();
      setMockAuthState({
        user: createMockUser(),
        logout: mockLogout,
        isTenantAdmin: true,
      });

      renderWithRouter(<Header />);

      const logoutButton = screen.getByRole('button', { name: 'auth.logout' });
      await user.click(logoutButton);

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });
});

// =============================================================================
// Sidebar Tests
// =============================================================================

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockAuthState({
      user: createMockUser(),
      isTenantAdmin: true,
    });
    setMockThemeState({ isDark: false });
  });

  describe('Rendering', () => {
    it('renders the sidebar element', () => {
      renderWithRouter(<Sidebar />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toBeInTheDocument();
    });

    it('renders the logo', () => {
      renderWithRouter(<Sidebar />);

      const logo = screen.getByAltText('Digilist');
      expect(logo).toBeInTheDocument();
    });

    it('renders the tenant name when available', () => {
      setMockAuthState({
        user: createMockUser({ tenantName: 'Oslo Kommune' }),
        isTenantAdmin: true,
      });

      renderWithRouter(<Sidebar />);

      expect(screen.getByText('Oslo Kommune')).toBeInTheDocument();
    });

    it('renders "DIGILIST" when tenant name is not available', () => {
      setMockAuthState({
        user: createMockUser({ tenantName: '' }),
        isTenantAdmin: true,
      });

      renderWithRouter(<Sidebar />);

      expect(screen.getByText('DIGILIST')).toBeInTheDocument();
    });

    it('renders "Tenant Admin" tagline', () => {
      renderWithRouter(<Sidebar />);

      expect(screen.getByText('Tenant Admin')).toBeInTheDocument();
    });

    it('renders navigation element', () => {
      renderWithRouter(<Sidebar />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Navigation Items - Dashboard (Always Visible)', () => {
    it('renders dashboard link for any authenticated user', () => {
      setMockAuthState({
        user: createMockUser({ role: 'TENANT_BILLING_ADMIN' }),
        isTenantAdmin: false,
      });

      renderWithRouter(<Sidebar />);

      expect(screen.getByText('tenantAdmin.nav.dashboard')).toBeInTheDocument();
      expect(screen.getByText('tenantAdmin.nav.dashboardDesc')).toBeInTheDocument();
    });
  });

  describe('Role-Based Visibility - Tenant Admin', () => {
    it('renders all navigation items for TENANT_ADMIN', () => {
      setMockAuthState({
        user: createMockUser({ role: 'TENANT_ADMIN' }),
        isTenantAdmin: true,
      });

      renderWithRouter(<Sidebar />);

      // Dashboard is always visible
      expect(screen.getByText('tenantAdmin.nav.dashboard')).toBeInTheDocument();

      // Admin-only items
      expect(screen.getByText('tenantAdmin.nav.users')).toBeInTheDocument();
      expect(screen.getByText('tenantAdmin.nav.featureFlags')).toBeInTheDocument();
      expect(screen.getByText('tenantAdmin.nav.branding')).toBeInTheDocument();
      expect(screen.getByText('tenantAdmin.nav.planAndBilling')).toBeInTheDocument();
      expect(screen.getByText('tenantAdmin.nav.auditLog')).toBeInTheDocument();
      expect(screen.getByText('tenantAdmin.nav.settings')).toBeInTheDocument();
    });
  });

  describe('Role-Based Visibility - Billing Admin', () => {
    it('renders only accessible items for TENANT_BILLING_ADMIN', () => {
      setMockAuthState({
        user: createMockUser({ role: 'TENANT_BILLING_ADMIN' }),
        isTenantAdmin: false,
      });

      renderWithRouter(<Sidebar />);

      // Dashboard is always visible
      expect(screen.getByText('tenantAdmin.nav.dashboard')).toBeInTheDocument();

      // Billing admin can see plan & billing
      expect(screen.getByText('tenantAdmin.nav.planAndBilling')).toBeInTheDocument();

      // Billing admin should not see admin-only items
      expect(screen.queryByText('tenantAdmin.nav.users')).not.toBeInTheDocument();
      expect(screen.queryByText('tenantAdmin.nav.auditLog')).not.toBeInTheDocument();
      expect(screen.queryByText('tenantAdmin.nav.settings')).not.toBeInTheDocument();
    });
  });

  describe('Role-Based Visibility - Tech Admin', () => {
    it('renders only accessible items for TENANT_TECH_ADMIN', () => {
      setMockAuthState({
        user: createMockUser({ role: 'TENANT_TECH_ADMIN' }),
        isTenantAdmin: false,
      });

      renderWithRouter(<Sidebar />);

      // Dashboard is always visible
      expect(screen.getByText('tenantAdmin.nav.dashboard')).toBeInTheDocument();

      // Tech admin can see feature flags and branding
      expect(screen.getByText('tenantAdmin.nav.featureFlags')).toBeInTheDocument();
      expect(screen.getByText('tenantAdmin.nav.branding')).toBeInTheDocument();

      // Tech admin should not see billing or admin-only items
      expect(screen.queryByText('tenantAdmin.nav.users')).not.toBeInTheDocument();
      expect(screen.queryByText('tenantAdmin.nav.planAndBilling')).not.toBeInTheDocument();
      expect(screen.queryByText('tenantAdmin.nav.auditLog')).not.toBeInTheDocument();
      expect(screen.queryByText('tenantAdmin.nav.settings')).not.toBeInTheDocument();
    });
  });

  describe('User Info Section', () => {
    it('renders user avatar with first letter of name', () => {
      setMockAuthState({
        user: createMockUser({ name: 'Anna Admin' }),
        isTenantAdmin: true,
      });

      renderWithRouter(<Sidebar />);

      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('renders user name', () => {
      setMockAuthState({
        user: createMockUser({ name: 'Test User' }),
        isTenantAdmin: true,
      });

      renderWithRouter(<Sidebar />);

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('displays correct role for TENANT_ADMIN', () => {
      setMockAuthState({
        user: createMockUser({ role: 'TENANT_ADMIN' }),
        isTenantAdmin: true,
      });

      renderWithRouter(<Sidebar />);

      expect(screen.getByText('tenantAdmin.roles.tenantAdmin')).toBeInTheDocument();
    });

    it('displays correct role for TENANT_BILLING_ADMIN', () => {
      setMockAuthState({
        user: createMockUser({ role: 'TENANT_BILLING_ADMIN' }),
        isTenantAdmin: false,
      });

      renderWithRouter(<Sidebar />);

      expect(screen.getByText('tenantAdmin.roles.billingAdmin')).toBeInTheDocument();
    });

    it('displays correct role for TENANT_TECH_ADMIN', () => {
      setMockAuthState({
        user: createMockUser({ role: 'TENANT_TECH_ADMIN' }),
        isTenantAdmin: false,
      });

      renderWithRouter(<Sidebar />);

      expect(screen.getByText('tenantAdmin.roles.techAdmin')).toBeInTheDocument();
    });

    it('displays default role for unknown role', () => {
      setMockAuthState({
        user: createMockUser({ role: 'UNKNOWN_ROLE' }),
        isTenantAdmin: false,
      });

      renderWithRouter(<Sidebar />);

      expect(screen.getByText('tenantAdmin.roles.admin')).toBeInTheDocument();
    });

    it('does not render user section when user is null', () => {
      setMockAuthState({
        user: null,
        isTenantAdmin: false,
      });

      renderWithRouter(<Sidebar />);

      // User avatar letter should not be present
      expect(screen.queryByText('T')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Admin')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('renders NavLink elements for navigation items', () => {
      setMockAuthState({
        user: createMockUser(),
        isTenantAdmin: true,
      });

      renderWithRouter(<Sidebar />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });

    it('dashboard link points to root path', () => {
      setMockAuthState({
        user: createMockUser(),
        isTenantAdmin: true,
      });

      renderWithRouter(<Sidebar />);

      const dashboardLink = screen.getByRole('link', { name: /tenantAdmin\.nav\.dashboard/i });
      expect(dashboardLink).toHaveAttribute('href', '/');
    });

    it('users link points to /users path', () => {
      setMockAuthState({
        user: createMockUser(),
        isTenantAdmin: true,
      });

      renderWithRouter(<Sidebar />);

      const usersLink = screen.getByRole('link', { name: /tenantAdmin\.nav\.users/i });
      expect(usersLink).toHaveAttribute('href', '/users');
    });

    it('settings link points to /settings path', () => {
      setMockAuthState({
        user: createMockUser(),
        isTenantAdmin: true,
      });

      renderWithRouter(<Sidebar />);

      const settingsLink = screen.getByRole('link', { name: /tenantAdmin\.nav\.settings/i });
      expect(settingsLink).toHaveAttribute('href', '/settings');
    });
  });

  describe('Section Titles', () => {
    it('renders section titles for nav groups', () => {
      setMockAuthState({
        user: createMockUser(),
        isTenantAdmin: true,
      });

      renderWithRouter(<Sidebar />);

      expect(screen.getByText('tenantAdmin.nav.administration')).toBeInTheDocument();
      expect(screen.getByText('tenantAdmin.nav.appearance')).toBeInTheDocument();
      expect(screen.getByText('tenantAdmin.nav.subscriptionSection')).toBeInTheDocument();
      expect(screen.getByText('tenantAdmin.nav.system')).toBeInTheDocument();
    });

    it('does not render section titles when section has no visible items', () => {
      // Billing admin should not see administration section
      setMockAuthState({
        user: createMockUser({ role: 'TENANT_BILLING_ADMIN' }),
        isTenantAdmin: false,
      });

      renderWithRouter(<Sidebar />);

      // Administration section should not be visible (users is admin-only)
      expect(screen.queryByText('tenantAdmin.nav.administration')).not.toBeInTheDocument();
    });
  });
});
