import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@digdir/designsystemet-react';

const meta: Meta = {
  title: 'Components/Badge',
  parameters: {
    docs: {
      description: {
        component: `
Badge for displaying counts or status indicators.

## When to Use
- Notification counts
- Status indicators
- Unread message counts
- Item counts

## Accessibility
- Count announced to screen readers
- Color not sole indicator of meaning
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <Badge count={5} />,
};

export const Counts: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', alignItems: 'center' }}>
      <Badge count={1} />
      <Badge count={9} />
      <Badge count={99} />
      <Badge count={999} maxCount={99} />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', alignItems: 'center' }}>
      <Badge count={5} data-color="neutral" />
      <Badge count={5} data-color="accent" />
      <Badge count={5} data-color="danger" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', alignItems: 'center' }}>
      <Badge count={5} data-size="sm" />
      <Badge count={5} data-size="md" />
      <Badge count={5} data-size="lg" />
    </div>
  ),
};

export const WithButton: Story = {
  render: () => (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button style={{ 
        padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
        borderRadius: 'var(--ds-border-radius-md)',
        border: '1px solid var(--ds-color-neutral-border-default)',
        background: 'var(--ds-color-neutral-surface-default)',
        cursor: 'pointer',
      }}>
        Notifications
      </button>
      <div style={{ position: 'absolute', top: 'calc(-1 * var(--ds-spacing-2))', right: 'calc(-1 * var(--ds-spacing-2))' }}>
        <Badge count={3} data-color="danger" />
      </div>
    </div>
  ),
};

export const Standalone: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', alignItems: 'center' }}>
      <Badge count={1} />
      <Badge count={5} />
      <Badge count={10} />
    </div>
  ),
};
