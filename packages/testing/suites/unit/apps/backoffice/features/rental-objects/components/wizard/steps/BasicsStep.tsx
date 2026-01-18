/**
 * Basics Step Component
 * First step in wizard for basic information with category-specific fields
 */

import { useT } from '@xala/i18n';
import { Textfield, Textarea, NativeSelect, Heading, Paragraph, Alert, Card } from '@xala/ds';
import type { UseRentalObjectWizardReturn } from '../../../hooks/useRentalObjectWizard';

export interface BasicsStepProps {
  wizard: UseRentalObjectWizardReturn;
}

export function BasicsStep({ wizard }: BasicsStepProps) {
  const t = useT();
  const { formData, updateFormData, errors, currentCategory, categoryConfig } = wizard;

  const currentStepErrors = errors['basics'] || [];

  // Time mode options
  const timeModes = [
    { value: 'PERIOD', label: t('rentalObjects.timeMode.PERIOD') },
    { value: 'SLOT', label: t('rentalObjects.timeMode.SLOT') },
    { value: 'ALL_DAY', label: t('rentalObjects.timeMode.ALL_DAY') },
  ];

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
            {t('wizard.step.basics')}
          </Heading>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('form.description.placeholder')}
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

        {/* Name */}
        <Textfield
          label={t('form.name')}
          value={formData.name || ''}
          onChange={(e) => updateFormData({ name: e.target.value })}
          required
          placeholder={t('form.name.placeholder')}
        />

        {/* Subcategory */}
        <Textfield
          label={t('form.subcategory')}
          value={formData.subcategory || ''}
          onChange={(e) => updateFormData({ subcategory: e.target.value || undefined })}
          placeholder={t('form.subcategory.placeholder')}
        />

        {/* Description */}
        <Textarea
          label={t('form.description')}
          value={formData.description || ''}
          onChange={(e) => updateFormData({ description: e.target.value })}
          rows={5}
          required
          placeholder={t('form.description.placeholder')}
        />

        {/* Time Mode */}
        <div>
          <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            {t('form.timeMode')}
          </Heading>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap' }}>
            {timeModes.map((mode) => (
              <label
                key={mode.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-2)',
                  padding: 'var(--ds-spacing-4)',
                  border: formData.timeMode === mode.value
                    ? '2px solid var(--ds-color-accent-border-default)'
                    : '2px solid var(--ds-color-neutral-border-subtle)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  cursor: 'pointer',
                  backgroundColor: formData.timeMode === mode.value
                    ? 'var(--ds-color-accent-surface-default)'
                    : 'transparent',
                  transition: 'all 0.2s ease',
                  flex: 1,
                  minWidth: '140px',
                }}
              >
                <input
                  type="radio"
                  name="timeMode"
                  value={mode.value}
                  checked={formData.timeMode === mode.value}
                  onChange={(e) => updateFormData({ timeMode: e.target.value as any })}
                  style={{ margin: 0 }}
                />
                <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{mode.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Category-Specific Fields */}
        {currentCategory === 'LOKALER_OG_BANER' && (
          <Textfield
            label={t('form.squareMeters')}
            type="number"
            value={formData.squareMeters || ''}
            onChange={(e) => updateFormData({ squareMeters: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="100"
          />
        )}

        {(currentCategory === 'UTSTYR_OG_INVENTAR' || currentCategory === 'KJORETOY_OG_TRANSPORT') && (
          <NativeSelect
            label={t('form.condition')}
            value={formData.condition || ''}
            onChange={(e) => updateFormData({ condition: e.target.value || undefined })}
          >
            <option value="">{t('common.selectOption')}</option>
            <option value="new">{t('form.condition.new')}</option>
            <option value="good">{t('form.condition.good')}</option>
            <option value="fair">{t('form.condition.fair')}</option>
          </NativeSelect>
        )}

        {currentCategory === 'KJORETOY_OG_TRANSPORT' && (
          <NativeSelect
            label={t('form.fuelType')}
            value={formData.fuelType || ''}
            onChange={(e) => updateFormData({ fuelType: e.target.value || undefined })}
          >
            <option value="">{t('common.selectOption')}</option>
            <option value="petrol">{t('form.fuelType.petrol')}</option>
            <option value="diesel">{t('form.fuelType.diesel')}</option>
            <option value="electric">{t('form.fuelType.electric')}</option>
            <option value="hybrid">{t('form.fuelType.hybrid')}</option>
          </NativeSelect>
        )}

        {currentCategory === 'OPPLEVELSER_OG_ARRANGEMENT' && (
          <>
            <Textfield
              label={t('form.duration')}
              type="number"
              value={formData.duration || ''}
              onChange={(e) => updateFormData({ duration: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="60"
            />
            <Textfield
              label={t('form.leadTime')}
              type="number"
              value={formData.leadTime || ''}
              onChange={(e) => updateFormData({ leadTime: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="7"
            />
          </>
        )}
      </div>
    </Card>
  );
}
