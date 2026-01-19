import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { WizardStepper, WizardNavigation } from '../../src/composed/data-page/Wizard';
import { Button, Paragraph } from '@digdir/designsystemet-react';

const meta: Meta = {
  title: 'Composed/Wizard',
  parameters: {
    docs: {
      description: {
        component: `
Wizard components for multi-step forms and workflows.

## Components
- \`WizardStepper\` - Step indicator with progress
- \`WizardNavigation\` - Previous/Next/Save buttons

## Features
- Visual step progress
- Click navigation to completed steps
- Error state per step
- Save draft support

## When to Use
- Multi-step forms
- Onboarding flows
- Complex data entry wizards
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const sampleSteps = [
  { id: 'info', label: 'Basic Info' },
  { id: 'details', label: 'Details' },
  { id: 'pricing', label: 'Pricing', optional: true },
  { id: 'review', label: 'Review' },
];

/**
 * Stepper showing current progress
 */
export const Stepper: Story = {
  render: function Render() {
    const [currentStep, setCurrentStep] = useState(1);
    
    return (
      <div style={{ border: '1px solid var(--ds-color-neutral-border-default)', borderRadius: 'var(--ds-border-radius-md)' }}>
        <WizardStepper
          steps={sampleSteps}
          currentStep={currentStep}
          onStepClick={(step) => step < currentStep && setCurrentStep(step)}
          title="Create Listing"
          showStepCounter
        />
        <div style={{ padding: 'var(--ds-spacing-6)', textAlign: 'center' }}>
          <Paragraph>Current step: {sampleSteps[currentStep]?.label}</Paragraph>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', justifyContent: 'center', marginTop: 'var(--ds-spacing-4)' }}>
            <Button variant="secondary" disabled={currentStep === 0} onClick={() => setCurrentStep(s => s - 1)}>
              Previous
            </Button>
            <Button variant="primary" disabled={currentStep >= sampleSteps.length - 1} onClick={() => setCurrentStep(s => s + 1)}>
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  },
};

/**
 * Stepper with error state
 */
export const WithErrors: Story = {
  render: () => (
    <WizardStepper
      steps={sampleSteps}
      currentStep={2}
      errors={{ details: ['Missing required field'] }}
      title="Create Listing"
    />
  ),
};

/**
 * Navigation buttons
 */
export const Navigation: Story = {
  render: function Render() {
    const [step, setStep] = useState(0);
    const isLastStep = step === sampleSteps.length - 1;
    
    return (
      <div style={{ border: '1px solid var(--ds-color-neutral-border-default)', borderRadius: 'var(--ds-border-radius-md)', padding: 'var(--ds-spacing-4)' }}>
        <Paragraph style={{ marginBottom: 'var(--ds-spacing-4)' }}>Step {step + 1} of {sampleSteps.length}: {sampleSteps[step]?.label}</Paragraph>
        <WizardNavigation
          canGoPrev={step > 0}
          canGoNext={true}
          isLastStep={isLastStep}
          onPrev={() => setStep(s => s - 1)}
          onNext={() => setStep(s => s + 1)}
          onCancel={() => console.log('Cancel')}
          onSaveDraft={() => console.log('Save draft')}
          onComplete={() => console.log('Complete')}
          prevLabel="Previous"
          nextLabel="Next"
          cancelLabel="Cancel"
          saveDraftLabel="Save Draft"
          completeLabel="Complete"
        />
      </div>
    );
  },
};

/**
 * Full wizard example
 */
export const FullExample: Story = {
  render: function Render() {
    const [currentStep, setCurrentStep] = useState(0);
    const isLastStep = currentStep === sampleSteps.length - 1;

    const stepContent: Record<string, React.ReactNode> = {
      info: <div>Enter basic information about your listing...</div>,
      details: <div>Add detailed description and features...</div>,
      pricing: <div>Set your pricing and availability...</div>,
      review: <div>Review all information before publishing...</div>,
    };

    return (
      <div style={{ border: '1px solid var(--ds-color-neutral-border-default)', borderRadius: 'var(--ds-border-radius-md)' }}>
        <WizardStepper
          steps={sampleSteps}
          currentStep={currentStep}
          onStepClick={(step) => step < currentStep && setCurrentStep(step)}
          title="Create Listing"
          showStepCounter
        />
        <div style={{ padding: 'var(--ds-spacing-6)', minHeight: '200px' }}>
          {stepContent[sampleSteps[currentStep]?.id ?? 'info']}
        </div>
        <div style={{ borderTop: '1px solid var(--ds-color-neutral-border-default)', padding: 'var(--ds-spacing-4)' }}>
          <WizardNavigation
            canGoPrev={currentStep > 0}
            canGoNext={true}
            isLastStep={isLastStep}
            onPrev={() => setCurrentStep(s => s - 1)}
            onNext={() => setCurrentStep(s => s + 1)}
            onCancel={() => console.log('Cancel')}
            onComplete={() => alert('Wizard completed!')}
            prevLabel="Previous"
            nextLabel="Next"
            cancelLabel="Cancel"
            completeLabel="Publish Listing"
          />
        </div>
      </div>
    );
  },
};
