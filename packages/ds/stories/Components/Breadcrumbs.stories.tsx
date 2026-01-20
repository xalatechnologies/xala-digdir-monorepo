import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumbs } from '@digdir/designsystemet-react';

const meta: Meta = {
  title: 'Components/Breadcrumbs',
  parameters: {
    docs: {
      description: {
        component: `
Breadcrumbs for showing navigation hierarchy.

## When to Use
- Deep page hierarchies
- Help users understand location
- Enable quick navigation to parent pages

## Accessibility
- Uses nav landmark
- Current page indicated
- Links are keyboard accessible
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
    <Breadcrumbs>
      <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
      <Breadcrumbs.Link href="/listings">Listings</Breadcrumbs.Link>
      <span>Current Page</span>
    </Breadcrumbs>
  ),
};

export const ThreeLevels: Story = {
  render: () => (
    <Breadcrumbs>
      <Breadcrumbs.Link href="/">Dashboard</Breadcrumbs.Link>
      <Breadcrumbs.Link href="/bookings">Bookings</Breadcrumbs.Link>
      <Breadcrumbs.Link href="/bookings/2024">2024</Breadcrumbs.Link>
      <span>January</span>
    </Breadcrumbs>
  ),
};

export const TwoLevels: Story = {
  render: () => (
    <Breadcrumbs>
      <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
      <span>Settings</span>
    </Breadcrumbs>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <Breadcrumbs data-size="sm">
        <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
        <span>Small</span>
      </Breadcrumbs>
      <Breadcrumbs data-size="md">
        <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
        <span>Medium</span>
      </Breadcrumbs>
      <Breadcrumbs data-size="lg">
        <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
        <span>Large</span>
      </Breadcrumbs>
    </div>
  ),
};
