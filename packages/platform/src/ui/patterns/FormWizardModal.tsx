/**
 * FormWizardModal
 *
 * A domain-neutral modal wizard component for multi-step forms.
 * Props-driven design that accepts steps array and handles navigation.
 *
 * This component is designed to be used across any domain:
 * - Resource reservation flows
 * - Registration processes
 * - Configuration wizards
 * - Onboarding flows
 *
 * All text content is pre-localized - pass labels prop for i18n support.
 *
 * @example
 * ```tsx
 * const steps: PatternWizardStep[] = [
 *   { id: 'details', title: 'Details', isActive: true },
 *   { id: 'confirm', title: 'Confirm' },
 *   { id: 'complete', title: 'Complete' },
 * ];
 *
 * <FormWizardModal
 *   isOpen={showWizard}
 *   steps={steps}
 *   currentStepIndex={0}
 *   title="Create New Item"
 *   onNext={() => setStep(step + 1)}
 *   onBack={() => setStep(step - 1)}
 *   onComplete={handleSubmit}
 *   onClose={() => setShowWizard(false)}
 * >
 *   <StepContent />
 * </FormWizardModal>
 * ```
 */
import * as React from 'react';
import { Dialog, Heading, Paragraph, Button } from '@digdir/designsystemet-react';
import type { PatternWizardStep } from './types';
import { cn } from './utils';

// ============================================================================
// Types
// ============================================================================

/** Labels for localization */
export interface FormWizardModalLabels {
  /** Back button label (default: "Back") */
  back?: string;
  /** Next button label (default: "Next") */
  next?: string;
  /** Complete button label (default: "Complete") */
  complete?: string;
  /** Cancel button label (default: "Cancel") */
  cancel?: string;
  /** Step indicator text template (default: "Step {current} of {total}") */
  stepOf?: string;
}

/** FormWizardModal props interface */
export interface FormWizardModalProps {
  /** Whether the modal is open */
  isOpen: boolean;

  /** Array of wizard steps */
  steps: PatternWizardStep[];

  /** Current step index (0-based) */
  currentStepIndex: number;

  /** Modal title */
  title: string;

  /** Step content */
  children: React.ReactNode;

  /** Localized labels for buttons and indicators */
  labels?: FormWizardModalLabels;

  /** Show step indicator (default: true) */
  showStepIndicator?: boolean;

  /** Whether back navigation is available (default: currentStepIndex > 0) */
  canGoBack?: boolean;

  /** Whether next navigation is available (default: true) */
  canGoNext?: boolean;

  /** Whether the completion action is in progress */
  isCompleting?: boolean;

  /** Subtitle displayed under the title (optional) */
  subtitle?: string;

  /** Custom class name */
  className?: string;

  // ========== Event Handlers ==========

  /** Handler for back navigation */
  onBack?: () => void;

  /** Handler for next navigation */
  onNext?: () => void;

  /** Handler for completing the wizard (final step) */
  onComplete?: () => void;

  /** Handler for closing/canceling the modal */
  onClose?: () => void;
}

// ============================================================================
// Icons (inline SVG for portability)
// ============================================================================

const CloseIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CheckIcon = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ============================================================================
// Sub-components
// ============================================================================

/** Step indicator dot */
interface StepIndicatorDotProps {
  step: PatternWizardStep;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  totalSteps: number;
}

function StepIndicatorDot({
  step,
  index,
  isActive,
  isCompleted,
}: StepIndicatorDotProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--ds-spacing-1)',
      }}
    >
      {/* Dot/Circle */}
      <div
        style={{
          width: 'var(--ds-spacing-8)',
          height: 'var(--ds-spacing-8)',
          borderRadius: 'var(--ds-border-radius-full)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--ds-font-size-sm)',
          fontWeight: 600,
          transition: 'all 0.2s ease',
          backgroundColor: isCompleted
            ? 'var(--ds-color-success-base-default)'
            : isActive
              ? 'var(--ds-color-accent-base-default)'
              : 'var(--ds-color-neutral-surface-hover)',
          color: isCompleted || isActive
            ? 'var(--ds-color-neutral-background-default)'
            : 'var(--ds-color-neutral-text-subtle)',
          border: step.isDisabled
            ? '2px dashed var(--ds-color-neutral-border-default)'
            : 'none',
        }}
        aria-current={isActive ? 'step' : undefined}
      >
        {isCompleted ? <CheckIcon /> : index + 1}
      </div>

      {/* Label */}
      <span
        style={{
          fontSize: 'var(--ds-font-size-xs)',
          fontWeight: isActive ? 600 : 400,
          color: isActive
            ? 'var(--ds-color-neutral-text-default)'
            : 'var(--ds-color-neutral-text-subtle)',
          whiteSpace: 'nowrap',
          maxWidth: '80px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textAlign: 'center',
        }}
      >
        {step.title}
      </span>
    </div>
  );
}

/** Step indicator connector line */
function StepConnector({ isCompleted }: { isCompleted: boolean }) {
  return (
    <div
      style={{
        flex: 1,
        height: '2px',
        marginTop: 'calc(var(--ds-spacing-4) - 1px)',
        marginLeft: 'var(--ds-spacing-1)',
        marginRight: 'var(--ds-spacing-1)',
        backgroundColor: isCompleted
          ? 'var(--ds-color-success-base-default)'
          : 'var(--ds-color-neutral-border-subtle)',
        transition: 'background-color 0.2s ease',
      }}
    />
  );
}

/** Full step indicator component */
interface StepIndicatorProps {
  steps: PatternWizardStep[];
  currentStepIndex: number;
  stepOfLabel?: string;
}

function StepIndicator({
  steps,
  currentStepIndex,
  stepOfLabel = 'Step {current} of {total}',
}: StepIndicatorProps) {
  // Format step indicator text
  const stepText = stepOfLabel
    .replace('{current}', String(currentStepIndex + 1))
    .replace('{total}', String(steps.length));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-3)',
        padding: 'var(--ds-spacing-4) var(--ds-spacing-6)',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
      }}
    >
      {/* Step text indicator (mobile-friendly) */}
      <Paragraph
        data-size="sm"
        style={{
          margin: 0,
          color: 'var(--ds-color-neutral-text-subtle)',
          textAlign: 'center',
        }}
      >
        {stepText}
      </Paragraph>

      {/* Visual step indicator (hidden on very small screens) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <StepIndicatorDot
              step={step}
              index={index}
              isActive={index === currentStepIndex}
              isCompleted={step.isCompleted ?? index < currentStepIndex}
              totalSteps={steps.length}
            />
            {index < steps.length - 1 && (
              <StepConnector isCompleted={index < currentStepIndex} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function FormWizardModal({
  isOpen,
  steps,
  currentStepIndex,
  title,
  children,
  labels = {},
  showStepIndicator = true,
  canGoBack,
  canGoNext = true,
  isCompleting = false,
  subtitle,
  className,
  onBack,
  onNext,
  onComplete,
  onClose,
}: FormWizardModalProps): React.ReactElement {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  // Default labels
  const mergedLabels: Required<FormWizardModalLabels> = {
    back: labels.back ?? 'Back',
    next: labels.next ?? 'Next',
    complete: labels.complete ?? 'Complete',
    cancel: labels.cancel ?? 'Cancel',
    stepOf: labels.stepOf ?? 'Step {current} of {total}',
  };

  // Derived state
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const effectiveCanGoBack = canGoBack ?? !isFirstStep;

  // Control dialog visibility
  React.useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.showModal();
    } else if (!isOpen && dialogRef.current && dialogRef.current.open) {
      dialogRef.current.close();
    }
  }, [isOpen]);

  // Handle dialog close event
  const handleDialogClose = () => {
    onClose?.();
  };

  // Handle action button click
  const handlePrimaryAction = () => {
    if (isLastStep) {
      onComplete?.();
    } else {
      onNext?.();
    }
  };

  return (
    <Dialog
      ref={dialogRef}
      className={cn('form-wizard-modal', className)}
      closedby="closerequest"
      onClose={handleDialogClose}
      style={{
        maxWidth: '600px',
        width: '95vw',
        maxHeight: '90vh',
        borderRadius: 'var(--ds-border-radius-xl)',
        padding: 0,
        border: 'none',
        boxShadow: 'var(--ds-shadow-xl)',
      }}
    >
      {/* Modal Header */}
      <div
        style={{
          padding: 'var(--ds-spacing-5) var(--ds-spacing-6)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          borderRadius: 'var(--ds-border-radius-xl) var(--ds-border-radius-xl) 0 0',
        }}
      >
        <div>
          <Heading level={2} data-size="md" style={{ margin: 0 }}>
            {title}
          </Heading>
          {subtitle && (
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                marginTop: 'var(--ds-spacing-1)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {subtitle}
            </Paragraph>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            border: 'none',
            borderRadius: 'var(--ds-border-radius-full)',
            backgroundColor: 'transparent',
            color: 'var(--ds-color-neutral-text-subtle)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <CloseIcon size={20} />
        </button>
      </div>

      {/* Step Indicator */}
      {showStepIndicator && steps.length > 1 && (
        <StepIndicator
          steps={steps}
          currentStepIndex={currentStepIndex}
          stepOfLabel={mergedLabels.stepOf}
        />
      )}

      {/* Content Area */}
      <div
        style={{
          padding: 'var(--ds-spacing-6)',
          overflowY: 'auto',
          maxHeight: showStepIndicator ? 'calc(90vh - 280px)' : 'calc(90vh - 180px)',
        }}
      >
        {children}
      </div>

      {/* Modal Footer */}
      <div
        style={{
          padding: 'var(--ds-spacing-4) var(--ds-spacing-6)',
          borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          borderRadius: '0 0 var(--ds-border-radius-xl) var(--ds-border-radius-xl)',
        }}
      >
        {/* Left side: Cancel or Back */}
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
          <Button type="button" variant="tertiary" onClick={onClose}>
            {mergedLabels.cancel}
          </Button>
          {effectiveCanGoBack && onBack && (
            <Button type="button" variant="secondary" onClick={onBack}>
              {mergedLabels.back}
            </Button>
          )}
        </div>

        {/* Right side: Next or Complete */}
        <Button
          type="button"
          variant="primary"
          data-color="accent"
          onClick={handlePrimaryAction}
          disabled={!canGoNext || isCompleting}
          aria-busy={isCompleting}
        >
          {isCompleting ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
              }}
            >
              <span
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid currentColor',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              {mergedLabels.complete}
            </span>
          ) : isLastStep ? (
            mergedLabels.complete
          ) : (
            mergedLabels.next
          )}
        </Button>
      </div>

      {/* Modal Styles */}
      <style>{`
        .form-wizard-modal::backdrop {
          background-color: var(--ds-color-neutral-background-overlay);
          backdrop-filter: blur(4px);
        }

        .form-wizard-modal button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        /* Animation */
        .form-wizard-modal[open] {
          animation: modal-fade-in 0.2s ease-out;
        }

        @keyframes modal-fade-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive */
        @media (max-width: 599px) {
          .form-wizard-modal {
            max-width: 100vw !important;
            width: 100vw !important;
            max-height: 100vh !important;
            height: 100vh !important;
            border-radius: 0 !important;
          }

          .form-wizard-modal > div:first-child,
          .form-wizard-modal > div:last-child {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </Dialog>
  );
}

export default FormWizardModal;
