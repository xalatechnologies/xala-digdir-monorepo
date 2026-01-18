/**
 * Rental Object Wizard
 * Multi-step form for creating and editing rental objects
 * Category-aware wizard with dynamic steps based on rental object category
 */

import { useT } from '@xala/i18n';
import { Heading, Paragraph, Spinner } from '@xala/ds';
import { useRentalObjectWizard } from '../../hooks/useRentalObjectWizard';
import { WizardFooter } from './WizardFooter';
import { CategorySelector } from './steps/CategorySelector';
import { CloneSelectionStep } from './steps/CloneSelectionStep';
import { useState } from 'react';
import { BasicsStep } from './steps/BasicsStep';
import { MediaStep } from './steps/MediaStep';
import { PackagesStep } from './steps/PackagesStep';
import { ContentStep } from './steps/ContentStep';
import { ReviewStep } from './steps/ReviewStep';
import type { WizardStep } from '../../types';

export interface RentalObjectWizardProps {
  /** Rental object slug for edit mode */
  slug?: string | undefined;
}

export function RentalObjectWizard({ slug }: RentalObjectWizardProps) {
  const t = useT();
  // If slug is present, we are in edit mode, so clone selection is skipped.
  // If slug is explicitly undefined, we are modifying a new creation flow.
  const [isCloneStep, setIsCloneStep] = useState(!slug); 
  const wizard = useRentalObjectWizard({ slug });

  // Handle clone selection
  const handleCloneSelect = (_mode: 'create' | 'clone', _cloneSource?: any) => {
      // Logic to initialize wizard with clone data would go here
      // For now, we just exit the clone step to show the main wizard
      setIsCloneStep(false);
      // TODO: Populate form with cloneSource if mode === 'clone'
  };

  if (isCloneStep && !wizard.isLoading) {
      return <CloneSelectionStep onSelect={handleCloneSelect} />;
  }

  if (wizard.isLoading) {
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
        <Spinner aria-label={t('state.loading')} />
        <Paragraph>{t('state.loading')}</Paragraph>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderBottom: '1px solid var(--ds-color-neutral-border-default)',
          padding: 'var(--ds-spacing-6) var(--ds-spacing-8)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Heading level={1} data-size="lg" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            {wizard.isEditMode ? t('rentalObjects.editTitle') : t('rentalObjects.createTitle')}
          </Heading>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('rentalObjects.wizardDescription')}
          </Paragraph>
        </div>
      </div>

      {/* Stepper */}
      <div
        style={{
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderBottom: '1px solid var(--ds-color-neutral-border-default)',
          padding: 'var(--ds-spacing-6) var(--ds-spacing-8)',
          overflowX: 'auto',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <WizardStepper
            steps={wizard.steps}
            currentStep={wizard.currentStep}
            onStepClick={wizard.goToStep}
            errors={wizard.errors}
          />
        </div>
      </div>

      {/* Step Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--ds-spacing-8)',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {(() => {
            const step = wizard.steps[wizard.currentStep];
            return step ? renderStep(step, wizard) : null;
          })()}
        </div>
      </div>

      {/* Footer Navigation */}
      <WizardFooter wizard={wizard} />
    </div>
  );
}

interface WizardStepperProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick: (step: number) => void;
  errors: Record<string, string[]>;
}

import { WIZARD_ICONS } from './WizardIcons';

function WizardStepper({ steps, currentStep, onStepClick, errors }: WizardStepperProps) {
  const t = useT();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-2)',
        position: 'relative',
        overflowX: 'auto',
        paddingBottom: 'var(--ds-spacing-2)', // Scrollbar space
      }}
    >
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const hasErrors = errors[step.id]?.length > 0;
        const isClickable = index <= currentStep;
        const Icon = WIZARD_ICONS[step.id] || WIZARD_ICONS['basics'];

        return (
          <div
            key={step.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              flex: index === steps.length - 1 ? '0 0 auto' : '1 0 auto', // Last item doesn't stretch
              minWidth: '120px',
            }}
          >
            {/* Step Button */}
            <button
              onClick={() => isClickable && onStepClick(index)}
              disabled={!isClickable}
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-3)',
                border: 'none',
                background: 'transparent',
                cursor: isClickable ? 'pointer' : 'default',
                padding: 'var(--ds-spacing-2)',
                borderRadius: 'var(--ds-border-radius-md)',
                transition: 'all 0.2s ease',
                opacity: isClickable ? 1 : 0.5,
              }}
              onMouseEnter={(e) => {
                if (isClickable && !isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {/* Icon Circle */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: isActive
                    ? 'var(--ds-color-accent-base-default)'
                    : isCompleted
                      ? 'var(--ds-color-success-surface-subtle)'
                      : hasErrors
                        ? 'var(--ds-color-danger-surface-subtle)'
                        : 'var(--ds-color-neutral-surface-subtle)',
                  color: isActive
                    ? 'var(--ds-color-neutral-contrast-1)'
                    : isCompleted
                      ? 'var(--ds-color-success-text-default)'
                      : hasErrors
                        ? 'var(--ds-color-danger-text-default)'
                        : 'var(--ds-color-neutral-text-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: isActive
                    ? 'none'
                    : hasErrors
                      ? '1px solid var(--ds-color-danger-border-default)'
                      : isCompleted
                        ? '1px solid var(--ds-color-success-border-default)'
                        : '1px solid var(--ds-color-neutral-border-default)',
                  flexShrink: 0,
                }}
              >
                {/* Clone icon to enforce size if needed, or rely on CSS inheritance */}
                <div style={{ fontSize: 'var(--ds-font-size-5)', display: 'flex' }}>
                   {hasErrors ? '!' : isCompleted ? '✓' : Icon}
                </div>
              </div>

              {/* Label */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Paragraph
                  data-size="xs"
                  style={{
                    margin: 0,
                    whiteSpace: 'nowrap',
                    color: isActive
                      ? 'var(--ds-color-accent-text-default)'
                      : 'var(--ds-color-neutral-text-default)',
                    fontWeight: isActive ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-medium)',
                  }}
                >
                  {t(`wizard.step.${step.id}`)}
                </Paragraph>
              </div>
            </button>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                style={{
                  height: '1px',
                  flex: 1,
                  minWidth: '20px',
                  backgroundColor: index < currentStep
                    ? 'var(--ds-color-success-base-default)'
                    : 'var(--ds-color-neutral-border-default)',
                  margin: '0 var(--ds-spacing-2)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

import { DetailsStep } from './steps/DetailsStep';
import { ResourcesStep } from './steps/ResourcesStep';
import { AvailabilityStep } from './steps/AvailabilityStep';

function renderStep(step: WizardStep, wizard: ReturnType<typeof useRentalObjectWizard>) {
  switch (step.id) {
    case 'category':
      return <CategorySelector wizard={wizard} />;
    case 'basics':
      return <BasicsStep wizard={wizard} />;
    case 'details':
      return <DetailsStep wizard={wizard} />;
    case 'resources':
      return <ResourcesStep wizard={wizard} />;
    case 'availability':
      return <AvailabilityStep wizard={wizard} />;
    case 'packages':
      return <PackagesStep wizard={wizard} />;
    case 'media':
      return <MediaStep wizard={wizard} />;
    case 'content':
      return <ContentStep wizard={wizard} />;
    case 'review':
      return <ReviewStep wizard={wizard} />;
    default:
      return (
        <div style={{ padding: 'var(--ds-spacing-6)', textAlign: 'center' }}>
          <Paragraph>Step not implemented: {step.id}</Paragraph>
        </div>
      );
  }
}
