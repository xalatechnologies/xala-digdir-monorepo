/**
 * SubscriptionPage Component Unit Tests
 *
 * Tests for the subscription page of the tenant admin app.
 * Covers: loading state, access denied for unauthorized roles, plan details display, resource limits.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import React, { type ReactNode } from 'react';

// =============================================================================
// Mocks - Must be defined before imports that use them
// =============================================================================

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
  useT: () => (key: string, options?: { defaultValue?: string; amount?: string }) => {
    if (options?.amount) {
      return `${options.amount} available`;
    }
    return options?.defaultValue || key;
  },
  useLocale: () => ({ locale: 'nb' }),
}));

// Mock SDK hooks
let mockSubscriptionData: {
  subscription: {
    planName: string | null;
    status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'suspended' | 'pending';
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    usage: {
      currentUsers: number;
      currentOrganizations: number;
      currentListings: number;
      bookingsThisMonth: number;
      storageMb: number;
    } | null;
    seatLimits: {
      maxUsers: number;
      maxOrganizations: number;
      maxListings: number;
      maxBookingsPerMonth: number;
      maxStorageMb: number;
    } | null;
  } | null;
} = {
  subscription: {
    planName: 'Professional',
    status: 'active',
    currentPeriodStart: '2024-01-01T00:00:00Z',
    currentPeriodEnd: '2024-12-31T23:59:59Z',
    usage: {
      currentUsers: 15,
      currentOrganizations: 3,
      currentListings: 25,
      bookingsThisMonth: 150,
      storageMb: 512,
    },
    seatLimits: {
      maxUsers: 50,
      maxOrganizations: 10,
      maxListings: 100,
      maxBookingsPerMonth: 500,
      maxStorageMb: 2048,
    },
  },
};

let mockSubscriptionLoading = false;
let mockSubscriptionError: Error | null = null;

vi.mock('@digilist/client-sdk', () => ({
  useTenantSubscription: () => ({
    data: mockSubscriptionLoading ? undefined : mockSubscriptionData,
    isLoading: mockSubscriptionLoading,
    error: mockSubscriptionError,
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
    React.createElement(
      'div',
      { 'data-testid': 'spinner', 'aria-label': ariaLabel, 'data-size': dataSize, role: 'status' },
      'Loading...'
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
    React.createElement(
      'span',
      { 'data-testid': `badge-${dataColor || 'default'}`, 'data-color': dataColor, style },
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
      {
        'data-testid': `stat-card-${title.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-')}`,
        style: { color },
      },
      React.createElement('span', { 'data-testid': 'stat-icon' }, icon),
      React.createElement('span', { 'data-testid': 'stat-title' }, title),
      React.createElement('span', { 'data-testid': 'stat-value' }, value),
      React.createElement('span', { 'data-testid': 'stat-description' }, description)
    ),
  Progress: ({
    value,
    'data-color': dataColor,
  }: {
    value: number;
    'data-color'?: string;
  }) =>
    React.createElement('div', {
      'data-testid': 'progress',
      'data-value': value,
      'data-color': dataColor,
      role: 'progressbar',
      'aria-valuenow': value,
    }),
  Alert: ({
    children,
    'data-color': dataColor,
  }: {
    children: ReactNode;
    'data-color'?: string;
  }) =>
    React.createElement(
      'div',
      { 'data-testid': `alert-${dataColor || 'default'}`, role: 'alert', 'data-color': dataColor },
      children
    ),
  UsersIcon: ({ style }: { style?: React.CSSProperties }) =>
    React.createElement('span', { 'data-testid': 'users-icon', style }, 'Users'),
  OrganizationIcon: ({ style }: { style?: React.CSSProperties }) =>
    React.createElement('span', { 'data-testid': 'organization-icon', style }, 'Org'),
  CalendarIcon: ({ style }: { style?: React.CSSProperties }) =>
    React.createElement('span', { 'data-testid': 'calendar-icon', style }, 'Calendar'),
  BuildingIcon: ({ style }: { style?: React.CSSProperties }) =>
    React.createElement('span', { 'data-testid': 'building-icon', style }, 'Building'),
  StorageIcon: ({ style }: { style?: React.CSSProperties }) =>
    React.createElement('span', { 'data-testid': 'storage-icon', style }, 'Storage'),
  CreditCardIcon: ({ style }: { style?: React.CSSProperties }) =>
    React.createElement('span', { 'data-testid': 'credit-card-icon', style }, 'CreditCard'),
  ClockIcon: ({ style }: { style?: React.CSSProperties }) =>
    React.createElement('span', { 'data-testid': 'clock-icon', style }, 'Clock'),
  InfoIcon: ({ style }: { style?: React.CSSProperties }) =>
    React.createElement('span', { 'data-testid': 'info-icon', style }, 'Info'),
}));

// Import component after mocks
import { SubscriptionPage } from '../../../apps/tenant-admin/src/routes/subscription';

// =============================================================================
// Test Helpers
// =============================================================================

type AuthState = typeof mockAuthState;

const setMockAuthState = (state: Partial<AuthState>) => {
  mockAuthState = {
    ...mockAuthState,
    ...state,
  };
};

const setMockSubscriptionData = (
  data: typeof mockSubscriptionData | null,
  isLoading = false,
  error: Error | null = null
) => {
  mockSubscriptionData = data ?? {
    subscription: null,
  };
  mockSubscriptionLoading = isLoading;
  mockSubscriptionError = error;
};

// Helper to render with router
function renderWithRouter(ui: ReactNode, { initialPath = '/subscription' }: { initialPath?: string } = {}) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/subscription" element={ui} />
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

  mockSubscriptionData = {
    subscription: {
      planName: 'Professional',
      status: 'active',
      currentPeriodStart: '2024-01-01T00:00:00Z',
      currentPeriodEnd: '2024-12-31T23:59:59Z',
      usage: {
        currentUsers: 15,
        currentOrganizations: 3,
        currentListings: 25,
        bookingsThisMonth: 150,
        storageMb: 512,
      },
      seatLimits: {
        maxUsers: 50,
        maxOrganizations: 10,
        maxListings: 100,
        maxBookingsPerMonth: 500,
        maxStorageMb: 2048,
      },
    },
  };

  mockSubscriptionLoading = false;
  mockSubscriptionError = null;
};

// =============================================================================
// Tests
// =============================================================================

describe('SubscriptionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMockState();
  });

  // ===========================================================================
  // Loading State Tests
  // ===========================================================================

  describe('Loading State', () => {
    it('displays spinner while subscription data is loading', () => {
      setMockSubscriptionData(null, true);
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('spinner has correct aria-label for accessibility', () => {
      setMockSubscriptionData(null, true);
      renderWithRouter(<SubscriptionPage />);

      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveAttribute('aria-label', 'Loading...');
    });

    it('does not show spinner when data is loaded', () => {
      renderWithRouter(<SubscriptionPage />);

      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    it('does not show content while loading', () => {
      setMockSubscriptionData(null, true);
      renderWithRouter(<SubscriptionPage />);

      expect(screen.queryByText('Subscription')).not.toBeInTheDocument();
      expect(screen.queryByText('Plan Overview')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Access Denied for Unauthorized Roles Tests
  // ===========================================================================

  describe('Access Denied for Unauthorized Roles', () => {
    it('displays access denied alert for users without billing or tenant admin roles', () => {
      setMockAuthState({
        isTenantAdmin: false,
        isBillingAdmin: false,
        isTechAdmin: true,
      });
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByTestId('alert-warning')).toBeInTheDocument();
    });

    it('shows correct access denied message', () => {
      setMockAuthState({
        isTenantAdmin: false,
        isBillingAdmin: false,
        isTechAdmin: true,
      });
      renderWithRouter(<SubscriptionPage />);

      expect(
        screen.getByText('You do not have permission to view subscription details.')
      ).toBeInTheDocument();
    });

    it('displays info icon in access denied alert', () => {
      setMockAuthState({
        isTenantAdmin: false,
        isBillingAdmin: false,
        isTechAdmin: true,
      });
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });

    it('allows access for billing admin only', () => {
      setMockAuthState({
        isTenantAdmin: false,
        isBillingAdmin: true,
        isTechAdmin: false,
      });
      renderWithRouter(<SubscriptionPage />);

      expect(screen.queryByTestId('alert-warning')).not.toBeInTheDocument();
      expect(screen.getByText('Subscription')).toBeInTheDocument();
    });

    it('allows access for tenant admin only', () => {
      setMockAuthState({
        isTenantAdmin: true,
        isBillingAdmin: false,
        isTechAdmin: false,
      });
      renderWithRouter(<SubscriptionPage />);

      expect(screen.queryByTestId('alert-warning')).not.toBeInTheDocument();
      expect(screen.getByText('Subscription')).toBeInTheDocument();
    });

    it('allows access for users with both billing and tenant admin roles', () => {
      setMockAuthState({
        isTenantAdmin: true,
        isBillingAdmin: true,
        isTechAdmin: false,
      });
      renderWithRouter(<SubscriptionPage />);

      expect(screen.queryByTestId('alert-warning')).not.toBeInTheDocument();
      expect(screen.getByText('Subscription')).toBeInTheDocument();
    });

    it('denies access for viewer role only', () => {
      setMockAuthState({
        isTenantAdmin: false,
        isBillingAdmin: false,
        isTechAdmin: false,
      });
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByTestId('alert-warning')).toBeInTheDocument();
      expect(
        screen.getByText('You do not have permission to view subscription details.')
      ).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Error State Tests
  // ===========================================================================

  describe('Error State', () => {
    it('displays error alert when API call fails', () => {
      setMockSubscriptionData(null, false, new Error('API Error'));
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByTestId('alert-danger')).toBeInTheDocument();
    });

    it('shows correct error message', () => {
      setMockSubscriptionData(null, false, new Error('API Error'));
      renderWithRouter(<SubscriptionPage />);

      expect(
        screen.getByText('Failed to load subscription details. Please try again later.')
      ).toBeInTheDocument();
    });

    it('displays error alert when subscription is null', () => {
      setMockSubscriptionData({ subscription: null });
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByTestId('alert-danger')).toBeInTheDocument();
    });

    it('displays info icon in error alert', () => {
      setMockSubscriptionData(null, false, new Error('API Error'));
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Plan Details Display Tests
  // ===========================================================================

  describe('Plan Details Display', () => {
    it('displays page title', () => {
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByText('Subscription')).toBeInTheDocument();
    });

    it('displays page description', () => {
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByText('View your current plan and resource usage')).toBeInTheDocument();
    });

    it('displays plan overview section heading', () => {
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByText('Plan Overview')).toBeInTheDocument();
    });

    it('displays plan name correctly', () => {
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByText('Professional')).toBeInTheDocument();
    });

    it('displays status badge with correct color for active status', () => {
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByTestId('badge-success')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('displays status badge with correct color for trialing status', () => {
      setMockSubscriptionData({
        subscription: {
          ...mockSubscriptionData.subscription!,
          status: 'trialing',
        },
      });
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByText('Trial')).toBeInTheDocument();
    });

    it('displays status badge with warning color for past_due status', () => {
      setMockSubscriptionData({
        subscription: {
          ...mockSubscriptionData.subscription!,
          status: 'past_due',
        },
      });
      renderWithRouter(<SubscriptionPage />);

      // Multiple warning badges may exist (status + days remaining), check at least one exists
      const warningBadges = screen.getAllByTestId('badge-warning');
      expect(warningBadges.length).toBeGreaterThan(0);
      expect(screen.getByText('Past Due')).toBeInTheDocument();
    });

    it('displays status badge with danger color for cancelled status', () => {
      setMockSubscriptionData({
        subscription: {
          ...mockSubscriptionData.subscription!,
          status: 'cancelled',
        },
      });
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByTestId('badge-danger')).toBeInTheDocument();
      expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });

    it('displays status badge with danger color for suspended status', () => {
      setMockSubscriptionData({
        subscription: {
          ...mockSubscriptionData.subscription!,
          status: 'suspended',
        },
      });
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByTestId('badge-danger')).toBeInTheDocument();
      expect(screen.getByText('Suspended')).toBeInTheDocument();
    });

    it('displays "No Plan" when planName is null', () => {
      setMockSubscriptionData({
        subscription: {
          ...mockSubscriptionData.subscription!,
          planName: null,
        },
      });
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByText('No Plan')).toBeInTheDocument();
    });

    it('displays period start label', () => {
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByText('Period Start')).toBeInTheDocument();
    });

    it('displays period end label', () => {
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByText('Period End')).toBeInTheDocument();
    });

    it('displays credit card icon in plan overview', () => {
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByTestId('credit-card-icon')).toBeInTheDocument();
    });

    it('displays plan label', () => {
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByText('Plan')).toBeInTheDocument();
    });

    it('displays contact admin info notice', () => {
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByText('Need to change your subscription?')).toBeInTheDocument();
    });

    it('displays contact admin description', () => {
      renderWithRouter(<SubscriptionPage />);

      expect(
        screen.getByText(
          'To upgrade your plan, increase limits, or make changes to your subscription, please contact your platform administrator or support.'
        )
      ).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Resource Limits Display Tests
  // ===========================================================================

  describe('Resource Limits Display', () => {
    it('displays seat usage section heading', () => {
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByText('Seat Usage')).toBeInTheDocument();
    });

    it('displays resource limits section heading', () => {
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByText('Resource Limits')).toBeInTheDocument();
    });

    it('displays storage usage section heading', () => {
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByText('Storage Usage')).toBeInTheDocument();
    });

    // Stat Cards Tests
    describe('Stat Cards', () => {
      it('displays users stat card with correct values', () => {
        renderWithRouter(<SubscriptionPage />);

        const usersCard = screen.getByTestId('stat-card-users');
        expect(usersCard).toBeInTheDocument();
        expect(usersCard).toHaveTextContent('15');
        expect(usersCard).toHaveTextContent('of 50 max');
      });

      it('displays organizations stat card with correct values', () => {
        renderWithRouter(<SubscriptionPage />);

        const orgsCard = screen.getByTestId('stat-card-organizations');
        expect(orgsCard).toBeInTheDocument();
        expect(orgsCard).toHaveTextContent('3');
        expect(orgsCard).toHaveTextContent('of 10 max');
      });

      it('displays listings stat card with correct values', () => {
        renderWithRouter(<SubscriptionPage />);

        const listingsCard = screen.getByTestId('stat-card-listings');
        expect(listingsCard).toBeInTheDocument();
        expect(listingsCard).toHaveTextContent('25');
        expect(listingsCard).toHaveTextContent('of 100 max');
      });

      it('displays bookings stat card with correct values', () => {
        renderWithRouter(<SubscriptionPage />);

        const bookingsCard = screen.getByTestId('stat-card-bookings-month');
        expect(bookingsCard).toBeInTheDocument();
        expect(bookingsCard).toHaveTextContent('150');
        expect(bookingsCard).toHaveTextContent('of 500 max');
      });
    });

    // Progress Bars Tests
    describe('Progress Bars', () => {
      it('renders progress bars for resource limits', () => {
        renderWithRouter(<SubscriptionPage />);

        const progressBars = screen.getAllByRole('progressbar');
        expect(progressBars.length).toBeGreaterThanOrEqual(4);
      });

      it('displays progress bar with success color for low usage (< 75%)', () => {
        renderWithRouter(<SubscriptionPage />);

        // 15/50 = 30% usage for users
        const progressBars = screen.getAllByTestId('progress');
        const successBars = progressBars.filter((bar) => bar.dataset.color === 'success');
        expect(successBars.length).toBeGreaterThan(0);
      });

      it('displays progress bar with warning color for medium usage (75-89%)', () => {
        setMockSubscriptionData({
          subscription: {
            ...mockSubscriptionData.subscription!,
            usage: {
              currentUsers: 40, // 80% usage
              currentOrganizations: 3,
              currentListings: 25,
              bookingsThisMonth: 150,
              storageMb: 512,
            },
          },
        });
        renderWithRouter(<SubscriptionPage />);

        const progressBars = screen.getAllByTestId('progress');
        const warningBars = progressBars.filter((bar) => bar.dataset.color === 'warning');
        expect(warningBars.length).toBeGreaterThan(0);
      });

      it('displays progress bar with danger color for high usage (>= 90%)', () => {
        setMockSubscriptionData({
          subscription: {
            ...mockSubscriptionData.subscription!,
            usage: {
              currentUsers: 48, // 96% usage
              currentOrganizations: 3,
              currentListings: 25,
              bookingsThisMonth: 150,
              storageMb: 512,
            },
          },
        });
        renderWithRouter(<SubscriptionPage />);

        const progressBars = screen.getAllByTestId('progress');
        const dangerBars = progressBars.filter((bar) => bar.dataset.color === 'danger');
        expect(dangerBars.length).toBeGreaterThan(0);
      });
    });

    // Icons in Resource Limits
    describe('Resource Limit Icons', () => {
      it('displays users icon', () => {
        renderWithRouter(<SubscriptionPage />);

        expect(screen.getAllByTestId('users-icon').length).toBeGreaterThanOrEqual(1);
      });

      it('displays organization icon', () => {
        renderWithRouter(<SubscriptionPage />);

        expect(screen.getAllByTestId('organization-icon').length).toBeGreaterThanOrEqual(1);
      });

      it('displays building icon for listings', () => {
        renderWithRouter(<SubscriptionPage />);

        expect(screen.getAllByTestId('building-icon').length).toBeGreaterThanOrEqual(1);
      });

      it('displays calendar icon for bookings', () => {
        renderWithRouter(<SubscriptionPage />);

        expect(screen.getAllByTestId('calendar-icon').length).toBeGreaterThanOrEqual(1);
      });

      it('displays storage icon', () => {
        renderWithRouter(<SubscriptionPage />);

        expect(screen.getByTestId('storage-icon')).toBeInTheDocument();
      });
    });

    // Storage Usage Tests
    describe('Storage Usage', () => {
      it('displays storage percentage', () => {
        renderWithRouter(<SubscriptionPage />);

        // 512/2048 = 25%
        expect(screen.getByText('25%')).toBeInTheDocument();
      });

      it('displays storage usage in human-readable format (MB)', () => {
        setMockSubscriptionData({
          subscription: {
            ...mockSubscriptionData.subscription!,
            usage: {
              ...mockSubscriptionData.subscription!.usage!,
              storageMb: 512,
            },
            seatLimits: {
              ...mockSubscriptionData.subscription!.seatLimits!,
              maxStorageMb: 1000,
            },
          },
        });
        renderWithRouter(<SubscriptionPage />);

        expect(screen.getByText(/512 MB/)).toBeInTheDocument();
        expect(screen.getByText(/1000 MB/)).toBeInTheDocument();
      });

      it('displays storage usage in human-readable format (GB) for large values', () => {
        renderWithRouter(<SubscriptionPage />);

        // 2048 MB = 2.0 GB
        expect(screen.getByText(/2.0 GB/)).toBeInTheDocument();
      });

      it('displays storage available text', () => {
        renderWithRouter(<SubscriptionPage />);

        // 2048 - 512 = 1536 MB = 1.5 GB available
        expect(screen.getByText('1.5 GB available')).toBeInTheDocument();
      });
    });

    // Zero Values / Null Values
    describe('Zero and Null Values', () => {
      it('displays zero values when usage is null', () => {
        setMockSubscriptionData({
          subscription: {
            ...mockSubscriptionData.subscription!,
            usage: null,
            seatLimits: null,
          },
        });
        renderWithRouter(<SubscriptionPage />);

        const usersCard = screen.getByTestId('stat-card-users');
        expect(usersCard).toHaveTextContent('0');
      });

      it('handles zero limits gracefully', () => {
        setMockSubscriptionData({
          subscription: {
            ...mockSubscriptionData.subscription!,
            usage: {
              currentUsers: 0,
              currentOrganizations: 0,
              currentListings: 0,
              bookingsThisMonth: 0,
              storageMb: 0,
            },
            seatLimits: {
              maxUsers: 0,
              maxOrganizations: 0,
              maxListings: 0,
              maxBookingsPerMonth: 0,
              maxStorageMb: 0,
            },
          },
        });
        renderWithRouter(<SubscriptionPage />);

        // Should render without crashing (division by zero protection)
        expect(screen.getByText('Subscription')).toBeInTheDocument();
      });

      it('caps usage percentage at 100%', () => {
        setMockSubscriptionData({
          subscription: {
            ...mockSubscriptionData.subscription!,
            usage: {
              currentUsers: 100, // Over the limit
              currentOrganizations: 3,
              currentListings: 25,
              bookingsThisMonth: 150,
              storageMb: 512,
            },
            seatLimits: {
              maxUsers: 50, // Limit is 50
              maxOrganizations: 10,
              maxListings: 100,
              maxBookingsPerMonth: 500,
              maxStorageMb: 2048,
            },
          },
        });
        renderWithRouter(<SubscriptionPage />);

        // Progress bar should be capped at 100
        const progressBars = screen.getAllByTestId('progress');
        const usersProgressBar = progressBars[0];
        expect(Number(usersProgressBar.dataset.value)).toBeLessThanOrEqual(100);
      });
    });
  });

  // ===========================================================================
  // Days Remaining Badge Tests
  // ===========================================================================

  describe('Days Remaining Badge', () => {
    it('displays days remaining badge when within 30 days of period end', () => {
      // Set period end to 15 days from now
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      setMockSubscriptionData({
        subscription: {
          ...mockSubscriptionData.subscription!,
          currentPeriodEnd: futureDate.toISOString(),
        },
      });
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByText(/days remaining/)).toBeInTheDocument();
    });

    it('displays warning color badge when 7 or fewer days remaining', () => {
      // Set period end to 5 days from now
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      setMockSubscriptionData({
        subscription: {
          ...mockSubscriptionData.subscription!,
          currentPeriodEnd: futureDate.toISOString(),
        },
      });
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByTestId('badge-warning')).toBeInTheDocument();
    });

    it('displays neutral color badge when more than 7 days remaining', () => {
      // Set period end to 20 days from now
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 20);
      setMockSubscriptionData({
        subscription: {
          ...mockSubscriptionData.subscription!,
          currentPeriodEnd: futureDate.toISOString(),
        },
      });
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByTestId('badge-neutral')).toBeInTheDocument();
    });

    it('does not display days remaining badge when more than 30 days remaining', () => {
      // Set period end to 60 days from now
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 60);
      setMockSubscriptionData({
        subscription: {
          ...mockSubscriptionData.subscription!,
          currentPeriodEnd: futureDate.toISOString(),
        },
      });
      renderWithRouter(<SubscriptionPage />);

      expect(screen.queryByText(/days remaining/)).not.toBeInTheDocument();
    });

    it('displays clock icon in days remaining badge', () => {
      // Set period end to 15 days from now
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      setMockSubscriptionData({
        subscription: {
          ...mockSubscriptionData.subscription!,
          currentPeriodEnd: futureDate.toISOString(),
        },
      });
      renderWithRouter(<SubscriptionPage />);

      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Date Formatting Tests
  // ===========================================================================

  describe('Date Formatting', () => {
    it('displays dash when period start is null', () => {
      setMockSubscriptionData({
        subscription: {
          ...mockSubscriptionData.subscription!,
          currentPeriodStart: null,
        },
      });
      renderWithRouter(<SubscriptionPage />);

      const paragraphs = screen.getAllByTestId('paragraph');
      const hasEmptyDate = paragraphs.some((p) => p.textContent === '-');
      expect(hasEmptyDate).toBe(true);
    });

    it('displays dash when period end is null', () => {
      setMockSubscriptionData({
        subscription: {
          ...mockSubscriptionData.subscription!,
          currentPeriodEnd: null,
        },
      });
      renderWithRouter(<SubscriptionPage />);

      const paragraphs = screen.getAllByTestId('paragraph');
      const hasEmptyDate = paragraphs.some((p) => p.textContent === '-');
      expect(hasEmptyDate).toBe(true);
    });
  });
});
