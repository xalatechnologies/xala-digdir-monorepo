/**
 * Tooltip Component
 *
 * Accessible tooltips with smart positioning.
 * SSR-safe with 'use client' directive.
 *
 * @module @xalatechnologies/platform/ui/composed/Tooltip
 */

'use client';

import React, { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Position Styles
// =============================================================================

const getPositionStyles = (position: TooltipPosition): React.CSSProperties => {
  const base: React.CSSProperties = {
    position: 'absolute',
    zIndex: 9999,
  };

  switch (position) {
    case 'top':
      return { ...base, bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 'var(--ds-spacing-2)' };
    case 'bottom':
      return { ...base, top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 'var(--ds-spacing-2)' };
    case 'left':
      return { ...base, right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 'var(--ds-spacing-2)' };
    case 'right':
      return { ...base, left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 'var(--ds-spacing-2)' };
  }
};

const getArrowStyles = (position: TooltipPosition): React.CSSProperties => {
  const base: React.CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
  };

  const arrowSize = '6px';
  const color = 'var(--ds-color-neutral-text-default)';

  switch (position) {
    case 'top':
      return {
        ...base,
        bottom: `-${arrowSize}`,
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: `${arrowSize} ${arrowSize} 0 ${arrowSize}`,
        borderColor: `${color} transparent transparent transparent`,
      };
    case 'bottom':
      return {
        ...base,
        top: `-${arrowSize}`,
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: `0 ${arrowSize} ${arrowSize} ${arrowSize}`,
        borderColor: `transparent transparent ${color} transparent`,
      };
    case 'left':
      return {
        ...base,
        right: `-${arrowSize}`,
        top: '50%',
        transform: 'translateY(-50%)',
        borderWidth: `${arrowSize} 0 ${arrowSize} ${arrowSize}`,
        borderColor: `transparent transparent transparent ${color}`,
      };
    case 'right':
      return {
        ...base,
        left: `-${arrowSize}`,
        top: '50%',
        transform: 'translateY(-50%)',
        borderWidth: `${arrowSize} ${arrowSize} ${arrowSize} 0`,
        borderColor: `transparent ${color} transparent transparent`,
      };
  }
};

// =============================================================================
// Tooltip Component
// =============================================================================

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
  disabled = false,
  className,
  style,
}: TooltipProps): React.ReactElement {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = useCallback(() => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  }, [disabled, delay]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  }, []);

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newPosition = position;

      if (position === 'top' && triggerRect.top - tooltipRect.height < 0) {
        newPosition = 'bottom';
      } else if (position === 'bottom' && triggerRect.bottom + tooltipRect.height > viewportHeight) {
        newPosition = 'top';
      } else if (position === 'left' && triggerRect.left - tooltipRect.width < 0) {
        newPosition = 'right';
      } else if (position === 'right' && triggerRect.right + tooltipRect.width > viewportWidth) {
        newPosition = 'left';
      }

      if (newPosition !== actualPosition) {
        setActualPosition(newPosition);
      }
    }
  }, [isVisible, position, actualPosition]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={triggerRef}
      className={className}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      style={{
        position: 'relative',
        display: 'inline-flex',
        ...style,
      }}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          style={{
            ...getPositionStyles(actualPosition),
            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-neutral-text-default)',
            color: 'var(--ds-color-neutral-background-default)',
            fontSize: 'var(--ds-font-size-sm)',
            fontWeight: 'var(--ds-font-weight-normal)',
            borderRadius: 'var(--ds-border-radius-md)',
            boxShadow: 'var(--ds-shadow-lg)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {content}
          <div style={getArrowStyles(actualPosition)} />
        </div>
      )}
    </div>
  );
}

export default Tooltip;
