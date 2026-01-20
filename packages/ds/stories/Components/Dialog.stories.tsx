import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { Dialog, Button, Paragraph, Heading } from '../../src';
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

/**
 * Default dialog with open/close interaction test.
 *
 * This story tests:
 * - Dialog opens when trigger button is clicked
 * - Dialog contains expected content
 * - Dialog closes when Cancel or Confirm is clicked
 */
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click button to open dialog
    const openButton = canvas.getByRole('button', { name: 'Open Dialog' });
    await userEvent.click(openButton);

    // Wait for dialog to be visible (use document.body since dialog is portal)
    const body = within(document.body);
    await waitFor(() => {
      expect(body.getByRole('dialog')).toBeVisible();
    });

    // Verify dialog content
    expect(body.getByRole('heading', { name: 'Dialog Title' })).toBeInTheDocument();

    // Close dialog with Cancel
    const cancelButton = body.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelButton);

    // Dialog should be closed
    await waitFor(() => {
      expect(body.queryByRole('dialog')).not.toBeVisible();
    });
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
