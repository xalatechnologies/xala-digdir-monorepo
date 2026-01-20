import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  StatusTag,
  BookingStatusBadge,
  PaymentStatusBadge,
  RentalObjectStatusBadge,
  RequestStatusBadge,
  SeasonalLeaseStatusBadge,
  OrganizationStatusBadge,
  UserStatusBadge,
  GenericStatusBadge,
  CategoryBadge,
  TimeModeBadge,
  FeatureBadge,
  InventoryBadge,
  CapacityBadge,
  BlackoutIndicator,
  RequiresApprovalBadge,
  InvoiceStatusBadge,
  IntegrationStatusBadge,
  GdprRequestStatusBadge,
  BlockStatusBadge,
} from '../../src/blocks/StatusBadges';

const meta: Meta = {
  title: 'Blocks/StatusBadges',
  parameters: {
    docs: {
      description: {
        component: `
Status badge components for various entity types.

## Available Badges
- **BookingStatusBadge** - Booking states (pending, confirmed, cancelled, etc.)
- **PaymentStatusBadge** - Payment states (paid, unpaid, partial, refunded)
- **RentalObjectStatusBadge** - Rental object states (active, inactive, maintenance)
- **RequestStatusBadge** - Request states (pending, approved, rejected)
- **SeasonalLeaseStatusBadge** - Seasonal lease states
- **OrganizationStatusBadge** - Organization states
- **UserStatusBadge** - User account states

## Colors
- **success** - Positive states (confirmed, paid, active)
- **warning** - Pending/attention states
- **danger** - Negative states (rejected, cancelled)
- **info** - Informational states
- **neutral** - Inactive/completed states
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const StatusTagColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
      <StatusTag color="success">Success</StatusTag>
      <StatusTag color="warning">Warning</StatusTag>
      <StatusTag color="danger">Danger</StatusTag>
      <StatusTag color="info">Info</StatusTag>
      <StatusTag color="neutral">Neutral</StatusTag>
    </div>
  ),
};

export const StatusTagSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', alignItems: 'center' }}>
      <StatusTag color="success" size="sm">Small</StatusTag>
      <StatusTag color="success" size="md">Medium</StatusTag>
      <StatusTag color="success" size="lg">Large</StatusTag>
    </div>
  ),
};

export const BookingStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
      <BookingStatusBadge status="pending" />
      <BookingStatusBadge status="pending_approval" />
      <BookingStatusBadge status="approved" />
      <BookingStatusBadge status="confirmed" />
      <BookingStatusBadge status="rejected" />
      <BookingStatusBadge status="cancelled" />
      <BookingStatusBadge status="completed" />
      <BookingStatusBadge status="expired" />
    </div>
  ),
};

export const PaymentStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
      <PaymentStatusBadge status="paid" />
      <PaymentStatusBadge status="unpaid" />
      <PaymentStatusBadge status="partial" />
      <PaymentStatusBadge status="refunded" />
    </div>
  ),
};

export const RentalObjectStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
      <RentalObjectStatusBadge status="published" />
      <RentalObjectStatusBadge status="draft" />
      <RentalObjectStatusBadge status="archived" />
      <RentalObjectStatusBadge status="maintenance" />
    </div>
  ),
};

export const RequestStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
      <RequestStatusBadge status="pending" />
      <RequestStatusBadge status="needs_info" />
      <RequestStatusBadge status="approved" />
      <RequestStatusBadge status="rejected" />
    </div>
  ),
};

export const SeasonalLeaseStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
      <SeasonalLeaseStatusBadge status="draft" />
      <SeasonalLeaseStatusBadge status="pending" />
      <SeasonalLeaseStatusBadge status="approved" />
      <SeasonalLeaseStatusBadge status="active" />
      <SeasonalLeaseStatusBadge status="upcoming" />
      <SeasonalLeaseStatusBadge status="expired" />
      <SeasonalLeaseStatusBadge status="cancelled" />
      <SeasonalLeaseStatusBadge status="terminated" />
    </div>
  ),
};

export const OrganizationStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
      <OrganizationStatusBadge status="active" />
      <OrganizationStatusBadge status="inactive" />
      <OrganizationStatusBadge status="suspended" />
    </div>
  ),
};

export const UserStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
      <UserStatusBadge status="active" />
      <UserStatusBadge status="inactive" />
      <UserStatusBadge status="suspended" />
    </div>
  ),
};

const customConfig = {
  active: { color: 'success' as const, label: 'Active' },
  pending: { color: 'warning' as const, label: 'Pending Review' },
  error: { color: 'danger' as const, label: 'Error' },
  processing: { color: 'info' as const, label: 'Processing' },
  archived: { color: 'neutral' as const, label: 'Archived' },
};

export const GenericStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
      <GenericStatusBadge status="active" config={customConfig} />
      <GenericStatusBadge status="pending" config={customConfig} />
      <GenericStatusBadge status="error" config={customConfig} />
      <GenericStatusBadge status="processing" config={customConfig} />
      <GenericStatusBadge status="archived" config={customConfig} />
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', alignItems: 'center', flexWrap: 'wrap' }}>
        <BookingStatusBadge status="confirmed" />
        <PaymentStatusBadge status="paid" />
      </div>
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', alignItems: 'center', flexWrap: 'wrap' }}>
        <BookingStatusBadge status="pending_approval" />
        <PaymentStatusBadge status="unpaid" />
      </div>
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', alignItems: 'center', flexWrap: 'wrap' }}>
        <BookingStatusBadge status="cancelled" />
        <PaymentStatusBadge status="refunded" />
      </div>
    </div>
  ),
};

export const CategoryBadges: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
      <CategoryBadge category="LOKALER_OG_BANER" />
      <CategoryBadge category="UTSTYR_OG_INVENTAR" />
      <CategoryBadge category="KJORETOY_OG_TRANSPORT" />
      <CategoryBadge category="OPPLEVELSER_OG_ARRANGEMENT" />
    </div>
  ),
};

export const TimeModeBadges: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
      <TimeModeBadge timeMode="PERIOD" />
      <TimeModeBadge timeMode="SLOT" />
      <TimeModeBadge timeMode="ALL_DAY" />
    </div>
  ),
};

export const FeatureBadges: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
      <FeatureBadge feature="INVENTORY" />
      <FeatureBadge feature="SHARED_CAPACITY" />
      <FeatureBadge feature="PACKAGES" />
    </div>
  ),
};

export const InventoryAndCapacity: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
        <InventoryBadge total={10} available={8} />
        <InventoryBadge total={10} available={2} />
        <InventoryBadge total={10} available={0} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
        <CapacityBadge total={20} booked={5} />
        <CapacityBadge total={20} booked={17} />
        <CapacityBadge total={20} booked={20} />
      </div>
    </div>
  ),
};

export const SpecialIndicators: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
      <BlackoutIndicator />
      <RequiresApprovalBadge />
    </div>
  ),
};

export const InvoiceStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
      <InvoiceStatusBadge status="draft" />
      <InvoiceStatusBadge status="sent" />
      <InvoiceStatusBadge status="paid" />
      <InvoiceStatusBadge status="overdue" />
      <InvoiceStatusBadge status="cancelled" />
      <InvoiceStatusBadge status="refunded" />
    </div>
  ),
};

export const IntegrationStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
      <IntegrationStatusBadge status="connected" />
      <IntegrationStatusBadge status="disconnected" />
      <IntegrationStatusBadge status="error" />
      <IntegrationStatusBadge status="pending" />
    </div>
  ),
};

export const GdprRequestStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
      <GdprRequestStatusBadge status="pending" />
      <GdprRequestStatusBadge status="processing" />
      <GdprRequestStatusBadge status="completed" />
      <GdprRequestStatusBadge status="rejected" />
    </div>
  ),
};

export const BlockStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
      <BlockStatusBadge status="active" />
      <BlockStatusBadge status="scheduled" />
      <BlockStatusBadge status="completed" />
      <BlockStatusBadge status="cancelled" />
    </div>
  ),
};
