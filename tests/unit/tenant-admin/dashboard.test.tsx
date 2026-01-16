/**
 * DashboardPage Component Unit Tests
 *
 * Tests for the dashboard page of the tenant admin app.
 * Covers: loading state, seat usage stats, feature flags display, RBAC quick actions visibility.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
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
let mockAuthState = {
  user: {
    id: 'test-user',
    name: 'Test Admin',
    email: 'admin@test.no',
    tenantId: 'test-tenant',
    tenantName: 'Test Kommune',
  },
  isAuthenticated: true,
  isLoading: false,
  isTenantAdmin: true,
  isBillingAdmin: true,
  isTechAdmin: true,
  login: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
  checkRole: vi.fn().mockReturnValue(true),
};

vi.mock('@xala/auth', () => ({
  useAuth: () => mockAuthState,
}));

// Mock i18n - return the key with defaultValue fallback for testing
vi.mock('@xala/i18n', () => ({
  useT: () => (key: string, options?: { defaultValue?: string; name?: string }) => {
    if (options?.name) {
      return `${options.defaultValue || key}, ${options.name}`;
    }
    return options?.defaultValue || key;
  },
  useLocale: () => ({ locale: 'nb' }),
}));

// Mock SDK hooks
let mockCapabilitiesData = {
  capabilities: {
    usage: {
      currentUsers: 15,
      currentOrganizations: 3,
      currentListings: 25,
      bookingsThisMonth: 150,
    },
    seatLimits: {
      maxUsers: 50,
      maxOrganizations: 10,
      maxListings: 100,
      maxBookingsPerMonth: 500,
    },
    featureFlags: {
      'module.booking': true,
      'module.calendar': true,
      'module.reports': false,
      'integration.vipps': true,
      'integration.bankid': false,
      'policy.sso': true,
      'policy.2fa': false,
    },
  },
};

let mockSubscriptionData = {
  subscription: {
    planName: 'Professional',
    status: 'active' as const,
    currentPeriodEnd: '2024-12-31T23:59:59Z',
    usage: null,
    seatLimits: null,
  },
};

let mockCapabilitiesLoading = false;
let mockSubscriptionLoading = false;

vi.mock('@digilist/client-sdk', () => ({
  useTenantCapabilities: () => ({
    data: mockCapabilitiesLoading ? undefined : mockCapabilitiesData,
    isLoading: mockCapabilitiesLoading,
  }),
  useTenantSubscription: () => ({
    data: mockSubscriptionLoading ? undefined : mockSubscriptionData,
    isLoading: mockSubscriptionLoading,
  }),
}));

// Mock @xala/ds components
vi.mock('@xala/ds', () => ({
  Card: ({ children, style }: { children: ReactNode; style?: React.CSSProperties }) =>
    React.createElement('div', { 'data-testid': 'card', style }, children),
  Heading: ({
    children,
    level,
    'data-size': dataSize,
    style,
  }: {
    children: ReactNode;
    level: number;
    'data-size'?: string;
    style?: React.CSSProperties;
  }) =>
    React.createElement(
      `h${level}`,
      { 'data-testid': `heading-${level}`, 'data-size': dataSize, style },
      children
    ),
  Paragraph: ({
    children,
    'data-size': dataSize,
    style,
  }: {
    children: ReactNode;
    'data-size'?: string;
    style?: React.CSSProperties;
  }) => React.createElement('p', { 'data-testid': 'paragraph', 'data-size': dataSize, style }, children),
  Spinner: ({ 'aria-label': ariaLabel, 'data-size': dataSize }: { 'aria-label': string; 'data-size'?: string }) =>
    React.createElement('div', { 'data-testid': 'spinner', 'aria-label': ariaLabel, 'data-size': dataSize, role: 'status' }, 'Loading...'),
  Button: ({
    children,
    onClick,
    variant,
    'data-color': dataColor,
    'data-size': dataSize,
    type,
    style,
  }: {
    children: ReactNode;
    onClick?: () => void;
    variant?: string;
    'data-color'?: string;
    'data-size'?: string;
    type?: string;
    style?: React.CSSProperties;
  }) =>
    React.createElement(
      'button',
      {
        'data-testid': `button-${variant || 'default'}`,
        onClick,
        'data-color': dataColor,
        'data-size': dataSize,
        type,
        style,
      },
      children
    ),
  StatCard: ({
    title,
    value,
    description,
    color,
    icon,
  }: {
    title: string;
    value: number;
    description: string;
    color?: string;
    icon?: ReactNode;
  }) =>
    React.createElement(
      'div',
      { 'data-testid': `stat-card-${title.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-')}`, style: { color } },
      React.createElement('span', { 'data-testid': 'stat-icon' }, icon),
      React.createElement('span', { 'data-testid': 'stat-title' }, title),
      React.createElement('span', { 'data-testid': 'stat-value' }, value),
      React.createElement('span', { 'data-testid': 'stat-description' }, description)
    ),
  Badge: ({
    children,
    'data-color': dataColor,
    style,
  }: {
    children: ReactNode;
    'data-color'?: string;
    style?: React.CSSProperties;
  }) =>
    React.createElement('span', { 'data-testid': `badge-${dataColor || 'default'}`, 'data-color': dataColor, style }, children),
  UsersIcon: ({ size }: { size?: number }) => React.createElement('span', { 'data-testid': 'users-icon', 'data-size': size }, 'Users'),
  OrganizationIcon: () => React.createElement('span', { 'data-testid': 'organization-icon' }, 'Org'),
  CalendarIcon: () => React.createElement('span', { 'data-testid': 'calendar-icon' }, 'Calendar'),
  BuildingIcon: () => React.createElement('span', { 'data-testid': 'building-icon' }, 'Building'),
  SettingsIcon: () => React.createElement('span', { 'data-testid': 'settings-icon' }, 'Settings'),
  SparklesIcon: () => React.createElement('span', { 'data-testid': 'sparkles-icon' }, 'Sparkles'),
  ChartIcon: () => React.createElement('span', { 'data-testid': 'chart-icon' }, 'Chart'),
  CheckCircleIcon: ({ style }: { style?: React.CSSProperties }) =>
    React.createElement('span', { 'data-testid': 'check-circle-icon', style }, 'Check'),
  ShieldCheckIcon: ({ style }: { style?: React.CSSProperties }) =>
    React.createElement('span', { 'data-testid': 'shield-check-icon', style }, 'Shield'),
  ArrowRightIcon: () => React.createElement('span', { 'data-testid': 'arrow-right-icon' }, 'Arrow'),
}));

// Import component after mocks
import { DashboardPage } from '../../../apps/tenant-admin/src/routes/dashboard';

// =============================================================================
// Test Helpers
// =============================================================================

type AuthState = typeof mockAuthState;
type CapabilitiesData = typeof mockCapabilitiesData;
type SubscriptionData = typeof mockSubscriptionData;

const setMockAuthState = (state: Partial<AuthState>) => {
  mockAuthState = {
    ...mockAuthState,
    ...state,
  };
};

const setMockCapabilitiesData = (data: CapabilitiesData | null, isLoading = false) => {
  mockCapabilitiesData = data ?? {
    capabilities: {
      usage: { currentUsers: 0, currentOrganizations: 0, currentListings: 0, bookingsThisMonth: 0 },
      seatLimits: { maxUsers: 0, maxOrganizations: 0, maxListings: 0, maxBookingsPerMonth: 0 },
      featureFlags: {},
    },
  };
  mockCapabilitiesLoading = isLoading;
};

const setMockSubscriptionData = (data: SubscriptionData | null, isLoading = false) => {
  mockSubscriptionData = data ?? {
    subscription: {
      planName: null,
      status: 'active' as const,
      currentPeriodEnd: null,
      usage: null,
      seatLimits: null,
    },
  };
  mockSubscriptionLoading = isLoading;
};

// Helper to render with router
function renderWithRouter(ui: ReactNode, { initialPath = '/' }: { initialPath?: string } = {}) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={ui} />
        <Route path="/settings" element={<div data-testid="settings-page">Settings</div>} />
        <Route path="/branding" element={<div data-testid="branding-page">Branding</div>} />
        <Route path="/subscription" element={<div data-testid="subscription-page">Subscription</div>} />
        <Route path="/users" element={<div data-testid="users-page">Users</div>} />
        <Route path="/feature-flags" element={<div data-testid="feature-flags-page">Feature Flags</div>} />
      </Routes>
    </MemoryRouter>
  );
}

// Reset state helper
const resetMockState = () => {
  mockAuthState = {
    user: {
      id: 'test-user',
      name: 'Test Admin',
      email: 'admin@test.no',
      tenantId: 'test-tenant',
      tenantName: 'Test Kommune',
    },
    isAuthenticated: true,
    isLoading: false,
    isTenantAdmin: true,
    isBillingAdmin: true,
    isTechAdmin: true,
    login: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
    checkRole: vi.fn().mockReturnValue(true),
  };

  mockCapabilitiesData = {
    capabilities: {
      usage: {
        currentUsers: 15,
        currentOrganizations: 3,
        currentListings: 25,
        bookingsThisMonth: 150,
      },
      seatLimits: {
        maxUsers: 50,
        maxOrganizations: 10,
        maxListings: 100,
        maxBookingsPerMonth: 500,
      },
      featureFlags: {
        'module.booking': true,
        'module.calendar': true,
        'module.reports': false,
        'integration.vipps': true,
        'integration.bankid': false,
        'policy.sso': true,
        'policy.2fa': false,
      },
    },
  };

  mockSubscriptionData = {
    subscription: {
      planName: 'Professional',
      status: 'active' as const,
      currentPeriodEnd: '2024-12-31T23:59:59Z',
      usage: null,
      seatLimits: null,
    },
  };

  mockCapabilitiesLoading = false;
  mockSubscriptionLoading = false;
};

// =============================================================================
// Tests
// =============================================================================

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMockState();
  });

  // ===========================================================================
  // Loading State Tests
  // ===========================================================================

  describe('Loading State', () => {
    it('displays spinner while capabilities are loading', () => {
      setMockCapabilitiesData(null, true);
      renderWithRouter(<DashboardPage />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('displays spinner while subscription is loading', () => {
      setMockSubscriptionData(null, true);
      renderWithRouter(<DashboardPage />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('displays spinner when both capabilities and subscription are loading', () => {
      setMockCapabilitiesData(null, true);
      setMockSubscriptionData(null, true);
      renderWithRouter(<DashboardPage />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('does not show spinner when data is loaded', () => {
      renderWithRouter(<DashboardPage />);

      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    it('spinner has correct aria-label for accessibility', () => {
      setMockCapabilitiesData(null, true);
      renderWithRouter(<DashboardPage />);

      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveAttribute('aria-label', 'dashboard.loadingStats');
    });
  });

  // ===========================================================================
  // Welcome Section Tests
  // ===========================================================================

  describe('Welcome Section', () => {
    it('renders welcome heading with user name', () => {
      renderWithRouter(<DashboardPage />);

      // The i18n mock returns key with name interpolated (dashboard.welcomeBack, Test)
      const heading = screen.getByTestId('heading-1');
      expect(heading).toHaveTextContent('dashboard.welcomeBack');
      expect(heading).toHaveTextContent('Test');
    });

    it('displays tenant name badge', () => {
      renderWithRouter(<DashboardPage />);

      expect(screen.getByTestId('badge-info')).toHaveTextContent('Test Kommune');
    });

    it('displays tenant admin subtitle for tenant admins', () => {
      setMockAuthState({ isTenantAdmin: true });
      renderWithRouter(<DashboardPage />);

      expect(screen.getByText('Full access to tenant administration')).toBeInTheDocument();
    });

    it('displays billing admin subtitle for billing admins', () => {
      setMockAuthState({ isTenantAdmin: false, isBillingAdmin: true, isTechAdmin: false });
      renderWithRouter(<DashboardPage />);

      expect(screen.getByText('Billing and subscription management')).toBeInTheDocument();
    });

    it('displays tech admin subtitle for tech admins', () => {
      setMockAuthState({ isTenantAdmin: false, isBillingAdmin: false, isTechAdmin: true });
      renderWithRouter(<DashboardPage />);

      expect(screen.getByText('Technical and integration management')).toBeInTheDocument();
    });

    it('displays generic subtitle for users without admin roles', () => {
      setMockAuthState({ isTenantAdmin: false, isBillingAdmin: false, isTechAdmin: false });
      renderWithRouter(<DashboardPage />);

      expect(screen.getByText('dashboard.loggedIn')).toBeInTheDocument();
    });

    it('shows manage settings button for tenant admins', () => {
      setMockAuthState({ isTenantAdmin: true });
      renderWithRouter(<DashboardPage />);

      expect(screen.getByText('Manage Settings')).toBeInTheDocument();
    });

    it('hides manage settings button for non-tenant admins', () => {
      setMockAuthState({ isTenantAdmin: false });
      renderWithRouter(<DashboardPage />);

      expect(screen.queryByText('Manage Settings')).not.toBeInTheDocument();
    });

    it('navigates to settings when manage settings button is clicked', async () => {
      const user = userEvent.setup();
      setMockAuthState({ isTenantAdmin: true });
      renderWithRouter(<DashboardPage />);

      await user.click(screen.getByText('Manage Settings'));

      expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });
  });

  // ===========================================================================
  // Seat Usage Stats Tests
  // ===========================================================================

  describe('Seat Usage Stats', () => {
    it('displays seat usage section heading', () => {
      renderWithRouter(<DashboardPage />);

      expect(screen.getByText('Seat Usage')).toBeInTheDocument();
    });

    it('displays users stat card with correct values', () => {
      renderWithRouter(<DashboardPage />);

      const usersCard = screen.getByTestId('stat-card-users');
      expect(usersCard).toBeInTheDocument();
      expect(usersCard).toHaveTextContent('15');
      expect(usersCard).toHaveTextContent('of 50 max');
    });

    it('displays organizations stat card with correct values', () => {
      renderWithRouter(<DashboardPage />);

      const orgsCard = screen.getByTestId('stat-card-organizations');
      expect(orgsCard).toBeInTheDocument();
      expect(orgsCard).toHaveTextContent('3');
      expect(orgsCard).toHaveTextContent('of 10 max');
    });

    it('displays listings stat card with correct values', () => {
      renderWithRouter(<DashboardPage />);

      const listingsCard = screen.getByTestId('stat-card-listings');
      expect(listingsCard).toBeInTheDocument();
      expect(listingsCard).toHaveTextContent('25');
      expect(listingsCard).toHaveTextContent('of 100 max');
    });

    it('displays bookings stat card with correct values', () => {
      renderWithRouter(<DashboardPage />);

      const bookingsCard = screen.getByTestId('stat-card-bookings-month');
      expect(bookingsCard).toBeInTheDocument();
      expect(bookingsCard).toHaveTextContent('150');
      expect(bookingsCard).toHaveTextContent('of 500 max');
    });

    it('renders icons for each stat card', () => {
      renderWithRouter(<DashboardPage />);

      // There may be multiple users-icon elements (one in stat card, one in quick actions)
      // We verify at least one of each exists
      expect(screen.getAllByTestId('users-icon').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByTestId('organization-icon')).toBeInTheDocument();
      expect(screen.getByTestId('building-icon')).toBeInTheDocument();
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    });

    it('displays zero values when usage is null', () => {
      setMockCapabilitiesData({
        capabilities: {
          usage: null as unknown as typeof mockCapabilitiesData.capabilities.usage,
          seatLimits: null as unknown as typeof mockCapabilitiesData.capabilities.seatLimits,
          featureFlags: {},
        },
      });
      renderWithRouter(<DashboardPage />);

      const usersCard = screen.getByTestId('stat-card-users');
      expect(usersCard).toHaveTextContent('0');
    });

    it('handles high usage with danger color', () => {
      setMockCapabilitiesData({
        capabilities: {
          usage: {
            currentUsers: 48, // 96% usage
            currentOrganizations: 3,
            currentListings: 25,
            bookingsThisMonth: 150,
          },
          seatLimits: {
            maxUsers: 50,
            maxOrganizations: 10,
            maxListings: 100,
            maxBookingsPerMonth: 500,
          },
          featureFlags: {},
        },
      });
      renderWithRouter(<DashboardPage />);

      const usersCard = screen.getByTestId('stat-card-users');
      expect(usersCard).toHaveStyle({ color: 'var(--ds-color-danger-text-default)' });
    });

    it('handles medium usage with warning color', () => {
      setMockCapabilitiesData({
        capabilities: {
          usage: {
            currentUsers: 40, // 80% usage
            currentOrganizations: 3,
            currentListings: 25,
            bookingsThisMonth: 150,
          },
          seatLimits: {
            maxUsers: 50,
            maxOrganizations: 10,
            maxListings: 100,
            maxBookingsPerMonth: 500,
          },
          featureFlags: {},
        },
      });
      renderWithRouter(<DashboardPage />);

      const usersCard = screen.getByTestId('stat-card-users');
      expect(usersCard).toHaveStyle({ color: 'var(--ds-color-warning-text-default)' });
    });

    it('handles low usage with success color', () => {
      setMockCapabilitiesData({
        capabilities: {
          usage: {
            currentUsers: 15, // 30% usage
            currentOrganizations: 3,
            currentListings: 25,
            bookingsThisMonth: 150,
          },
          seatLimits: {
            maxUsers: 50,
            maxOrganizations: 10,
            maxListings: 100,
            maxBookingsPerMonth: 500,
          },
          featureFlags: {},
        },
      });
      renderWithRouter(<DashboardPage />);

      const usersCard = screen.getByTestId('stat-card-users');
      expect(usersCard).toHaveStyle({ color: 'var(--ds-color-success-text-default)' });
    });
  });

  // ===========================================================================
  // Feature Flags Display Tests
  // ===========================================================================

  describe('Feature Flags Display', () => {
    it('displays feature flags section heading', () => {
      renderWithRouter(<DashboardPage />);

      expect(screen.getByText('Feature Flags')).toBeInTheDocument();
    });

    it('displays enabled features count', () => {
      renderWithRouter(<DashboardPage />);

      expect(screen.getByText(/Enabled.*\(4\)/)).toBeInTheDocument();
    });

    it('displays disabled features count', () => {
      renderWithRouter(<DashboardPage />);

      expect(screen.getByText(/Disabled.*\(3\)/)).toBeInTheDocument();
    });

    it('renders enabled feature badges with success color', () => {
      renderWithRouter(<DashboardPage />);

      const successBadges = screen.getAllByTestId('badge-success');
      expect(successBadges.length).toBeGreaterThan(0);
    });

    it('renders disabled feature badges with neutral color', () => {
      renderWithRouter(<DashboardPage />);

      const neutralBadges = screen.getAllByTestId('badge-neutral');
      expect(neutralBadges.length).toBeGreaterThan(0);
    });

    it('formats feature flag names correctly', () => {
      renderWithRouter(<DashboardPage />);

      // Check that feature names are formatted (e.g., 'module.booking' -> 'Booking')
      expect(screen.getByText('Booking')).toBeInTheDocument();
      // Calendar may appear multiple times (icon and badge), verify at least one exists
      expect(screen.getAllByText('Calendar').length).toBeGreaterThanOrEqual(1);
    });

    it('displays see all button for tenant admins', () => {
      setMockAuthState({ isTenantAdmin: true, isTechAdmin: false });
      renderWithRouter(<DashboardPage />);

      expect(screen.getByText('See All')).toBeInTheDocument();
    });

    it('displays see all button for tech admins', () => {
      setMockAuthState({ isTenantAdmin: false, isTechAdmin: true });
      renderWithRouter(<DashboardPage />);

      expect(screen.getByText('See All')).toBeInTheDocument();
    });

    it('hides see all button for users without admin roles', () => {
      setMockAuthState({ isTenantAdmin: false, isTechAdmin: false, isBillingAdmin: true });
      renderWithRouter(<DashboardPage />);

      expect(screen.queryByText('See All')).not.toBeInTheDocument();
    });

    it('navigates to feature flags page when see all is clicked', async () => {
      const user = userEvent.setup();
      setMockAuthState({ isTenantAdmin: true });
      renderWithRouter(<DashboardPage />);

      await user.click(screen.getByText('See All'));

      expect(mockNavigate).toHaveBeenCalledWith('/feature-flags');
    });

    it('displays no features enabled message when all flags are disabled', () => {
      setMockCapabilitiesData({
        capabilities: {
          usage: mockCapabilitiesData.capabilities.usage,
          seatLimits: mockCapabilitiesData.capabilities.seatLimits,
          featureFlags: {
            'module.reports': false,
            'integration.bankid': false,
          },
        },
      });
      renderWithRouter(<DashboardPage />);

      expect(screen.getByText('No features enabled')).toBeInTheDocument();
    });

    it('limits displayed enabled flags to 6 with +N more indicator', () => {
      setMockCapabilitiesData({
        capabilities: {
          usage: mockCapabilitiesData.capabilities.usage,
          seatLimits: mockCapabilitiesData.capabilities.seatLimits,
          featureFlags: {
            'module.booking': true,
            'module.calendar': true,
            'module.reports': true,
            'module.users': true,
            'module.analytics': true,
            'module.settings': true,
            'module.extra1': true,
            'module.extra2': true,
          },
        },
      });
      renderWithRouter(<DashboardPage />);

      expect(screen.getByText('+2 more')).toBeInTheDocument();
    });

    it('limits displayed disabled flags to 4 with +N more indicator', () => {
      setMockCapabilitiesData({
        capabilities: {
          usage: mockCapabilitiesData.capabilities.usage,
          seatLimits: mockCapabilitiesData.capabilities.seatLimits,
          featureFlags: {
            'module.one': false,
            'module.two': false,
            'module.three': false,
            'module.four': false,
            'module.five': false,
            'module.six': false,
          },
        },
      });
      renderWithRouter(<DashboardPage />);

      expect(screen.getByText('+2 more')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // RBAC Quick Actions Visibility Tests
  // ===========================================================================

  describe('RBAC Quick Actions Visibility', () => {
    it('displays quick actions section heading', () => {
      renderWithRouter(<DashboardPage />);

      expect(screen.getByText('dashboard.quickActions')).toBeInTheDocument();
    });

    describe('Customize Branding Action', () => {
      it('is visible for tenant admins', () => {
        setMockAuthState({ isTenantAdmin: true, isTechAdmin: false, isBillingAdmin: false });
        renderWithRouter(<DashboardPage />);

        expect(screen.getByText('Customize Branding')).toBeInTheDocument();
      });

      it('is visible for tech admins', () => {
        setMockAuthState({ isTenantAdmin: false, isTechAdmin: true, isBillingAdmin: false });
        renderWithRouter(<DashboardPage />);

        expect(screen.getByText('Customize Branding')).toBeInTheDocument();
      });

      it('is hidden for billing admins only', () => {
        setMockAuthState({ isTenantAdmin: false, isTechAdmin: false, isBillingAdmin: true });
        renderWithRouter(<DashboardPage />);

        expect(screen.queryByText('Customize Branding')).not.toBeInTheDocument();
      });

      it('navigates to branding when clicked', async () => {
        const user = userEvent.setup();
        setMockAuthState({ isTenantAdmin: true });
        renderWithRouter(<DashboardPage />);

        await user.click(screen.getByText('Customize Branding'));

        expect(mockNavigate).toHaveBeenCalledWith('/branding');
      });
    });

    describe('View Subscription Action', () => {
      it('is visible for tenant admins', () => {
        setMockAuthState({ isTenantAdmin: true, isBillingAdmin: false, isTechAdmin: false });
        renderWithRouter(<DashboardPage />);

        expect(screen.getByText('View Subscription')).toBeInTheDocument();
      });

      it('is visible for billing admins', () => {
        setMockAuthState({ isTenantAdmin: false, isBillingAdmin: true, isTechAdmin: false });
        renderWithRouter(<DashboardPage />);

        expect(screen.getByText('View Subscription')).toBeInTheDocument();
      });

      it('is hidden for tech admins only', () => {
        setMockAuthState({ isTenantAdmin: false, isBillingAdmin: false, isTechAdmin: true });
        renderWithRouter(<DashboardPage />);

        expect(screen.queryByText('View Subscription')).not.toBeInTheDocument();
      });

      it('navigates to subscription when clicked', async () => {
        const user = userEvent.setup();
        setMockAuthState({ isTenantAdmin: true });
        renderWithRouter(<DashboardPage />);

        await user.click(screen.getByText('View Subscription'));

        expect(mockNavigate).toHaveBeenCalledWith('/subscription');
      });
    });

    describe('Manage Users Action', () => {
      it('is visible for tenant admins', () => {
        setMockAuthState({ isTenantAdmin: true, isBillingAdmin: false, isTechAdmin: false });
        renderWithRouter(<DashboardPage />);

        expect(screen.getByText('dashboard.manageUsers')).toBeInTheDocument();
      });

      it('is hidden for non-tenant admins', () => {
        setMockAuthState({ isTenantAdmin: false, isBillingAdmin: true, isTechAdmin: true });
        renderWithRouter(<DashboardPage />);

        expect(screen.queryByText('dashboard.manageUsers')).not.toBeInTheDocument();
      });

      it('navigates to users when clicked', async () => {
        const user = userEvent.setup();
        setMockAuthState({ isTenantAdmin: true });
        renderWithRouter(<DashboardPage />);

        await user.click(screen.getByText('dashboard.manageUsers'));

        expect(mockNavigate).toHaveBeenCalledWith('/users');
      });
    });

    describe('Settings Action', () => {
      it('is visible for tenant admins in quick actions', () => {
        setMockAuthState({ isTenantAdmin: true, isBillingAdmin: false, isTechAdmin: false });
        renderWithRouter(<DashboardPage />);

        // Settings appears in quick actions section inside a secondary button
        const secondaryButtons = screen.getAllByTestId('button-secondary');
        const settingsButton = secondaryButtons.find((btn) => btn.textContent?.includes('Settings'));
        expect(settingsButton).toBeDefined();
      });

      it('is hidden for non-tenant admins in quick actions', () => {
        setMockAuthState({ isTenantAdmin: false, isBillingAdmin: true, isTechAdmin: true });
        renderWithRouter(<DashboardPage />);

        // Check that Settings quick action is not shown
        const secondaryButtons = screen.queryAllByTestId('button-secondary');
        const settingsButton = secondaryButtons.find((btn) => btn.textContent?.includes('Settings'));
        expect(settingsButton).toBeUndefined();
      });

      it('navigates to settings when quick action is clicked', async () => {
        const user = userEvent.setup();
        setMockAuthState({ isTenantAdmin: true });
        renderWithRouter(<DashboardPage />);

        // Click the Settings button in quick actions
        const secondaryButtons = screen.getAllByTestId('button-secondary');
        const settingsButton = secondaryButtons.find((btn) => btn.textContent?.includes('Settings'));
        expect(settingsButton).toBeDefined();
        if (settingsButton) {
          await user.click(settingsButton);
          expect(mockNavigate).toHaveBeenCalledWith('/settings');
        }
      });
    });

    describe('Full Admin - All Actions Visible', () => {
      it('shows all quick actions for users with all admin roles', () => {
        setMockAuthState({ isTenantAdmin: true, isBillingAdmin: true, isTechAdmin: true });
        renderWithRouter(<DashboardPage />);

        expect(screen.getByText('Customize Branding')).toBeInTheDocument();
        expect(screen.getByText('View Subscription')).toBeInTheDocument();
        expect(screen.getByText('dashboard.manageUsers')).toBeInTheDocument();
        // Settings appears in quick actions section
        const secondaryButtons = screen.getAllByTestId('button-secondary');
        const settingsButton = secondaryButtons.find((btn) => btn.textContent?.includes('Settings'));
        expect(settingsButton).toBeDefined();
      });
    });

    describe('No Admin Roles', () => {
      it('shows no quick actions for users without admin roles', () => {
        setMockAuthState({ isTenantAdmin: false, isBillingAdmin: false, isTechAdmin: false });
        renderWithRouter(<DashboardPage />);

        expect(screen.queryByText('Customize Branding')).not.toBeInTheDocument();
        expect(screen.queryByText('View Subscription')).not.toBeInTheDocument();
        expect(screen.queryByText('dashboard.manageUsers')).not.toBeInTheDocument();
        // Settings quick action is also hidden - no secondary buttons should exist
        const secondaryButtons = screen.queryAllByTestId('button-secondary');
        expect(secondaryButtons.length).toBe(0);
      });
    });
  });

  // ===========================================================================
  // Subscription Status Card Tests
  // ===========================================================================

  describe('Subscription Status Card', () => {
    it('displays subscription status when subscription exists', () => {
      renderWithRouter(<DashboardPage />);

      expect(screen.getByText('Professional')).toBeInTheDocument();
    });

    it('displays active status badge', () => {
      renderWithRouter(<DashboardPage />);

      expect(screen.getByText('active')).toBeInTheDocument();
    });

    it('displays period end date', () => {
      renderWithRouter(<DashboardPage />);

      expect(screen.getByText(/Period ends/)).toBeInTheDocument();
    });

    it('does not display subscription card when subscription is null', () => {
      setMockSubscriptionData({
        subscription: null as unknown as typeof mockSubscriptionData.subscription,
      });
      renderWithRouter(<DashboardPage />);

      expect(screen.queryByText('Professional')).not.toBeInTheDocument();
    });

    it('displays no plan text when planName is null', () => {
      setMockSubscriptionData({
        subscription: {
          ...mockSubscriptionData.subscription,
          planName: null as unknown as string,
        },
      });
      renderWithRouter(<DashboardPage />);

      expect(screen.getByText('No Plan')).toBeInTheDocument();
    });

    it('displays warning badge for non-active status', () => {
      setMockSubscriptionData({
        subscription: {
          ...mockSubscriptionData.subscription,
          status: 'pending' as 'active',
        },
      });
      renderWithRouter(<DashboardPage />);

      expect(screen.getByTestId('badge-warning')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // System Status Card Tests
  // ===========================================================================

  describe('System Status Card', () => {
    it('displays system status card', () => {
      renderWithRouter(<DashboardPage />);

      expect(screen.getByText('dashboard.systemStatus')).toBeInTheDocument();
    });

    it('displays shield check icon', () => {
      renderWithRouter(<DashboardPage />);

      expect(screen.getByTestId('shield-check-icon')).toBeInTheDocument();
    });

    it('displays last updated time', () => {
      renderWithRouter(<DashboardPage />);

      expect(screen.getByText(/dashboard.lastUpdated/)).toBeInTheDocument();
    });
  });
});
