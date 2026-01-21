/**
 * Rental Object Wizard
 * Multi-step form for creating and editing rental objects
 * Category-aware wizard with dynamic steps based on rental object category
 */

import { useT } from '@xala/i18n';
import { Heading, Paragraph, Badge, Spinner } from '@xalatechnologies/platform/ui';
import { useRentalObjectWizard } from '@digilist/api/hooks/useRentalObjectWizard';
import { WizardFooter } from './WizardFooter';
import { CategorySelector } from './steps/CategorySelector';
import { BasicsStep } from './steps/BasicsStep';
import { MediaStep } from './steps/MediaStep';
import { LocationStep } from './steps/LocationStep';
import { CapacityStep } from './steps/CapacityStep';
import { InventoryStep } from './steps/InventoryStep';
import { OpeningHoursStep } from './steps/OpeningHoursStep';
import { PickupStep } from './steps/PickupStep';
import { RequirementsStep } from './steps/RequirementsStep';
import { PackagesStep } from './steps/PackagesStep';
import { ScheduleStep } from './steps/ScheduleStep';
import { BookingStep } from './steps/BookingStep';
import { ContentStep } from './steps/ContentStep';
import { CustodyStep } from './steps/CustodyStep';
import { ReviewStep } from './steps/ReviewStep';
import type { WizardStep } from '@digilist/api/types';

export interface RentalObjectWizardProps {
  /** Rental object slug for edit mode */
  slug?: string | undefined;
}

export function RentalObjectWizard({ slug }: RentalObjectWizardProps) {
  const t = useT();
  const wizard = useRentalObjectWizard({ slug });

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
        <Spinner size="lg" />
        <Paragraph>{t('common.loading')}</Paragraph>
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
          {renderStep(wizard.steps[wizard.currentStep], wizard)}
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

function WizardStepper({ steps, currentStep, onStepClick, errors }: WizardStepperProps) {
  const t = useT();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-2)',
        position: 'relative',
      }}
    >
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const hasErrors = errors[step.id]?.length > 0;
        const isClickable = index <= currentStep;

        return (
          <div
            key={step.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              flex: 1,
            }}
          >
            {/* Step Circle */}
            <button
              onClick={() => isClickable && onStepClick(index)}
              disabled={!isClickable}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                flex: 1,
                border: 'none',
                background: 'transparent',
                cursor: isClickable ? 'pointer' : 'default',
                padding: 'var(--ds-spacing-2)',
                borderRadius: 'var(--ds-border-radius-md)',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (isClickable) {
                  e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }} type="button"
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: isActive
                    ? 'var(--ds-color-accent-base-default)'
                    : isCompleted
                      ? 'var(--ds-color-success-base-default)'
                      : hasErrors
                        ? 'var(--ds-color-danger-base-default)'
                        : 'var(--ds-color-neutral-surface-hover)',
                  color: isActive || isCompleted || hasErrors
                    ? 'var(--ds-color-neutral-contrast-1)'
                    : 'var(--ds-color-neutral-text-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'var(--ds-font-weight-semibold)',
                  fontSize: 'var(--ds-font-size-sm)',
                  border: isActive ? '2px solid var(--ds-color-accent-border-strong)' : 'none',
                }}
              >
                {isCompleted ? '✓' : hasErrors ? '!' : index + 1}
              </div>

              <Paragraph
                data-size="xs"
                style={{
                  margin: 0,
                  textAlign: 'center',
                  color: isActive
                    ? 'var(--ds-color-accent-text-default)'
                    : 'var(--ds-color-neutral-text-subtle)',
                  fontWeight: isActive ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-regular)',
                }}
              >
                {t(`wizard.step.${step.id}`)}
              </Paragraph>
            </button>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                style={{
                  height: '2px',
                  flex: 1,
                  backgroundColor: index < currentStep
                    ? 'var(--ds-color-success-base-default)'
                    : 'var(--ds-color-neutral-border-default)',
                  margin: '0 var(--ds-spacing-2)',
                  marginTop: '-24px',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function renderStep(step: WizardStep, wizard: ReturnType<typeof useRentalObjectWizard>) {
  switch (step.id) {
    case 'category':
      return <CategorySelector wizard={wizard} />;
    case 'basics':
      return <BasicsStep wizard={wizard} />;
    case 'media':
      return <MediaStep wizard={wizard} />;
    case 'location':
      return <LocationStep wizard={wizard} />;
    case 'capacity':
      return <CapacityStep wizard={wizard} />;
    case 'inventory':
      return <InventoryStep wizard={wizard} />;
    case 'opening-hours':
      return <OpeningHoursStep wizard={wizard} />;
    case 'pickup':
      return <PickupStep wizard={wizard} />;
    case 'requirements':
      return <RequirementsStep wizard={wizard} />;
    case 'packages':
      return <PackagesStep wizard={wizard} />;
    case 'schedule':
      return <ScheduleStep wizard={wizard} />;
    case 'booking':
      return <BookingStep wizard={wizard} />;
    case 'content':
      return <ContentStep wizard={wizard} />;
    case 'custody':
      return <CustodyStep wizard={wizard} />;
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
