/**
 * Formatting utilities for internationalization
 * Provides consistent formatting for dates, times, numbers, and durations
 * across the application using locale-aware methods.
 */

/**
 * Get relative time description
 * @param date - ISO date string or Date object
 * @param locale - Locale code (default: 'nb-NO')
 * @returns Relative time string (e.g., "2 timer siden", "om 3 dager")
 * @example
 * formatRelativeTime(new Date()) // "nå"
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
