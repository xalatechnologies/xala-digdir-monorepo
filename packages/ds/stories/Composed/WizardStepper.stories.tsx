import type { Meta, StoryObj } from '@storybook/react-vite';
import { WizardStepper } from '../../src/composed/WizardStepper';
import { Button } from '../../src';
import { useState } from 'react';

const meta: Meta<typeof WizardStepper> = {
  title: 'Composed/WizardStepper',
  component: WizardStepper,
  parameters: {
    docs: {
      description: {
        component: `
Horizontal pill-style stepper for wizards.

## Features
- Pill-style step buttons
- Progress indicator text
- Error state per step
- Click to navigate to previous/current steps
- Responsive horizontal scroll

## Usage
Used in multi-step forms and wizards to show progress and allow navigation.
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WizardStepper>;

const wizardSteps = [
  { id: 'basics', label: 'Grunnleggende info' },
  { id: 'details', label: 'Detaljer' },
  { id: 'pricing', label: 'Priser' },
  { id: 'review', label: 'Se over' },
];

export const Default: Story = {
  args: {
    steps: wizardSteps,
    currentStep: 0,
  },
};

export const SecondStep: Story = {
  args: {
    steps: wizardSteps,
    currentStep: 1,
  },
};

export const ThirdStep: Story = {
  args: {
    steps: wizardSteps,
    currentStep: 2,
  },
};

export const LastStep: Story = {
  args: {
    steps: wizardSteps,
    currentStep: 3,
  },
};

export const WithErrors: Story = {
  args: {
    steps: wizardSteps,
    currentStep: 2,
    errors: {
      basics: ['Name is required'],
      details: ['Description is too short'],
    },
  },
};

export const Interactive: Story = {
  render: function Render() {
    const [currentStep, setCurrentStep] = useState(0);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
        <WizardStepper
          steps={wizardSteps}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', justifyContent: 'center' }}>
          <Button
            variant="secondary"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Forrige
          </Button>
          <Button
            variant="primary"
            onClick={() => setCurrentStep(Math.min(wizardSteps.length - 1, currentStep + 1))}
            disabled={currentStep === wizardSteps.length - 1}
          >
            Neste
          </Button>
        </div>
      </div>
    );
  },
};

export const RentalObjectWizard: Story = {
  args: {
    steps: [
      { id: 'type', label: 'Type utleieobjekt' },
      { id: 'info', label: 'Grunninfo' },
      { id: 'location', label: 'Plassering' },
      { id: 'facilities', label: 'Fasiliteter' },
      { id: 'images', label: 'Bilder' },
      { id: 'pricing', label: 'Priser' },
      { id: 'availability', label: 'Tilgjengelighet' },
      { id: 'publish', label: 'Publiser' },
    ],
    currentStep: 3,
  },
};

export const SeasonWizard: Story = {
  args: {
    steps: [
      { id: 'info', label: 'Sesonginfo' },
      { id: 'dates', label: 'Datoer' },
      { id: 'objects', label: 'Utleieobjekter' },
      { id: 'pricing', label: 'Priser' },
      { id: 'rules', label: 'Regler' },
      { id: 'confirm', label: 'Bekreft' },
    ],
    currentStep: 2,
  },
};

export const UserOnboardingWizard: Story = {
  args: {
    steps: [
      { id: 'welcome', label: 'Velkommen' },
      { id: 'profile', label: 'Profil' },
      { id: 'preferences', label: 'Preferanser' },
      { id: 'complete', label: 'Ferdig' },
    ],
    currentStep: 1,
  },
};
