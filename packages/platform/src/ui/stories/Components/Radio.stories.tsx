import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio, Fieldset, ValidationMessage } from '@xalatechnologies/platform/ui';

const meta: Meta = {
  title: 'Components/Radio',
  parameters: {
    docs: {
      description: {
        component: `
Radio buttons for single selection from multiple options.

## When to Use
- User must select exactly one option
- Options are mutually exclusive
- Small number of options (2-5)

## Accessibility
- Arrow keys navigate between options
- Space/Enter selects option
- Fieldset groups related radios
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
    <Fieldset>
      <Fieldset.Legend>Select time slot</Fieldset.Legend>
      <Radio label="Morning (08:00 - 12:00)" name="time" value="morning" />
      <Radio label="Afternoon (12:00 - 16:00)" name="time" value="afternoon" />
      <Radio label="Evening (16:00 - 20:00)" name="time" value="evening" />
    </Fieldset>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Fieldset>
      <Fieldset.Legend>Select plan</Fieldset.Legend>
      <Radio 
        label="Basic"
        name="plan" 
        value="basic"
        description="Up to 5 bookings per month"
      />
      <Radio 
        label="Pro"
        name="plan" 
        value="pro"
        description="Unlimited bookings, priority support"
      />
      <Radio 
        label="Enterprise"
        name="plan" 
        value="enterprise"
        description="Custom features, dedicated support"
      />
    </Fieldset>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <Fieldset>
      <Fieldset.Legend>Payment method</Fieldset.Legend>
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)' }}>
        <Radio label="Card" name="payment" value="card" />
        <Radio label="Invoice" name="payment" value="invoice" />
        <Radio label="Vipps" name="payment" value="vipps" />
      </div>
    </Fieldset>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Fieldset>
      <Fieldset.Legend>Status</Fieldset.Legend>
      <Radio label="Active" name="status" value="active" defaultChecked />
      <Radio label="Inactive (unavailable)" name="status" value="inactive" disabled />
    </Fieldset>
  ),
};

export const WithError: Story = {
  render: () => (
    <Fieldset>
      <Fieldset.Legend>Select a category</Fieldset.Legend>
      <Radio label="Lokaler" name="category" value="lokaler" aria-invalid="true" />
      <Radio label="Utstyr" name="category" value="utstyr" aria-invalid="true" />
      <ValidationMessage>You must select a category</ValidationMessage>
    </Fieldset>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <Radio label="Small radio" name="size-demo" value="sm" data-size="sm" />
      <Radio label="Medium radio" name="size-demo" value="md" data-size="md" />
      <Radio label="Large radio" name="size-demo" value="lg" data-size="lg" />
    </div>
  ),
};
