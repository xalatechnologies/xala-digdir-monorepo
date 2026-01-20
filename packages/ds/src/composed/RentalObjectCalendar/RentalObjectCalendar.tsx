/**
 * RentalObjectCalendar Component
 * 
 * XALA Architecture Compliance:
 * - UI renders only from projections (slots, config)
 * - No local rule logic - all rules enforced by API
 * - Mode switches dynamically based on config.mode
 * - Slot states rendered from projection status
 * - Actions rendered only from slot.availableActions
 * 
 * Works identically in Web, Backoffice, and MinSide
 */

import * as React from 'react';
import './RentalObjectCalendar.css';
import type {
  RentalObjectCalendarProps,
  CalendarSlot,
  CalendarSelection,
  SlotStatus,
} from './types';

// Slot status to CSS class mapping
const STATUS_CLASSES: Record<SlotStatus, string> = {
  AVAILABLE: 'slot-available',
  RESERVED: 'slot-reserved',
  BOOKED: 'slot-booked',
  BLOCKED: 'slot-blocked',
  BLACKOUT: 'slot-blackout',
};

// Default translation function (pass-through)
const defaultT = (key: string): string => key;

/**
 * Format time for display
 */
function formatTime(isoString: string, locale = 'nb-NO'): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format date for display
 */
function formatDate(isoString: string, locale = 'nb-NO'): string {
  const date = new Date(isoString);
  return date.toLocaleDateString(locale, { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });
}

/**
 * Group slots by date for rendering
 */
function groupSlotsByDate(slots: CalendarSlot[]): Map<string, CalendarSlot[]> {
  const grouped = new Map<string, CalendarSlot[]>();
  
  for (const slot of slots) {
    const dateKey = new Date(slot.startTime).toISOString().split('T')[0] ?? '';
    const existing = grouped.get(dateKey) || [];
    grouped.set(dateKey, [...existing, slot]);
  }
  
  return grouped;}

/**
 * Check if a slot is within the current selection
 */
function isSlotSelected(
  slot: CalendarSlot, 
  selection: CalendarSelection | undefined
): boolean {
  if (!selection?.startTime || !selection?.endTime) return false;
  
  const slotStart = new Date(slot.startTime).getTime();
  const slotEnd = new Date(slot.endTime).getTime();
  const selStart = new Date(selection.startTime as string).getTime();
  const selEnd = new Date(selection.endTime as string).getTime();
  
  return slotStart >= selStart && slotEnd <= selEnd;
}

/**
 * Slot component - renders a single calendar slot
 */
function CalendarSlotItem({ 
  slot, 
  isSelected, 
  onClick,
  t = defaultT,
  locale = 'nb-NO',
}: { 
  slot: CalendarSlot; 
  isSelected: boolean;
  onClick: () => void;
  t?: (key: string) => string;
  locale?: string;
}): React.ReactElement {
  const statusClass = STATUS_CLASSES[slot.status];
  const isClickable = slot.status === 'AVAILABLE' || slot.availableActions.length > 0;
  
  return (
    <button
      type="button"
      className={`calendar-slot ${statusClass} ${isSelected ? 'slot-selected' : ''}`}
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      aria-label={`${formatTime(slot.startTime, locale)} - ${formatTime(slot.endTime, locale)}: ${t(`slot.status.${slot.status.toLowerCase()}`)}`}
      aria-pressed={isSelected}
    >
      <span className="slot-time">
        {formatTime(slot.startTime, locale)} - {formatTime(slot.endTime, locale)}
      </span>
      {slot.price !== undefined && slot.status === 'AVAILABLE' && (
        <span className="slot-price">
          {slot.price} {slot.currency || 'NOK'}
        </span>
      )}
      {slot.policyReasonKey && (
        <span className="slot-reason">{t(slot.policyReasonKey)}</span>
      )}
    </button>
  );
}

/**
 * Action buttons - rendered from availableActions projection
 */
function ActionButtons({
  selection,
  availableActions,
  onBook,
  onWaitlist,
  onModify,
  t = defaultT,
  disabled = false,
}: {
  selection: CalendarSelection;
  availableActions: Array<'BOOK' | 'REQUEST' | 'WAITLIST' | 'MODIFY'>;
  onBook?: (selection: CalendarSelection) => void;
  onWaitlist?: (selection: CalendarSelection) => void;
  onModify?: (selection: CalendarSelection) => void;
  t?: (key: string) => string;
  disabled?: boolean;
}): React.ReactElement | null {
  if (!selection.startTime || !selection.endTime) return null;
  
  return (
    <div className="calendar-actions">
      {availableActions.includes('BOOK') && onBook && (
        <button
          type="button"
          className="action-book"
          onClick={() => onBook(selection)}
          disabled={disabled}
        >
          {t('calendar.action.book')}
        </button>
      )}
      {availableActions.includes('REQUEST') && onBook && (
        <button
          type="button"
          className="action-request"
          onClick={() => onBook(selection)}
          disabled={disabled}
        >
          {t('calendar.action.request')}
        </button>
      )}
      {availableActions.includes('WAITLIST') && onWaitlist && (
        <button
          type="button"
          className="action-waitlist"
          onClick={() => onWaitlist(selection)}
          disabled={disabled}
        >
          {t('calendar.action.waitlist')}
        </button>
      )}
      {availableActions.includes('MODIFY') && onModify && (
        <button
          type="button"
          className="action-modify"
          onClick={() => onModify(selection)}
          disabled={disabled}
        >
          {t('calendar.action.modify')}
        </button>
      )}
    </div>
  );
}

/**
 * RentalObjectCalendar - Main component
 * Renders calendar from rental_objects projections
 */
export function RentalObjectCalendar({
  rentalObjectId,
  rentalObjectName,
  config,
  slots,
  isLoading = false,
  error,
  selection,
  onSelectionChange,
  onBook,
  onWaitlist,
  onModify,
  t = defaultT,
  locale = 'nb-NO',
  className = '',
}: RentalObjectCalendarProps): React.ReactElement {
  // Group slots by date
  const slotsByDate = React.useMemo(() => groupSlotsByDate(slots), [slots]);
  
  // Get available actions from selected slots
  const selectedSlots = React.useMemo(() => {
    if (!selection?.startTime) return [];
    return slots.filter(slot => isSlotSelected(slot, selection));
  }, [slots, selection]);
  
  // Aggregate available actions from all selected slots
  const availableActions = React.useMemo(() => {
    const actions = new Set<'BOOK' | 'REQUEST' | 'WAITLIST' | 'MODIFY'>();
    
    // All selected slots must support the action
    if (selectedSlots.length > 0 && selectedSlots[0]) {
      const firstSlotActions = selectedSlots[0].availableActions;
      for (const action of firstSlotActions) {
        if (selectedSlots.every(s => s.availableActions.includes(action))) {
          actions.add(action);
        }
      }
    }
    
    return Array.from(actions);
  }, [selectedSlots]);

  // Handle slot click
  const handleSlotClick = React.useCallback((slot: CalendarSlot) => {
    if (!onSelectionChange) return;
    
    // Single selection mode for now
    onSelectionChange({
      startTime: slot.startTime,
      endTime: slot.endTime,
      mode: config.mode,
    });
  }, [onSelectionChange, config.mode]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`rental-object-calendar loading ${className}`}>
        <div className="calendar-header">
          <h3>{rentalObjectName}</h3>
        </div>
        <div className="calendar-loading">
          <span>{t('calendar.loading')}</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`rental-object-calendar error ${className}`}>
        <div className="calendar-header">
          <h3>{rentalObjectName}</h3>
        </div>
        <div className="calendar-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`rental-object-calendar mode-${config.mode.toLowerCase()} ${className}`}
      data-rental-object-id={rentalObjectId}
    >
      <div className="calendar-header">
        <h3>{rentalObjectName}</h3>
        {config.availableModes.length > 1 && (
          <div className="mode-switcher">
            {config.availableModes.map(mode => (
              <button
                key={mode}
                type="button"
                className={`mode-button ${mode === config.mode ? 'active' : ''}`}
                onClick={() => onSelectionChange?.({
                  startTime: selection?.startTime ?? null,
                  endTime: selection?.endTime ?? null,
                  mode,
                })}
              >
                {t(`calendar.mode.${mode.toLowerCase()}`)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="calendar-body">
        {Array.from(slotsByDate.entries()).map(([dateKey, dateSlots]) => (
          <div key={dateKey} className="calendar-day">
            <div className="day-header">
              <span className="day-date">{dateSlots[0] && formatDate(dateSlots[0].startTime, locale)}</span>
            </div>
            <div className="day-slots">
              {dateSlots.map(slot => (
                <CalendarSlotItem
                  key={slot.id}
                  slot={slot}
                  isSelected={isSlotSelected(slot, selection)}
                  onClick={() => handleSlotClick(slot)}
                  t={t}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        ))}
        
        {slots.length === 0 && (
          <div className="calendar-empty">
            <span>{t('calendar.noSlots')}</span>
          </div>
        )}
      </div>

      {selection?.startTime && selection?.endTime && (
        <div className="calendar-footer">
          <div className="selection-summary">
            <span className="selection-time">
              {formatDate(selection.startTime as string, locale)} {formatTime(selection.startTime as string, locale)} - {formatTime(selection.endTime as string, locale)}
            </span>
          </div>
          <ActionButtons
            selection={selection}
            availableActions={availableActions}
            onBook={onBook}
            onWaitlist={onWaitlist}
            onModify={onModify}
            t={t}
          />
        </div>
      )}
    </div>
  );
}
