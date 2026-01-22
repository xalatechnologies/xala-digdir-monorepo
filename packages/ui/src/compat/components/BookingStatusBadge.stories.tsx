import type { Meta, StoryObj } from '@storybook/react-vite';
import { BookingStatusBadge } from './BookingStatusBadge';

const meta = {
  title: 'Compat/Status/BookingStatusBadge',
  component: BookingStatusBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Badge displaying booking status with appropriate colors.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['pending', 'confirmed', 'cancelled', 'completed'],
    },
  },
} satisfies Meta<typeof BookingStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = {
  args: {
    status: 'pending',
  },
};

export const Confirmed: Story = {
  args: {
    status: 'confirmed',
  },
};

export const Cancelled: Story = {
  args: {
    status: 'cancelled',
  },
};

export const Completed: Story = {
  args: {
    status: 'completed',
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <BookingStatusBadge status="pending" />
      <BookingStatusBadge status="confirmed" />
      <BookingStatusBadge status="cancelled" />
      <BookingStatusBadge status="completed" />
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: '4px' }}>
        <span>Booking #1234</span>
        <BookingStatusBadge status="confirmed" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: '4px' }}>
        <span>Booking #1235</span>
        <BookingStatusBadge status="pending" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: '4px' }}>
        <span>Booking #1236</span>
        <BookingStatusBadge status="completed" />
      </div>
    </div>
  ),
};
