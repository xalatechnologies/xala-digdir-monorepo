import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stepper, Wizard, useWizard } from '../../src/composed/Stepper';
import { Paragraph } from '@digdir/designsystemet-react';

const meta: Meta<typeof Stepper> = {
  title: 'Composed/Stepper',
  component: Stepper,
  parameters: {
    docs: {
      description: {
        component: `
Multi-step progress indicator for forms and wizards.

## Features
- Horizontal or vertical orientation
- Clickable completed steps
- Multiple sizes (sm, md, lg)
- Completed/current/pending/error states

## Accessibility
- Keyboard navigation for clickable steps
- Visual and semantic step status
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Stepper>;

const defaultSteps = [
  { id: 'info', title: 'Personal Info', description: 'Enter your details' },
  { id: 'address', title: 'Address', description: 'Where do you live?' },
  { id: 'payment', title: 'Payment', description: 'Payment details' },
  { id: 'confirm', title: 'Confirmation', description: 'Review and submit' },
];

export const Default: Story = {
  args: {
    steps: defaultSteps,
    currentStep: 1,
  },
};

export const FirstStep: Story = {
  args: {
    steps: defaultSteps,
    currentStep: 0,
  },
};

export const MiddleStep: Story = {
  args: {
    steps: defaultSteps,
    currentStep: 2,
  },
};

export const LastStep: Story = {
  args: {
    steps: defaultSteps,
    currentStep: 3,
  },
};

export const AllCompleted: Story = {
  args: {
    steps: defaultSteps,
    currentStep: 4,
  },
};

export const Vertical: Story = {
  args: {
    steps: defaultSteps,
    currentStep: 1,
    orientation: 'vertical',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-8)' }}>
      <div>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>Small</Paragraph>
        <Stepper steps={defaultSteps} currentStep={1} size="sm" />
      </div>
      <div>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>Medium (default)</Paragraph>
        <Stepper steps={defaultSteps} currentStep={1} size="md" />
      </div>
      <div>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>Large</Paragraph>
        <Stepper steps={defaultSteps} currentStep={1} size="lg" />
      </div>
    </div>
  ),
};

export const WithOptionalStep: Story = {
  args: {
    steps: [
      { id: 'info', title: 'Personal Info' },
      { id: 'preferences', title: 'Preferences', optional: true },
      { id: 'confirm', title: 'Confirmation' },
    ],
    currentStep: 1,
  },
};

export const Interactive: Story = {
  render: function Render() {
    const { currentStep, goToStep, nextStep, prevStep, isFirstStep, isLastStep } = useWizard(4);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
        <Stepper
          steps={defaultSteps}
          currentStep={currentStep}
          onStepClick={goToStep}
          allowClickPrevious
        />
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', justifyContent: 'center' }}>
          <button onClick={prevStep} disabled={isFirstStep}>Previous</button>
          <button onClick={nextStep}>{isLastStep ? 'Complete' : 'Next'}</button>
        </div>
        <Paragraph style={{ textAlign: 'center' }}>
          Current step: {currentStep + 1} - {defaultSteps[currentStep]?.title}
        </Paragraph>
      </div>
    );
  },
};
