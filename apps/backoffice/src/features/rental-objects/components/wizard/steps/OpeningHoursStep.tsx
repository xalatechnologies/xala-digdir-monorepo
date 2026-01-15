/**
 * Opening Hours Step Component
 * For configuring weekly opening hours
 */

import { useT } from '@xala/i18n';
import { Textfield, Heading, Paragraph, Switch, Alert } from '@xala/ds';
import type { RentalObject, RentalObjectOpeningHours } from '../../../types';

interface OpeningHoursStepProps {
  data: Partial<RentalObject>;
  onChange: (data: Partial<RentalObject>) => void;
  errors: string[];
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export function OpeningHoursStep({ data, onChange, errors }: OpeningHoursStepProps): React.ReactElement {
  const t = useT();
  const openingHours = data.openingHours || {};

  const updateDay = (day: typeof DAYS[number], open: string | null, close: string | null): void => {
    const newHours: RentalObjectOpeningHours = { ...openingHours };
    if (open === null && close === null) {
      newHours[day] = null;
    } else {
      newHours[day] = {
        open: open || openingHours[day]?.open || '08:00',
        close: close || openingHours[day]?.close || '20:00',
      };
    }
    onChange({ openingHours: newHours });
  };

  const toggleDay = (day: typeof DAYS[number], enabled: boolean): void => {
    if (enabled) {
      updateDay(day, '08:00', '20:00');
    } else {
      updateDay(day, null, null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {t('rentalObjects.step.openingHours.title')}
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('rentalObjects.step.openingHours.description')}
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
        {DAYS.map((day) => {
          const dayHours = openingHours[day];
          const isOpen = dayHours !== null && dayHours !== undefined;

          return (
            <div
              key={day}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-4)',
                padding: 'var(--ds-spacing-3)',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                borderRadius: 'var(--ds-border-radius-md)',
              }}
            >
              <div style={{ width: '120px' }}>
                <Switch
                  checked={isOpen}
                  onChange={(e) => toggleDay(day, e.target.checked)}
                >
                  {t(`day.${day}`)}
                </Switch>
              </div>

              {isOpen && (
                <>
                  <Textfield
                    type="time"
                    label={t('rentalObjects.field.opens')}
                    value={dayHours?.open || '08:00'}
                    onChange={(e) => updateDay(day, e.target.value, null)}
                    style={{ width: '140px' }}
                  />
                  <span>–</span>
                  <Textfield
                    type="time"
                    label={t('rentalObjects.field.closes')}
                    value={dayHours?.close || '20:00'}
                    onChange={(e) => updateDay(day, null, e.target.value)}
                    style={{ width: '140px' }}
                  />
                </>
              )}

              {!isOpen && (
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', fontStyle: 'italic' }}>
                  {t('rentalObjects.closed')}
                </Paragraph>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
