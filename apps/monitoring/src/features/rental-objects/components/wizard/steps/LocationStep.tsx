/**
 * Location Step
 * Address and coordinates input
 */

import { Textfield, Paragraph, Heading } from '@xala/ds';
import { useT } from '@xala/i18n';
import type { BackofficeListing } from '../../../types';

export interface LocationStepProps {
  data: Partial<BackofficeListing>;
  onChange: (data: Partial<BackofficeListing>) => void;
  errors?: string[];
}

export function LocationStep({ data, onChange, errors = [] }: LocationStepProps) {
  const t = useT();
  const location = data.location || {};

  const handleLocationChange = (field: keyof NonNullable<BackofficeListing['location']>, value: string | number) => {
    onChange({
      location: {
        ...location,
        [field]: value,
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {t('listings.wizard.location.title')}
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('listings.wizard.location.description')}
        </Paragraph>
      </div>

      {errors.length > 0 && (
        <div
          style={{
            padding: 'var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-danger-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-danger-border-default)',
          }}
        >
          {errors.map((error, idx) => (
            <Paragraph key={idx} data-size="sm" style={{ color: 'var(--ds-color-danger-text-default)', margin: 0 }}>
              {error}
            </Paragraph>
          ))}
        </div>
      )}

      {/* Address */}
      <div>
        <Textfield
          label={t('listings.wizard.location.address')}
          description={t('listings.wizard.location.addressDescription')}
          value={location.address || ''}
          onChange={(e) => handleLocationChange('address', e.target.value)}
          placeholder={t('listings.wizard.location.addressPlaceholder')}
        />
      </div>

      {/* Postal code and city row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--ds-spacing-4)' }}>
        <div>
          <Textfield
            label={t('listings.wizard.location.postalCode')}
            value={location.postalCode || ''}
            onChange={(e) => handleLocationChange('postalCode', e.target.value)}
            placeholder={t('listings.wizard.location.postalCodePlaceholder')}
          />
        </div>
        <div>
          <Textfield
            label={t('listings.wizard.location.city')}
            value={location.city || ''}
            onChange={(e) => handleLocationChange('city', e.target.value)}
            placeholder={t('listings.wizard.location.cityPlaceholder')}
          />
        </div>
      </div>

      {/* Municipality */}
      <div>
        <Textfield
          label={t('listings.wizard.location.municipality')}
          description={t('listings.wizard.location.municipalityDescription')}
          value={location.municipality || ''}
          onChange={(e) => handleLocationChange('municipality', e.target.value)}
          placeholder={t('listings.wizard.location.municipalityPlaceholder')}
        />
      </div>

      {/* Country */}
      <div>
        <Textfield
          label={t('listings.wizard.location.country')}
          value={location.country || 'Norge'}
          onChange={(e) => handleLocationChange('country', e.target.value)}
          placeholder={t('listings.wizard.location.countryPlaceholder')}
        />
      </div>

      {/* Coordinates */}
      <div>
        <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
          {t('listings.wizard.location.coordinates')}
        </Heading>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('listings.wizard.location.coordinatesDescription')}
        </Paragraph>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
          <div>
            <Textfield
              label={t('listings.wizard.location.latitude')}
              type="number"
              step="any"
              value={location.latitude?.toString() || ''}
              onChange={(e) => handleLocationChange('latitude', parseFloat(e.target.value) || 0)}
              placeholder={t('listings.wizard.location.latitudePlaceholder')}
            />
          </div>
          <div>
            <Textfield
              label={t('listings.wizard.location.longitude')}
              type="number"
              step="any"
              value={location.longitude?.toString() || ''}
              onChange={(e) => handleLocationChange('longitude', parseFloat(e.target.value) || 0)}
              placeholder={t('listings.wizard.location.longitudePlaceholder')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
