/**
 * Storybook Stories for RentalObjectDetailView
 */

import type { Meta, StoryObj } from '@storybook/react';
import { RentalObjectDetailView } from './RentalObjectDetailView';

const meta: Meta<typeof RentalObjectDetailView> = {
  title: 'Features/RentalObjects/DetailView',
  component: RentalObjectDetailView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RentalObjectDetailView>;

const mockRentalObject = {
  id: '1',
  slug: 'test-rental-object',
  name: 'Test Rental Object',
  status: 'published',
  type: 'SPACE',
  description: 'A test rental object for storybook',
  capacity: 50,
  location: 'Oslo',
  image: 'https://picsum.photos/800/600',
  facilities: ["WiFi", 'Parking', 'Accessible'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const Default: Story = {
  args: {
    slug: 'test-rental-object',
  },
  parameters: {
    mockData: {
      useRentalObjectBySlug: () => ({
        data: { data: mockRentalObject },
        isLoading: false,
      }),
    },
  },
};

export const Loading: Story = {
  args: {
    slug: 'test-rental-object',
  },
  parameters: {
    mockData: {
      useRentalObjectBySlug: () => ({
        data: undefined,
        isLoading: true,
      }),
    },
  },
};

export const NotFound: Story = {
  args: {
    slug: 'non-existent',
  },
  parameters: {
    mockData: {
      useRentalObjectBySlug: () => ({
        data: undefined,
        isLoading: false,
        error: { message: 'Not found' },
      }),
    },
  },
};

export const OverviewTab: Story = {
  args: {
    slug: 'test-rental-object',
  },
  parameters: {
    mockData: {
      tab: 'overview',
    },
  },
};

export const BookingsTab: Story = {
  args: {
    slug: 'test-rental-object',
  },
  parameters: {
    mockData: {
      tab: 'bookings',
    },
  },
};
