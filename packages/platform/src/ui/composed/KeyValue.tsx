/**
 * KeyValue Display Components
 *
 * Structured key-value data display.
 * SSR-safe with 'use client' directive.
 *
 * @module @xalatechnologies/platform/ui/composed/KeyValue
 */

'use client';

import React, { type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface KeyValuePair {
  key: string;
  value: ReactNode;
  copyable?: boolean;
  href?: string;
  mono?: boolean;
}

export interface KeyValueProps {
  label: string;
  value: ReactNode;
  direction?: 'horizontal' | 'vertical';
  copyable?: boolean;
  mono?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface KeyValueListProps {
  items: KeyValuePair[];
  columns?: 1 | 2 | 3 | 4;
  direction?: 'horizontal' | 'vertical';
  variant?: 'default' | 'striped' | 'bordered';
  className?: string;
  style?: React.CSSProperties;
}

export interface DefinitionListProps {
  items: { term: string; definition: ReactNode }[];
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// =============================================================================
// KeyValue Component
// =============================================================================

export function KeyValue({
  label,
  value,
  direction = 'vertical',
  copyable = false,
  mono = false,
  className,
  style,
}: KeyValueProps): React.ReactElement {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (typeof value === 'string') {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isHorizontal = direction === 'horizontal';

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        gap: isHorizontal ? 'var(--ds-spacing-3)' : 'var(--ds-spacing-1)',
        alignItems: isHorizontal ? 'center' : 'flex-start',
        ...style,
      }}
    >
      <dt
        style={{
          fontSize: 'var(--ds-font-size-sm)',
          fontWeight: 'var(--ds-font-weight-medium)',
          color: 'var(--ds-color-neutral-text-subtle)',
          minWidth: isHorizontal ? 'var(--ds-sizing-30)' : undefined,
          flexShrink: 0,
        }}
      >
        {label}
      </dt>
      <dd
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-2)',
          margin: 0,
          fontSize: 'var(--ds-font-size-sm)',
          fontFamily: mono ? 'var(--ds-font-family-mono)' : 'inherit',
          color: 'var(--ds-color-neutral-text-default)',
          wordBreak: 'break-word',
        }}
      >
        {value}
        {copyable && typeof value === 'string' && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy to clipboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--ds-spacing-1)',
              backgroundColor: 'transparent',
              borderWidth: '0',
              borderRadius: 'var(--ds-border-radius-sm)',
              cursor: 'pointer',
              color: copied ? 'var(--ds-color-success-text-default)' : 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        )}
      </dd>
    </div>
  );
}

// =============================================================================
// KeyValueList Component
// =============================================================================

export function KeyValueList({
  items,
  columns = 1,
  direction = 'vertical',
  variant = 'default',
  className,
  style,
}: KeyValueListProps): React.ReactElement {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'striped':
        return {};
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
    <dl
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: variant === 'bordered' ? 0 : 'var(--ds-spacing-4)',
        margin: 0,
        ...getVariantStyles(),
        ...style,
      }}
    >
      {items.map((item, index) => {
        const isStriped = variant === 'striped' && index % 2 === 1;
        const isBordered = variant === 'bordered';

        return (
          <div
            key={item.key}
            style={{
              padding: isBordered ? 'var(--ds-spacing-3) var(--ds-spacing-4)' : undefined,
              backgroundColor: isStriped ? 'var(--ds-color-neutral-surface-subtle)' : undefined,
              borderBottomWidth: isBordered && index < items.length - 1 ? 'var(--ds-border-width-default)' : 0,
              borderBottomStyle: 'solid',
              borderBottomColor: 'var(--ds-color-neutral-border-subtle)',
            }}
          >
            <KeyValue
              label={item.key}
              value={
                item.href ? (
                  <a
                    href={item.href}
                    style={{
                      color: 'var(--ds-color-accent-text-default)',
                      textDecoration: 'none',
                    }}
                  >
                    {item.value}
                  </a>
                ) : (
                  item.value
                )
              }
              direction={direction}
              copyable={item.copyable}
              mono={item.mono}
            />
          </div>
        );
      })}
    </dl>
  );
}

// =============================================================================
// DefinitionList Component
// =============================================================================

export function DefinitionList({ items, className, style }: DefinitionListProps): React.ReactElement {
  return (
    <dl
      className={className}
      style={{
        margin: 0,
        ...style,
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            paddingTop: index === 0 ? 0 : 'var(--ds-spacing-3)',
            paddingBottom: 'var(--ds-spacing-3)',
            borderBottomWidth: index < items.length - 1 ? 'var(--ds-border-width-default)' : 0,
            borderBottomStyle: 'solid',
            borderBottomColor: 'var(--ds-color-neutral-border-subtle)',
          }}
        >
          <dt
            style={{
              flex: '0 0 30%',
              fontSize: 'var(--ds-font-size-sm)',
              fontWeight: 'var(--ds-font-weight-medium)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {item.term}
          </dt>
          <dd
            style={{
              flex: '1',
              margin: 0,
              fontSize: 'var(--ds-font-size-sm)',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            {item.definition}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default { KeyValue, KeyValueList, DefinitionList };
