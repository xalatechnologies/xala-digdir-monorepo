import type { Meta, StoryObj } from '@storybook/react';
import { Textarea, Label, Field, ValidationMessage } from '@digdir/designsystemet-react';

const meta: Meta = {
  title: 'Components/Textarea',
  parameters: {
    docs: {
      description: {
        component: `
Textarea for multi-line text input.

## When to Use
- Long-form text input
- Comments or descriptions
- Messages

## Accessibility
- Label is required
- Error messages are announced
- Resize handle for user control
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
      <Label>Description</Label>
      <Textarea placeholder="Enter a description..." />
    </Field>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Field>
      <Label>Additional notes</Label>
      <Field.Description>Include any special requirements or requests</Field.Description>
      <Textarea placeholder="Enter notes..." />
    </Field>
  ),
};

export const WithCharacterCount: Story = {
  render: () => (
    <Field>
      <Label>Bio</Label>
      <Field.Description>Tell us about yourself</Field.Description>
      <Textarea 
        placeholder="Write a short bio..."
        maxLength={200}
      />
      <Field.Counter limit={200} />
    </Field>
  ),
};

export const WithError: Story = {
  render: () => (
    <Field>
      <Label>Message</Label>
      <Textarea 
        placeholder="Enter your message..."
        aria-invalid="true"
      />
      <ValidationMessage>Message is required</ValidationMessage>
    </Field>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Field>
      <Label>Locked content</Label>
      <Textarea 
        defaultValue="This content cannot be edited"
        disabled
      />
    </Field>
  ),
};

export const ReadOnly: Story = {
  render: () => (
    <Field>
      <Label>Terms and conditions</Label>
      <Textarea 
        defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        readOnly
      />
    </Field>
  ),
};

export const Rows: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <Field>
        <Label>Small (3 rows)</Label>
        <Textarea rows={3} placeholder="3 rows..." />
      </Field>
      <Field>
        <Label>Medium (5 rows)</Label>
        <Textarea rows={5} placeholder="5 rows..." />
      </Field>
      <Field>
        <Label>Large (8 rows)</Label>
        <Textarea rows={8} placeholder="8 rows..." />
      </Field>
    </div>
  ),
};
