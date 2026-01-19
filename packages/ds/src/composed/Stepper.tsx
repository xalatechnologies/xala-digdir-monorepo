/**
 * Stepper & Wizard Components
 *
 * Multi-step form navigation with progress indicators.
 * SSR-safe with 'use client' directive.
 *
 * @module @xala/ds/composed/Stepper
 */

'use client';

import React, { useState, useCallback, type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  optional?: boolean;
}

export type StepStatus = 'pending' | 'current' | 'completed' | 'error';

export interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  allowClickPrevious?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface WizardProps {
  steps: Step[];
  children: ReactNode[];
  onComplete?: () => void;
  onCancel?: () => void;
  showStepIndicator?: boolean;
  allowSkip?: boolean;
  nextLabel?: string;
  prevLabel?: string;
  completeLabel?: string;
  cancelLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// =============================================================================
// Size Styles
// =============================================================================

const sizeStyles = {
  sm: { circle: 'var(--ds-sizing-6)', font: 'var(--ds-font-size-xs)', gap: 'var(--ds-spacing-2)' },
  md: { circle: 'var(--ds-sizing-8)', font: 'var(--ds-font-size-sm)', gap: 'var(--ds-spacing-3)' },
  lg: { circle: 'var(--ds-sizing-10)', font: 'var(--ds-font-size-md)', gap: 'var(--ds-spacing-4)' },
};

// =============================================================================
// StepIndicator Component
// =============================================================================

interface StepIndicatorProps {
  step: Step;
  index: number;
  status: StepStatus;
  size: 'sm' | 'md' | 'lg';
  isLast: boolean;
  orientation: 'horizontal' | 'vertical';
  onClick?: () => void;
  clickable: boolean;
}

function StepIndicator({
  step,
  index,
  status,
  size,
  isLast,
  orientation,
  onClick,
  clickable,
}: StepIndicatorProps): React.ReactElement {
  const styles = sizeStyles[size];

  const getCircleStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: styles.circle,
      height: styles.circle,
      borderRadius: 'var(--ds-border-radius-full)',
      fontSize: styles.font,
      fontWeight: 'var(--ds-font-weight-medium)',
      transition: 'all 0.2s ease',
      flexShrink: 0,
    };

    switch (status) {
      case 'completed':
        return { ...base, backgroundColor: 'var(--ds-color-success-base-default)', color: 'white' };
      case 'current':
        return { ...base, backgroundColor: 'var(--ds-color-accent-base-default)', color: 'white' };
      case 'error':
        return { ...base, backgroundColor: 'var(--ds-color-danger-base-default)', color: 'white' };
      default:
        return {
          ...base,
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          color: 'var(--ds-color-neutral-text-subtle)',
          borderWidth: 'var(--ds-border-width-lg)',
          borderStyle: 'solid',
          borderColor: 'var(--ds-color-neutral-border-default)',
        };
    }
  };

  const getLineStyles = (): React.CSSProperties => {
    const completed = status === 'completed';
    return {
      flex: 1,
      backgroundColor: completed ? 'var(--ds-color-success-base-default)' : 'var(--ds-color-neutral-border-default)',
      transition: 'background-color 0.2s ease',
      ...(orientation === 'horizontal'
        ? { height: 'var(--ds-border-width-lg)', margin: '0 var(--ds-spacing-2)' }
        : { width: 'var(--ds-border-width-lg)', minHeight: 'var(--ds-spacing-6)', margin: 'var(--ds-spacing-2) 0' }),
    };
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: orientation === 'horizontal' ? 'center' : 'flex-start',
        flexDirection: orientation === 'horizontal' ? 'row' : 'column',
        flex: isLast ? 0 : 1,
      }}
    >
      <div
        onClick={clickable ? onClick : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: styles.gap,
          cursor: clickable ? 'pointer' : 'default',
          flexDirection: orientation === 'horizontal' ? 'column' : 'row',
        }}
      >
        <div style={getCircleStyles()}>
          {status === 'completed' ? (
            <CheckIcon />
          ) : status === 'error' ? (
            <AlertIcon />
          ) : step.icon ? (
            step.icon
          ) : (
            index + 1
          )}
        </div>
        <div style={{ textAlign: orientation === 'horizontal' ? 'center' : 'left' }}>
          <p
            style={{
              margin: 0,
              fontSize: styles.font,
              fontWeight: status === 'current' ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-medium)',
              color: status === 'current' ? 'var(--ds-color-neutral-text-default)' : 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {step.title}
            {step.optional && (
              <span style={{ fontWeight: 'var(--ds-font-weight-normal)', marginLeft: 'var(--ds-spacing-1)' }}>
                (optional)
              </span>
            )}
          </p>
          {step.description && (
            <p
              style={{
                margin: 'var(--ds-spacing-1) 0 0 0',
                fontSize: 'var(--ds-font-size-xs)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {step.description}
            </p>
          )}
        </div>
      </div>
      {!isLast && <div style={getLineStyles()} />}
    </div>
  );
}

// =============================================================================
// Stepper Component
// =============================================================================

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  size = 'md',
  allowClickPrevious = true,
  className,
  style,
}: StepperProps): React.ReactElement {
  const getStatus = (index: number): StepStatus => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: orientation === 'horizontal' ? 'row' : 'column',
        alignItems: orientation === 'horizontal' ? 'flex-start' : 'stretch',
        gap: orientation === 'vertical' ? 'var(--ds-spacing-1)' : undefined,
        ...style,
      }}
    >
      {steps.map((step, index) => (
        <StepIndicator
          key={step.id}
          step={step}
          index={index}
          status={getStatus(index)}
          size={size}
          isLast={index === steps.length - 1}
          orientation={orientation}
          onClick={() => onStepClick?.(index)}
          clickable={allowClickPrevious && index < currentStep && !!onStepClick}
        />
      ))}
    </div>
  );
}

// =============================================================================
// Wizard Component
// =============================================================================

export function Wizard({
  steps,
  children,
  onComplete,
  onCancel,
  showStepIndicator = true,
  allowSkip = false,
  nextLabel = 'Next',
  prevLabel = 'Back',
  completeLabel = 'Complete',
  cancelLabel = 'Cancel',
  className,
  style,
}: WizardProps): React.ReactElement {
  const [currentStep, setCurrentStep] = useState(0);
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, onComplete]);

  const handlePrev = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirstStep]);

  const handleStepClick = useCallback((index: number) => {
    if (index < currentStep) {
      setCurrentStep(index);
    }
  }, [currentStep]);

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-6)',
        ...style,
      }}
    >
      {showStepIndicator && (
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          allowClickPrevious
        />
      )}

      <div style={{ flex: 1 }}>
        {children[currentStep]}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 'var(--ds-spacing-4)',
          borderTopWidth: 'var(--ds-border-width-default)',
          borderTopStyle: 'solid',
          borderTopColor: 'var(--ds-color-neutral-border-subtle)',
        }}
      >
        <div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
                fontSize: 'var(--ds-font-size-sm)',
                color: 'var(--ds-color-neutral-text-subtle)',
                backgroundColor: 'transparent',
                borderWidth: '0',
                cursor: 'pointer',
              }}
            >
              {cancelLabel}
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
          {!isFirstStep && (
            <button
              type="button"
              onClick={handlePrev}
              style={{
                padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                color: 'var(--ds-color-neutral-text-default)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                borderWidth: 'var(--ds-border-width-default)',
                borderStyle: 'solid',
                borderColor: 'var(--ds-color-neutral-border-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                cursor: 'pointer',
              }}
            >
              {prevLabel}
            </button>
          )}

          {allowSkip && !isLastStep && steps[currentStep]?.optional && (
            <button
              type="button"
              onClick={handleNext}
              style={{
                padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
                fontSize: 'var(--ds-font-size-sm)',
                color: 'var(--ds-color-neutral-text-subtle)',
                backgroundColor: 'transparent',
                borderWidth: '0',
                cursor: 'pointer',
              }}
            >
              Skip
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            style={{
              padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
              fontSize: 'var(--ds-font-size-sm)',
              fontWeight: 'var(--ds-font-weight-medium)',
              color: 'white',
              backgroundColor: 'var(--ds-color-accent-base-default)',
              borderWidth: '0',
              borderRadius: 'var(--ds-border-radius-md)',
              cursor: 'pointer',
            }}
          >
            {isLastStep ? completeLabel : nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// useWizard Hook
// =============================================================================

export function useWizard(totalSteps: number) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const nextStep = useCallback(() => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
  }, []);

  return {
    currentStep,
    completedSteps,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
    goToStep,
    nextStep,
    prevStep,
    reset,
  };
}

export default { Stepper, Wizard, useWizard };
