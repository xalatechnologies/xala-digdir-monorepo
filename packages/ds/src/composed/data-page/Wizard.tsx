/**
 * Wizard Components
 * 
 * Generalized wizard components for multi-step forms
 * Based on patterns from apps/minside/src/features/rental-objects/components/wizard/
 */

import React from 'react';
import { Button, Heading, Paragraph, Badge } from '@xala/ds';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from '@xala/ds';
import { cn } from '../../utils';

export interface WizardStep {
  /** Unique step identifier */
  id: string;
  /** Step label (must be translated by caller) */
  label: string;
  /** Optional step icon */
  icon?: React.ReactNode;
  /** Whether step is optional */
  optional?: boolean;
}

export interface WizardProps {
  /** Array of wizard steps */
  steps: WizardStep[];
  /** Current step index */
  currentStep: number;
  /** Step change handler */
  onStepChange: (stepIndex: number) => void;
  /** Step content renderer */
  renderStep: (step: WizardStep, stepIndex: number) => React.ReactNode;
  /** Whether wizard is loading */
  isLoading?: boolean;
  /** Loading message (must be translated by caller) */
  loadingMessage?: string;
  /** Whether current step can proceed */
  canGoNext?: boolean;
  /** Whether current step can go back */
  canGoPrev?: boolean;
  /** Whether current step is the last step */
  isLastStep?: boolean;
  /** Step errors by step ID */
  errors?: Record<string, string[]>;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

export interface WizardStepperProps {
  /** Array of wizard steps */
  steps: WizardStep[];
  /** Current step index */
  currentStep: number;
  /** Step click handler (for navigating to completed steps) */
  onStepClick?: (stepIndex: number) => void;
  /** Wizard title (must be translated by caller) */
  title?: string;
  /** Whether to show step counter */
  showStepCounter?: boolean;
  /** Step errors by step ID */
  errors?: Record<string, string[]>;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

export interface WizardNavigationProps {
  /** Whether can go to previous step */
  canGoPrev: boolean;
  /** Whether can go to next step */
  canGoNext: boolean;
  /** Whether current step is the last step */
  isLastStep: boolean;
  /** Previous step handler */
  onPrev: () => void;
  /** Next step handler */
  onNext: () => void;
  /** Cancel handler */
  onCancel: () => void;
  /** Save draft handler */
  onSaveDraft?: () => void;
  /** Complete handler (for last step) */
  onComplete?: () => void;
  /** Previous button label (must be translated by caller) */
  prevLabel?: string;
  /** Next button label (must be translated by caller) */
  nextLabel?: string;
  /** Cancel button label (must be translated by caller) */
  cancelLabel?: string;
  /** Save draft button label (must be translated by caller) */
  saveDraftLabel?: string;
  /** Complete button label (must be translated by caller) */
  completeLabel?: string;
  /** Whether navigation is disabled (e.g., during save) */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

function getStepState(
  stepIndex: number,
  currentStep: number,
  stepId: string,
  errors?: Record<string, string[]>
): 'completed' | 'active' | 'future' | 'error' {
  if (errors?.[stepId]?.length) return 'error';
  if (stepIndex < currentStep) return 'completed';
  if (stepIndex === currentStep) return 'active';
  return 'future';
}

export function WizardStepper({
  steps,
  currentStep,
  onStepClick,
  title,
  showStepCounter = true,
  errors,
  className,
  style,
}: WizardStepperProps): React.ReactElement {
  return (
    <div
      className={cn('wizard-stepper', className)}
      style={{
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderBottom: '1px solid var(--ds-color-neutral-border-default)',
        padding: 'var(--ds-spacing-6) var(--ds-spacing-8)',
        overflowX: 'auto',
        ...style,
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        {(title || showStepCounter) && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--ds-spacing-4)',
            }}
          >
            {title && (
              <Heading level={3} data-size="xs" style={{ margin: 0 }}>
                {title}
              </Heading>
            )}
            {showStepCounter && (
              <Badge color="neutral" size="sm">
                Steg {currentStep + 1} av {steps.length}
              </Badge>
            )}
          </div>
        )}

        {/* Steps */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-2)',
            position: 'relative',
          }}
        >
          {steps.map((step, index) => {
            const state = getStepState(index, currentStep, step.id, errors);
            const isLast = index === steps.length - 1;
            const isClickable = onStepClick && index < currentStep;

            const circleStyle: React.CSSProperties = {
              width: '40px',
              height: '40px',
              borderRadius: 'var(--ds-border-radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'var(--ds-font-weight-semibold)',
              fontSize: 'var(--ds-font-size-sm)',
              border: '2px solid',
              transition: 'all 0.2s ease',
            };

            if (state === 'completed') {
              circleStyle.backgroundColor = 'var(--ds-color-success-surface-default)';
              circleStyle.borderColor = 'var(--ds-color-success-border-default)';
              circleStyle.color = 'var(--ds-color-success-text-default)';
            } else if (state === 'active') {
              circleStyle.backgroundColor = 'var(--ds-color-brand-surface-default)';
              circleStyle.borderColor = 'var(--ds-color-brand-border-default)';
              circleStyle.color = 'var(--ds-color-brand-text-default)';
            } else if (state === 'error') {
              circleStyle.backgroundColor = 'var(--ds-color-danger-surface-default)';
              circleStyle.borderColor = 'var(--ds-color-danger-border-default)';
              circleStyle.color = 'var(--ds-color-danger-text-default)';
            } else {
              circleStyle.backgroundColor = 'var(--ds-color-neutral-surface-default)';
              circleStyle.borderColor = 'var(--ds-color-neutral-border-default)';
              circleStyle.color = 'var(--ds-color-neutral-text-subtle)';
            }

            return (
              <React.Fragment key={step.id}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-1)',
                    minWidth: '80px',
                  }}
                >
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
                      ...circleStyle,
                      cursor: isClickable ? 'pointer' : 'default',
                    }}
                  >
                    {state === 'completed' ? (
                      <CheckIcon size={20} />
                    ) : step.icon ? (
                      step.icon
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <Paragraph
                    data-size="xs"
                    style={{
                      margin: 0,
                      textAlign: 'center',
                      color:
                        state === 'active'
                          ? 'var(--ds-color-brand-text-default)'
                          : state === 'error'
                          ? 'var(--ds-color-danger-text-default)'
                          : 'var(--ds-color-neutral-text-subtle)',
                      fontWeight: state === 'active' ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-regular)',
                    }}
                  >
                    {step.label}
                  </Paragraph>
                </div>
                {!isLast && (
                  <div
                    style={{
                      flex: 1,
                      height: '2px',
                      backgroundColor:
                        index < currentStep
                          ? 'var(--ds-color-success-border-default)'
                          : 'var(--ds-color-neutral-border-subtle)',
                      margin: '0 var(--ds-spacing-2)',
                      minWidth: '40px',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function WizardNavigation({
  canGoPrev,
  canGoNext,
  isLastStep,
  onPrev,
  onNext,
  onCancel,
  onSaveDraft,
  onComplete,
  prevLabel = 'Forrige',
  nextLabel = 'Neste',
  cancelLabel = 'Avbryt',
  saveDraftLabel = 'Lagre utkast',
  completeLabel = 'Fullfør',
  disabled = false,
  className,
  style,
}: WizardNavigationProps): React.ReactElement {
  return (
    <div
      className={cn('wizard-navigation', className)}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--ds-spacing-6) var(--ds-spacing-8)',
        borderTop: '1px solid var(--ds-color-neutral-border-default)',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        ...style,
      }}
    >
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
        <Button variant="tertiary" onClick={onCancel} disabled={disabled}>
          {cancelLabel}
        </Button>
        {onSaveDraft && (
          <Button variant="secondary" onClick={onSaveDraft} disabled={disabled}>
            {saveDraftLabel}
          </Button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
        {canGoPrev && (
          <Button variant="secondary" onClick={onPrev} disabled={disabled}>
            <ChevronLeftIcon />
            {prevLabel}
          </Button>
        )}
        {isLastStep ? (
          onComplete && (
            <Button variant="primary" onClick={onComplete} disabled={disabled || !canGoNext}>
              {completeLabel}
            </Button>
          )
        ) : (
          <Button variant="primary" onClick={onNext} disabled={disabled || !canGoNext}>
            {nextLabel}
            <ChevronRightIcon />
          </Button>
        )}
      </div>
    </div>
  );
}

export function Wizard({
  steps,
  currentStep,
  onStepChange,
  renderStep,
  isLoading = false,
  loadingMessage,
  canGoNext = true,
  canGoPrev = true,
  isLastStep = false,
  errors,
  className,
  style,
}: WizardProps): React.ReactElement {
  const currentStepData = steps[currentStep];

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--ds-spacing-10)',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        <Paragraph>{loadingMessage || 'Laster...'}</Paragraph>
      </div>
    );
  }

  return (
    <div className={cn('wizard', className)} style={{ display: 'flex', flexDirection: 'column', height: '100%', ...style }}>
      {/* Stepper */}
      <WizardStepper
        steps={steps}
        currentStep={currentStep}
        onStepClick={onStepChange}
        errors={errors}
      />

      {/* Step Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--ds-spacing-8)',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {currentStepData && renderStep(currentStepData, currentStep)}
        </div>
      </div>
    </div>
  );
}
