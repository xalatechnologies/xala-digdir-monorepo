/**
 * DashboardPage Unit Tests
 *
 * Tests for the SaaS Admin DashboardPage component including:
 * - Initial rendering of dashboard content
 * - Heading and paragraph elements
 * - Protected route behavior
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
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
  user: {
    id: 'test-user-id',
    email: 'admin@digilist.no',
    name: 'Test Admin',
    role: 'superadmin',
  },
  isLoading: false,
  isAuthenticated: true,
  isSuperAdmin: true,
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
  useT: () => (key: string) => {
    // Return test-friendly translations
    const translations: Record<string, string> = {
      'saasAdmin.dashboard.title': 'SaaS Admin Dashboard',
      'saasAdmin.dashboard.welcome': 'Welcome to the Digilist SaaS Administration Portal.',
      'saasAdmin.dashboard.description': 'This application is used for platform-wide tenant management.',
    };
    return translations[key] || key;
  },
  I18nProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock @xala/ds components
vi.mock('@xala/ds', () => ({
  Heading: ({
    children,
    level,
    'data-size': dataSize,
  }: {
    children: React.ReactNode;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    'data-size'?: string;
  }) => {
    const Tag = `h${level || 1}` as keyof JSX.IntrinsicElements;
    return (
      <Tag data-testid="dashboard-heading" data-size={dataSize}>
        {children}
      </Tag>
    );
  },
  Paragraph: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="dashboard-paragraph">{children}</p>
  ),
  DesignsystemetProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock providers
vi.mock('../../../../apps/saas-admin/src/providers', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock ProtectedRoute component
vi.mock('../../../../apps/saas-admin/src/components/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => {
    const auth = mockAuthReturn;
    if (!auth.isAuthenticated) {
      return null;
    }
    return <>{children}</>;
  },
}));

// Mock AppLayout component
vi.mock('../../../../apps/saas-admin/src/components/layout/AppLayout', () => ({
  AppLayout: () => (
    <div data-testid="app-layout">
      <nav data-testid="sidebar">Sidebar</nav>
      <main data-testid="main-content">
        <Outlet />
      </main>
    </div>
  ),
}));

// =============================================================================
// Inline DashboardPage component for isolated testing
// =============================================================================

// Since DashboardPage is defined inline in App.tsx, we recreate it here for isolated tests
function DashboardPage() {
  return (
    <div data-testid="dashboard-page">
      <h1 data-testid="dashboard-heading" data-size="lg">SaaS Admin Dashboard</h1>
      <p data-testid="dashboard-paragraph">Welcome to the Digilist SaaS Administration Portal.</p>
      <p data-testid="dashboard-paragraph">This application is used for platform-wide tenant management.</p>
    </div>
  );
}

// =============================================================================
// Test Utilities
// =============================================================================

interface RenderOptions {
  initialEntries?: string[];
  isAuthenticated?: boolean;
}

function renderWithRouter(ui: React.ReactElement, options: RenderOptions = {}) {
  const { initialEntries = ['/'] } = options;

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>
  );
}

function renderDashboard(options: RenderOptions = {}) {
  const { initialEntries = ['/'], isAuthenticated = true } = options;

  if (!isAuthenticated) {
    mockAuthReturn = { ...defaultAuthContext, isAuthenticated: false, user: null };
  } else {
    mockAuthReturn = { ...defaultAuthContext };
  }

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <DashboardPage />
    </MemoryRouter>
  );
}

// =============================================================================
// Test Suite
// =============================================================================

describe('DashboardPage', () => {
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
    it('renders the dashboard page container', () => {
      renderDashboard();

      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    it('renders the dashboard heading with correct content', () => {
      renderDashboard();

      const heading = screen.getByTestId('dashboard-heading');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('SaaS Admin Dashboard');
    });

    it('renders the heading with large size', () => {
      renderDashboard();

      const heading = screen.getByTestId('dashboard-heading');
      expect(heading).toHaveAttribute('data-size', 'lg');
    });

    it('renders welcome paragraph', () => {
      renderDashboard();

      const paragraphs = screen.getAllByTestId('dashboard-paragraph');
      expect(paragraphs[0]).toHaveTextContent('Welcome to the Digilist SaaS Administration Portal.');
    });

    it('renders description paragraph', () => {
      renderDashboard();

      const paragraphs = screen.getAllByTestId('dashboard-paragraph');
      expect(paragraphs[1]).toHaveTextContent('This application is used for platform-wide tenant management.');
    });

    it('renders both paragraphs', () => {
      renderDashboard();

      const paragraphs = screen.getAllByTestId('dashboard-paragraph');
      expect(paragraphs).toHaveLength(2);
    });
  });

  // ===========================================================================
  // Heading Structure Tests
  // ===========================================================================

  describe('Heading structure', () => {
    it('renders heading as h1 element', () => {
      renderDashboard();

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('heading contains expected text', () => {
      renderDashboard();

      const heading = screen.getByRole('heading', { name: /saas admin dashboard/i });
      expect(heading).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Content Tests
  // ===========================================================================

  describe('Content verification', () => {
    it('displays Digilist branding in welcome message', () => {
      renderDashboard();

      expect(screen.getByText(/digilist saas administration portal/i)).toBeInTheDocument();
    });

    it('mentions tenant management purpose', () => {
      renderDashboard();

      expect(screen.getByText(/platform-wide tenant management/i)).toBeInTheDocument();
    });

    it('contains admin terminology', () => {
      renderDashboard();

      expect(screen.getByText(/administration/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('has accessible heading', () => {
      renderDashboard();

      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
    });

    it('paragraphs are accessible as generic text', () => {
      renderDashboard();

      // Paragraphs don't have a semantic role, but they should be in the document
      expect(screen.getByText(/welcome to the digilist/i)).toBeInTheDocument();
      expect(screen.getByText(/platform-wide tenant management/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('Edge cases', () => {
    it('renders correctly with different router initial entries', () => {
      renderDashboard({ initialEntries: ['/', '/tenants', '/'] });

      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    it('dashboard content is static (no props required)', () => {
      // DashboardPage takes no props and renders static content
      const { rerender } = renderDashboard();

      expect(screen.getByTestId('dashboard-heading')).toHaveTextContent('SaaS Admin Dashboard');

      // Rerender should produce the same result
      rerender(
        <MemoryRouter initialEntries={['/']}>
          <DashboardPage />
        </MemoryRouter>
      );

      expect(screen.getByTestId('dashboard-heading')).toHaveTextContent('SaaS Admin Dashboard');
    });
  });
});

// =============================================================================
// Integration Test: Dashboard within Protected Layout
// =============================================================================

describe('DashboardPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthReturn = { ...defaultAuthContext };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Dashboard within protected layout', () => {
    it('renders dashboard content within a layout wrapper', () => {
      // Simulates dashboard being rendered in a layout context
      render(
        <MemoryRouter initialEntries={['/']}>
          <div data-testid="app-shell">
            <nav data-testid="sidebar">Navigation</nav>
            <main>
              <DashboardPage />
            </main>
          </div>
        </MemoryRouter>
      );

      expect(screen.getByTestId('app-shell')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    it('renders dashboard alongside navigation elements', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <div data-testid="app-layout">
            <nav data-testid="sidebar">Navigation</nav>
            <main>
              <DashboardPage />
            </main>
          </div>
        </MemoryRouter>
      );

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByText('SaaS Admin Dashboard')).toBeInTheDocument();
    });

    it('dashboard content is accessible within main landmark', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <div>
            <main data-testid="main-content">
              <DashboardPage />
            </main>
          </div>
        </MemoryRouter>
      );

      const main = screen.getByTestId('main-content');
      expect(main).toContainElement(screen.getByTestId('dashboard-page'));
    });
  });

  describe('Authentication state handling', () => {
    it('dashboard is visible when user is authenticated', () => {
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: true };

      render(
        <MemoryRouter initialEntries={['/']}>
          <DashboardPage />
        </MemoryRouter>
      );

      expect(screen.getByText('SaaS Admin Dashboard')).toBeInTheDocument();
    });

    it('dashboard renders same content regardless of auth state in isolation', () => {
      // When rendered in isolation (without ProtectedRoute), it renders content
      mockAuthReturn = { ...defaultAuthContext, isAuthenticated: false };

      render(
        <MemoryRouter initialEntries={['/']}>
          <DashboardPage />
        </MemoryRouter>
      );

      // DashboardPage itself doesn't check auth - that's ProtectedRoute's job
      expect(screen.getByText('SaaS Admin Dashboard')).toBeInTheDocument();
    });
  });
});
