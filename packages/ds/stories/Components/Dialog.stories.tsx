import type { Meta, StoryObj } from '@storybook/react';
import { Dialog, Button, Paragraph, Heading } from '@digdir/designsystemet-react';
import { useRef } from 'react';

const meta: Meta = {
  title: 'Components/Dialog',
  parameters: {
    docs: {
      description: {
        component: `
Dialog (Modal) for important interactions requiring user attention.

## When to Use
- Confirmations
- Important forms
- Alerts requiring action
- Focused workflows

## Accessibility
- Focus trapped inside dialog
- Escape closes dialog
- Returns focus on close
- Background content inert
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: function Render() {
    const dialogRef = useRef<HTMLDialogElement>(null);
    return (
      <>
        <Button onClick={() => dialogRef.current?.showModal()}>
          Open Dialog
        </Button>
        <Dialog ref={dialogRef}>
          <Heading level={2} data-size="sm">Dialog Title</Heading>
          <Paragraph>This is the dialog content. You can put any content here.</Paragraph>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-4)' }}>
            <Button variant="secondary" onClick={() => dialogRef.current?.close()}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => dialogRef.current?.close()}>
              Confirm
            </Button>
          </div>
        </Dialog>
      </>
    );
  },
};

export const Confirmation: Story = {
  render: function Render() {
    const dialogRef = useRef<HTMLDialogElement>(null);
    return (
      <>
        <Button data-color="danger" onClick={() => dialogRef.current?.showModal()}>
          Delete Item
        </Button>
        <Dialog ref={dialogRef}>
          <Heading level={2} data-size="sm">Delete Confirmation</Heading>
          <Paragraph>Are you sure you want to delete this item? This action cannot be undone.</Paragraph>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-4)' }}>
            <Button variant="secondary" onClick={() => dialogRef.current?.close()}>
              Cancel
            </Button>
            <Button data-color="danger" onClick={() => dialogRef.current?.close()}>
              Delete
            </Button>
          </div>
        </Dialog>
      </>
    );
  },
};

export const Information: Story = {
  render: function Render() {
    const dialogRef = useRef<HTMLDialogElement>(null);
    return (
      <>
        <Button variant="secondary" onClick={() => dialogRef.current?.showModal()}>
          Show Info
        </Button>
        <Dialog ref={dialogRef}>
          <Heading level={2} data-size="sm">Information</Heading>
          <Paragraph>Your booking has been successfully created. You will receive a confirmation email shortly.</Paragraph>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--ds-spacing-4)' }}>
            <Button variant="primary" onClick={() => dialogRef.current?.close()}>
              OK
            </Button>
          </div>
        </Dialog>
      </>
    );
  },
};
