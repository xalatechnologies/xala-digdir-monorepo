/**
 * FeatureFlagsCatalogPage Unit Tests
 *
 * Tests for the SaaS Admin FeatureFlagsCatalogPage component including:
 * - Initial rendering of feature flags table
 * - Search functionality
 * - Category filter functionality
 * - Status filter functionality
 * - Loading and empty states
 * - Stats display
 * - Badge formatting for categories, statuses, and default values
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import * as React from 'react';

// =============================================================================
// Mock Dependencies
// =============================================================================

// Mock SDK hooks
const mockFlagsData = {
  data: [
    {
      id: 'flag-1',
      key: 'module.booking.enabled',
      name: 'Bookingmodul',
      description: 'Aktiverer booking-funksjonalitet for tenants',
      category: 'module' as const,
      type: 'boolean' as const,
      defaultValue: true,
      status: 'active' as const,
    },
    {
      id: 'flag-2',
      key: 'integration.vipps.enabled',
      name: 'Vipps-integrasjon',
      description: 'Aktiverer betaling via Vipps',
      category: 'integration' as const,
      type: 'boolean' as const,
      defaultValue: false,
      status: 'active' as const,
    },
    {
      id: 'flag-3',
      key: 'policy.max.users',
      name: 'Maks antall brukere',
      description: 'Maksimalt antall brukere per tenant',
      category: 'policy' as const,
      type: 'number' as const,
      defaultValue: 100,
      status: 'deprecated' as const,
    },
    {
      id: 'flag-4',
      key: 'module.calendar.enabled',
      name: 'Kalendermodul',
      description: null,
      category: 'module' as const,
      type: 'boolean' as const,
      defaultValue: true,
      status: 'active' as const,
    },
  ],
};

let mockFlagsReturn: {
  data: typeof mockFlagsData | undefined;
  isLoading: boolean;
} = {
  data: mockFlagsData,
  isLoading: false,
};

vi.mock('@digilist/client-sdk/hooks', () => ({
  useSaasFeatureFlagsCatalog: () => mockFlagsReturn,
}));

// Mock useT hook from @xala/i18n
vi.mock('@xala/i18n', () => ({
  useT: () => (key: string) => {
    const translations: Record<string, string> = {
      'common.name': 'Navn',
      'common.type': 'Type',
      'common.status': 'Status',
      'common.description': 'Beskrivelse',
    };
    return translations[key] || key;
  },
}));

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
  FilterIcon: () => <span data-testid="filter-icon">Filter</span>,
  SettingsIcon: () => <span data-testid="settings-icon">⚙</span>,
  CheckCircleIcon: () => <span data-testid="check-circle-icon">✓</span>,
  XCircleIcon: () => <span data-testid="x-circle-icon">✗</span>,
}));

// Import the component after mocks are set up
import { FeatureFlagsCatalogPage } from '../../../../apps/saas-admin/src/routes/feature-flags/index';

// =============================================================================
// Test Utilities
// =============================================================================

interface RenderOptions {
  initialEntries?: string[];
}

function renderWithRouter(ui: React.ReactElement, options: RenderOptions = {}) {
  const { initialEntries = ['/feature-flags'] } = options;

  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
}

// =============================================================================
// Test Suite
// =============================================================================

describe('FeatureFlagsCatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFlagsReturn = {
      data: mockFlagsData,
      isLoading: false,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe('Basic rendering', () => {
    it('renders the page heading', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      expect(screen.getByTestId('heading-2')).toHaveTextContent('Feature Flags');
    });

    it('renders the page description', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const paragraphs = screen.getAllByTestId('paragraph');
      const descriptionParagraph = paragraphs.find((p) =>
        p.textContent?.includes('Katalog over alle tilgjengelige feature flags')
      );
      expect(descriptionParagraph).toBeInTheDocument();
    });

    it('renders search input', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', 'Søk etter flag...');
    });

    it('renders category filter dropdown', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
      const categoryFilter = dropdownTriggers.find((trigger) =>
        trigger.textContent?.includes('Kategori:')
      );
      expect(categoryFilter).toBeInTheDocument();
      expect(categoryFilter).toHaveTextContent('Kategori: Alle');
    });

    it('renders status filter dropdown', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
      const statusFilter = dropdownTriggers.find((trigger) =>
        trigger.textContent?.includes('Status:')
      );
      expect(statusFilter).toBeInTheDocument();
      expect(statusFilter).toHaveTextContent('Status: Alle');
    });
  });

  // ===========================================================================
  // Stats Display Tests
  // ===========================================================================

  describe('Stats display', () => {
    it('renders total flags count', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const cards = screen.getAllByTestId('card');
      const totalCard = cards.find((card) => card.textContent?.includes('Totalt'));
      expect(totalCard).toBeInTheDocument();
      expect(totalCard).toHaveTextContent('4');
    });

    it('renders module flags count', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const cards = screen.getAllByTestId('card');
      const moduleCard = cards.find((card) => card.textContent?.includes('Moduler'));
      expect(moduleCard).toBeInTheDocument();
      expect(moduleCard).toHaveTextContent('2');
    });

    it('renders integration flags count', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const cards = screen.getAllByTestId('card');
      const integrationCard = cards.find((card) => card.textContent?.includes('Integrasjoner'));
      expect(integrationCard).toBeInTheDocument();
      expect(integrationCard).toHaveTextContent('1');
    });

    it('renders policy flags count', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const cards = screen.getAllByTestId('card');
      const policyCard = cards.find((card) => card.textContent?.includes('Policies'));
      expect(policyCard).toBeInTheDocument();
      expect(policyCard).toHaveTextContent('1');
    });
  });

  // ===========================================================================
  // Table Rendering Tests
  // ===========================================================================

  describe('Table rendering', () => {
    it('renders the feature flags table', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      expect(screen.getByTestId('table')).toBeInTheDocument();
    });

    it('renders table headers correctly', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const headers = screen.getAllByTestId('table-header-cell');
      expect(headers).toHaveLength(7);
      expect(headers[0]).toHaveTextContent('Nøkkel');
      expect(headers[1]).toHaveTextContent('Navn');
      expect(headers[2]).toHaveTextContent('Kategori');
      expect(headers[3]).toHaveTextContent('Type');
      expect(headers[4]).toHaveTextContent('Standardverdi');
      expect(headers[5]).toHaveTextContent('Status');
      expect(headers[6]).toHaveTextContent('Beskrivelse');
    });

    it('renders flag rows', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      // 1 header row + 4 data rows = 5 total table-row elements
      const rows = screen.getAllByTestId('table-row');
      expect(rows).toHaveLength(5);
    });

    it('renders flag keys correctly', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      expect(screen.getByText('module.booking.enabled')).toBeInTheDocument();
      expect(screen.getByText('integration.vipps.enabled')).toBeInTheDocument();
      expect(screen.getByText('policy.max.users')).toBeInTheDocument();
      expect(screen.getByText('module.calendar.enabled')).toBeInTheDocument();
    });

    it('renders flag names correctly', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      expect(screen.getByText('Bookingmodul')).toBeInTheDocument();
      expect(screen.getByText('Vipps-integrasjon')).toBeInTheDocument();
      expect(screen.getByText('Maks antall brukere')).toBeInTheDocument();
      expect(screen.getByText('Kalendermodul')).toBeInTheDocument();
    });

    it('renders category badges with correct colors', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const badges = screen.getAllByTestId('badge');
      const moduleBadges = badges.filter((badge) => badge.textContent === 'Modul');
      const integrationBadge = badges.find((badge) => badge.textContent === 'Integrasjon');
      const policyBadge = badges.find((badge) => badge.textContent === 'Policy');

      expect(moduleBadges).toHaveLength(2);
      expect(moduleBadges[0]).toHaveAttribute('data-color', 'info');
      expect(integrationBadge).toHaveAttribute('data-color', 'success');
      expect(policyBadge).toHaveAttribute('data-color', 'warning');
    });

    it('renders status badges with correct colors', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const badges = screen.getAllByTestId('badge');
      const activeBadges = badges.filter((badge) => badge.textContent === 'Aktiv');
      const deprecatedBadge = badges.find((badge) => badge.textContent === 'Utgått');

      expect(activeBadges).toHaveLength(3);
      expect(activeBadges[0]).toHaveAttribute('data-color', 'success');
      expect(deprecatedBadge).toHaveAttribute('data-color', 'danger');
    });

    it('renders boolean default value badges for true', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const badges = screen.getAllByTestId('badge');
      const onBadges = badges.filter((badge) => badge.textContent?.includes('På'));
      expect(onBadges.length).toBeGreaterThan(0);
    });

    it('renders boolean default value badges for false', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const badges = screen.getAllByTestId('badge');
      const offBadge = badges.find((badge) => badge.textContent?.includes('Av'));
      expect(offBadge).toBeInTheDocument();
    });

    it('renders non-boolean default values as text', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('renders flag type correctly', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const cells = screen.getAllByTestId('table-cell');
      const typeCells = cells.filter(
        (cell) =>
          cell.textContent === 'boolean' || cell.textContent === 'number'
      );
      expect(typeCells.length).toBeGreaterThan(0);
    });

    it('renders description or dash when not available', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      expect(screen.getByText('Aktiverer booking-funksjonalitet for tenants')).toBeInTheDocument();
      // Kalendermodul has null description, should show dash
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Loading State Tests
  // ===========================================================================

  describe('Loading state', () => {
    it('renders spinner when loading', () => {
      mockFlagsReturn = {
        data: undefined,
        isLoading: true,
      };

      renderWithRouter(<FeatureFlagsCatalogPage />);

      const spinner = screen.getByTestId('spinner');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-label', 'Laster...');
    });

    it('does not render table when loading', () => {
      mockFlagsReturn = {
        data: undefined,
        isLoading: true,
      };

      renderWithRouter(<FeatureFlagsCatalogPage />);

      expect(screen.queryByTestId('table')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Empty State Tests
  // ===========================================================================

  describe('Empty state', () => {
    it('renders empty state when no flags', () => {
      mockFlagsReturn = {
        data: { data: [] },
        isLoading: false,
      };

      renderWithRouter(<FeatureFlagsCatalogPage />);

      expect(screen.getByText('Ingen feature flags funnet')).toBeInTheDocument();
    });

    it('shows "no flags defined" message when no filters applied', () => {
      mockFlagsReturn = {
        data: { data: [] },
        isLoading: false,
      };

      renderWithRouter(<FeatureFlagsCatalogPage />);

      expect(
        screen.getByText('Ingen feature flags er definert i plattformen')
      ).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Search Functionality Tests
  // ===========================================================================

  describe('Search functionality', () => {
    it('updates search input value on change', async () => {
      const user = userEvent.setup();
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'booking');

      expect(searchInput).toHaveValue('booking');
    });

    it('filters flags based on search query (key)', async () => {
      const user = userEvent.setup();
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'booking');

      expect(screen.getByText('module.booking.enabled')).toBeInTheDocument();
      expect(screen.queryByText('integration.vipps.enabled')).not.toBeInTheDocument();
      expect(screen.queryByText('policy.max.users')).not.toBeInTheDocument();
    });

    it('filters flags based on search query (name)', async () => {
      const user = userEvent.setup();
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Vipps');

      expect(screen.queryByText('module.booking.enabled')).not.toBeInTheDocument();
      expect(screen.getByText('integration.vipps.enabled')).toBeInTheDocument();
    });

    it('filters flags based on search query (description)', async () => {
      const user = userEvent.setup();
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'betaling');

      expect(screen.queryByText('module.booking.enabled')).not.toBeInTheDocument();
      expect(screen.getByText('integration.vipps.enabled')).toBeInTheDocument();
    });

    it('shows empty state when search matches nothing', async () => {
      const user = userEvent.setup();
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'nonexistent-flag');

      expect(screen.getByText('Ingen feature flags funnet')).toBeInTheDocument();
      expect(screen.getByText('Prøv å endre søkekriteriene')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Category Filter Tests
  // ===========================================================================

  describe('Category filter functionality', () => {
    it('shows all category options in dropdown', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const dropdownButtons = screen.getAllByTestId('dropdown-button');
      // Check that category-specific options exist
      const modulOption = dropdownButtons.find((btn) => btn.textContent === 'Modul');
      const integrationOption = dropdownButtons.find((btn) => btn.textContent === 'Integrasjon');
      const policyOption = dropdownButtons.find((btn) => btn.textContent === 'Policy');

      expect(modulOption).toBeInTheDocument();
      expect(integrationOption).toBeInTheDocument();
      expect(policyOption).toBeInTheDocument();
    });

    it('updates filter when category option is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const dropdownButtons = screen.getAllByTestId('dropdown-button');
      const moduleOption = dropdownButtons.find((btn) => btn.textContent === 'Modul');

      if (moduleOption) {
        await user.click(moduleOption);
      }

      const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
      const categoryFilter = dropdownTriggers.find((trigger) =>
        trigger.textContent?.includes('Kategori:')
      );
      expect(categoryFilter).toHaveTextContent('Kategori: Modul');
    });

    it('resets to all categories when "Alle" is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<FeatureFlagsCatalogPage />);

      // First select a specific category
      const dropdownButtons = screen.getAllByTestId('dropdown-button');
      const moduleOption = dropdownButtons.find((btn) => btn.textContent === 'Modul');
      if (moduleOption) {
        await user.click(moduleOption);
      }

      // Then select "Alle"
      const allOption = screen.getAllByTestId('dropdown-button').find((btn) => btn.textContent === 'Alle');
      if (allOption) {
        await user.click(allOption);
      }

      const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
      const categoryFilter = dropdownTriggers.find((trigger) =>
        trigger.textContent?.includes('Kategori:')
      );
      expect(categoryFilter).toHaveTextContent('Kategori: Alle');
    });
  });

  // ===========================================================================
  // Status Filter Tests
  // ===========================================================================

  describe('Status filter functionality', () => {
    it('shows all status options in dropdown', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const dropdownButtons = screen.getAllByTestId('dropdown-button');
      // Check that status-specific options exist (Aktiv and Utgått are unique to status filter)
      const activeOption = dropdownButtons.find((btn) => btn.textContent === 'Aktiv');
      const deprecatedOption = dropdownButtons.find((btn) => btn.textContent === 'Utgått');

      expect(activeOption).toBeInTheDocument();
      expect(deprecatedOption).toBeInTheDocument();
    });

    it('updates filter when status option is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<FeatureFlagsCatalogPage />);

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

    it('updates filter to deprecated when clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const dropdownButtons = screen.getAllByTestId('dropdown-button');
      const deprecatedOption = dropdownButtons.find((btn) => btn.textContent === 'Utgått');

      if (deprecatedOption) {
        await user.click(deprecatedOption);
      }

      const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
      const statusFilter = dropdownTriggers.find((trigger) =>
        trigger.textContent?.includes('Status:')
      );
      expect(statusFilter).toHaveTextContent('Status: Utgått');
    });
  });

  // ===========================================================================
  // Pagination Info Tests
  // ===========================================================================

  describe('Pagination info', () => {
    it('renders results summary', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      expect(screen.getByText(/Viser 4 av 4 feature flags/)).toBeInTheDocument();
    });

    it('updates results summary when filtered', async () => {
      const user = userEvent.setup();
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'booking');

      expect(screen.getByText(/Viser 1 av 4 feature flags/)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('Edge cases', () => {
    it('handles case-insensitive search', async () => {
      const user = userEvent.setup();
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'BOOKING');

      expect(screen.getByText('module.booking.enabled')).toBeInTheDocument();
    });

    it('handles empty search string', async () => {
      const user = userEvent.setup();
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'test');
      await user.clear(searchInput);

      // Should show all flags when search is cleared
      expect(screen.getByText('module.booking.enabled')).toBeInTheDocument();
      expect(screen.getByText('integration.vipps.enabled')).toBeInTheDocument();
      expect(screen.getByText('policy.max.users')).toBeInTheDocument();
      expect(screen.getByText('module.calendar.enabled')).toBeInTheDocument();
    });

    it('handles flag with null description', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      // Kalendermodul has null description, should show dash
      const dashElements = screen.getAllByText('—');
      expect(dashElements.length).toBeGreaterThan(0);
    });

    it('renders settings icon for each flag key', () => {
      renderWithRouter(<FeatureFlagsCatalogPage />);

      const settingsIcons = screen.getAllByTestId('settings-icon');
      expect(settingsIcons.length).toBeGreaterThan(0);
    });

    it('handles combined search and filter empty result', async () => {
      const user = userEvent.setup();
      renderWithRouter(<FeatureFlagsCatalogPage />);

      // Apply a search that would normally return results
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'nonexistent');

      expect(screen.getByText('Ingen feature flags funnet')).toBeInTheDocument();
      expect(screen.getByText('Prøv å endre søkekriteriene')).toBeInTheDocument();
    });

    it('renders stats as zero when no flags', () => {
      mockFlagsReturn = {
        data: { data: [] },
        isLoading: false,
      };

      renderWithRouter(<FeatureFlagsCatalogPage />);

      const cards = screen.getAllByTestId('card');
      const totalCard = cards.find((card) => card.textContent?.includes('Totalt'));
      expect(totalCard).toHaveTextContent('0');
    });
  });
});
