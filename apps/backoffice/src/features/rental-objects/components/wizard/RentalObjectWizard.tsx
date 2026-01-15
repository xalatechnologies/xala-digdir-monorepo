/**
 * Rental Object Wizard
 * Multi-step form for creating and editing rental objects
 * Uses category-specific steps based on the new category system
 */

import { useState } from 'react';
import { Button, Heading, Paragraph, Spinner } from '@xala/ds';
import { useT } from '@xala/i18n';
import { useRentalObjectWizard } from '../../hooks/useRentalObjectWizard';
import { WizardStepper } from './WizardStepper';
import { CategorySelector } from './steps/CategorySelector';
import { BasicsStep } from './steps/BasicsStep';
import { LocationStep } from './steps/LocationStep';
import { CapacityStep } from './steps/CapacityStep';
import { ContentStep } from './steps/ContentStep';
import { OpeningHoursStep } from './steps/OpeningHoursStep';
import { InventoryStep } from './steps/InventoryStep';
import { PickupStep } from './steps/PickupStep';
import { RequirementsStep } from './steps/RequirementsStep';
import { PackagesStep } from './steps/PackagesStep';
import { ScheduleStep } from './steps/ScheduleStep';
import { BookingStep } from './steps/BookingStep';
import { MediaStep } from './steps/MediaStep';
import { ReviewStep } from './steps/ReviewStep';
import type { RentalObjectCategory } from '../../types';

export interface RentalObjectWizardProps {
  /** Rental object slug for edit mode */
  slug?: string | undefined;
  /** Initial category for create mode */
  initialCategory?: RentalObjectCategory | undefined;
}

export function RentalObjectWizard({ slug, initialCategory }: RentalObjectWizardProps): React.ReactElement {
  const t = useT();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const wizard = useRentalObjectWizard({
    slug,
    initialCategory,
  });

  const {
    currentStep,
    steps,
    formData,
    errors,
    isLoading,
    isSaving,
    isEditMode,
    currentCategory,
    categoryConfig,
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    isLastStep,
    updateFormData,
    setCategory,
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
        <Paragraph>{t('rentalObjects.loading')}</Paragraph>
      </div>
    );
  }

  // Get current step component
  const currentStepId = steps[currentStep]?.id || 'basics';
  const stepErrors = currentStepId ? (errors[currentStepId] || []) : [];

  const renderStep = (): React.ReactElement => {
    switch (currentStepId) {
      case 'basics':
        return (
          <BasicsStep
            data={formData}
            onChange={updateFormData}
            errors={stepErrors}
            category={currentCategory}
            onCategoryChange={setCategory}
            isEditMode={isEditMode}
          />
        );
      case 'location':
        return <LocationStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'capacity':
        return <CapacityStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'openingHours':
        return <OpeningHoursStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'inventory':
        return <InventoryStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'pickup':
        return <PickupStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'requirements':
        return <RequirementsStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'packages':
        return <PackagesStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'schedule':
        return <ScheduleStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'content':
        return <ContentStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'booking':
        return <BookingStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'media':
        return <MediaStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'review':
        return (
          <ReviewStep
            data={formData}
            onChange={updateFormData}
            errors={stepErrors}
            category={currentCategory}
          />
        );
      default:
        return (
          <div style={{ padding: 'var(--ds-spacing-6)', textAlign: 'center' }}>
            <Paragraph>{t('rentalObjects.unknownStep')}: {currentStepId}</Paragraph>
          </div>
        );
    }
  };

  const handleSaveDraft = async (): Promise<void> => {
    setSaveStatus('idle');
    try {
      await saveDraft();
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save draft:', error);
      setSaveStatus('error');
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Page header */}
      <div style={{ marginBottom: 'var(--ds-spacing-6)' }}>
        <Heading level={1} data-size="lg" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {isEditMode ? t('rentalObjects.editTitle') : t('rentalObjects.createTitle')}
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {isEditMode
            ? t('rentalObjects.editDescription')
            : t('rentalObjects.createDescription')}
        </Paragraph>
        {/* Category badge */}
        <div
          style={{
            marginTop: 'var(--ds-spacing-2)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-2)',
            padding: 'var(--ds-spacing-1) var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-accent-surface-default)',
            borderRadius: 'var(--ds-border-radius-full)',
            fontSize: 'var(--ds-font-size-body-sm)',
          }}
        >
          <span>{categoryConfig.icon === 'building' ? '🏢' : 
                 categoryConfig.icon === 'box' ? '📦' :
                 categoryConfig.icon === 'car' ? '🚗' : '🎭'}</span>
          <span>{t(`category.${currentCategory}`)}</span>
        </div>
      </div>

      {/* Stepper */}
      <div style={{ marginBottom: 'var(--ds-spacing-6)' }}>
        <WizardStepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={goToStep}
          title={isEditMode ? t('rentalObjects.editTitle') : t('rentalObjects.createTitle')}
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

      {/* Save status notification */}
      {saveStatus !== 'idle' && (
        <div
          style={{
            padding: 'var(--ds-spacing-3)',
            marginBottom: 'var(--ds-spacing-4)',
            borderRadius: 'var(--ds-border-radius-md)',
            backgroundColor: saveStatus === 'success'
              ? 'var(--ds-color-success-surface-default)'
              : 'var(--ds-color-danger-surface-default)',
            border: `1px solid ${saveStatus === 'success'
              ? 'var(--ds-color-success-border-default)'
              : 'var(--ds-color-danger-border-default)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-2)',
          }}
        >
          <span style={{ fontSize: 'var(--ds-font-size-heading-sm)' }}>
            {saveStatus === 'success' ? '✓' : '✕'}
          </span>
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              color: saveStatus === 'success'
                ? 'var(--ds-color-success-text-default)'
                : 'var(--ds-color-danger-text-default)',
            }}
          >
            {saveStatus === 'success'
              ? t('rentalObjects.saveSuccess')
              : t('rentalObjects.saveError')}
          </Paragraph>
        </div>
      )}

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <Button type="button" variant="secondary" onClick={handleSaveDraft} disabled={isSaving}>
            {isSaving ? t('common.loading') : t('rentalObjects.saveDraft')}
          </Button>
        </div>

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
            <Button type="button" variant="primary" onClick={handleSaveDraft} disabled={isSaving}>
              {isSaving ? t('common.loading') : t('rentalObjects.complete')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
