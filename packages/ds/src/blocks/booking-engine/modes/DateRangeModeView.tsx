/**
 * DateRangeModeView
 *
 * Date Range Mode View - Select start and end date
 */
import * as React from 'react';
import { Heading, Paragraph, Button } from '@digdir/designsystemet-react';
import { cn } from '../../../utils';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
} from '../../../primitives/icons';
import type {
  BookingSelection,
  BookingPriceCalculation,
  DayAvailability,
  BookingPricing,
} from '../../../types/booking';
import { formatPrice, formatPriceUnit } from '../../../types/booking';

// Note: PriceSummary will be imported from extracted component once available
// For now, we reference it from the parent file - this will be updated in phase 3
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PriceSummary = ({ priceCalculation }: { priceCalculation: BookingPriceCalculation }): React.ReactElement => {
  // Temporary placeholder - will be replaced with proper import
  return (
    <div className="price-summary">
      {priceCalculation.items.map(item => (
        <div key={item.id} className={cn('price-row', item.type)}>
          <span className="price-label">{item.label}</span>
          <span className="price-value">
            {item.type === 'discount' ? '-' : ''}
            {formatPrice(item.total, priceCalculation.currency)}
          </span>
        </div>
      ))}
      {priceCalculation.vat > 0 && (
        <div className="price-row vat">
          <span className="price-label">MVA</span>
          <span className="price-value">{formatPrice(priceCalculation.vat, priceCalculation.currency)}</span>
        </div>
      )}
      <div className="price-row total">
        <span className="price-label">Totalt</span>
        <span className="price-value">{formatPrice(priceCalculation.total, priceCalculation.currency)}</span>
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

export interface DateRangeModeViewProps extends ModeViewProps {
  calendarDate: Date;
  dayAvailability: DayAvailability[];
  selection: BookingSelection;
  onRangeSelect: (start: Date, end: Date | null) => void;
  onMonthChange: (direction: 'prev' | 'next') => void;
  currency: string;
  pricing: BookingPricing;
}

export function DateRangeModeView({
  calendarDate,
  dayAvailability: _dayAvailability,
  selection,
  onRangeSelect,
  onMonthChange,
  formatPrice,
  currency,
  pricing,
  priceCalculation,
  onContinue,
  canContinue,
}: DateRangeModeViewProps): React.ReactElement {
  const [rangeStart, setRangeStart] = React.useState<Date | null>(selection.dateRange?.start || null);
  const [rangeEnd, setRangeEnd] = React.useState<Date | null>(selection.dateRange?.end || null);
  const [hoverDate, setHoverDate] = React.useState<Date | null>(null);

  const monthName = calendarDate.toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate calendar days
  const firstDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
  const lastDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
  const startDay = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), d));
  }

  const handleDateClick = (date: Date) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(date);
      setRangeEnd(null);
      onRangeSelect(date, null);
    } else {
      const newEnd = date >= rangeStart ? date : rangeStart;
      const newStart = date >= rangeStart ? rangeStart : date;
      setRangeStart(newStart);
      setRangeEnd(newEnd);
      onRangeSelect(newStart, newEnd);
    }
  };

  const isInRange = (date: Date) => {
    if (!rangeStart) return false;
    const end = rangeEnd || hoverDate;
    if (!end) return false;

    const start = rangeStart <= end ? rangeStart : end;
    const finish = rangeStart <= end ? end : rangeStart;
    return date >= start && date <= finish;
  };

  const isRangeStart = (date: Date) => rangeStart?.toDateString() === date.toDateString();
  const isRangeEnd = (date: Date) => rangeEnd?.toDateString() === date.toDateString();

  const getDaysCount = () => {
    if (!rangeStart || !rangeEnd) return 0;
    return Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="selection-view range-mode">
      <div className="calendar-panel">
        <div className="calendar-panel-header">
          <div className="calendar-title">
            <CalendarIcon size={20} />
            <Heading level={3} data-size="sm" style={{ margin: 0 }}>
              Velg periode
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

        <div className="range-hint">
          <InfoIcon size={16} />
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            {!rangeStart ? 'Klikk for å velge startdato' : !rangeEnd ? 'Klikk for å velge sluttdato' : 'Klikk for å endre'}
          </Paragraph>
        </div>

        <div className="month-calendar">
          <div className="month-header">
            {['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'].map(day => (
              <div key={day} className="month-day-name">{day}</div>
            ))}
          </div>
          <div className="month-grid range-grid">
            {calendarDays.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} className="month-day empty" />;

              const isPast = date < today;
              const inRange = isInRange(date);
              const isStart = isRangeStart(date);
              const isEnd = isRangeEnd(date);

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  className={cn(
                    'month-day',
                    isPast && 'past',
                    inRange && 'in-range',
                    isStart && 'range-start',
                    isEnd && 'range-end',
                    !isPast && 'available'
                  )}
                  onClick={() => !isPast && handleDateClick(date)}
                  onMouseEnter={() => !isPast && rangeStart && !rangeEnd && setHoverDate(date)}
                  onMouseLeave={() => setHoverDate(null)}
                  disabled={isPast}
                >
                  <span className="day-number">{date.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="summary-panel">
        <div className="summary-header">
          <CalendarIcon size={20} />
          <Heading level={3} data-size="sm" style={{ margin: 0 }}>
            Din periode
          </Heading>
        </div>

        {!rangeStart ? (
          <div className="summary-empty">
            <div className="empty-illustration">
              <CalendarIcon size={40} />
            </div>
            <Paragraph data-size="sm" style={{ margin: 0, textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Velg start- og sluttdato for din booking
            </Paragraph>
          </div>
        ) : (
          <>
            <div className="range-summary">
              <div className="range-date-box">
                <span className="range-label">Fra</span>
                <span className="range-date">
                  {rangeStart.toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
              </div>
              <div className="range-arrow">→</div>
              <div className="range-date-box">
                <span className="range-label">Til</span>
                <span className="range-date">
                  {rangeEnd
                    ? rangeEnd.toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' })
                    : 'Velg sluttdato'
                  }
                </span>
              </div>
            </div>

            {rangeEnd && (
              <>
                <div className="range-info">
                  <div className="info-row">
                    <span>Antall {formatPriceUnit(pricing.unit)}er</span>
                    <span className="info-value">{getDaysCount()}</span>
                  </div>
                  <div className="info-row">
                    <span>Pris per {formatPriceUnit(pricing.unit)}</span>
                    <span className="info-value">{formatPrice(pricing.basePrice, currency)}</span>
                  </div>
                </div>

                <PriceSummary priceCalculation={priceCalculation} />

                <div className="summary-actions">
                  <Button type="button" variant="tertiary" onClick={() => { setRangeStart(null); setRangeEnd(null); onRangeSelect(new Date(), null); }}>
                    Tøm valg
                  </Button>
                  <Button type="button" variant="primary" data-color="accent" onClick={onContinue} disabled={!canContinue}>
                    Fortsett
                    <ChevronRightIcon size={18} />
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
