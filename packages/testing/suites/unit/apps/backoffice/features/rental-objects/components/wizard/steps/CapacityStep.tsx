/**
 * Capacity Step Component
 * For setting capacity limits (venues and experiences)
 */

import { useT } from '@xalatechnologies/platform/i18n';
import {
  Heading,
  Paragraph,
  Alert,
  Card,
  Textfield,
  Checkbox,
} from '@xalatechnologies/platform/ui';
import type { UseRentalObjectWizardReturn } from '@xala/backoffice/hooks/useRentalObjectWizard';

export interface CapacityStepProps {
  wizard: UseRentalObjectWizardReturn;
}

export function CapacityStep({ wizard }: CapacityStepProps) {
  const t = useT();
  const { formData, updateFormData, errors, currentCategory } = wizard;
  const currentStepErrors = errors['capacity'] || [];

  // Category-specific label for capacity
  const capacityLabel =
    currentCategory === 'LOKALER_OG_BANER'
      ? t('form.capacity.maxPersons')
      : t('form.capacity.maxParticipants');

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
            {t('wizard.step.capacity')}
          </Heading>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('rentalObjects.capacityDescription')}
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

        {/* Capacity */}
        <Textfield
          label={capacityLabel}
          type="number"
          value={formData.capacity?.toString() || ''}
          onChange={(e) =>
            updateFormData({ capacity: e.target.value ? parseInt(e.target.value, 10) : undefined })
          }
          min={1}
          required
          placeholder="50"
        />

        {/* Shared Capacity (Only for OPPLEVELSER_OG_ARRANGEMENT) */}
        {currentCategory === 'OPPLEVELSER_OG_ARRANGEMENT' && (
          <>
            <div
              style={{
                borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
                paddingTop: 'var(--ds-spacing-5)',
              }}
            >
              <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                {t('form.capacity.sharedCapacity')}
              </Heading>
              <Paragraph
                data-size="sm"
                style={{
                  margin: 0,
                  marginBottom: 'var(--ds-spacing-4)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                {t('form.capacity.sharedCapacityDescription')}
              </Paragraph>

              <Checkbox
                checked={formData.sharedCapacityEnabled || false}
                onChange={(e) => updateFormData({ sharedCapacityEnabled: e.target.checked })}
              >
                {t('form.capacity.sharedEnabled')}
              </Checkbox>
            </div>

            {/* Capacity Policy (Only if shared capacity is enabled) */}
            {formData.sharedCapacityEnabled && (
              <div>
                <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                  {t('form.capacity.policy')}
                </Heading>
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    marginBottom: 'var(--ds-spacing-4)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {t('form.capacity.policyDescription')}
                </Paragraph>

                <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap' }}>
                  {['PER_SLOT', 'PER_DAY'].map((policy) => (
                    <label
                      key={policy}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--ds-spacing-2)',
                        padding: 'var(--ds-spacing-4)',
                        border:
                          formData.capacityPolicy === policy
                            ? '2px solid var(--ds-color-accent-border-default)'
                            : '2px solid var(--ds-color-neutral-border-subtle)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        cursor: 'pointer',
                        backgroundColor:
                          formData.capacityPolicy === policy
                            ? 'var(--ds-color-accent-surface-default)'
                            : 'transparent',
                        transition: 'all 0.2s ease',
                        flex: 1,
                        minWidth: '200px',
                      }}
                    >
                      <input
                        type="radio"
                        name="capacityPolicy"
                        value={policy}
                        checked={formData.capacityPolicy === policy}
                        onChange={(e) => updateFormData({ capacityPolicy: e.target.value as any })}
                        style={{ margin: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                          {t(`form.capacity.policy.${policy.toLowerCase()}`)}
                        </div>
                        <div
                          style={{
                            fontSize: 'var(--ds-font-size-sm)',
                            color: 'var(--ds-color-neutral-text-subtle)',
                            marginTop: 'var(--ds-spacing-1)',
                          }}
                        >
                          {t(`form.capacity.policyDescription.${policy.toLowerCase()}`)}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

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
            💡{' '}
            {currentCategory === 'LOKALER_OG_BANER'
              ? t('rentalObjects.capacityInfoVenue')
              : t('rentalObjects.capacityInfoExperience')}
          </Paragraph>
        </div>
      </div>
    </Card>
  );
}
