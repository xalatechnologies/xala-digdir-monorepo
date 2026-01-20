import type { Meta, StoryObj } from '@storybook/react';
import { Textfield } from '@digdir/designsystemet-react';

/**
 * Input/Textfield component from Digdir Designsystemet.
 * 
 * Text inputs allow users to enter and edit text.
 */
const meta: Meta = {
  title: 'Components/Input',
  parameters: {
    docs: {
      description: {
        component: `
The Input (Textfield) component is used for text entry.

## When to Use
- Single-line text input
- Email, password, phone inputs
- Search fields

## Accessibility
- Keyboard: Standard input behavior
- Screen readers: Label announced
- Focus: Visible focus ring

## data-testid
Use \`data-testid="input-field"\` for E2E testing.
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * Default text input
 */
export const Default: Story = {
  render: () => (
    <Textfield label="Name" placeholder="Enter your name" />
  ),
};

/**
 * Input with description
 */
export const WithDescription: Story = {
  render: () => (
    <Textfield 
      label="Email" 
      description="We will never share your email"
      placeholder="name@example.com"
      type="email"
    />
  ),
};

/**
 * Input with error
 */
export const WithError: Story = {
  render: () => (
    <Textfield 
      label="Email" 
      error="Please enter a valid email address"
      defaultValue="invalid-email"
      type="email"
    />
  ),
};

/**
 * Disabled input
 */
export const Disabled: Story = {
  render: () => (
    <Textfield 
      label="Username" 
      defaultValue="john_doe"
      disabled
    />
  ),
};

/**
 * Read-only input
 */
export const ReadOnly: Story = {
  render: () => (
    <Textfield 
      label="Account ID" 
      defaultValue="ACC-12345-XYZ"
      readOnly
    />
  ),
};

/**
 * Password input
 */
export const Password: Story = {
  render: () => (
    <Textfield 
      label="Password" 
      type="password"
      placeholder="Enter your password"
    />
  ),
};

/**
 * Form example with multiple inputs
 */
export const FormExample: Story = {
  render: () => (
    <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <Textfield label="First Name" placeholder="Enter first name" />
      <Textfield label="Last Name" placeholder="Enter last name" />
      <Textfield label="Email" type="email" placeholder="name@example.com" />
      <Textfield label="Phone" type="tel" placeholder="+47 XXX XX XXX" />
    </form>
  ),
};
