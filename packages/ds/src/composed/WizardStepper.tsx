/**
 * WizardStepper Component
 *
 * Unified horizontal pill-style stepper for all wizards
 * Consolidates best features from Stepper, Wizard, WizardStepper, and BookingStepper
 *
 * Features:
 * - Horizontal pill layout (compact, mobile-friendly)
 * - Optional step progress indicator
 * - Error state per step
 * - i18n support
 * - Clickable completed steps for navigation
 * - Optional icons per step
 * - Accessible with keyboard navigation
 *
 * @module @xala/ds/composed/WizardStepper
 */

import React from 'react';
import { useT } from '@xala/i18n';
import { CheckIcon } from '../primitives/icons';

// =============================================================================
// Types
// =============================================================================

export interface WizardStep {
  /** Unique step identifier */
  id: string;
  /** Step label (should be translated by caller) */
  label: string;
  /** Optional step icon */
  icon?: React.ReactNode;
  /** Optional step description */
  description?: string;
  /** Whether step is optional */
  optional?: boolean;
}

export type WizardStepState = 'completed' | 'active' | 'future' | 'error';

export interface WizardStepperProps {
  /** Array of wizard steps */
  steps: WizardStep[];
  /** Current step index (0-based) */
  currentStep: number;
  /** Callback when a completed step is clicked for navigation */
  onStepClick?: (stepIndex: number) => void;
  /** Step errors by step ID */
  errors?: Record<string, string[]>;
  /** Whether to show progress text (e.g., "Step 2 of 4") */
  showProgress?: boolean;
  /** Optional title above the stepper */
  title?: string;
  /** Visual size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'pill' | 'connected';
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

// =============================================================================
// Size configurations
// =============================================================================

const sizeConfig = {
  sm: {
    circleSize: '20px',
    fontSize: 'var(--ds-font-size-xs)',
    iconSize: 12,
    padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
    gap: 'var(--ds-spacing-1)',
  },
  md: {
    circleSize: '24px',
    fontSize: 'var(--ds-font-size-sm)',
    iconSize: 14,
    padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
    gap: 'var(--ds-spacing-2)',
  },
  lg: {
    circleSize: '32px',
    fontSize: 'var(--ds-font-size-md)',
    iconSize: 18,
    padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
    gap: 'var(--ds-spacing-3)',
  },
};

// =============================================================================
// Helper function
// =============================================================================

function getStepState(
  stepIndex: number,
  currentStep: number,
  stepId: string,
  errors?: Record<string, string[]>
): WizardStepState {
  if (errors?.[stepId]?.length) return 'error';
  if (stepIndex < currentStep) return 'completed';
  if (stepIndex === currentStep) return 'active';
  return 'future';
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * WizardStepper - Horizontal pill-style step indicator
 *
 * @example Basic usage
 * ```tsx
 * <WizardStepper
 *   steps={[
 *     { id: 'select', label: 'Velg' },
 *     { id: 'details', label: 'Detaljer' },
 *     { id: 'confirm', label: 'Bekreft' },
 *   ]}
 *   currentStep={1}
 *   onStepClick={(index) => setStep(index)}
 * />
 * ```
 *
 * @example With errors and progress
 * ```tsx
 * <WizardStepper
 *   steps={steps}
 *   currentStep={currentStep}
 *   errors={{ details: ['Felt er påkrevd'] }}
 *   showProgress
 *   title="Bookingprosess"
 * />
 * ```
 */
export function WizardStepper({
  steps,
  currentStep,
  onStepClick,
  errors = {},
  showProgress = true,
  title,
  size = 'md',
  variant = 'pill',
  className,
  style,
}: WizardStepperProps): React.ReactElement {
  const t = useT();
  const config = sizeConfig[size];

  // Get progress text, fallback if t() doesn't have the key
  const progressText = t('wizard.stepProgress', {
    current: String(currentStep + 1),
    total: String(steps.length)
  });
  const fallbackProgress = `Steg ${currentStep + 1} av ${steps.length}`;
  const displayProgress = progressText.includes('wizard.stepProgress') ? fallbackProgress : progressText;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-3)',
        ...style,
      }}
    >
      {/* Header with title and progress */}
      {(title || showProgress) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: title ? 'space-between' : 'flex-end'
        }}>
          {title && (
            <span
              style={{
                fontSize: 'var(--ds-font-size-md)',
                fontWeight: 600,
                color: 'var(--ds-color-neutral-text-default)',
              }}
            >
              {title}
            </span>
          )}
          {showProgress && (
            <span
              style={{
                fontSize: 'var(--ds-font-size-xs)',
                color: 'var(--ds-color-neutral-text-subtle)',
                backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                borderRadius: 'var(--ds-border-radius-full)',
              }}
            >
              {displayProgress}
            </span>
          )}
        </div>
      )}

      {/* Step pills - horizontal layout */}
      <div
        role="navigation"
        aria-label={title || t('wizard.navigation') || 'Wizard navigation'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: variant === 'connected' ? '0' : 'var(--ds-spacing-1)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          padding: variant === 'pill' ? 'var(--ds-spacing-1)' : '0',
          overflowX: 'auto',
          border: variant === 'pill' ? '1px solid var(--ds-color-neutral-border-subtle)' : 'none',
        }}
      >
        {steps.map((step, index) => {
          const state = getStepState(index, currentStep, step.id, errors);
          const isClickable = onStepClick && index < currentStep;
          const isLast = index === steps.length - 1;

          // Step pill background
          const backgroundColor =
            state === 'active' ? 'var(--ds-color-accent-surface-default)' :
            state === 'completed' ? 'var(--ds-color-success-surface-default)' :
            state === 'error' ? 'var(--ds-color-danger-surface-default)' :
            'transparent';

          // Circle background
          const circleBackground =
            state === 'completed' ? 'var(--ds-color-success-base-default)' :
            state === 'active' ? 'var(--ds-color-accent-base-default)' :
            state === 'error' ? 'var(--ds-color-danger-base-default)' :
            'var(--ds-color-neutral-border-default)';

          // Text color
          const textColor =
            state === 'active' ? 'var(--ds-color-accent-text-default)' :
            state === 'completed' ? 'var(--ds-color-success-text-default)' :
            state === 'error' ? 'var(--ds-color-danger-text-default)' :
            'var(--ds-color-neutral-text-subtle)';

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={isClickable ? () => onStepClick(index) : undefined}
                disabled={!isClickable}
                type="button"
                aria-current={state === 'active' ? 'step' : undefined}
                aria-label={`${step.label}${step.optional ? ` (${t('common.optional') || 'valgfri'})` : ''}`}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: config.gap,
                  padding: config.padding,
                  borderRadius: 'var(--ds-border-radius-sm)',
                  backgroundColor,
                  border: 'none',
                  cursor: isClickable ? 'pointer' : 'default',
                  transition: 'all 150ms ease',
                  opacity: state === 'future' ? 0.6 : 1,
                  minWidth: 0,
                }}
              >
                {/* Step circle with icon/number */}
                <div
                  style={{
                    width: config.circleSize,
                    height: config.circleSize,
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: circleBackground,
                    color: state === 'completed' || state === 'active' || state === 'error'
                      ? 'white'
                      : 'var(--ds-color-neutral-text-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: config.fontSize,
                    fontWeight: 500,
                    flexShrink: 0,
                  }}
                >
                  {state === 'error' ? (
                    <span style={{ fontWeight: 700 }}>!</span>
                  ) : state === 'completed' ? (
                    <CheckIcon size={config.iconSize} />
                  ) : step.icon ? (
                    <span style={{ display: 'flex', fontSize: config.iconSize }}>{step.icon}</span>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Step label */}
                <span
                  style={{
                    fontSize: config.fontSize,
                    color: textColor,
                    fontWeight: state === 'active' ? 600 : 400,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {step.label}
                </span>
              </button>

              {/* Connecting line for 'connected' variant */}
              {variant === 'connected' && !isLast && (
                <div
                  style={{
                    flex: '0 0 auto',
                    width: 'var(--ds-spacing-4)',
                    height: '2px',
                    backgroundColor: state === 'completed'
                      ? 'var(--ds-color-success-border-default)'
                      : 'var(--ds-color-neutral-border-subtle)',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default WizardStepper;
