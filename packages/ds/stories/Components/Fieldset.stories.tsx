import type { Meta, StoryObj } from '@storybook/react-vite';
import { Fieldset, Checkbox, Radio, ValidationMessage } from '@digdir/designsystemet-react';

const meta: Meta = {
  title: 'Components/Fieldset',
  parameters: {
    docs: {
      description: {
        component: `
Fieldset component for grouping related form controls.

## When to Use
- Grouping checkboxes
- Grouping radio buttons
- Related form sections

## Accessibility
- Uses native fieldset/legend
- Groups related controls
- Screen reader friendly
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
      <Fieldset.Legend>Select your interests</Fieldset.Legend>
      <Checkbox label="Sports" value="sports" />
      <Checkbox label="Music" value="music" />
      <Checkbox label="Technology" value="tech" />
    </Fieldset>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Fieldset>
      <Fieldset.Legend>Contact preferences</Fieldset.Legend>
      <Fieldset.Description>Choose how you want to be contacted.</Fieldset.Description>
      <Checkbox label="Email" value="email" />
      <Checkbox label="SMS" value="sms" />
      <Checkbox label="Phone" value="phone" />
    </Fieldset>
  ),
};

export const RadioGroup: Story = {
  render: () => (
    <Fieldset>
      <Fieldset.Legend>Select time slot</Fieldset.Legend>
      <Radio label="Morning (08:00 - 12:00)" name="time" value="morning" />
      <Radio label="Afternoon (12:00 - 16:00)" name="time" value="afternoon" />
      <Radio label="Evening (16:00 - 20:00)" name="time" value="evening" />
    </Fieldset>
  ),
};

export const WithError: Story = {
  render: () => (
    <Fieldset>
      <Fieldset.Legend>Accept terms</Fieldset.Legend>
      <Checkbox label="I accept the terms and conditions" value="terms" aria-invalid="true" />
      <ValidationMessage>You must accept the terms to continue</ValidationMessage>
    </Fieldset>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <Fieldset data-size="sm">
        <Fieldset.Legend>Small fieldset</Fieldset.Legend>
        <Checkbox label="Option 1" value="1" />
        <Checkbox label="Option 2" value="2" />
      </Fieldset>
      <Fieldset data-size="md">
        <Fieldset.Legend>Medium fieldset</Fieldset.Legend>
        <Checkbox label="Option 1" value="1" />
        <Checkbox label="Option 2" value="2" />
      </Fieldset>
      <Fieldset data-size="lg">
        <Fieldset.Legend>Large fieldset</Fieldset.Legend>
        <Checkbox label="Option 1" value="1" />
        <Checkbox label="Option 2" value="2" />
      </Fieldset>
    </div>
  ),
};
