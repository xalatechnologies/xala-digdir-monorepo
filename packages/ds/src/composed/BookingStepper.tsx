/**
 * BookingStepper
 *
 * Horizontal step indicator for booking flow.
 * Shows progress through booking steps with icons.
 */
import * as React from 'react';
import { Paragraph } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import { CheckIcon, CalendarIcon } from '../primitives/icons';
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

// Step icons based on step ID
function CalendarStepIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function DetailsStepIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function SendStepIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function DoneStepIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 12 15 16 10" />
    </svg>
  );
}

// Map step IDs to icons
function getStepIcon(stepId: string, size: number = 18) {
  switch (stepId) {
    case 'select':
      return <CalendarStepIcon size={size} />;
    case 'details':
      return <DetailsStepIcon size={size} />;
    case 'confirm':
      return <SendStepIcon size={size} />;
    case 'send':
      return <DoneStepIcon size={size} />;
    default:
      return null;
  }
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
      {/* Header with title and step counter */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--ds-spacing-4)',
        }}
      >
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            fontWeight: 'var(--ds-font-weight-semibold)',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          Bookingprosess
        </Paragraph>
        <Paragraph
          data-size="xs"
          style={{
            margin: 0,
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          Steg {currentStep + 1} av {steps.length}
        </Paragraph>
      </div>

      {/* Steps */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
        }}
      >
        {steps.map((step, index) => {
          const state = getStepState(index);
          const isLast = index === steps.length - 1;
          const isClickable = onStepClick && index < currentStep;
          const icon = getStepIcon(step.id);

          return (
            <div
              key={step.id}
              className="booking-stepper-step"
              style={{ flex: isLast ? '0 0 auto' : 1, display: 'flex', alignItems: 'flex-start' }}
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
                  minWidth: '70px',
                }}
              >
                {/* Circle with icon */}
                <div
                  className="booking-stepper-circle"
                  data-state={state}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--ds-border-radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor:
                      state === 'active'
                        ? 'var(--ds-color-accent-base-default)'
                        : state === 'completed'
                        ? 'var(--ds-color-success-surface-default)'
                        : 'var(--ds-color-neutral-surface-default)',
                    color:
                      state === 'active'
                        ? 'var(--ds-color-accent-contrast-default)'
                        : state === 'completed'
                        ? 'var(--ds-color-success-base-default)'
                        : 'var(--ds-color-neutral-text-subtle)',
                    border:
                      state === 'active'
                        ? 'none'
                        : state === 'completed'
                        ? '2px solid var(--ds-color-success-border-subtle)'
                        : '2px solid var(--ds-color-neutral-border-subtle)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {state === 'completed' ? (
                    <CheckIcon size={20} />
                  ) : icon ? (
                    icon
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
                        : 'var(--ds-font-weight-regular)',
                    textAlign: 'center',
                    maxWidth: '80px',
                    lineHeight: 1.3,
                  }}
                >
                  {step.label}
                </Paragraph>
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div
                  className="booking-stepper-line"
                  style={{
                    flex: 1,
                    height: '2px',
                    backgroundColor:
                      state === 'completed'
                        ? 'var(--ds-color-success-border-default)'
                        : 'var(--ds-color-neutral-border-subtle)',
                    marginTop: '22px',
                    marginLeft: 'var(--ds-spacing-2)',
                    marginRight: 'var(--ds-spacing-2)',
                    transition: 'background-color 0.3s ease',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BookingStepper;
