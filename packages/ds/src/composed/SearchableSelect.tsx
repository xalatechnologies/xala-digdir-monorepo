/**
 * SearchableSelect / Combobox Component
 *
 * Searchable dropdown with filtering, async loading, and multi-select.
 * SSR-safe with 'use client' directive.
 *
 * @module @xala/ds/composed/SearchableSelect
 */

'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  group?: string;
}

export interface SearchableSelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  loading?: boolean;
  multiple?: boolean;
  clearable?: boolean;
  creatable?: boolean;
  onCreate?: (value: string) => void;
  emptyMessage?: string;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// =============================================================================
// SearchableSelect Component
// =============================================================================

export function SearchableSelect({
  options,
  value,
  onChange,
  onSearch,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  label,
  error,
  helperText,
  disabled = false,
  loading = false,
  multiple = false,
  clearable = true,
  creatable = false,
  onCreate,
  emptyMessage = 'No options found',
  className,
  style,
}: SearchableSelectProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedValues = useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const query = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.description?.toLowerCase().includes(query)
    );
  }, [options, search]);

  const groupedOptions = useMemo(() => {
    const groups: Record<string, SelectOption[]> = {};
    const ungrouped: SelectOption[] = [];
    filteredOptions.forEach((opt) => {
      if (opt.group) {
        if (!groups[opt.group]) groups[opt.group] = [];
        groups[opt.group].push(opt);
      } else {
        ungrouped.push(opt);
      }
    });
    return { groups, ungrouped };
  }, [filteredOptions]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    onSearch?.(search);
  }, [search, onSearch]);

  const handleSelect = useCallback(
    (optionValue: string) => {
      if (multiple) {
        const newValues = selectedValues.includes(optionValue)
          ? selectedValues.filter((v) => v !== optionValue)
          : [...selectedValues, optionValue];
        onChange?.(newValues);
      } else {
        onChange?.(optionValue);
        setIsOpen(false);
        setSearch('');
      }
    },
    [multiple, selectedValues, onChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(multiple ? [] : '');
    },
    [multiple, onChange]
  );

  const handleRemoveTag = useCallback(
    (e: React.MouseEvent, val: string) => {
      e.stopPropagation();
      if (multiple) {
        onChange?.(selectedValues.filter((v) => v !== val));
      }
    },
    [multiple, selectedValues, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSearch('');
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          const focusedOption = filteredOptions[focusedIndex];
          if (focusedIndex >= 0 && focusedOption) {
            handleSelect(focusedOption.value);
          } else if (creatable && search && !filteredOptions.find((o) => o.label === search)) {
            onCreate?.(search);
            setSearch('');
          }
          break;
      }
    },
    [isOpen, focusedIndex, filteredOptions, handleSelect, creatable, search, onCreate]
  );

  const getDisplayValue = () => {
    if (selectedValues.length === 0) return null;
    if (multiple) {
      return selectedValues.map((v) => {
        const opt = options.find((o) => o.value === v);
        return (
          <span
            key={v}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-1)',
              padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
              fontSize: 'var(--ds-font-size-xs)',
              backgroundColor: 'var(--ds-color-accent-surface-subtle)',
              color: 'var(--ds-color-accent-text-default)',
              borderRadius: 'var(--ds-border-radius-sm)',
            }}
          >
            {opt?.label || v}
            <button
              type="button"
              onClick={(e) => handleRemoveTag(e, v)}
              style={{ display: 'flex', padding: 0, backgroundColor: 'transparent', borderWidth: '0', cursor: 'pointer', color: 'inherit' }}
            >
              <XIcon />
            </button>
          </span>
        );
      });
    }
    const opt = options.find((o) => o.value === selectedValues[0]);
    return opt?.label || selectedValues[0];
  };

  const showCreateOption = creatable && search && !filteredOptions.find((o) => o.label.toLowerCase() === search.toLowerCase());

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', ...style }} onKeyDown={handleKeyDown}>
      {label && (
        <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)', fontWeight: 'var(--ds-font-weight-medium)', color: 'var(--ds-color-neutral-text-default)' }}>
          {label}
        </label>
      )}

      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-2)',
          minHeight: 'var(--ds-sizing-10)',
          padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          borderWidth: 'var(--ds-border-width-default)',
          borderStyle: 'solid',
          borderColor: error ? 'var(--ds-color-danger-border-default)' : isOpen ? 'var(--ds-color-accent-border-default)' : 'var(--ds-color-neutral-border-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-1)', alignItems: 'center' }}>
          {selectedValues.length > 0 ? (
            getDisplayValue()
          ) : (
            <span style={{ color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-sm)' }}>{placeholder}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
          {loading && <SpinnerIcon />}
          {clearable && selectedValues.length > 0 && !disabled && (
            <button type="button" onClick={handleClear} style={{ display: 'flex', padding: 'var(--ds-spacing-1)', backgroundColor: 'transparent', borderWidth: '0', cursor: 'pointer', color: 'var(--ds-color-neutral-text-subtle)', borderRadius: 'var(--ds-border-radius-sm)' }}>
              <XIcon />
            </button>
          )}
          <ChevronDownIcon />
        </div>
      </div>

      {(error || helperText) && (
        <p style={{ marginTop: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-sm)', color: error ? 'var(--ds-color-danger-text-default)' : 'var(--ds-color-neutral-text-subtle)' }}>
          {error || helperText}
        </p>
      )}

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 'var(--ds-spacing-1)',
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            borderWidth: 'var(--ds-border-width-default)',
            borderStyle: 'solid',
            borderColor: 'var(--ds-color-neutral-border-default)',
            borderRadius: 'var(--ds-border-radius-lg)',
            boxShadow: 'var(--ds-shadow-lg)',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: 'var(--ds-spacing-2)', borderBottomWidth: 'var(--ds-border-width-default)', borderBottomStyle: 'solid', borderBottomColor: 'var(--ds-color-neutral-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', padding: 'var(--ds-spacing-2)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
              <SearchIcon />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-default)' }}
              />
            </div>
          </div>

          <div ref={listRef} role="listbox" style={{ maxHeight: 'var(--ds-sizing-60)', overflowY: 'auto', padding: 'var(--ds-spacing-2)' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                <SpinnerIcon />
              </div>
            ) : filteredOptions.length === 0 && !showCreateOption ? (
              <div style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center', fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                {emptyMessage}
              </div>
            ) : (
              <>
                {groupedOptions.ungrouped.map((opt, i) => {
                  const isSelected = selectedValues.includes(opt.value);
                  const isFocused = focusedIndex === i;
                  return (
                    <div
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => !opt.disabled && handleSelect(opt.value)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--ds-spacing-2)',
                        padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                        fontSize: 'var(--ds-font-size-sm)',
                        backgroundColor: isFocused ? 'var(--ds-color-neutral-surface-hover)' : 'transparent',
                        color: opt.disabled ? 'var(--ds-color-neutral-text-subtle)' : 'var(--ds-color-neutral-text-default)',
                        borderRadius: 'var(--ds-border-radius-sm)',
                        cursor: opt.disabled ? 'not-allowed' : 'pointer',
                        opacity: opt.disabled ? 0.5 : 1,
                      }}
                    >
                      {opt.icon}
                      <div style={{ flex: 1 }}>
                        <div>{opt.label}</div>
                        {opt.description && <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>{opt.description}</div>}
                      </div>
                      {isSelected && <CheckIcon />}
                    </div>
                  );
                })}
                {Object.entries(groupedOptions.groups).map(([group, opts]) => (
                  <div key={group}>
                    <div style={{ padding: 'var(--ds-spacing-2) var(--ds-spacing-3)', fontSize: 'var(--ds-font-size-xs)', fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-neutral-text-subtle)', textTransform: 'uppercase' }}>
                      {group}
                    </div>
                    {opts.map((opt) => {
                      const isSelected = selectedValues.includes(opt.value);
                      return (
                        <div
                          key={opt.value}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => !opt.disabled && handleSelect(opt.value)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--ds-spacing-2)',
                            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                            fontSize: 'var(--ds-font-size-sm)',
                            backgroundColor: 'transparent',
                            color: opt.disabled ? 'var(--ds-color-neutral-text-subtle)' : 'var(--ds-color-neutral-text-default)',
                            borderRadius: 'var(--ds-border-radius-sm)',
                            cursor: opt.disabled ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {opt.icon}
                          <div style={{ flex: 1 }}>{opt.label}</div>
                          {isSelected && <CheckIcon />}
                        </div>
                      );
                    })}
                  </div>
                ))}
                {showCreateOption && (
                  <div
                    onClick={() => { onCreate?.(search); setSearch(''); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--ds-spacing-2)',
                      padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                      fontSize: 'var(--ds-font-size-sm)',
                      color: 'var(--ds-color-accent-text-default)',
                      borderRadius: 'var(--ds-border-radius-sm)',
                      cursor: 'pointer',
                    }}
                  >
                    Create "{search}"
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default SearchableSelect;
