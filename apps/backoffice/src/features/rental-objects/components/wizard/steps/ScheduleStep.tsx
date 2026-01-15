/**
 * Schedule Step Component
 * For event sessions and scheduling
 */

import { useT } from '@xala/i18n';
import { Textfield, Textarea, Heading, Paragraph, Button, Alert, Switch } from '@xala/ds';
import type { RentalObject, RentalObjectSession } from '../../../types';

interface ScheduleStepProps {
  data: Partial<RentalObject>;
  onChange: (data: Partial<RentalObject>) => void;
  errors: string[];
}

export function ScheduleStep({ data, onChange, errors }: ScheduleStepProps): React.ReactElement {
  const t = useT();
  const schedule = data.schedule || { sessions: [] };

  const addSession = (): void => {
    const newSession: RentalObjectSession = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
    };
    onChange({
      schedule: {
        ...schedule,
        sessions: [...schedule.sessions, newSession],
      },
    });
  };

  const updateSession = (index: number, updates: Partial<RentalObjectSession>): void => {
    const updated = schedule.sessions.map((session, i) =>
      i === index ? { ...session, ...updates } : session
    );
    onChange({
      schedule: {
        ...schedule,
        sessions: updated,
      },
    });
  };

  const removeSession = (index: number): void => {
    onChange({
      schedule: {
        ...schedule,
        sessions: schedule.sessions.filter((_, i) => i !== index),
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {t('rentalObjects.step.schedule.title')}
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('rentalObjects.step.schedule.description')}
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

      {/* Recurring toggle */}
      <Switch
        checked={schedule.recurring || false}
        onChange={(e) => onChange({
          schedule: {
            ...schedule,
            recurring: e.target.checked,
          },
        })}
      >
        {t('rentalObjects.field.recurringEvent')}
      </Switch>

      {/* Sessions list */}
      {schedule.sessions.map((session, index) => (
        <div
          key={session.id}
          style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-4)' }}>
            <Heading level={4} data-size="xs">
              {t('rentalObjects.session')} {index + 1}
            </Heading>
            <Button
              type="button"
              variant="tertiary"
              color="danger"
              size="sm"
              onClick={() => removeSession(index)}
            >
              {t('common.delete')}
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <Textfield
              type="date"
              label={t('rentalObjects.field.date')}
              value={session.date}
              onChange={(e) => updateSession(index, { date: e.target.value })}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
              <Textfield
                type="time"
                label={t('rentalObjects.field.startTime')}
                value={session.startTime}
                onChange={(e) => updateSession(index, { startTime: e.target.value })}
                required
              />

              <Textfield
                type="time"
                label={t('rentalObjects.field.endTime')}
                value={session.endTime}
                onChange={(e) => updateSession(index, { endTime: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
              <Textfield
                type="number"
                label={t('rentalObjects.field.maxParticipants')}
                value={session.maxParticipants?.toString() || ''}
                onChange={(e) => updateSession(index, { maxParticipants: parseInt(e.target.value, 10) || undefined })}
                min={1}
              />

              <Textfield
                label={t('rentalObjects.field.instructor')}
                value={session.instructor || ''}
                onChange={(e) => updateSession(index, { instructor: e.target.value })}
              />
            </div>

            <Textarea
              label={t('rentalObjects.field.notes')}
              value={session.notes || ''}
              onChange={(e) => updateSession(index, { notes: e.target.value })}
              rows={2}
            />
          </div>
        </div>
      ))}

      {/* Add session button */}
      <Button type="button" variant="secondary" onClick={addSession}>
        + {t('rentalObjects.addSession')}
      </Button>
    </div>
  );
}
