/**
 * Formatting utilities for Norwegian locale
 *
 * These utilities provide consistent date, time, and number formatting
 * across the application using Norwegian (nb-NO) locale settings.
 */

// =============================================================================
// Date/Time Formatting
// =============================================================================

/**
 * Format time from ISO string (HH:mm)
 * @example formatTime("2024-01-15T14:30:00") => "14:30"
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format date from ISO string (d. MMM)
 * @example formatDate("2024-01-15") => "15. jan"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
}

/**
 * Format date and time from ISO string (d. MMM HH:mm)
 * @example formatDateTime("2024-01-15T14:30:00") => "15. jan 14:30"
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('nb-NO', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format full date from ISO string (d. MMMM yyyy)
 * @example formatFullDate("2024-01-15") => "15. januar 2024"
 */
export function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format date range (d. MMM - d. MMM yyyy)
 * @example formatDateRange("2024-01-15", "2024-01-22") => "15. jan - 22. jan 2024"
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${start.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

/**
 * Format period with numeric dates (dd/MM - dd/MM/yyyy)
 * @example formatPeriod("2024-01-15", "2024-02-28") => "15/01 - 28/02/2024"
 */
export function formatPeriod(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${start.toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit' })} - ${end.toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
}

/**
 * Format week range from week start date
 * @example formatWeekRange(new Date("2024-01-15")) => "15. jan - 21. jan 2024"
 */
export function formatWeekRange(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  return `${weekStart.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

/**
 * Format time slot (HH:mm-HH:mm)
 * @example formatTimeSlot("08:00", "16:00") => "08:00-16:00"
 */
export function formatTimeSlot(startTime: string, endTime: string): string {
  return `${startTime}-${endTime}`;
}

// =============================================================================
// Number Formatting
// =============================================================================

/**
 * Format currency in Norwegian Kroner (NOK)
 * @example formatCurrency(15000) => "kr 15 000"
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 0,
  });
}

/**
 * Format currency with decimals
 * @example formatCurrencyWithDecimals(15000.50) => "kr 15 000,50"
 */
export function formatCurrencyWithDecimals(value: number, decimals = 2): string {
  return value.toLocaleString('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format percentage with sign
 * @example formatPercent(12.5) => "+12.5%"
 * @example formatPercent(-5.2) => "-5.2%"
 */
export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

/**
 * Format percentage without sign
 * @example formatPercentage(85.5) => "85,5%"
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals).replace('.', ',')}%`;
}

/**
 * Format number with Norwegian locale (space as thousand separator)
 * @example formatNumber(1234567) => "1 234 567"
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('nb-NO');
}

/**
 * Format decimal number
 * @example formatDecimal(1234.56789, 2) => "1 234,57"
 */
export function formatDecimal(value: number, decimals = 2): string {
  return value.toLocaleString('nb-NO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// =============================================================================
// Domain-Specific Formatting
// =============================================================================

/**
 * Norwegian weekday names (0 = Sunday, 1 = Monday, etc.)
 */
export const weekdayNames: Record<number, string> = {
  0: 'Søn',
  1: 'Man',
  2: 'Tir',
  3: 'Ons',
  4: 'Tor',
  5: 'Fre',
  6: 'Lør',
};

/**
 * Full Norwegian weekday names
 */
export const weekdayFullNames: Record<number, string> = {
  0: 'Søndag',
  1: 'Mandag',
  2: 'Tirsdag',
  3: 'Onsdag',
  4: 'Torsdag',
  5: 'Fredag',
  6: 'Lørdag',
};

/**
 * Format weekday numbers to Norwegian abbreviations
 * @example formatWeekdays([1, 2, 3]) => ["Man", "Tir", "Ons"]
 */
export function formatWeekdays(weekdays: number[]): string[] {
  return weekdays.map((day) => weekdayNames[day] || '');
}

/**
 * Format duration in hours
 * @example formatDuration(2.5) => "2,5t"
 */
export function formatDuration(hours: number): string {
  return `${hours.toFixed(1).replace('.', ',')}t`;
}

/**
 * Format relative time ago (Norwegian)
 * @example formatTimeAgo("2024-01-15T14:30:00") => "For 5 minutter siden"
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Akkurat nå';
  if (diffMins < 60) return `For ${diffMins} minutt${diffMins === 1 ? '' : 'er'} siden`;
  if (diffHours < 24) return `For ${diffHours} time${diffHours === 1 ? '' : 'r'} siden`;
  return `For ${diffDays} dag${diffDays === 1 ? '' : 'er'} siden`;
}
