/**
 * Header Component Unit Tests
 *
 * Tests for the SaaS Admin Header component including:
 * - Theme toggle functionality
 * - Navigation actions (notifications, settings)
 * - User authentication state
 * - Logout functionality
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as React from 'react';

// =============================================================================
// Mock Dependencies
// =============================================================================

// Track navigation calls
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useAuth hook
const mockLogout = vi.fn();
const defaultAuthContext = {
  user: {
    id: 'test-user-id',
    email: 'admin@digilist.no',
    name: 'Test Admin',
    role: 'SAAS_SUPER_ADMIN' as const,
  },
  isLoading: false,
  isAuthenticated: true,
  isSuperAdmin: true,
  isBillingAdmin: false,
  isSupportAgent: false,
  login: vi.fn(),
  logout: mockLogout,
  checkRole: vi.fn(),
};

let mockAuthReturn = { ...defaultAuthContext };

vi.mock('../../../../../apps/saas-admin/src/hooks/useAuth', () => ({
  useAuth: () => mockAuthReturn,
}));

// Mock useTheme hook
const mockToggleTheme = vi.fn();
const defaultThemeContext = {
  colorScheme: 'auto' as const,
  isDark: false,
  toggleTheme: mockToggleTheme,
  setColorScheme: vi.fn(),
  resetToAuto: vi.fn(),
};

let mockThemeReturn = { ...defaultThemeContext };

vi.mock('../../../../../apps/saas-admin/src/providers/ThemeProvider', () => ({
  useTheme: () => mockThemeReturn,
}));

// Mock @xala/ds components
vi.mock('@xala/ds', () => ({
  HeaderActions: ({ children, spacing }: { children: React.ReactNode; spacing?: string }) => (
    <div data-testid="header-actions" style={{ gap: spacing }}>{children}</div>
  ),
  HeaderIconButton: ({
    icon,
    'aria-label': ariaLabel,
    title,
    onClick,
    size
  }: {
    icon: React.ReactNode;
    'aria-label'?: string;
    title?: string;
    onClick?: () => void;
    size?: string;
  }) => (
    <button
      data-testid={`icon-button-${ariaLabel?.toLowerCase().replace(/\s/g, '-')}`}
      aria-label={ariaLabel}
      title={title}
      onClick={onClick}
      data-size={size}
    >
      {icon}
    </button>
  ),
  HeaderThemeToggle: ({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) => (
    <button
      data-testid="theme-toggle"
      data-is-dark={isDark}
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      Toggle Theme
    </button>
  ),
  Button: ({
    children,
    onClick,
    variant,
    type,
    'aria-label': ariaLabel,
    style
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    type?: 'button' | 'submit' | 'reset';
    'aria-label'?: string;
    style?: React.CSSProperties;
  }) => (
    <button
      data-testid="logout-button"
      onClick={onClick}
      data-variant={variant}
      type={type}
      aria-label={ariaLabel}
      style={style}
    >
      {children}
    </button>
  ),
  BellIcon: ({ size }: { size?: number }) => <span data-testid="bell-icon" data-size={size}>Bell</span>,
  SettingsIcon: ({ size }: { size?: number }) => <span data-testid="settings-icon" data-size={size}>Settings</span>,
  LogOutIcon: ({ size }: { size?: number }) => <span data-testid="logout-icon" data-size={size}>LogOut</span>,
}));

// Import component after mocks
import { Header } from '../../../../../apps/saas-admin/src/components/layout/Header';

// =============================================================================
// Test Utilities
// =============================================================================

function renderHeader(title?: string) {
  return render(
    <MemoryRouter>
      <Header title={title} />
    </MemoryRouter>
  );
}

// =============================================================================
// Test Suite
// =============================================================================

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthReturn = { ...defaultAuthContext };
    mockThemeReturn = { ...defaultThemeContext };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Structure Tests
  // ===========================================================================

  describe('Structure', () => {
    it('renders as a header element', () => {
      renderHeader();

      const header = document.querySelector('header');
      expect(header).toBeInTheDocument();
    });

    it('renders the header actions container', () => {
      renderHeader();

      expect(screen.getByTestId('header-actions')).toBeInTheDocument();
    });

    it('renders theme toggle button', () => {
      renderHeader();

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('renders notifications button', () => {
      renderHeader();

      expect(screen.getByTestId('icon-button-varsler')).toBeInTheDocument();
    });

    it('renders settings button', () => {
      renderHeader();

      expect(screen.getByTestId('icon-button-innstillinger')).toBeInTheDocument();
    });

    it('renders logout button when user is logged in', () => {
      renderHeader();

      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    });

    it('renders bell icon with correct size', () => {
      renderHeader();

      const bellIcon = screen.getByTestId('bell-icon');
      expect(bellIcon).toBeInTheDocument();
      expect(bellIcon).toHaveAttribute('data-size', '22');
    });

    it('renders settings icon with correct size', () => {
      renderHeader();

      const settingsIcon = screen.getByTestId('settings-icon');
      expect(settingsIcon).toBeInTheDocument();
      expect(settingsIcon).toHaveAttribute('data-size', '22');
    });

    it('renders logout icon with correct size', () => {
      renderHeader();

      const logoutIcon = screen.getByTestId('logout-icon');
      expect(logoutIcon).toBeInTheDocument();
      expect(logoutIcon).toHaveAttribute('data-size', '20');
    });
  });

  // ===========================================================================
  // Theme Toggle Tests
  // ===========================================================================

  describe('Theme Toggle', () => {
    it('passes isDark state to theme toggle', () => {
      mockThemeReturn = { ...defaultThemeContext, isDark: false };
      renderHeader();

      const toggle = screen.getByTestId('theme-toggle');
      expect(toggle).toHaveAttribute('data-is-dark', 'false');
    });

    it('shows dark state when isDark is true', () => {
      mockThemeReturn = { ...defaultThemeContext, isDark: true };
      renderHeader();

      const toggle = screen.getByTestId('theme-toggle');
      expect(toggle).toHaveAttribute('data-is-dark', 'true');
    });

    it('calls toggleTheme when clicked', () => {
      renderHeader();

      const toggle = screen.getByTestId('theme-toggle');
      fireEvent.click(toggle);

      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Navigation Tests
  // ===========================================================================

  describe('Navigation', () => {
    it('navigates to /notifications when bell icon is clicked', () => {
      renderHeader();

      const notificationsButton = screen.getByTestId('icon-button-varsler');
      fireEvent.click(notificationsButton);

      expect(mockNavigate).toHaveBeenCalledWith('/notifications');
    });

    it('navigates to /settings when settings icon is clicked', () => {
      renderHeader();

      const settingsButton = screen.getByTestId('icon-button-innstillinger');
      fireEvent.click(settingsButton);

      expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });

    it('has correct aria-labels for navigation buttons', () => {
      renderHeader();

      expect(screen.getByTestId('icon-button-varsler')).toHaveAttribute('aria-label', 'Varsler');
      expect(screen.getByTestId('icon-button-innstillinger')).toHaveAttribute('aria-label', 'Innstillinger');
    });

    it('has correct titles for navigation buttons', () => {
      renderHeader();

      expect(screen.getByTestId('icon-button-varsler')).toHaveAttribute('title', 'Varsler');
      expect(screen.getByTestId('icon-button-innstillinger')).toHaveAttribute('title', 'Innstillinger');
    });
  });

  // ===========================================================================
  // Logout Tests
  // ===========================================================================

  describe('Logout', () => {
    it('calls logout when logout button is clicked', () => {
      renderHeader();

      const logoutButton = screen.getByTestId('logout-button');
      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('renders logout button with tertiary variant', () => {
      renderHeader();

      const logoutButton = screen.getByTestId('logout-button');
      expect(logoutButton).toHaveAttribute('data-variant', 'tertiary');
    });

    it('renders logout button with button type', () => {
      renderHeader();

      const logoutButton = screen.getByTestId('logout-button');
      expect(logoutButton).toHaveAttribute('type', 'button');
    });

    it('has correct aria-label on logout button', () => {
      renderHeader();

      const logoutButton = screen.getByTestId('logout-button');
      expect(logoutButton).toHaveAttribute('aria-label', 'Logg ut');
    });

    it('displays "Logg ut" text in logout button', () => {
      renderHeader();

      expect(screen.getByTestId('logout-button')).toHaveTextContent('Logg ut');
    });
  });

  // ===========================================================================
  // User State Tests
  // ===========================================================================

  describe('User State', () => {
    it('does not render logout button when user is not logged in', () => {
      mockAuthReturn = { ...defaultAuthContext, user: null as unknown as typeof defaultAuthContext.user };
      renderHeader();

      expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();
    });

    it('renders logout button when user exists', () => {
      renderHeader();

      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Styling Tests
  // ===========================================================================

  describe('Styling', () => {
    it('header has sticky positioning', () => {
      renderHeader();

      const header = document.querySelector('header');
      expect(header).toHaveStyle({ position: 'sticky' });
    });

    it('header has top: 0 for sticky positioning', () => {
      renderHeader();

      const header = document.querySelector('header');
      expect(header).toHaveStyle({ top: '0' });
    });

    it('header has high z-index', () => {
      renderHeader();

      const header = document.querySelector('header');
      expect(header).toHaveStyle({ zIndex: '100' });
    });

    it('contains divider element between actions', () => {
      renderHeader();

      // The divider is a div with specific styling
      const dividers = document.querySelectorAll('div[style*="height: 28px"]');
      expect(dividers.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // Props Tests
  // ===========================================================================

  describe('Props', () => {
    it('accepts title prop without error', () => {
      expect(() => renderHeader('Test Title')).not.toThrow();
    });

    it('accepts undefined title prop', () => {
      expect(() => renderHeader()).not.toThrow();
    });

    it('renders without title prop', () => {
      renderHeader();

      expect(document.querySelector('header')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('uses semantic header element', () => {
      renderHeader();

      expect(document.querySelector('header')).toBeInTheDocument();
    });

    it('all interactive elements have accessible labels', () => {
      renderHeader();

      expect(screen.getByTestId('theme-toggle')).toHaveAttribute('aria-label');
      expect(screen.getByTestId('icon-button-varsler')).toHaveAttribute('aria-label');
      expect(screen.getByTestId('icon-button-innstillinger')).toHaveAttribute('aria-label');
      expect(screen.getByTestId('logout-button')).toHaveAttribute('aria-label');
    });

    it('buttons have proper type attribute', () => {
      renderHeader();

      const logoutButton = screen.getByTestId('logout-button');
      expect(logoutButton).toHaveAttribute('type', 'button');
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('Edge Cases', () => {
    it('handles rapid theme toggle clicks', () => {
      renderHeader();

      const toggle = screen.getByTestId('theme-toggle');

      fireEvent.click(toggle);
      fireEvent.click(toggle);
      fireEvent.click(toggle);

      expect(mockToggleTheme).toHaveBeenCalledTimes(3);
    });

    it('handles rapid navigation clicks', () => {
      renderHeader();

      const notificationsButton = screen.getByTestId('icon-button-varsler');

      fireEvent.click(notificationsButton);
      fireEvent.click(notificationsButton);

      expect(mockNavigate).toHaveBeenCalledTimes(2);
    });

    it('renders consistently on rerender', () => {
      const { rerender } = renderHeader();

      expect(screen.getByTestId('header-actions')).toBeInTheDocument();

      rerender(
        <MemoryRouter>
          <Header title="New Title" />
        </MemoryRouter>
      );

      expect(screen.getByTestId('header-actions')).toBeInTheDocument();
    });
  });
});
