/**
 * RentalObjectCalendarSection Component
 * 
 * XALA Architecture Compliance:
 * - Uses rental_objects as single source of truth
 * - SDK-only networking via useBookingQuote, useRentalObjectCalendar
 * - Projection-only UI - renders from DTOs without transformation
 * - No local rule logic - all rules enforced by API
 * 
 * This component replaces the old CalendarSection with XALA-compliant patterns.
 */

import * as React from 'react';
import { RentalObjectCalendar } from '@xalatechnologies/platform/ui';
import {
  useRentalObjectCalendar,
  useBookingQuote,
  useCreateBookingFromQuote,
  useRentalObjectCalendarRealtime,
} from '@digilist/client-sdk';
import type { CalendarSlot, CalendarConfig, CalendarSelection } from '@xalatechnologies/platform/ui';
import { useTranslation } from 'react-i18next';
import { useT } from '@xala/i18n';

// =============================================================================
// Types
// =============================================================================

export interface RentalObjectCalendarSectionProps {
  /** Rental object ID */
  rentalObjectId: string;
  /** Rental object name for display */
  rentalObjectName: string;
  /** Whether the calendar is read-only */
  readOnly?: boolean;
  /** Callback when booking is requested */
  onBookingRequest?: (selection: CalendarSelection) => void;
  /** Custom class name */
  className?: string;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get current week's date range
 */
function getWeekRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return {
    startDate: monday.toISOString().split('T')[0]!,
    endDate: sunday.toISOString().split('T')[0]!,
  };
}

/**
 * Map availability data to CalendarSlot format
 */
function mapToCalendarSlots(
  availability: { slots?: Array<{
    id?: string;
    startTime: string;
    endTime: string;
    status: string;
    price?: number;
    currency?: string;
    policyReasonKey?: string;
  }> } | undefined
): CalendarSlot[] {
  if (!availability?.slots) return [];
  
  return availability.slots.map((slot, index) => ({
    id: slot.id || `slot-${index}`,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: slot.status as CalendarSlot['status'],
    price: slot.price,
    currency: slot.currency || 'NOK',
    policyReasonKey: slot.policyReasonKey,
    availableActions: slot.status === 'AVAILABLE' ? ['BOOK', 'MODIFY'] : ['MODIFY'],
  }));
}

/**
 * Map config data to CalendarConfig format
 */
function mapToCalendarConfig(
  config: {
    timeMode?: string;
    slotDurationMinutes?: number;
    minBookingMinutes?: number;
    maxBookingMinutes?: number;
    bufferTimeMinutes?: number;
    openingHours?: { start?: string; end?: string };
  } | undefined
): CalendarConfig {
  const mode = config?.timeMode === 'ALL_DAY' ? 'ALL_DAY' 
    : config?.timeMode === 'RECURRING' ? 'RECURRING' 
    : 'TIME';
    
  return {
    mode,
    slotDurationMinutes: config?.slotDurationMinutes || 60,
    minDurationMinutes: config?.minBookingMinutes || 30,
    maxDurationMinutes: config?.maxBookingMinutes || 480,
    bufferTimeMinutes: config?.bufferTimeMinutes || 0,
    availableModes: [mode],
    operatingHours: config?.openingHours ? {
      start: config.openingHours.start || '08:00',
      end: config.openingHours.end || '17:00',
    } : undefined,
  };
}

// =============================================================================
// Component
// =============================================================================

export function RentalObjectCalendarSection({
  rentalObjectId,
  rentalObjectName,
  readOnly = false,
  onBookingRequest,
  className,
}: RentalObjectCalendarSectionProps): React.ReactElement {
  const t = useT();
  const { t, i18n } = useTranslation();
  
  // Selection state
  const [selection, setSelection] = React.useState<CalendarSelection | undefined>(undefined);
  
  // Date range for availability query
  const dateRange = React.useMemo(() => getWeekRange(), []);
  
  // Fetch calendar data using XALA-compliant hooks
  const { config, availability, isLoading, error } = useRentalObjectCalendar({
    rentalObjectId,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });
  
  // Get booking quote when selection changes
  const { data: quote, isLoading: isQuoteLoading } = useBookingQuote({
    rentalObjectId,
    startTime: selection?.startTime || '',
    endTime: selection?.endTime || '',
    enabled: !!selection?.startTime && !!selection?.endTime,
  });
  
  // Create booking mutation
  const createBooking = useCreateBookingFromQuote();
  
  // Subscribe to realtime updates
  useRentalObjectCalendarRealtime(rentalObjectId, (event) => {
    console.log('Calendar realtime event:', event);
  });
  
  // Map data to component formats
  const calendarConfig = React.useMemo(() => mapToCalendarConfig(config), [config]);
  const calendarSlots = React.useMemo(() => mapToCalendarSlots(availability), [availability]);
  
  // Handle selection change
  const handleSelectionChange = React.useCallback((newSelection: CalendarSelection) => {
    setSelection(newSelection);
  }, []);
  
  // Handle book action - uses quote to validate before booking
  const handleBook = React.useCallback((sel: CalendarSelection) => {
    if (!sel.startTime || !sel.endTime) return;
    
    // Check if quote indicates booking is available
    if (quote?.slot.status !== 'AVAILABLE') {
      console.warn('Cannot book - slot not available:', quote?.slot.policyReasonKey);
      return;
    }
    
    // Check if BOOK action is available
    if (!quote?.availableActions.includes('BOOK')) {
      console.warn('Cannot book - BOOK action not available');
      return;
    }
    
    if (onBookingRequest) {
      onBookingRequest(sel);
    } else {
      // Direct booking via mutation
      createBooking.mutate({
        rentalObjectId: rentalObjectId,
        startTime: new Date(sel.startTime),
        endTime: new Date(sel.endTime),
        totalPrice: quote.pricing.totalPrice,
      });
    }
  }, [quote, onBookingRequest, createBooking, rentalObjectId]);
  
  // Handle modify action
  const handleModify = React.useCallback((_sel: CalendarSelection) => {
    // Clear selection to allow re-selection
    setSelection(undefined);
  }, []);

  return (
    <div className={className}>
      <RentalObjectCalendar
        rentalObjectId={rentalObjectId}
        rentalObjectName={rentalObjectName}
        config={calendarConfig}
        slots={calendarSlots}
        isLoading={isLoading || isQuoteLoading}
        error={error ? t(error) : undefined}
        selection={selection}
        onSelectionChange={readOnly ? undefined : handleSelectionChange}
        onBook={readOnly ? undefined : handleBook}
        onModify={readOnly ? undefined : handleModify}
        t={(key) => t(key)}
        locale={i18n.language}
        className="rental-object-calendar-section"
      />
      
      {/* Quote Preview - shows pricing from projection */}
      {quote && selection?.startTime && (
        <div className="quote-preview" style={{ marginTop: 'var(--ds-spacing-4)' }}>
          <div style={{ 
            padding: 'var(--ds-spacing-4)', 
            background: 'var(--ds-color-neutral-background-subtle)',
            borderRadius: 'var(--ds-border-radius-md)',
          }}>
            <p style={{ margin: 0, fontSize: 'var(--ds-font-size-sm)' }}>
              <strong>{t('booking.quote.total')}:</strong>{' '}
              {quote.pricing.totalPrice} {quote.pricing.currency}
            </p>
            {quote.slot.status !== 'AVAILABLE' && quote.slot.policyReasonKey && (
              <p style={{ 
                margin: 'var(--ds-spacing-2) 0 0', 
                fontSize: 'var(--ds-font-size-xs)',
                color: 'var(--ds-color-danger-text-default)',
              }}>
                {t(quote.slot.policyReasonKey)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RentalObjectCalendarSection;
