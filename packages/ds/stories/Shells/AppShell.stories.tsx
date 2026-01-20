import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppShell } from '@xala/ds';
import { Heading, Paragraph, Card, Button } from '@xala/ds';

/**
 * AppShell is the main application container that provides:
 * - Header section (fixed at top)
 * - Main content area (flexible)
 * - Footer section (fixed at bottom)
 *
 * ## Usage
 * Use AppShell as the root layout for your application. It handles
 * the basic structure and ensures proper spacing and responsiveness.
 *
 * ## Accessibility
 * - Uses semantic HTML elements (header, main, footer)
 * - Maintains proper document structure
 */
const meta: Meta<typeof AppShell> = {
  title: 'Shells/AppShell',
  component: AppShell,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
AppShell provides the foundational layout structure for applications.

## Features
- Semantic HTML structure (header, main, footer)
- Configurable max-width or fluid layout
- Flexible content area that grows to fill space
- Footer that stays at bottom

## When to Use
- As the root layout wrapper for any application
- When you need a consistent header/footer structure
- For public-facing pages with standard layout

## data-testid
- Container: \`data-testid="app-shell"\`
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AppShell>;

// Sample header component
const SampleHeader = () => (
  <div style={{
    height: '64px',
    backgroundColor: 'var(--ds-color-accent-surface-default)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 var(--ds-spacing-6)',
    borderBottom: '1px solid var(--ds-color-accent-border-subtle)',
  }}>
    <Heading level={1} data-size="sm" style={{ margin: 0, color: 'var(--ds-color-accent-text-default)' }}>
      My Application
    </Heading>
  </div>
);

// Sample footer component
const SampleFooter = () => (
  <div style={{
    padding: 'var(--ds-spacing-4) var(--ds-spacing-6)',
    backgroundColor: 'var(--ds-color-neutral-surface-hover)',
    borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
    textAlign: 'center',
  }}>
    <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
      © 2026 My Application. All rights reserved.
    </Paragraph>
  </div>
);

// Sample content
const SampleContent = () => (
  <div style={{ padding: 'var(--ds-spacing-6)' }}>
    <Heading level={2} data-size="lg">Welcome to the Dashboard</Heading>
    <Paragraph>This is the main content area of your application.</Paragraph>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--ds-spacing-4)', marginTop: 'var(--ds-spacing-4)' }}>
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <Heading level={3} data-size="sm">Card 1</Heading>
        <Paragraph data-size="sm">Some content here</Paragraph>
      </Card>
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <Heading level={3} data-size="sm">Card 2</Heading>
        <Paragraph data-size="sm">Some content here</Paragraph>
      </Card>
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <Heading level={3} data-size="sm">Card 3</Heading>
        <Paragraph data-size="sm">Some content here</Paragraph>
      </Card>
    </div>
  </div>
);

/**
 * Default AppShell with header, content, and footer
 */
export const Default: Story = {
  args: {
    header: <SampleHeader />,
    footer: <SampleFooter />,
    children: <SampleContent />,
  },
};

/**
 * AppShell without footer (common for dashboards)
 */
export const WithoutFooter: Story = {
  args: {
    header: <SampleHeader />,
    children: <SampleContent />,
  },
};

/**
 * AppShell without header (for embedded views)
 */
export const WithoutHeader: Story = {
  args: {
    footer: <SampleFooter />,
    children: <SampleContent />,
  },
};

/**
 * Fluid layout (no max-width constraint)
 */
export const Fluid: Story = {
  args: {
    fluid: true,
    header: <SampleHeader />,
    footer: <SampleFooter />,
    children: <SampleContent />,
  },
};

/**
 * Custom max-width
 */
export const CustomMaxWidth: Story = {
  args: {
    maxWidth: '800px',
    header: <SampleHeader />,
    footer: <SampleFooter />,
    children: <SampleContent />,
  },
};

/**
 * Custom background color
 */
export const CustomBackground: Story = {
  args: {
    background: 'var(--ds-color-neutral-surface-hover)',
    header: <SampleHeader />,
    footer: <SampleFooter />,
    children: <SampleContent />,
  },
};

/**
 * Minimal content (footer stays at bottom)
 */
export const MinimalContent: Story = {
  args: {
    header: <SampleHeader />,
    footer: <SampleFooter />,
    children: (
      <div style={{ padding: 'var(--ds-spacing-6)' }}>
        <Paragraph>This is minimal content. The footer stays at the bottom.</Paragraph>
      </div>
    ),
  },
};

/**
 * Login page layout (centered content)
 */
export const LoginLayout: Story = {
  args: {
    header: (
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
      }}>
        <Heading level={1} data-size="md" style={{ margin: 0 }}>My App</Heading>
      </div>
    ),
    children: (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        padding: 'var(--ds-spacing-6)',
      }}>
        <Card style={{ padding: 'var(--ds-spacing-6)', maxWidth: '400px', width: '100%' }}>
          <Heading level={2} data-size="lg" style={{ marginBottom: 'var(--ds-spacing-4)' }}>Login</Heading>
          <Paragraph style={{ marginBottom: 'var(--ds-spacing-4)' }}>Enter your credentials to continue</Paragraph>
          <Button style={{ width: '100%' }}>Sign In</Button>
        </Card>
      </div>
    ),
    footer: <SampleFooter />,
  },
};
