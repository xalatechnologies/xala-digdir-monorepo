/**
 * Inventory Step Component
 * For equipment and vehicle inventory management
 */

import { useT } from '@xala/i18n';
import {
  Heading,
  Paragraph,
  Alert,
  Card,
  Textfield,
} from '@xala/ds';
import type { UseRentalObjectWizardReturn } from '@xala/backoffice/hooks/useRentalObjectWizard';

export interface InventoryStepProps {
  wizard: UseRentalObjectWizardReturn;
}

export function InventoryStep({ wizard }: InventoryStepProps) {
  const t = useT();
  const { formData, updateFormData, errors } = wizard;
  const currentStepErrors = errors['inventory'] || [];

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
            {t('wizard.step.inventory')}
          </Heading>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('rentalObjects.inventoryDescription')}
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

        {/* Total Quantity */}
        <Textfield
          label={t('form.inventory.totalQuantity')}
          type="number"
          value={formData.totalQuantity?.toString() || ''}
          onChange={(e) =>
            updateFormData({ totalQuantity: e.target.value ? parseInt(e.target.value, 10) : undefined })
          }
          min={1}
          required
          placeholder="10"
        />

        {/* Inventory Policy */}
        <div>
          <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
            {t('form.inventory.policy')}
          </Heading>
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              marginBottom: 'var(--ds-spacing-4)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {t('form.inventory.policyDescription')}
          </Paragraph>

          <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexDirection: 'column' }}>
            {['FIFO', 'CONCURRENT'].map((policy) => (
              <label
                key={policy}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--ds-spacing-3)',
                  padding: 'var(--ds-spacing-4)',
                  border:
                    formData.inventoryPolicy === policy
                      ? '2px solid var(--ds-color-accent-border-default)'
                      : '2px solid var(--ds-color-neutral-border-subtle)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  cursor: 'pointer',
                  backgroundColor:
                    formData.inventoryPolicy === policy
                      ? 'var(--ds-color-accent-surface-default)'
                      : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  type="radio"
                  name="inventoryPolicy"
                  value={policy}
                  checked={formData.inventoryPolicy === policy}
                  onChange={(e) => updateFormData({ inventoryPolicy: e.target.value as any })}
                  style={{ marginTop: 'var(--ds-spacing-1)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-1)' }}>
                    {t(`form.inventory.policy.${policy.toLowerCase()}`)}
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--ds-font-size-sm)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                      lineHeight: '1.5',
                    }}
                  >
                    {t(`form.inventory.policyDescription.${policy.toLowerCase()}`)}
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--ds-font-size-sm)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                      marginTop: 'var(--ds-spacing-2)',
                      fontStyle: 'italic',
                    }}
                  >
                    💡 {t(`form.inventory.policyExample.${policy.toLowerCase()}`)}
                  </div>
                </div>
              </label>
            ))}
          </div>
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
            <strong>{t('form.inventory.tip.title')}</strong>
            <br />
            {t('form.inventory.tip.description')}
          </Paragraph>
        </div>
      </div>
    </Card>
  );
}
