/**
 * DailyModeView
 *
 * Daily Mode View - Select full days from a month calendar
 */
import * as React from 'react';
import { Heading, Paragraph, Button } from '@digdir/designsystemet-react';
import { cn } from '../../../utils';
import {
  CalendarIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
} from '../../../primitives/icons';
import type {
  BookingSelection,
  BookingPriceCalculation,
  DayAvailability,
} from '../../../types/booking';

// Note: PriceSummary will be imported from extracted component once available
// For now, we reference it from the parent file - this will be updated in phase 3
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PriceSummary = ({ priceCalculation }: { priceCalculation: BookingPriceCalculation }): React.ReactElement => {
  // Temporary placeholder - will be replaced with proper import
  return (
    <div className="price-summary">
      {priceCalculation.items.map((item) => (
        <div key={item.id} className="price-item">
          <span>{item.label}</span>
          <span>
            {item.type === 'discount' ? '-' : ''}
            {item.total} {priceCalculation.currency}
          </span>
        </div>
      ))}
      {priceCalculation.vat > 0 && (
        <div className="price-item">
          <span>MVA</span>
          <span>{priceCalculation.vat} {priceCalculation.currency}</span>
        </div>
      )}
      <div className="price-total">
        <span>Totalt</span>
        <span>{priceCalculation.total} {priceCalculation.currency}</span>
      </div>
    </div>
  );
};

interface ModeViewProps {
  formatPrice: (amount: number, currency: string) => string;
  priceCalculation: BookingPriceCalculation;
  onContinue: () => void;
  canContinue: boolean;
}

export interface DailyModeViewProps extends ModeViewProps {
  calendarDate: Date;
  dayAvailability: DayAvailability[];
  selection: BookingSelection;
  onDateSelect: (date: Date) => void;
  onMonthChange: (direction: 'prev' | 'next') => void;
  currency: string;
}

export function DailyModeView({
  calendarDate,
  dayAvailability,
  selection,
  onDateSelect,
  onMonthChange,
  formatPrice,
  currency,
  priceCalculation,
  onContinue,
  canContinue,
}: DailyModeViewProps): React.ReactElement {
  const monthName = calendarDate.toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate calendar days
  const firstDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
  const lastDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
  const startDay = (firstDayOfMonth.getDay() + 6) % 7; // Adjust for Monday start
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), d));
  }

  const isDateSelected = (date: Date) => {
    return selection.slots.some(s => new Date(s.date).toDateString() === date.toDateString());
  };

  const getDateAvailability = (date: Date): DayAvailability | undefined => {
    return dayAvailability.find(d => new Date(d.date).toDateString() === date.toDateString());
  };

  return (
    <div className="selection-view daily-mode">
      <div className="calendar-panel">
        <div className="calendar-panel-header">
          <div className="calendar-title">
            <CalendarIcon size={20} />
            <Heading level={3} data-size="sm" style={{ margin: 0 }}>
              Velg dato
            </Heading>
          </div>
          <div className="calendar-navigation">
            <button type="button" className="nav-button" onClick={() => onMonthChange('prev')} aria-label="Forrige måned">
              <ChevronLeftIcon size={20} />
            </button>
            <span className="nav-date" style={{ minWidth: '160px' }}>{monthName}</span>
            <button type="button" className="nav-button" onClick={() => onMonthChange('next')} aria-label="Neste måned">
              <ChevronRightIcon size={20} />
            </button>
          </div>
        </div>

        <div className="month-calendar">
          <div className="month-header">
            {['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'].map(day => (
              <div key={day} className="month-day-name">{day}</div>
            ))}
          </div>
          <div className="month-grid">
            {calendarDays.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} className="month-day empty" />;

              const isPast = date < today;
              const isToday = date.toDateString() === today.toDateString();
              const selected = isDateSelected(date);
              const availability = getDateAvailability(date);
              const isAvailable = availability ? availability.isAvailable : !isPast;

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  className={cn(
                    'month-day',
                    isPast && 'past',
                    isToday && 'today',
                    selected && 'selected',
                    isAvailable && !isPast && 'available',
                    !isAvailable && 'unavailable'
                  )}
                  onClick={() => isAvailable && !isPast && onDateSelect(date)}
                  disabled={isPast || !isAvailable}
                >
                  <span className="day-number">{date.getDate()}</span>
                  {availability?.minPrice && !selected && (
                    <span className="day-price">{formatPrice(availability.minPrice, currency)}</span>
                  )}
                  {selected && <CheckIcon size={14} className="day-check" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-dot available" />
            <span>Ledig</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot selected" />
            <span>Valgt</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot unavailable" />
            <span>Opptatt</span>
          </div>
        </div>
      </div>

      <div className="summary-panel">
        <div className="summary-header">
          <CalendarIcon size={20} />
          <Heading level={3} data-size="sm" style={{ margin: 0 }}>
            Valgte datoer
          </Heading>
        </div>

        {selection.slots.length === 0 ? (
          <div className="summary-empty">
            <div className="empty-illustration">
              <CalendarIcon size={40} />
            </div>
            <Paragraph data-size="sm" style={{ margin: 0, textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Klikk på datoer i kalenderen for å velge
            </Paragraph>
          </div>
        ) : (
          <>
            <div className="selected-slots-list">
              {selection.slots
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((slot, index) => (
                  <div key={slot.id} className="selected-slot-item" style={{ animationDelay: `${index * 40}ms` }}>
                    <div className="slot-info">
                      <span className="slot-date">
                        {new Date(slot.date).toLocaleDateString('nb-NO', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </span>
                      <span className="slot-time-range">Hele dagen</span>
                    </div>
                    <button
                      type="button"
                      className="slot-remove"
                      onClick={() => onDateSelect(new Date(slot.date))}
                      aria-label="Fjern"
                    >
                      <CloseIcon size={14} />
                    </button>
                  </div>
                ))}
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
