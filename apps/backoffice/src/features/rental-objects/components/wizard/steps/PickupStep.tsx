/**
 * Pickup Step Component
 * For configuring pickup and return locations
 */

import { useT } from '@xala/i18n';
import { Textfield, Textarea, Heading, Paragraph, Switch, Alert, Checkbox } from '@xala/ds';
import type { RentalObject } from '../../../types';

interface PickupStepProps {
  data: Partial<RentalObject>;
  onChange: (data: Partial<RentalObject>) => void;
  errors: string[];
}

export function PickupStep({ data, onChange, errors }: PickupStepProps): React.ReactElement {
  const t = useT();
  const pickup = data.pickup || { enabled: true, sameAsPickup: true };

  const updatePickup = (updates: Partial<typeof pickup>): void => {
    onChange({
      pickup: {
        ...pickup,
        ...updates,
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {t('rentalObjects.step.pickup.title')}
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('rentalObjects.step.pickup.description')}
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

      {/* Pickup Location */}
      <div>
        <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
          {t('rentalObjects.field.pickupLocation')}
        </Heading>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          <Textfield
            label={t('rentalObjects.field.address')}
            value={pickup.pickupLocation?.address || ''}
            onChange={(e) => updatePickup({
              pickupLocation: {
                ...pickup.pickupLocation,
                address: e.target.value,
              },
            })}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
            <Textfield
              label={t('rentalObjects.field.postalCode')}
              value={pickup.pickupLocation?.postalCode || ''}
              onChange={(e) => updatePickup({
                pickupLocation: {
                  ...pickup.pickupLocation,
                  postalCode: e.target.value,
                },
              })}
            />
            <Textfield
              label={t('rentalObjects.field.city')}
              value={pickup.pickupLocation?.city || ''}
              onChange={(e) => updatePickup({
                pickupLocation: {
                  ...pickup.pickupLocation,
                  city: e.target.value,
                },
              })}
            />
          </div>

          <Textarea
            label={t('rentalObjects.field.pickupInstructions')}
            value={pickup.pickupInstructions || ''}
            onChange={(e) => updatePickup({ pickupInstructions: e.target.value })}
            rows={3}
            description={t('rentalObjects.field.pickupInstructionsDescription')}
          />
        </div>
      </div>

      {/* Return Location */}
      <div>
        <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
          {t('rentalObjects.field.returnLocation')}
        </Heading>

        <Checkbox
          checked={pickup.sameAsPickup}
          onChange={(e) => updatePickup({ sameAsPickup: e.target.checked })}
          style={{ marginBottom: 'var(--ds-spacing-4)' }}
        >
          {t('rentalObjects.field.sameAsPickup')}
        </Checkbox>

        {!pickup.sameAsPickup && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <Textfield
              label={t('rentalObjects.field.address')}
              value={pickup.returnLocation?.address || ''}
              onChange={(e) => updatePickup({
                returnLocation: {
                  ...pickup.returnLocation,
                  address: e.target.value,
                },
              })}
            />

            <Textarea
              label={t('rentalObjects.field.returnInstructions')}
              value={pickup.returnInstructions || ''}
              onChange={(e) => updatePickup({ returnInstructions: e.target.value })}
              rows={3}
            />
          </div>
        )}
      </div>
    </div>
  );
}
