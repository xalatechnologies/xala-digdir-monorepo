import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
} from '@xala/ds';
import { CheckIcon, TrashIcon, EditIcon, DownloadIcon, PlusIcon } from '@xala/ds';
import { DataPageToolbar } from '../../src/composed/data-page/DataPageToolbar';
import { DataPageHeader } from '../../src/composed/data-page/DataPageHeader';
import { FilterChips } from '../../src/composed/data-page/FilterChips';
import { BulkActionsBar } from '../../src/composed/data-page/BulkActionsBar';
import { StatusTabs } from '../../src/composed/data-page/StatusTabs';
import type { ViewMode, FilterConfig } from '../../src/composed/data-page/DataPageToolbar';
import type { FilterChip } from '../../src/composed/data-page/FilterChips';
import type { BulkAction } from '../../src/composed/data-page/BulkActionsBar';
import type { StatusTabItem } from '../../src/composed/data-page/StatusTabs';

/**
 * Data page components for list views and data management.
 *
 * ## Components
 * - **DataPageToolbar**: Search, filters, and view mode toggle
 * - **DataPageHeader**: Page header with count badge
 * - **FilterChips**: Active filter display with remove buttons
 * - **BulkActionsBar**: Actions for selected items
 * - **StatusTabs**: Status filtering tabs with counts
 *
 * ## Features
 * - Search functionality
 * - View mode switching (grid, list, table, map)
 * - Active filter chips
 * - Bulk selection actions
 * - Status-based filtering
 */
const meta: Meta<typeof DataPageToolbar> = {
  title: 'Composed/DataPage',
  component: DataPageToolbar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Components for building data-heavy admin pages with filtering, selection, and bulk actions.

## Use Cases
- Resource management lists
- Booking overview pages
- User administration
- Report data views
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataPageToolbar>;

// =============================================================================
// DataPageToolbar Stories
// =============================================================================

/**
 * Default toolbar with search and view toggle
 */
export const ToolbarDefault: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    return (
      <DataPageToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearch={(value) => console.log('Search:', value)}
        searchPlaceholder="Søk etter lokaler..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        availableViews={['grid', 'list', 'table']}
      />
    );
  },
};

/**
 * Toolbar with filters
 */
export const ToolbarWithFilters: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [status, setStatus] = useState('all');
    const [category, setCategory] = useState('all');

    const filters: FilterConfig[] = [
      {
        label: 'Status',
        value: status,
        onChange: setStatus,
        options: [
          { value: 'all', label: 'Alle statuser' },
          { value: 'active', label: 'Aktiv' },
          { value: 'pending', label: 'Venter' },
          { value: 'inactive', label: 'Inaktiv' },
        ],
      },
      {
        label: 'Kategori',
        value: category,
        onChange: setCategory,
        options: [
          { value: 'all', label: 'Alle kategorier' },
          { value: 'sports', label: 'Idrett' },
          { value: 'meeting', label: 'Møtelokale' },
          { value: 'cultural', label: 'Kulturlokale' },
        ],
      },
    ];

    return (
      <DataPageToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Søk..."
        filters={filters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        availableViews={['grid', 'list']}
      />
    );
  },
};

/**
 * Toolbar with map view option
 */
export const ToolbarWithMapView: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    return (
      <DataPageToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Søk etter lokaler..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        availableViews={['grid', 'list', 'map']}
      />
    );
  },
};

// =============================================================================
// DataPageHeader Stories
// =============================================================================

/**
 * Page header with title and count
 */
export const HeaderDefault: Story = {
  render: () => (
    <DataPageHeader
      title="Utleieobjekter"
      count={42}
      countLabel="{{count}} objekter"
      description="Administrer kommunens utleieobjekter"
    />
  ),
};

/**
 * Header with actions
 */
export const HeaderWithActions: Story = {
  render: () => (
    <DataPageHeader
      title="Bookinger"
      count={128}
      countLabel="{{count}} bookinger"
      description="Se og administrer alle bookinger"
      actions={
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
          <Button variant="secondary" data-size="sm">
            <DownloadIcon />
            Eksporter
          </Button>
          <Button variant="primary" data-size="sm">
            <PlusIcon />
            Ny booking
          </Button>
        </div>
      }
    />
  ),
};

/**
 * Header without count
 */
export const HeaderNoCount: Story = {
  render: () => (
    <DataPageHeader
      title="Innstillinger"
      description="Konfigurer systeminnstillinger"
    />
  ),
};

// =============================================================================
// FilterChips Stories
// =============================================================================

/**
 * Active filter chips
 */
export const FilterChipsDefault: Story = {
  render: () => {
    const [chips, setChips] = useState<FilterChip[]>([
      { key: 'status', label: 'Status: Aktiv', onRemove: () => {} },
      { key: 'category', label: 'Kategori: Idrett', onRemove: () => {} },
      { key: 'location', label: 'Sted: Oslo', onRemove: () => {} },
    ]);

    const handleRemove = (key: string) => {
      setChips(chips.filter(c => c.key !== key));
    };

    const handleResetAll = () => {
      setChips([]);
    };

    return (
      <FilterChips
        chips={chips.map(c => ({ ...c, onRemove: () => handleRemove(c.key) }))}
        onResetAll={handleResetAll}
        resetLabel="Nullstill alle"
        activeFiltersLabel="Aktive filtre:"
      />
    );
  },
};

/**
 * Single filter chip
 */
export const FilterChipsSingle: Story = {
  render: () => (
    <FilterChips
      chips={[
        { key: 'search', label: 'Søk: "møterom"', onRemove: () => console.log('Remove search') },
      ]}
      onResetAll={() => console.log('Reset all')}
      resetLabel="Nullstill"
    />
  ),
};

/**
 * Many filter chips
 */
export const FilterChipsMany: Story = {
  render: () => (
    <FilterChips
      chips={[
        { key: '1', label: 'Status: Aktiv', onRemove: () => {} },
        { key: '2', label: 'Type: Møterom', onRemove: () => {} },
        { key: '3', label: 'Kapasitet: 10+', onRemove: () => {} },
        { key: '4', label: 'Pris: Gratis', onRemove: () => {} },
        { key: '5', label: 'Tilgjengelig: I dag', onRemove: () => {} },
      ]}
      onResetAll={() => console.log('Reset')}
      resetLabel="Nullstill alle"
      activeFiltersLabel="5 aktive filtre:"
    />
  ),
};

// =============================================================================
// BulkActionsBar Stories
// =============================================================================

/**
 * Bulk actions bar (fixed position)
 */
export const BulkActionsFixed: Story = {
  render: () => {
    const [selectedCount, setSelectedCount] = useState(5);

    const actions: BulkAction[] = [
      {
        label: 'Aktiver',
        onClick: () => console.log('Activate'),
        variant: 'primary',
        icon: <CheckIcon />,
      },
      {
        label: 'Rediger',
        onClick: () => console.log('Edit'),
        variant: 'secondary',
        icon: <EditIcon />,
      },
      {
        label: 'Slett',
        onClick: () => console.log('Delete'),
        variant: 'secondary',
        icon: <TrashIcon />,
      },
    ];

    return (
      <div style={{ height: '300px', position: 'relative' }}>
        <Paragraph data-size="sm" style={{ textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Bulk actions bar vises nederst når elementer er valgt
        </Paragraph>
        <BulkActionsBar
          selectedCount={selectedCount}
          actions={actions}
          onClear={() => setSelectedCount(0)}
          selectedLabel="{{count}} valgt"
          clearLabel="Avbryt"
          position="fixed"
        />
      </div>
    );
  },
};

/**
 * Bulk actions bar (inline)
 */
export const BulkActionsInline: Story = {
  render: () => {
    const actions: BulkAction[] = [
      {
        label: 'Godkjenn alle',
        onClick: () => console.log('Approve'),
        variant: 'primary',
      },
      {
        label: 'Avslå',
        onClick: () => console.log('Reject'),
        variant: 'secondary',
      },
    ];

    return (
      <BulkActionsBar
        selectedCount={3}
        actions={actions}
        onClear={() => console.log('Clear')}
        selectedLabel="{{count}} valgt"
        clearLabel="Fjern valg"
        position="inline"
      />
    );
  },
};

// =============================================================================
// StatusTabs Stories
// =============================================================================

/**
 * Status tabs with counts
 */
export const StatusTabsDefault: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('all');

    const tabs: StatusTabItem[] = [
      { id: 'all', label: 'Alle', count: 156 },
      { id: 'pending', label: 'Venter', count: 12, color: 'warning' },
      { id: 'confirmed', label: 'Bekreftet', count: 89, color: 'success' },
      { id: 'cancelled', label: 'Kansellert', count: 23, color: 'danger' },
      { id: 'completed', label: 'Fullført', count: 32, color: 'info' },
    ];

    return (
      <StatusTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
    );
  },
};

/**
 * Status tabs without counts
 */
export const StatusTabsNoCounts: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs: StatusTabItem[] = [
      { id: 'overview', label: 'Oversikt' },
      { id: 'details', label: 'Detaljer' },
      { id: 'history', label: 'Historikk' },
      { id: 'settings', label: 'Innstillinger' },
    ];

    return (
      <StatusTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
    );
  },
};

/**
 * Status tabs with icons
 */
export const StatusTabsWithIcons: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('active');

    const tabs: StatusTabItem[] = [
      { id: 'active', label: 'Aktive', count: 45, icon: <CheckIcon />, color: 'success' },
      { id: 'pending', label: 'Venter', count: 8, icon: <EditIcon />, color: 'warning' },
      { id: 'archived', label: 'Arkivert', count: 120, icon: <DownloadIcon />, color: 'neutral' },
    ];

    return (
      <StatusTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
    );
  },
};

// =============================================================================
// Complete Data Page Demo
// =============================================================================

/**
 * Complete data page layout
 */
export const CompleteDataPage: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [filters, setFilters] = useState({
      status: 'all',
      category: 'all',
    });
    const [activeChips, setActiveChips] = useState<FilterChip[]>([]);

    const handleFilterChange = (key: string, value: string, label: string) => {
      setFilters(prev => ({ ...prev, [key]: value }));
      if (value !== 'all') {
        setActiveChips(prev => [
          ...prev.filter(c => c.key !== key),
          { key, label: `${key === 'status' ? 'Status' : 'Kategori'}: ${label}`, onRemove: () => {} }
        ]);
      } else {
        setActiveChips(prev => prev.filter(c => c.key !== key));
      }
    };

    const statusTabs: StatusTabItem[] = [
      { id: 'all', label: 'Alle', count: 156 },
      { id: 'active', label: 'Aktive', count: 89, color: 'success' },
      { id: 'pending', label: 'Venter', count: 12, color: 'warning' },
      { id: 'inactive', label: 'Inaktive', count: 55, color: 'neutral' },
    ];

    const filterConfigs: FilterConfig[] = [
      {
        label: 'Status',
        value: filters.status,
        onChange: (value) => {
          const labels: Record<string, string> = { active: 'Aktiv', pending: 'Venter', inactive: 'Inaktiv' };
          handleFilterChange('status', value, labels[value] || 'Alle');
        },
        options: [
          { value: 'all', label: 'Alle statuser' },
          { value: 'active', label: 'Aktiv' },
          { value: 'pending', label: 'Venter' },
          { value: 'inactive', label: 'Inaktiv' },
        ],
      },
      {
        label: 'Kategori',
        value: filters.category,
        onChange: (value) => {
          const labels: Record<string, string> = { sports: 'Idrett', meeting: 'Møte', cultural: 'Kultur' };
          handleFilterChange('category', value, labels[value] || 'Alle');
        },
        options: [
          { value: 'all', label: 'Alle kategorier' },
          { value: 'sports', label: 'Idrett' },
          { value: 'meeting', label: 'Møte' },
          { value: 'cultural', label: 'Kultur' },
        ],
      },
    ];

    const bulkActions: BulkAction[] = [
      { label: 'Aktiver', onClick: () => setSelectedItems([]), variant: 'primary', icon: <CheckIcon /> },
      { label: 'Rediger', onClick: () => {}, variant: 'secondary', icon: <EditIcon /> },
      { label: 'Slett', onClick: () => setSelectedItems([]), variant: 'secondary', icon: <TrashIcon /> },
    ];

    // Mock items for demo
    const mockItems = ['item-1', 'item-2', 'item-3', 'item-4', 'item-5', 'item-6'];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
        {/* Header */}
        <DataPageHeader
          title="Utleieobjekter"
          count={156}
          countLabel="{{count}} objekter"
          description="Administrer kommunens utleieobjekter"
          actions={
            <Button variant="primary" data-size="sm">
              <PlusIcon />
              Nytt objekt
            </Button>
          }
        />

        {/* Status Tabs */}
        <StatusTabs
          tabs={statusTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Toolbar */}
        <DataPageToolbar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Søk etter objekter..."
          filters={filterConfigs}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          availableViews={['grid', 'list', 'table', 'map']}
        />

        {/* Active Filters */}
        {activeChips.length > 0 && (
          <FilterChips
            chips={activeChips.map(c => ({
              ...c,
              onRemove: () => {
                setActiveChips(prev => prev.filter(chip => chip.key !== c.key));
                setFilters(prev => ({ ...prev, [c.key]: 'all' }));
              }
            }))}
            onResetAll={() => {
              setActiveChips([]);
              setFilters({ status: 'all', category: 'all' });
            }}
            resetLabel="Nullstill alle"
            activeFiltersLabel="Aktive filtre:"
          />
        )}

        {/* Content Area (Mock) */}
        <div style={{
          display: viewMode === 'grid' ? 'grid' : 'flex',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(3, 1fr)' : undefined,
          flexDirection: viewMode === 'list' ? 'column' : undefined,
          gap: 'var(--ds-spacing-4)',
        }}>
          {mockItems.map((item) => (
            <Card
              key={item}
              style={{
                padding: 'var(--ds-spacing-4)',
                cursor: 'pointer',
                border: selectedItems.includes(item)
                  ? '2px solid var(--ds-color-accent-border-default)'
                  : '1px solid var(--ds-color-neutral-border-subtle)',
              }}
              onClick={() => {
                setSelectedItems(prev =>
                  prev.includes(item)
                    ? prev.filter(i => i !== item)
                    : [...prev, item]
                );
              }}
            >
              <Heading level={4} data-size="sm" style={{ margin: 0 }}>
                Møterom {item.split('-')[1]}
              </Heading>
              <Paragraph data-size="sm" style={{ margin: 'var(--ds-spacing-2) 0 0 0', color: 'var(--ds-color-neutral-text-subtle)' }}>
                Klikk for å velge
              </Paragraph>
            </Card>
          ))}
        </div>

        {/* Bulk Actions */}
        <BulkActionsBar
          selectedCount={selectedItems.length}
          actions={bulkActions}
          onClear={() => setSelectedItems([])}
          selectedLabel="{{count}} valgt"
          clearLabel="Avbryt"
          position="inline"
        />
      </div>
    );
  },
};
