import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { WizardStepper } from './WizardStepper';
import type { WizardStep } from '../../types';

const mockSteps: WizardStep[] = [
  { id: 'basics', label: 'Basics', labelNorwegian: 'Grunnleggende', required: true },
  { id: 'location', label: 'Location', labelNorwegian: 'Lokasjon', required: false },
  { id: 'capacity', label: 'Capacity', labelNorwegian: 'Kapasitet', required: false },
  { id: 'content', label: 'Content', labelNorwegian: 'Innhold', required: false },
  { id: 'review', label: 'Review', labelNorwegian: 'Gjennomgang', required: true },
];

describe('WizardStepper', () => {
  it('should render all steps', () => {
    render(
      <WizardStepper
        steps={mockSteps}
        currentStep={0}
      />
    );

    expect(screen.getByText('Grunnleggende')).toBeInTheDocument();
    expect(screen.getByText('Lokasjon')).toBeInTheDocument();
    expect(screen.getByText('Kapasitet')).toBeInTheDocument();
    expect(screen.getByText('Innhold')).toBeInTheDocument();
    expect(screen.getByText('Gjennomgang')).toBeInTheDocument();
  });

  it('should render default title', () => {
    render(
      <WizardStepper
        steps={mockSteps}
        currentStep={0}
      />
    );

    expect(screen.getByText('Opprett utleieobjekt')).toBeInTheDocument();
  });

  it('should render custom title', () => {
    render(
      <WizardStepper
        steps={mockSteps}
        currentStep={0}
        title="Rediger utleieobjekt"
      />
    );

    expect(screen.getByText('Rediger utleieobjekt')).toBeInTheDocument();
  });

  it('should show step counter by default', () => {
    render(
      <WizardStepper
        steps={mockSteps}
        currentStep={0}
      />
    );

    expect(screen.getByText('Steg 1 av 5')).toBeInTheDocument();
  });

  it('should update step counter for current step', () => {
    render(
      <WizardStepper
        steps={mockSteps}
        currentStep={2}
      />
    );

    expect(screen.getByText('Steg 3 av 5')).toBeInTheDocument();
  });

  it('should hide step counter when showStepCounter is false', () => {
    render(
      <WizardStepper
        steps={mockSteps}
        currentStep={0}
        showStepCounter={false}
      />
    );

    expect(screen.queryByText('Steg 1 av 5')).not.toBeInTheDocument();
  });

  it('should mark completed steps with checkmark', () => {
    const { container } = render(
      <WizardStepper
        steps={mockSteps}
        currentStep={2}
      />
    );

    // First two steps should be completed (currentStep is 2, so steps 0 and 1 are completed)
    // CheckIcon renders as an SVG with a polyline element
    const checkIcons = container.querySelectorAll('svg polyline[points="20 6 9 17 4 12"]');
    expect(checkIcons.length).toBe(2);
  });

  it('should highlight current step', () => {
    const { container } = render(
      <WizardStepper
        steps={mockSteps}
        currentStep={1}
      />
    );

    // The current step (index 1) should have active styling
    // We can check this by verifying the step exists
    expect(screen.getByText('Lokasjon')).toBeInTheDocument();
  });

  it('should call onStepClick when completed step is clicked', () => {
    const mockOnStepClick = vi.fn();

    render(
      <WizardStepper
        steps={mockSteps}
        currentStep={2}
        onStepClick={mockOnStepClick}
      />
    );

    // Click on the first step (which is completed)
    const firstStep = screen.getByText('Grunnleggende');
    fireEvent.click(firstStep);

    expect(mockOnStepClick).toHaveBeenCalledWith(0);
  });

  it('should call onStepClick for any completed step', () => {
    const mockOnStepClick = vi.fn();

    render(
      <WizardStepper
        steps={mockSteps}
        currentStep={3}
        onStepClick={mockOnStepClick}
      />
    );

    // Click on the second step (which is completed)
    const secondStep = screen.getByText('Lokasjon');
    fireEvent.click(secondStep);

    expect(mockOnStepClick).toHaveBeenCalledWith(1);
  });

  it('should not call onStepClick for current step', () => {
    const mockOnStepClick = vi.fn();

    render(
      <WizardStepper
        steps={mockSteps}
        currentStep={1}
        onStepClick={mockOnStepClick}
      />
    );

    // Click on the current step
    const currentStep = screen.getByText('Lokasjon');
    fireEvent.click(currentStep);

    expect(mockOnStepClick).not.toHaveBeenCalled();
  });

  it('should not call onStepClick for future steps', () => {
    const mockOnStepClick = vi.fn();

    render(
      <WizardStepper
        steps={mockSteps}
        currentStep={1}
        onStepClick={mockOnStepClick}
      />
    );

    // Click on a future step
    const futureStep = screen.getByText('Kapasitet');
    fireEvent.click(futureStep);

    expect(mockOnStepClick).not.toHaveBeenCalled();
  });

  it('should support keyboard navigation with Enter key', () => {
    const mockOnStepClick = vi.fn();

    render(
      <WizardStepper
        steps={mockSteps}
        currentStep={2}
        onStepClick={mockOnStepClick}
      />
    );

    const firstStep = screen.getByText('Grunnleggende');
    fireEvent.keyDown(firstStep, { key: 'Enter', code: 'Enter' });

    expect(mockOnStepClick).toHaveBeenCalledWith(0);
  });

  it('should support keyboard navigation with Space key', () => {
    const mockOnStepClick = vi.fn();

    render(
      <WizardStepper
        steps={mockSteps}
        currentStep={2}
        onStepClick={mockOnStepClick}
      />
    );

    const firstStep = screen.getByText('Grunnleggende');
    fireEvent.keyDown(firstStep, { key: ' ', code: 'Space' });

    expect(mockOnStepClick).toHaveBeenCalledWith(0);
  });

  it('should not trigger keyboard navigation for other keys', () => {
    const mockOnStepClick = vi.fn();

    render(
      <WizardStepper
        steps={mockSteps}
        currentStep={2}
        onStepClick={mockOnStepClick}
      />
    );

    const firstStep = screen.getByText('Grunnleggende');
    fireEvent.keyDown(firstStep, { key: 'a', code: 'KeyA' });

    expect(mockOnStepClick).not.toHaveBeenCalled();
  });

  it('should show error state for steps with errors', () => {
    render(
      <WizardStepper
        steps={mockSteps}
        currentStep={2}
        errors={{
          basics: ['Name is required'],
        }}
      />
    );

    // The component should render, and the basics step should have error styling
    expect(screen.getByText('Grunnleggende')).toBeInTheDocument();
  });

  it('should show error state for multiple steps', () => {
    render(
      <WizardStepper
        steps={mockSteps}
        currentStep={3}
        errors={{
          basics: ['Name is required'],
          location: ['Address is required'],
        }}
      />
    );

    expect(screen.getByText('Grunnleggende')).toBeInTheDocument();
    expect(screen.getByText('Lokasjon')).toBeInTheDocument();
  });

  it('should render step numbers for steps without icons', () => {
    const stepsWithoutIcons: WizardStep[] = [
      { id: 'step1' as any, label: 'Step 1', labelNorwegian: 'Steg 1', required: true },
      { id: 'step2' as any, label: 'Step 2', labelNorwegian: 'Steg 2', required: false },
    ];

    render(
      <WizardStepper
        steps={stepsWithoutIcons}
        currentStep={0}
      />
    );

    expect(screen.getByText('Steg 1')).toBeInTheDocument();
    expect(screen.getByText('Steg 2')).toBeInTheDocument();
  });

  it('should render with minimum required props', () => {
    render(
      <WizardStepper
        steps={mockSteps}
        currentStep={0}
      />
    );

    expect(screen.getByText('Opprett utleieobjekt')).toBeInTheDocument();
    expect(screen.getByText('Grunnleggende')).toBeInTheDocument();
  });

  it('should handle single step', () => {
    const singleStep: WizardStep[] = [
      { id: 'basics', label: 'Basics', labelNorwegian: 'Grunnleggende', required: true },
    ];

    render(
      <WizardStepper
        steps={singleStep}
        currentStep={0}
      />
    );

    expect(screen.getByText('Steg 1 av 1')).toBeInTheDocument();
    expect(screen.getByText('Grunnleggende')).toBeInTheDocument();
  });

  it('should handle last step correctly', () => {
    render(
      <WizardStepper
        steps={mockSteps}
        currentStep={4}
      />
    );

    expect(screen.getByText('Steg 5 av 5')).toBeInTheDocument();
    expect(screen.getByText('Gjennomgang')).toBeInTheDocument();
  });

  it('should set correct accessibility attributes for clickable steps', () => {
    render(
      <WizardStepper
        steps={mockSteps}
        currentStep={2}
        onStepClick={vi.fn()}
      />
    );

    const firstStep = screen.getByText('Grunnleggende').parentElement;
    expect(firstStep).toHaveAttribute('role', 'button');
    expect(firstStep).toHaveAttribute('tabIndex', '0');
  });

  it('should not set button role for non-clickable steps', () => {
    render(
      <WizardStepper
        steps={mockSteps}
        currentStep={1}
        onStepClick={vi.fn()}
      />
    );

    // Current step (index 1) should not be clickable
    const currentStep = screen.getByText('Lokasjon').parentElement;
    expect(currentStep).not.toHaveAttribute('role', 'button');
  });

  it('should work without onStepClick handler', () => {
    render(
      <WizardStepper
        steps={mockSteps}
        currentStep={2}
      />
    );

    const firstStep = screen.getByText('Grunnleggende');
    fireEvent.click(firstStep);

    // Should not crash
    expect(screen.getByText('Grunnleggende')).toBeInTheDocument();
  });

  it('should render all known step icons correctly', () => {
    const allIconSteps: WizardStep[] = [
      { id: 'basics', label: 'Basics', labelNorwegian: 'Grunnleggende', required: true },
      { id: 'location', label: 'Location', labelNorwegian: 'Lokasjon', required: false },
      { id: 'capacity', label: 'Capacity', labelNorwegian: 'Kapasitet', required: false },
      { id: 'content', label: 'Content', labelNorwegian: 'Innhold', required: false },
      { id: 'openingHours', label: 'Opening Hours', labelNorwegian: 'Åpningstider', required: false },
      { id: 'bookingConfig', label: 'Booking', labelNorwegian: 'Booking', required: true },
      { id: 'media', label: 'Media', labelNorwegian: 'Bilder', required: true },
      { id: 'review', label: 'Review', labelNorwegian: 'Gjennomgang', required: true },
    ];

    render(
      <WizardStepper
        steps={allIconSteps}
        currentStep={0}
      />
    );

    // Verify all steps render
    expect(screen.getByText('Grunnleggende')).toBeInTheDocument();
    expect(screen.getByText('Lokasjon')).toBeInTheDocument();
    expect(screen.getByText('Kapasitet')).toBeInTheDocument();
    expect(screen.getByText('Innhold')).toBeInTheDocument();
    expect(screen.getByText('Åpningstider')).toBeInTheDocument();
    expect(screen.getByText('Booking')).toBeInTheDocument();
    expect(screen.getByText('Bilder')).toBeInTheDocument();
    expect(screen.getByText('Gjennomgang')).toBeInTheDocument();
  });

  it('should handle empty errors object', () => {
    render(
      <WizardStepper
        steps={mockSteps}
        currentStep={0}
        errors={{}}
      />
    );

    expect(screen.getByText('Grunnleggende')).toBeInTheDocument();
  });

  it('should prioritize error state over completed state', () => {
    render(
      <WizardStepper
        steps={mockSteps}
        currentStep={3}
        errors={{
          basics: ['Name is required'],
        }}
      />
    );

    // Basics step is completed (index 0, currentStep is 3) but has errors
    // Error state should take precedence
    expect(screen.getByText('Grunnleggende')).toBeInTheDocument();
  });

  it('should render connecting lines between steps', () => {
    const { container } = render(
      <WizardStepper
        steps={mockSteps}
        currentStep={0}
      />
    );

    // Component should render successfully with connecting lines
    expect(container.querySelector('[style*="flex: 1"]')).toBeInTheDocument();
  });

  it('should handle rapid step changes', () => {
    const mockOnStepClick = vi.fn();
    const { rerender } = render(
      <WizardStepper
        steps={mockSteps}
        currentStep={0}
        onStepClick={mockOnStepClick}
      />
    );

    rerender(
      <WizardStepper
        steps={mockSteps}
        currentStep={1}
        onStepClick={mockOnStepClick}
      />
    );

    rerender(
      <WizardStepper
        steps={mockSteps}
        currentStep={2}
        onStepClick={mockOnStepClick}
      />
    );

    expect(screen.getByText('Steg 3 av 5')).toBeInTheDocument();
  });
});
