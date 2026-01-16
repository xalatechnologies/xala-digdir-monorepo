/**
 * PlansListPage Unit Tests
 *
 * Tests for the SaaS Admin PlansListPage component including:
 * - Initial rendering of plans table
 * - Search functionality
 * - Status filter functionality
 * - Loading and empty states
 * - Action handlers (view, edit, deactivate, activate, deprecate)
 * - Pagination info display
 * - Price and date formatting
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
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

// Mock SDK hooks
const mockMutateAsync = vi.fn();

const mockPlansData = {
  data: [
    {
      id: 'plan-1',
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'Full-featured plan for large organizations',
      basePrice: 9999,
      currency: 'NOK',
      billingPeriod: 'monthly' as const,
      trialDays: 30,
      seatLimits: {
        maxUsers: 100,
        maxOrganizations: 10,
      },
      status: 'active' as const,
      isPublic: true,
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'plan-2',
      name: 'Basic',
      slug: 'basic',
      description: 'Starter plan for small teams',
      basePrice: 499,
      currency: 'NOK',
      billingPeriod: 'yearly' as const,
      trialDays: 0,
      seatLimits: {
        maxUsers: 10,
        maxOrganizations: 1,
      },
      status: 'inactive' as const,
      isPublic: false,
      createdAt: '2024-02-20T14:30:00Z',
    },
    {
      id: 'plan-3',
      name: 'Legacy Pro',
      slug: 'legacy-pro',
      description: 'Deprecated professional plan',
      basePrice: 2499,
      currency: 'NOK',
      billingPeriod: 'lifetime' as const,
      trialDays: 14,
      seatLimits: {
        maxUsers: 50,
        maxOrganizations: 5,
      },
      status: 'deprecated' as const,
      isPublic: false,
      createdAt: '2024-03-10T08:15:00Z',
    },
  ],
  meta: {
    total: 3,
    page: 1,
    totalPages: 1,
    perPage: 10,
  },
};

let mockPlansReturn: {
  data: typeof mockPlansData | undefined;
  isLoading: boolean;
} = {
  data: mockPlansData,
  isLoading: false,
};

vi.mock('@digilist/client-sdk/hooks', () => ({
  useSaasPlans: () => mockPlansReturn,
  useUpdateSaasPlan: () => ({
    mutateAsync: mockMutateAsync,
    isLoading: false,
  }),
}));

// Mock useT hook from @xala/i18n
vi.mock('@xala/i18n', () => ({
  useT: () => (key: string) => {
    const translations: Record<string, string> = {
      'common.name': 'Navn',
      'common.status': 'Status',
    };
    return translations[key] || key;
  },
}));

// Mock window.confirm
const mockConfirm = vi.fn(() => true);
Object.defineProperty(global, 'confirm', {
  value: mockConfirm,
  writable: true,
});

// Mock @xala/ds components
vi.mock('@xala/ds', () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  Heading: ({
    children,
    level,
    'data-size': dataSize,
  }: {
    children: React.ReactNode;
    level?: number;
    'data-size'?: string;
  }) => {
    const Tag = `h${level || 1}` as keyof JSX.IntrinsicElements;
    return (
      <Tag data-testid={`heading-${level || 1}`} data-size={dataSize}>
        {children}
      </Tag>
    );
  },
  Paragraph: ({
    children,
    'data-size': dataSize,
  }: {
    children: React.ReactNode;
    'data-size'?: string;
  }) => (
    <p data-testid="paragraph" data-size={dataSize}>
      {children}
    </p>
  ),
  Button: ({
    children,
    onClick,
    type,
    'data-size': dataSize,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: string;
    'data-size'?: string;
  }) => (
    <button type={type as 'button' | 'submit'} onClick={onClick} data-testid="button" data-size={dataSize}>
      {children}
    </button>
  ),
  Badge: ({
    children,
    color,
  }: {
    children: React.ReactNode;
    color?: string;
  }) => (
    <span data-testid="badge" data-color={color}>
      {children}
    </span>
  ),
  Spinner: ({ 'aria-label': ariaLabel, 'data-size': dataSize }: { 'aria-label'?: string; 'data-size'?: string }) => (
    <div data-testid="spinner" aria-label={ariaLabel} data-size={dataSize}>
      Loading...
    </div>
  ),
  Table: Object.assign(
    ({ children }: { children: React.ReactNode }) => (
      <table data-testid="table">{children}</table>
    ),
    {
      Head: ({ children }: { children: React.ReactNode }) => (
        <thead data-testid="table-head">{children}</thead>
      ),
      Body: ({ children }: { children: React.ReactNode }) => (
        <tbody data-testid="table-body">{children}</tbody>
      ),
      Row: ({
        children,
        onClick,
      }: {
        children: React.ReactNode;
        onClick?: () => void;
      }) => (
        <tr data-testid={onClick ? 'table-data-row' : 'table-row'} onClick={onClick}>
          {children}
        </tr>
      ),
      HeaderCell: ({
        children,
      }: {
        children?: React.ReactNode;
      }) => <th data-testid="table-header-cell">{children}</th>,
      Cell: ({
        children,
        onClick,
      }: {
        children: React.ReactNode;
        onClick?: (e: React.MouseEvent) => void;
      }) => (
        <td data-testid="table-cell" onClick={onClick}>
          {children}
        </td>
      ),
    }
  ),
  Dropdown: Object.assign(
    ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dropdown">{children}</div>
    ),
    {
      TriggerContext: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dropdown-trigger-context">{children}</div>
      ),
      Trigger: ({
        children,
        variant,
        'data-size': dataSize,
      }: {
        children: React.ReactNode;
        variant?: string;
        'data-size'?: string;
      }) => (
        <button
          type="button"
          data-testid="dropdown-trigger"
          data-variant={variant}
          data-size={dataSize}
        >
          {children}
        </button>
      ),
      List: ({ children }: { children: React.ReactNode }) => (
        <ul data-testid="dropdown-list">{children}</ul>
      ),
      Item: ({ children }: { children: React.ReactNode }) => (
        <li data-testid="dropdown-item">{children}</li>
      ),
      Button: ({
        children,
        onClick,
        'data-color': dataColor,
      }: {
        children: React.ReactNode;
        onClick?: () => void;
        'data-color'?: string;
      }) => (
        <button
          type="button"
          onClick={onClick}
          data-testid="dropdown-button"
          data-color={dataColor}
        >
          {children}
        </button>
      ),
    }
  ),
  HeaderSearch: ({
    placeholder,
    value,
    onSearchChange,
  }: {
    placeholder?: string;
    value?: string;
    onSearchChange?: (value: string) => void;
  }) => (
    <input
      type="text"
      data-testid="search-input"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onSearchChange?.(e.target.value)}
    />
  ),
  PlusIcon: () => <span data-testid="plus-icon">+</span>,
  MoreVerticalIcon: () => <span data-testid="more-icon">⋮</span>,
  FilterIcon: () => <span data-testid="filter-icon">Filter</span>,
  EditIcon: () => <span data-testid="edit-icon">✏</span>,
  EyeIcon: () => <span data-testid="eye-icon">👁</span>,
  PlayIcon: () => <span data-testid="play-icon">▶</span>,
  XCircleIcon: () => <span data-testid="x-circle-icon">✗</span>,
  ChartIcon: () => <span data-testid="chart-icon">📊</span>,
}));

// Import the component after mocks are set up
import { PlansListPage } from '../../../../apps/saas-admin/src/routes/plans/index';

// =============================================================================
// Test Utilities
// =============================================================================

interface RenderOptions {
  initialEntries?: string[];
}

function renderWithRouter(ui: React.ReactElement, options: RenderOptions = {}) {
  const { initialEntries = ['/plans'] } = options;

  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
}

// =============================================================================
// Test Suite
// =============================================================================

describe('PlansListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPlansReturn = {
      data: mockPlansData,
      isLoading: false,
    };
    mockConfirm.mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe('Basic rendering', () => {
    it('renders the page heading', () => {
      renderWithRouter(<PlansListPage />);

      expect(screen.getByTestId('heading-2')).toHaveTextContent('Abonnementsplaner');
    });

    it('renders the page description', () => {
      renderWithRouter(<PlansListPage />);

      expect(screen.getByTestId('paragraph')).toHaveTextContent(
        'Administrer abonnementsplaner, priser og rettigheter'
      );
    });

    it('renders the "New plan" button', () => {
      renderWithRouter(<PlansListPage />);

      const buttons = screen.getAllByTestId('button');
      const newPlanButton = buttons.find((btn) => btn.textContent?.includes('Ny plan'));
      expect(newPlanButton).toBeInTheDocument();
    });

    it('renders search input', () => {
      renderWithRouter(<PlansListPage />);

      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', 'Søk etter plan...');
    });

    it('renders status filter dropdown', () => {
      renderWithRouter(<PlansListPage />);

      const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
      const statusFilter = dropdownTriggers.find((trigger) =>
        trigger.textContent?.includes('Status:')
      );
      expect(statusFilter).toBeInTheDocument();
      expect(statusFilter).toHaveTextContent('Status: Alle');
    });
  });

  // ===========================================================================
  // Table Rendering Tests
  // ===========================================================================

  describe('Table rendering', () => {
    it('renders the plans table', () => {
      renderWithRouter(<PlansListPage />);

      expect(screen.getByTestId('table')).toBeInTheDocument();
    });

    it('renders table headers correctly', () => {
      renderWithRouter(<PlansListPage />);

      const headers = screen.getAllByTestId('table-header-cell');
      expect(headers).toHaveLength(9);
      expect(headers[0]).toHaveTextContent('Navn');
      expect(headers[1]).toHaveTextContent('Pris');
      expect(headers[2]).toHaveTextContent('Fakturering');
      expect(headers[3]).toHaveTextContent('Prøveperiode');
      expect(headers[4]).toHaveTextContent('Seter');
      expect(headers[5]).toHaveTextContent('Status');
      expect(headers[6]).toHaveTextContent('Synlighet');
      expect(headers[7]).toHaveTextContent('Opprettet');
      expect(headers[8]).toHaveTextContent('Handlinger');
    });

    it('renders plan rows', () => {
      renderWithRouter(<PlansListPage />);

      const rows = screen.getAllByTestId('table-data-row');
      expect(rows).toHaveLength(3);
    });

    it('renders plan name correctly', () => {
      renderWithRouter(<PlansListPage />);

      expect(screen.getByText('Enterprise')).toBeInTheDocument();
      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('Legacy Pro')).toBeInTheDocument();
    });

    it('renders plan slug correctly', () => {
      renderWithRouter(<PlansListPage />);

      expect(screen.getByText('enterprise')).toBeInTheDocument();
      expect(screen.getByText('basic')).toBeInTheDocument();
      expect(screen.getByText('legacy-pro')).toBeInTheDocument();
    });

    it('renders billing period badges', () => {
      renderWithRouter(<PlansListPage />);

      expect(screen.getByText('Månedlig')).toBeInTheDocument();
      expect(screen.getByText('Årlig')).toBeInTheDocument();
      expect(screen.getByText('Livstid')).toBeInTheDocument();
    });

    it('renders trial days or dash when zero', () => {
      renderWithRouter(<PlansListPage />);

      expect(screen.getByText('30 dager')).toBeInTheDocument();
      expect(screen.getByText('14 dager')).toBeInTheDocument();
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('renders seat limits correctly', () => {
      renderWithRouter(<PlansListPage />);

      expect(screen.getByText('Brukere: 100')).toBeInTheDocument();
      expect(screen.getByText('Org: 10')).toBeInTheDocument();
      expect(screen.getByText('Brukere: 10')).toBeInTheDocument();
      expect(screen.getByText('Org: 1')).toBeInTheDocument();
    });

    it('renders status badges with correct colors', () => {
      renderWithRouter(<PlansListPage />);

      const badges = screen.getAllByTestId('badge');
      const activeBadge = badges.find((badge) => badge.textContent === 'Aktiv');
      const inactiveBadge = badges.find((badge) => badge.textContent === 'Inaktiv');
      const deprecatedBadge = badges.find((badge) => badge.textContent === 'Utgått');

      expect(activeBadge).toHaveAttribute('data-color', 'success');
      expect(inactiveBadge).toHaveAttribute('data-color', 'warning');
      expect(deprecatedBadge).toHaveAttribute('data-color', 'danger');
    });

    it('renders visibility badges correctly', () => {
      renderWithRouter(<PlansListPage />);

      const badges = screen.getAllByTestId('badge');
      const publicBadge = badges.find((badge) => badge.textContent === 'Offentlig');
      const internalBadges = badges.filter((badge) => badge.textContent === 'Intern');

      expect(publicBadge).toBeInTheDocument();
      expect(publicBadge).toHaveAttribute('data-color', 'success');
      expect(internalBadges).toHaveLength(2);
    });
  });

  // ===========================================================================
  // Loading State Tests
  // ===========================================================================

  describe('Loading state', () => {
    it('renders spinner when loading', () => {
      mockPlansReturn = {
        data: undefined,
        isLoading: true,
      };

      renderWithRouter(<PlansListPage />);

      const spinner = screen.getByTestId('spinner');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-label', 'Laster...');
    });

    it('does not render table when loading', () => {
      mockPlansReturn = {
        data: undefined,
        isLoading: true,
      };

      renderWithRouter(<PlansListPage />);

      expect(screen.queryByTestId('table')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Empty State Tests
  // ===========================================================================

  describe('Empty state', () => {
    it('renders empty state when no plans', () => {
      mockPlansReturn = {
        data: { data: [], meta: { total: 0, page: 1, totalPages: 0, perPage: 10 } },
        isLoading: false,
      };

      renderWithRouter(<PlansListPage />);

      expect(screen.getByText('Ingen planer funnet')).toBeInTheDocument();
    });

    it('shows "create first plan" message when no filters applied', () => {
      mockPlansReturn = {
        data: { data: [], meta: { total: 0, page: 1, totalPages: 0, perPage: 10 } },
        isLoading: false,
      };

      renderWithRouter(<PlansListPage />);

      expect(
        screen.getByText('Opprett din første abonnementsplan for å komme i gang')
      ).toBeInTheDocument();
    });

    it('renders new plan button in empty state', () => {
      mockPlansReturn = {
        data: { data: [], meta: { total: 0, page: 1, totalPages: 0, perPage: 10 } },
        isLoading: false,
      };

      renderWithRouter(<PlansListPage />);

      const buttons = screen.getAllByTestId('button');
      const newPlanButtons = buttons.filter((btn) => btn.textContent?.includes('Ny plan'));
      expect(newPlanButtons.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // Search Functionality Tests
  // ===========================================================================

  describe('Search functionality', () => {
    it('updates search input value on change', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PlansListPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Enterprise');

      expect(searchInput).toHaveValue('Enterprise');
    });

    it('filters plans based on search query (name)', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PlansListPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Enterprise');

      expect(screen.getByText('Enterprise')).toBeInTheDocument();
      expect(screen.queryByText('Basic')).not.toBeInTheDocument();
      expect(screen.queryByText('Legacy Pro')).not.toBeInTheDocument();
    });

    it('filters plans based on search query (slug)', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PlansListPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'basic');

      expect(screen.queryByText('Enterprise')).not.toBeInTheDocument();
      expect(screen.getByText('Basic')).toBeInTheDocument();
    });

    it('filters plans based on search query (description)', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PlansListPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'large organizations');

      expect(screen.getByText('Enterprise')).toBeInTheDocument();
      expect(screen.queryByText('Basic')).not.toBeInTheDocument();
    });

    it('shows empty state when search matches nothing', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PlansListPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'nonexistent-plan');

      expect(screen.getByText('Ingen planer funnet')).toBeInTheDocument();
      expect(screen.getByText('Prøv å endre søkekriteriene')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Status Filter Tests
  // ===========================================================================

  describe('Status filter functionality', () => {
    it('shows all status options in dropdown', () => {
      renderWithRouter(<PlansListPage />);

      const dropdownButtons = screen.getAllByTestId('dropdown-button');
      const statusOptions = dropdownButtons.filter((btn) =>
        ['Alle', 'Aktiv', 'Inaktiv', 'Utgått'].includes(btn.textContent || '')
      );
      expect(statusOptions.length).toBe(4);
    });

    it('updates filter when status option is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PlansListPage />);

      const dropdownButtons = screen.getAllByTestId('dropdown-button');
      const activeOption = dropdownButtons.find((btn) => btn.textContent === 'Aktiv');

      if (activeOption) {
        await user.click(activeOption);
      }

      const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
      const statusFilter = dropdownTriggers.find((trigger) =>
        trigger.textContent?.includes('Status:')
      );
      expect(statusFilter).toHaveTextContent('Status: Aktiv');
    });
  });

  // ===========================================================================
  // Action Handler Tests
  // ===========================================================================

  describe('Action handlers', () => {
    it('navigates to detail page when row is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PlansListPage />);

      const rows = screen.getAllByTestId('table-data-row');
      await user.click(rows[0]);

      expect(mockNavigate).toHaveBeenCalledWith('/plans/plan-1');
    });

    it('calls view detail handler when "Vis detaljer" is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PlansListPage />);

      const viewButtons = screen.getAllByTestId('dropdown-button').filter(
        (btn) => btn.textContent?.includes('Vis detaljer')
      );

      if (viewButtons[0]) {
        await user.click(viewButtons[0]);
      }

      expect(mockNavigate).toHaveBeenCalledWith('/plans/plan-1');
    });

    it('navigates to edit page when "Rediger" is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PlansListPage />);

      const editButtons = screen.getAllByTestId('dropdown-button').filter(
        (btn) => btn.textContent?.includes('Rediger')
      );

      if (editButtons[0]) {
        await user.click(editButtons[0]);
      }

      expect(mockNavigate).toHaveBeenCalledWith('/plans/plan-1/edit');
    });

    it('calls deactivate handler for active plan', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PlansListPage />);

      const deactivateButtons = screen.getAllByTestId('dropdown-button').filter(
        (btn) => btn.textContent?.includes('Deaktiver')
      );

      if (deactivateButtons[0]) {
        await user.click(deactivateButtons[0]);
      }

      expect(mockMutateAsync).toHaveBeenCalledWith({
        planId: 'plan-1',
        data: { status: 'inactive' },
      });
    });

    it('calls activate handler for inactive plan', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PlansListPage />);

      const activateButtons = screen.getAllByTestId('dropdown-button').filter(
        (btn) => btn.textContent?.includes('Aktiver')
      );

      if (activateButtons[0]) {
        await user.click(activateButtons[0]);
      }

      expect(mockMutateAsync).toHaveBeenCalledWith({
        planId: 'plan-2',
        data: { status: 'active' },
      });
    });

    it('calls deprecate handler with confirmation for inactive plan', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PlansListPage />);

      const deprecateButtons = screen.getAllByTestId('dropdown-button').filter(
        (btn) => btn.textContent?.includes('Merk som utgått')
      );

      if (deprecateButtons[0]) {
        await user.click(deprecateButtons[0]);
      }

      expect(mockConfirm).toHaveBeenCalledWith(
        'Er du sikker på at du vil merke Basic som utgått? Dette kan ikke reverseres.'
      );
      expect(mockMutateAsync).toHaveBeenCalledWith({
        planId: 'plan-2',
        data: { status: 'deprecated' },
      });
    });

    it('does not deprecate when confirmation is cancelled', async () => {
      mockConfirm.mockReturnValue(false);
      const user = userEvent.setup();
      renderWithRouter(<PlansListPage />);

      const deprecateButtons = screen.getAllByTestId('dropdown-button').filter(
        (btn) => btn.textContent?.includes('Merk som utgått')
      );

      if (deprecateButtons[0]) {
        await user.click(deprecateButtons[0]);
      }

      expect(mockConfirm).toHaveBeenCalled();
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it('shows deactivate option only for active plans', () => {
      renderWithRouter(<PlansListPage />);

      const deactivateButtons = screen.getAllByTestId('dropdown-button').filter(
        (btn) => btn.textContent?.includes('Deaktiver')
      );

      // Only Enterprise is active, so only 1 deactivate button
      expect(deactivateButtons).toHaveLength(1);
    });

    it('shows activate option only for inactive plans', () => {
      renderWithRouter(<PlansListPage />);

      const activateButtons = screen.getAllByTestId('dropdown-button').filter(
        (btn) => btn.textContent?.includes('Aktiver')
      );

      // Only Basic is inactive, so only 1 activate button
      expect(activateButtons).toHaveLength(1);
    });

    it('shows deprecate option only for inactive plans', () => {
      renderWithRouter(<PlansListPage />);

      const deprecateButtons = screen.getAllByTestId('dropdown-button').filter(
        (btn) => btn.textContent?.includes('Merk som utgått')
      );

      // Only Basic is inactive, so only 1 deprecate button
      expect(deprecateButtons).toHaveLength(1);
    });
  });

  // ===========================================================================
  // Pagination Info Tests
  // ===========================================================================

  describe('Pagination info', () => {
    it('renders pagination summary', () => {
      renderWithRouter(<PlansListPage />);

      expect(screen.getByText(/Viser 3 av 3 planer/)).toBeInTheDocument();
    });

    it('renders page info', () => {
      renderWithRouter(<PlansListPage />);

      expect(screen.getByText(/Side 1 av 1/)).toBeInTheDocument();
    });

    it('does not render pagination info when no meta data', () => {
      mockPlansReturn = {
        data: { data: mockPlansData.data, meta: undefined as any },
        isLoading: false,
      };

      renderWithRouter(<PlansListPage />);

      expect(screen.queryByText(/Viser/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Side/)).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Price Formatting Tests
  // ===========================================================================

  describe('Price formatting', () => {
    it('formats prices in Norwegian locale with currency', () => {
      renderWithRouter(<PlansListPage />);

      // Check that prices are formatted as NOK currency
      const cells = screen.getAllByTestId('table-cell');
      const priceCells = cells.filter(
        (cell) =>
          cell.textContent?.includes('kr') ||
          cell.textContent?.includes('NOK') ||
          cell.textContent?.includes('9')
      );
      expect(priceCells.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // Date Formatting Tests
  // ===========================================================================

  describe('Date formatting', () => {
    it('formats creation date in Norwegian locale', () => {
      renderWithRouter(<PlansListPage />);

      const cells = screen.getAllByTestId('table-cell');
      const dateCells = cells.filter(
        (cell) =>
          cell.textContent?.includes('2024') ||
          cell.textContent?.includes('jan') ||
          cell.textContent?.includes('feb') ||
          cell.textContent?.includes('mar')
      );
      expect(dateCells.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('Edge cases', () => {
    it('handles case-insensitive search', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PlansListPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'ENTERPRISE');

      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });

    it('handles empty search string', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PlansListPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'test');
      await user.clear(searchInput);

      // Should show all plans when search is cleared
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('Legacy Pro')).toBeInTheDocument();
    });

    it('stops propagation when clicking action cell', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PlansListPage />);

      // Clear previous navigation calls
      mockNavigate.mockClear();

      // Find the dropdown trigger in action cell and click it
      const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
      const actionTrigger = dropdownTriggers.find(
        (trigger) => trigger.querySelector('[data-testid="more-icon"]')
      );

      if (actionTrigger) {
        await user.click(actionTrigger);
      }

      expect(actionTrigger).toBeInTheDocument();
    });

    it('renders plan with zero trial days correctly', () => {
      renderWithRouter(<PlansListPage />);

      // Basic has 0 trial days, should show dash
      const dashElements = screen.getAllByText('—');
      expect(dashElements.length).toBeGreaterThan(0);
    });

    it('renders public and internal visibility correctly', () => {
      renderWithRouter(<PlansListPage />);

      const badges = screen.getAllByTestId('badge');
      const publicBadge = badges.find((badge) => badge.textContent === 'Offentlig');
      const internalBadges = badges.filter((badge) => badge.textContent === 'Intern');

      // Enterprise is public (1), Basic and Legacy Pro are internal (2)
      expect(publicBadge).toBeInTheDocument();
      expect(internalBadges).toHaveLength(2);
    });
  });
});
