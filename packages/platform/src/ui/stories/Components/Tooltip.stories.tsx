import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip, Button } from '@xalatechnologies/platform/ui';

const meta: Meta = {
  title: 'Components/Tooltip',
  parameters: {
    docs: {
      description: {
        component: `
Tooltip for displaying additional information on hover/focus.

## When to Use
- Additional context for icons or abbreviated text
- Help text for form fields
- Action explanations

## Accessibility
- Keyboard accessible via focus
- Announced to screen readers
- Dismissible with Escape key
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Tooltip content="This is a tooltip">
      <Button type="button">Hover me</Button>
    </Tooltip>
  ),
};

export const Placements: Story = {
  render: () => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(3, 1fr)', 
      gap: 'var(--ds-spacing-6)',
      padding: 'var(--ds-spacing-10)',
      placeItems: 'center',
    }}>
      <div />
      <Tooltip content="Top tooltip" placement="top">
        <Button variant="secondary" type="button">Top</Button>
      </Tooltip>
      <div />
      
      <Tooltip content="Left tooltip" placement="left">
        <Button variant="secondary" type="button">Left</Button>
      </Tooltip>
      <div />
      <Tooltip content="Right tooltip" placement="right">
        <Button variant="secondary" type="button">Right</Button>
      </Tooltip>
      
      <div />
      <Tooltip content="Bottom tooltip" placement="bottom">
        <Button variant="secondary" type="button">Bottom</Button>
      </Tooltip>
      <div />
    </div>
  ),
};

export const OnIcon: Story = {
  render: () => (
    <Tooltip content="More information about this feature">
      <Button
        variant="tertiary"
        data-size="sm"
        aria-label="Information" type="button"
      >
        ℹ️
      </Button>
    </Tooltip>
  ),
};
