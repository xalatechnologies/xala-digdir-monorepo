/**
 * RentalObjectCalendar Component
 *
 * Calendar for displaying rental object availability.
 */

import React from 'react';
import type { CalendarConfig, CalendarSelection, CalendarSlot } from '../types/calendar';

export interface RentalObjectCalendarProps {
  config?: CalendarConfig;
  selection?: CalendarSelection;
  onSelectionChange?: (selection: CalendarSelection) => void;
  slots?: CalendarSlot[];
  loading?: boolean;
}

export function RentalObjectCalendar({
  config,
  selection,
  onSelectionChange,
  slots = [],
  loading = false,
}: RentalObjectCalendarProps): React.ReactElement {
  return (
    <div style={{
      border: '1px solid var(--ds-color-neutral-border-default)',
      borderRadius: 'var(--ds-border-radius-md)',
      padding: '1rem',
      minHeight: '300px',
    }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Laster kalender...</div>
      ) : (
        <div>
          {/* Placeholder calendar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
            {['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'].map(day => (
              <div key={day} style={{ textAlign: 'center', fontWeight: 500, fontSize: '0.75rem', padding: '0.5rem' }}>
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                style={{
                  textAlign: 'center',
                  padding: '0.5rem',
                  borderRadius: 'var(--ds-border-radius-sm)',
                  backgroundColor: 'var(--ds-color-neutral-surface-default)',
                  cursor: 'pointer',
                }}
              >
                {((i % 31) + 1)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
