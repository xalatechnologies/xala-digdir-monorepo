import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataTable, type ColumnDef } from '../../src/composed';
import { Badge, Button } from '../../src/primitives';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

const sampleData: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active', createdAt: '2024-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'active', createdAt: '2024-01-16' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer', status: 'inactive', createdAt: '2024-01-17' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'pending', createdAt: '2024-01-18' },
  { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Admin', status: 'active', createdAt: '2024-01-19' },
];

const columns: ColumnDef<User>[] = [
  { id: 'name', accessorKey: 'name', header: 'Name', sortable: true },
  { id: 'email', accessorKey: 'email', header: 'Email', sortable: true },
  { id: 'role', accessorKey: 'role', header: 'Role', sortable: true },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: (_value, row) => {
      const status = (row as User).status;
      const variant = status === 'active' ? 'success' : status === 'pending' ? 'warning' : 'neutral';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  { id: 'createdAt', accessorKey: 'createdAt', header: 'Created', sortable: true },
];

/**
 * DataTable is a powerful table component for displaying and interacting with data.
 * 
 * Features:
 * - Sorting
 * - Pagination
 * - Row selection
 * - Custom cell rendering
 * - Loading states
 * - Empty states
 */
const meta: Meta<typeof DataTable<User>> = {
  title: 'Blocks/DataTable',
  component: DataTable,
  parameters: {
    docs: {
      description: {
        component: `
The DataTable block provides a feature-rich table for displaying data collections.

## When to Use
- Displaying lists of records (users, orders, items)
- When sorting, filtering, or pagination is needed
- For data that requires bulk actions

## Accessibility
- Keyboard: Arrow keys navigate cells, Tab moves between interactive elements
- Screen readers: Table structure announced, sortable columns indicated
- Focus: Clear focus indicators on interactive elements

## data-testid
- Table: \`data-testid="data-table"\`
- Rows: \`data-testid="table-row-{id}"\`
- Cells: \`data-testid="table-cell-{column}"\`
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default DataTable with sample data
 */
export const Default: Story = {
  args: {
    columns,
    data: sampleData,
    getRowKey: (row: User) => row.id,
  },
};

/**
 * DataTable with loading state
 */
export const Loading: Story = {
  args: {
    columns,
    data: [],
    getRowKey: (row: User) => row.id,
    isLoading: true,
  },
};

/**
 * DataTable with empty state
 */
export const Empty: Story = {
  args: {
    columns,
    data: [],
    getRowKey: (row: User) => row.id,
    emptyMessage: 'No users found',
  },
};

/**
 * DataTable with row selection
 */
export const WithSelection: Story = {
  args: {
    columns,
    data: sampleData,
    getRowKey: (row: User) => row.id,
    onRowClick: (row: User) => console.log('Selected:', row),
  },
};

/**
 * DataTable with more data
 */
export const WithMoreData: Story = {
  args: {
    columns,
    data: [...sampleData, ...sampleData, ...sampleData],
    getRowKey: (row: User) => row.id,
  },
};

/**
 * DataTable with row actions
 */
export const WithRowActions: Story = {
  args: {
    columns: [
      ...columns,
      {
        id: 'actions',
        header: 'Actions',
        cell: (_value: unknown, row: unknown) => (
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
            <Button variant="secondary" data-size="sm" onClick={() => console.log('Edit', (row as User).id)} type="button">Edit</Button>
            <Button variant="tertiary" data-size="sm" data-color="danger" onClick={() => console.log('Delete', (row as User).id)} type="button">Delete</Button>
          </div>
        ),
      },
    ],
    data: sampleData,
    getRowKey: (row: User) => row.id,
  },
};

/**
 * DataTable with sticky header
 */
export const StickyHeader: Story = {
  args: {
    columns,
    data: sampleData,
    getRowKey: (row: User) => row.id,
    stickyHeader: true,
    height: 'var(--ds-size-75)',
  },
};

/**
 * DataTable with row click handler
 */
export const Clickable: Story = {
  args: {
    columns,
    data: sampleData,
    getRowKey: (row: User) => row.id,
    onRowClick: (row: User) => console.log('Clicked:', row),
  },
};
