/**
 * WizardStepper - Multi-step wizard stepper component
 */

import React from 'react';
import { Paragraph } from '@digdir/designsystemet-react';

export interface WizardStep {
  id: string | number;
  title: string;
  description?: string;
}

export interface WizardStepperProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function WizardStepper({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  className,
}: WizardStepperProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        gap: 'var(--ds-spacing-4)',
        alignItems: isHorizontal ? 'center' : 'flex-start',
      }}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isClickable = onStepClick && (isCompleted || isCurrent);

        return (
          <React.Fragment key={step.id}>
            {index > 0 && (
              <div
                style={{
                  flex: isHorizontal ? 1 : undefined,
                  height: isHorizontal ? '2px' : 'var(--ds-spacing-6)',
                  width: isHorizontal ? undefined : '2px',
                  backgroundColor: isCompleted ? 'var(--ds-color-accent-border-default)' : 'var(--ds-color-neutral-border-default)',
                  marginLeft: isHorizontal ? undefined : 'calc(12px + var(--ds-spacing-2))',
                }}
              />
            )}
            <button
              type="button"
              onClick={isClickable ? () => onStepClick(index) : undefined}
              disabled={!isClickable}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                background: 'none',
                border: 'none',
                cursor: isClickable ? 'pointer' : 'default',
                padding: 0,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: isCompleted || isCurrent
                    ? 'var(--ds-color-accent-surface-default)'
                    : 'var(--ds-color-neutral-surface-hover)',
                  color: isCompleted || isCurrent
                    ? 'var(--ds-color-accent-text-default)'
                    : 'var(--ds-color-neutral-text-subtle)',
                  border: isCurrent
                    ? '2px solid var(--ds-color-accent-border-default)'
                    : 'none',
                }}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <div style={{ textAlign: 'left' }}>
                <Paragraph
                  size="sm"
                  style={{
                    fontWeight: isCurrent ? 600 : 400,
                    color: isCurrent ? 'var(--ds-color-neutral-text-default)' : 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {step.title}
                </Paragraph>
                {step.description && (
                  <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {step.description}
                  </Paragraph>
                )}
              </div>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
