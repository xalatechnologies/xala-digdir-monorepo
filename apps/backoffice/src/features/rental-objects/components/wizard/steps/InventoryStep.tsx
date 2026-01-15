/**
 * Inventory Step Component
 * For equipment and inventory quantity management
 */

import { useT } from '@xala/i18n';
import { Textfield, Heading, Paragraph, Switch, Alert } from '@xala/ds';
import type { RentalObject } from '../../../types';

interface InventoryStepProps {
  data: Partial<RentalObject>;
  onChange: (data: Partial<RentalObject>) => void;
  errors: string[];
}

export function InventoryStep({ data, onChange, errors }: InventoryStepProps): React.ReactElement {
  const t = useT();
  const inventory = data.inventory || { enabled: true, totalQuantity: 1 };

  const updateInventory = (updates: Partial<typeof inventory>): void => {
    onChange({
      inventory: {
        ...inventory,
        ...updates,
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {t('rentalObjects.step.inventory.title')}
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('rentalObjects.step.inventory.description')}
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

      <Switch
        checked={inventory.enabled}
        onChange={(e) => updateInventory({ enabled: e.target.checked })}
      >
        {t('rentalObjects.field.inventoryTracking')}
      </Switch>

      {inventory.enabled && (
        <>
          <Textfield
            type="number"
            label={t('rentalObjects.field.totalQuantity')}
            value={inventory.totalQuantity?.toString() || ''}
            onChange={(e) => updateInventory({ totalQuantity: parseInt(e.target.value, 10) || 1 })}
            min={1}
            required
            description={t('rentalObjects.field.totalQuantityDescription')}
          />

          <div
            style={{
              padding: 'var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-info-surface-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: '1px solid var(--ds-color-info-border-default)',
            }}
          >
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              💡 {t('rentalObjects.step.inventory.hint')}
            </Paragraph>
          </div>
        </>
      )}
    </div>
  );
}
