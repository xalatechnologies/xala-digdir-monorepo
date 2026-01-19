import type { Meta, StoryObj } from '@storybook/react';
import { Tag } from '@digdir/designsystemet-react';

const meta: Meta = {
  title: 'Components/Tag',
  parameters: {
    docs: {
      description: {
        component: `
Tag for categorization and labeling content.

## When to Use
- Categorizing items
- Showing status or type
- Filtering indicators
- Metadata display

## Accessibility
- Semantic meaning via color
- Sufficient color contrast
- Not interactive by default
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <Tag>Default tag</Tag>,
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
      <Tag data-color="neutral">Neutral</Tag>
      <Tag data-color="success">Success</Tag>
      <Tag data-color="warning">Warning</Tag>
      <Tag data-color="danger">Danger</Tag>
      <Tag data-color="info">Info</Tag>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', alignItems: 'center' }}>
      <Tag data-size="sm">Small</Tag>
      <Tag data-size="md">Medium</Tag>
      <Tag data-size="lg">Large</Tag>
    </div>
  ),
};

export const StatusTags: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
      <Tag data-color="success">Active</Tag>
      <Tag data-color="warning">Pending</Tag>
      <Tag data-color="danger">Cancelled</Tag>
      <Tag data-color="neutral">Draft</Tag>
      <Tag data-color="info">Processing</Tag>
    </div>
  ),
};

export const CategoryTags: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
      <Tag>Meeting Room</Tag>
      <Tag>Sports Hall</Tag>
      <Tag>Outdoor</Tag>
      <Tag>Equipment</Tag>
    </div>
  ),
};
