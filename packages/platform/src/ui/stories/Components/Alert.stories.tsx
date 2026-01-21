import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from '@xalatechnologies/platform/ui';

/**
 * Alert component from Digdir Designsystemet.
 * 
 * Alerts display important messages to users.
 */
const meta: Meta = {
  title: 'Components/Alert',
  parameters: {
    docs: {
      description: {
        component: `
The Alert component displays important feedback messages.

## When to Use
- Success confirmations
- Error messages
- Warnings
- Informational notices

## Accessibility
- Screen readers: Alert role announced
- Color: Not sole indicator of meaning
- Focus: Dismissible alerts are focusable
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * Info alert
 */
export const Info: Story = {
  render: () => (
    <Alert data-color="info">
      Your booking request has been received and is being processed.
    </Alert>
  ),
};

/**
 * Success alert
 */
export const Success: Story = {
  render: () => (
    <Alert data-color="success">
      Your booking has been confirmed successfully.
    </Alert>
  ),
};

/**
 * Warning alert
 */
export const Warning: Story = {
  render: () => (
    <Alert data-color="warning">
      Your session will expire in 5 minutes. Please save your work.
    </Alert>
  ),
};

/**
 * Danger alert
 */
export const Danger: Story = {
  render: () => (
    <Alert data-color="danger">
      There was an error processing your request. Please try again.
    </Alert>
  ),
};

/**
 * With longer content
 */
export const WithLongerContent: Story = {
  render: () => (
    <Alert data-color="success">
      <strong>Booking Confirmed</strong>
      <br />
      Your booking for Meeting Room A on December 15, 2024 has been confirmed.
      A confirmation email has been sent to your address.
    </Alert>
  ),
};

/**
 * All variants
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <Alert data-color="info">Info: This is an informational message.</Alert>
      <Alert data-color="success">Success: Operation completed successfully.</Alert>
      <Alert data-color="warning">Warning: Please review before continuing.</Alert>
      <Alert data-color="danger">Error: Something went wrong.</Alert>
    </div>
  ),
};
