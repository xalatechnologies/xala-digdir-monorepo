/**
 * Requirements Step Component
 * For vehicle-specific requirements (licenses, age, etc.)
 */

import { useT } from '@xala/i18n';
import { Textfield, Heading, Paragraph, Switch, Checkbox, Alert } from '@xala/ds';
import type { RentalObject } from '../../../types';

interface RequirementsStepProps {
  data: Partial<RentalObject>;
  onChange: (data: Partial<RentalObject>) => void;
  errors: string[];
}

const LICENSE_TYPES = ['B', 'B1', 'BE', 'C', 'C1', 'CE', 'D', 'D1', 'DE'];

export function RequirementsStep({ data, onChange, errors }: RequirementsStepProps): React.ReactElement {
  const t = useT();
  const requirements = data.requirements || {};

  const updateRequirements = (updates: Partial<typeof requirements>): void => {
    onChange({
      requirements: {
        ...requirements,
        ...updates,
      },
    });
  };

  const toggleLicenseType = (type: string, checked: boolean): void => {
    const current = requirements.licenseTypes || [];
    const updated = checked
      ? [...current, type]
      : current.filter((t) => t !== type);
    updateRequirements({ licenseTypes: updated });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {t('rentalObjects.step.requirements.title')}
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('rentalObjects.step.requirements.description')}
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

      {/* Minimum Age */}
      <Textfield
        type="number"
        label={t('rentalObjects.field.minimumAge')}
        value={requirements.minimumAge?.toString() || ''}
        onChange={(e) => updateRequirements({ minimumAge: parseInt(e.target.value, 10) || undefined })}
        min={0}
        max={100}
        description={t('rentalObjects.field.minimumAgeDescription')}
      />

      {/* License Required */}
      <div>
        <Switch
          checked={requirements.licenseRequired || false}
          onChange={(e) => updateRequirements({ licenseRequired: e.target.checked })}
        >
          {t('rentalObjects.field.licenseRequired')}
        </Switch>

        {requirements.licenseRequired && (
          <div
            style={{
              marginTop: 'var(--ds-spacing-4)',
              padding: 'var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              borderRadius: 'var(--ds-border-radius-md)',
            }}
          >
            <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
              {t('rentalObjects.field.selectLicenseTypes')}
            </Paragraph>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-3)' }}>
              {LICENSE_TYPES.map((type) => (
                <Checkbox
                  key={type}
                  checked={requirements.licenseTypes?.includes(type) || false}
                  onChange={(e) => toggleLicenseType(type, e.target.checked)}
                >
                  {t(`license.${type}`, type)}
                </Checkbox>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Deposit Required */}
      <div>
        <Switch
          checked={requirements.depositRequired || false}
          onChange={(e) => updateRequirements({ depositRequired: e.target.checked })}
        >
          {t('rentalObjects.field.depositRequired')}
        </Switch>

        {requirements.depositRequired && (
          <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
            <Textfield
              type="number"
              label={t('rentalObjects.field.depositAmount')}
              value={requirements.depositAmount?.toString() || ''}
              onChange={(e) => updateRequirements({ depositAmount: parseInt(e.target.value, 10) || undefined })}
              min={0}
            />
          </div>
        )}
      </div>

      {/* Insurance Required */}
      <Switch
        checked={requirements.insuranceRequired || false}
        onChange={(e) => updateRequirements({ insuranceRequired: e.target.checked })}
      >
        {t('rentalObjects.field.insuranceRequired')}
      </Switch>
    </div>
  );
}
