import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, userEvent, within } from 'storybook/test';
import { Button } from '../../src';
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
  args: {
    // Use fn() to create a spy function for tracking clicks
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
      description: 'Visual style of the button',
      table: {
        defaultValue: { summary: 'primary' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    children: {
      control: 'text',
      description: 'Button content (text or elements)',
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'HTML button type',
      table: {
        defaultValue: { summary: 'button' },
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default button with primary variant.
 *
 * This story includes an interaction test that verifies:
 * - Button is rendered and visible
 * - Button can be clicked
 * - Click handler is called
 */
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Find the button
    const button = canvas.getByRole('button', { name: 'Button' });

    // Verify button is visible
    await expect(button).toBeVisible();

    // Click the button
    await userEvent.click(button);

    // Verify onClick was called
    await expect(args.onClick).toHaveBeenCalledTimes(1);
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
 * Disabled state.
 *
 * This story tests that disabled buttons:
 * - Have the disabled attribute
 * - Do not fire onClick when clicked
 */
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const button = canvas.getByRole('button', { name: 'Disabled Button' });

    // Verify button has disabled attribute
    await expect(button).toBeDisabled();

    // Try to click the button (should not trigger onClick)
    await userEvent.click(button);

    // onClick should NOT have been called because button is disabled
    await expect(args.onClick).not.toHaveBeenCalled();
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
