import type { SupportedLocale } from './types';

/**
 * Internal mapping from SupportedLocale to Intl locale string (BCP 47)
 */
const INTL_LOCALE_MAP: Record<SupportedLocale, string> = {
  nb: 'nb-NO', // Norwegian Bokmål (Norway)
  en: 'en-US', // English (US)
};

/**
 * Default currency for all formatters
 */
const DEFAULT_CURRENCY = 'NOK';

/**
 * Options for date formatting
 */
export interface DateFormatOptions {
  /** Include time in the formatted output */
  includeTime?: boolean;
  /** Date format style: 'short', 'medium', 'long', 'full' */
  dateStyle?: 'short' | 'medium' | 'long' | 'full';
  /** Time format style: 'short', 'medium', 'long', 'full' */
  timeStyle?: 'short' | 'medium' | 'long' | 'full';
}

/**
 * Options for number formatting
 */
export interface NumberFormatOptions {
  /** Minimum fraction digits */
  minimumFractionDigits?: number;
  /** Maximum fraction digits */
  maximumFractionDigits?: number;
  /** Use grouping separators (thousand separators) */
  useGrouping?: boolean;
}

/**
 * Options for currency formatting
 */
export interface CurrencyFormatOptions {
  /** Currency code (defaults to NOK) */
  currency?: string;
  /** Display style: 'symbol', 'code', 'name' */
  currencyDisplay?: 'symbol' | 'code' | 'name';
}

/**
 * Creates a locale-aware currency formatter
 *
 * @param locale - The supported locale ('nb' or 'en')
 * @param options - Optional formatting options
 * @returns A function that formats numbers as currency
 *
 * @example
 * ```ts
 * const format = formatCurrency('nb');
 * format(1234.56); // "kr 1 234,56"
 *
 * const formatEn = formatCurrency('en');
 * formatEn(1234.56); // "NOK 1,234.56"
 * ```
 */
export function formatCurrency(
  locale: SupportedLocale,
  options?: CurrencyFormatOptions
): (value: number) => string {
  const intlLocale = INTL_LOCALE_MAP[locale];
  const currency = options?.currency ?? DEFAULT_CURRENCY;
  const currencyDisplay = options?.currencyDisplay ?? 'symbol';

  const formatter = new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency,
    currencyDisplay,
  });

  return (value: number): string => formatter.format(value);
}

/**
 * Creates a locale-aware date formatter
 *
 * @param locale - The supported locale ('nb' or 'en')
 * @param options - Optional formatting options
 * @returns A function that formats dates
 *
 * @example
 * ```ts
 * const format = formatDate('nb');
 * format(new Date('2026-01-15')); // "15.01.2026"
 *
 * const formatEn = formatDate('en');
 * formatEn(new Date('2026-01-15')); // "1/15/2026"
 *
 * const formatWithTime = formatDate('nb', { includeTime: true });
 * formatWithTime(new Date('2026-01-15T14:30:00')); // "15.01.2026, 14:30"
 * ```
 */
export function formatDate(
  locale: SupportedLocale,
  options?: DateFormatOptions
): (value: Date | number | string) => string {
  const intlLocale = INTL_LOCALE_MAP[locale];

  // Build formatter options based on provided options
  const formatterOptions: Intl.DateTimeFormatOptions = {};

  if (options?.dateStyle) {
    // Use dateStyle if explicitly provided
    (formatterOptions as Record<string, unknown>).dateStyle = options.dateStyle;
  } else if (!options?.timeStyle) {
    // Default: short date format
    formatterOptions.year = 'numeric';
    formatterOptions.month = '2-digit';
    formatterOptions.day = '2-digit';
  }

  if (options?.timeStyle) {
    // Use timeStyle if explicitly provided
    (formatterOptions as Record<string, unknown>).timeStyle = options.timeStyle;
  } else if (options?.includeTime) {
    // Include time with default format
    formatterOptions.hour = '2-digit';
    formatterOptions.minute = '2-digit';
  }

  const formatter = new Intl.DateTimeFormat(intlLocale, formatterOptions);

  return (value: Date | number | string): string => {
    const date = value instanceof Date ? value : new Date(value);
    return formatter.format(date);
  };
}

/**
 * Creates a locale-aware number formatter
 *
 * @param locale - The supported locale ('nb' or 'en')
 * @param options - Optional formatting options
 * @returns A function that formats numbers
 *
 * @example
 * ```ts
 * const format = formatNumber('nb');
 * format(1234.56); // "1 234,56"
 *
 * const formatEn = formatNumber('en');
 * formatEn(1234.56); // "1,234.56"
 *
 * const formatInt = formatNumber('nb', { maximumFractionDigits: 0 });
 * formatInt(1234.56); // "1 235"
 * ```
 */
export function formatNumber(
  locale: SupportedLocale,
  options?: NumberFormatOptions
): (value: number) => string {
  const intlLocale = INTL_LOCALE_MAP[locale];

  const formatter = new Intl.NumberFormat(intlLocale, {
    minimumFractionDigits: options?.minimumFractionDigits,
    maximumFractionDigits: options?.maximumFractionDigits,
    useGrouping: options?.useGrouping ?? true,
  });

  return (value: number): string => formatter.format(value);
}
