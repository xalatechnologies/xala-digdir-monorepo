import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToggleGroup } from '@digdir/designsystemet-react';

const meta: Meta = {
  title: 'Components/ToggleGroup',
  parameters: {
    docs: {
      description: {
        component: `
ToggleGroup for selecting between mutually exclusive options.

## When to Use
- View toggles (list/grid)
- Mode selection
- Single option from small set

## Accessibility
- Uses radio group pattern
- Keyboard navigation
- Focus management
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
    <ToggleGroup defaultValue="list" name="view">
      <ToggleGroup.Item value="list">List</ToggleGroup.Item>
      <ToggleGroup.Item value="grid">Grid</ToggleGroup.Item>
      <ToggleGroup.Item value="calendar">Calendar</ToggleGroup.Item>
    </ToggleGroup>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <ToggleGroup defaultValue="list" name="view-icons">
      <ToggleGroup.Item value="list">📋 List</ToggleGroup.Item>
      <ToggleGroup.Item value="grid">📊 Grid</ToggleGroup.Item>
      <ToggleGroup.Item value="calendar">📅 Calendar</ToggleGroup.Item>
    </ToggleGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <ToggleGroup defaultValue="a" name="size-sm" data-size="sm">
        <ToggleGroup.Item value="a">Small A</ToggleGroup.Item>
        <ToggleGroup.Item value="b">Small B</ToggleGroup.Item>
      </ToggleGroup>
      <ToggleGroup defaultValue="a" name="size-md" data-size="md">
        <ToggleGroup.Item value="a">Medium A</ToggleGroup.Item>
        <ToggleGroup.Item value="b">Medium B</ToggleGroup.Item>
      </ToggleGroup>
      <ToggleGroup defaultValue="a" name="size-lg" data-size="lg">
        <ToggleGroup.Item value="a">Large A</ToggleGroup.Item>
        <ToggleGroup.Item value="b">Large B</ToggleGroup.Item>
      </ToggleGroup>
    </div>
  ),
};

export const TimeFilter: Story = {
  render: () => (
    <ToggleGroup defaultValue="week" name="time-filter">
      <ToggleGroup.Item value="day">Today</ToggleGroup.Item>
      <ToggleGroup.Item value="week">This Week</ToggleGroup.Item>
      <ToggleGroup.Item value="month">This Month</ToggleGroup.Item>
      <ToggleGroup.Item value="all">All Time</ToggleGroup.Item>
    </ToggleGroup>
  ),
};
