import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ConfirmDialog, ActionDialog } from '../../src/composed/ConfirmDialog';
import { Button } from '@digdir/designsystemet-react';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Composed/ConfirmDialog',
  component: ConfirmDialog,
  parameters: {
    docs: {
      description: {
        component: `
ConfirmDialog and ActionDialog for modal confirmations and forms.

## Features
- Multiple variants (default, danger, warning, success)
- Loading state support
- Keyboard accessible (Escape to close)
- Focus trap and body scroll lock

## When to Use
- Destructive action confirmations
- Form submissions requiring confirmation
- Important user decisions
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

/**
 * Default confirmation dialog
 */
export const Default: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Dialog</Button>
        <ConfirmDialog
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={() => {
            console.log('Confirmed');
            setOpen(false);
          }}
          title="Confirm Action"
          description="Are you sure you want to proceed with this action?"
        />
      </>
    );
  },
};

/**
 * Danger variant for destructive actions
 */
export const Danger: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="primary" data-color="danger" onClick={() => setOpen(true)}>
          Delete Item
        </Button>
        <ConfirmDialog
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={() => {
            console.log('Deleted');
            setOpen(false);
          }}
          title="Delete Item"
          description="This action cannot be undone. Are you sure you want to delete this item permanently?"
          variant="danger"
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />
      </>
    );
  },
};

/**
 * Warning variant
 */
export const Warning: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Leave Page
        </Button>
        <ConfirmDialog
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={() => {
            console.log('Left page');
            setOpen(false);
          }}
          title="Unsaved Changes"
          description="You have unsaved changes. Are you sure you want to leave this page?"
          variant="warning"
          confirmLabel="Leave"
          cancelLabel="Stay"
        />
      </>
    );
  },
};

/**
 * Success variant
 */
export const Success: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Publish
        </Button>
        <ConfirmDialog
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={() => {
            console.log('Published');
            setOpen(false);
          }}
          title="Publish Listing"
          description="Your listing will be visible to all users. Continue?"
          variant="success"
          confirmLabel="Publish"
          cancelLabel="Cancel"
        />
      </>
    );
  },
};

/**
 * With loading state
 */
export const WithLoading: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const handleConfirm = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLoading(false);
      setOpen(false);
    };

    return (
      <>
        <Button onClick={() => setOpen(true)}>Save Changes</Button>
        <ConfirmDialog
          isOpen={open}
          onClose={() => !loading && setOpen(false)}
          onConfirm={handleConfirm}
          title="Save Changes"
          description="Your changes will be saved to the server."
          isLoading={loading}
          confirmLabel={loading ? 'Saving...' : 'Save'}
        />
      </>
    );
  },
};

/**
 * ActionDialog for forms
 */
export const ActionDialogExample: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Form Dialog</Button>
        <ActionDialog
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Edit Profile"
          description="Update your profile information"
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setOpen(false)}>Save</Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)' }}>Name</label>
              <input type="text" defaultValue="John Doe" style={{ width: '100%', padding: 'var(--ds-spacing-2)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)' }}>Email</label>
              <input type="email" defaultValue="john@example.com" style={{ width: '100%', padding: 'var(--ds-spacing-2)' }} />
            </div>
          </div>
        </ActionDialog>
      </>
    );
  },
};
