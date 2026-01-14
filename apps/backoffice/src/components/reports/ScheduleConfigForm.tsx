/**
 * ScheduleConfigForm Component
 * Configure report schedule settings (frequency, day, time, timezone)
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Stack,
  Heading,
  Paragraph,
  FormField,
  Select,
  Textfield,
  Switch,
  Badge,
} from '@xala/ds';
import type { ScheduleConfig, ReportScheduleFrequency } from '@digilist/client-sdk';

interface ScheduleConfigFormProps {
  value: Partial<ScheduleConfig>;
  onChange: (config: Partial<ScheduleConfig>) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Søndag' },
  { value: 1, label: 'Mandag' },
  { value: 2, label: 'Tirsdag' },
  { value: 3, label: 'Onsdag' },
  { value: 4, label: 'Torsdag' },
  { value: 5, label: 'Fredag' },
  { value: 6, label: 'Lørdag' },
];

const TIMEZONES = [
  { value: 'Europe/Oslo', label: 'Oslo (CET/CEST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
];

export function ScheduleConfigForm({ value, onChange }: ScheduleConfigFormProps) {
  const [config, setConfig] = useState<Partial<ScheduleConfig>>({
    frequency: 'weekly',
    dayOfWeek: 1,
    time: '09:00',
    timezone: 'Europe/Oslo',
    enabled: true,
    ...value,
  });

  useEffect(() => {
    onChange(config);
  }, [config, onChange]);

  const handleFrequencyChange = (frequency: ReportScheduleFrequency) => {
    const newConfig: Partial<ScheduleConfig> = {
      ...config,
      frequency,
    };

    // Reset conditional fields when frequency changes
    if (frequency === 'daily') {
      delete newConfig.dayOfWeek;
      delete newConfig.dayOfMonth;
    } else if (frequency === 'weekly') {
      newConfig.dayOfWeek = config.dayOfWeek ?? 1;
      delete newConfig.dayOfMonth;
    } else if (frequency === 'monthly' || frequency === 'quarterly') {
      newConfig.dayOfMonth = config.dayOfMonth ?? 1;
      delete newConfig.dayOfWeek;
    }

    setConfig(newConfig);
  };

  const handleDayOfWeekChange = (dayOfWeek: number) => {
    setConfig({ ...config, dayOfWeek });
  };

  const handleDayOfMonthChange = (dayOfMonth: number) => {
    setConfig({ ...config, dayOfMonth });
  };

  const handleTimeChange = (time: string) => {
    setConfig({ ...config, time });
  };

  const handleTimezoneChange = (timezone: string) => {
    setConfig({ ...config, timezone });
  };

  const handleEnabledChange = (enabled: boolean) => {
    setConfig({ ...config, enabled });
  };

  return (
    <Card>
      <Stack spacing={5}>
        <div>
          <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
            Planleggingsinnstillinger
          </Heading>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            Konfigurer når rapporten skal genereres og sendes
          </Paragraph>
        </div>

        <Stack spacing={4}>
          {/* Frequency */}
          <FormField
            label="Frekvens"
            description="Hvor ofte skal rapporten genereres?"
          >
            <Select
              value={config.frequency || 'weekly'}
              onChange={(e) => handleFrequencyChange(e.target.value as ReportScheduleFrequency)}
            >
              <option value="daily">Daglig</option>
              <option value="weekly">Ukentlig</option>
              <option value="monthly">Månedlig</option>
              <option value="quarterly">Kvartalsvis</option>
            </Select>
          </FormField>

          {/* Day of Week (for weekly) */}
          {config.frequency === 'weekly' && (
            <FormField
              label="Ukedag"
              description="Hvilken dag skal rapporten sendes?"
            >
              <Select
                value={config.dayOfWeek ?? 1}
                onChange={(e) => handleDayOfWeekChange(Number(e.target.value))}
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </Select>
            </FormField>
          )}

          {/* Day of Month (for monthly/quarterly) */}
          {(config.frequency === 'monthly' || config.frequency === 'quarterly') && (
            <FormField
              label="Dag i måneden"
              description={`Hvilken dag i måneden skal rapporten sendes? (1-31)`}
            >
              <Textfield
                type="number"
                min={1}
                max={31}
                value={String(config.dayOfMonth ?? 1)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDayOfMonthChange(Number(e.target.value))}
                aria-label="Dag i måneden"
              />
            </FormField>
          )}

          {/* Time */}
          <FormField
            label="Tidspunkt"
            description="Når på dagen skal rapporten genereres?"
          >
            <Textfield
              type="time"
              value={config.time || '09:00'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTimeChange(e.target.value)}
              aria-label="Tidspunkt"
            />
          </FormField>

          {/* Timezone */}
          <FormField
            label="Tidssone"
            description="Velg tidssone for planleggingen"
          >
            <Select
              value={config.timezone || 'Europe/Oslo'}
              onChange={(e) => handleTimezoneChange(e.target.value)}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </Select>
          </FormField>

          {/* Enabled Switch */}
          <FormField
            label="Aktivert"
            description="Slå av og på planleggingen"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
              <Switch
                checked={config.enabled ?? true}
                onCheckedChange={(checked: boolean) => handleEnabledChange(checked)}
              />
              <Badge
                color={config.enabled ? 'success' : 'neutral'}
                style={{ marginLeft: 'var(--ds-spacing-2)' }}
              >
                {config.enabled ? 'Aktiv' : 'Inaktiv'}
              </Badge>
            </div>
          </FormField>
        </Stack>

        {/* Preview */}
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderRadius: 'var(--ds-border-radius-md)',
          }}
        >
          <Paragraph data-size="sm" style={{ fontWeight: 500, marginBottom: 'var(--ds-spacing-2)' }}>
            Oppsummering av planlegging
          </Paragraph>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            {config.frequency === 'daily' && `Rapporten genereres daglig kl. ${config.time || '09:00'}`}
            {config.frequency === 'weekly' && (
              <>
                Rapporten genereres hver{' '}
                {DAYS_OF_WEEK.find((d) => d.value === config.dayOfWeek)?.label.toLowerCase() || 'mandag'}{' '}
                kl. {config.time || '09:00'}
              </>
            )}
            {config.frequency === 'monthly' && (
              <>
                Rapporten genereres den {config.dayOfMonth || 1}. hver måned kl. {config.time || '09:00'}
              </>
            )}
            {config.frequency === 'quarterly' && (
              <>
                Rapporten genereres den {config.dayOfMonth || 1}. i første måned i hvert kvartal kl.{' '}
                {config.time || '09:00'}
              </>
            )}
            {' '}({config.timezone || 'Europe/Oslo'})
          </Paragraph>
        </div>
      </Stack>
    </Card>
  );
}
