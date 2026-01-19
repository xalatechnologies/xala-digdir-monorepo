/**
 * Popover Component
 *
 * Rich content popover with smart positioning.
 * SSR-safe with 'use client' directive.
 *
 * @module @xala/ds/composed/Popover
 */

'use client';

import React, { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
export type PopoverTrigger = 'click' | 'hover' | 'focus';

export interface PopoverProps {
  content: ReactNode;
  children: ReactNode;
  position?: PopoverPosition;
  trigger?: PopoverTrigger;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  offset?: number;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Position Styles
// =============================================================================

const getPositionStyles = (position: PopoverPosition, offset: number): React.CSSProperties => {
  const base: React.CSSProperties = { position: 'absolute', zIndex: 9999 };
  const offsetPx = `${offset}px`;

  switch (position) {
    case 'top':
      return { ...base, bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: offsetPx };
    case 'top-start':
      return { ...base, bottom: '100%', left: 0, marginBottom: offsetPx };
    case 'top-end':
      return { ...base, bottom: '100%', right: 0, marginBottom: offsetPx };
    case 'bottom':
      return { ...base, top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: offsetPx };
    case 'bottom-start':
      return { ...base, top: '100%', left: 0, marginTop: offsetPx };
    case 'bottom-end':
      return { ...base, top: '100%', right: 0, marginTop: offsetPx };
    case 'left':
      return { ...base, right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: offsetPx };
    case 'right':
      return { ...base, left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: offsetPx };
    default:
      return { ...base, top: '100%', left: 0, marginTop: offsetPx };
  }
};

// =============================================================================
// Popover Component
// =============================================================================

export function Popover({
  content,
  children,
  position = 'bottom-start',
  trigger = 'click',
  open: controlledOpen,
  onOpenChange,
  closeOnClickOutside = true,
  closeOnEscape = true,
  offset = 8,
  className,
  style,
}: PopoverProps): React.ReactElement {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setInternalOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  const handleClick = useCallback(() => {
    if (trigger === 'click') {
      setOpen(!isOpen);
    }
  }, [trigger, isOpen, setOpen]);

  const handleMouseEnter = useCallback(() => {
    if (trigger === 'hover') {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      setOpen(true);
    }
  }, [trigger, setOpen]);

  const handleMouseLeave = useCallback(() => {
    if (trigger === 'hover') {
      hoverTimeoutRef.current = setTimeout(() => setOpen(false), 150);
    }
  }, [trigger, setOpen]);

  const handleFocus = useCallback(() => {
    if (trigger === 'focus') {
      setOpen(true);
    }
  }, [trigger, setOpen]);

  const handleBlur = useCallback(() => {
    if (trigger === 'focus') {
      setOpen(false);
    }
  }, [trigger, setOpen]);

  useEffect(() => {
    if (!closeOnClickOutside || !isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeOnClickOutside, isOpen, setOpen]);

  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, isOpen, setOpen]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={{
        position: 'relative',
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
      {isOpen && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            ...getPositionStyles(position, offset),
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            borderWidth: 'var(--ds-border-width-default)',
            borderStyle: 'solid',
            borderColor: 'var(--ds-color-neutral-border-subtle)',
            borderRadius: 'var(--ds-border-radius-lg)',
            boxShadow: 'var(--ds-shadow-lg)',
            minWidth: 'var(--ds-sizing-40)',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// PopoverHeader Component
// =============================================================================

export interface PopoverHeaderProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function PopoverHeader({ children, className, style }: PopoverHeaderProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
        borderBottomWidth: 'var(--ds-border-width-default)',
        borderBottomStyle: 'solid',
        borderBottomColor: 'var(--ds-color-neutral-border-subtle)',
        fontSize: 'var(--ds-font-size-sm)',
        fontWeight: 'var(--ds-font-weight-semibold)',
        color: 'var(--ds-color-neutral-text-default)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// =============================================================================
// PopoverBody Component
// =============================================================================

export interface PopoverBodyProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function PopoverBody({ children, className, style }: PopoverBodyProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        padding: 'var(--ds-spacing-4)',
        fontSize: 'var(--ds-font-size-sm)',
        color: 'var(--ds-color-neutral-text-default)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// =============================================================================
// PopoverFooter Component
// =============================================================================

export interface PopoverFooterProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function PopoverFooter({ children, className, style }: PopoverFooterProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 'var(--ds-spacing-2)',
        padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
        borderTopWidth: 'var(--ds-border-width-default)',
        borderTopStyle: 'solid',
        borderTopColor: 'var(--ds-color-neutral-border-subtle)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default { Popover, PopoverHeader, PopoverBody, PopoverFooter };
