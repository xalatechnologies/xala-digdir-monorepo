/**
 * Formatting utilities for internationalization
 * Provides consistent formatting for dates, times, numbers, and durations
 * across the application using locale-aware methods.
 *
 * All formatters use the Intl API for standards-compliant localization.
 */

import type { SupportedLocale } from './types';

/**
 * Default locale for formatting
 */
const DEFAULT_LOCALE = 'nb-NO';

/**
 * Convert short locale to full BCP 47 locale tag
 */
function toFullLocale(locale: SupportedLocale | string): string {
  if (locale === 'nb') return 'nb-NO';
  if (locale === 'en') return 'en-US';
  return locale;
}

/**
 * Format a date according to locale conventions
 * @param date - Date to format (Date object or ISO string)
 * @param locale - Locale code (default: 'nb-NO')
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date('2024-01-15')) // "15.01.2024" (nb-NO)
 * formatDate(new Date('2024-01-15'), 'en') // "1/15/2024" (en-US)
 */
export function formatDate(
  date: Date | string,
  locale: SupportedLocale | string = DEFAULT_LOCALE,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options,
  };

  return new Intl.DateTimeFormat(toFullLocale(locale), defaultOptions).format(d);
}

/**
 * Format a time according to locale conventions
 * @param date - Date/time to format (Date object or ISO string)
 * @param locale - Locale code (default: 'nb-NO')
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted time string
 *
 * @example
 * formatTime(new Date('2024-01-15T14:30:00')) // "14:30" (nb-NO)
 * formatTime(new Date('2024-01-15T14:30:00'), 'en') // "2:30 PM" (en-US)
 */
export function formatTime(
  date: Date | string,
  locale: SupportedLocale | string = DEFAULT_LOCALE,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };

  return new Intl.DateTimeFormat(toFullLocale(locale), defaultOptions).format(d);
}

/**
 * Format a date and time according to locale conventions
 * @param date - Date/time to format (Date object or ISO string)
 * @param locale - Locale code (default: 'nb-NO')
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date and time string
 *
 * @example
 * formatDateTime(new Date('2024-01-15T14:30:00')) // "15.01.2024 14:30" (nb-NO)
 */
export function formatDateTime(
  date: Date | string,
  locale: SupportedLocale | string = DEFAULT_LOCALE,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };

  return new Intl.DateTimeFormat(toFullLocale(locale), defaultOptions).format(d);
}

/**
 * Format a number according to locale conventions
 * @param value - Number to format
 * @param locale - Locale code (default: 'nb-NO')
 * @param options - Intl.NumberFormat options
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234.56) // "1 234,56" (nb-NO)
 * formatNumber(1234.56, 'en') // "1,234.56" (en-US)
 */
export function formatNumber(
  value: number,
  locale: SupportedLocale | string = DEFAULT_LOCALE,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat(toFullLocale(locale), options).format(value);
}

/**
 * Format a currency value according to locale conventions
 * @param value - Amount to format
 * @param currency - ISO 4217 currency code (default: 'NOK')
 * @param locale - Locale code (default: 'nb-NO')
 * @param options - Additional Intl.NumberFormat options
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1234.56) // "kr 1 234,56" (nb-NO, NOK)
 * formatCurrency(1234.56, 'USD', 'en') // "$1,234.56" (en-US)
 */
export function formatCurrency(
  value: number,
  currency: string = 'NOK',
  locale: SupportedLocale | string = DEFAULT_LOCALE,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat(toFullLocale(locale), {
    style: 'currency',
    currency,
    ...options,
  }).format(value);
}

/**
 * Format a percentage value
 * @param value - Value between 0 and 1 (0.5 = 50%)
 * @param locale - Locale code (default: 'nb-NO')
 * @param options - Additional Intl.NumberFormat options
 * @returns Formatted percentage string
 *
 * @example
 * formatPercent(0.75) // "75 %" (nb-NO)
 * formatPercent(0.75, 'en') // "75%" (en-US)
 */
export function formatPercent(
  value: number,
  locale: SupportedLocale | string = DEFAULT_LOCALE,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat(toFullLocale(locale), {
    style: 'percent',
    maximumFractionDigits: 0,
    ...options,
  }).format(value);
}

/**
 * Get relative time description
 * @param date - ISO date string or Date object
 * @param locale - Locale code (default: 'nb-NO')
 * @returns Relative time string (e.g., "2 timer siden", "om 3 dager")
 * @example
 * formatRelativeTime(new Date()) // "na"
 * formatRelativeTime('2024-01-15T10:00:00') // "2 timer siden"
 */
export function formatRelativeTime(
  date: string | Date,
  locale: string = 'nb-NO'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, 'minutes');
  } else if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hours');
  } else {
    return rtf.format(diffDays, 'days');
  }
}

/**
 * Format duration as human-readable string
 * @param value - Duration in milliseconds (default) or seconds
 * @param options - Formatting options
 * @param options.style - Display style: 'compact' (1h 30m) or 'long' (1 hour 30 minutes)
 * @param options.unit - Input unit: 'milliseconds' or 'seconds'
 * @param options.locale - Locale code (default: 'nb-NO')
 * @returns Formatted duration string
 * @example
 * formatDuration(5400000) // "1t 30m" (1.5 hours in ms, compact Norwegian)
 * formatDuration(5400, { unit: 'seconds' }) // "1t 30m"
 * formatDuration(5400000, { style: 'long' }) // "1 time 30 minutter"
 * formatDuration(5400000, { locale: 'en' }) // "1h 30m"
 */
export function formatDuration(
  value: number,
  options: {
    style?: 'compact' | 'long';
    unit?: 'milliseconds' | 'seconds';
    locale?: string;
  } = {}
): string {
  const { style = 'compact', unit = 'milliseconds', locale = 'nb-NO' } = options;

  // Handle zero and negative durations
  if (value <= 0) return '0m';

  // Convert to milliseconds if needed
  const ms = unit === 'seconds' ? value * 1000 : value;

  // Calculate time units
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  // Define labels based on locale and style
  const labels = {
    nb: {
      compact: { d: 'd', h: 't', m: 'm', s: 's' },
      long: {
        d: (n: number) => (n === 1 ? 'dag' : 'dager'),
        h: (n: number) => (n === 1 ? 'time' : 'timer'),
        m: (n: number) => (n === 1 ? 'minutt' : 'minutter'),
        s: (n: number) => (n === 1 ? 'sekund' : 'sekunder'),
      },
    },
    en: {
      compact: { d: 'd', h: 'h', m: 'm', s: 's' },
      long: {
        d: (n: number) => (n === 1 ? 'day' : 'days'),
        h: (n: number) => (n === 1 ? 'hour' : 'hours'),
        m: (n: number) => (n === 1 ? 'minute' : 'minutes'),
        s: (n: number) => (n === 1 ? 'second' : 'seconds'),
      },
    },
  };

  // Determine locale key (nb-NO -> nb, en-US -> en, etc.)
  const localeKey = locale.startsWith('nb') ? 'nb' : 'en';
  const labelSet = labels[localeKey][style];

  // Build parts array
  const parts: string[] = [];

  if (days > 0) {
    const label = style === 'compact' ? labelSet.d : (labelSet.d as (n: number) => string)(days);
    parts.push(`${days}${style === 'compact' ? label : ` ${label}`}`);
  }

  if (hours > 0) {
    const label = style === 'compact' ? labelSet.h : (labelSet.h as (n: number) => string)(hours);
    parts.push(`${hours}${style === 'compact' ? label : ` ${label}`}`);
  }

  if (minutes > 0) {
    const label = style === 'compact' ? labelSet.m : (labelSet.m as (n: number) => string)(minutes);
    parts.push(`${minutes}${style === 'compact' ? label : ` ${label}`}`);
  }

  // Only include seconds for durations under 1 hour
  if (seconds > 0 && days === 0 && hours === 0) {
    const label = style === 'compact' ? labelSet.s : (labelSet.s as (n: number) => string)(seconds);
    parts.push(`${seconds}${style === 'compact' ? label : ` ${label}`}`);
  }

  // If no parts (shouldn't happen with > 0 check), return 0m
  if (parts.length === 0) return '0m';

  return parts.join(' ');
}
