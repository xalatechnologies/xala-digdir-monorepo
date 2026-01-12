/**
 * Header Sub-components
 *
 * Individual components for header sections using Digdir design system components
 */

import React, { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@digdir/designsystemet-react';
import {
  SunIcon,
  MoonIcon,
  UserIcon,
  SearchIcon
} from '../primitives';

// Logo Component
export interface HeaderLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Logo image source
   */
  src?: string;

  /**
   * Logo text
   */
  title?: string;

  /**
   * Logo subtitle
   */
  subtitle?: string;

  /**
   * Logo height
   * @default '32px'
   */
  height?: string;

  /**
   * Link href for logo
   */
  href?: string;
}

export const HeaderLogo = forwardRef<HTMLDivElement, HeaderLogoProps>(
  ({ src, title, subtitle, height = '32px', href, className, style, ...props }, ref) => {
    const content = (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-3)',
          color: 'var(--ds-color-neutral-text-default)',
          textDecoration: 'none',
        }}
      >
        {src && (
          <img
            src={src}
            alt=""
            style={{ height, width: 'auto' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        {(title || subtitle) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {title && (
              <span style={{
                fontWeight: 700,
                fontSize: 'var(--ds-font-size-lg)',
                lineHeight: '1.2',
                letterSpacing: '0.02em',
                color: 'var(--ds-color-neutral-text-default)'
              }}>
                {title}
              </span>
            )}
            {subtitle && (
              <span style={{
                fontWeight: 500,
                fontSize: 'var(--ds-font-size-xs)',
                lineHeight: '1.2',
                opacity: 0.6,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ds-color-neutral-text-subtle)'
              }}>
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    );

    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={className}
          style={{
            textDecoration: 'none',
            ...style
          }}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <div
        ref={ref}
        className={className}
        style={style}
        {...props}
      >
        {content}
      </div>
    );
  }
);

HeaderLogo.displayName = 'HeaderLogo';

// Close/Clear Icon Component
const CloseIcon = ({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// =============================================================================
// Search Result Types
// =============================================================================

/**
 * A single search result item
 */
export interface SearchResultItem {
  /**
   * Unique identifier for the result
   */
  id: string;

  /**
   * Display label/title
   */
  label: string;

  /**
   * Optional description or subtitle
   */
  description?: string;

  /**
   * Optional icon component
   */
  icon?: React.ReactNode;

  /**
   * Optional href for navigation
   */
  href?: string;

  /**
   * Optional keyboard shortcut hint
   */
  shortcut?: string;

  /**
   * Optional meta info (e.g., category, type)
   */
  meta?: string;

  /**
   * Group this result belongs to
   */
  group?: string;
}

/**
 * A group of search results
 */
export interface SearchResultGroup {
  /**
   * Unique identifier for the group
   */
  id: string;

  /**
   * Display label for the group
   */
  label: string;

  /**
   * Results in this group
   */
  items: SearchResultItem[];
}

// =============================================================================
// DIGILIST-style Search Component with Dropdown
// =============================================================================

export interface HeaderSearchProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'results'> {
  /**
   * Placeholder text
   * @default 'Søk'
   */
  placeholder?: string;

  /**
   * Search width
   * @default '100%'
   */
  width?: string;

  /**
   * On search callback - called on submit
   */
  onSearch?: (value: string) => void;

  /**
   * On change callback - called on every keystroke
   */
  onSearchChange?: (value: string) => void;

  /**
   * Initial value
   */
  defaultValue?: string;

  /**
   * Controlled value
   */
  value?: string;

  /**
   * Search results to display in dropdown
   */
  results?: SearchResultItem[] | SearchResultGroup[];

  /**
   * Called when a result is selected
   */
  onResultSelect?: (result: SearchResultItem) => void;

  /**
   * Show loading state in dropdown
   */
  isLoading?: boolean;

  /**
   * Text to show when no results found
   * @default 'Ingen resultater'
   */
  noResultsText?: string;

  /**
   * Show keyboard shortcut hint (⌘K)
   * @default false
   */
  showShortcut?: boolean;

  /**
   * Enable global keyboard shortcut (⌘K / Ctrl+K)
   * @default false
   */
  enableGlobalShortcut?: boolean;
}

// Helper to check if results are grouped
function isGroupedResults(results: SearchResultItem[] | SearchResultGroup[]): results is SearchResultGroup[] {
  return results.length > 0 && results[0] !== undefined && 'items' in results[0];
}

// Helper to flatten grouped results for keyboard navigation
function flattenResults(results: SearchResultItem[] | SearchResultGroup[]): SearchResultItem[] {
  if (!results.length) return [];
  if (isGroupedResults(results)) {
    return results.flatMap(group => group.items);
  }
  return results as SearchResultItem[];
}

// Arrow Right Icon for result items (shown on hover/selection)
const ArrowRightIcon = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// Loading Spinner with better animation
const LoadingSpinner = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ animation: 'search-spin 0.8s linear infinite' }}
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeOpacity="0.2"
    />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

// Search Empty State Icon
const SearchEmptyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="11" cy="11" r="8" opacity="0.5" />
    <path d="m21 21-4.35-4.35" opacity="0.5" />
    <path d="M8 11h6" strokeLinecap="round" />
  </svg>
);

export const HeaderSearch = forwardRef<HTMLDivElement, HeaderSearchProps>(
  ({
    placeholder = 'Søk',
    width = '100%',
    onSearch,
    onSearchChange,
    defaultValue = '',
    value: controlledValue,
    results = [],
    onResultSelect,
    isLoading = false,
    noResultsText = 'Ingen resultater',
    showShortcut = false,
    enableGlobalShortcut = false,
    className,
    style,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [isFocused, setIsFocused] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const value = controlledValue !== undefined ? controlledValue : internalValue;
    const flatResults = flattenResults(results);
    const hasResults = flatResults.length > 0;
    const showDropdown = isOpen && (hasResults || isLoading || (value && !hasResults));

    // Global keyboard shortcut (⌘K / Ctrl+K)
    useEffect(() => {
      if (!enableGlobalShortcut) return;

      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          inputRef.current?.focus();
          setIsOpen(true);
        }
      };

      document.addEventListener('keydown', handleGlobalKeyDown);
      return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, [enableGlobalShortcut]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          setSelectedIndex(-1);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset selected index when results change
    useEffect(() => {
      setSelectedIndex(-1);
    }, [results]);

    // Scroll selected item into view
    useEffect(() => {
      if (selectedIndex >= 0 && dropdownRef.current) {
        const selectedElement = dropdownRef.current.querySelector(`[data-index="${selectedIndex}"]`);
        selectedElement?.scrollIntoView({ block: 'nearest' });
      }
    }, [selectedIndex]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedIndex >= 0 && flatResults[selectedIndex]) {
        handleResultSelect(flatResults[selectedIndex]);
      } else {
        onSearch?.(value);
        setIsOpen(false);
      }
    };

    const handleClear = useCallback(() => {
      if (controlledValue === undefined) {
        setInternalValue('');
      }
      onSearchChange?.('');
      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.focus();
    }, [controlledValue, onSearchChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onSearchChange?.(newValue);
      setIsOpen(true);
      setSelectedIndex(-1);
    };

    const handleResultSelect = (result: SearchResultItem) => {
      onResultSelect?.(result);
      if (result.href) {
        window.location.href = result.href;
      }
      setIsOpen(false);
      setSelectedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'Escape':
          if (isOpen) {
            setIsOpen(false);
            setSelectedIndex(-1);
          } else {
            handleClear();
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen && hasResults) {
            setIsOpen(true);
          }
          setSelectedIndex(prev =>
            prev < flatResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev > 0 ? prev - 1 : flatResults.length - 1
          );
          break;
        case 'Enter':
          if (selectedIndex >= 0 && flatResults[selectedIndex]) {
            e.preventDefault();
            handleResultSelect(flatResults[selectedIndex]);
          }
          break;
        case 'Tab':
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
      if (value || hasResults) {
        setIsOpen(true);
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    // Render a single result item with enhanced styling
    const renderResultItem = (item: SearchResultItem, index: number, isFirstInGroup: boolean = false) => {
      const isSelected = selectedIndex === index;

      return (
        <div
          key={item.id}
          data-index={index}
          id={`result-${index}`}
          role="option"
          aria-selected={isSelected}
          onClick={() => handleResultSelect(item)}
          onMouseEnter={() => setSelectedIndex(index)}
          className="search-result-item"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '14px 24px',
            cursor: 'pointer',
            backgroundColor: isSelected ? 'var(--ds-color-accent-surface-default)' : 'transparent',
            borderLeft: isSelected ? '3px solid var(--ds-color-accent-base-default)' : '3px solid transparent',
            transition: 'all 0.12s ease',
            marginLeft: '4px',
            marginRight: '4px',
            borderRadius: isSelected ? 'var(--ds-border-radius-md)' : '0',
          }}
        >
          {/* Icon Container */}
          {item.icon && (
            <span style={{
              color: isSelected ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-text-subtle)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              backgroundColor: isSelected ? 'var(--ds-color-accent-surface-hover)' : 'var(--ds-color-neutral-surface-hover)',
              borderRadius: 'var(--ds-border-radius-md)',
              transition: 'all 0.12s ease',
            }}>
              {item.icon}
            </span>
          )}

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              color: isSelected ? 'var(--ds-color-accent-text-default)' : 'var(--ds-color-neutral-text-default)',
              fontSize: 'var(--ds-font-size-md)',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 'var(--ds-line-height-sm)',
              transition: 'color 0.12s ease',
            }}>
              {item.label}
            </div>
            {item.description && (
              <div style={{
                color: isSelected ? 'var(--ds-color-accent-text-subtle)' : 'var(--ds-color-neutral-text-subtle)',
                fontSize: 'var(--ds-font-size-sm)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginTop: 'var(--ds-spacing-1)',
                transition: 'color 0.12s ease',
              }}>
                {item.description}
              </div>
            )}
          </div>

          {/* Meta badge */}
          {item.meta && (
            <span style={{
              padding: 'var(--ds-spacing-1) var(--ds-spacing-3)',
              backgroundColor: isSelected ? 'var(--ds-color-accent-surface-hover)' : 'var(--ds-color-neutral-surface-active)',
              borderRadius: 'var(--ds-border-radius-full)',
              fontSize: 'var(--ds-font-size-xs)',
              fontWeight: 500,
              color: isSelected ? 'var(--ds-color-accent-text-default)' : 'var(--ds-color-neutral-text-subtle)',
              flexShrink: 0,
              transition: 'all 0.12s ease',
            }}>
              {item.meta}
            </span>
          )}

          {/* Shortcut badge */}
          {item.shortcut && (
            <kbd style={{
              padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
              backgroundColor: isSelected ? 'var(--ds-color-accent-surface-hover)' : 'var(--ds-color-neutral-surface-active)',
              borderRadius: 'var(--ds-border-radius-sm)',
              fontSize: 'var(--ds-font-size-xs)',
              fontWeight: 600,
              color: isSelected ? 'var(--ds-color-accent-text-default)' : 'var(--ds-color-neutral-text-subtle)',
              fontFamily: 'inherit',
              flexShrink: 0,
              border: '1px solid var(--ds-color-neutral-border-subtle)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'all 0.12s ease',
            }}>
              {item.shortcut}
            </kbd>
          )}

          {/* Arrow indicator - only show on selected */}
          <span style={{
            color: isSelected ? 'var(--ds-color-accent-base-default)' : 'transparent',
            flexShrink: 0,
            transition: 'all 0.12s ease',
            transform: isSelected ? 'translateX(0)' : 'translateX(-8px)',
            opacity: isSelected ? 1 : 0,
          }}>
            <ArrowRightIcon size={16} />
          </span>
        </div>
      );
    };

    // Render results (grouped or flat) with enhanced styling
    const renderResults = () => {
      if (isLoading) {
        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--ds-spacing-10)',
            gap: 'var(--ds-spacing-4)',
            color: 'var(--ds-color-accent-base-default)',
          }}>
            <LoadingSpinner size={32} />
            <span style={{
              color: 'var(--ds-color-neutral-text-subtle)',
              fontSize: 'var(--ds-font-size-sm)',
              fontWeight: 500,
            }}>
              Søker...
            </span>
          </div>
        );
      }

      if (!hasResults && value) {
        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--ds-spacing-10)',
            gap: 'var(--ds-spacing-4)',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}>
            <SearchEmptyIcon />
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 'var(--ds-font-size-md)',
                fontWeight: 600,
                color: 'var(--ds-color-neutral-text-default)',
                marginBottom: 'var(--ds-spacing-2)',
              }}>
                {noResultsText}
              </div>
              <div style={{
                fontSize: 'var(--ds-font-size-sm)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}>
                Prøv et annet søkeord
              </div>
            </div>
          </div>
        );
      }

      if (isGroupedResults(results)) {
        let globalIndex = 0;
        return (
          <div style={{ padding: '8px 0' }}>
            {results.map((group, groupIndex) => (
              <div key={group.id} style={{ marginTop: groupIndex > 0 ? '16px' : 0 }}>
                {/* Group Header */}
                <div style={{
                  padding: '8px 24px 12px 24px',
                }}>
                  <span style={{
                    fontSize: 'var(--ds-font-size-xs)',
                    fontWeight: 600,
                    color: 'var(--ds-color-neutral-text-subtle)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}>
                    {group.label}
                  </span>
                </div>
                {/* Group Items */}
                {group.items.map((item, itemIndex) => {
                  const el = renderResultItem(item, globalIndex, itemIndex === 0);
                  globalIndex++;
                  return el;
                })}
              </div>
            ))}
          </div>
        );
      }

      return (
        <div style={{ padding: 'var(--ds-spacing-2) 0' }}>
          {flatResults.map((item, index) => renderResultItem(item, index))}
        </div>
      );
    };

    // Handle ref forwarding
    const handleRef = (node: HTMLDivElement | null) => {
      containerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    };

    return (
      <div
        ref={handleRef}
        className={className}
        style={{
          width,
          position: 'relative',
          ...style
        }}
        {...props}
      >
        <style>
          {`
            @keyframes search-spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes search-dropdown-enter {
              from { opacity: 0; transform: translateY(-8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}
        </style>
        <form onSubmit={handleSubmit} style={{ margin: 0 }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: showDropdown ? 'var(--ds-color-neutral-surface-default)' : 'var(--ds-color-neutral-surface-hover)',
              border: showDropdown ? '1px solid var(--ds-color-neutral-border-default)' : '1px solid transparent',
              borderBottom: showDropdown ? '1px solid var(--ds-color-neutral-border-subtle)' : '1px solid transparent',
              borderRadius: showDropdown ? 'var(--ds-border-radius-lg) var(--ds-border-radius-lg) 0 0' : 'var(--ds-border-radius-lg)',
              padding: '0 20px',
              height: '52px',
              transition: 'all 0.2s ease',
              boxShadow: showDropdown
                ? '0 -4px 16px rgba(0, 0, 0, 0.08)'
                : isFocused
                  ? '0 0 0 3px var(--ds-color-accent-surface-default), 0 0 0 1px var(--ds-color-accent-base-default)'
                  : 'none',
            }}
          >
            {/* Search Icon */}
            <SearchIcon
              size={20}
              style={{
                color: isFocused || showDropdown ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-text-subtle)',
                flexShrink: 0,
                transition: 'color 0.2s ease',
                marginRight: '16px',
              }}
              aria-hidden="true"
            />

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              aria-label={placeholder}
              aria-expanded={showDropdown ? true : false}
              aria-controls={showDropdown ? "search-results" : undefined}
              aria-activedescendant={selectedIndex >= 0 ? `result-${selectedIndex}` : undefined}
              role="combobox"
              aria-autocomplete="list"
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                color: 'var(--ds-color-neutral-text-default)',
                fontSize: 'var(--ds-font-size-md)',
                fontWeight: 500,
                padding: '0',
                paddingRight: '16px',
                outline: 'none',
                minWidth: 0,
                height: '100%',
              }}
            />

            {/* Keyboard shortcut hint */}
            {showShortcut && !value && !isFocused && (
              <kbd style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-1)',
                padding: 'var(--ds-spacing-1) var(--ds-spacing-3)',
                backgroundColor: 'var(--ds-color-neutral-surface-active)',
                borderRadius: 'var(--ds-border-radius-sm)',
                fontSize: 'var(--ds-font-size-xs)',
                fontWeight: 600,
                color: 'var(--ds-color-neutral-text-subtle)',
                fontFamily: 'inherit',
                flexShrink: 0,
                border: '1px solid var(--ds-color-neutral-border-subtle)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}>
                <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>⌘</span>
                <span>K</span>
              </kbd>
            )}

            {/* Clear Button - only show when there's text */}
            {value && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Tøm søk"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  border: 'none',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: 'var(--ds-color-neutral-surface-active)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                  padding: 0,
                  marginLeft: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-hover)';
                  e.currentTarget.style.color = 'var(--ds-color-neutral-text-default)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-active)';
                  e.currentTarget.style.color = 'var(--ds-color-neutral-text-subtle)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>
        </form>

        {/* Dropdown Results */}
        {showDropdown && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              borderRadius: '0 0 var(--ds-border-radius-lg) var(--ds-border-radius-lg)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
              zIndex: 1000,
              border: '1px solid var(--ds-color-neutral-border-default)',
              borderTop: 'none',
              animation: 'search-dropdown-enter 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '480px',
            }}
          >
            {/* Scrollable results area */}
            <div
              ref={dropdownRef}
              id="search-results"
              role="listbox"
              style={{
                flex: '1 1 auto',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              {renderResults()}
            </div>

            {/* Footer with keyboard hints - always visible */}
            {hasResults && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '24px',
                padding: '14px 24px',
                borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
                backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                flexShrink: 0,
                borderRadius: '0 0 var(--ds-border-radius-lg) var(--ds-border-radius-lg)',
              }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: 'var(--ds-font-size-xs)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}>
                  <kbd style={{
                    padding: '4px 8px',
                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                    borderRadius: 'var(--ds-border-radius-sm)',
                    fontSize: 'var(--ds-font-size-xs)',
                    fontWeight: 600,
                    border: '1px solid var(--ds-color-neutral-border-subtle)',
                  }}>↑↓</kbd>
                  naviger
                </span>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: 'var(--ds-font-size-xs)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}>
                  <kbd style={{
                    padding: '4px 8px',
                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                    borderRadius: 'var(--ds-border-radius-sm)',
                    fontSize: 'var(--ds-font-size-xs)',
                    fontWeight: 600,
                    border: '1px solid var(--ds-color-neutral-border-subtle)',
                  }}>↵</kbd>
                  velg
                </span>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: 'var(--ds-font-size-xs)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}>
                  <kbd style={{
                    padding: '4px 8px',
                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                    borderRadius: 'var(--ds-border-radius-sm)',
                    fontSize: 'var(--ds-font-size-xs)',
                    fontWeight: 600,
                    border: '1px solid var(--ds-color-neutral-border-subtle)',
                  }}>esc</kbd>
                  lukk
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

HeaderSearch.displayName = 'HeaderSearch';

// Actions Container with proper Digdir spacing
export interface HeaderActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Spacing between actions - use CSS variable like 'var(--ds-spacing-4)'
   * @default 'var(--ds-spacing-4)'
   */
  spacing?: string;
}

export const HeaderActions = forwardRef<HTMLDivElement, HeaderActionsProps>(
  ({ children, spacing = 'var(--ds-spacing-4)', className, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing,
          ...style
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

HeaderActions.displayName = 'HeaderActions';

// Action Button using Digdir Button
export const HeaderActionButton = forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="tertiary"
        type="button"
        {...props}
      >
        {children}
      </Button>
    );
  }
);

HeaderActionButton.displayName = 'HeaderActionButton';

// Theme Toggle Button using Digdir Button
export interface HeaderThemeToggleProps {
  /**
   * Current theme
   */
  theme?: string;

  /**
   * On toggle callback
   */
  onToggle?: () => void;

  /**
   * Is dark mode?
   */
  isDark?: boolean;
}

export const HeaderThemeToggle: React.FC<HeaderThemeToggleProps> = ({ onToggle, isDark = false }) => {
  return (
    <Button
      variant="tertiary"
      icon
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Bytt til lyst tema' : 'Bytt til mørkt tema'}
      title={isDark ? 'Bytt til lyst tema' : 'Bytt til mørkt tema'}
    >
      {isDark ? (
        <SunIcon size={22} aria-hidden style={{ color: 'var(--ds-color-neutral-text-default)' }} />
      ) : (
        <MoonIcon size={22} aria-hidden style={{ color: 'var(--ds-color-neutral-text-default)' }} />
      )}
    </Button>
  );
};

// Language Switch - DIGILIST style with proper Digdir spacing
export interface HeaderLanguageSwitchProps {
  /**
   * Current language
   */
  language?: string;

  /**
   * On switch callback
   */
  onSwitch?: (lang: string) => void;
}

export const HeaderLanguageSwitch: React.FC<HeaderLanguageSwitchProps> = ({ language = 'no', onSwitch }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      padding: 'var(--ds-spacing-1)',
      backgroundColor: 'var(--ds-color-neutral-surface-hover)',
      borderRadius: 'var(--ds-border-radius-md)',
    }}>
      <button
        type="button"
        onClick={() => onSwitch?.('no')}
        aria-label="Norsk"
        aria-pressed={language === 'no'}
        style={{
          padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
          border: 'none',
          borderRadius: 'var(--ds-border-radius-sm)',
          backgroundColor: language === 'no' ? 'var(--ds-color-neutral-surface-default)' : 'transparent',
          color: language === 'no' ? 'var(--ds-color-neutral-text-default)' : 'var(--ds-color-neutral-text-subtle)',
          fontWeight: 600,
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: language === 'no' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        NO
      </button>
      <button
        type="button"
        onClick={() => onSwitch?.('en')}
        aria-label="English"
        aria-pressed={language === 'en'}
        style={{
          padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
          border: 'none',
          borderRadius: 'var(--ds-border-radius-sm)',
          backgroundColor: language === 'en' ? 'var(--ds-color-neutral-surface-default)' : 'transparent',
          color: language === 'en' ? 'var(--ds-color-neutral-text-default)' : 'var(--ds-color-neutral-text-subtle)',
          fontWeight: 600,
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: language === 'en' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        EN
      </button>
    </div>
  );
};

// Login Button using Digdir Button - DIGILIST style (green)
export interface HeaderLoginButtonProps {
  /**
   * User is logged in
   */
  isLoggedIn?: boolean;

  /**
   * User name
   */
  userName?: string | undefined;

  /**
   * On login callback
   */
  onLogin?: () => void;

  /**
   * On logout callback
   */
  onLogout?: () => void;

  /**
   * Login text
   * @default 'Logg inn'
   */
  loginText?: string;
}

export const HeaderLoginButton: React.FC<HeaderLoginButtonProps> = ({
  isLoggedIn,
  userName,
  onLogin,
  onLogout,
  loginText = 'Logg inn'
}) => {
  if (isLoggedIn && userName) {
    return (
      <Button
        variant="primary"
        type="button"
        onClick={onLogout}
        data-color="success"
        aria-label={`Logget inn som ${userName}. Klikk for å logge ut.`}
      >
        <UserIcon size={18} aria-hidden />
        {userName}
      </Button>
    );
  }

  return (
    <Button
      variant="primary"
      type="button"
      onClick={onLogin}
      data-color="success"
      aria-label="Logg inn"
    >
      <UserIcon size={18} aria-hidden />
      {loginText}
    </Button>
  );
};
