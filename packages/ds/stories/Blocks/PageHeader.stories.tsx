import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from '../../src/composed';
import { Button, Breadcrumbs } from '@digdir/designsystemet-react';
import { PlusIcon, DownloadIcon } from '../../src/primitives';

/**
 * PageHeader provides a consistent header for pages with title, breadcrumbs, and actions.
 */
const meta: Meta<typeof PageHeader> = {
  title: 'Blocks/PageHeader',
  component: PageHeader,
  parameters: {
    docs: {
      description: {
        component: `
The PageHeader block provides a consistent header pattern for pages.

## When to Use
- At the top of every main content page
- When page context (title, breadcrumbs) is needed
- When page-level actions are required

## Accessibility
- Title: Uses semantic heading (h1)
- Breadcrumbs: Navigation landmark with proper links
- Actions: Keyboard accessible buttons

## data-testid
- Header: \`data-testid="page-header"\`
- Title: \`data-testid="page-title"\`
- Actions: \`data-testid="page-actions"\`
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default PageHeader with title
 */
export const Default: Story = {
  args: {
    title: 'Page Title',
  },
};

/**
 * PageHeader with subtitle
 */
export const WithSubtitle: Story = {
  args: {
    title: 'Users',
    subtitle: 'Manage user accounts and permissions',
  },
};

/**
 * PageHeader with breadcrumbs
 */
export const WithBreadcrumbs: Story = {
  args: {
    title: 'User Details',
    breadcrumb: (
      <Breadcrumbs>
        <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
        <Breadcrumbs.Link href="/users">Users</Breadcrumbs.Link>
        <span>John Doe</span>
      </Breadcrumbs>
    ),
  },
};

/**
 * PageHeader with actions
 */
export const WithActions: Story = {
  args: {
    title: 'Listings',
    subtitle: 'Manage your rental listings',
    actions: (
      <>
        <Button variant="secondary">
          <DownloadIcon />
          Export
        </Button>
        <Button variant="primary">
          <PlusIcon />
          Add Listing
        </Button>
      </>
    ),
  },
};

/**
 * Full-featured PageHeader
 */
export const FullFeatured: Story = {
  args: {
    title: 'Booking Details',
    subtitle: 'View and manage booking information',
    breadcrumb: (
      <Breadcrumbs>
        <Breadcrumbs.Link href="/">Dashboard</Breadcrumbs.Link>
        <Breadcrumbs.Link href="/bookings">Bookings</Breadcrumbs.Link>
        <span>BK-2024-001</span>
      </Breadcrumbs>
    ),
    actions: (
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
        <Button variant="tertiary">Cancel</Button>
        <Button variant="secondary">Edit</Button>
        <Button variant="primary">Confirm</Button>
      </div>
    ),
  },
};

/**
 * PageHeader with border
 */
export const WithBorder: Story = {
  args: {
    title: 'Settings',
    subtitle: 'Configure your account settings',
    bordered: true,
  },
};

/**
 * PageHeader with different heading level
 */
export const HeadingLevel: Story = {
  args: {
    title: 'Section Title',
    subtitle: 'This uses h2 instead of h1',
    level: 2,
  },
};
