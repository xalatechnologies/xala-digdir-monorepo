/**
 * Listing Wizard
 * Multi-step form for creating and editing listings
 */

import { Button, Heading, Paragraph, Spinner } from '@xala/ds';
import { useT } from '@xala/i18n';
import { useListingWizard } from '../../hooks/useListingWizard';
import { WizardStepper } from './WizardStepper';
import { BasicsStep } from './steps/BasicsStep';
import { LocationStep } from './steps/LocationStep';
import { CapacityStep } from './steps/CapacityStep';
import { ContentStep } from './steps/ContentStep';
import { MediaStep } from './steps/MediaStep';
import { ReviewStep } from './steps/ReviewStep';
import type { ListingType } from '@digilist/client-sdk';

export interface ListingWizardProps {
  /** Listing ID for edit mode */
  listingId?: string;
  /** Initial type for create mode */
  initialType?: ListingType;
}

export function ListingWizard({ listingId, initialType }: ListingWizardProps) {
  const t = useT();
  const wizard = useListingWizard({
    listingId,
    initialType,
  });

  const {
    currentStep,
    steps,
    formData,
    errors,
    isLoading,
    isSaving,
    isEditMode,
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    isLastStep,
    updateFormData,
    saveDraft,
    cancel,
  } = wizard;

  // Loading state
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
        <Spinner aria-label={t('common.loading')} />
        <Paragraph>{t('listings.wizard.loading')}</Paragraph>
      </div>
    );
  }

  // Get current step component
  const currentStepId = steps[currentStep]?.id;
  const stepErrors = errors[currentStepId] || [];

  const renderStep = () => {
    switch (currentStepId) {
      case 'basics':
        return <BasicsStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'location':
        return <LocationStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'capacity':
        return <CapacityStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'content':
        return <ContentStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'media':
        return <MediaStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'review':
        return <ReviewStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      default:
        return (
          <div style={{ padding: 'var(--ds-spacing-6)', textAlign: 'center' }}>
            <Paragraph>{t('listings.wizard.unknownStep')}: {currentStepId}</Paragraph>
          </div>
        );
    }
  };

  const handleSaveDraft = async () => {
    try {
      await saveDraft();
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: 'var(--ds-spacing-6)' }}>
        <Heading level={1} data-size="lg" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {isEditMode ? t('listings.wizard.editTitle') : t('listings.wizard.createTitle')}
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {isEditMode
            ? t('listings.wizard.editDescription')
            : t('listings.wizard.createDescription')}
        </Paragraph>
      </div>

      {/* Stepper */}
      <div style={{ marginBottom: 'var(--ds-spacing-6)' }}>
        <WizardStepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={goToStep}
          title={isEditMode ? t('listings.wizard.edit') : t('listings.wizard.create')}
          errors={errors}
        />
      </div>

      {/* Step content */}
      <div
        style={{
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
          padding: 'var(--ds-spacing-6)',
          marginBottom: 'var(--ds-spacing-6)',
        }}
      >
        {renderStep()}
      </div>

      {/* Navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        {/* Left side - Cancel */}
        <Button type="button" variant="tertiary" onClick={cancel} disabled={isSaving}>
          {t('common.cancel')}
        </Button>

        {/* Center - Save draft */}
        <Button type="button" variant="secondary" onClick={handleSaveDraft} loading={isSaving}>
          {t('listings.wizard.saveDraft')}
        </Button>

        {/* Right side - Navigation */}
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
          {canGoPrev && (
            <Button type="button" variant="secondary" onClick={prevStep} disabled={isSaving}>
              ← {t('common.previous')}
            </Button>
          )}
          {canGoNext && (
            <Button type="button" variant="primary" onClick={nextStep} disabled={isSaving}>
              {t('common.next')} →
            </Button>
          )}
          {isLastStep && (
            <Button type="button" variant="primary" onClick={handleSaveDraft} loading={isSaving}>
              {t('listings.wizard.complete')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
