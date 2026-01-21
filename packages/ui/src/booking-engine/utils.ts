/**
 * Booking Engine Utilities
 *
 * Helper functions for the unified booking system.
 */

import type { BookingMode, BookingPriceUnit } from '@digilist/contracts';

/**
 * Get label for booking mode
 */
export function getModeLabel(mode: BookingMode): string {
  const labels: Record<BookingMode, string> = {
    slots: 'Velg tidspunkt',
    daily: 'Velg dato',
    dateRange: 'Velg periode',
    event: 'Velg billetter',
    recurring: 'Velg sesong',
    instant: 'Bestill na',
  };
  return labels[mode];
}

/**
 * Get description for booking mode
 */
export function getModeDescription(mode: BookingMode): string {
  const descriptions: Record<BookingMode, string> = {
    slots: 'Klikk pa ledige tidspunkter i kalenderen',
    daily: 'Velg en eller flere dager i kalenderen',
    dateRange: 'Velg start- og sluttdato for din booking',
    event: 'Velg antall billetter eller deltakere',
    recurring: 'Sett opp ukentlig gjentakende booking',
    instant: 'Fullfor din bestilling direkte',
  };
  return descriptions[mode];
}

/**
 * Format price for display
 */
export function formatPrice(
  amount: number,
  currency: string = 'NOK',
  locale: string = 'nb-NO'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format price unit for display (Norwegian)
 */
export function formatPriceUnit(unit: BookingPriceUnit): string {
  const unitMap: Record<BookingPriceUnit, string> = {
    hour: 'time',
    day: 'dag',
    week: 'uke',
    month: 'maned',
    booking: 'booking',
    person: 'person',
    unit: 'stk',
  };
  return unitMap[unit] || unit;
}

/**
 * Utility function for class name concatenation
 */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
