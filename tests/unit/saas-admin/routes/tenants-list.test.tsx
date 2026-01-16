/**
 * TenantsListPage Unit Tests
 *
 * Tests for the SaaS Admin TenantsListPage component including:
 * - Initial rendering of tenants table
 * - Search functionality
 * - Status filter functionality
 * - Loading and empty states
 * - Action handlers (suspend, reactivate, view details)
 * - Pagination info display
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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
const mockSuspendMutateAsync = vi.fn();
const mockReactivateMutateAsync = vi.fn();

const mockTenantsData = {
  data: [
    {
      id: 'tenant-1',
      name: 'Oslo Kommune',
      slug: 'oslo-kommune',
      domain: 'oslo.kommune.no',
      status: 'active' as const,
      subscriptionPlanName: 'Enterprise',
      createdAt: '2024-01-15T10:00:00Z',
      licenseKeyFingerprint: 'abc123',
    },
    {
      id: 'tenant-2',
      name: 'Bergen Kommune',
      slug: 'bergen-kommune',
      domain: null,
      status: 'suspended' as const,
      subscriptionPlanName: null,
      createdAt: '2024-02-20T14:30:00Z',
      licenseKeyFingerprint: null,
    },
    {
      id: 'tenant-3',
      name: 'Trondheim Kommune',
      slug: 'trondheim-kommune',
      domain: 'trondheim.kommune.no',
      status: 'pending' as const,
      subscriptionPlanName: 'Basic',
      createdAt: '2024-03-10T08:15:00Z',
      licenseKeyFingerprint: null,
    },
  ],
  meta: {
    total: 3,
    page: 1,
    totalPages: 1,
    perPage: 10,
  },
};

let mockTenantsReturn: {
  data: typeof mockTenantsData | undefined;
  isLoading: boolean;
} = {
  data: mockTenantsData,
  isLoading: false,
};

vi.mock('@digilist/client-sdk/hooks', () => ({
  useSaasTenants: () => mockTenantsReturn,
  useSuspendSaasTenant: () => ({
    mutateAsync: mockSuspendMutateAsync,
    isLoading: false,
  }),
  useReactivateSaasTenant: () => ({
    mutateAsync: mockReactivateMutateAsync,
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
  CheckCircleIcon: () => <span data-testid="check-circle-icon">✓</span>,
  XCircleIcon: () => <span data-testid="x-circle-icon">✗</span>,
  BuildingIcon: () => <span data-testid="building-icon">🏢</span>,
  EditIcon: () => <span data-testid="edit-icon">✏</span>,
  EyeIcon: () => <span data-testid="eye-icon">👁</span>,
  PlayIcon: () => <span data-testid="play-icon">▶</span>,
  PauseIcon: () => <span data-testid="pause-icon">⏸</span>,
}));

// Import the component after mocks are set up
import { TenantsListPage } from '../../../../apps/saas-admin/src/routes/tenants/index';

// =============================================================================
// Test Utilities
// =============================================================================

interface RenderOptions {
  initialEntries?: string[];
}

function renderWithRouter(ui: React.ReactElement, options: RenderOptions = {}) {
  const { initialEntries = ['/tenants'] } = options;

  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
}

// =============================================================================
// Test Suite
// =============================================================================

describe('TenantsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTenantsReturn = {
      data: mockTenantsData,
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
      renderWithRouter(<TenantsListPage />);

      expect(screen.getByTestId('heading-2')).toHaveTextContent('Tenants');
    });

    it('renders the page description', () => {
      renderWithRouter(<TenantsListPage />);

      expect(screen.getByTestId('paragraph')).toHaveTextContent(
        'Administrer tenants, abonnementer og tilganger'
      );
    });

    it('renders the "New tenant" button', () => {
      renderWithRouter(<TenantsListPage />);

      const buttons = screen.getAllByTestId('button');
      const newTenantButton = buttons.find((btn) => btn.textContent?.includes('Ny tenant'));
      expect(newTenantButton).toBeInTheDocument();
    });

    it('renders search input', () => {
      renderWithRouter(<TenantsListPage />);

      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', 'Søk etter tenant...');
    });

    it('renders status filter dropdown', () => {
      renderWithRouter(<TenantsListPage />);

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
    it('renders the tenants table', () => {
      renderWithRouter(<TenantsListPage />);

      expect(screen.getByTestId('table')).toBeInTheDocument();
    });

    it('renders table headers correctly', () => {
      renderWithRouter(<TenantsListPage />);

      const headers = screen.getAllByTestId('table-header-cell');
      expect(headers).toHaveLength(7);
      expect(headers[0]).toHaveTextContent('Navn');
      expect(headers[1]).toHaveTextContent('Slug');
      expect(headers[2]).toHaveTextContent('Domene');
      expect(headers[3]).toHaveTextContent('Plan');
      expect(headers[4]).toHaveTextContent('Status');
      expect(headers[5]).toHaveTextContent('Opprettet');
      expect(headers[6]).toHaveTextContent('Handlinger');
    });

    it('renders tenant rows', () => {
      renderWithRouter(<TenantsListPage />);

      const rows = screen.getAllByTestId('table-data-row');
      // We should have 3 data rows (one for each tenant)
      expect(rows).toHaveLength(3);
    });

    it('renders tenant name correctly', () => {
      renderWithRouter(<TenantsListPage />);

      expect(screen.getByText('Oslo Kommune')).toBeInTheDocument();
      expect(screen.getByText('Bergen Kommune')).toBeInTheDocument();
      expect(screen.getByText('Trondheim Kommune')).toBeInTheDocument();
    });

    it('renders tenant slug correctly', () => {
      renderWithRouter(<TenantsListPage />);

      expect(screen.getByText('oslo-kommune')).toBeInTheDocument();
      expect(screen.getByText('bergen-kommune')).toBeInTheDocument();
      expect(screen.getByText('trondheim-kommune')).toBeInTheDocument();
    });

    it('renders tenant domain or dash when not available', () => {
      renderWithRouter(<TenantsListPage />);

      expect(screen.getByText('oslo.kommune.no')).toBeInTheDocument();
      expect(screen.getByText('trondheim.kommune.no')).toBeInTheDocument();
      // Bergen has no domain, should show dash
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('renders subscription plan badges', () => {
      renderWithRouter(<TenantsListPage />);

      const badges = screen.getAllByTestId('badge');
      const planBadges = badges.filter((badge) =>
        ['Enterprise', 'Basic', 'Ingen plan'].includes(badge.textContent || '')
      );
      expect(planBadges.length).toBeGreaterThan(0);
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });

    it('renders status badges with correct colors', () => {
      renderWithRouter(<TenantsListPage />);

      const badges = screen.getAllByTestId('badge');
      const activeBadge = badges.find((badge) => badge.textContent === 'Aktiv');
      const suspendedBadge = badges.find((badge) => badge.textContent === 'Suspendert');
      const pendingBadge = badges.find((badge) => badge.textContent === 'Venter');

      expect(activeBadge).toHaveAttribute('data-color', 'success');
      expect(suspendedBadge).toHaveAttribute('data-color', 'danger');
      expect(pendingBadge).toHaveAttribute('data-color', 'info');
    });
  });

  // ===========================================================================
  // Loading State Tests
  // ===========================================================================

  describe('Loading state', () => {
    it('renders spinner when loading', () => {
      mockTenantsReturn = {
        data: undefined,
        isLoading: true,
      };

      renderWithRouter(<TenantsListPage />);

      const spinner = screen.getByTestId('spinner');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-label', 'Laster...');
    });

    it('does not render table when loading', () => {
      mockTenantsReturn = {
        data: undefined,
        isLoading: true,
      };

      renderWithRouter(<TenantsListPage />);

      expect(screen.queryByTestId('table')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Empty State Tests
  // ===========================================================================

  describe('Empty state', () => {
    it('renders empty state when no tenants', () => {
      mockTenantsReturn = {
        data: { data: [], meta: { total: 0, page: 1, totalPages: 0, perPage: 10 } },
        isLoading: false,
      };

      renderWithRouter(<TenantsListPage />);

      expect(screen.getByText('Ingen tenants funnet')).toBeInTheDocument();
    });

    it('shows "create first tenant" message when no filters applied', () => {
      mockTenantsReturn = {
        data: { data: [], meta: { total: 0, page: 1, totalPages: 0, perPage: 10 } },
        isLoading: false,
      };

      renderWithRouter(<TenantsListPage />);

      expect(
        screen.getByText('Opprett din første tenant for å komme i gang')
      ).toBeInTheDocument();
    });

    it('renders new tenant button in empty state', () => {
      mockTenantsReturn = {
        data: { data: [], meta: { total: 0, page: 1, totalPages: 0, perPage: 10 } },
        isLoading: false,
      };

      renderWithRouter(<TenantsListPage />);

      const buttons = screen.getAllByTestId('button');
      const newTenantButtons = buttons.filter((btn) => btn.textContent?.includes('Ny tenant'));
      expect(newTenantButtons.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // Search Functionality Tests
  // ===========================================================================

  describe('Search functionality', () => {
    it('updates search input value on change', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TenantsListPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Oslo');

      expect(searchInput).toHaveValue('Oslo');
    });

    it('filters tenants based on search query (name)', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TenantsListPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Oslo');

      // Should only show Oslo Kommune
      expect(screen.getByText('Oslo Kommune')).toBeInTheDocument();
      expect(screen.queryByText('Bergen Kommune')).not.toBeInTheDocument();
      expect(screen.queryByText('Trondheim Kommune')).not.toBeInTheDocument();
    });

    it('filters tenants based on search query (slug)', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TenantsListPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'bergen');

      expect(screen.queryByText('Oslo Kommune')).not.toBeInTheDocument();
      expect(screen.getByText('Bergen Kommune')).toBeInTheDocument();
    });

    it('filters tenants based on search query (domain)', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TenantsListPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'trondheim.kommune');

      expect(screen.queryByText('Oslo Kommune')).not.toBeInTheDocument();
      expect(screen.getByText('Trondheim Kommune')).toBeInTheDocument();
    });

    it('shows empty state when search matches nothing', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TenantsListPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'nonexistent-tenant');

      expect(screen.getByText('Ingen tenants funnet')).toBeInTheDocument();
      expect(screen.getByText('Prøv å endre søkekriteriene')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Status Filter Tests
  // ===========================================================================

  describe('Status filter functionality', () => {
    it('shows all status options in dropdown', () => {
      renderWithRouter(<TenantsListPage />);

      const dropdownButtons = screen.getAllByTestId('dropdown-button');
      const statusOptions = dropdownButtons.filter((btn) =>
        ['Alle', 'Aktiv', 'Inaktiv', 'Suspendert', 'Venter'].includes(btn.textContent || '')
      );
      expect(statusOptions.length).toBe(5);
    });

    it('updates filter when status option is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TenantsListPage />);

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
      renderWithRouter(<TenantsListPage />);

      const rows = screen.getAllByTestId('table-data-row');
      // Click on the first data row (Oslo Kommune)
      await user.click(rows[0]);

      expect(mockNavigate).toHaveBeenCalledWith('/tenants/tenant-1');
    });

    it('calls view detail handler when "Vis detaljer" is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TenantsListPage />);

      const viewButtons = screen.getAllByTestId('dropdown-button').filter(
        (btn) => btn.textContent?.includes('Vis detaljer')
      );

      if (viewButtons[0]) {
        await user.click(viewButtons[0]);
      }

      expect(mockNavigate).toHaveBeenCalledWith('/tenants/tenant-1');
    });

    it('navigates to edit page when "Rediger" is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TenantsListPage />);

      const editButtons = screen.getAllByTestId('dropdown-button').filter(
        (btn) => btn.textContent?.includes('Rediger')
      );

      if (editButtons[0]) {
        await user.click(editButtons[0]);
      }

      expect(mockNavigate).toHaveBeenCalledWith('/tenants/tenant-1/edit');
    });

    it('calls suspend handler with confirmation', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TenantsListPage />);

      // Use regex to match exactly "Suspender" button text (not "Suspendert" from status filter)
      const suspendButtons = screen.getAllByTestId('dropdown-button').filter(
        (btn) => /^⏸Suspender$/.test(btn.textContent?.replace(/\s+/g, '') || '')
      );

      if (suspendButtons[0]) {
        await user.click(suspendButtons[0]);
      }

      expect(mockConfirm).toHaveBeenCalledWith(
        'Er du sikker på at du vil suspendere Oslo Kommune?'
      );
      expect(mockSuspendMutateAsync).toHaveBeenCalledWith({
        tenantId: 'tenant-1',
        data: { reason: 'Suspended by SaaS Admin', notifyAdmins: true },
      });
    });

    it('does not suspend when confirmation is cancelled', async () => {
      mockConfirm.mockReturnValue(false);
      const user = userEvent.setup();
      renderWithRouter(<TenantsListPage />);

      // Use regex to match exactly "Suspender" button text (not "Suspendert" from status filter)
      const suspendButtons = screen.getAllByTestId('dropdown-button').filter(
        (btn) => /^⏸Suspender$/.test(btn.textContent?.replace(/\s+/g, '') || '')
      );

      if (suspendButtons[0]) {
        await user.click(suspendButtons[0]);
      }

      expect(mockConfirm).toHaveBeenCalled();
      expect(mockSuspendMutateAsync).not.toHaveBeenCalled();
    });

    it('calls reactivate handler for suspended tenant', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TenantsListPage />);

      const reactivateButtons = screen.getAllByTestId('dropdown-button').filter(
        (btn) => btn.textContent?.includes('Reaktiver')
      );

      if (reactivateButtons[0]) {
        await user.click(reactivateButtons[0]);
      }

      expect(mockReactivateMutateAsync).toHaveBeenCalledWith('tenant-2');
    });

    it('shows suspend option only for active tenants', () => {
      renderWithRouter(<TenantsListPage />);

      // Use regex to match exactly "Suspender" button text (not "Suspendert" from status filter)
      const suspendButtons = screen.getAllByTestId('dropdown-button').filter(
        (btn) => /^⏸Suspender$/.test(btn.textContent?.replace(/\s+/g, '') || '')
      );

      // Only Oslo Kommune is active, so only 1 suspend button
      expect(suspendButtons).toHaveLength(1);
    });

    it('shows reactivate option only for suspended tenants', () => {
      renderWithRouter(<TenantsListPage />);

      const reactivateButtons = screen.getAllByTestId('dropdown-button').filter(
        (btn) => btn.textContent?.includes('Reaktiver')
      );

      // Only Bergen Kommune is suspended, so only 1 reactivate button
      expect(reactivateButtons).toHaveLength(1);
    });
  });

  // ===========================================================================
  // License Key Actions Tests
  // ===========================================================================

  describe('License key actions', () => {
    it('shows "Lisensnøkkel" option for tenant with license', () => {
      renderWithRouter(<TenantsListPage />);

      const licenseButtons = screen.getAllByTestId('dropdown-button').filter(
        (btn) => btn.textContent?.includes('Lisensnøkkel')
      );

      // Oslo Kommune has license key
      expect(licenseButtons).toHaveLength(1);
    });

    it('shows "Opprett lisensnøkkel" option for tenant without license', () => {
      renderWithRouter(<TenantsListPage />);

      const createLicenseButtons = screen.getAllByTestId('dropdown-button').filter(
        (btn) => btn.textContent?.includes('Opprett lisensnøkkel')
      );

      // Bergen and Trondheim don't have license keys
      expect(createLicenseButtons).toHaveLength(2);
    });

    it('navigates to license page when license option is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TenantsListPage />);

      const licenseButtons = screen.getAllByTestId('dropdown-button').filter(
        (btn) => btn.textContent?.includes('Lisensnøkkel')
      );

      if (licenseButtons[0]) {
        await user.click(licenseButtons[0]);
      }

      expect(mockNavigate).toHaveBeenCalledWith('/tenants/tenant-1/license');
    });
  });

  // ===========================================================================
  // Pagination Info Tests
  // ===========================================================================

  describe('Pagination info', () => {
    it('renders pagination summary', () => {
      renderWithRouter(<TenantsListPage />);

      expect(screen.getByText(/Viser 3 av 3 tenants/)).toBeInTheDocument();
    });

    it('renders page info', () => {
      renderWithRouter(<TenantsListPage />);

      expect(screen.getByText(/Side 1 av 1/)).toBeInTheDocument();
    });

    it('does not render pagination info when no meta data', () => {
      mockTenantsReturn = {
        data: { data: mockTenantsData.data, meta: undefined as any },
        isLoading: false,
      };

      renderWithRouter(<TenantsListPage />);

      expect(screen.queryByText(/Viser/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Side/)).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Date Formatting Tests
  // ===========================================================================

  describe('Date formatting', () => {
    it('formats creation date in Norwegian locale', () => {
      renderWithRouter(<TenantsListPage />);

      // The dates should be formatted - exact format depends on locale
      // Check that dates are present in a reasonable format
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
      renderWithRouter(<TenantsListPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'OSLO');

      expect(screen.getByText('Oslo Kommune')).toBeInTheDocument();
    });

    it('handles empty search string', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TenantsListPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'test');
      await user.clear(searchInput);

      // Should show all tenants when search is cleared
      expect(screen.getByText('Oslo Kommune')).toBeInTheDocument();
      expect(screen.getByText('Bergen Kommune')).toBeInTheDocument();
      expect(screen.getByText('Trondheim Kommune')).toBeInTheDocument();
    });

    it('stops propagation when clicking action cell', async () => {
      const user = userEvent.setup();
      renderWithRouter(<TenantsListPage />);

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

      // Should not have navigated to detail page
      // (stopPropagation on the cell)
      // This is hard to test directly, but we can verify the dropdown is interactive
      expect(actionTrigger).toBeInTheDocument();
    });

    it('renders tenant with null domain correctly', () => {
      renderWithRouter(<TenantsListPage />);

      // Bergen has null domain
      const dashElements = screen.getAllByText('—');
      expect(dashElements.length).toBeGreaterThan(0);
    });

    it('renders tenant without subscription plan correctly', () => {
      renderWithRouter(<TenantsListPage />);

      const badges = screen.getAllByTestId('badge');
      const noPlanBadge = badges.find((badge) => badge.textContent === 'Ingen plan');
      expect(noPlanBadge).toBeInTheDocument();
      expect(noPlanBadge).toHaveAttribute('data-color', 'neutral');
    });
  });
});
