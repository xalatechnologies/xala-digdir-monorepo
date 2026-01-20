import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '../../src';

const meta: Meta = {
  title: 'Components/Avatar',
  parameters: {
    docs: {
      description: {
        component: `
Avatar for displaying user profile images or initials.

## When to Use
- User profiles
- Comment authors
- Contact lists
- Team members

## Accessibility
- Alt text for images
- Initials have proper contrast
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <Avatar aria-label="User avatar">JD</Avatar>,
};

export const WithInitials: Story = {
  render: () => (
    <Avatar aria-label="John Doe">JD</Avatar>
  ),
};

export const Initials: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
      <Avatar aria-label="John Doe">JD</Avatar>
      <Avatar aria-label="Alice Brown">AB</Avatar>
      <Avatar aria-label="Charlie Wilson">CW</Avatar>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', alignItems: 'center' }}>
      <Avatar data-size="sm" aria-label="Small avatar">SM</Avatar>
      <Avatar data-size="md" aria-label="Medium avatar">MD</Avatar>
      <Avatar data-size="lg" aria-label="Large avatar">LG</Avatar>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
      <Avatar data-color="neutral" aria-label="Neutral avatar">N</Avatar>
      <Avatar data-color="accent" aria-label="Accent avatar">A</Avatar>
    </div>
  ),
};

export const Variant: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
      <Avatar variant="circle" aria-label="Circle avatar">C</Avatar>
      <Avatar variant="square" aria-label="Square avatar">S</Avatar>
    </div>
  ),
};

export const AvatarGroup: Story = {
  render: () => (
    <div style={{ display: 'flex' }}>
      <Avatar aria-label="User 1">A</Avatar>
      <Avatar aria-label="User 2" style={{ marginLeft: 'calc(-1 * var(--ds-spacing-2))' }}>B</Avatar>
      <Avatar aria-label="User 3" style={{ marginLeft: 'calc(-1 * var(--ds-spacing-2))' }}>C</Avatar>
      <Avatar aria-label="3 more users" style={{ marginLeft: 'calc(-1 * var(--ds-spacing-2))' }}>+3</Avatar>
    </div>
  ),
};
