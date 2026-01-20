import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider, Paragraph, Heading } from '@digdir/designsystemet-react';

const meta: Meta = {
  title: 'Components/Divider',
  parameters: {
    docs: {
      description: {
        component: `
Divider for visual separation of content sections.

## When to Use
- Separating content sections
- Between list items
- Creating visual hierarchy

## Accessibility
- Decorative element (role="separator")
- Does not affect navigation
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
      <Paragraph>Content above the divider</Paragraph>
      <Divider />
      <Paragraph>Content below the divider</Paragraph>
    </div>
  ),
};

export const WithSpacing: Story = {
  render: () => (
    <div>
      <Heading level={3} data-size="sm">Section 1</Heading>
      <Paragraph>First section content.</Paragraph>
      <Divider style={{ margin: 'var(--ds-spacing-6) 0' }} />
      <Heading level={3} data-size="sm">Section 2</Heading>
      <Paragraph>Second section content.</Paragraph>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <div>
        <Paragraph>Default divider</Paragraph>
        <Divider />
      </div>
      <div>
        <Paragraph>Subtle divider</Paragraph>
        <Divider data-color="subtle" />
      </div>
    </div>
  ),
};
