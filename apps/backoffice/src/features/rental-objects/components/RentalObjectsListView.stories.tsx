/**
 * Storybook Stories for RentalObjectsListView
 * Visual regression and component testing
 */

import type { Meta, StoryObj } from '@storybook/react';
import { RentalObjectsListView } from './RentalObjectsListView';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../../../providers/ToastProvider';

// Note: This file requires Storybook to be configured in the project
// Install: pnpm add -D @storybook/react @storybook/react-vite

const meta: Meta<typeof RentalObjectsListView> = {
  title: 'Features/RentalObjects/ListView',
  component: RentalObjectsListView,
  decorators: [
    (Story: React.ComponentType) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      return (
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ToastProvider>
              <Story />
            </ToastProvider>
          </BrowserRouter>
        </QueryClientProvider>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RentalObjectsListView>;

// Mock data generators
const generateRentalObjects = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `id-${i}`,
    slug: `rental-object-${i}`,
    name: `Rental Object ${i + 1}`,
    status: i % 3 === 0 ? 'published' : i % 3 === 1 ? 'draft' : 'archived',
    type: i % 2 === 0 ? 'SPACE' : 'EQUIPMENT',
    description: `Description for rental object ${i + 1}`,
    capacity: Math.floor(Math.random() * 100) + 1,
    location: `Location ${i + 1}`,
    image: `https://picsum.photos/400/300?random=${i}`,
    facilities: ['WiFi', 'Parking', 'Accessible'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

// Mock hooks (when Storybook is configured)
// vi.mock('@digilist/client-sdk', () => ({
//   useRentalObjects: vi.fn((params) => {
//     const count = params?.limit || 20;
//     return {
//       data: { data: generateRentalObjects(count), meta: { total: 100, page: 1, limit: count } },
//       isLoading: false,
//       error: null,
//     };
//   }),
// }));

// vi.mock('../../hooks/useListingPermissions', () => ({
//   useListingPermissions: () => ({
//     canCreateListing: () => true,
//     canEditListing: () => true,
//     canPublishListing: () => true,
//   }),
// }));

export const Default: Story = {
  name: 'Default View',
};

export const EmptyState: Story = {
  name: 'Empty State',
  parameters: {
    mockData: {
      useRentalObjects: () => ({
        data: { data: [], meta: { total: 0, page: 1, limit: 20 } },
        isLoading: false,
      }),
    },
  },
};

export const LoadingState: Story = {
  name: 'Loading State',
  parameters: {
    mockData: {
      useRentalObjects: () => ({
        data: undefined,
        isLoading: true,
      }),
    },
  },
};

export const LargeDataset: Story = {
  name: 'Large Dataset (1000 items)',
  parameters: {
    mockData: {
      useRentalObjects: () => ({
        data: { data: generateRentalObjects(1000), meta: { total: 1000, page: 1, limit: 1000 } },
        isLoading: false,
      }),
    },
  },
};

export const GridView: Story = {
  name: 'Grid View',
  parameters: {
    mockData: {
      viewMode: 'grid',
    },
  },
};

export const TableView: Story = {
  name: 'Table View',
  parameters: {
    mockData: {
      viewMode: 'table',
    },
  },
};

export const FilteredByStatus: Story = {
  name: 'Filtered by Status (Published)',
  parameters: {
    mockData: {
      filters: { status: 'published' },
    },
  },
};

export const WithSearch: Story = {
  name: 'With Search Query',
  parameters: {
    mockData: {
      searchQuery: 'test',
    },
  },
};

export const NoPermissions: Story = {
  name: 'No Create Permission',
  parameters: {
    mockData: {
      useListingPermissions: () => ({
        canCreateListing: () => false,
      }),
    },
  },
};
