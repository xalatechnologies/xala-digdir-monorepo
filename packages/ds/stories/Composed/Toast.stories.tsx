import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef } from 'react';
import { ToastProvider, useToast } from '../../src/composed/Toast';
import { Button } from '../../src';

const meta: Meta = {
  title: 'Composed/Toast',
  parameters: {
    docs: {
      description: {
        component: `
Toast notifications for displaying feedback messages.

## Features
- Multiple variants (info, success, warning, error)
- Auto-dismiss with configurable duration
- Dismissible with close button
- Action button support
- Customizable position

## Usage
1. Wrap your app with \`<ToastProvider>\`
2. Use \`useToast()\` hook to show toasts
        `,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ToastProvider position="top-right">
        <Story />
      </ToastProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj;

function ToastDemo() {
  const { success, error, warning, info } = useToast();

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
      <Button onClick={() => info('Info', 'This is an informational message')} type="button">
        Info Toast
      </Button>
      <Button onClick={() => success('Success', 'Your action was completed successfully')} type="button">
        Success Toast
      </Button>
      <Button onClick={() => warning('Warning', 'Please review before continuing')} type="button">
        Warning Toast
      </Button>
      <Button onClick={() => error('Error', 'Something went wrong. Please try again.')} type="button">
        Error Toast
      </Button>
    </div>
  );
}

/**
 * Basic toast variants
 */
export const Variants: Story = {
  render: () => <ToastDemo />,
};

function ToastWithAction() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() =>
        toast({
          title: 'Booking Cancelled',
          description: 'Your booking has been cancelled.',
          variant: 'info',
          action: {
            label: 'Undo',
            onClick: () => console.log('Undo clicked'),
          },
        })
      } type="button"
    >
      Toast with Action
    </Button>
  );
}

/**
 * Toast with action button
 */
export const WithAction: Story = {
  render: () => <ToastWithAction />,
};

function ToastDuration() {
  const { toast } = useToast();

  return (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
      <Button
        onClick={() =>
          toast({
            title: 'Quick Toast',
            description: 'Disappears in 2 seconds',
            duration: 2000,
          })
        } type="button"
      >
        2s Duration
      </Button>
      <Button
        onClick={() =>
          toast({
            title: 'Long Toast',
            description: 'Stays for 10 seconds',
            duration: 10000,
          })
        } type="button"
      >
        10s Duration
      </Button>
    </div>
  );
}

/**
 * Custom duration
 */
export const CustomDuration: Story = {
  render: () => <ToastDuration />,
};

function MultipleToasts() {
  const { success, error, warning, info } = useToast();
  const counter = useRef(0);

  const showAll = () => {
    counter.current++;
    info(`Info ${counter.current}`, 'Informational message');
    setTimeout(() => success(`Success ${counter.current}`, 'Operation completed'), 200);
    setTimeout(() => warning(`Warning ${counter.current}`, 'Please review'), 400);
    setTimeout(() => error(`Error ${counter.current}`, 'Something went wrong'), 600);
  };

  return <Button onClick={showAll} type="button">Show Multiple Toasts</Button>;
}

/**
 * Multiple stacked toasts
 */
export const Multiple: Story = {
  render: () => <MultipleToasts />,
};
