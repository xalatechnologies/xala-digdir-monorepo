/**
 * DateRangePicker Component
 *
 * Date range selection with presets and calendar UI.
 * SSR-safe with 'use client' directive.
 *
 * @module @xala/ds/composed/DateRangePicker
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DatePreset {
  id: string;
  label: string;
  getValue: () => DateRange;
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  presets?: DatePreset[];
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Default Presets
// =============================================================================

const DEFAULT_PRESETS: DatePreset[] = [
  { id: 'today', label: 'Today', getValue: () => { const d = new Date(); return { start: d, end: d }; } },
  { id: 'yesterday', label: 'Yesterday', getValue: () => { const d = new Date(); d.setDate(d.getDate() - 1); return { start: d, end: d }; } },
  { id: 'last7', label: 'Last 7 days', getValue: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 6); return { start: s, end: e }; } },
  { id: 'last30', label: 'Last 30 days', getValue: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 29); return { start: s, end: e }; } },
  { id: 'thisMonth', label: 'This month', getValue: () => { const s = new Date(); s.setDate(1); return { start: s, end: new Date() }; } },
  { id: 'lastMonth', label: 'Last month', getValue: () => { const e = new Date(); e.setDate(0); const s = new Date(e); s.setDate(1); return { start: s, end: e }; } },
];

// =============================================================================
// Icons
// =============================================================================

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// =============================================================================
// Helpers
// =============================================================================

function formatDate(date: Date | null): string {
  if (!date) return '';
  return date.toLocaleDateString('nb-NO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return a.toDateString() === b.toDateString();
}

function isInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  return date >= start && date <= end;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// =============================================================================
// Calendar Component
// =============================================================================

interface CalendarProps {
  month: number;
  year: number;
  selectedRange: DateRange;
  onDateClick: (date: Date) => void;
  onMonthChange: (month: number, year: number) => void;
  minDate?: Date;
  maxDate?: Date;
}

function Calendar({ month, year, selectedRange, onDateClick, onMonthChange, minDate, maxDate }: CalendarProps): React.ReactElement {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days: (Date | null)[] = [];

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

  const handlePrev = () => {
    if (month === 0) onMonthChange(11, year - 1);
    else onMonthChange(month - 1, year);
  };

  const handleNext = () => {
    if (month === 11) onMonthChange(0, year + 1);
    else onMonthChange(month + 1, year);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-3)' }}>
        <button type="button" onClick={handlePrev} style={{ padding: 'var(--ds-spacing-1)', backgroundColor: 'transparent', borderWidth: '0', cursor: 'pointer', color: 'var(--ds-color-neutral-text-default)', borderRadius: 'var(--ds-border-radius-sm)' }}>
          <ChevronLeftIcon />
        </button>
        <span style={{ fontWeight: 'var(--ds-font-weight-semibold)', fontSize: 'var(--ds-font-size-sm)' }}>
          {MONTHS[month]} {year}
        </span>
        <button type="button" onClick={handleNext} style={{ padding: 'var(--ds-spacing-1)', backgroundColor: 'transparent', borderWidth: '0', cursor: 'pointer', color: 'var(--ds-color-neutral-text-default)', borderRadius: 'var(--ds-border-radius-sm)' }}>
          <ChevronRightIcon />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--ds-spacing-1)' }}>
        {WEEKDAYS.map((day) => (
          <div key={day} style={{ textAlign: 'center', fontSize: 'var(--ds-font-size-xs)', fontWeight: 'var(--ds-font-weight-medium)', color: 'var(--ds-color-neutral-text-subtle)', padding: 'var(--ds-spacing-1)' }}>
            {day}
          </div>
        ))}
        {days.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const isStart = isSameDay(date, selectedRange.start);
          const isEnd = isSameDay(date, selectedRange.end);
          const inRange = isInRange(date, selectedRange.start, selectedRange.end);
          const isDisabled = (minDate && date < minDate) || (maxDate && date > maxDate);
          const isToday = isSameDay(date, new Date());

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => !isDisabled && onDateClick(date)}
              disabled={isDisabled}
              style={{
                padding: 'var(--ds-spacing-2)',
                fontSize: 'var(--ds-font-size-sm)',
                textAlign: 'center',
                backgroundColor: isStart || isEnd ? 'var(--ds-color-accent-base-default)' : inRange ? 'var(--ds-color-accent-surface-subtle)' : 'transparent',
                color: isStart || isEnd ? 'white' : isDisabled ? 'var(--ds-color-neutral-text-subtle)' : 'var(--ds-color-neutral-text-default)',
                borderWidth: isToday && !isStart && !isEnd ? 'var(--ds-border-width-lg)' : '0',
                borderStyle: 'solid',
                borderColor: 'var(--ds-color-accent-border-default)',
                borderRadius: isStart ? 'var(--ds-border-radius-md) 0 0 var(--ds-border-radius-md)' : isEnd ? '0 var(--ds-border-radius-md) var(--ds-border-radius-md) 0' : inRange ? '0' : 'var(--ds-border-radius-md)',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.4 : 1,
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// DateRangePicker Component
// =============================================================================

export function DateRangePicker({
  value = { start: null, end: null },
  onChange,
  presets = DEFAULT_PRESETS,
  minDate,
  maxDate,
  placeholder = 'Select date range',
  label,
  error,
  disabled = false,
  className,
  style,
}: DateRangePickerProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange>(value);
  const [month, setMonth] = useState(value.start?.getMonth() ?? new Date().getMonth());
  const [year, setYear] = useState(value.start?.getFullYear() ?? new Date().getFullYear());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleDateClick = useCallback((date: Date) => {
    if (!selectingEnd || !tempRange.start) {
      setTempRange({ start: date, end: null });
      setSelectingEnd(true);
    } else {
      const newRange = date >= tempRange.start ? { start: tempRange.start, end: date } : { start: date, end: tempRange.start };
      setTempRange(newRange);
      onChange?.(newRange);
      setIsOpen(false);
      setSelectingEnd(false);
    }
  }, [selectingEnd, tempRange.start, onChange]);

  const handlePresetClick = useCallback((preset: DatePreset) => {
    const range = preset.getValue();
    setTempRange(range);
    onChange?.(range);
    setIsOpen(false);
  }, [onChange]);

  const displayValue = value.start && value.end ? `${formatDate(value.start)} - ${formatDate(value.end)}` : value.start ? formatDate(value.start) : '';

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', ...style }}>
      {label && (
        <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)', fontWeight: 'var(--ds-font-weight-medium)', color: 'var(--ds-color-neutral-text-default)' }}>
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-2)',
          width: '100%',
          padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
          fontSize: 'var(--ds-font-size-sm)',
          textAlign: 'left',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          borderWidth: 'var(--ds-border-width-default)',
          borderStyle: 'solid',
          borderColor: error ? 'var(--ds-color-danger-border-default)' : isOpen ? 'var(--ds-color-accent-border-default)' : 'var(--ds-color-neutral-border-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          color: displayValue ? 'var(--ds-color-neutral-text-default)' : 'var(--ds-color-neutral-text-subtle)',
        }}
      >
        <CalendarIcon />
        <span style={{ flex: 1 }}>{displayValue || placeholder}</span>
      </button>

      {error && <p style={{ marginTop: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-danger-text-default)' }}>{error}</p>}

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 'var(--ds-spacing-2)',
            display: 'flex',
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            borderWidth: 'var(--ds-border-width-default)',
            borderStyle: 'solid',
            borderColor: 'var(--ds-color-neutral-border-default)',
            borderRadius: 'var(--ds-border-radius-lg)',
            boxShadow: 'var(--ds-shadow-lg)',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          {presets.length > 0 && (
            <div style={{ borderRightWidth: 'var(--ds-border-width-default)', borderRightStyle: 'solid', borderRightColor: 'var(--ds-color-neutral-border-subtle)', padding: 'var(--ds-spacing-3)' }}>
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                    fontSize: 'var(--ds-font-size-sm)',
                    textAlign: 'left',
                    backgroundColor: 'transparent',
                    borderWidth: '0',
                    borderRadius: 'var(--ds-border-radius-sm)',
                    cursor: 'pointer',
                    color: 'var(--ds-color-neutral-text-default)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
          <div style={{ padding: 'var(--ds-spacing-4)' }}>
            <Calendar
              month={month}
              year={year}
              selectedRange={tempRange}
              onDateClick={handleDateClick}
              onMonthChange={(m, y) => { setMonth(m); setYear(y); }}
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default DateRangePicker;
