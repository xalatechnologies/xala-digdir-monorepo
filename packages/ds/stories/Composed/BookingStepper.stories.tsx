import type { Meta, StoryObj } from '@storybook/react-vite';
import { BookingStepper } from '@xala/ds/composed/BookingStepper';
import { Button } from '@xala/ds';
import { useState } from 'react';

const meta: Meta<typeof BookingStepper> = {
  title: 'Composed/BookingStepper',
  component: BookingStepper,
  parameters: {
    docs: {
      description: {
        component: `
Horizontal step indicator for booking flows.

## Features
- Visual progress through booking steps
- Icons for each step type (calendar, details, confirm, send)
- Completed, active, and future step states
- Step counter badge
- Click to navigate to previous steps

## Usage
Used in booking flows to show users their progress through the booking process.
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BookingStepper>;

const bookingSteps = [
  { id: 'select', label: 'Velg tidspunkter' },
  { id: 'details', label: 'Detaljer og vilkår' },
  { id: 'confirm', label: 'Bekreft' },
  { id: 'send', label: 'Send forespørsel' },
];

export const Default: Story = {
  args: {
    steps: bookingSteps,
    currentStep: 0,
    title: 'Bookingprosess',
  },
};

export const SecondStep: Story = {
  args: {
    steps: bookingSteps,
    currentStep: 1,
    title: 'Bookingprosess',
  },
};

export const ThirdStep: Story = {
  args: {
    steps: bookingSteps,
    currentStep: 2,
    title: 'Bookingprosess',
  },
};

export const LastStep: Story = {
  args: {
    steps: bookingSteps,
    currentStep: 3,
    title: 'Bookingprosess',
  },
};

export const WithoutStepCounter: Story = {
  args: {
    steps: bookingSteps,
    currentStep: 1,
    title: 'Booking',
    showStepCounter: false,
  },
};

export const CustomTitle: Story = {
  args: {
    steps: bookingSteps,
    currentStep: 1,
    title: 'Reservasjon av tennisbane',
  },
};

export const Interactive: Story = {
  render: function Render() {
    const [currentStep, setCurrentStep] = useState(0);
    
    const handleStepClick = (index: number) => {
      if (index < currentStep) {
        setCurrentStep(index);
      }
    };
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
        <BookingStepper
          steps={bookingSteps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          title="Bookingprosess"
        />
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', justifyContent: 'center' }}>
          <Button
            variant="secondary"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0} type="button"
          >
            Forrige
          </Button>
          <Button
            variant="primary"
            onClick={() => setCurrentStep(Math.min(bookingSteps.length - 1, currentStep + 1))}
            disabled={currentStep === bookingSteps.length - 1} type="button"
          >
            Neste
          </Button>
        </div>
      </div>
    );
  },
};

export const ThreeSteps: Story = {
  args: {
    steps: [
      { id: 'date', label: 'Velg dato' },
      { id: 'info', label: 'Kontaktinfo' },
      { id: 'done', label: 'Ferdig' },
    ],
    currentStep: 1,
    title: 'Rask booking',
  },
};

export const FiveSteps: Story = {
  args: {
    steps: [
      { id: 'select', label: 'Velg anlegg' },
      { id: 'time', label: 'Velg tid' },
      { id: 'details', label: 'Detaljer' },
      { id: 'review', label: 'Se over' },
      { id: 'complete', label: 'Bekreft' },
    ],
    currentStep: 2,
    title: 'Utvidet booking',
  },
};
