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
  /** Rental object ID to clone from */
  cloneFromId?: string | undefined;
}

export function RentalObjectWizard({ slug, cloneFromId }: RentalObjectWizardProps) {
  const t = useT();
  const wizard = useRentalObjectWizard({ slug, cloneFromId });

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
        minHeight: '100vh',
        backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
      }}
    >
      {/* Page Header - Separate from Tabs */}
      <div
        style={{
          backgroundColor: '#1E3A52',
          padding: 'var(--ds-spacing-5) var(--ds-spacing-6)',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Heading level={1} data-size="lg" style={{ margin: 0, color: '#FFFFFF' }}>
            {wizard.isEditMode ? t('rentalObjects.editTitle') : t('rentalObjects.createTitle')}
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)' }}>
            {t('wizard.stepProgress', { current: wizard.currentStep + 1, total: wizard.steps.length })}
          </Paragraph>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div
        style={{
          backgroundColor: '#1E3A52',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: 0 }}>
          {wizard.steps.map((step, index) => {
            const isActive = index === wizard.currentStep;
            const isCompleted = index < wizard.currentStep;
            
            return (
              <button
                key={step.id}
                onClick={() => wizard.goToStep(index)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--ds-spacing-2)',
                  padding: 'var(--ds-spacing-4) var(--ds-spacing-3)',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '3px solid #4A9EDA' : '3px solid transparent',
                  cursor: 'pointer',
                  color: isActive ? '#4A9EDA' : isCompleted ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = isCompleted ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)';
                  }
                }}
              >
                {isCompleted && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M13.3333 4L6 11.3333L2.66666 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                <span>{t(`wizard.step.${step.id}`)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area - Single Scroll */}
      <div
        style={{
          flex: 1,
          padding: 'var(--ds-spacing-6) var(--ds-spacing-8)',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {(() => {
            const step = wizard.steps[wizard.currentStep];
            return step ? renderStep(step, wizard) : null;
          })()}
        </div>
      </div>

      {/* Footer Navigation - Matching Header Style */}
      <div
        style={{
          backgroundColor: '#1E3A52',
          padding: 'var(--ds-spacing-5) var(--ds-spacing-6)',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <WizardFooter wizard={wizard} />
        </div>
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
