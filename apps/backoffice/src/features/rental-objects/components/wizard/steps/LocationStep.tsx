/**
 * Location Step Component
 * For setting address and location details (venues and experiences)
 */

import { useT } from '@xala/i18n';
import {
  Heading,
  Paragraph,
  Alert,
  Card,
  Textfield,
  NativeSelect,
} from '@xala/ds';
import type { UseRentalObjectWizardReturn } from '../../../hooks/useRentalObjectWizard';

export interface LocationStepProps {
  wizard: UseRentalObjectWizardReturn;
}

export function LocationStep({ wizard }: LocationStepProps) {
  const t = useT();
  const { formData, updateFormData, errors, currentCategory } = wizard;
  const currentStepErrors = errors['location'] || [];

  const location = formData.location || {};

  // Check if location is required based on category
  const isRequired = currentCategory === 'LOKALER_OG_BANER';

  const updateLocation = (field: string, value: string | number | undefined) => {
    updateFormData({
      location: {
        ...location,
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
            {t('wizard.step.location')}
          </Heading>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {isRequired
              ? t('rentalObjects.locationDescriptionRequired')
              : t('rentalObjects.locationDescriptionOptional')}
          </Paragraph>
        </div>

        {/* Error Display */}
        {currentStepErrors.length > 0 && (
          <Alert data-color="danger">
            <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)' }}>
              {currentStepErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Address */}
        <Textfield
          label={t('form.location.address')}
          value={location.address || ''}
          onChange={(e) => updateLocation('address', e.target.value)}
          required={isRequired}
          placeholder={t('form.location.addressPlaceholder')}
        />

        {/* Postal Code and City */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: 'var(--ds-spacing-4)',
          }}
        >
          <Textfield
            label={t('form.location.postalCode')}
            value={location.postalCode || ''}
            onChange={(e) => updateLocation('postalCode', e.target.value)}
            required={isRequired}
            placeholder="0001"
            maxLength={4}
          />
          <Textfield
            label={t('form.location.city')}
            value={location.city || ''}
            onChange={(e) => updateLocation('city', e.target.value)}
            required={isRequired}
            placeholder={t('form.location.cityPlaceholder')}
          />
        </div>

        {/* Country */}
        <NativeSelect
          label={t('form.location.country')}
          value={location.country || 'NO'}
          onChange={(e) => updateLocation('country', e.target.value)}
          required={isRequired}
        >
          <option value="NO">{t('country.norway')}</option>
          <option value="SE">{t('country.sweden')}</option>
          <option value="DK">{t('country.denmark')}</option>
          <option value="FI">{t('country.finland')}</option>
          <option value="IS">{t('country.iceland')}</option>
        </NativeSelect>

        {/* Coordinates (Optional) */}
        <div>
          <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
            {t('form.location.coordinates')}
          </Heading>
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              marginBottom: 'var(--ds-spacing-3)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {t('form.location.coordinatesDescription')}
          </Paragraph>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--ds-spacing-4)',
            }}
          >
            <Textfield
              label={t('form.location.latitude')}
              type="number"
              value={location.latitude?.toString() || ''}
              onChange={(e) =>
                updateLocation('latitude', e.target.value ? parseFloat(e.target.value) : undefined)
              }
              step="0.000001"
              placeholder={t('backoffice.placeholder.599139')}
            />
            <Textfield
              label={t('form.location.longitude')}
              type="number"
              value={location.longitude?.toString() || ''}
              onChange={(e) =>
                updateLocation('longitude', e.target.value ? parseFloat(e.target.value) : undefined)
              }
              step="0.000001"
              placeholder={t('backoffice.placeholder.107522')}
            />
          </div>
        </div>

        {/* Map Preview Placeholder */}
        {location.latitude && location.longitude && (
          <div>
            <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
              {t('form.location.mapPreview')}
            </Heading>
            <div
              style={{
                width: '100%',
                height: '300px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 'var(--ds-spacing-3)',
              }}
            >
              <Paragraph data-size="sm" style={{ margin: 0, textAlign: 'center' }}>
                {t('form.location.mapPreviewPlaceholder')}
                <br />
                <strong>
                  {location.latitude}, {location.longitude}
                </strong>
              </Paragraph>
            </div>
          </div>
        )}

        {/* Info Message */}
        {!isRequired && (
          <div
            style={{
              padding: 'var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-info-surface-default)',
              borderLeft: '4px solid var(--ds-color-info-border-default)',
              borderRadius: 'var(--ds-border-radius-md)',
            }}
          >
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              {t('rentalObjects.locationOptionalNote')}
            </Paragraph>
          </div>
        )}
      </div>
    </Card>
  );
}
