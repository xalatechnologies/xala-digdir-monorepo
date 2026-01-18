/**
 * Opening Hours Step Component
 * For configuring weekly opening hours (venues only)
 */

import { useT } from '@xala/i18n';
import {
  Heading,
  Paragraph,
  Alert,
  Card,
  Textfield,
  Checkbox,
  Button,
  Stack,
} from '@xala/ds';
import type { UseRentalObjectWizardReturn } from '@xala/backoffice/hooks/useRentalObjectWizard';

export interface OpeningHoursStepProps {
  wizard: UseRentalObjectWizardReturn;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
type Day = (typeof DAYS)[number];

interface DayHours {
  open: string;
  close: string;
}

export function OpeningHoursStep({ wizard }: OpeningHoursStepProps) {
  const t = useT();
  const { formData, updateFormData, errors } = wizard;
  const currentStepErrors = errors['opening-hours'] || [];

  const openingHours = (formData.openingHours || {}) as Record<Day, DayHours | null>;

  const updateDay = (day: Day, hours: DayHours | null) => {
    updateFormData({
      openingHours: {
        ...openingHours,
        [day]: hours,
      },
    });
  };

  const toggleDay = (day: Day, enabled: boolean) => {
    if (enabled) {
      updateDay(day, { open: '08:00', close: '20:00' });
    } else {
      updateDay(day, null);
    }
  };

  const updateDayTime = (day: Day, field: 'open' | 'close', value: string) => {
    const current = openingHours[day];
    if (current) {
      updateDay(day, { ...current, [field]: value });
    }
  };

  // Bulk actions
  const applyToWeekdays = () => {
    const weekdays: Day[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const mondayHours = openingHours.monday;

    if (mondayHours) {
      const updated = { ...openingHours };
      weekdays.forEach((day) => {
        updated[day] = { ...mondayHours };
      });
      updateFormData({ openingHours: updated });
    }
  };

  const applyToWeekend = () => {
    const weekend: Day[] = ['saturday', 'sunday'];
    const saturdayHours = openingHours.saturday;

    if (saturdayHours) {
      const updated = { ...openingHours };
      weekend.forEach((day) => {
        updated[day] = { ...saturdayHours };
      });
      updateFormData({ openingHours: updated });
    }
  };

  const copyFromMonday = (targetDay: Day) => {
    const mondayHours = openingHours.monday;
    if (mondayHours) {
      updateDay(targetDay, { ...mondayHours });
    }
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
            {t('wizard.step.openingHours')}
          </Heading>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('rentalObjects.openingHoursDescription')}
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

        {/* Bulk Actions */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-3)',
            flexWrap: 'wrap',
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderRadius: 'var(--ds-border-radius-md)',
          }}
        >
          <Button
            type="button"
            variant="tertiary"
            size="sm"
            onClick={applyToWeekdays}
            disabled={!openingHours.monday}
          >
            {t('form.openingHours.applyToWeekdays')}
          </Button>
          <Button
            type="button"
            variant="tertiary"
            size="sm"
            onClick={applyToWeekend}
            disabled={!openingHours.saturday}
          >
            {t('form.openingHours.applyToWeekend')}
          </Button>
        </div>

        {/* Weekly Schedule */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          {DAYS.map((day) => {
            const dayHours = openingHours[day];
            const isOpen = dayHours !== null && dayHours !== undefined;

            return (
              <div
                key={day}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-4)',
                  padding: 'var(--ds-spacing-4)',
                  backgroundColor: 'var(--ds-color-neutral-surface-default)',
                  border: '1px solid var(--ds-color-neutral-border-subtle)',
                  borderRadius: 'var(--ds-border-radius-md)',
                }}
              >
                {/* Day Checkbox */}
                <div style={{ minWidth: '130px' }}>
                  <Checkbox checked={isOpen} onChange={(e) => toggleDay(day, e.target.checked)}>
                    <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {t(`day.${day}`)}
                    </span>
                  </Checkbox>
                </div>

                {/* Time Inputs */}
                {isOpen ? (
                  <Stack direction="row" gap={3} align="center">
                    <Textfield
                      type="time"
                      label={t('form.openingHours.opening')}
                      value={dayHours?.open || '08:00'}
                      onChange={(e) => updateDayTime(day, 'open', e.target.value)}
                      size="sm"
                      style={{ width: '140px' }}
                    />
                    <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>–</span>
                    <Textfield
                      type="time"
                      label={t('form.openingHours.closing')}
                      value={dayHours?.close || '20:00'}
                      onChange={(e) => updateDayTime(day, 'close', e.target.value)}
                      size="sm"
                      style={{ width: '140px' }}
                    />
                  </Stack>
                ) : (
                  <Paragraph
                    data-size="sm"
                    style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', fontStyle: 'italic' }}
                  >
                    {t('form.openingHours.closed')}
                  </Paragraph>
                )}

                {/* Copy from Monday */}
                {day !== 'monday' && (
                  <Button
                    type="button"
                    variant="tertiary"
                    size="sm"
                    onClick={() => copyFromMonday(day)}
                    disabled={!openingHours.monday}
                  >
                    {t('form.openingHours.copyFromMonday')}
                  </Button>
                )}
                {day === 'monday' && <div style={{ width: '120px' }} />}
              </div>
            );
          })}
        </div>

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
            💡 {t('rentalObjects.openingHoursInfo')}
          </Paragraph>
        </div>
      </div>
    </Card>
  );
}
