import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search } from '@xala/ds';

const meta: Meta = {
  title: 'Components/Search',
  parameters: {
    docs: {
      description: {
        component: `
Search input component for searching content.

## When to Use
- Site search
- Table filtering
- List filtering
- Content search

## Accessibility
- Search landmark
- Clear button
- Submit button
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
    <Search>
      <Search.Input aria-label="Search" placeholder="Search..." />
      <Search.Clear />
      <Search.Button />
    </Search>
  ),
};

export const WithPlaceholder: Story = {
  render: () => (
    <Search>
      <Search.Input aria-label="Search listings" placeholder="Search for listings..." />
      <Search.Clear />
      <Search.Button />
    </Search>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <Search data-size="sm">
        <Search.Input aria-label="Small search" placeholder="Small..." />
        <Search.Clear />
        <Search.Button />
      </Search>
      <Search data-size="md">
        <Search.Input aria-label="Medium search" placeholder="Medium..." />
        <Search.Clear />
        <Search.Button />
      </Search>
      <Search data-size="lg">
        <Search.Input aria-label="Large search" placeholder="Large..." />
        <Search.Clear />
        <Search.Button />
      </Search>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <Search data-color="neutral">
        <Search.Input aria-label="Neutral search" placeholder="Neutral color..." />
        <Search.Clear />
        <Search.Button />
      </Search>
      <Search data-color="accent">
        <Search.Input aria-label="Accent search" placeholder="Accent color..." />
        <Search.Clear />
        <Search.Button />
      </Search>
    </div>
  ),
};
