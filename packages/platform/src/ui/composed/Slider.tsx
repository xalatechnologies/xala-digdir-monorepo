/**
 * Slider & RangeSlider Components
 *
 * Interactive sliders with labels, marks, and tooltips.
 * SSR-safe with 'use client' directive.
 *
 * @module @xalatechnologies/platform/ui/composed/Slider
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface SliderMark {
  value: number;
  label?: string;
}

export interface SliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  disabled?: boolean;
  showTooltip?: boolean | 'always';
  showValue?: boolean;
  marks?: SliderMark[];
  label?: string;
  formatValue?: (value: number) => string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
  style?: React.CSSProperties;
}

export interface RangeSliderProps {
  value?: [number, number];
  defaultValue?: [number, number];
  min?: number;
  max?: number;
  step?: number;
  minDistance?: number;
  onChange?: (value: [number, number]) => void;
  onChangeEnd?: (value: [number, number]) => void;
  disabled?: boolean;
  showTooltip?: boolean | 'always';
  marks?: SliderMark[];
  label?: string;
  formatValue?: (value: number) => string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Styles
// =============================================================================

const sizeStyles = {
  sm: { track: 'var(--ds-sizing-1)', thumb: 'var(--ds-sizing-4)' },
  md: { track: 'var(--ds-sizing-2)', thumb: 'var(--ds-sizing-5)' },
  lg: { track: 'var(--ds-sizing-3)', thumb: 'var(--ds-sizing-6)' },
};

const colorStyles = {
  default: 'var(--ds-color-accent-base-default)',
  success: 'var(--ds-color-success-base-default)',
  warning: 'var(--ds-color-warning-base-default)',
  danger: 'var(--ds-color-danger-base-default)',
};

// =============================================================================
// Helpers
// =============================================================================

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundToStep(value: number, step: number, min: number): number {
  const rounded = Math.round((value - min) / step) * step + min;
  return parseFloat(rounded.toFixed(10));
}

function getPercentage(value: number, min: number, max: number): number {
  return ((value - min) / (max - min)) * 100;
}

// =============================================================================
// Slider Component
// =============================================================================

export function Slider({
  value: controlledValue,
  defaultValue = 50,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onChangeEnd,
  disabled = false,
  showTooltip = false,
  showValue = false,
  marks,
  label,
  formatValue = (v) => v.toString(),
  size = 'md',
  color = 'default',
  className,
  style,
}: SliderProps): React.ReactElement {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltipState, setShowTooltipState] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const value = isControlled ? controlledValue : internalValue;
  const percentage = getPercentage(value, min, max);
  const styles = sizeStyles[size];
  const trackColor = colorStyles[color];

  const updateValue = useCallback(
    (clientX: number) => {
      if (!trackRef.current || disabled) return;
      const rect = trackRef.current.getBoundingClientRect();
      const percent = clamp((clientX - rect.left) / rect.width, 0, 1);
      const rawValue = min + percent * (max - min);
      const newValue = roundToStep(rawValue, step, min);
      const clampedValue = clamp(newValue, min, max);

      if (!isControlled) {
        setInternalValue(clampedValue);
      }
      onChange?.(clampedValue);
    },
    [disabled, min, max, step, isControlled, onChange]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragging(true);
      updateValue(e.clientX);
    },
    [disabled, updateValue]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        updateValue(e.clientX);
      }
    },
    [isDragging, updateValue]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onChangeEnd?.(value);
    }
  }, [isDragging, value, onChangeEnd]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      let newValue = value;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          newValue = clamp(value + step, min, max);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          newValue = clamp(value - step, min, max);
          break;
        case 'Home':
          newValue = min;
          break;
        case 'End':
          newValue = max;
          break;
        default:
          return;
      }
      e.preventDefault();
      if (!isControlled) setInternalValue(newValue);
      onChange?.(newValue);
      onChangeEnd?.(newValue);
    },
    [disabled, value, step, min, max, isControlled, onChange, onChangeEnd]
  );

  const tooltipVisible = showTooltip === 'always' || (showTooltip && (isDragging || showTooltipState));

  return (
    <div className={className} style={{ width: '100%', ...style }}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-2)' }}>
          {label && (
            <span style={{ fontSize: 'var(--ds-font-size-sm)', fontWeight: 'var(--ds-font-weight-medium)', color: 'var(--ds-color-neutral-text-default)' }}>
              {label}
            </span>
          )}
          {showValue && (
            <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              {formatValue(value)}
            </span>
          )}
        </div>
      )}

      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        style={{
          position: 'relative',
          height: styles.thumb,
          display: 'flex',
          alignItems: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: styles.track,
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderRadius: 'var(--ds-border-radius-full)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: `${percentage}%`,
            height: styles.track,
            backgroundColor: trackColor,
            borderRadius: 'var(--ds-border-radius-full)',
          }}
        />

        {marks?.map((mark) => {
          const markPercent = getPercentage(mark.value, min, max);
          return (
            <div
              key={mark.value}
              style={{
                position: 'absolute',
                left: `${markPercent}%`,
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 'var(--ds-sizing-1)',
                  height: 'var(--ds-sizing-2)',
                  backgroundColor: mark.value <= value ? trackColor : 'var(--ds-color-neutral-border-default)',
                  borderRadius: 'var(--ds-border-radius-full)',
                }}
              />
              {mark.label && (
                <span
                  style={{
                    marginTop: 'var(--ds-spacing-2)',
                    fontSize: 'var(--ds-font-size-xs)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {mark.label}
                </span>
              )}
            </div>
          );
        })}

        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-disabled={disabled}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setShowTooltipState(true)}
          onMouseLeave={() => setShowTooltipState(false)}
          onFocus={() => setShowTooltipState(true)}
          onBlur={() => setShowTooltipState(false)}
          style={{
            position: 'absolute',
            left: `${percentage}%`,
            transform: 'translateX(-50%)',
            width: styles.thumb,
            height: styles.thumb,
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            borderWidth: 'var(--ds-border-width-lg)',
            borderStyle: 'solid',
            borderColor: trackColor,
            borderRadius: 'var(--ds-border-radius-full)',
            cursor: disabled ? 'not-allowed' : 'grab',
            boxShadow: isDragging ? 'var(--ds-shadow-md)' : 'var(--ds-shadow-sm)',
            transition: 'box-shadow 0.15s ease',
            outline: 'none',
          }}
        >
          {tooltipVisible && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginBottom: 'var(--ds-spacing-2)',
                padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                backgroundColor: 'var(--ds-color-neutral-text-default)',
                color: 'var(--ds-color-neutral-background-default)',
                fontSize: 'var(--ds-font-size-xs)',
                fontWeight: 'var(--ds-font-weight-medium)',
                borderRadius: 'var(--ds-border-radius-sm)',
                whiteSpace: 'nowrap',
              }}
            >
              {formatValue(value)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// RangeSlider Component
// =============================================================================

export function RangeSlider({
  value: controlledValue,
  defaultValue = [25, 75],
  min = 0,
  max = 100,
  step = 1,
  minDistance = 0,
  onChange,
  onChangeEnd,
  disabled = false,
  showTooltip = false,
  marks,
  label,
  formatValue = (v) => v.toString(),
  size = 'md',
  className,
  style,
}: RangeSliderProps): React.ReactElement {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<[number, number]>(defaultValue);
  const [activeThumb, setActiveThumb] = useState<0 | 1 | null>(null);
  const [showTooltipStates, setShowTooltipStates] = useState<[boolean, boolean]>([false, false]);
  const trackRef = useRef<HTMLDivElement>(null);

  const value = isControlled ? controlledValue : internalValue;
  const [lowValue, highValue] = value;
  const lowPercent = getPercentage(lowValue, min, max);
  const highPercent = getPercentage(highValue, min, max);
  const styles = sizeStyles[size];

  const updateValue = useCallback(
    (clientX: number, thumbIndex: 0 | 1) => {
      if (!trackRef.current || disabled) return;
      const rect = trackRef.current.getBoundingClientRect();
      const percent = clamp((clientX - rect.left) / rect.width, 0, 1);
      const rawValue = min + percent * (max - min);
      const newValue = roundToStep(rawValue, step, min);

      let newRange: [number, number] = [...value] as [number, number];
      if (thumbIndex === 0) {
        newRange[0] = clamp(newValue, min, value[1] - minDistance);
      } else {
        newRange[1] = clamp(newValue, value[0] + minDistance, max);
      }

      if (!isControlled) setInternalValue(newRange);
      onChange?.(newRange);
    },
    [disabled, min, max, step, minDistance, value, isControlled, onChange]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, thumbIndex: 0 | 1) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      setActiveThumb(thumbIndex);
    },
    [disabled]
  );

  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const clickValue = min + percent * (max - min);
      const distToLow = Math.abs(clickValue - lowValue);
      const distToHigh = Math.abs(clickValue - highValue);
      const closerThumb = distToLow <= distToHigh ? 0 : 1;
      updateValue(e.clientX, closerThumb);
    },
    [disabled, min, max, lowValue, highValue, updateValue]
  );

  useEffect(() => {
    if (activeThumb === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateValue(e.clientX, activeThumb);
    };

    const handleMouseUp = () => {
      setActiveThumb(null);
      onChangeEnd?.(value);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeThumb, value, updateValue, onChangeEnd]);

  const renderThumb = (thumbIndex: 0 | 1) => {
    const thumbValue = value[thumbIndex];
    const percent = getPercentage(thumbValue, min, max);
    const isActive = activeThumb === thumbIndex;
    const tooltipVisible = showTooltip === 'always' || (showTooltip && (isActive || showTooltipStates[thumbIndex]));

    return (
      <div
        key={thumbIndex}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={thumbValue}
        aria-disabled={disabled}
        onMouseDown={(e) => handleMouseDown(e, thumbIndex)}
        onMouseEnter={() => setShowTooltipStates((prev) => { const n = [...prev] as [boolean, boolean]; n[thumbIndex] = true; return n; })}
        onMouseLeave={() => setShowTooltipStates((prev) => { const n = [...prev] as [boolean, boolean]; n[thumbIndex] = false; return n; })}
        style={{
          position: 'absolute',
          left: `${percent}%`,
          transform: 'translateX(-50%)',
          width: styles.thumb,
          height: styles.thumb,
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          borderWidth: 'var(--ds-border-width-lg)',
          borderStyle: 'solid',
          borderColor: 'var(--ds-color-accent-base-default)',
          borderRadius: 'var(--ds-border-radius-full)',
          cursor: disabled ? 'not-allowed' : 'grab',
          boxShadow: isActive ? 'var(--ds-shadow-md)' : 'var(--ds-shadow-sm)',
          zIndex: isActive ? 2 : 1,
          outline: 'none',
        }}
      >
        {tooltipVisible && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: 'var(--ds-spacing-2)',
              padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
              backgroundColor: 'var(--ds-color-neutral-text-default)',
              color: 'var(--ds-color-neutral-background-default)',
              fontSize: 'var(--ds-font-size-xs)',
              fontWeight: 'var(--ds-font-weight-medium)',
              borderRadius: 'var(--ds-border-radius-sm)',
              whiteSpace: 'nowrap',
            }}
          >
            {formatValue(thumbValue)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={className} style={{ width: '100%', ...style }}>
      {label && (
        <div style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          <span style={{ fontSize: 'var(--ds-font-size-sm)', fontWeight: 'var(--ds-font-weight-medium)', color: 'var(--ds-color-neutral-text-default)' }}>
            {label}
          </span>
          <span style={{ marginLeft: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            {formatValue(lowValue)} – {formatValue(highValue)}
          </span>
        </div>
      )}

      <div
        ref={trackRef}
        onClick={handleTrackClick}
        style={{
          position: 'relative',
          height: styles.thumb,
          display: 'flex',
          alignItems: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: styles.track,
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderRadius: 'var(--ds-border-radius-full)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${lowPercent}%`,
            width: `${highPercent - lowPercent}%`,
            height: styles.track,
            backgroundColor: 'var(--ds-color-accent-base-default)',
            borderRadius: 'var(--ds-border-radius-full)',
          }}
        />

        {marks?.map((mark) => {
          const markPercent = getPercentage(mark.value, min, max);
          const isInRange = mark.value >= lowValue && mark.value <= highValue;
          return (
            <div
              key={mark.value}
              style={{
                position: 'absolute',
                left: `${markPercent}%`,
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 'var(--ds-sizing-1)',
                  height: 'var(--ds-sizing-2)',
                  backgroundColor: isInRange ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-border-default)',
                  borderRadius: 'var(--ds-border-radius-full)',
                }}
              />
              {mark.label && (
                <span style={{ marginTop: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)', whiteSpace: 'nowrap' }}>
                  {mark.label}
                </span>
              )}
            </div>
          );
        })}

        {renderThumb(0)}
        {renderThumb(1)}
      </div>
    </div>
  );
}

export default { Slider, RangeSlider };
