import type { Meta, StoryObj } from '@storybook/react';
import { Button, Heading, Paragraph } from '@digdir/designsystemet-react';
import { SearchIcon, PlusIcon } from '../../src/primitives';

/**
 * EmptyState patterns for displaying when no data is available.
 * 
 * This demonstrates common empty state patterns using DS primitives.
 */

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--ds-spacing-10)',
        textAlign: 'center',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderRadius: 'var(--ds-border-radius-lg)',
        border: '1px dashed var(--ds-color-neutral-border-default)',
      }}
    >
      {icon && (
        <div
          style={{
            marginBottom: 'var(--ds-spacing-4)',
            color: 'var(--ds-color-neutral-text-subtle)',
            fontSize: '3rem',
          }}
        >
          {icon}
        </div>
      )}
      <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
        {title}
      </Heading>
      {description && (
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {description}
        </Paragraph>
      )}
      {action && (
        <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
          {action}
        </div>
      )}
    </div>
  );
}

const meta: Meta<typeof EmptyState> = {
  title: 'Blocks/EmptyState',
  component: EmptyState,
  parameters: {
    docs: {
      description: {
        component: `
Empty state patterns for displaying when no data is available.

## When to Use
- No search results
- Empty lists or tables
- First-time user experiences
- Error recovery states

## Accessibility
- Use appropriate heading levels
- Provide clear action guidance
- Include descriptive text for screen readers
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * No results found
 */
export const NoResults: Story = {
  args: {
    icon: <SearchIcon />,
    title: 'No results found',
    description: 'Try adjusting your search or filter criteria to find what you are looking for.',
    action: <Button variant="secondary">Clear Filters</Button>,
  },
};

/**
 * Empty list
 */
export const EmptyList: Story = {
  args: {
    title: 'No items yet',
    description: 'Get started by creating your first item.',
    action: (
      <Button variant="primary">
        <PlusIcon />
        Create Item
      </Button>
    ),
  },
};

/**
 * No bookings
 */
export const NoBookings: Story = {
  args: {
    title: 'No bookings',
    description: 'You have no upcoming bookings. Browse available listings to make a reservation.',
    action: <Button variant="primary">Browse Listings</Button>,
  },
};

/**
 * Error state
 */
export const Error: Story = {
  args: {
    title: 'Something went wrong',
    description: 'We encountered an error loading the data. Please try again.',
    action: <Button variant="secondary">Retry</Button>,
  },
};

/**
 * First time user
 */
export const FirstTimeUser: Story = {
  args: {
    title: 'Welcome to Digilist',
    description: 'This is where your bookings will appear. Start by exploring available listings.',
    action: (
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
        <Button variant="secondary">Take a Tour</Button>
        <Button variant="primary">Get Started</Button>
      </div>
    ),
  },
};
