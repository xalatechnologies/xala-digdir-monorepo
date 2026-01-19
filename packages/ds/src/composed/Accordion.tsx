/**
 * Accordion & Collapsible Components
 *
 * Expandable content sections.
 * SSR-safe with 'use client' directive.
 *
 * @module @xala/ds/composed/Accordion
 */

'use client';

import React, { useState, useCallback, createContext, useContext, type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultExpanded?: string[];
  variant?: 'default' | 'bordered' | 'separated';
  className?: string;
  style?: React.CSSProperties;
}

export interface CollapsibleProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function ChevronDownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// =============================================================================
// Accordion Context
// =============================================================================

interface AccordionContextValue {
  expandedIds: Set<string>;
  toggle: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

// =============================================================================
// AccordionPanel Component
// =============================================================================

interface AccordionPanelProps {
  item: AccordionItem;
  isLast: boolean;
  variant: 'default' | 'bordered' | 'separated';
}

function AccordionPanel({ item, isLast, variant }: AccordionPanelProps): React.ReactElement {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionPanel must be used within Accordion');

  const isExpanded = context.expandedIds.has(item.id);

  const handleToggle = () => {
    if (!item.disabled) {
      context.toggle(item.id);
    }
  };

  const getBorderStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'bordered':
        return {
          borderWidth: 'var(--ds-border-width-default)',
          borderStyle: 'solid',
          borderColor: 'var(--ds-color-neutral-border-subtle)',
          borderBottomWidth: isLast ? 'var(--ds-border-width-default)' : 0,
        };
      case 'separated':
        return {
          borderWidth: 'var(--ds-border-width-default)',
          borderStyle: 'solid',
          borderColor: 'var(--ds-color-neutral-border-subtle)',
          borderRadius: 'var(--ds-border-radius-lg)',
          marginBottom: isLast ? 0 : 'var(--ds-spacing-2)',
        };
      default:
        return {
          borderBottomWidth: 'var(--ds-border-width-default)',
          borderBottomStyle: 'solid',
          borderBottomColor: 'var(--ds-color-neutral-border-subtle)',
        };
    }
  };

  return (
    <div style={{ ...getBorderStyles(), backgroundColor: 'var(--ds-color-neutral-background-default)' }}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={item.disabled}
        aria-expanded={isExpanded}
        aria-controls={`accordion-content-${item.id}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'transparent',
          borderWidth: '0',
          cursor: item.disabled ? 'not-allowed' : 'pointer',
          opacity: item.disabled ? 0.5 : 1,
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
          {item.icon && <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>{item.icon}</span>}
          <span
            style={{
              fontSize: 'var(--ds-font-size-md)',
              fontWeight: 'var(--ds-font-weight-medium)',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            {item.title}
          </span>
        </div>
        <span
          style={{
            color: 'var(--ds-color-neutral-text-subtle)',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s ease',
          }}
        >
          <ChevronDownIcon />
        </span>
      </button>
      <div
        id={`accordion-content-${item.id}`}
        role="region"
        aria-labelledby={`accordion-header-${item.id}`}
        style={{
          maxHeight: isExpanded ? '1000px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <div
          style={{
            padding: '0 var(--ds-spacing-4) var(--ds-spacing-4) var(--ds-spacing-4)',
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-default)',
            lineHeight: 1.6,
          }}
        >
          {item.content}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Accordion Component
// =============================================================================

export function Accordion({
  items,
  allowMultiple = false,
  defaultExpanded = [],
  variant = 'default',
  className,
  style,
}: AccordionProps): React.ReactElement {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(defaultExpanded));

  const toggle = useCallback(
    (id: string) => {
      setExpandedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          if (!allowMultiple) {
            newSet.clear();
          }
          newSet.add(id);
        }
        return newSet;
      });
    },
    [allowMultiple]
  );

  const getContainerStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'bordered':
        return {
          borderWidth: 'var(--ds-border-width-default)',
          borderStyle: 'solid',
          borderColor: 'var(--ds-color-neutral-border-subtle)',
          borderRadius: 'var(--ds-border-radius-lg)',
          overflow: 'hidden',
        };
      default:
        return {};
    }
  };

  return (
    <AccordionContext.Provider value={{ expandedIds, toggle }}>
      <div className={className} style={{ ...getContainerStyles(), ...style }}>
        {items.map((item, index) => (
          <AccordionPanel key={item.id} item={item} isLast={index === items.length - 1} variant={variant} />
        ))}
      </div>
    </AccordionContext.Provider>
  );
}

// =============================================================================
// Collapsible Component
// =============================================================================

export function Collapsible({
  title,
  children,
  defaultOpen = false,
  disabled = false,
  icon,
  className,
  style,
}: CollapsibleProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      className={className}
      style={{
        borderWidth: 'var(--ds-border-width-default)',
        borderStyle: 'solid',
        borderColor: 'var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-lg)',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        ...style,
      }}
    >
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-expanded={isOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'transparent',
          borderWidth: '0',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
          {icon && <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>{icon}</span>}
          <span
            style={{
              fontSize: 'var(--ds-font-size-md)',
              fontWeight: 'var(--ds-font-weight-medium)',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            {title}
          </span>
        </div>
        <span
          style={{
            color: 'var(--ds-color-neutral-text-subtle)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s ease',
          }}
        >
          <ChevronDownIcon />
        </span>
      </button>
      {isOpen && (
        <div
          style={{
            padding: '0 var(--ds-spacing-4) var(--ds-spacing-4) var(--ds-spacing-4)',
            borderTopWidth: 'var(--ds-border-width-default)',
            borderTopStyle: 'solid',
            borderTopColor: 'var(--ds-color-neutral-border-subtle)',
          }}
        >
          <div style={{ paddingTop: 'var(--ds-spacing-4)' }}>{children}</div>
        </div>
      )}
    </div>
  );
}

export default { Accordion, Collapsible };
