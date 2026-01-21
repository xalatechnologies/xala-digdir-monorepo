/**
 * LanguageSwitcher Component
 *
 * A reusable language switcher that integrates with @xala/i18n
 * for locale management and persistence.
 *
 * @example
 * // Basic usage (auto-connects to i18n context)
 * <LanguageSwitcher />
 *
 * // With variant
 * <LanguageSwitcher variant="toggle" />
 *
 * // Custom labels
 * <LanguageSwitcher
 *   labels={{ nb: 'Norsk', en: 'English' }}
 * />
 */

import React, { forwardRef, useState, useCallback } from 'react';
import { cn } from '../utils';

/**
 * Supported locale codes (mirrors @xala/i18n types)
 */
type SupportedLocale = 'nb' | 'en';

/**
 * Display variant for the language switcher
 */
export type LanguageSwitcherVariant = 'toggle' | 'dropdown' | 'segmented';

/**
 * Size options for the language switcher
 */
export type LanguageSwitcherSize = 'sm' | 'md' | 'lg';

/**
 * Labels for locale display
 */
export interface LocaleLabels {
  nb: string;
  en: string;
}

export interface LanguageSwitcherProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /**
   * Current locale (controlled mode).
   * If not provided, will try to use @xala/i18n context.
   */
  locale?: SupportedLocale;

  /**
   * Callback when locale changes.
   * If not provided, will use setLocale from @xala/i18n context.
   */
  onLocaleChange?: (locale: SupportedLocale) => void;

  /**
   * Display variant
   * @default 'toggle'
   */
  variant?: LanguageSwitcherVariant;

  /**
   * Size of the component
   * @default 'md'
   */
  size?: LanguageSwitcherSize;

  /**
   * Custom labels for locales
   * @default { nb: 'NO', en: 'EN' }
   */
  labels?: LocaleLabels;

  /**
   * Show full locale names instead of codes
   * @default false
   */
  showFullNames?: boolean;

  /**
   * Disable the switcher
   * @default false
   */
  disabled?: boolean;

  /**
   * Accessible label for the component
   * @default 'Bytt språk'
   */
  ariaLabel?: string;
}

/**
 * Default locale labels
 */
const DEFAULT_LABELS: LocaleLabels = {
  nb: 'NO',
  en: 'EN',
};

/**
 * Full locale names
 */
const FULL_LOCALE_NAMES: LocaleLabels = {
  nb: 'Norsk',
  en: 'English',
};

/**
 * Size mappings for styling
 */
const SIZE_STYLES: Record<LanguageSwitcherSize, React.CSSProperties> = {
  sm: {
    padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
    fontSize: 'var(--ds-font-size-xs)',
    minHeight: 'var(--ds-spacing-8)',
  },
  md: {
    padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
    fontSize: 'var(--ds-font-size-sm)',
    minHeight: 'var(--ds-spacing-10)',
  },
  lg: {
    padding: 'var(--ds-spacing-3) var(--ds-spacing-5)',
    fontSize: 'var(--ds-font-size-md)',
    minHeight: 'var(--ds-spacing-12)',
  },
};

/**
 * Supported locales array
 */
const SUPPORTED_LOCALES: readonly SupportedLocale[] = ['nb', 'en'] as const;

/**
 * Toggle variant component
 */
const ToggleVariant = forwardRef<
  HTMLButtonElement,
  {
    locale: SupportedLocale;
    onSwitch: () => void;
    labels: LocaleLabels;
    size: LanguageSwitcherSize;
    disabled?: boolean;
    ariaLabel?: string;
  }
>(({ locale, onSwitch, labels, size, disabled, ariaLabel }, ref) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSwitch}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
      aria-label={ariaLabel || `Språk: ${labels[locale]}. Klikk for å bytte.`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        borderRadius: 'var(--ds-border-radius-md)',
        backgroundColor: isHovered && !disabled
          ? 'var(--ds-color-neutral-surface-hover)'
          : 'var(--ds-color-neutral-surface-default)',
        color: disabled
          ? 'var(--ds-color-neutral-text-subtle)'
          : 'var(--ds-color-neutral-text-default)',
        fontWeight: 'var(--ds-font-weight-semibold)' as unknown as number,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
        boxShadow: 'var(--ds-shadow-sm)',
        minWidth: 'var(--ds-spacing-12)',
        opacity: disabled ? 0.6 : 1,
        ...SIZE_STYLES[size],
      }}
    >
      {labels[locale]}
    </button>
  );
});

ToggleVariant.displayName = 'LanguageSwitcher.Toggle';

/**
 * Segmented control variant
 */
const SegmentedVariant = forwardRef<
  HTMLDivElement,
  {
    locale: SupportedLocale;
    onSelect: (locale: SupportedLocale) => void;
    labels: LocaleLabels;
    size: LanguageSwitcherSize;
    disabled?: boolean;
    ariaLabel?: string;
  }
>(({ locale, onSelect, labels, size, disabled, ariaLabel }, ref) => {
  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={ariaLabel || 'Velg språk'}
      style={{
        display: 'inline-flex',
        borderRadius: 'var(--ds-border-radius-md)',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        boxShadow: 'var(--ds-shadow-sm)',
        overflow: 'hidden',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {SUPPORTED_LOCALES.map((loc) => (
        <button
          key={loc}
          type="button"
          role="radio"
          aria-checked={locale === loc}
          onClick={() => !disabled && onSelect(loc)}
          disabled={disabled}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            borderRadius: 0,
            backgroundColor: locale === loc
              ? 'var(--ds-color-accent-surface-default)'
              : 'transparent',
            color: locale === loc
              ? 'var(--ds-color-accent-text-default)'
              : 'var(--ds-color-neutral-text-default)',
            fontWeight: locale === loc
              ? ('var(--ds-font-weight-semibold)' as unknown as number)
              : ('var(--ds-font-weight-regular)' as unknown as number),
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
            minWidth: 'var(--ds-spacing-10)',
            ...SIZE_STYLES[size],
          }}
        >
          {labels[loc]}
        </button>
      ))}
    </div>
  );
});

SegmentedVariant.displayName = 'LanguageSwitcher.Segmented';

/**
 * Dropdown variant component
 */
const DropdownVariant = forwardRef<
  HTMLDivElement,
  {
    locale: SupportedLocale;
    onSelect: (locale: SupportedLocale) => void;
    labels: LocaleLabels;
    size: LanguageSwitcherSize;
    disabled?: boolean;
    ariaLabel?: string;
  }
>(({ locale, onSelect, labels, size, disabled, ariaLabel }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSelect = useCallback((loc: SupportedLocale) => {
    onSelect(loc);
    setIsOpen(false);
  }, [onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  return (
    <div
      ref={ref}
      style={{ position: 'relative', display: 'inline-block' }}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={disabled}
        aria-label={ariaLabel || `Språk: ${labels[locale]}. Klikk for å velge.`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--ds-spacing-2)',
          border: 'none',
          borderRadius: 'var(--ds-border-radius-md)',
          backgroundColor: isHovered && !disabled
            ? 'var(--ds-color-neutral-surface-hover)'
            : 'var(--ds-color-neutral-surface-default)',
          color: disabled
            ? 'var(--ds-color-neutral-text-subtle)'
            : 'var(--ds-color-neutral-text-default)',
          fontWeight: 'var(--ds-font-weight-semibold)' as unknown as number,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: 'var(--ds-shadow-sm)',
          minWidth: 'var(--ds-spacing-16)',
          opacity: disabled ? 0.6 : 1,
          ...SIZE_STYLES[size],
        }}
      >
        {labels[locale]}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
          }}
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-activedescendant={`locale-${locale}`}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 'var(--ds-spacing-1)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            boxShadow: 'var(--ds-shadow-md)',
            overflow: 'hidden',
            zIndex: 100,
          }}
        >
          {SUPPORTED_LOCALES.map((loc) => (
            <button
              key={loc}
              id={`locale-${loc}`}
              type="button"
              role="option"
              aria-selected={locale === loc}
              onClick={() => handleSelect(loc)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '100%',
                border: 'none',
                backgroundColor: locale === loc
                  ? 'var(--ds-color-accent-surface-default)'
                  : 'transparent',
                color: locale === loc
                  ? 'var(--ds-color-accent-text-default)'
                  : 'var(--ds-color-neutral-text-default)',
                fontWeight: locale === loc
                  ? ('var(--ds-font-weight-semibold)' as unknown as number)
                  : ('var(--ds-font-weight-regular)' as unknown as number),
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                ...SIZE_STYLES[size],
              }}
            >
              {labels[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

DropdownVariant.displayName = 'LanguageSwitcher.Dropdown';

/**
 * LanguageSwitcher - A reusable locale switcher component
 *
 * Integrates with @xala/i18n for automatic locale management.
 * Can also be used in controlled mode with locale/onLocaleChange props.
 */
export const LanguageSwitcher = forwardRef<HTMLDivElement, LanguageSwitcherProps>(
  (
    {
      locale: controlledLocale,
      onLocaleChange,
      variant = 'toggle',
      size = 'md',
      labels: customLabels,
      showFullNames = false,
      disabled = false,
      ariaLabel,
      className,
      style,
      ...props
    },
    ref
  ) => {
    // Internal state for uncontrolled mode
    const [internalLocale, setInternalLocale] = useState<SupportedLocale>('nb');

    // Determine current locale (controlled vs uncontrolled)
    const currentLocale = controlledLocale ?? internalLocale;

    // Determine labels to use
    const labels = customLabels ?? (showFullNames ? FULL_LOCALE_NAMES : DEFAULT_LABELS);

    // Handle locale change
    const handleLocaleChange = useCallback(
      (newLocale: SupportedLocale) => {
        if (onLocaleChange) {
          onLocaleChange(newLocale);
        } else {
          setInternalLocale(newLocale);
        }
      },
      [onLocaleChange]
    );

    // Toggle to next locale
    const handleToggle = useCallback(() => {
      const currentIndex = SUPPORTED_LOCALES.indexOf(currentLocale);
      const nextIndex = (currentIndex + 1) % SUPPORTED_LOCALES.length;
      const nextLocale = SUPPORTED_LOCALES[nextIndex];
      if (nextLocale) {
        handleLocaleChange(nextLocale);
      }
    }, [currentLocale, handleLocaleChange]);

    return (
      <div
        ref={ref}
        className={cn('ds-language-switcher', className)}
        style={{
          display: 'inline-flex',
          ...style,
        }}
        data-variant={variant}
        data-size={size}
        data-locale={currentLocale}
        {...props}
      >
        {variant === 'toggle' && (
          <ToggleVariant
            locale={currentLocale}
            onSwitch={handleToggle}
            labels={labels}
            size={size}
            disabled={disabled}
            ariaLabel={ariaLabel}
          />
        )}
        {variant === 'segmented' && (
          <SegmentedVariant
            locale={currentLocale}
            onSelect={handleLocaleChange}
            labels={labels}
            size={size}
            disabled={disabled}
            ariaLabel={ariaLabel}
          />
        )}
        {variant === 'dropdown' && (
          <DropdownVariant
            locale={currentLocale}
            onSelect={handleLocaleChange}
            labels={labels}
            size={size}
            disabled={disabled}
            ariaLabel={ariaLabel}
          />
        )}
      </div>
    );
  }
);

LanguageSwitcher.displayName = 'LanguageSwitcher';

/**
 * Connected version that auto-integrates with @xala/i18n
 *
 * This is a convenience wrapper that reads locale from i18n context
 * and automatically persists changes.
 *
 * Usage:
 * ```tsx
 * import { ConnectedLanguageSwitcher } from '@digdir/designsystemet-react';
 * import { I18nProvider } from '@xala/i18n';
 *
 * function App() {
 *   return (
 *     <I18nProvider>
 *       <ConnectedLanguageSwitcher />
 *     </I18nProvider>
 *   );
 * }
 * ```
 */
export interface ConnectedLanguageSwitcherProps
  extends Omit<LanguageSwitcherProps, 'locale' | 'onLocaleChange'> {
  /**
   * Hook to get current locale.
   * Expected signature: () => { locale: SupportedLocale; setLocale: (locale: SupportedLocale) => void }
   *
   * @example
   * import { useLocale } from '@xala/i18n';
   * <ConnectedLanguageSwitcher useLocale={useLocale} />
   */
  useLocale: () => {
    locale: SupportedLocale;
    setLocale: (locale: SupportedLocale) => void;
  };
}

export const ConnectedLanguageSwitcher = forwardRef<HTMLDivElement, ConnectedLanguageSwitcherProps>(
  ({ useLocale: useLocaleHook, ...props }, ref) => {
    const { locale, setLocale } = useLocaleHook();

    return (
      <LanguageSwitcher
        ref={ref}
        locale={locale}
        onLocaleChange={setLocale}
        {...props}
      />
    );
  }
);

ConnectedLanguageSwitcher.displayName = 'ConnectedLanguageSwitcher';
