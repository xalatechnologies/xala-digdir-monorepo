/**
 * SkipLinks Component
 *
 * Accessibility component that provides skip links for keyboard users.
 * Allows users to skip directly to main content or navigation.
 *
 * @example
 * ```tsx
 * import { SkipLinks } from '@digdir/designsystemet-react';
 *
 * function App() {
 *   return (
 *     <>
 *       <SkipLinks />
 *       <Header />
 *       <main id="main-content">...</main>
 *     </>
 *   );
 * }
 * ```
 */

import React from 'react';

export interface SkipLink {
  /** Target element ID (without #) */
  targetId: string;
  /** Link label */
  label: string;
}

export interface SkipLinksProps {
  /** Custom skip links (default: main-content) */
  links?: SkipLink[];
  /** Custom class name */
  className?: string;
}

const defaultLinks: SkipLink[] = [
  { targetId: 'main-content', label: 'Hopp til hovedinnhold' },
];

/**
 * SkipLinks provides keyboard-accessible skip navigation
 */
export function SkipLinks({ links = defaultLinks, className }: SkipLinksProps): React.ReactElement {
  const skipLinks = links;

  return (
    <div className={className}>
      {skipLinks.map((link) => (
        <a
          key={link.targetId}
          href={`#${link.targetId}`}
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 'auto',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
            // Show on focus
            ...({
              ':focus': {
                position: 'fixed',
                top: 'var(--ds-spacing-2)',
                left: 'var(--ds-spacing-2)',
                width: 'auto',
                height: 'auto',
                padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                color: 'var(--ds-color-neutral-text-default)',
                border: '2px solid var(--ds-color-accent-border-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                zIndex: 9999,
                textDecoration: 'none',
                fontWeight: 'var(--ds-font-weight-medium)',
              },
            } as React.CSSProperties),
          }}
          // Using CSS class for focus state
          onFocus={(e) => {
            const el = e.currentTarget;
            el.style.position = 'fixed';
            el.style.top = 'var(--ds-spacing-2)';
            el.style.left = 'var(--ds-spacing-2)';
            el.style.width = 'auto';
            el.style.height = 'auto';
            el.style.padding = 'var(--ds-spacing-3) var(--ds-spacing-4)';
            el.style.backgroundColor = 'var(--ds-color-neutral-background-default)';
            el.style.color = 'var(--ds-color-neutral-text-default)';
            el.style.border = '2px solid var(--ds-color-accent-border-default)';
            el.style.borderRadius = 'var(--ds-border-radius-md)';
            el.style.zIndex = '9999';
            el.style.textDecoration = 'none';
            el.style.fontWeight = 'var(--ds-font-weight-medium)';
            el.style.overflow = 'visible';
          }}
          onBlur={(e) => {
            const el = e.currentTarget;
            el.style.position = 'absolute';
            el.style.left = '-9999px';
            el.style.top = 'auto';
            el.style.width = '1px';
            el.style.height = '1px';
            el.style.overflow = 'hidden';
          }}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
