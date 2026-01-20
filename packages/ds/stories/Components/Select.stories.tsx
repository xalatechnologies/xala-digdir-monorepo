import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select, Label, Field, ValidationMessage } from '@digdir/designsystemet-react';

const meta: Meta = {
  title: 'Components/Select',
  parameters: {
    docs: {
      description: {
        component: `
Select dropdown for choosing from a list of options.

## When to Use
- Many options (5+) to choose from
- Single selection required
- Options are predefined

## Accessibility
- Keyboard: Arrow keys navigate, Enter selects
- Screen readers: Options announced
- Focus management built-in
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
      <Label>Select a country</Label>
      <Select>
        <Select.Option value="">Choose...</Select.Option>
        <Select.Option value="no">Norway</Select.Option>
        <Select.Option value="se">Sweden</Select.Option>
        <Select.Option value="dk">Denmark</Select.Option>
      </Select>
    </Field>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Field>
      <Label>Preferred language</Label>
      <Field.Description>This will be used for all communications</Field.Description>
      <Select>
        <Select.Option value="">Choose...</Select.Option>
        <Select.Option value="nb">Norwegian (Bokmal)</Select.Option>
        <Select.Option value="nn">Norwegian (Nynorsk)</Select.Option>
        <Select.Option value="en">English</Select.Option>
      </Select>
    </Field>
  ),
};

export const WithError: Story = {
  render: () => (
    <Field>
      <Label>Category</Label>
      <Select aria-invalid="true">
        <Select.Option value="">Choose...</Select.Option>
        <Select.Option value="lokaler">Lokaler og baner</Select.Option>
        <Select.Option value="utstyr">Utstyr og inventar</Select.Option>
      </Select>
      <ValidationMessage>Please select a category</ValidationMessage>
    </Field>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Field>
      <Label>Status</Label>
      <Select disabled>
        <Select.Option value="active">Active</Select.Option>
      </Select>
    </Field>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <Field>
        <Label>Small</Label>
        <Select data-size="sm">
          <Select.Option value="1">Option 1</Select.Option>
          <Select.Option value="2">Option 2</Select.Option>
        </Select>
      </Field>
      <Field>
        <Label>Medium</Label>
        <Select data-size="md">
          <Select.Option value="1">Option 1</Select.Option>
          <Select.Option value="2">Option 2</Select.Option>
        </Select>
      </Field>
      <Field>
        <Label>Large</Label>
        <Select data-size="lg">
          <Select.Option value="1">Option 1</Select.Option>
          <Select.Option value="2">Option 2</Select.Option>
        </Select>
      </Field>
    </div>
  ),
};

export const OptionGroups: Story = {
  render: () => (
    <Field>
      <Label>Select a venue</Label>
      <Select>
        <Select.Option value="">Choose...</Select.Option>
        <Select.Optgroup label="Oslo">
          <Select.Option value="oslo-1">Oslo Meeting Center</Select.Option>
          <Select.Option value="oslo-2">Oslo Convention Hall</Select.Option>
        </Select.Optgroup>
        <Select.Optgroup label="Bergen">
          <Select.Option value="bergen-1">Bergen Conference Room</Select.Option>
          <Select.Option value="bergen-2">Bergen Event Space</Select.Option>
        </Select.Optgroup>
      </Select>
    </Field>
  ),
};
