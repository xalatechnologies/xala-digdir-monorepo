/**
 * MediaPlaceholder Component
 *
 * A placeholder component for documentation media (screenshots, videos, diagrams).
 * Used to indicate where visual content should be placed in documentation pages.
 *
 * Uses design tokens from @xala/ds for consistent styling.
 */

import React, { forwardRef } from 'react';

export type MediaType = 'screenshot' | 'video' | 'diagram' | 'animation';

export interface MediaPlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The type of media this placeholder represents
   * @default 'screenshot'
   */
  type?: MediaType;

  /**
   * Label describing what media should be placed here
   */
  label: string;

  /**
   * Optional notes or instructions for the media
   */
  notes?: string;

  /**
   * Aspect ratio for the placeholder
   * @default '16/9'
   */
  aspectRatio?: '16/9' | '4/3' | '1/1' | '21/9';

  /**
   * Alt text description for accessibility purposes
   */
  alt?: string;
}

/**
 * Get icon SVG based on media type
 */
const getIcon = (type: MediaType): React.ReactNode => {
  const iconStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    opacity: 0.6,
  };

  switch (type) {
    case 'screenshot':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={iconStyle}
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      );
    case 'video':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={iconStyle}
          aria-hidden="true"
        >
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      );
    case 'diagram':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={iconStyle}
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case 'animation':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={iconStyle}
          aria-hidden="true"
        >
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="2" y1="7" x2="7" y2="7" />
          <line x1="2" y1="17" x2="7" y2="17" />
          <line x1="17" y1="17" x2="22" y2="17" />
          <line x1="17" y1="7" x2="22" y2="7" />
        </svg>
      );
  }
};

/**
 * Get type label for display
 */
const getTypeLabel = (type: MediaType): string => {
  switch (type) {
    case 'screenshot':
      return 'Screenshot';
    case 'video':
      return 'Video';
    case 'diagram':
      return 'Diagram';
    case 'animation':
      return 'Animation';
  }
};

export const MediaPlaceholder = forwardRef<HTMLDivElement, MediaPlaceholderProps>(
  (
    {
      type = 'screenshot',
      label,
      notes,
      aspectRatio = '16/9',
      alt,
      style,
      ...props
    },
    ref
  ) => {
    const containerStyle: React.CSSProperties = {
      position: 'relative',
      aspectRatio,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--ds-spacing-3)',
      padding: 'var(--ds-spacing-6)',
      marginBlock: 'var(--ds-spacing-4)',
      backgroundColor: 'var(--ds-color-neutral-background-subtle)',
      border: '2px dashed var(--ds-color-neutral-border-default)',
      borderRadius: 'var(--ds-border-radius-lg)',
      textAlign: 'center',
      ...style,
    };

    const badgeStyle: React.CSSProperties = {
      position: 'absolute',
      top: 'var(--ds-spacing-3)',
      left: 'var(--ds-spacing-3)',
      padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
      fontSize: 'var(--ds-font-size-xs)',
      fontWeight: 'var(--ds-font-weight-medium)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: 'var(--ds-color-neutral-text-subtle)',
      backgroundColor: 'var(--ds-color-neutral-surface-default)',
      border: '1px solid var(--ds-color-neutral-border-default)',
      borderRadius: 'var(--ds-border-radius-sm)',
    };

    const iconContainerStyle: React.CSSProperties = {
      color: 'var(--ds-color-neutral-text-subtle)',
    };

    const labelStyle: React.CSSProperties = {
      margin: 0,
      fontSize: 'var(--ds-font-size-md)',
      fontWeight: 'var(--ds-font-weight-medium)',
      color: 'var(--ds-color-neutral-text-default)',
    };

    const notesStyle: React.CSSProperties = {
      margin: 0,
      fontSize: 'var(--ds-font-size-sm)',
      color: 'var(--ds-color-neutral-text-subtle)',
      maxWidth: '400px',
    };

    return (
      <div
        ref={ref}
        role="img"
        aria-label={alt || `${getTypeLabel(type)} placeholder: ${label}`}
        style={containerStyle}
        {...props}
      >
        {/* Type badge */}
        <span style={badgeStyle}>{getTypeLabel(type)}</span>

        {/* Icon */}
        <div style={iconContainerStyle}>{getIcon(type)}</div>

        {/* Label */}
        <p style={labelStyle}>{label}</p>

        {/* Notes */}
        {notes && <p style={notesStyle}>{notes}</p>}
      </div>
    );
  }
);

MediaPlaceholder.displayName = 'MediaPlaceholder';
