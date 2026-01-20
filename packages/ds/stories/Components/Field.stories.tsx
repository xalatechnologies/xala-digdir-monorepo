import type { Meta, StoryObj } from '@storybook/react';
import { Field, Label, Input, Textarea, Select, Checkbox, ValidationMessage } from '@digdir/designsystemet-react';

const meta: Meta = {
  title: 'Components/Field',
  parameters: {
    docs: {
      description: {
        component: `
Field component for wrapping form inputs with labels and descriptions.

## When to Use
- Form inputs requiring labels
- Inputs with descriptions
- Inputs with validation messages

## Accessibility
- Associates label with input
- Connects error messages to inputs
- Proper ARIA attributes
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
    <Field>
      <Label>Full name</Label>
      <Input />
    </Field>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Field>
      <Label>Email address</Label>
      <Field.Description>We will never share your email with anyone.</Field.Description>
      <Input type="email" />
    </Field>
  ),
};

export const WithError: Story = {
  render: () => (
    <Field>
      <Label>Phone number</Label>
      <Input aria-invalid="true" />
      <ValidationMessage>Phone number must be 8 digits</ValidationMessage>
    </Field>
  ),
};

export const WithTextarea: Story = {
  render: () => (
    <Field>
      <Label>Description</Label>
      <Field.Description>Max 500 characters</Field.Description>
      <Textarea rows={4} />
      <Field.Counter limit={500} />
    </Field>
  ),
};

export const WithSelect: Story = {
  render: () => (
    <Field>
      <Label>Country</Label>
      <Select>
        <Select.Option value="">Choose a country...</Select.Option>
        <Select.Option value="no">Norway</Select.Option>
        <Select.Option value="se">Sweden</Select.Option>
        <Select.Option value="dk">Denmark</Select.Option>
      </Select>
    </Field>
  ),
};

export const Required: Story = {
  render: () => (
    <Field>
      <Label>
        Name <span aria-hidden="true">*</span>
      </Label>
      <Input required />
    </Field>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <Field data-size="sm">
        <Label>Small field</Label>
        <Input />
      </Field>
      <Field data-size="md">
        <Label>Medium field</Label>
        <Input />
      </Field>
      <Field data-size="lg">
        <Label>Large field</Label>
        <Input />
      </Field>
    </div>
  ),
};
