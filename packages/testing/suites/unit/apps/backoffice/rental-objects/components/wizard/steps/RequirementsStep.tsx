/**
 * Requirements Step Component
 * For vehicle-specific requirements (licenses, age, deposit)
 */

import { useT } from '@xalatechnologies/platform/i18n';
import {
  Heading,
  Paragraph,
  Alert,
  Card,
  Textfield,
  Checkbox,
  Badge,
} from '@xalatechnologies/platform/ui';
import type { UseRentalObjectWizardReturn } from '@xala/backoffice/hooks/useRentalObjectWizard';

export interface RequirementsStepProps {
  wizard: UseRentalObjectWizardReturn;
}

const LICENSE_TYPES = [
  { value: 'B', label: 'Klasse B', icon: '🚗', description: 'Personbil' },
  { value: 'BE', label: 'Klasse BE', icon: '🚗🔗', description: t('common.personbil_med_tilhenger') },
  { value: 'C', label: 'Klasse C', icon: '🚚', description: 'Lastebil' },
  { value: 'D', label: 'Klasse D', icon: '🚌', description: 'Buss' },
  { value: 'AM', label: 'Klasse AM', icon: '🛵', description: 'Moped' },
] as const;

export function RequirementsStep({ wizard }: RequirementsStepProps) {
  const t = useT();
  const { formData, updateFormData, errors } = wizard;
  const currentStepErrors = errors['requirements'] || [];

  const toggleLicenseType = (type: string) => {
    const current = formData.licenseTypes || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    updateFormData({ licenseTypes: updated });
  };

  return (
    <Card
      style={{
        padding: 'var(--ds-spacing-6)',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
        {/* Header */}
        <div>
          <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            {t('wizard.step.requirements')}
          </Heading>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('rentalObjects.requirementsDescription')}
          </Paragraph>
        </div>

        {/* Error Display */}
        {currentStepErrors.length > 0 && (
          <Alert severity="danger">
            <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)' }}>
              {currentStepErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* License Required */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              marginBottom: 'var(--ds-spacing-3)',
            }}
          >
            <div style={{ fontSize: '1.5rem' }}>🪪</div>
            <Heading level={4} data-size="xs" style={{ margin: 0 }}>
              {t('form.requirements.licenseRequired')}
            </Heading>
          </div>

          <Checkbox
            checked={formData.licenseRequired || false}
            onChange={(e) => updateFormData({ licenseRequired: e.target.checked })}
          >
            <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
              {t('form.requirements.requireLicense')}
            </span>
          </Checkbox>

          {formData.licenseRequired && (
            <div
              style={{
                marginTop: 'var(--ds-spacing-4)',
                padding: 'var(--ds-spacing-4)',
                backgroundColor: 'var(--ds-color-accent-surface-subtle)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-accent-border-subtle)',
              }}
            >
              <Paragraph
                data-size="sm"
                style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)', fontWeight: 'var(--ds-font-weight-medium)' }}
              >
                {t('form.requirements.licenseTypes')}
              </Paragraph>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
                {LICENSE_TYPES.map((license) => {
                  const isSelected = (formData.licenseTypes || []).includes(license.value);
                  return (
                    <label
                      key={license.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--ds-spacing-3)',
                        padding: 'var(--ds-spacing-3)',
                        backgroundColor: isSelected
                          ? 'var(--ds-color-accent-surface-default)'
                          : 'var(--ds-color-neutral-surface-default)',
                        border: isSelected
                          ? '2px solid var(--ds-color-accent-border-default)'
                          : '1px solid var(--ds-color-neutral-border-subtle)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleLicenseType(license.value)}
                        style={{ margin: 0 }}
                      />
                      <div style={{ fontSize: '1.5rem' }}>{license.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'var(--ds-font-weight-semibold)' }}>{license.label}</div>
                        <div
                          style={{
                            fontSize: 'var(--ds-font-size-sm)',
                            color: 'var(--ds-color-neutral-text-subtle)',
                          }}
                        >
                          {license.description}
                        </div>
                      </div>
                      {isSelected && (
                        <Badge color="success" size="sm">
                          ✓
                        </Badge>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Age Requirement */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              marginBottom: 'var(--ds-spacing-3)',
            }}
          >
            <div style={{ fontSize: '1.5rem' }}>🎂</div>
            <Heading level={4} data-size="xs" style={{ margin: 0 }}>
              {t('form.requirements.ageRequirement')}
            </Heading>
          </div>

          <Textfield
            label={t('form.requirements.minimumAge')}
            type="number"
            value={formData.ageRequirement?.toString() || ''}
            onChange={(e) =>
              updateFormData({ ageRequirement: e.target.value ? parseInt(e.target.value, 10) : undefined })
            }
            min={16}
            max={100}
            placeholder="18"
          />
        </div>

        {/* Deposit Required */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              marginBottom: 'var(--ds-spacing-3)',
            }}
          >
            <div style={{ fontSize: '1.5rem' }}>💰</div>
            <Heading level={4} data-size="xs" style={{ margin: 0 }}>
              {t('form.requirements.depositRequired')}
            </Heading>
          </div>

          <Checkbox
            checked={formData.depositRequired || false}
            onChange={(e) => updateFormData({ depositRequired: e.target.checked })}
          >
            <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
              {t('form.requirements.requireDeposit')}
            </span>
          </Checkbox>

          {formData.depositRequired && (
            <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
              <Textfield
                label={t('form.requirements.depositAmount')}
                type="number"
                value={formData.depositAmount?.toString() || ''}
                onChange={(e) =>
                  updateFormData({ depositAmount: e.target.value ? parseInt(e.target.value, 10) : undefined })
                }
                min={0}
                placeholder="5000"
              />
            </div>
          )}
        </div>

        {/* Info Message */}
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-info-surface-default)',
            borderLeft: '4px solid var(--ds-color-info-border-default)',
            borderRadius: 'var(--ds-border-radius-md)',
          }}
        >
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            💡 {t('rentalObjects.requirementsInfo')}
          </Paragraph>
        </div>
      </div>
    </Card>
  );
}
