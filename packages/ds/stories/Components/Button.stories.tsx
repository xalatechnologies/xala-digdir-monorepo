import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@digdir/designsystemet-react';
import { PlusIcon, SaveIcon, TrashIcon } from '../../src/primitives';

/**
 * Button component from Digdir Designsystemet.
 * 
 * Buttons are used for actions. Use the appropriate variant based on the action's importance.
 */
const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: `
The Button component is the primary way users take actions in the interface.

## When to Use
- Primary actions (submit, save, confirm)
- Secondary actions (cancel, back)
- Destructive actions (delete, remove)

## Accessibility
- Keyboard: \`Enter\` or \`Space\` activates the button
- Focus: Visible focus ring on tab
- Screen readers: Button role announced automatically

## data-testid
Use \`data-testid="action-button"\` for E2E testing.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
      description: 'Visual style of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default button with primary variant
 */
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
  },
};

/**
 * All button variants
 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', alignItems: 'center' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
    </div>
  ),
};

/**
 * Button with data-size attribute for styling
 */
export const WithDataSize: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', alignItems: 'center' }}>
      <Button data-size="sm">Small</Button>
      <Button data-size="md">Medium</Button>
      <Button data-size="lg">Large</Button>
    </div>
  ),
};

/**
 * Buttons with icons
 */
export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', alignItems: 'center' }}>
      <Button variant="primary">
        <PlusIcon />
        Add Item
      </Button>
      <Button variant="secondary">
        <SaveIcon />
        Save
      </Button>
      <Button variant="tertiary" data-color="danger">
        <TrashIcon />
        Delete
      </Button>
    </div>
  ),
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

/**
 * Loading state button
 */
export const Loading: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', alignItems: 'center' }}>
      <Button variant="primary" loading>Loading...</Button>
      <Button variant="secondary" loading>Processing</Button>
    </div>
  ),
};

/**
 * Button as link
 */
export const AsLink: Story = {
  args: {
    children: 'Go to Page',
    asChild: true,
  },
  render: (args) => (
    <Button {...args}>
      <a href="#">Go to Page</a>
    </Button>
  ),
};

/**
 * Danger variant for destructive actions
 */
export const Danger: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', alignItems: 'center' }}>
      <Button variant="primary" data-color="danger">Delete</Button>
      <Button variant="secondary" data-color="danger">Remove</Button>
      <Button variant="tertiary" data-color="danger">Cancel</Button>
    </div>
  ),
};

/**
 * Icon-only button
 */
export const IconOnly: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', alignItems: 'center' }}>
      <Button icon aria-label="Add item">
        <PlusIcon />
      </Button>
      <Button icon variant="secondary" aria-label="Save">
        <SaveIcon />
      </Button>
      <Button icon variant="tertiary" data-color="danger" aria-label="Delete">
        <TrashIcon />
      </Button>
    </div>
  ),
};

/**
 * Full width button
 */
export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    style: { width: '100%' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'var(--ds-spacing-64)' }}>
        <Story />
      </div>
    ),
  ],
};
