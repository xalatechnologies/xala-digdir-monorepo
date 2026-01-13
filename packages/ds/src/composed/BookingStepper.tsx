/**
 * BookingStepper
 *
 * Horizontal step indicator for booking flow.
 * Shows progress through booking steps.
 */
import * as React from 'react';
import { Paragraph } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import { CheckIcon } from '../primitives/icons';
import type { BookingStep } from '../types/listing-detail';

export interface BookingStepperProps {
  /** Array of booking steps */
  steps: BookingStep[];
  /** Current step index (0-based) */
  currentStep: number;
  /** Callback when a step is clicked */
  onStepClick?: (stepIndex: number) => void;
  /** Custom class name */
  className?: string;
}

/**
 * BookingStepper component
 *
 * @example
 * ```tsx
 * <BookingStepper
 *   steps={[
 *     { id: 'select', label: 'Velg tidspunkter' },
 *     { id: 'details', label: 'Detaljer og vilkår' },
 *     { id: 'confirm', label: 'Bekreft' },
 *     { id: 'send', label: 'Send' },
 *   ]}
 *   currentStep={1}
 *   onStepClick={(index) => setCurrentStep(index)}
 * />
 * ```
 */
export function BookingStepper({
  steps,
  currentStep,
  onStepClick,
  className,
}: BookingStepperProps): React.ReactElement {
  const getStepState = (index: number): 'completed' | 'active' | 'future' => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'future';
  };

  return (
    <div className={cn('booking-stepper', className)}>
      {steps.map((step, index) => {
        const state = getStepState(index);
        const isLast = index === steps.length - 1;
        const isClickable = onStepClick && index <= currentStep;

        return (
          <div
            key={step.id}
            className="booking-stepper-step"
            style={{ flex: isLast ? '0 0 auto' : 1 }}
          >
            {/* Step circle and label */}
            <div
              onClick={isClickable ? () => onStepClick(index) : undefined}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={
                isClickable
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onStepClick(index);
                      }
                    }
                  : undefined
              }
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                cursor: isClickable ? 'pointer' : 'default',
              }}
            >
              {/* Circle */}
              <div
                className="booking-stepper-circle"
                data-state={state}
              >
                {state === 'completed' ? (
                  <CheckIcon size={16} />
                ) : (
                  index + 1
                )}
              </div>

              {/* Label */}
              <Paragraph
                data-size="xs"
                style={{
                  margin: 0,
                  color:
                    state === 'active'
                      ? 'var(--ds-color-accent-text-default)'
                      : state === 'completed'
                      ? 'var(--ds-color-success-text-default)'
                      : 'var(--ds-color-neutral-text-subtle)',
                  fontWeight:
                    state === 'active'
                      ? 'var(--ds-font-weight-medium)'
                      : 'inherit',
                  textAlign: 'center',
                  maxWidth: '80px',
                }}
              >
                {step.label}
              </Paragraph>
            </div>

            {/* Connecting line */}
            {!isLast && (
              <div
                className="booking-stepper-line"
                data-state={state === 'completed' ? 'completed' : undefined}
                style={{
                  marginTop: 'calc(var(--digilist-stepper-circle-size, 32px) / 2)',
                  transform: 'translateY(-50%)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default BookingStepper;
