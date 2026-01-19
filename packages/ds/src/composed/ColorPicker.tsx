/**
 * ColorPicker Component
 *
 * Interactive color selection with presets and custom input.
 * SSR-safe with 'use client' directive.
 *
 * @module @xala/ds/composed/ColorPicker
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface ColorPickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (color: string) => void;
  presets?: string[];
  showInput?: boolean;
  showPresets?: boolean;
  label?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface ColorSwatchProps {
  color: string;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Default Presets
// =============================================================================

const DEFAULT_PRESETS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#78716c', '#71717a', '#000000',
];

// =============================================================================
// Helpers
// =============================================================================

function isValidHex(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
}

function normalizeHex(hex: string): string {
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalizeHex(hex));
  if (!result) return { h: 0, s: 0, l: 0 };

  let r = parseInt(result[1] ?? '0', 16) / 255;
  let g = parseInt(result[2] ?? '0', 16) / 255;
  let b = parseInt(result[3] ?? '0', 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// =============================================================================
// ColorSwatch Component
// =============================================================================

export function ColorSwatch({
  color,
  selected = false,
  onClick,
  size = 'md',
  className,
  style,
}: ColorSwatchProps): React.ReactElement {
  const sizes = {
    sm: 'var(--ds-sizing-5)',
    md: 'var(--ds-sizing-7)',
    lg: 'var(--ds-sizing-9)',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      aria-label={`Select color ${color}`}
      style={{
        width: sizes[size],
        height: sizes[size],
        backgroundColor: color,
        borderWidth: selected ? 'var(--ds-border-width-lg)' : 'var(--ds-border-width-default)',
        borderStyle: 'solid',
        borderColor: selected ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-md)',
        cursor: 'pointer',
        outline: 'none',
        boxShadow: selected ? 'var(--ds-shadow-sm)' : 'none',
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
        ...style,
      }}
    />
  );
}

// =============================================================================
// ColorPicker Component
// =============================================================================

export function ColorPicker({
  value: controlledValue,
  defaultValue = '#3b82f6',
  onChange,
  presets = DEFAULT_PRESETS,
  showInput = true,
  showPresets = true,
  label,
  disabled = false,
  className,
  style,
}: ColorPickerProps): React.ReactElement {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [inputValue, setInputValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const value = isControlled ? controlledValue : internalValue;
  const hsl = hexToHsl(value);

  const updateColor = useCallback(
    (newColor: string) => {
      if (!isControlled) {
        setInternalValue(newColor);
      }
      setInputValue(newColor);
      onChange?.(newColor);
    },
    [isControlled, onChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      if (isValidHex(newValue)) {
        updateColor(normalizeHex(newValue));
      }
    },
    [updateColor]
  );

  const handleInputBlur = useCallback(() => {
    if (!isValidHex(inputValue)) {
      setInputValue(value);
    }
  }, [inputValue, value]);

  const handleHueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newHue = parseInt(e.target.value);
      updateColor(hslToHex(newHue, hsl.s || 50, hsl.l || 50));
    },
    [hsl.s, hsl.l, updateColor]
  );

  const handleSaturationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSat = parseInt(e.target.value);
      updateColor(hslToHex(hsl.h, newSat, hsl.l || 50));
    },
    [hsl.h, hsl.l, updateColor]
  );

  const handleLightnessChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newLight = parseInt(e.target.value);
      updateColor(hslToHex(hsl.h, hsl.s || 50, newLight));
    },
    [hsl.h, hsl.s, updateColor]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', ...style }}>
      {label && (
        <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)', fontWeight: 'var(--ds-font-weight-medium)', color: 'var(--ds-color-neutral-text-default)' }}>
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-2)',
          padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          borderWidth: 'var(--ds-border-width-default)',
          borderStyle: 'solid',
          borderColor: isOpen ? 'var(--ds-color-accent-border-default)' : 'var(--ds-color-neutral-border-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <div
          style={{
            width: 'var(--ds-sizing-6)',
            height: 'var(--ds-sizing-6)',
            backgroundColor: value,
            borderRadius: 'var(--ds-border-radius-sm)',
            borderWidth: 'var(--ds-border-width-default)',
            borderStyle: 'solid',
            borderColor: 'var(--ds-color-neutral-border-subtle)',
          }}
        />
        <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-default)', fontFamily: 'var(--ds-font-family-mono)' }}>
          {value.toUpperCase()}
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 'var(--ds-spacing-2)',
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            borderWidth: 'var(--ds-border-width-default)',
            borderStyle: 'solid',
            borderColor: 'var(--ds-color-neutral-border-subtle)',
            borderRadius: 'var(--ds-border-radius-lg)',
            boxShadow: 'var(--ds-shadow-lg)',
            zIndex: 50,
            minWidth: '280px',
          }}
        >
          <div
            style={{
              width: '100%',
              height: 'var(--ds-sizing-20)',
              marginBottom: 'var(--ds-spacing-4)',
              backgroundColor: value,
              borderRadius: 'var(--ds-border-radius-md)',
              borderWidth: 'var(--ds-border-width-default)',
              borderStyle: 'solid',
              borderColor: 'var(--ds-color-neutral-border-subtle)',
            }}
          />

          <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              <span>Hue</span>
              <span>{hsl.h}°</span>
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={hsl.h}
              onChange={handleHueChange}
              style={{ width: '100%', accentColor: 'var(--ds-color-accent-base-default)' }}
            />
          </div>

          <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              <span>Saturation</span>
              <span>{hsl.s}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={hsl.s}
              onChange={handleSaturationChange}
              style={{ width: '100%', accentColor: 'var(--ds-color-accent-base-default)' }}
            />
          </div>

          <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              <span>Lightness</span>
              <span>{hsl.l}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={hsl.l}
              onChange={handleLightnessChange}
              style={{ width: '100%', accentColor: 'var(--ds-color-accent-base-default)' }}
            />
          </div>

          {showInput && (
            <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="#000000"
                style={{
                  width: '100%',
                  padding: 'var(--ds-spacing-2)',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontFamily: 'var(--ds-font-family-mono)',
                  textTransform: 'uppercase',
                  borderWidth: 'var(--ds-border-width-default)',
                  borderStyle: 'solid',
                  borderColor: 'var(--ds-color-neutral-border-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {showPresets && presets.length > 0 && (
            <div>
              <span style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                Presets
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-1)' }}>
                {presets.map((preset) => (
                  <ColorSwatch
                    key={preset}
                    color={preset}
                    selected={value.toLowerCase() === preset.toLowerCase()}
                    onClick={() => updateColor(preset)}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default { ColorPicker, ColorSwatch };
