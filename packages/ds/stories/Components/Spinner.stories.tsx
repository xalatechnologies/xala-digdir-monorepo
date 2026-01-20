import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from '@digdir/designsystemet-react';

const meta: Meta = {
  title: 'Components/Spinner',
  parameters: {
    docs: {
      description: {
        component: `
Loading spinner for indicating async operations.

## When to Use
- Loading data from API
- Processing user actions
- Waiting for responses

## Accessibility
- Includes aria-label for screen readers
- Announces loading state
- Should be paired with loading text when possible
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <Spinner aria-label="Loading" />,
};

export const WithLabel: Story = {
  render: () => <Spinner aria-label="Loading content..." />,
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', alignItems: 'center' }}>
      <Spinner data-size="sm" aria-label="Loading" />
      <Spinner data-size="md" aria-label="Loading" />
      <Spinner data-size="lg" aria-label="Loading" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', alignItems: 'center' }}>
      <Spinner data-color="neutral" aria-label="Loading" />
      <Spinner data-color="accent" aria-label="Loading" />
    </div>
  ),
};

export const InButton: Story = {
  render: () => (
    <button 
      disabled 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: 'var(--ds-spacing-2)',
        padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
        borderRadius: 'var(--ds-border-radius-md)',
        border: '1px solid var(--ds-color-neutral-border-default)',
        background: 'var(--ds-color-neutral-surface-default)',
        cursor: 'not-allowed',
      }}
    >
      <Spinner data-size="sm" aria-label="Loading" />
      Loading...
    </button>
  ),
};

export const LoadingState: Story = {
  render: () => (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 'var(--ds-spacing-4)',
        padding: 'var(--ds-spacing-10)',
        border: '1px dashed var(--ds-color-neutral-border-default)',
        borderRadius: 'var(--ds-border-radius-lg)',
      }}
    >
      <Spinner data-size="lg" aria-label="Loading data" />
      <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
        Loading data...
      </span>
    </div>
  ),
};
