import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, Paragraph } from '@xala/ds';

const meta: Meta = {
  title: 'Components/Tabs',
  parameters: {
    docs: {
      description: {
        component: `
Tabs for organizing content into different views.

## When to Use
- Multiple related views in same context
- When users need to switch between content
- For navigation within a section

## Accessibility
- Arrow keys navigate between tabs
- Tab key moves to panel content
- Proper ARIA roles and states
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
    <Tabs defaultValue="overview">
      <Tabs.List>
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="details">Details</Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="overview">
        <Paragraph>Overview content goes here.</Paragraph>
      </Tabs.Panel>
      <Tabs.Panel value="details">
        <Paragraph>Details content goes here.</Paragraph>
      </Tabs.Panel>
      <Tabs.Panel value="settings">
        <Paragraph>Settings content goes here.</Paragraph>
      </Tabs.Panel>
    </Tabs>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="bookings">
      <Tabs.List>
        <Tabs.Tab value="bookings">📅 Bookings</Tabs.Tab>
        <Tabs.Tab value="listings">🏠 Listings</Tabs.Tab>
        <Tabs.Tab value="users">👥 Users</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="bookings">
        <Paragraph>Manage your bookings here.</Paragraph>
      </Tabs.Panel>
      <Tabs.Panel value="listings">
        <Paragraph>View and edit your listings.</Paragraph>
      </Tabs.Panel>
      <Tabs.Panel value="users">
        <Paragraph>User management section.</Paragraph>
      </Tabs.Panel>
    </Tabs>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <Tabs defaultValue="tab1" data-size="sm">
        <Tabs.List>
          <Tabs.Tab value="tab1">Small</Tabs.Tab>
          <Tabs.Tab value="tab2">Tabs</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="tab1"><Paragraph>Small tabs content</Paragraph></Tabs.Panel>
        <Tabs.Panel value="tab2"><Paragraph>Tab 2 content</Paragraph></Tabs.Panel>
      </Tabs>

      <Tabs defaultValue="tab1" data-size="md">
        <Tabs.List>
          <Tabs.Tab value="tab1">Medium</Tabs.Tab>
          <Tabs.Tab value="tab2">Tabs</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="tab1"><Paragraph>Medium tabs content</Paragraph></Tabs.Panel>
        <Tabs.Panel value="tab2"><Paragraph>Tab 2 content</Paragraph></Tabs.Panel>
      </Tabs>

      <Tabs defaultValue="tab1" data-size="lg">
        <Tabs.List>
          <Tabs.Tab value="tab1">Large</Tabs.Tab>
          <Tabs.Tab value="tab2">Tabs</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="tab1"><Paragraph>Large tabs content</Paragraph></Tabs.Panel>
        <Tabs.Panel value="tab2"><Paragraph>Tab 2 content</Paragraph></Tabs.Panel>
      </Tabs>
    </div>
  ),
};
