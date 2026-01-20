import type { Meta, StoryObj } from '@storybook/react';
import { Link, Paragraph } from '@digdir/designsystemet-react';

const meta: Meta = {
  title: 'Components/Link',
  parameters: {
    docs: {
      description: {
        component: `
Link component for navigation and actions.

## When to Use
- Navigation to other pages
- External resources
- In-page anchor links

## Accessibility
- Uses semantic anchor element
- Focus visible indicator
- Announces link purpose to screen readers
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <Link href="#">Default link</Link>,
};

export const InText: Story = {
  render: () => (
    <Paragraph>
      Read more about our <Link href="#">booking policies</Link> and{' '}
      <Link href="#">terms of service</Link> before making a reservation.
    </Paragraph>
  ),
};

export const External: Story = {
  render: () => (
    <Link href="https://designsystemet.no" target="_blank" rel="noopener noreferrer">
      Designsystemet documentation ↗
    </Link>
  ),
};

export const Inverted: Story = {
  render: () => (
    <div style={{ 
      backgroundColor: 'var(--ds-color-accent-base-default)', 
      padding: 'var(--ds-spacing-4)',
      borderRadius: 'var(--ds-border-radius-md)',
    }}>
      <Link href="#" data-color="inverted">Inverted link on dark background</Link>
    </div>
  ),
};
