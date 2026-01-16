/**
 * MDX Component Mappings
 *
 * Maps standard HTML elements to @xala/ds components
 * for consistent design system usage in MDX content.
 *
 * Note: Type assertions are used to work around React 18/19 types mismatch
 * between @mdx-js/react (React 19) and @xala/ds (React 18). This is a known
 * issue that doesn't affect runtime behavior.
 */
import { Heading, Paragraph, Link } from '@xala/ds';
import type { ReactNode } from 'react';
import { Steps } from './components/docs/Steps';
import { Callout } from './components/docs/Callout';
import { Checklist } from './components/docs/Checklist';
import { CodeBlock } from './components/docs/CodeBlock';
import { RoleMatrix } from './components/docs/RoleMatrix';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProps = any;

/**
 * MDX component overrides using @xala/ds primitives
 *
 * These mappings ensure all MDX content renders with
 * design system components for consistent styling.
 */
export const mdxComponents = {
  // Headings - map to @xala/ds Heading component
  // Using data-size prop as per Designsystemet API
  h1: (props: AnyProps) => <Heading level={1} data-size="xl" {...props} />,
  h2: (props: AnyProps) => <Heading level={2} data-size="lg" {...props} />,
  h3: (props: AnyProps) => <Heading level={3} data-size="md" {...props} />,
  h4: (props: AnyProps) => <Heading level={4} data-size="sm" {...props} />,
  h5: (props: AnyProps) => <Heading level={5} data-size="xs" {...props} />,
  h6: (props: AnyProps) => <Heading level={6} data-size="xs" {...props} />,

  // Paragraph text
  p: (props: AnyProps) => <Paragraph {...props} />,

  // Links - using @xala/ds Link component
  a: ({ href, children, ...rest }: { href?: string; children?: ReactNode; [key: string]: unknown }) => {
    const isExternal = href?.startsWith('http');
    return (
      <Link
        href={href}
        {...(isExternal && {
          target: '_blank',
          rel: 'noopener noreferrer',
        })}
        {...rest}
      >
        {children}
      </Link>
    );
  },

  // Lists - styled with design tokens
  ul: (props: AnyProps) => (
    <ul
      style={{
        paddingLeft: 'var(--ds-spacing-6)',
        marginBlock: 'var(--ds-spacing-4)',
      }}
      {...props}
    />
  ),
  ol: (props: AnyProps) => (
    <ol
      style={{
        paddingLeft: 'var(--ds-spacing-6)',
        marginBlock: 'var(--ds-spacing-4)',
      }}
      {...props}
    />
  ),
  li: (props: AnyProps) => (
    <li
      style={{
        marginBottom: 'var(--ds-spacing-2)',
      }}
      {...props}
    />
  ),

  // Tables - styled with design tokens
  table: (props: AnyProps) => (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginBlock: 'var(--ds-spacing-4)',
      }}
      {...props}
    />
  ),
  thead: (props: AnyProps) => (
    <thead
      style={{
        backgroundColor: 'var(--ds-color-neutral-background-subtle)',
      }}
      {...props}
    />
  ),
  th: (props: AnyProps) => (
    <th
      style={{
        padding: 'var(--ds-spacing-3)',
        textAlign: 'left',
        borderBottom: '2px solid var(--ds-color-neutral-border-default)',
        fontWeight: 'var(--ds-font-weight-medium)',
      }}
      {...props}
    />
  ),
  td: (props: AnyProps) => (
    <td
      style={{
        padding: 'var(--ds-spacing-3)',
        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
      }}
      {...props}
    />
  ),

  // Code - inline and blocks styled with design tokens
  code: ({ className, ...rest }: { className?: string; [key: string]: unknown }) => {
    // If this is inside a pre tag (code block), don't add inline styles
    if (className?.includes('language-')) {
      return <code className={className} {...rest} />;
    }
    // Inline code styling
    return (
      <code
        style={{
          backgroundColor: 'var(--ds-color-neutral-background-subtle)',
          padding: '0.125rem var(--ds-spacing-1)',
          borderRadius: 'var(--ds-border-radius-sm)',
          fontSize: '0.875em',
          fontFamily: 'var(--ds-font-family-mono)',
        }}
        className={className}
        {...rest}
      />
    );
  },

  // Pre - code blocks
  pre: (props: AnyProps) => (
    <pre
      style={{
        padding: 'var(--ds-spacing-4)',
        borderRadius: 'var(--ds-border-radius-md)',
        backgroundColor: 'var(--ds-color-neutral-background-subtle)',
        overflow: 'auto',
        marginBlock: 'var(--ds-spacing-4)',
        fontFamily: 'var(--ds-font-family-mono)',
        fontSize: '0.875rem',
        lineHeight: 1.6,
      }}
      {...props}
    />
  ),

  // Blockquote
  blockquote: (props: AnyProps) => (
    <blockquote
      style={{
        borderLeft: '4px solid var(--ds-color-accent-base-default)',
        paddingLeft: 'var(--ds-spacing-4)',
        marginLeft: 0,
        marginBlock: 'var(--ds-spacing-4)',
        fontStyle: 'italic',
        color: 'var(--ds-color-neutral-text-subtle)',
      }}
      {...props}
    />
  ),

  // Horizontal rule
  hr: (props: AnyProps) => (
    <hr
      style={{
        border: 'none',
        borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
        marginBlock: 'var(--ds-spacing-6)',
      }}
      {...props}
    />
  ),

  // Strong/emphasis
  strong: (props: AnyProps) => (
    <strong style={{ fontWeight: 'var(--ds-font-weight-medium)' }} {...props} />
  ),

  // Images (wrapped for responsive behavior)
  img: (props: AnyProps) => (
    <img
      style={{
        maxWidth: '100%',
        height: 'auto',
        borderRadius: 'var(--ds-border-radius-md)',
      }}
      {...props}
    />
  ),

  // Custom documentation components
  Steps: (props: AnyProps) => <Steps {...props} />,
  Callout: (props: AnyProps) => <Callout {...props} />,
  Checklist: (props: AnyProps) => <Checklist {...props} />,
  CodeBlock: (props: AnyProps) => <CodeBlock {...props} />,
  RoleMatrix: (props: AnyProps) => <RoleMatrix {...props} />,
};
