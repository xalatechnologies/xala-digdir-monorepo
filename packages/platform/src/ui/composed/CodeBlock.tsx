/**
 * CodeBlock & CopyButton Components
 *
 * Code display with syntax highlighting and copy functionality.
 * SSR-safe with 'use client' directive.
 *
 * @module @xalatechnologies/platform/ui/composed/CodeBlock
 */

'use client';

import React, { useState, useCallback } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface CopyButtonProps {
  text: string;
  onCopy?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost';
  className?: string;
  style?: React.CSSProperties;
}

export interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  title?: string;
  maxHeight?: string;
  wrapLines?: boolean;
  highlightLines?: number[];
  className?: string;
  style?: React.CSSProperties;
}

export interface InlineCodeProps {
  children: string;
  copyable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
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

// =============================================================================
// CopyButton Component
// =============================================================================

export function CopyButton({
  text,
  onCopy,
  size = 'md',
  variant = 'default',
  className,
  style,
}: CopyButtonProps): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [text, onCopy]);

  const sizes = {
    sm: { padding: 'var(--ds-spacing-1)', icon: '14px' },
    md: { padding: 'var(--ds-spacing-2)', icon: '16px' },
    lg: { padding: 'var(--ds-spacing-3)', icon: '20px' },
  };

  const sizeStyle = sizes[size];

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={className}
      aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: sizeStyle.padding,
        backgroundColor: variant === 'ghost' ? 'transparent' : 'var(--ds-color-neutral-surface-subtle)',
        borderWidth: variant === 'ghost' ? '0' : 'var(--ds-border-width-default)',
        borderStyle: 'solid',
        borderColor: 'var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-md)',
        color: copied ? 'var(--ds-color-success-text-default)' : 'var(--ds-color-neutral-text-subtle)',
        cursor: 'pointer',
        transition: 'color 0.15s ease, background-color 0.15s ease',
        ...style,
      }}
    >
      <span style={{ width: sizeStyle.icon, height: sizeStyle.icon }}>
        {copied ? <CheckIcon /> : <CopyIcon />}
      </span>
    </button>
  );
}

// =============================================================================
// CodeBlock Component
// =============================================================================

export function CodeBlock({
  code,
  language,
  showLineNumbers = false,
  showCopyButton = true,
  title,
  maxHeight,
  wrapLines = false,
  highlightLines = [],
  className,
  style,
}: CodeBlockProps): React.ReactElement {
  const lines = code.split('\n');

  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderWidth: 'var(--ds-border-width-default)',
        borderStyle: 'solid',
        borderColor: 'var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-lg)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {(title || language || showCopyButton) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderBottomWidth: 'var(--ds-border-width-default)',
            borderBottomStyle: 'solid',
            borderBottomColor: 'var(--ds-color-neutral-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            {title && (
              <span
                style={{
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  color: 'var(--ds-color-neutral-text-default)',
                }}
              >
                {title}
              </span>
            )}
            {language && !title && (
              <span
                style={{
                  fontSize: 'var(--ds-font-size-xs)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                  textTransform: 'uppercase',
                }}
              >
                {language}
              </span>
            )}
          </div>
          {showCopyButton && <CopyButton text={code} size="sm" variant="ghost" />}
        </div>
      )}

      <div
        style={{
          maxHeight,
          overflowX: wrapLines ? 'hidden' : 'auto',
          overflowY: maxHeight ? 'auto' : 'visible',
        }}
      >
        <pre
          style={{
            margin: 0,
            padding: 'var(--ds-spacing-4)',
            fontSize: 'var(--ds-font-size-sm)',
            fontFamily: 'var(--ds-font-family-mono)',
            lineHeight: 1.6,
            color: 'var(--ds-color-neutral-text-default)',
            whiteSpace: wrapLines ? 'pre-wrap' : 'pre',
            wordBreak: wrapLines ? 'break-word' : 'normal',
          }}
        >
          {showLineNumbers ? (
            <code style={{ display: 'table', width: '100%' }}>
              {lines.map((line, index) => {
                const lineNumber = index + 1;
                const isHighlighted = highlightLines.includes(lineNumber);

                return (
                  <div
                    key={index}
                    style={{
                      display: 'table-row',
                      backgroundColor: isHighlighted ? 'var(--ds-color-warning-surface-subtle)' : 'transparent',
                    }}
                  >
                    <span
                      style={{
                        display: 'table-cell',
                        width: 'var(--ds-sizing-10)',
                        paddingRight: 'var(--ds-spacing-4)',
                        textAlign: 'right',
                        color: 'var(--ds-color-neutral-text-subtle)',
                        userSelect: 'none',
                        borderRightWidth: 'var(--ds-border-width-default)',
                        borderRightStyle: 'solid',
                        borderRightColor: 'var(--ds-color-neutral-border-subtle)',
                      }}
                    >
                      {lineNumber}
                    </span>
                    <span style={{ display: 'table-cell', paddingLeft: 'var(--ds-spacing-4)' }}>
                      {line || ' '}
                    </span>
                  </div>
                );
              })}
            </code>
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    </div>
  );
}

// =============================================================================
// InlineCode Component
// =============================================================================

export function InlineCode({
  children,
  copyable = false,
  className,
  style,
}: InlineCodeProps): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [children]);

  return (
    <code
      className={className}
      onClick={copyable ? handleCopy : undefined}
      style={{
        padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
        fontSize: '0.875em',
        fontFamily: 'var(--ds-font-family-mono)',
        backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
        color: copied ? 'var(--ds-color-success-text-default)' : 'var(--ds-color-accent-text-default)',
        borderRadius: 'var(--ds-border-radius-sm)',
        cursor: copyable ? 'pointer' : 'default',
        transition: 'color 0.15s ease',
        ...style,
      }}
    >
      {children}
    </code>
  );
}

export default { CopyButton, CodeBlock, InlineCode };
