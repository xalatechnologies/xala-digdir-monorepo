import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox, Fieldset, ValidationMessage } from '@xalatechnologies/platform/ui';

const meta: Meta = {
  title: 'Components/Checkbox',
  parameters: {
    docs: {
      description: {
        component: `
Checkbox component for multiple selections.

## When to Use
- Multiple options can be selected
- Toggle a single option on/off
- Accepting terms and conditions

## Accessibility
- Keyboard: Space toggles checkbox
- Label is clickable
- Screen readers announce state
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
    <Checkbox label="I accept the terms and conditions" value="accept" />
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Checkbox 
      label="Subscribe to newsletter"
      value="newsletter"
      description="You can unsubscribe at any time"
    />
  ),
};

export const CheckboxGroup: Story = {
  render: () => (
    <Fieldset>
      <Fieldset.Legend>Select amenities</Fieldset.Legend>
      <Checkbox label="WiFi" value="wifi" />
      <Checkbox label="Parking" value="parking" />
      <Checkbox label="Kitchen" value="kitchen" />
      <Checkbox label="Projector" value="projector" />
    </Fieldset>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
      <Checkbox label="Disabled unchecked" value="disabled1" disabled />
      <Checkbox label="Disabled checked" value="disabled2" disabled defaultChecked />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <Fieldset>
      <Fieldset.Legend>Accept terms</Fieldset.Legend>
      <Checkbox 
        label="I accept the terms"
        value="terms"
        aria-invalid="true"
      />
      <ValidationMessage>You must accept the terms to continue</ValidationMessage>
    </Fieldset>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <Checkbox label="Small checkbox" value="sm" data-size="sm" />
      <Checkbox label="Medium checkbox" value="md" data-size="md" />
      <Checkbox label="Large checkbox" value="lg" data-size="lg" />
    </div>
  ),
};
