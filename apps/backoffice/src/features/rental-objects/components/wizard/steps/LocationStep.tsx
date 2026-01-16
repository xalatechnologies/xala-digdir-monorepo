/**
 * Location Step Component
 * For setting address and location details
 */

import { useT } from '@xala/i18n';
import { Textfield, Heading, Alert } from '@xala/ds';
import type { RentalObject } from '../../../types';

interface LocationStepProps {
  data: Partial<RentalObject>;
  onChange: (data: Partial<RentalObject>) => void;
  errors: string[];
}

export function LocationStep({ data, onChange, errors }: LocationStepProps): React.ReactElement {
  const t = useT();
  const location = data.location || {};

  const updateLocation = (field: string, value: string | number | undefined): void => {
    onChange({
      location: {
        ...location,
        [field]: value || undefined,
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <Heading level={3} data-size="sm">
        {t('rentalObjects.step.location.title')}
      </Heading>

      {errors.length > 0 && (
        <Alert severity="danger">
          <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)' }}>
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Textfield
        label={t('rentalObjects.field.address')}
        value={location.address || ''}
        onChange={(e) => updateLocation('address', e.target.value)}
        required
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
        <Textfield
          label={t('rentalObjects.field.postalCode')}
          value={location.postalCode || ''}
          onChange={(e) => updateLocation('postalCode', e.target.value)}
        />
        <Textfield
          label={t('rentalObjects.field.city')}
          value={location.city || ''}
          onChange={(e) => updateLocation('city', e.target.value)}
        />
      </div>

      <Textfield
        label={t('rentalObjects.field.municipality')}
        value={location.municipality || ''}
        onChange={(e) => updateLocation('municipality', e.target.value)}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
        <Textfield
          type="number"
          label={t('rentalObjects.field.latitude')}
          value={location.latitude?.toString() || ''}
          onChange={(e) => updateLocation('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
          step="0.000001"
        />
        <Textfield
          type="number"
          label={t('rentalObjects.field.longitude')}
          value={location.longitude?.toString() || ''}
          onChange={(e) => updateLocation('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
          step="0.000001"
        />
      </div>
    </div>
  );
}
