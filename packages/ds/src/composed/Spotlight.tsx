/**
 * Spotlight & HighlightText Components
 *
 * Text highlighting and spotlight effects for search results.
 * SSR-safe with 'use client' directive.
 *
 * @module @xala/ds/composed/Spotlight
 */

'use client';

import React, { useMemo, type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface HighlightTextProps {
  text: string;
  highlight: string | string[];
  highlightStyle?: React.CSSProperties;
  caseSensitive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface SpotlightProps {
  children: ReactNode;
  active?: boolean;
  padding?: number;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface SearchHighlightProps {
  text: string;
  query: string;
  maxLength?: number;
  contextLength?: number;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// HighlightText Component
// =============================================================================

export function HighlightText({
  text,
  highlight,
  highlightStyle,
  caseSensitive = false,
  className,
  style,
}: HighlightTextProps): React.ReactElement {
  const parts = useMemo(() => {
    if (!highlight || (Array.isArray(highlight) && highlight.length === 0)) {
      return [{ text, isHighlight: false }];
    }

    const highlights = Array.isArray(highlight) ? highlight : [highlight];
    const pattern = highlights
      .filter((h) => h.length > 0)
      .map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');

    if (!pattern) {
      return [{ text, isHighlight: false }];
    }

    const regex = new RegExp(`(${pattern})`, caseSensitive ? 'g' : 'gi');
    const result: Array<{ text: string; isHighlight: boolean }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        result.push({ text: text.slice(lastIndex, match.index), isHighlight: false });
      }
      result.push({ text: match[0], isHighlight: true });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      result.push({ text: text.slice(lastIndex), isHighlight: false });
    }

    return result.length > 0 ? result : [{ text, isHighlight: false }];
  }, [text, highlight, caseSensitive]);

  const defaultHighlightStyle: React.CSSProperties = {
    backgroundColor: 'var(--ds-color-warning-surface-subtle)',
    color: 'var(--ds-color-warning-text-default)',
    padding: '0 var(--ds-spacing-1)',
    borderRadius: 'var(--ds-border-radius-sm)',
    fontWeight: 'var(--ds-font-weight-medium)',
  };

  return (
    <span className={className} style={style}>
      {parts.map((part, index) =>
        part.isHighlight ? (
          <mark key={index} style={{ ...defaultHighlightStyle, ...highlightStyle }}>
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </span>
  );
}

// =============================================================================
// Spotlight Component
// =============================================================================

export function Spotlight({
  children,
  active = true,
  padding = 8,
  borderRadius = 'var(--ds-border-radius-md)',
  className,
  style,
}: SpotlightProps): React.ReactElement {
  if (!active) {
    return <>{children}</>;
  }

  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      <div
        style={{
          position: 'absolute',
          inset: -padding,
          backgroundColor: 'var(--ds-color-accent-surface-subtle)',
          borderRadius,
          boxShadow: '0 0 0 4px var(--ds-color-accent-border-default)',
          animation: 'spotlight-pulse 2s ease-in-out infinite',
          zIndex: -1,
        }}
      />
      {children}
      <style>{`
        @keyframes spotlight-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 4px var(--ds-color-accent-border-default); }
          50% { opacity: 0.7; box-shadow: 0 0 0 8px var(--ds-color-accent-border-subtle); }
        }
      `}</style>
    </div>
  );
}

// =============================================================================
// SearchHighlight Component
// =============================================================================

export function SearchHighlight({
  text,
  query,
  maxLength = 200,
  contextLength = 50,
  className,
  style,
}: SearchHighlightProps): React.ReactElement {
  const result = useMemo(() => {
    if (!query) {
      return { display: text.slice(0, maxLength), truncated: text.length > maxLength };
    }

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const matchIndex = lowerText.indexOf(lowerQuery);

    if (matchIndex === -1) {
      return { display: text.slice(0, maxLength), truncated: text.length > maxLength };
    }

    let start = Math.max(0, matchIndex - contextLength);
    let end = Math.min(text.length, matchIndex + query.length + contextLength);

    if (end - start > maxLength) {
      end = start + maxLength;
    }

    let display = text.slice(start, end);
    const prefix = start > 0 ? '...' : '';
    const suffix = end < text.length ? '...' : '';

    return {
      display: prefix + display + suffix,
      truncated: start > 0 || end < text.length,
    };
  }, [text, query, maxLength, contextLength]);

  return (
    <span className={className} style={style}>
      <HighlightText text={result.display} highlight={query} />
    </span>
  );
}

// =============================================================================
// TextTruncate Component
// =============================================================================

export interface TextTruncateProps {
  text: string;
  maxLength?: number;
  expandable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function TextTruncate({
  text,
  maxLength = 100,
  expandable = true,
  className,
  style,
}: TextTruncateProps): React.ReactElement {
  const [expanded, setExpanded] = React.useState(false);
  const isTruncated = text.length > maxLength;

  if (!isTruncated || expanded) {
    return (
      <span className={className} style={style}>
        {text}
        {expanded && expandable && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            style={{
              marginLeft: 'var(--ds-spacing-1)',
              padding: 0,
              fontSize: 'inherit',
              fontWeight: 'var(--ds-font-weight-medium)',
              color: 'var(--ds-color-accent-text-default)',
              backgroundColor: 'transparent',
              borderWidth: '0',
              cursor: 'pointer',
            }}
          >
            Show less
          </button>
        )}
      </span>
    );
  }

  return (
    <span className={className} style={style}>
      {text.slice(0, maxLength)}...
      {expandable && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          style={{
            marginLeft: 'var(--ds-spacing-1)',
            padding: 0,
            fontSize: 'inherit',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-accent-text-default)',
            backgroundColor: 'transparent',
            borderWidth: '0',
            cursor: 'pointer',
          }}
        >
          Show more
        </button>
      )}
    </span>
  );
}

export default { HighlightText, Spotlight, SearchHighlight, TextTruncate };
