import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkipLink, Paragraph } from '@digdir/designsystemet-react';

const meta: Meta = {
  title: 'Components/SkipLink',
  parameters: {
    docs: {
      description: {
        component: `
SkipLink for keyboard navigation to skip repetitive content.

## When to Use
- Skip navigation to main content
- Skip to search
- Skip repetitive sections

## Accessibility
- Only visible on focus
- First focusable element
- Links to main content landmark
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
    <div>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <nav style={{ padding: 'var(--ds-spacing-4)', background: 'var(--ds-color-neutral-surface-hover)' }}>
        <Paragraph>Navigation (Tab here first, then you'll see the skip link)</Paragraph>
      </nav>
      <main id="main-content" style={{ padding: 'var(--ds-spacing-4)' }}>
        <Paragraph>Main content area</Paragraph>
      </main>
    </div>
  ),
};

export const MultipleLinks: Story = {
  render: () => (
    <div>
      <SkipLink href="#main">Skip to main content</SkipLink>
      <SkipLink href="#search">Skip to search</SkipLink>
      <nav style={{ padding: 'var(--ds-spacing-4)', background: 'var(--ds-color-neutral-surface-hover)' }}>
        <Paragraph>Navigation area</Paragraph>
      </nav>
      <div id="search" style={{ padding: 'var(--ds-spacing-4)' }}>
        <Paragraph>Search area</Paragraph>
      </div>
      <main id="main" style={{ padding: 'var(--ds-spacing-4)' }}>
        <Paragraph>Main content</Paragraph>
      </main>
    </div>
  ),
};
