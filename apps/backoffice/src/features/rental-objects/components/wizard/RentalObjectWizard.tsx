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
            steps={wizard.steps.map(step => ({
              id: step.id,
              label: t(`wizard.step.${step.id}`),
              icon: WIZARD_ICONS[step.id],
            }))}
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
