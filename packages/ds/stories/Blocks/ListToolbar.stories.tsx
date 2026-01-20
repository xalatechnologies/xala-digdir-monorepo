import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@digdir/designsystemet-react';
import { ListToolbar, type ListToolbarFilter, type ListToolbarSortOption } from '../../src/composed';
import { PlusIcon } from '../../src/primitives';

/**
 * ListToolbar provides search, filters, and view controls for list pages.
 * 
 * Features:
 * - Search input with debounce
 * - Filter dropdowns
 * - Sort options
 */
const meta: Meta<typeof ListToolbar> = {
  title: 'Blocks/ListToolbar',
  component: ListToolbar,
  parameters: {
    docs: {
      description: {
        component: `
The ListToolbar block provides a consistent toolbar for list/grid pages.

## When to Use
- Above lists, grids, or tables of items
- When search/filter functionality is needed

## Accessibility
- Keyboard: Tab navigates between controls
- Search: Announced as search input
- Filters: Dropdown menus are keyboard accessible

## data-testid
- Toolbar: \`data-testid="list-toolbar"\`
- Search: \`data-testid="toolbar-search"\`
- Filters: \`data-testid="toolbar-filter-{id}"\`
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultFilters: ListToolbarFilter[] = [
  {
    id: 'status',
    label: 'Status',
    options: [
      { id: 'all', label: 'All' },
      { id: 'active', label: 'Active' },
      { id: 'inactive', label: 'Inactive' },
    ],
  },
  {
    id: 'type',
    label: 'Type',
    options: [
      { id: 'all', label: 'All Types' },
      { id: 'meeting', label: 'Meeting Room' },
      { id: 'office', label: 'Office Space' },
      { id: 'event', label: 'Event Venue' },
    ],
  },
];

const defaultSortOptions: ListToolbarSortOption[] = [
  { id: 'name-asc', label: 'Name (A-Z)' },
  { id: 'name-desc', label: 'Name (Z-A)' },
  { id: 'date-desc', label: 'Newest First' },
  { id: 'date-asc', label: 'Oldest First' },
];

/**
 * Default ListToolbar with search and filters
 */
export const Default: Story = {
  args: {
    search: {
      placeholder: 'Search items...',
      value: '',
      onChange: (value: string) => console.log('Search:', value),
    },
    filters: defaultFilters,
    onFilterChange: (filterId: string, value: string | undefined) => console.log('Filter:', filterId, value),
  },
};

/**
 * ListToolbar with sort options
 */
export const WithSorting: Story = {
  args: {
    search: {
      placeholder: 'Search items...',
      value: '',
      onChange: (value: string) => console.log('Search:', value),
    },
    filters: defaultFilters,
    onFilterChange: (filterId: string, value: string | undefined) => console.log('Filter:', filterId, value),
    sortOptions: defaultSortOptions,
    sortValue: 'name-asc',
    onSortChange: (value: string) => console.log('Sort:', value),
  },
};

/**
 * ListToolbar with primary action
 */
export const WithPrimaryAction: Story = {
  args: {
    search: {
      placeholder: 'Search listings...',
      value: '',
      onChange: (value: string) => console.log('Search:', value),
    },
    filters: defaultFilters,
    onFilterChange: (filterId: string, value: string | undefined) => console.log('Filter:', filterId, value),
    resultsCount: 42,
    resultsLabel: 'listings',
    primaryAction: (
      <Button variant="primary">
        <PlusIcon />
        Add Listing
      </Button>
    ),
  },
};

/**
 * Full-featured ListToolbar
 */
export const FullFeatured: Story = {
  args: {
    search: {
      placeholder: 'Search listings...',
      value: '',
      onChange: (value: string) => console.log('Search:', value),
    },
    filters: defaultFilters,
    onFilterChange: (filterId: string, value: string | undefined) => console.log('Filter:', filterId, value),
    sortOptions: defaultSortOptions,
    sortValue: 'date-desc',
    onSortChange: (value: string) => console.log('Sort:', value),
    resultsCount: 42,
    resultsLabel: 'listings',
    primaryAction: (
      <Button variant="primary">
        <PlusIcon />
        Add New
      </Button>
    ),
  },
};

/**
 * Search only (minimal)
 */
export const SearchOnly: Story = {
  args: {
    search: {
      placeholder: 'Search...',
      value: '',
      onChange: (value: string) => console.log('Search:', value),
    },
  },
};

/**
 * With active filters
 */
export const WithActiveFilters: Story = {
  args: {
    search: {
      placeholder: 'Search items...',
      value: '',
      onChange: (value: string) => console.log('Search:', value),
    },
    filters: defaultFilters,
    activeFilters: {
      status: 'active',
      type: 'meeting',
    },
    onFilterChange: (filterId: string, value: string | undefined) => console.log('Filter:', filterId, value),
  },
};
