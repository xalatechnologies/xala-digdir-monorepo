import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton, SkeletonText, SkeletonCard, SkeletonTable } from '@xalatechnologies/platform/ui/composed/Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Composed/Skeleton',
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component: `
Skeleton loading placeholders for content that is being loaded.

## Features
- Multiple variants (text, circular, rectangular, rounded)
- Pulse and wave animations
- Pre-built patterns (card, table, text)

## When to Use
- While fetching data from API
- Initial page load placeholders
- Lazy-loaded content areas
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

/**
 * Basic skeleton shapes
 */
export const Basic: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <div>
        <p style={{ marginBottom: 'var(--ds-spacing-2)' }}>Text (default)</p>
        <Skeleton width="var(--ds-size-50)" height="var(--ds-size-5)" />
      </div>
      <div>
        <p style={{ marginBottom: 'var(--ds-spacing-2)' }}>Circular</p>
        <Skeleton variant="circular" width="var(--ds-size-12)" height="var(--ds-size-12)" />
      </div>
      <div>
        <p style={{ marginBottom: 'var(--ds-spacing-2)' }}>Rectangular</p>
        <Skeleton variant="rectangular" width="var(--ds-size-50)" height="var(--ds-size-25)" />
      </div>
      <div>
        <p style={{ marginBottom: 'var(--ds-spacing-2)' }}>Rounded</p>
        <Skeleton variant="rounded" width="var(--ds-size-50)" height="var(--ds-size-25)" />
      </div>
    </div>
  ),
};

/**
 * Animation types
 */
export const Animations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <div>
        <p style={{ marginBottom: 'var(--ds-spacing-2)' }}>Pulse (default)</p>
        <Skeleton width="var(--ds-size-50)" height="var(--ds-size-5)" animation="pulse" />
      </div>
      <div>
        <p style={{ marginBottom: 'var(--ds-spacing-2)' }}>Wave</p>
        <Skeleton width="var(--ds-size-50)" height="var(--ds-size-5)" animation="wave" />
      </div>
      <div>
        <p style={{ marginBottom: 'var(--ds-spacing-2)' }}>None</p>
        <Skeleton width="var(--ds-size-50)" height="var(--ds-size-5)" animation="none" />
      </div>
    </div>
  ),
};

/**
 * Text skeleton with multiple lines
 */
export const TextLines: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--ds-size-100)' }}>
      <SkeletonText lines={4} />
    </div>
  ),
};

/**
 * Card skeleton
 */
export const CardSkeleton: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--ds-size-75)' }}>
      <SkeletonCard hasImage imageHeight="var(--ds-size-38)" lines={3} />
    </div>
  ),
};

/**
 * Table skeleton
 */
export const TableSkeleton: Story = {
  render: () => (
    <SkeletonTable rows={5} columns={4} hasHeader />
  ),
};

/**
 * Profile card loading
 */
export const ProfileLoading: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', alignItems: 'center', padding: 'var(--ds-spacing-4)' }}>
      <Skeleton variant="circular" width="var(--ds-size-16)" height="var(--ds-size-16)" />
      <div style={{ flex: 1 }}>
        <Skeleton width="var(--ds-size-38)" height="var(--ds-size-5)" style={{ marginBottom: 'var(--ds-spacing-2)' }} />
        <Skeleton width="var(--ds-size-25)" height="var(--ds-size-4)" />
      </div>
    </div>
  ),
};

/**
 * List item loading
 */
export const ListItemLoading: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: 'flex', gap: 'var(--ds-spacing-4)', alignItems: 'center' }}>
          <Skeleton variant="rounded" width="var(--ds-size-20)" height="var(--ds-size-15)" />
          <div style={{ flex: 1 }}>
            <Skeleton width="60%" height="var(--ds-size-5)" style={{ marginBottom: 'var(--ds-spacing-2)' }} />
            <Skeleton width="40%" height="var(--ds-size-4)" />
          </div>
          <Skeleton width="var(--ds-size-20)" height="var(--ds-size-8)" variant="rounded" />
        </div>
      ))}
    </div>
  ),
};
