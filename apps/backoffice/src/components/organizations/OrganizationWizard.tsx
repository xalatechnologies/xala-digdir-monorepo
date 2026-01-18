/**
 * Organization Wizard
 * Multi-step form for creating and configuring organizations
 */

import { useState } from 'react';
import { Button, Heading, Paragraph, Spinner } from '@xala/ds';
import type { ActorType } from '@digilist/client-sdk';
import { BasicStep } from './BasicStep';
import { BrandingStep } from './BrandingStep';
import { RolesStep } from './RolesStep';
import { useT } from '@xala/i18n';

// =============================================================================
// Types
// =============================================================================

export type OrganizationWizardStepId = 'basics' | 'branding' | 'roles';

export interface OrganizationWizardStep {
  id: OrganizationWizardStepId;
  label: string;
  required?: boolean;
}

export interface OrganizationWizardData {
  // Core organization fields from CreateOrganizationDTO
  name: string;
  organizationNumber?: string;
  actorType?: ActorType;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  // Extended wizard-specific fields
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    favicon?: string;
  };
  roles?: string[];
}

export interface OrganizationWizardProps {
  /** Organization ID for edit mode */
  organizationId?: string | undefined;
  /** Initial actor type for create mode */
  initialActorType?: ActorType | undefined;
  /** Callback when wizard completes */
  onComplete?: (data: OrganizationWizardData) => Promise<void>;
  /** Callback when wizard is cancelled */
  onCancel?: () => void;
}

// =============================================================================
// Constants
// =============================================================================

const WIZARD_STEPS: OrganizationWizardStep[] = [
  { id: 'basics', label: 'Grunnleggende', required: true },
  { id: 'branding', label: t('common.visuell_identitet'), required: false },
  { id: 'roles', label: 'Roller', required: false },
];

// =============================================================================
// Component
// =============================================================================

export function OrganizationWizard({
  organizationId,
  initialActorType = 'municipality',
  onComplete,
  onCancel,
}: OrganizationWizardProps) {
  const t = useT();
  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OrganizationWizardData>({
    name: '',
    actorType: initialActorType,
    branding: {
      logo: '',
      primaryColor: '#0062BA',
      secondaryColor: '#004C93',
      favicon: '',
    },
    roles: [],
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const isEditMode = !!organizationId;
  const steps = WIZARD_STEPS;
  const canGoNext = currentStep < steps.length - 1;
  const canGoPrev = currentStep > 0;
  const isLastStep = currentStep === steps.length - 1;

  // Navigation
  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    // Validate current step
    const validationErrors: string[] = [];

    if (currentStepId === 'basics') {
      if (!formData.name?.trim()) {
        validationErrors.push('Organisasjonsnavn er påkrevd');
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        validationErrors.push('Ugyldig e-postadresse');
      }
      if (formData.organizationNumber && !/^\d{9}$/.test(formData.organizationNumber.replace(/\s/g, ''))) {
        validationErrors.push('Organisasjonsnummer må være 9 siffer');
      }
      if (formData.postalCode && !/^\d{4}$/.test(formData.postalCode)) {
        validationErrors.push('Postnummer må være 4 siffer');
      }
    }

    setErrors({ ...errors, [currentStepId]: validationErrors });

    if (validationErrors.length > 0) {
      return; // Block navigation if validation fails
    }

    // Continue with navigation
    if (canGoNext) {
      setCurrentStep((prev) => prev + 1);
      setErrors({ ...errors, [currentStepId]: [] });
    }
  };

  const prevStep = () => {
    if (canGoPrev) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Data management
  const updateFormData = (data: Partial<OrganizationWizardData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  // Actions
  const handleSaveDraft = async () => {
    setSaveStatus('idle');
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error(t('validation.failed_to_save_draft'), error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await onComplete?.(formData);
    } catch (error) {
      console.error(t('validation.failed_to_complete_wizard'), error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  // Get current step component
  const currentStepId = steps[currentStep]?.id || 'basics';
  const stepErrors = currentStepId ? (errors[currentStepId] || []) : [];

  const renderStep = () => {
    switch (currentStepId) {
      case 'basics':
        return (
          <div style={{ padding: 'var(--ds-spacing-6)' }}>
            <BasicStep
              data={{
                name: formData.name,
                organizationNumber: formData.organizationNumber,
                actorType: formData.actorType,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                postalCode: formData.postalCode,
              }}
              onChange={(basicData) => updateFormData(basicData)}
              errors={stepErrors}
            />
          </div>
        );
      case 'branding':
        return (
          <div style={{ padding: 'var(--ds-spacing-6)' }}>
            <BrandingStep
              data={formData.branding || {}}
              onChange={(branding) => updateFormData({ branding })}
              errors={stepErrors}
            />
          </div>
        );
      case 'roles':
        return (
          <div style={{ padding: 'var(--ds-spacing-6)' }}>
            <RolesStep
              actorType={formData.actorType}
              selectedRoles={formData.roles || ['admin']}
              onChange={(roles) => updateFormData({ roles })}
              errors={stepErrors}
            />
          </div>
        );
      default:
        return (
          <div style={{ padding: 'var(--ds-spacing-6)', textAlign: 'center' }}>
            <Paragraph>Ukjent steg: {currentStepId}</Paragraph>
          </div>
        );
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Page header */}
      <div style={{ marginBottom: 'var(--ds-spacing-6)' }}>
        <Heading level={1} data-size="lg" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {isEditMode ? t('common.rediger_organisasjon') : 'Opprett ny organisasjon'}
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {isEditMode
            ? t('common.gjor_endringer_i_organisasjonen')
            : 'Fyll ut informasjon om organisasjonen. Du kan lagre som utkast og fortsette senere.'}
        </Paragraph>
      </div>

      {/* Stepper */}
      <div style={{ marginBottom: 'var(--ds-spacing-6)' }}>
        <div
          style={{
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            borderRadius: 'var(--ds-border-radius-lg)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
            padding: 'var(--ds-spacing-5)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--ds-spacing-5)',
              paddingBottom: 'var(--ds-spacing-4)',
              borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
            }}
          >
            <Heading level={2} data-size="sm">
              {isEditMode ? t('common.rediger_organisasjon') : 'Opprett organisasjon'}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              Steg {currentStep + 1} av {steps.length}
            </Paragraph>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isLast = index === steps.length - 1;
              const stepErrors = errors[step.id];
              const hasErrors = stepErrors && stepErrors.length > 0;

              return (
                <div
                  key={step.id}
                  style={{
                    flex: isLast ? '0 0 auto' : 1,
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => goToStep(index)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 'var(--ds-spacing-2)',
                      cursor: 'pointer',
                      minWidth: '80px',
                      padding: 'var(--ds-spacing-1)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      transition: 'background-color 0.2s ease',
                      backgroundColor: 'transparent',
                      border: 'none',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--ds-border-radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: hasErrors
                          ? 'var(--ds-color-danger-surface-default)'
                          : isActive
                          ? 'var(--ds-color-accent-base-default)'
                          : isCompleted
                          ? 'var(--ds-color-success-surface-default)'
                          : 'var(--ds-color-neutral-surface-default)',
                        color: hasErrors
                          ? 'var(--ds-color-danger-text-default)'
                          : isActive
                          ? 'var(--ds-color-neutral-background-default)'
                          : isCompleted
                          ? 'var(--ds-color-success-text-default)'
                          : 'var(--ds-color-neutral-text-subtle)',
                        border: hasErrors
                          ? '2px solid var(--ds-color-danger-border-default)'
                          : isActive
                          ? '2px solid var(--ds-color-accent-base-default)'
                          : isCompleted
                          ? '2px solid var(--ds-color-success-border-default)'
                          : '2px solid var(--ds-color-neutral-border-subtle)',
                        transition: 'all 0.3s ease',
                        fontWeight: 'var(--ds-font-weight-semibold)',
                        fontSize: 'var(--ds-font-size-sm)',
                      }}
                    >
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <Paragraph
                      data-size="xs"
                      style={{
                        fontWeight: isActive ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-regular)',
                        color: hasErrors
                          ? 'var(--ds-color-danger-text-default)'
                          : isActive
                          ? 'var(--ds-color-accent-text-default)'
                          : 'var(--ds-color-neutral-text-default)',
                        textAlign: 'center',
                        margin: 0,
                      }}
                    >
                      {step.label}
                    </Paragraph>
                    {step.required && (
                      <Paragraph
                        data-size="xs"
                        style={{
                          color: 'var(--ds-color-danger-text-default)',
                          margin: 0,
                          fontSize: 'var(--ds-font-size-2xs)',
                        }}
                      >
                        *Påkrevd
                      </Paragraph>
                    )}
                  </button>

                  {!isLast && (
                    <div
                      style={{
                        flex: 1,
                        height: '2px',
                        backgroundColor: isCompleted
                          ? 'var(--ds-color-success-border-default)'
                          : 'var(--ds-color-neutral-border-subtle)',
                        marginTop: '24px',
                        transition: 'background-color 0.3s ease',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div
        style={{
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
          marginBottom: 'var(--ds-spacing-6)',
          minHeight: '400px',
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
            backgroundColor:
              saveStatus === 'success'
                ? 'var(--ds-color-success-surface-default)'
                : 'var(--ds-color-danger-surface-default)',
            border: `t('common.1px_solid_savestatus_success')`,
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
              color:
                saveStatus === 'success'
                  ? 'var(--ds-color-success-text-default)'
                  : 'var(--ds-color-danger-text-default)',
            }}
          >
            {saveStatus === 'success' ? t('common.endringene_er_lagret') : 'Kunne ikke lagre. Prøv igjen.'}
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
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isSaving}
            aria-label={t("ui.cancel")}
          >{t("ui.cancel")}</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleSaveDraft}
            disabled={isSaving}
            aria-label={t('common.lagre_utkast')}
          >
            {isSaving ? <Spinner aria-label={t('common.lagrer')} /> : 'Lagre utkast'}
          </Button>
        </div>

        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
          {canGoPrev && (
            <Button
              type="button"
              variant="secondary"
              onClick={prevStep}
              disabled={isSaving}
              aria-label={t('common.forrige_steg')}
            >
              ← Forrige
            </Button>
          )}
          {!isLastStep ? (
            <Button
              type="button"
              variant="primary"
              onClick={nextStep}
              disabled={isSaving}
              aria-label={t('common.neste_steg')}
            >
              t('actions.neste')
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={handleComplete}
              disabled={isSaving}
              aria-label={t('common.fullfor')}
            >
              {isSaving ? <Spinner aria-label={t('common.lagrer')} /> : 'Fullfør'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
