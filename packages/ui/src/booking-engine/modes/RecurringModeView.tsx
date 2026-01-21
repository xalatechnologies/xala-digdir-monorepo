/**
 * RecurringModeView
 *
 * Recurring Mode View - Set up seasonal/recurring bookings with weekday selection
 */
import * as React from 'react';
import { Heading, Paragraph, Button } from '@digdir/designsystemet-react';
import { CalendarIcon, ChevronRightIcon } from '@xalatechnologies/platform/ui';
import { cn } from '../utils';
import { PriceSummary } from '../components/PriceSummary';
import type {
  BookingConfig,
  BookingSelection,
  BookingPriceCalculation,
} from '@digilist/contracts';

interface ModeViewProps {
  formatPrice: (amount: number, currency: string) => string;
  priceCalculation: BookingPriceCalculation;
  onContinue: () => void;
  canContinue: boolean;
}

export interface RecurringModeViewProps extends ModeViewProps {
  config: BookingConfig;
  selection: BookingSelection;
  onRecurringChange: (pattern: BookingSelection['recurring']) => void;
}

export function RecurringModeView({
  config: _config,
  selection,
  onRecurringChange,
  formatPrice: _formatPrice,
  priceCalculation,
  onContinue,
  canContinue,
}: RecurringModeViewProps): React.ReactElement {
  const [weekdays, setWeekdays] = React.useState<number[]>(selection.recurring?.weekdays || []);
  const [startDate, setStartDate] = React.useState<Date>(selection.recurring?.startDate || new Date());
  const [endDate, setEndDate] = React.useState<Date>(
    selection.recurring?.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  );
  const [startTime, setStartTime] = React.useState(selection.recurring?.startTime || '17:00');
  const [endTime, setEndTime] = React.useState(selection.recurring?.endTime || '19:00');

  const dayNames = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lor', 'Son'];
  const timeOptions = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  const toggleWeekday = (day: number) => {
    const newWeekdays = weekdays.includes(day)
      ? weekdays.filter(d => d !== day)
      : [...weekdays, day].sort();
    setWeekdays(newWeekdays);
    updateRecurring(newWeekdays, startDate, endDate, startTime, endTime);
  };

  const updateRecurring = (days: number[], start: Date, end: Date, sTime: string, eTime: string) => {
    if (days.length > 0) {
      onRecurringChange({ weekdays: days, startDate: start, endDate: end, startTime: sTime, endTime: eTime });
    } else {
      onRecurringChange(undefined);
    }
  };

  // Calculate total sessions
  const totalSessions = React.useMemo(() => {
    if (weekdays.length === 0) return 0;
    let count = 0;
    const current = new Date(startDate);
    while (current <= endDate) {
      const dayOfWeek = (current.getDay() + 6) % 7; // Adjust for Monday = 0
      if (weekdays.includes(dayOfWeek)) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }, [weekdays, startDate, endDate]);

  return (
    <div className="selection-view recurring-mode">
      <div className="recurring-panel">
        <Heading level={2} data-size="lg" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Sett opp sesongbooking
        </Heading>

        <div className="recurring-section">
          <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
            Velg ukedager
          </Heading>
          <div className="weekday-selector">
            {dayNames.map((name, i) => (
              <button
                key={i}
                type="button"
                className={cn('weekday-btn', weekdays.includes(i) && 'selected')}
                onClick={() => toggleWeekday(i)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="recurring-section">
          <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
            Tidspunkt
          </Heading>
          <div className="time-selector">
            <div className="time-input">
              <label>Fra</label>
              <select
                value={startTime}
                onChange={e => { setStartTime(e.target.value); updateRecurring(weekdays, startDate, endDate, e.target.value, endTime); }}
              >
                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <span className="time-separator">-</span>
            <div className="time-input">
              <label>Til</label>
              <select
                value={endTime}
                onChange={e => { setEndTime(e.target.value); updateRecurring(weekdays, startDate, endDate, startTime, e.target.value); }}
              >
                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="recurring-section">
          <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
            Periode
          </Heading>
          <div className="date-selector">
            <div className="date-input">
              <label>Fra dato</label>
              <input
                type="date"
                value={startDate.toISOString().split('T')[0]}
                onChange={e => { const d = new Date(e.target.value); setStartDate(d); updateRecurring(weekdays, d, endDate, startTime, endTime); }}
              />
            </div>
            <div className="date-input">
              <label>Til dato</label>
              <input
                type="date"
                value={endDate.toISOString().split('T')[0]}
                onChange={e => { const d = new Date(e.target.value); setEndDate(d); updateRecurring(weekdays, startDate, d, startTime, endTime); }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="summary-panel">
        <div className="summary-header">
          <CalendarIcon size={20} />
          <Heading level={3} data-size="sm" style={{ margin: 0 }}>
            Sesongsammendrag
          </Heading>
        </div>

        {weekdays.length === 0 ? (
          <div className="summary-empty">
            <div className="empty-illustration">
              <CalendarIcon size={40} />
            </div>
            <Paragraph data-size="sm" style={{ margin: 0, textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Velg ukedager for a se sammendrag
            </Paragraph>
          </div>
        ) : (
          <>
            <div className="recurring-summary">
              <div className="summary-row">
                <span>Ukedager</span>
                <span>{weekdays.map(d => dayNames[d]).join(', ')}</span>
              </div>
              <div className="summary-row">
                <span>Tidspunkt</span>
                <span>{startTime} - {endTime}</span>
              </div>
              <div className="summary-row">
                <span>Periode</span>
                <span>{startDate.toLocaleDateString('nb-NO')} - {endDate.toLocaleDateString('nb-NO')}</span>
              </div>
              <div className="summary-row highlight">
                <span>Antall okter</span>
                <span>{totalSessions}</span>
              </div>
            </div>

            <PriceSummary priceCalculation={priceCalculation} />

            <div className="summary-actions">
              <Button type="button" variant="primary" data-color="accent" onClick={onContinue} disabled={!canContinue}>
                Fortsett
                <ChevronRightIcon size={18} />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
