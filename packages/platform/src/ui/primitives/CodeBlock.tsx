/**
 * CodeBlock Component
 * 
 * Displays formatted code with syntax highlighting support
 */

import React from 'react';

export interface CodeBlockProps {
  /** Code content to display */
  code: string;
  /** Programming language for syntax highlighting */
  language?: string;
  /** Maximum height before scrolling */
  maxHeight?: string;
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Custom class name */
  className?: string;
}

export function CodeBlock({
  code,
  language = 'text',
  maxHeight = '400px',
  showLineNumbers: _showLineNumbers = false,
  className = '',
}: CodeBlockProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        backgroundColor: 'var(--ds-color-neutral-background-subtle)',
        borderRadius: 'var(--ds-border-radius-medium)',
        border: '1px solid var(--ds-color-neutral-border-default)',
        overflow: 'hidden',
      }}
    >
      {language && (
        <div
          style={{
            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            borderBottom: '1px solid var(--ds-color-neutral-border-default)',
            fontSize: 'var(--ds-font-size-small)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-neutral-text-subtle)',
            textTransform: 'uppercase',
          }}
        >
          {language}
        </div>
      )}
      <pre
        style={{
          margin: 0,
          padding: 'var(--ds-spacing-4)',
          maxHeight,
          overflow: 'auto',
          fontSize: 'var(--ds-font-size-small)',
          lineHeight: 'var(--ds-font-line-height-body)',
          fontFamily: 'var(--ds-font-family-monospace, ui-monospace, monospace)',
        }}
      >
        <code
          style={{
            color: 'var(--ds-color-neutral-text-default)',
            whiteSpace: 'pre',
          }}
        >
          {code}
        </code>
      </pre>
    </div>
  );
}
