/**
 * Wizard Stepper Component
 * Visual step indicator for the rental object wizard
 */

import { useT } from '@xalatechnologies/platform/i18n';
import type { WizardStep } from '../../types';

interface WizardStepperProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick: (step: number) => void;
  title?: string;
  errors?: Record<string, string[]>;
}

export function WizardStepper({
  steps,
  currentStep,
  onStepClick,
  errors = {},
}: WizardStepperProps): React.ReactElement {
  const t = useT();

  return (
    <nav aria-label={t('wizard.ariaLabel')}>
      <ol
        style={{
          display: 'flex',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          gap: 'var(--ds-spacing-1)',
        }}
      >
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const hasError = errors[step.id]?.length > 0;

          return (
            <li
              key={step.id}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                onClick={() => onStepClick(index)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-2)',
                  padding: 'var(--ds-spacing-2)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  width: '100%',
                }}
                aria-current={isActive ? 'step' : undefined}
              >
                {/* Step indicator */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--ds-font-size-body-sm)',
                    fontWeight: 'var(--ds-font-weight-semibold)',
                    transition: 'all 0.2s ease',
                    backgroundColor: isActive
                      ? 'var(--ds-color-accent-base-default)'
                      : isCompleted
                        ? hasError
                          ? 'var(--ds-color-danger-base-default)'
                          : 'var(--ds-color-success-base-default)'
                        : hasError
                          ? 'var(--ds-color-danger-surface-default)'
                          : 'var(--ds-color-neutral-surface-default)',
                    color: isActive || isCompleted
                      ? 'white'
                      : hasError
                        ? 'var(--ds-color-danger-text-default)'
                        : 'var(--ds-color-neutral-text-default)',
                    border: hasError && !isCompleted
                      ? '2px solid var(--ds-color-danger-border-default)'
                      : isActive
                        ? '2px solid var(--ds-color-accent-base-default)'
                        : '2px solid var(--ds-color-neutral-border-subtle)',
                  }}
                >
                  {isCompleted ? (hasError ? '!' : t("ui.ok")) : index + 1}
                </div>

                {/* Step label */}
                <span
                  style={{
                    fontSize: 'var(--ds-font-size-body-xs)',
                    color: isActive
                      ? 'var(--ds-color-accent-text-default)'
                      : hasError
                        ? 'var(--ds-color-danger-text-default)'
                        : 'var(--ds-color-neutral-text-subtle)',
                    fontWeight: isActive ? 600 : 400,
                    textAlign: 'center',
                    maxWidth: '80px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t(`wizard.step.${step.id}`, step.labelNorwegian)}
                </span>

                {/* Progress bar to next step */}
                {index < steps.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      left: '50%',
                      width: '100%',
                      height: '2px',
                      backgroundColor: isCompleted
                        ? 'var(--ds-color-success-base-default)'
                        : 'var(--ds-color-neutral-border-subtle)',
                      zIndex: -1,
                    }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
