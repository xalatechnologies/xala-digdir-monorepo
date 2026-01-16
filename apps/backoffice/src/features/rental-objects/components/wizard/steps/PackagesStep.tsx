/**
 * Packages Step Component
 * For event packages and pricing tiers
 */

import { useT } from '@xala/i18n';
import { Textfield, Textarea, Heading, Paragraph, Button, Alert, NativeSelect } from '@xala/ds';
import type { RentalObject, RentalObjectPackage } from '../../../types';

interface PackagesStepProps {
  data: Partial<RentalObject>;
  onChange: (data: Partial<RentalObject>) => void;
  errors: string[];
}

export function PackagesStep({ data, onChange, errors }: PackagesStepProps): React.ReactElement {
  const t = useT();
  const packages = data.packages || [];

  const addPackage = (): void => {
    const newPackage: RentalObjectPackage = {
      id: `pkg-${Date.now()}`,
      name: '',
      price: 0,
      currency: 'NOK',
    };
    onChange({ packages: [...packages, newPackage] });
  };

  const updatePackage = (index: number, updates: Partial<RentalObjectPackage>): void => {
    const updated = packages.map((pkg, i) =>
      i === index ? { ...pkg, ...updates } : pkg
    );
    onChange({ packages: updated });
  };

  const removePackage = (index: number): void => {
    onChange({ packages: packages.filter((_, i) => i !== index) });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {t('rentalObjects.step.packages.title')}
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('rentalObjects.step.packages.description')}
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

      {/* Package list */}
      {packages.map((pkg, index) => (
        <div
          key={pkg.id}
          style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-4)' }}>
            <Heading level={4} data-size="xs">
              {t('rentalObjects.package')} {index + 1}
            </Heading>
            <Button
              type="button"
              variant="tertiary"
              color="danger"
              size="sm"
              onClick={() => removePackage(index)}
            >
              {t('common.delete')}
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <Textfield
              label={t('rentalObjects.field.packageName')}
              value={pkg.name}
              onChange={(e) => updatePackage(index, { name: e.target.value })}
              required
            />

            <Textarea
              label={t('rentalObjects.field.packageDescription')}
              value={pkg.description || ''}
              onChange={(e) => updatePackage(index, { description: e.target.value })}
              rows={2}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
              <Textfield
                type="number"
                label={t('rentalObjects.field.price')}
                value={pkg.price.toString()}
                onChange={(e) => updatePackage(index, { price: parseFloat(e.target.value) || 0 })}
                min={0}
                required
              />

              <NativeSelect
                label={t('rentalObjects.field.currency')}
                value={pkg.currency}
                onChange={(e) => updatePackage(index, { currency: e.target.value })}
              >
                <option value="NOK">NOK</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </NativeSelect>

              <Textfield
                type="number"
                label={t('rentalObjects.field.maxParticipants')}
                value={pkg.maxParticipants?.toString() || ''}
                onChange={(e) => updatePackage(index, { maxParticipants: parseInt(e.target.value, 10) || undefined })}
                min={1}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
              <Textfield
                type="number"
                label={t('rentalObjects.field.duration')}
                value={pkg.duration?.toString() || ''}
                onChange={(e) => updatePackage(index, { duration: parseInt(e.target.value, 10) || undefined })}
                min={1}
              />

              <NativeSelect
                label={t('rentalObjects.field.durationUnit')}
                value={pkg.durationUnit || 'hours'}
                onChange={(e) => updatePackage(index, { durationUnit: e.target.value as 'minutes' | 'hours' | 'days' })}
              >
                <option value="minutes">{t('timeUnit.minutes')}</option>
                <option value="hours">{t('timeUnit.hours')}</option>
                <option value="days">{t('timeUnit.days')}</option>
              </NativeSelect>
            </div>
          </div>
        </div>
      ))}

      {/* Add package button */}
      <Button type="button" variant="secondary" onClick={addPackage}>
        + {t('rentalObjects.addPackage')}
      </Button>
    </div>
  );
}
