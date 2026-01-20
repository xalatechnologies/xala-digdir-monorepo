import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, Heading, Paragraph, Button } from '@digdir/designsystemet-react';

/**
 * Card component from Digdir Designsystemet.
 * 
 * Cards group related content and actions.
 */
const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component: `
The Card component groups related content and actions.

## When to Use
- Displaying grouped information
- List items with multiple data points
- Interactive content blocks

## Accessibility
- Keyboard: Tab navigates to interactive elements
- Screen readers: Content structure announced
- Focus: Clear focus on interactive elements

## data-testid
Use \`data-testid="card"\` for E2E testing.
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default card
 */
export const Default: Story = {
  render: () => (
    <Card>
      <Heading level={3} data-size="sm">Card Title</Heading>
      <Paragraph>
        This is a basic card with some content. Cards are used to group related information.
      </Paragraph>
    </Card>
  ),
};

/**
 * Card with actions
 */
export const WithActions: Story = {
  render: () => (
    <Card>
      <Heading level={3} data-size="sm">Booking Request</Heading>
      <Paragraph>
        John Doe has requested to book Meeting Room A for December 15, 2024.
      </Paragraph>
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-4)' }}>
        <Button variant="secondary">Decline</Button>
        <Button variant="primary">Approve</Button>
      </div>
    </Card>
  ),
};

/**
 * Card as link
 */
export const AsLink: Story = {
  render: () => (
    <Card asChild style={{ cursor: 'pointer' }}>
      <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>
        <Heading level={3} data-size="sm">Click to View Details</Heading>
        <Paragraph>
          This entire card is clickable and acts as a link.
        </Paragraph>
      </a>
    </Card>
  ),
};

/**
 * Card with image
 */
export const WithImage: Story = {
  render: () => (
    <Card style={{ overflow: 'hidden' }}>
      <div style={{ 
        aspectRatio: '16/9', 
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Image Placeholder</span>
      </div>
      <div style={{ padding: 'var(--ds-spacing-4)' }}>
        <Heading level={3} data-size="sm">Featured Listing</Heading>
        <Paragraph>
          A beautiful meeting space in the city center.
        </Paragraph>
      </div>
    </Card>
  ),
};

/**
 * Multiple cards in grid
 */
export const CardGrid: Story = {
  render: () => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(var(--ds-spacing-64), 1fr)),',
      gap: 'var(--ds-spacing-4)',
    }}>
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <Heading level={3} data-size="sm">Card {i}</Heading>
          <Paragraph>
            Content for card {i}. Each card can contain different information.
          </Paragraph>
        </Card>
      ))}
    </div>
  ),
};
