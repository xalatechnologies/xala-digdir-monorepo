/**
 * NumberInput Component
 *
 * Number input with stepper buttons and validation.
 * SSR-safe with 'use client' directive.
 *
 * @module @xalatechnologies/platform/ui/composed/NumberInput
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface NumberInputProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  disabled?: boolean;
  readOnly?: boolean;
  label?: string;
  error?: string;
  helperText?: string;
  prefix?: string;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
  hideControls?: boolean;
  allowNegative?: boolean;
  allowDecimal?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function MinusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// =============================================================================
// Styles
// =============================================================================

const sizeStyles = {
  sm: { height: 'var(--ds-sizing-8)', padding: 'var(--ds-spacing-1) var(--ds-spacing-2)', font: 'var(--ds-font-size-sm)' },
  md: { height: 'var(--ds-sizing-10)', padding: 'var(--ds-spacing-2) var(--ds-spacing-3)', font: 'var(--ds-font-size-md)' },
  lg: { height: 'var(--ds-sizing-12)', padding: 'var(--ds-spacing-3) var(--ds-spacing-4)', font: 'var(--ds-font-size-lg)' },
};

// =============================================================================
// Helpers
// =============================================================================

function clamp(value: number, min?: number, max?: number): number {
  let result = value;
  if (min !== undefined) result = Math.max(result, min);
  if (max !== undefined) result = Math.min(result, max);
  return result;
}

function roundToPrecision(value: number, precision: number): number {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

// =============================================================================
// NumberInput Component
// =============================================================================

export function NumberInput({
  value: controlledValue,
  defaultValue = 0,
  onChange,
  min,
  max,
  step = 1,
  precision = 0,
  disabled = false,
  readOnly = false,
  label,
  error,
  helperText,
  prefix,
  suffix,
  size = 'md',
  hideControls = false,
  allowNegative = true,
  allowDecimal = false,
  className,
  style,
}: NumberInputProps): React.ReactElement {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [inputValue, setInputValue] = useState(defaultValue.toString());
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const value = isControlled ? controlledValue : internalValue;
  const styles = sizeStyles[size];

  const updateValue = useCallback(
    (newValue: number) => {
      const clampedValue = clamp(roundToPrecision(newValue, precision), min, max);
      if (!isControlled) {
        setInternalValue(clampedValue);
      }
      setInputValue(clampedValue.toString());
      onChange?.(clampedValue);
    },
    [isControlled, min, max, precision, onChange]
  );

  const handleIncrement = useCallback(() => {
    if (disabled || readOnly) return;
    updateValue(value + step);
  }, [disabled, readOnly, value, step, updateValue]);

  const handleDecrement = useCallback(() => {
    if (disabled || readOnly) return;
    updateValue(value - step);
  }, [disabled, readOnly, value, step, updateValue]);

  const startContinuousChange = useCallback(
    (direction: 'increment' | 'decrement') => {
      if (disabled || readOnly) return;
      const change = direction === 'increment' ? handleIncrement : handleDecrement;
      change();
      intervalRef.current = setInterval(change, 100);
    },
    [disabled, readOnly, handleIncrement, handleDecrement]
  );

  const stopContinuousChange = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newInputValue = e.target.value;
      setInputValue(newInputValue);

      if (newInputValue === '' || newInputValue === '-') return;

      const parsed = parseFloat(newInputValue);
      if (!isNaN(parsed)) {
        if (!allowNegative && parsed < 0) return;
        if (!allowDecimal && newInputValue.includes('.')) return;
        updateValue(parsed);
      }
    },
    [allowNegative, allowDecimal, updateValue]
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const parsed = parseFloat(inputValue);
    if (isNaN(parsed) || inputValue === '' || inputValue === '-') {
      setInputValue(value.toString());
    } else {
      updateValue(parsed);
    }
  }, [inputValue, value, updateValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled || readOnly) return;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleIncrement();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleDecrement();
      }
    },
    [disabled, readOnly, handleIncrement, handleDecrement]
  );

  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString());
    }
  }, [value, isFocused]);

  useEffect(() => {
    return () => stopContinuousChange();
  }, [stopContinuousChange]);

  const canDecrement = min === undefined || value > min;
  const canIncrement = max === undefined || value < max;

  return (
    <div className={className} style={style}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: 'var(--ds-spacing-2)',
            fontSize: 'var(--ds-font-size-sm)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          {label}
        </label>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          borderWidth: 'var(--ds-border-width-default)',
          borderStyle: 'solid',
          borderColor: error
            ? 'var(--ds-color-danger-border-default)'
            : isFocused
            ? 'var(--ds-color-accent-border-default)'
            : 'var(--ds-color-neutral-border-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          backgroundColor: disabled ? 'var(--ds-color-neutral-surface-subtle)' : 'var(--ds-color-neutral-background-default)',
          overflow: 'hidden',
        }}
      >
        {!hideControls && (
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled || !canDecrement}
            onMouseDown={() => startContinuousChange('decrement')}
            onMouseUp={stopContinuousChange}
            onMouseLeave={stopContinuousChange}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: styles.height,
              backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
              borderWidth: '0',
              borderRightWidth: 'var(--ds-border-width-default)',
              borderRightStyle: 'solid',
              borderRightColor: 'var(--ds-color-neutral-border-subtle)',
              cursor: disabled || !canDecrement ? 'not-allowed' : 'pointer',
              opacity: disabled || !canDecrement ? 0.5 : 1,
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            <MinusIcon />
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          {prefix && (
            <span
              style={{
                paddingLeft: 'var(--ds-spacing-2)',
                fontSize: styles.font,
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {prefix}
            </span>
          )}
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            readOnly={readOnly}
            style={{
              flex: 1,
              height: styles.height,
              padding: styles.padding,
              fontSize: styles.font,
              textAlign: 'center',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          />
          {suffix && (
            <span
              style={{
                paddingRight: 'var(--ds-spacing-2)',
                fontSize: styles.font,
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {suffix}
            </span>
          )}
        </div>

        {!hideControls && (
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled || !canIncrement}
            onMouseDown={() => startContinuousChange('increment')}
            onMouseUp={stopContinuousChange}
            onMouseLeave={stopContinuousChange}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: styles.height,
              backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
              borderWidth: '0',
              borderLeftWidth: 'var(--ds-border-width-default)',
              borderLeftStyle: 'solid',
              borderLeftColor: 'var(--ds-color-neutral-border-subtle)',
              cursor: disabled || !canIncrement ? 'not-allowed' : 'pointer',
              opacity: disabled || !canIncrement ? 0.5 : 1,
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            <PlusIcon />
          </button>
        )}
      </div>

      {(error || helperText) && (
        <p
          style={{
            marginTop: 'var(--ds-spacing-1)',
            fontSize: 'var(--ds-font-size-sm)',
            color: error ? 'var(--ds-color-danger-text-default)' : 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}

export default NumberInput;
