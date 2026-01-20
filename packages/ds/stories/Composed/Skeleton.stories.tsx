import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton, SkeletonText, SkeletonCard, SkeletonTable } from '../../src/composed/Skeleton';

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
        <Skeleton width="200px" height="20px" />
      </div>
      <div>
        <p style={{ marginBottom: 'var(--ds-spacing-2)' }}>Circular</p>
        <Skeleton variant="circular" width="48px" height="48px" />
      </div>
      <div>
        <p style={{ marginBottom: 'var(--ds-spacing-2)' }}>Rectangular</p>
        <Skeleton variant="rectangular" width="200px" height="100px" />
      </div>
      <div>
        <p style={{ marginBottom: 'var(--ds-spacing-2)' }}>Rounded</p>
        <Skeleton variant="rounded" width="200px" height="100px" />
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
        <Skeleton width="200px" height="20px" animation="pulse" />
      </div>
      <div>
        <p style={{ marginBottom: 'var(--ds-spacing-2)' }}>Wave</p>
        <Skeleton width="200px" height="20px" animation="wave" />
      </div>
      <div>
        <p style={{ marginBottom: 'var(--ds-spacing-2)' }}>None</p>
        <Skeleton width="200px" height="20px" animation="none" />
      </div>
    </div>
  ),
};

/**
 * Text skeleton with multiple lines
 */
export const TextLines: Story = {
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <SkeletonText lines={4} />
    </div>
  ),
};

/**
 * Card skeleton
 */
export const CardSkeleton: Story = {
  render: () => (
    <div style={{ maxWidth: '300px' }}>
      <SkeletonCard hasImage imageHeight="150px" lines={3} />
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
      <Skeleton variant="circular" width="64px" height="64px" />
      <div style={{ flex: 1 }}>
        <Skeleton width="150px" height="20px" style={{ marginBottom: 'var(--ds-spacing-2)' }} />
        <Skeleton width="100px" height="16px" />
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
          <Skeleton variant="rounded" width="80px" height="60px" />
          <div style={{ flex: 1 }}>
            <Skeleton width="60%" height="18px" style={{ marginBottom: 'var(--ds-spacing-2)' }} />
            <Skeleton width="40%" height="14px" />
          </div>
          <Skeleton width="80px" height="32px" variant="rounded" />
        </div>
      ))}
    </div>
  ),
};
