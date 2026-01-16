/**
 * CodeBlock Component
 *
 * A styled code block component for documentation pages with
 * language indicator, line numbers, and copy functionality.
 *
 * Uses design tokens from @xala/ds for consistent styling.
 */

import React, { forwardRef, useState, useCallback } from 'react';

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The code content to display
   */
  code: string;

  /**
   * Programming language for syntax highlighting hints
   */
  language?: string;

  /**
   * Optional title/filename to display above the code
   */
  title?: string;

  /**
   * Whether to show line numbers
   * @default false
   */
  showLineNumbers?: boolean;

  /**
   * Starting line number
   * @default 1
   */
  startLineNumber?: number;

  /**
   * Whether to show the copy button
   * @default true
   */
  showCopyButton?: boolean;

  /**
   * Lines to highlight (1-indexed)
   */
  highlightLines?: number[];

  /**
   * Maximum height before scrolling
   */
  maxHeight?: string;
}

/**
 * Copy icon SVG
 */
const CopyIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: '16px', height: '16px' }}
    aria-hidden="true"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

/**
 * Check icon SVG for copy success
 */
const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: '16px', height: '16px' }}
    aria-hidden="true"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

/**
 * Get language display name
 */
const getLanguageLabel = (language?: string): string => {
  if (!language) return '';

  const languageMap: Record<string, string> = {
    js: 'JavaScript',
    javascript: 'JavaScript',
    ts: 'TypeScript',
    typescript: 'TypeScript',
    jsx: 'JSX',
    tsx: 'TSX',
    css: 'CSS',
    scss: 'SCSS',
    html: 'HTML',
    json: 'JSON',
    yaml: 'YAML',
    yml: 'YAML',
    md: 'Markdown',
    markdown: 'Markdown',
    bash: 'Bash',
    sh: 'Shell',
    shell: 'Shell',
    python: 'Python',
    py: 'Python',
    rust: 'Rust',
    go: 'Go',
    java: 'Java',
    sql: 'SQL',
    graphql: 'GraphQL',
    xml: 'XML',
    diff: 'Diff',
  };

  return languageMap[language.toLowerCase()] || language.toUpperCase();
};

/**
 * Basic syntax highlighting using regex patterns
 * This provides basic highlighting without external dependencies
 */
const highlightCode = (code: string, language?: string): React.ReactNode => {
  if (!language) {
    return code;
  }

  // Basic token patterns for common languages
  const patterns: { pattern: RegExp; className: string }[] = [];

  // Comments (single-line)
  patterns.push({
    pattern: /(\/\/[^\n]*|#[^\n]*)/g,
    className: 'code-comment',
  });

  // Strings (double and single quoted)
  patterns.push({
    pattern: /("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`\\]*(?:\\.[^`\\]*)*`)/g,
    className: 'code-string',
  });

  // Keywords
  const keywords = [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
    'class', 'extends', 'import', 'export', 'from', 'default', 'async', 'await',
    'try', 'catch', 'throw', 'new', 'this', 'super', 'static', 'public', 'private',
    'protected', 'interface', 'type', 'enum', 'implements', 'readonly', 'as',
    'true', 'false', 'null', 'undefined', 'typeof', 'instanceof', 'in', 'of',
  ];
  patterns.push({
    pattern: new RegExp(`\\b(${keywords.join('|')})\\b`, 'g'),
    className: 'code-keyword',
  });

  // Numbers
  patterns.push({
    pattern: /\b(\d+\.?\d*)\b/g,
    className: 'code-number',
  });

  // For simplicity, we'll return the code with inline spans
  // This is a basic implementation - production would use a proper highlighter
  let highlighted = code;
  const replacements: { start: number; end: number; replacement: string }[] = [];

  // Apply patterns and collect replacements (avoiding overlaps)
  patterns.forEach(({ pattern, className }) => {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(code)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      // Check for overlaps with existing replacements
      const hasOverlap = replacements.some(
        (r) => (start >= r.start && start < r.end) || (end > r.start && end <= r.end)
      );

      if (!hasOverlap) {
        replacements.push({
          start,
          end,
          replacement: `<span class="${className}">${match[0]}</span>`,
        });
      }
    }
  });

  // Sort by position and apply replacements from end to start
  replacements.sort((a, b) => b.start - a.start);
  replacements.forEach(({ start, end, replacement }) => {
    highlighted = highlighted.slice(0, start) + replacement + highlighted.slice(end);
  });

  return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
};

export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(
  (
    {
      code,
      language,
      title,
      showLineNumbers = false,
      startLineNumber = 1,
      showCopyButton = true,
      highlightLines = [],
      maxHeight,
      style,
      ...props
    },
    ref
  ) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }, [code]);

    const lines = code.split('\n');
    const languageLabel = getLanguageLabel(language);

    const containerStyle: React.CSSProperties = {
      position: 'relative',
      marginBlock: 'var(--ds-spacing-4)',
      borderRadius: 'var(--ds-border-radius-md)',
      backgroundColor: 'var(--ds-color-neutral-background-subtle)',
      border: '1px solid var(--ds-color-neutral-border-subtle)',
      overflow: 'hidden',
      ...style,
    };

    const headerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
      backgroundColor: 'var(--ds-color-neutral-surface-default)',
      borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
      fontSize: 'var(--ds-font-size-xs)',
    };

    const titleStyle: React.CSSProperties = {
      fontWeight: 'var(--ds-font-weight-medium)',
      color: 'var(--ds-color-neutral-text-default)',
    };

    const languageBadgeStyle: React.CSSProperties = {
      padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
      backgroundColor: 'var(--ds-color-neutral-background-subtle)',
      borderRadius: 'var(--ds-border-radius-sm)',
      fontSize: 'var(--ds-font-size-xs)',
      color: 'var(--ds-color-neutral-text-subtle)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    };

    const copyButtonStyle: React.CSSProperties = {
      position: title || languageLabel ? 'relative' : 'absolute',
      top: title || languageLabel ? 'auto' : 'var(--ds-spacing-2)',
      right: title || languageLabel ? 'auto' : 'var(--ds-spacing-2)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--ds-spacing-1)',
      padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
      backgroundColor: copied
        ? 'var(--ds-color-success-surface-default)'
        : 'var(--ds-color-neutral-surface-default)',
      color: copied
        ? 'var(--ds-color-success-text-default)'
        : 'var(--ds-color-neutral-text-subtle)',
      border: '1px solid var(--ds-color-neutral-border-subtle)',
      borderRadius: 'var(--ds-border-radius-sm)',
      cursor: 'pointer',
      fontSize: 'var(--ds-font-size-xs)',
      transition: 'all 0.2s',
    };

    const preStyle: React.CSSProperties = {
      margin: 0,
      padding: 'var(--ds-spacing-4)',
      overflow: 'auto',
      fontFamily: 'var(--ds-font-family-mono)',
      fontSize: 'var(--ds-font-size-sm)',
      lineHeight: 1.6,
      ...(maxHeight ? { maxHeight } : {}),
    };

    const lineStyle = (lineNumber: number): React.CSSProperties => {
      const isHighlighted = highlightLines.includes(lineNumber);
      return {
        display: 'flex',
        minHeight: '1.6em',
        ...(isHighlighted
          ? {
              backgroundColor: 'var(--ds-color-info-background-subtle)',
              marginInline: 'calc(var(--ds-spacing-4) * -1)',
              paddingInline: 'var(--ds-spacing-4)',
            }
          : {}),
      };
    };

    const lineNumberStyle: React.CSSProperties = {
      display: 'inline-block',
      width: '3ch',
      marginRight: 'var(--ds-spacing-4)',
      color: 'var(--ds-color-neutral-text-subtle)',
      textAlign: 'right',
      userSelect: 'none',
      flexShrink: 0,
    };

    const codeLineStyle: React.CSSProperties = {
      flex: 1,
      minWidth: 0,
    };

    const showHeader = title || languageLabel || showCopyButton;

    return (
      <div ref={ref} style={containerStyle} {...props}>
        {/* Header with title, language badge, and copy button */}
        {showHeader && (
          <div style={headerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
              {title && <span style={titleStyle}>{title}</span>}
              {languageLabel && !title && (
                <span style={languageBadgeStyle}>{languageLabel}</span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              {languageLabel && title && (
                <span style={languageBadgeStyle}>{languageLabel}</span>
              )}
              {showCopyButton && (
                <button
                  type="button"
                  onClick={handleCopy}
                  style={copyButtonStyle}
                  aria-label={copied ? 'Copied!' : 'Copy code'}
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Code content */}
        <pre style={preStyle}>
          <code>
            {lines.map((line, index) => {
              const lineNumber = startLineNumber + index;
              return (
                <div key={index} style={lineStyle(lineNumber)}>
                  {showLineNumbers && (
                    <span style={lineNumberStyle} aria-hidden="true">
                      {lineNumber}
                    </span>
                  )}
                  <span style={codeLineStyle}>
                    {highlightCode(line, language)}
                    {index < lines.length - 1 && '\n'}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>

        {/* Inline styles for syntax highlighting */}
        <style>{`
          .code-comment { color: var(--ds-color-neutral-text-subtle); font-style: italic; }
          .code-string { color: var(--ds-color-success-text-default); }
          .code-keyword { color: var(--ds-color-info-text-default); font-weight: 500; }
          .code-number { color: var(--ds-color-warning-text-default); }
        `}</style>
      </div>
    );
  }
);

CodeBlock.displayName = 'CodeBlock';
