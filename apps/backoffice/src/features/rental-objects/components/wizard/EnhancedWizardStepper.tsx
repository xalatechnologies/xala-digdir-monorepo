/**
 * Enhanced Wizard Stepper Component
 * Professional step indicator with smooth animations and better UX
 */

import { useT } from '@xala/i18n';
import { CheckIcon } from '@xala/ds';
import type { WizardStep } from '../../types';
import { WIZARD_ICONS } from './WizardIcons';

interface EnhancedWizardStepperProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick: (step: number) => void;
  errors: Record<string, string[]>;
}

export function EnhancedWizardStepper({
  steps,
  currentStep,
  onStepClick,
  errors,
}: EnhancedWizardStepperProps): React.ReactElement {
  const t = useT();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-3)',
      }}
    >
      {/* Progress indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: 'var(--ds-font-size-body-xs)',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {t('wizard.stepProgress', { current: currentStep + 1, total: steps.length })}
        </span>
      </div>

      {/* Step pills - horizontal layout */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-1)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          padding: 'var(--ds-spacing-1)',
          overflowX: 'auto',
        }}
      >
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const hasErrors = (errors[step.id]?.length ?? 0) > 0;
        const isClickable = index <= currentStep;
        const Icon = WIZARD_ICONS[step.id] || WIZARD_ICONS['basics'];

        return (
          <button
            key={step.id}
            onClick={() => isClickable && onStepClick(index)}
            disabled={!isClickable}
            type="button"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--ds-spacing-2)',
              padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
              borderRadius: 'var(--ds-border-radius-sm)',
              backgroundColor: isActive
                ? 'var(--ds-color-accent-surface-default)'
                : isCompleted
                  ? 'var(--ds-color-success-surface-default)'
                  : 'transparent',
              border: 'none',
              cursor: isClickable ? 'pointer' : 'not-allowed',
              transition: 'all 200ms ease',
              opacity: isClickable ? 1 : 0.6,
            }}
          >
            {/* Step icon/number */}
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor: isCompleted
                  ? 'var(--ds-color-success-base-default)'
                  : isActive
                    ? 'var(--ds-color-accent-base-default)'
                    : hasErrors
                      ? 'var(--ds-color-danger-base-default)'
                      : 'var(--ds-color-neutral-border-default)',
                color: isCompleted || isActive || hasErrors
                  ? 'white'
                  : 'var(--ds-color-neutral-text-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--ds-font-size-xs)',
                fontWeight: 'var(--ds-font-weight-medium)',
                flexShrink: 0,
              }}
            >
              {hasErrors ? (
                <span style={{ fontWeight: 'bold' }}>!</span>
              ) : isCompleted ? (
                <CheckIcon size={14} />
              ) : (
                <div style={{ display: 'flex' }}>{Icon}</div>
              )}
            </div>

            {/* Step label */}
            <span
              style={{
                margin: 0,
                fontSize: 'var(--ds-font-size-body-xs)',
                color: isActive
                  ? 'var(--ds-color-accent-text-default)'
                  : isCompleted
                    ? 'var(--ds-color-success-text-default)'
                    : hasErrors
                      ? 'var(--ds-color-danger-text-default)'
                      : 'var(--ds-color-neutral-text-subtle)',
                fontWeight: isActive ? 'var(--ds-font-weight-medium)' : 'var(--ds-font-weight-regular)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {t(`wizard.step.${step.id}`)}
            </span>
          </button>
        );
      })}
      </div>
    </div>
  );
}
