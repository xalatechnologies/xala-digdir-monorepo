import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, Button } from '@xala/ds';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    docs: {
      description: {
        component: `
Badge for displaying status, labels, or categories.

## When to Use
- Status indicators
- Category labels
- Tags and labels
- Highlight information

## Accessibility
- Color not sole indicator of meaning
- Text content for screen readers
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  render: () => <Badge>Default</Badge>,
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', alignItems: 'center' }}>
      <Badge data-color="neutral">Neutral</Badge>
      <Badge data-color="accent">Accent</Badge>
      <Badge data-color="success">Success</Badge>
      <Badge data-color="warning">Warning</Badge>
      <Badge data-color="danger">Danger</Badge>
      <Badge data-color="info">Info</Badge>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', alignItems: 'center' }}>
      <Badge data-size="sm">Small</Badge>
      <Badge data-size="md">Medium</Badge>
      <Badge data-size="lg">Large</Badge>
    </div>
  ),
};

export const WithButton: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', alignItems: 'center' }}>
      <Button variant="secondary" type="button">
        Notifications
        <Badge data-color="danger" data-size="sm" style={{ marginLeft: 'var(--ds-spacing-2)' }}>
          3
        </Badge>
      </Button>
    </div>
  ),
};

export const StatusBadges: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', alignItems: 'center' }}>
      <Badge data-color="success">Active</Badge>
      <Badge data-color="warning">Pending</Badge>
      <Badge data-color="danger">Cancelled</Badge>
      <Badge data-color="neutral">Draft</Badge>
    </div>
  ),
};
