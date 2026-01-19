/**
 * Rental Object Wizard
 * Multi-step form for creating and editing rental objects
 * Category-aware wizard with dynamic steps based on rental object category
 */

import { useT } from '@xala/i18n';
import { Heading, Paragraph, Spinner, WizardStepper } from '@xala/ds';
import { useRentalObjectWizard } from '../../hooks/useRentalObjectWizard';
import { WizardFooter } from './WizardFooter';
import { WIZARD_ICONS } from './WizardIcons';
import { CategorySelector } from './steps/CategorySelector';
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
      {/* Compact Header with Tabs */}
      <div
        style={{
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderBottom: '2px solid var(--ds-color-neutral-border-default)',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--ds-spacing-4) var(--ds-spacing-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-3)' }}>
            <Heading level={1} data-size="md" style={{ margin: 0 }}>
              {wizard.isEditMode ? t('rentalObjects.editTitle') : t('rentalObjects.createTitle')}
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('wizard.stepProgress', { current: wizard.currentStep + 1, total: wizard.steps.length })}
            </Paragraph>
          </div>

          {/* Professional Tab Navigation */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--ds-spacing-1)',
              overflowX: 'auto',
              paddingBottom: 'var(--ds-spacing-2)',
            }}
          >
            {wizard.steps.map((step, index) => {
              const isActive = index === wizard.currentStep;
              const isCompleted = index < wizard.currentStep;
              const hasError = wizard.errors[step.id]?.length > 0;
              
              return (
                <button
                  key={step.id}
                  onClick={() => wizard.goToStep(index)}
                  style={{
                    flex: '1 1 auto',
                    minWidth: '120px',
                    padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                    backgroundColor: isActive 
                      ? 'var(--ds-color-accent-surface-default)' 
                      : 'transparent',
                    color: isActive 
                      ? 'var(--ds-color-accent-text-default)' 
                      : isCompleted 
                        ? 'var(--ds-color-neutral-text-default)'
                        : 'var(--ds-color-neutral-text-subtle)',
                    border: 'none',
                    borderBottom: isActive 
                      ? '3px solid var(--ds-color-accent-border-strong)' 
                      : '3px solid transparent',
                    borderRadius: 'var(--ds-border-radius-md) var(--ds-border-radius-md) 0 0',
                    cursor: 'pointer',
                    fontSize: 'var(--ds-font-size-sm)',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--ds-spacing-2)',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {isCompleted && (
                    <span style={{ fontSize: '16px' }}>✓</span>
                  )}
                  {hasError && !isCompleted && (
                    <span style={{ color: 'var(--ds-color-danger-text-default)', fontSize: '16px' }}>!</span>
                  )}
                  <span>{t(`wizard.step.${step.id}`)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Taller Content Area - No Scrolling Needed */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--ds-spacing-6) var(--ds-spacing-8)',
          }}
        >
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {(() => {
              const step = wizard.steps[wizard.currentStep];
              return step ? renderStep(step, wizard) : null;
            })()}
          </div>
        </div>

        {/* Footer Navigation */}
        <WizardFooter wizard={wizard} />
      </div>
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
