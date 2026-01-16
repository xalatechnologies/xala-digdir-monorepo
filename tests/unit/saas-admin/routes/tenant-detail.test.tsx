/**
 * TenantDetailPage Unit Tests
 *
 * Tests for the SaaS Admin TenantDetailPage component including:
 * - Initial rendering of tenant details
 * - Loading state display
 * - Not found state handling
 * - Tab navigation (overview, flags, billing, secrets, license)
 * - Action handlers (suspend, reactivate, toggle flags, rotate license)
 * - Usage statistics display
 * - Feature flags management
 * - Billing information display
 * - Secrets table display
 * - License key management
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import * as React from 'react';

// =============================================================================
// Mock Dependencies
// =============================================================================

// Mock useParams
const mockParams = { id: 'tenant-123' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => mockParams,
  };
});

// Mock SDK hooks
const mockSuspendMutateAsync = vi.fn();
const mockReactivateMutateAsync = vi.fn();
const mockUpdateFlagsMutateAsync = vi.fn();
const mockRotateLicenseMutateAsync = vi.fn();

const mockTenantData = {
  data: {
    id: 'tenant-123',
    name: 'Oslo Kommune',
    slug: 'oslo-kommune',
    domain: 'oslo.kommune.no',
    status: 'active' as const,
    subscriptionPlanName: 'Enterprise',
    licenseKeyFingerprint: 'fp-abc123',
    licenseKeyRotatedAt: '2024-06-15T10:00:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-06-20T14:30:00Z',
    usage: {
      usersCount: 150,
      organizationsCount: 12,
      listingsCount: 500,
      bookingsThisMonth: 2500,
      storageMb: 1500,
    },
    seatLimits: {
      maxUsers: 200,
      maxOrganizations: 20,
      maxListings: 1000,
      maxBookingsPerMonth: 5000,
      maxStorageMb: 5000,
    },
  },
};

const mockTenantFlags = {
  data: [
    {
      flagKey: 'feature-calendar',
      enabled: true,
      value: true,
      reason: 'Enabled for Enterprise plan',
      updatedAt: '2024-06-10T10:00:00Z',
      updatedBy: 'admin@digilist.no',
    },
    {
      flagKey: 'feature-analytics',
      enabled: false,
      value: false,
      reason: null,
      updatedAt: null,
      updatedBy: null,
    },
  ],
};

const mockFlagsCatalog = {
  data: [
    {
      key: 'feature-calendar',
      name: 'Calendar Module',
      description: 'Enable calendar booking functionality',
      category: 'module' as const,
      defaultValue: false,
    },
    {
      key: 'feature-analytics',
      name: 'Analytics Dashboard',
      description: 'Enable analytics and reporting',
      category: 'module' as const,
      defaultValue: false,
    },
    {
      key: 'integration-vipps',
      name: 'Vipps Integration',
      description: 'Enable Vipps payment integration',
      category: 'integration' as const,
      defaultValue: false,
    },
    {
      key: 'policy-2fa',
      name: 'Two-Factor Authentication',
      description: 'Require 2FA for all users',
      category: 'policy' as const,
      defaultValue: true,
    },
  ],
};

const mockBillingData = {
  data: {
    status: 'paid' as const,
    currentPlan: 'Enterprise',
    amountPaid: 15000,
    amountDue: 0,
    currency: 'NOK',
    nextBillingDate: '2024-07-01T00:00:00Z',
    invoices: [
      {
        id: 'inv-1',
        number: 'INV-2024-001',
        amount: 15000,
        currency: 'NOK',
        status: 'paid' as const,
        dueDate: '2024-06-01T00:00:00Z',
      },
      {
        id: 'inv-2',
        number: 'INV-2024-002',
        amount: 15000,
        currency: 'NOK',
        status: 'pending' as const,
        dueDate: '2024-07-01T00:00:00Z',
      },
    ],
  },
};

const mockSecretsData = {
  data: [
    {
      key: 'VIPPS_CLIENT_ID',
      provider: 'Vipps',
      isConfigured: true,
      fingerprint: 'abc123def456',
      lastRotatedAt: '2024-05-01T10:00:00Z',
    },
    {
      key: 'SMTP_PASSWORD',
      provider: 'SendGrid',
      isConfigured: false,
      fingerprint: null,
      lastRotatedAt: null,
    },
  ],
};

let mockTenantReturn: { data: typeof mockTenantData | undefined; isLoading: boolean } = {
  data: mockTenantData,
  isLoading: false,
};

let mockFlagsReturn: { data: typeof mockTenantFlags | undefined; isLoading: boolean } = {
  data: mockTenantFlags,
  isLoading: false,
};

let mockCatalogReturn: { data: typeof mockFlagsCatalog | undefined } = {
  data: mockFlagsCatalog,
};

let mockBillingReturn: { data: typeof mockBillingData | undefined; isLoading: boolean } = {
  data: mockBillingData,
  isLoading: false,
};

let mockSecretsReturn: { data: typeof mockSecretsData | undefined; isLoading: boolean } = {
  data: mockSecretsData,
  isLoading: false,
};

vi.mock('@digilist/client-sdk/hooks', () => ({
  useSaasTenant: () => mockTenantReturn,
  useSaasTenantFlags: () => mockFlagsReturn,
  useSaasFeatureFlagsCatalog: () => mockCatalogReturn,
  useSaasTenantBilling: () => mockBillingReturn,
  useSaasTenantSecrets: () => mockSecretsReturn,
  useSuspendSaasTenant: () => ({
    mutateAsync: mockSuspendMutateAsync,
    isPending: false,
  }),
  useReactivateSaasTenant: () => ({
    mutateAsync: mockReactivateMutateAsync,
    isPending: false,
  }),
  useUpdateSaasTenantFlags: () => ({
    mutateAsync: mockUpdateFlagsMutateAsync,
    isPending: false,
  }),
  useRotateSaasLicenseKey: () => ({
    mutateAsync: mockRotateLicenseMutateAsync,
    isPending: false,
  }),
}));

// Mock useT hook from @xala/i18n
vi.mock('@xala/i18n', () => ({
  useT: () => (key: string) => {
    const translations: Record<string, string> = {
      'common.status': 'Status',
      'saasAdmin.tenantDetail.loading': 'Laster...',
      'saasAdmin.tenantDetail.notFound': 'Tenant ikke funnet',
      'saasAdmin.tenantDetail.notFoundDescription': 'Denne tenanten eksisterer ikke eller du har ikke tilgang.',
      'saasAdmin.tenantDetail.backToList': 'Tilbake til oversikt',
      'saasAdmin.tenantDetail.edit': 'Rediger',
      'saasAdmin.tenantDetail.suspend': 'Suspender',
      'saasAdmin.tenantDetail.reactivate': 'Reaktiver',
      'saasAdmin.tenantDetail.confirmSuspend': 'Er du sikker på at du vil suspendere denne tenanten?',
      'saasAdmin.tenantDetail.confirmRotateLicense': 'Er du sikker på at du vil rotere lisensnøkkelen?',
      'saasAdmin.tenantDetail.licensed': 'Lisensiert',
      'saasAdmin.tenantDetail.noLicense': 'Ingen lisens',
      'saasAdmin.tenantDetail.slug': 'Slug',
      'saasAdmin.tenantDetail.domain': 'Domene',
      'saasAdmin.tenantDetail.status.active': 'Aktiv',
      'saasAdmin.tenantDetail.status.inactive': 'Inaktiv',
      'saasAdmin.tenantDetail.status.suspended': 'Suspendert',
      'saasAdmin.tenantDetail.status.pending': 'Venter',
      'saasAdmin.tenantDetail.stats.users': 'Brukere',
      'saasAdmin.tenantDetail.stats.organizations': 'Organisasjoner',
      'saasAdmin.tenantDetail.stats.listings': 'Oppføringer',
      'saasAdmin.tenantDetail.stats.bookingsThisMonth': 'Bookinger denne måneden',
      'saasAdmin.tenantDetail.stats.storage': 'Lagring',
      'saasAdmin.tenantDetail.tabs.overview': 'Oversikt',
      'saasAdmin.tenantDetail.tabs.flags': 'Feature Flags',
      'saasAdmin.tenantDetail.tabs.billing': 'Fakturering',
      'saasAdmin.tenantDetail.tabs.secrets': 'Hemmeligheter',
      'saasAdmin.tenantDetail.tabs.license': 'Lisens',
      'saasAdmin.tenantDetail.basicInfo': 'Grunnleggende informasjon',
      'saasAdmin.tenantDetail.tenantId': 'Tenant ID',
      'saasAdmin.tenantDetail.subscriptionPlan': 'Abonnementsplan',
      'saasAdmin.tenantDetail.noPlan': 'Ingen plan',
      'saasAdmin.tenantDetail.created': 'Opprettet',
      'saasAdmin.tenantDetail.lastUpdated': 'Sist oppdatert',
      'saasAdmin.tenantDetail.limits': 'Grenser',
      'saasAdmin.tenantDetail.maxUsers': 'Maks brukere',
      'saasAdmin.tenantDetail.maxOrganizations': 'Maks organisasjoner',
      'saasAdmin.tenantDetail.maxListings': 'Maks oppføringer',
      'saasAdmin.tenantDetail.maxBookingsPerMonth': 'Maks bookinger per måned',
      'saasAdmin.tenantDetail.maxStorage': 'Maks lagring',
      'saasAdmin.tenantDetail.changeLimits': 'Endre grenser',
      'saasAdmin.tenantDetail.featureFlags': 'Feature Flags',
      'saasAdmin.tenantDetail.featureFlagsDescription': 'Administrer funksjonsflagg for denne tenanten.',
      'saasAdmin.tenantDetail.category.module': 'Moduler',
      'saasAdmin.tenantDetail.category.integration': 'Integrasjoner',
      'saasAdmin.tenantDetail.category.policy': 'Policyer',
      'saasAdmin.tenantDetail.overridden': 'Overstyrt',
      'saasAdmin.tenantDetail.updatedAt': 'Oppdatert',
      'saasAdmin.tenantDetail.billingStatus': 'Faktureringsstatus',
      'saasAdmin.tenantDetail.currentPlan': 'Gjeldende plan',
      'saasAdmin.tenantDetail.amountPaid': 'Betalt beløp',
      'saasAdmin.tenantDetail.amountDue': 'Utestående beløp',
      'saasAdmin.tenantDetail.nextBilling': 'Neste fakturering',
      'saasAdmin.tenantDetail.invoices': 'Fakturaer',
      'saasAdmin.tenantDetail.invoiceNumber': 'Fakturanummer',
      'saasAdmin.tenantDetail.amount': 'Beløp',
      'saasAdmin.tenantDetail.dueDate': 'Forfallsdato',
      'saasAdmin.tenantDetail.noBillingInfo': 'Ingen faktureringsinformasjon tilgjengelig.',
      'saasAdmin.tenantDetail.secrets': 'Hemmeligheter',
      'saasAdmin.tenantDetail.secretsDescription': 'Konfigurer API-nøkler og hemmeligheter for integrasjoner.',
      'saasAdmin.tenantDetail.noSecrets': 'Ingen hemmeligheter',
      'saasAdmin.tenantDetail.noSecretsDescription': 'Denne tenanten har ingen konfigurerte hemmeligheter.',
      'saasAdmin.tenantDetail.provider': 'Leverandør',
      'saasAdmin.tenantDetail.key': 'Nøkkel',
      'saasAdmin.tenantDetail.fingerprint': 'Fingeravtrykk',
      'saasAdmin.tenantDetail.lastRotated': 'Sist rotert',
      'saasAdmin.tenantDetail.configured': 'Konfigurert',
      'saasAdmin.tenantDetail.notConfigured': 'Ikke konfigurert',
      'saasAdmin.tenantDetail.licenseKey': 'Lisensnøkkel',
      'saasAdmin.tenantDetail.rotateLicense': 'Roter lisensnøkkel',
      'saasAdmin.tenantDetail.generateLicense': 'Generer lisensnøkkel',
      'saasAdmin.tenantDetail.rotateWarning': 'Advarsel: Rotasjon av lisensnøkkel vil ugyldiggjøre den eksisterende nøkkelen. Alle klienter må oppdateres.',
      'saasAdmin.tenantDetail.newLicenseGenerated': 'Ny lisensnøkkel generert!',
      'saasAdmin.tenantDetail.copyLicenseNow': 'Kopier nøkkelen nå - den vises bare én gang.',
      'saasAdmin.tenantDetail.close': 'Lukk',
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
  Card: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div data-testid="card" style={style}>{children}</div>
  ),
  Heading: ({
    children,
    level,
    'data-size': dataSize,
    style,
  }: {
    children: React.ReactNode;
    level?: number;
    'data-size'?: string;
    style?: React.CSSProperties;
  }) => {
    const Tag = `h${level || 1}` as keyof JSX.IntrinsicElements;
    return (
      <Tag data-testid={`heading-${level || 1}`} data-size={dataSize} style={style}>
        {children}
      </Tag>
    );
  },
  Paragraph: ({
    children,
    'data-size': dataSize,
    style,
  }: {
    children: React.ReactNode;
    'data-size'?: string;
    style?: React.CSSProperties;
  }) => (
    <p data-testid="paragraph" data-size={dataSize} style={style}>
      {children}
    </p>
  ),
  Button: ({
    children,
    onClick,
    type,
    variant,
    disabled,
    'data-size': dataSize,
    style,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: string;
    variant?: string;
    disabled?: boolean;
    'data-size'?: string;
    style?: React.CSSProperties;
  }) => (
    <button
      type={(type as 'button' | 'submit') || 'button'}
      onClick={onClick}
      disabled={disabled}
      data-testid="button"
      data-variant={variant}
      data-size={dataSize}
      style={style}
    >
      {children}
    </button>
  ),
  Badge: ({
    children,
    color,
    'data-size': dataSize,
  }: {
    children: React.ReactNode;
    color?: string;
    'data-size'?: string;
  }) => (
    <span data-testid="badge" data-color={color} data-size={dataSize}>
      {children}
    </span>
  ),
  Spinner: ({ 'aria-label': ariaLabel, 'data-size': dataSize }: { 'aria-label'?: string; 'data-size'?: string }) => (
    <div data-testid="spinner" aria-label={ariaLabel} data-size={dataSize}>
      Loading...
    </div>
  ),
  Stack: ({ children, spacing }: { children: React.ReactNode; spacing?: number }) => (
    <div data-testid="stack" data-spacing={spacing}>{children}</div>
  ),
  Tabs: Object.assign(
    ({ children, defaultValue }: { children: React.ReactNode; defaultValue?: string }) => {
      const [activeTab, setActiveTab] = React.useState(defaultValue || '');
      return (
        <div data-testid="tabs" data-value={activeTab}>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<{ activeTab?: string; setActiveTab?: (v: string) => void }>, {
                activeTab,
                setActiveTab,
              });
            }
            return child;
          })}
        </div>
      );
    },
    {
      List: ({ children, activeTab, setActiveTab }: { children: React.ReactNode; activeTab?: string; setActiveTab?: (v: string) => void }) => (
        <div data-testid="tabs-list">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<{ activeTab?: string; setActiveTab?: (v: string) => void }>, {
                activeTab,
                setActiveTab,
              });
            }
            return child;
          })}
        </div>
      ),
      Tab: ({
        children,
        value,
        activeTab,
        setActiveTab,
      }: {
        children: React.ReactNode;
        value: string;
        activeTab?: string;
        setActiveTab?: (v: string) => void;
      }) => (
        <button
          type="button"
          data-testid={`tab-${value}`}
          data-active={activeTab === value}
          onClick={() => setActiveTab?.(value)}
        >
          {children}
        </button>
      ),
      Panel: ({
        children,
        value,
        activeTab,
      }: {
        children: React.ReactNode;
        value: string;
        activeTab?: string;
      }) => (
        <div
          data-testid={`tab-panel-${value}`}
          style={{ display: activeTab === value || !activeTab ? 'block' : 'none' }}
          data-active={activeTab === value}
        >
          {children}
        </div>
      ),
    }
  ),
  Switch: ({
    checked,
    onChange,
    disabled,
  }: {
    checked?: boolean;
    onChange?: () => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      role="switch"
      data-testid="switch"
      aria-checked={checked}
      data-checked={checked}
      onClick={onChange}
      disabled={disabled}
    >
      {checked ? 'On' : 'Off'}
    </button>
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
      Row: ({ children }: { children: React.ReactNode }) => (
        <tr data-testid="table-row">{children}</tr>
      ),
      HeaderCell: ({ children }: { children?: React.ReactNode }) => (
        <th data-testid="table-header-cell">{children}</th>
      ),
      Cell: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
        <td data-testid="table-cell" style={style}>{children}</td>
      ),
    }
  ),
  StatCard: ({
    title,
    value,
    description,
    icon,
    color,
  }: {
    title: string;
    value: string;
    description?: string;
    icon?: React.ReactNode;
    color?: string;
  }) => (
    <div data-testid="stat-card" data-color={color}>
      <div data-testid="stat-icon">{icon}</div>
      <div data-testid="stat-title">{title}</div>
      <div data-testid="stat-value">{value}</div>
      {description && <div data-testid="stat-description">{description}</div>}
    </div>
  ),
  formatTimeAgo: (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'i dag';
    if (diffDays === 1) return 'i går';
    return `${diffDays} dager siden`;
  },
  ArrowLeftIcon: () => <span data-testid="arrow-left-icon">←</span>,
  EditIcon: () => <span data-testid="edit-icon">✏</span>,
  PlayIcon: () => <span data-testid="play-icon">▶</span>,
  PauseIcon: () => <span data-testid="pause-icon">⏸</span>,
  RefreshCwIcon: () => <span data-testid="refresh-icon">↻</span>,
  KeyIcon: () => <span data-testid="key-icon">🔑</span>,
  UsersIcon: () => <span data-testid="users-icon">👥</span>,
  BuildingIcon: () => <span data-testid="building-icon">🏢</span>,
  CalendarIcon: () => <span data-testid="calendar-icon">📅</span>,
  DatabaseIcon: () => <span data-testid="database-icon">💾</span>,
  ShieldCheckIcon: () => <span data-testid="shield-icon">🛡</span>,
  ToggleLeftIcon: () => <span data-testid="toggle-icon">⚙</span>,
  CreditCardIcon: () => <span data-testid="credit-card-icon">💳</span>,
  LockIcon: () => <span data-testid="lock-icon">🔒</span>,
  ClockIcon: () => <span data-testid="clock-icon">⏰</span>,
}));

// Import the component after mocks are set up
import { TenantDetailPage } from '../../../../apps/saas-admin/src/routes/tenants/[id]';

// =============================================================================
// Test Utilities
// =============================================================================

interface RenderOptions {
  initialEntries?: string[];
}

function renderWithRouter(ui: React.ReactElement, options: RenderOptions = {}) {
  const { initialEntries = ['/tenants/tenant-123'] } = options;

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/tenants/:id" element={ui} />
        <Route path="/tenants" element={<div>Tenants List</div>} />
      </Routes>
    </MemoryRouter>
  );
}

// =============================================================================
// Test Suite
// =============================================================================

describe('TenantDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset all mock returns to default values
    mockTenantReturn = {
      data: mockTenantData,
      isLoading: false,
    };
    mockFlagsReturn = {
      data: mockTenantFlags,
      isLoading: false,
    };
    mockCatalogReturn = {
      data: mockFlagsCatalog,
    };
    mockBillingReturn = {
      data: mockBillingData,
      isLoading: false,
    };
    mockSecretsReturn = {
      data: mockSecretsData,
      isLoading: false,
    };

    mockConfirm.mockReturnValue(true);
    mockRotateLicenseMutateAsync.mockResolvedValue({
      data: { licenseKey: 'new-license-key-abc123' },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Loading State Tests
  // ===========================================================================

  describe('Loading state', () => {
    it('renders spinner when loading', () => {
      mockTenantReturn = {
        data: undefined,
        isLoading: true,
      };

      renderWithRouter(<TenantDetailPage />);

      const spinner = screen.getByTestId('spinner');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-label', 'Laster...');
    });

    it('does not render content when loading', () => {
      mockTenantReturn = {
        data: undefined,
        isLoading: true,
      };

      renderWithRouter(<TenantDetailPage />);

      expect(screen.queryByText('Oslo Kommune')).not.toBeInTheDocument();
      expect(screen.queryByTestId('tabs')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Not Found State Tests
  // ===========================================================================

  describe('Not found state', () => {
    it('renders not found message when tenant is null', () => {
      mockTenantReturn = {
        data: { data: undefined } as any,
        isLoading: false,
      };

      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Tenant ikke funnet')).toBeInTheDocument();
      expect(screen.getByText('Denne tenanten eksisterer ikke eller du har ikke tilgang.')).toBeInTheDocument();
    });

    it('renders back to list button in not found state', () => {
      mockTenantReturn = {
        data: { data: undefined } as any,
        isLoading: false,
      };

      renderWithRouter(<TenantDetailPage />);

      const buttons = screen.getAllByTestId('button');
      const backButton = buttons.find((btn) => btn.textContent?.includes('Tilbake til oversikt'));
      expect(backButton).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Basic Rendering Tests
  // ===========================================================================

  describe('Basic rendering', () => {
    it('renders tenant name', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Oslo Kommune')).toBeInTheDocument();
    });

    it('renders back to list button in header', () => {
      renderWithRouter(<TenantDetailPage />);

      const buttons = screen.getAllByTestId('button');
      const backButtons = buttons.filter((btn) => btn.textContent?.includes('Tilbake til oversikt'));
      expect(backButtons.length).toBeGreaterThan(0);
    });

    it('renders status badge', () => {
      renderWithRouter(<TenantDetailPage />);

      const badges = screen.getAllByTestId('badge');
      const statusBadge = badges.find((badge) => badge.textContent === 'Aktiv');
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveAttribute('data-color', 'success');
    });

    it('renders subscription plan badge', () => {
      renderWithRouter(<TenantDetailPage />);

      const badges = screen.getAllByTestId('badge');
      const planBadge = badges.find((badge) => badge.textContent === 'Enterprise');
      expect(planBadge).toBeInTheDocument();
    });

    it('renders licensed badge when tenant has license', () => {
      renderWithRouter(<TenantDetailPage />);

      const badges = screen.getAllByTestId('badge');
      const licenseBadge = badges.find((badge) => badge.textContent?.includes('Lisensiert'));
      expect(licenseBadge).toBeInTheDocument();
      expect(licenseBadge).toHaveAttribute('data-color', 'success');
    });

    it('renders slug information', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Slug:')).toBeInTheDocument();
      expect(screen.getByText('oslo-kommune')).toBeInTheDocument();
    });

    it('renders domain information', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Domene:')).toBeInTheDocument();
      expect(screen.getByText('oslo.kommune.no')).toBeInTheDocument();
    });

    it('renders edit button', () => {
      renderWithRouter(<TenantDetailPage />);

      const buttons = screen.getAllByTestId('button');
      const editButton = buttons.find((btn) => btn.textContent?.includes('Rediger'));
      expect(editButton).toBeInTheDocument();
    });

    it('renders suspend button for active tenant', () => {
      renderWithRouter(<TenantDetailPage />);

      const buttons = screen.getAllByTestId('button');
      const suspendButton = buttons.find((btn) => btn.textContent?.includes('Suspender'));
      expect(suspendButton).toBeInTheDocument();
      expect(suspendButton).toHaveAttribute('data-variant', 'danger');
    });

    it('renders reactivate button for suspended tenant', () => {
      mockTenantReturn = {
        data: {
          data: { ...mockTenantData.data, status: 'suspended' as const },
        },
        isLoading: false,
      };

      renderWithRouter(<TenantDetailPage />);

      const buttons = screen.getAllByTestId('button');
      const reactivateButton = buttons.find((btn) => btn.textContent?.includes('Reaktiver'));
      expect(reactivateButton).toBeInTheDocument();
      expect(reactivateButton).toHaveAttribute('data-variant', 'primary');
    });
  });

  // ===========================================================================
  // Usage Statistics Tests
  // ===========================================================================

  describe('Usage statistics', () => {
    it('renders all stat cards', () => {
      renderWithRouter(<TenantDetailPage />);

      const statCards = screen.getAllByTestId('stat-card');
      expect(statCards).toHaveLength(5);
    });

    it('renders users stat card with correct values', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Brukere')).toBeInTheDocument();
      expect(screen.getByText('150 / 200')).toBeInTheDocument();
    });

    it('renders organizations stat card with correct values', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Organisasjoner')).toBeInTheDocument();
      expect(screen.getByText('12 / 20')).toBeInTheDocument();
    });

    it('renders listings stat card with correct values', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Oppføringer')).toBeInTheDocument();
      expect(screen.getByText('500 / 1000')).toBeInTheDocument();
    });

    it('renders bookings stat card with correct values', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Bookinger denne måneden')).toBeInTheDocument();
      expect(screen.getByText('2500 / 5000')).toBeInTheDocument();
    });

    it('renders storage stat card with correct values', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Lagring')).toBeInTheDocument();
      expect(screen.getByText('1500 / 5000 MB')).toBeInTheDocument();
    });

    it('calculates and displays percentage correctly', () => {
      renderWithRouter(<TenantDetailPage />);

      // Users: 150/200 = 75%
      const descriptions = screen.getAllByTestId('stat-description');
      const percentages = descriptions.map((d) => d.textContent);
      expect(percentages).toContain('75%');
    });
  });

  // ===========================================================================
  // Tabs Tests
  // ===========================================================================

  describe('Tabs navigation', () => {
    it('renders all tab buttons', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByTestId('tab-overview')).toBeInTheDocument();
      expect(screen.getByTestId('tab-flags')).toBeInTheDocument();
      expect(screen.getByTestId('tab-billing')).toBeInTheDocument();
      expect(screen.getByTestId('tab-secrets')).toBeInTheDocument();
      expect(screen.getByTestId('tab-license')).toBeInTheDocument();
    });

    it('displays tab labels with icons', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByTestId('tab-overview')).toHaveTextContent('Oversikt');
      expect(screen.getByTestId('tab-flags')).toHaveTextContent('Feature Flags');
      expect(screen.getByTestId('tab-billing')).toHaveTextContent('Fakturering');
      expect(screen.getByTestId('tab-secrets')).toHaveTextContent('Hemmeligheter');
      expect(screen.getByTestId('tab-license')).toHaveTextContent('Lisens');
    });

    it('displays flag count in tab label', () => {
      renderWithRouter(<TenantDetailPage />);

      const flagsTab = screen.getByTestId('tab-flags');
      // 4 flags from catalog
      expect(flagsTab).toHaveTextContent('(4)');
    });

    it('displays secrets count in tab label', () => {
      renderWithRouter(<TenantDetailPage />);

      const secretsTab = screen.getByTestId('tab-secrets');
      // 2 secrets
      expect(secretsTab).toHaveTextContent('(2)');
    });
  });

  // ===========================================================================
  // Overview Tab Tests
  // ===========================================================================

  describe('Overview tab', () => {
    it('renders basic info card', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Grunnleggende informasjon')).toBeInTheDocument();
    });

    it('renders tenant ID', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Tenant ID')).toBeInTheDocument();
      expect(screen.getByText('tenant-123')).toBeInTheDocument();
    });

    it('renders subscription plan', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Abonnementsplan')).toBeInTheDocument();
    });

    it('renders limits card', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Grenser')).toBeInTheDocument();
    });

    it('renders all limit values', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Maks brukere')).toBeInTheDocument();
      expect(screen.getByText('Maks organisasjoner')).toBeInTheDocument();
      expect(screen.getByText('Maks oppføringer')).toBeInTheDocument();
      expect(screen.getByText('Maks bookinger per måned')).toBeInTheDocument();
      expect(screen.getByText('Maks lagring')).toBeInTheDocument();
    });

    it('renders change limits button', () => {
      renderWithRouter(<TenantDetailPage />);

      const buttons = screen.getAllByTestId('button');
      const changeLimitsButton = buttons.find((btn) => btn.textContent?.includes('Endre grenser'));
      expect(changeLimitsButton).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Feature Flags Tab Tests
  // ===========================================================================

  describe('Feature flags tab', () => {
    it('renders feature flags heading', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Feature Flags')).toBeInTheDocument();
    });

    it('renders feature flags description', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Administrer funksjonsflagg for denne tenanten.')).toBeInTheDocument();
    });

    it('renders category headings', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Moduler')).toBeInTheDocument();
      expect(screen.getByText('Integrasjoner')).toBeInTheDocument();
      expect(screen.getByText('Policyer')).toBeInTheDocument();
    });

    it('renders flag names', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Calendar Module')).toBeInTheDocument();
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Vipps Integration')).toBeInTheDocument();
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    });

    it('renders flag keys', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('feature-calendar')).toBeInTheDocument();
      expect(screen.getByText('feature-analytics')).toBeInTheDocument();
      expect(screen.getByText('integration-vipps')).toBeInTheDocument();
      expect(screen.getByText('policy-2fa')).toBeInTheDocument();
    });

    it('renders switch for each flag', () => {
      renderWithRouter(<TenantDetailPage />);

      const switches = screen.getAllByTestId('switch');
      // 4 flags = 4 switches
      expect(switches).toHaveLength(4);
    });

    it('shows overridden badge for overridden flags', () => {
      renderWithRouter(<TenantDetailPage />);

      const badges = screen.getAllByTestId('badge');
      const overriddenBadges = badges.filter((badge) => badge.textContent === 'Overstyrt');
      // 2 flags are overridden (from mockTenantFlags)
      expect(overriddenBadges).toHaveLength(2);
    });

    it('renders spinner when flags are loading', () => {
      mockFlagsReturn = {
        data: undefined,
        isLoading: true,
      };

      renderWithRouter(<TenantDetailPage />);

      // There should be a spinner in the flags section
      const spinners = screen.getAllByTestId('spinner');
      expect(spinners.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // Billing Tab Tests
  // ===========================================================================

  describe('Billing tab', () => {
    it('renders billing status', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Faktureringsstatus')).toBeInTheDocument();
    });

    it('renders current plan', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Gjeldende plan')).toBeInTheDocument();
    });

    it('renders amount paid', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Betalt beløp')).toBeInTheDocument();
    });

    it('renders amount due', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Utestående beløp')).toBeInTheDocument();
    });

    it('renders invoices table', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Fakturaer')).toBeInTheDocument();
    });

    it('renders invoice numbers', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('INV-2024-001')).toBeInTheDocument();
      expect(screen.getByText('INV-2024-002')).toBeInTheDocument();
    });

    it('renders no billing info message when billing data is null', () => {
      mockBillingReturn = {
        data: { data: null } as any,
        isLoading: false,
      };

      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Ingen faktureringsinformasjon tilgjengelig.')).toBeInTheDocument();
    });

    it('renders spinner when billing is loading', () => {
      mockBillingReturn = {
        data: undefined,
        isLoading: true,
      };

      renderWithRouter(<TenantDetailPage />);

      const spinners = screen.getAllByTestId('spinner');
      expect(spinners.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // Secrets Tab Tests
  // ===========================================================================

  describe('Secrets tab', () => {
    it('renders secrets heading', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Hemmeligheter')).toBeInTheDocument();
    });

    it('renders secrets description', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Konfigurer API-nøkler og hemmeligheter for integrasjoner.')).toBeInTheDocument();
    });

    it('renders secrets table', () => {
      renderWithRouter(<TenantDetailPage />);

      const tables = screen.getAllByTestId('table');
      expect(tables.length).toBeGreaterThan(0);
    });

    it('renders provider names', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Vipps')).toBeInTheDocument();
      expect(screen.getByText('SendGrid')).toBeInTheDocument();
    });

    it('renders secret keys', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('VIPPS_CLIENT_ID')).toBeInTheDocument();
      expect(screen.getByText('SMTP_PASSWORD')).toBeInTheDocument();
    });

    it('renders configured badge', () => {
      renderWithRouter(<TenantDetailPage />);

      const badges = screen.getAllByTestId('badge');
      const configuredBadge = badges.find((badge) => badge.textContent === 'Konfigurert');
      expect(configuredBadge).toBeInTheDocument();
      expect(configuredBadge).toHaveAttribute('data-color', 'success');
    });

    it('renders not configured badge', () => {
      renderWithRouter(<TenantDetailPage />);

      const badges = screen.getAllByTestId('badge');
      const notConfiguredBadge = badges.find((badge) => badge.textContent === 'Ikke konfigurert');
      expect(notConfiguredBadge).toBeInTheDocument();
      expect(notConfiguredBadge).toHaveAttribute('data-color', 'warning');
    });

    it('renders no secrets message when secrets array is empty', () => {
      mockSecretsReturn = {
        data: { data: [] },
        isLoading: false,
      };

      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Ingen hemmeligheter')).toBeInTheDocument();
      expect(screen.getByText('Denne tenanten har ingen konfigurerte hemmeligheter.')).toBeInTheDocument();
    });

    it('renders spinner when secrets are loading', () => {
      mockSecretsReturn = {
        data: undefined,
        isLoading: true,
      };

      renderWithRouter(<TenantDetailPage />);

      const spinners = screen.getAllByTestId('spinner');
      expect(spinners.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // License Tab Tests
  // ===========================================================================

  describe('License tab', () => {
    it('renders license key heading', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText('Lisensnøkkel')).toBeInTheDocument();
    });

    it('renders licensed badge when tenant has license', () => {
      renderWithRouter(<TenantDetailPage />);

      const badges = screen.getAllByTestId('badge');
      const licenseBadges = badges.filter((badge) => badge.textContent?.includes('Lisensiert'));
      expect(licenseBadges.length).toBeGreaterThan(0);
    });

    it('renders fingerprint when tenant has license', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText(/Fingeravtrykk: fp-abc123/)).toBeInTheDocument();
    });

    it('renders last rotated date', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText(/Sist rotert:/)).toBeInTheDocument();
    });

    it('renders rotate license button when tenant has license', () => {
      renderWithRouter(<TenantDetailPage />);

      const buttons = screen.getAllByTestId('button');
      const rotateButton = buttons.find((btn) => btn.textContent?.includes('Roter lisensnøkkel'));
      expect(rotateButton).toBeInTheDocument();
    });

    it('renders generate license button when tenant has no license', () => {
      mockTenantReturn = {
        data: {
          data: { ...mockTenantData.data, licenseKeyFingerprint: null, licenseKeyRotatedAt: null },
        },
        isLoading: false,
      };

      renderWithRouter(<TenantDetailPage />);

      const buttons = screen.getAllByTestId('button');
      const generateButton = buttons.find((btn) => btn.textContent?.includes('Generer lisensnøkkel'));
      expect(generateButton).toBeInTheDocument();
    });

    it('renders no license badge when tenant has no license', () => {
      mockTenantReturn = {
        data: {
          data: { ...mockTenantData.data, licenseKeyFingerprint: null },
        },
        isLoading: false,
      };

      renderWithRouter(<TenantDetailPage />);

      const badges = screen.getAllByTestId('badge');
      const noLicenseBadge = badges.find((badge) => badge.textContent === 'Ingen lisens');
      expect(noLicenseBadge).toBeInTheDocument();
      expect(noLicenseBadge).toHaveAttribute('data-color', 'warning');
    });

    it('renders rotate warning message', () => {
      renderWithRouter(<TenantDetailPage />);

      expect(screen.getByText(/Advarsel: Rotasjon av lisensnøkkel vil ugyldiggjøre/)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Action Handler Tests
  // ===========================================================================

  describe('Action handlers', () => {
    describe('Suspend action', () => {
      it('calls suspend mutation when suspend button is clicked and confirmed', async () => {
        const user = userEvent.setup();
        renderWithRouter(<TenantDetailPage />);

        const buttons = screen.getAllByTestId('button');
        const suspendButton = buttons.find((btn) => btn.textContent?.includes('Suspender'));

        if (suspendButton) {
          await user.click(suspendButton);
        }

        expect(mockConfirm).toHaveBeenCalledWith('Er du sikker på at du vil suspendere denne tenanten?');
        expect(mockSuspendMutateAsync).toHaveBeenCalledWith({
          tenantId: 'tenant-123',
          data: { reason: 'Suspended by SaaS Admin', notifyAdmins: true },
        });
      });

      it('does not call suspend mutation when cancelled', async () => {
        mockConfirm.mockReturnValue(false);
        const user = userEvent.setup();
        renderWithRouter(<TenantDetailPage />);

        const buttons = screen.getAllByTestId('button');
        const suspendButton = buttons.find((btn) => btn.textContent?.includes('Suspender'));

        if (suspendButton) {
          await user.click(suspendButton);
        }

        expect(mockConfirm).toHaveBeenCalled();
        expect(mockSuspendMutateAsync).not.toHaveBeenCalled();
      });
    });

    describe('Reactivate action', () => {
      it('calls reactivate mutation when reactivate button is clicked', async () => {
        mockTenantReturn = {
          data: {
            data: { ...mockTenantData.data, status: 'suspended' as const },
          },
          isLoading: false,
        };

        const user = userEvent.setup();
        renderWithRouter(<TenantDetailPage />);

        const buttons = screen.getAllByTestId('button');
        const reactivateButton = buttons.find((btn) => btn.textContent?.includes('Reaktiver'));

        if (reactivateButton) {
          await user.click(reactivateButton);
        }

        expect(mockReactivateMutateAsync).toHaveBeenCalledWith('tenant-123');
      });
    });

    describe('Toggle flag action', () => {
      it('calls update flags mutation when switch is toggled', async () => {
        const user = userEvent.setup();
        renderWithRouter(<TenantDetailPage />);

        const switches = screen.getAllByTestId('switch');
        // Toggle the first switch
        await user.click(switches[0]);

        expect(mockUpdateFlagsMutateAsync).toHaveBeenCalled();
      });
    });

    describe('Rotate license action', () => {
      it('calls rotate license mutation when button is clicked and confirmed', async () => {
        const user = userEvent.setup();
        renderWithRouter(<TenantDetailPage />);

        const buttons = screen.getAllByTestId('button');
        const rotateButton = buttons.find((btn) => btn.textContent?.includes('Roter lisensnøkkel'));

        if (rotateButton) {
          await user.click(rotateButton);
        }

        expect(mockConfirm).toHaveBeenCalledWith('Er du sikker på at du vil rotere lisensnøkkelen?');
        expect(mockRotateLicenseMutateAsync).toHaveBeenCalledWith('tenant-123');
      });

      it('does not call rotate license mutation when cancelled', async () => {
        mockConfirm.mockReturnValue(false);
        const user = userEvent.setup();
        renderWithRouter(<TenantDetailPage />);

        const buttons = screen.getAllByTestId('button');
        const rotateButton = buttons.find((btn) => btn.textContent?.includes('Roter lisensnøkkel'));

        if (rotateButton) {
          await user.click(rotateButton);
        }

        expect(mockConfirm).toHaveBeenCalled();
        expect(mockRotateLicenseMutateAsync).not.toHaveBeenCalled();
      });

      it('displays new license key after successful rotation', async () => {
        const user = userEvent.setup();
        renderWithRouter(<TenantDetailPage />);

        const buttons = screen.getAllByTestId('button');
        const rotateButton = buttons.find((btn) => btn.textContent?.includes('Roter lisensnøkkel'));

        if (rotateButton) {
          await user.click(rotateButton);
        }

        await waitFor(() => {
          expect(screen.getByText('Ny lisensnøkkel generert!')).toBeInTheDocument();
          expect(screen.getByText('new-license-key-abc123')).toBeInTheDocument();
        });
      });

      it('hides license key alert when close button is clicked', async () => {
        const user = userEvent.setup();
        renderWithRouter(<TenantDetailPage />);

        // First, rotate the license
        const rotateButtons = screen.getAllByTestId('button');
        const rotateButton = rotateButtons.find((btn) => btn.textContent?.includes('Roter lisensnøkkel'));

        if (rotateButton) {
          await user.click(rotateButton);
        }

        await waitFor(() => {
          expect(screen.getByText('new-license-key-abc123')).toBeInTheDocument();
        });

        // Find and click close button
        const closeButtons = screen.getAllByTestId('button');
        const closeButton = closeButtons.find((btn) => btn.textContent?.includes('Lukk'));

        if (closeButton) {
          await user.click(closeButton);
        }

        await waitFor(() => {
          expect(screen.queryByText('new-license-key-abc123')).not.toBeInTheDocument();
        });
      });
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('Edge cases', () => {
    it('handles tenant without domain', () => {
      mockTenantReturn = {
        data: {
          data: { ...mockTenantData.data, domain: null },
        },
        isLoading: false,
      };

      renderWithRouter(<TenantDetailPage />);

      // Should not render domain section
      expect(screen.queryByText('Domene:')).not.toBeInTheDocument();
    });

    it('handles tenant without subscription plan', () => {
      mockTenantReturn = {
        data: {
          data: { ...mockTenantData.data, subscriptionPlanName: null },
        },
        isLoading: false,
      };

      renderWithRouter(<TenantDetailPage />);

      // Should show "Ingen plan" in the overview
      expect(screen.getByText('Ingen plan')).toBeInTheDocument();
    });

    it('handles empty flags catalog', () => {
      mockCatalogReturn = {
        data: { data: [] },
      };

      renderWithRouter(<TenantDetailPage />);

      // Should render but with 0 flags
      const flagsTab = screen.getByTestId('tab-flags');
      expect(flagsTab).toHaveTextContent('(0)');
    });

    it('handles billing with overdue status', () => {
      mockBillingReturn = {
        data: {
          data: {
            ...mockBillingData.data,
            status: 'overdue' as const,
            amountDue: 15000,
          },
        },
        isLoading: false,
      };

      renderWithRouter(<TenantDetailPage />);

      const badges = screen.getAllByTestId('badge');
      const overdueBadge = badges.find((badge) => badge.textContent === 'overdue');
      expect(overdueBadge).toHaveAttribute('data-color', 'danger');
    });

    it('handles suspended status correctly', () => {
      mockTenantReturn = {
        data: {
          data: { ...mockTenantData.data, status: 'suspended' as const },
        },
        isLoading: false,
      };

      renderWithRouter(<TenantDetailPage />);

      const badges = screen.getAllByTestId('badge');
      const statusBadge = badges.find((badge) => badge.textContent === 'Suspendert');
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveAttribute('data-color', 'danger');
    });

    it('handles pending status correctly', () => {
      mockTenantReturn = {
        data: {
          data: { ...mockTenantData.data, status: 'pending' as const },
        },
        isLoading: false,
      };

      renderWithRouter(<TenantDetailPage />);

      const badges = screen.getAllByTestId('badge');
      const statusBadge = badges.find((badge) => badge.textContent === 'Venter');
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveAttribute('data-color', 'info');
    });

    it('handles inactive status correctly', () => {
      mockTenantReturn = {
        data: {
          data: { ...mockTenantData.data, status: 'inactive' as const },
        },
        isLoading: false,
      };

      renderWithRouter(<TenantDetailPage />);

      const badges = screen.getAllByTestId('badge');
      const statusBadge = badges.find((badge) => badge.textContent === 'Inaktiv');
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveAttribute('data-color', 'warning');
    });
  });
});
