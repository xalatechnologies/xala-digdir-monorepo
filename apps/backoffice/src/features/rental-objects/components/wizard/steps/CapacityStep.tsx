/**
 * Capacity Step Component
 * For setting capacity and area information
 */

import { useT } from '@xala/i18n';
import { Textfield, Heading, Paragraph, Alert } from '@xala/ds';
import type { RentalObject } from '../../../types';

interface CapacityStepProps {
  data: Partial<RentalObject>;
  onChange: (data: Partial<RentalObject>) => void;
  errors: string[];
}

export function CapacityStep({ data, onChange, errors }: CapacityStepProps): React.ReactElement {
  const t = useT();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {t('rentalObjects.step.capacity.title')}
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('rentalObjects.step.capacity.description')}
        </Paragraph>
      </div>

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
        type="number"
        label={t('rentalObjects.field.capacity')}
        value={data.capacity?.toString() || ''}
        onChange={(e) => onChange({ capacity: e.target.value ? parseInt(e.target.value, 10) : undefined })}
        min={1}
        description={t('rentalObjects.field.capacityDescription')}
      />
    </div>
  );
}
