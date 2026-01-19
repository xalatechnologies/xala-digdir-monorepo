/**
 * Schedule Step Component
 * For configuring experience scheduling (experiences only)
 */

import { useT } from '@xala/i18n';
import {
  Heading,
  Paragraph,
  Alert,
  Card,
  Textfield,
  Checkbox,
  NativeSelect,
  CalendarIcon,
  ClockIcon,
} from '@xala/ds';
import type { UseRentalObjectWizardReturn } from '../../../hooks/useRentalObjectWizard';

export interface ScheduleStepProps {
  wizard: UseRentalObjectWizardReturn;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
type Day = (typeof DAYS)[number];

export function ScheduleStep({ wizard }: ScheduleStepProps) {
  const t = useT();
  const { formData, updateFormData, errors } = wizard;
  const currentStepErrors = errors['schedule'] || [];

  const scheduleType = formData.scheduleType || 'on-demand';
  const recurringPattern = formData.recurringPattern || 'weekly';
  const startTime = formData.scheduleStartTime || '09:00';
  const endTime = formData.scheduleEndTime || '17:00';
  const daysOfWeek = (formData.daysOfWeek || []) as Day[];

  const toggleDay = (day: Day) => {
    const updated = daysOfWeek.includes(day)
      ? daysOfWeek.filter((d) => d !== day)
      : [...daysOfWeek, day];
    updateFormData({ daysOfWeek: updated });
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-3)',
              marginBottom: 'var(--ds-spacing-2)',
            }}
          >
            <CalendarIcon
              style={{
                width: '2rem',
                height: '2rem',
                color: 'var(--ds-color-accent-text-default)',
              }}
              aria-hidden="true"
            />
            <Heading level={2} data-size="md" style={{ margin: 0 }}>
              {t('wizard.step.schedule')}
            </Heading>
          </div>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('rentalObjects.scheduleDescription')}
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

        {/* Schedule Type */}
        <div>
          <Heading level={4} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
            {t('form.schedule.type')}
          </Heading>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            {['fixed', 'on-demand'].map((type) => (
              <label
                key={type}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--ds-spacing-3)',
                  padding: 'var(--ds-spacing-4)',
                  backgroundColor:
                    scheduleType === type
                      ? 'var(--ds-color-accent-surface-default)'
                      : 'var(--ds-color-neutral-surface-subtle)',
                  border:
                    scheduleType === type
                      ? '2px solid var(--ds-color-accent-border-default)'
                      : '1px solid var(--ds-color-neutral-border-subtle)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  type="radio"
                  name="scheduleType"
                  value={type}
                  checked={scheduleType === type}
                  onChange={(e) => updateFormData({ scheduleType: e.target.value })}
                  style={{ marginTop: '0.25rem' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-1)' }}>
                    {t(`form.schedule.${type}`)}
                  </div>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t(`form.schedule.${type}Description`)}
                  </Paragraph>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Fixed Schedule Configuration */}
        {scheduleType === 'fixed' && (
          <div
            style={{
              padding: 'var(--ds-spacing-5)',
              backgroundColor: 'var(--ds-color-accent-surface-subtle)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: '1px solid var(--ds-color-accent-border-subtle)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
              {/* Recurring Pattern */}
              <NativeSelect
                label={t('form.schedule.recurringPattern')}
                value={recurringPattern}
                onChange={(e) => updateFormData({ recurringPattern: e.target.value })}
              >
                <option value="daily">{t('form.schedule.pattern.daily')}</option>
                <option value="weekly">{t('form.schedule.pattern.weekly')}</option>
                <option value="specific">{t('form.schedule.pattern.specific')}</option>
              </NativeSelect>

              {/* Time Configuration */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-2)',
                    marginBottom: 'var(--ds-spacing-3)',
                  }}
                >
                  <ClockIcon
                    style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      color: 'var(--ds-color-accent-text-default)',
                    }}
                    aria-hidden="true"
                  />
                  <Paragraph
                    data-size="sm"
                    style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}
                  >
                    {t('form.schedule.timeRange')}
                  </Paragraph>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
                  <Textfield
                    type="time"
                    label={t('form.schedule.startTime')}
                    value={startTime}
                    onChange={(e) => updateFormData({ scheduleStartTime: e.target.value })}
                    required
                  />
                  <Textfield
                    type="time"
                    label={t('form.schedule.endTime')}
                    value={endTime}
                    onChange={(e) => updateFormData({ scheduleEndTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Days of Week (only for weekly pattern) */}
              {recurringPattern === 'weekly' && (
                <div>
                  <Paragraph
                    data-size="sm"
                    style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)', fontWeight: 'var(--ds-font-weight-medium)' }}
                  >
                    {t('form.schedule.daysOfWeek')}
                  </Paragraph>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                      gap: 'var(--ds-spacing-2)',
                    }}
                  >
                    {DAYS.map((day) => {
                      const isSelected = daysOfWeek.includes(day);
                      return (
                        <label
                          key={day}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--ds-spacing-2)',
                            padding: 'var(--ds-spacing-2)',
                            backgroundColor: isSelected
                              ? 'var(--ds-color-success-surface-default)'
                              : 'var(--ds-color-neutral-surface-default)',
                            border: isSelected
                              ? '2px solid var(--ds-color-success-border-default)'
                              : '1px solid var(--ds-color-neutral-border-subtle)',
                            borderRadius: 'var(--ds-border-radius-sm)',
                            cursor: 'pointer',
                            fontSize: 'var(--ds-font-size-sm)',
                          }}
                        >
                          <Checkbox
                            checked={isSelected}
                            onChange={() => toggleDay(day)}
                            style={{ margin: 0 }}
                          >
                            {t(`day.${day}`)}
                          </Checkbox>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
            {t('rentalObjects.scheduleInfo')}
          </Paragraph>
        </div>
      </div>
    </Card>
  );
}
