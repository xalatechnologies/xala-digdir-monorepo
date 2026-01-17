/**
 * Pickup Step Component
 * For configuring pickup/return locations (equipment and vehicles)
 */

import { useT } from '@xala/i18n';
import {
  Heading,
  Paragraph,
  Alert,
  Card,
  Textfield,
  Textarea,
  Checkbox,
} from '@xala/ds';
import type { UseRentalObjectWizardReturn } from '../../../hooks/useRentalObjectWizard';

export interface PickupStepProps {
  wizard: UseRentalObjectWizardReturn;
}

export function PickupStep({ wizard }: PickupStepProps) {
  const t = useT();
  const { formData, updateFormData, errors } = wizard;
  const currentStepErrors = errors['pickup'] || [];

  const pickupLocation = formData.pickupLocation || {};
  const returnLocation = formData.returnLocation || {};

  const updatePickupLocation = (field: string, value: string) => {
    updateFormData({
      pickupLocation: {
        ...pickupLocation,
        [field]: value || undefined,
      },
    });
  };

  const updateReturnLocation = (field: string, value: string) => {
    updateFormData({
      returnLocation: {
        ...returnLocation,
        [field]: value || undefined,
      },
    });
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
            {t('wizard.step.pickup')}
          </Heading>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('rentalObjects.pickupDescription')}
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

        {/* Pickup Location */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              marginBottom: 'var(--ds-spacing-4)',
            }}
          >
            <div style={{ fontSize: '1.5rem' }}>📍</div>
            <Heading level={4} data-size="xs" style={{ margin: 0 }}>
              {t('form.pickup.location')}
            </Heading>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <Textfield
              label={t('form.location.address')}
              value={pickupLocation.address || ''}
              onChange={(e) => updatePickupLocation('address', e.target.value)}
              required
              placeholder={t('form.location.addressPlaceholder')}
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr',
                gap: 'var(--ds-spacing-4)',
              }}
            >
              <Textfield
                label={t('form.location.postalCode')}
                value={pickupLocation.postalCode || ''}
                onChange={(e) => updatePickupLocation('postalCode', e.target.value)}
                required
                placeholder="0001"
                maxLength={4}
              />
              <Textfield
                label={t('form.location.city')}
                value={pickupLocation.city || ''}
                onChange={(e) => updatePickupLocation('city', e.target.value)}
                required
                placeholder={t('form.location.cityPlaceholder')}
              />
            </div>

            <Textarea
              label={t('form.pickup.instructions')}
              value={formData.pickupInstructions || ''}
              onChange={(e) => updateFormData({ pickupInstructions: e.target.value })}
              rows={3}
              placeholder={t('form.pickup.instructionsPlaceholder')}
            />
          </div>
        </div>

        {/* Same as Pickup Checkbox */}
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderRadius: 'var(--ds-border-radius-md)',
          }}
        >
          <Checkbox
            checked={formData.returnSameAsPickup !== false}
            onChange={(e) => updateFormData({ returnSameAsPickup: e.target.checked })}
          >
            <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
              {t('form.pickup.returnSameAsPickup')}
            </span>
          </Checkbox>
        </div>

        {/* Return Location (only if different) */}
        {formData.returnSameAsPickup === false && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                marginBottom: 'var(--ds-spacing-4)',
              }}
            >
              <div style={{ fontSize: '1.5rem' }}>🔙</div>
              <Heading level={4} data-size="xs" style={{ margin: 0 }}>
                {t('form.pickup.returnLocation')}
              </Heading>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
              <Textfield
                label={t('form.location.address')}
                value={returnLocation.address || ''}
                onChange={(e) => updateReturnLocation('address', e.target.value)}
                required
                placeholder={t('form.location.addressPlaceholder')}
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                  gap: 'var(--ds-spacing-4)',
                }}
              >
                <Textfield
                  label={t('form.location.postalCode')}
                  value={returnLocation.postalCode || ''}
                  onChange={(e) => updateReturnLocation('postalCode', e.target.value)}
                  required
                  placeholder="0001"
                  maxLength={4}
                />
                <Textfield
                  label={t('form.location.city')}
                  value={returnLocation.city || ''}
                  onChange={(e) => updateReturnLocation('city', e.target.value)}
                  required
                  placeholder={t('form.location.cityPlaceholder')}
                />
              </div>

              <Textarea
                label={t('form.pickup.returnInstructions')}
                value={formData.returnInstructions || ''}
                onChange={(e) => updateFormData({ returnInstructions: e.target.value })}
                rows={3}
                placeholder={t('form.pickup.returnInstructionsPlaceholder')}
              />
            </div>
          </div>
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
            💡 {t('rentalObjects.pickupInfo')}
          </Paragraph>
        </div>
      </div>
    </Card>
  );
}
