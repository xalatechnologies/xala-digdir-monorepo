/**
 * AppHeader Component
 *
 * Main application header with logo, search, and actions
 * Following DIGILIST design patterns - single row layout
 * Uses design system tokens for styling
 */

import React, { forwardRef } from 'react';
import { Container } from '../primitives';

export interface AppHeaderProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Logo element
   */
  logo?: React.ReactNode;

  /**
   * Search element
   */
  search?: React.ReactNode;

  /**
   * Actions element (buttons, etc.)
   */
  actions?: React.ReactNode;

  /**
   * Whether header is sticky
   * @default true
   */
  sticky?: boolean;

  /**
   * Header height
   * @default '72px'
   */
  height?: string;

  /**
   * Whether to show skip link
   * @default true
   */
  showSkipLink?: boolean;

  /**
   * Skip link target
   * @default '#main'
   */
  skipLinkTarget?: string;

  /**
   * Skip link text
   * @default 'Hopp til hovedinnhold'
   */
  skipLinkText?: string;

  /**
   * Header background variant
   * @default 'surface'
   */
  variant?: 'surface' | 'background' | 'transparent';
}

export const AppHeader = forwardRef<HTMLElement, AppHeaderProps>(
  ({
    logo,
    search,
    actions,
    sticky = true,
    height = '80px',
    showSkipLink = true,
    skipLinkTarget = '#main',
    skipLinkText = 'Hopp til hovedinnhold',
    variant = 'surface',
    className,
    style,
    ...props
  }, ref) => {
    const backgrounds = {
      surface: 'var(--ds-color-neutral-surface-default)',
      background: 'var(--ds-color-neutral-background-default)',
      transparent: 'transparent'
    };

    const headerStyle: React.CSSProperties = {
      position: sticky ? 'sticky' : 'relative',
      top: 0,
      zIndex: 100,
      backgroundColor: backgrounds[variant],
      borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
      boxShadow: sticky ? '0 2px 12px -4px rgba(0, 0, 0, 0.1)' : undefined,
      transition: 'box-shadow 0.2s ease',
      ...style
    };

    const skipLinkStyle: React.CSSProperties = {
      position: 'absolute',
      left: '-9999px',
      top: 'var(--ds-spacing-3)',
      zIndex: 1000,
      padding: 'var(--ds-spacing-3) var(--ds-spacing-5)',
      backgroundColor: 'var(--ds-color-accent-base-default)',
      color: 'var(--ds-color-accent-contrast-default)',
      textDecoration: 'none',
      borderRadius: 'var(--ds-border-radius-md)',
      fontSize: 'var(--ds-font-size-md)',
      fontWeight: 600,
    };

    return (
      <>
        {showSkipLink && (
          <a
            href={skipLinkTarget}
            style={skipLinkStyle}
            onFocus={(e) => {
              e.currentTarget.style.left = 'var(--ds-spacing-6)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.left = '-9999px';
            }}
          >
            {skipLinkText}
          </a>
        )}
        <header ref={ref} className={className} style={headerStyle} {...props}>
          <Container maxWidth="1440px" padding="0 var(--ds-spacing-8)">
            {/* Single row: Logo | Search | Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height,
              gap: 'var(--ds-spacing-8)'
            }}>
              {/* Left: Logo */}
              <div style={{
                flex: '0 0 auto'
              }}>
                {logo}
              </div>

              {/* Center: Search */}
              {search && (
                <div style={{
                  flex: '1 1 auto',
                  maxWidth: '520px'
                }}>
                  {search}
                </div>
              )}

              {/* Right: Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-3)',
                flex: '0 0 auto'
              }}>
                {actions}
              </div>
            </div>
          </Container>
        </header>
      </>
    );
  }
);

AppHeader.displayName = 'AppHeader';
