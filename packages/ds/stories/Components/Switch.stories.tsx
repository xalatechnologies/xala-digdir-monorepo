import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch, Fieldset } from '../../src';

const meta: Meta = {
  title: 'Components/Switch',
  parameters: {
    docs: {
      description: {
        component: `
Toggle switch for binary on/off settings.

## When to Use
- Binary settings (on/off, enabled/disabled)
- Immediate effect settings
- Preferences that take effect instantly

## Accessibility
- Keyboard: Space toggles switch
- Screen readers: State announced
- Clear visual indication of state
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
    <Switch label="Enable notifications" />
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Switch 
      label="Dark mode"
      description="Switch between light and dark theme"
    />
  ),
};

export const Checked: Story = {
  render: () => (
    <Switch label="Email notifications" defaultChecked />
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <Switch label="Disabled off" disabled />
      <Switch label="Disabled on" disabled defaultChecked />
    </div>
  ),
};

export const ReadOnly: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <Switch label="Read-only off" readOnly />
      <Switch label="Read-only on" readOnly defaultChecked />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <Switch label="Small switch" data-size="sm" />
      <Switch label="Medium switch" data-size="md" />
      <Switch label="Large switch" data-size="lg" />
    </div>
  ),
};

export const SwitchGroup: Story = {
  render: () => (
    <Fieldset>
      <Fieldset.Legend>Notification preferences</Fieldset.Legend>
      <Switch label="Email notifications" defaultChecked />
      <Switch label="SMS notifications" />
      <Switch label="Push notifications" defaultChecked />
    </Fieldset>
  ),
};
