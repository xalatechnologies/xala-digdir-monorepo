/**
 * Date and Format Utilities
 * Common formatting functions for the SDK
 */

/**
 * Format a date string to Norwegian locale date format
 * @param date - ISO date string or Date object
 * @param options - Intl.DateTimeFormatOptions for customizing output
 * @returns Formatted date string (e.g., "15. januar 2026")
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  return d.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  });
}

/**
 * Format a date string to Norwegian locale time format
 * @param date - ISO date string or Date object
 * @param options - Intl.DateTimeFormatOptions for customizing output
 * @returns Formatted time string (e.g., "14:30")
 */
export function formatTime(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  return d.toLocaleTimeString('nb-NO', {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

/**
 * Format a date range to show the week range
 * @param startDate - Start date of the week
 * @returns Formatted week range string (e.g., "13. - 19. januar 2026")
 */
export function formatWeekRange(startDate: Date): string {
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const startMonth = startDate.toLocaleDateString('nb-NO', { month: 'long' });
  const endMonth = endDate.toLocaleDateString('nb-NO', { month: 'long' });
  const year = endDate.getFullYear();

  if (startMonth === endMonth) {
    return `${startDay}. - ${endDay}. ${startMonth} ${year}`;
  } else {
    return `${startDay}. ${startMonth} - ${endDay}. ${endMonth} ${year}`;
  }
}

/**
 * Format a datetime string for display
 * @param date - ISO date string or Date object
 * @returns Formatted datetime string (e.g., "15. jan 2026, 14:30")
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  return d.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get relative time description
 * @param date - ISO date string or Date object
 * @returns Relative time string (e.g., "2 timer siden", "om 3 dager")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  const rtf = new Intl.RelativeTimeFormat('nb-NO', { numeric: 'auto' });

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, 'minutes');
  } else if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hours');
  } else {
    return rtf.format(diffDays, 'days');
  }
}

// =============================================================================
// Number Formatting
// =============================================================================

/**
 * Format a number as Norwegian currency
 * @param amount - The amount in base currency units (e.g., NOK)
 * @param currency - Currency code (default: 'NOK')
 * @returns Formatted currency string (e.g., "1 234,50 kr")
 */
export function formatCurrency(
  amount: number,
  currency: string = 'NOK'
): string {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number as percentage
 * @param value - The decimal value (e.g., 0.15 for 15%)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string (e.g., "15 %")
 */
export function formatPercent(
  value: number,
  decimals: number = 0
): string {
  return new Intl.NumberFormat('nb-NO', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// =============================================================================
// Seasonal/Period Formatting
// =============================================================================

/**
 * Format weekday numbers to Norwegian names
 * @param weekdays - Array of weekday numbers (0=Sunday, 1=Monday, etc.)
 * @returns Formatted string (e.g., "man, ons, fre")
 */
export function formatWeekdays(weekdays: number[]): string {
  const dayNames = ['søn', 'man', 'tir', 'ons', 'tor', 'fre', 'lør'];
  return weekdays.map(d => dayNames[d] ?? '').filter(Boolean).join(', ');
}

/**
 * Format a date period
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns Formatted period string (e.g., "15. jan - 28. feb 2026")
 */
export function formatPeriod(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';

  const startStr = start.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
  const endStr = end.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });

  return `${startStr} - ${endStr}`;
}

/**
 * Format a time slot
 * @param startTime - Start time string (HH:mm format)
 * @param endTime - End time string (HH:mm format)
 * @returns Formatted time slot (e.g., "09:00 - 17:00")
 */
export function formatTimeSlot(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`;
}
