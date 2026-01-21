/**
 * InfoBox Component
 *
 * Reusable colored info/status boxes.
 * Supports different color variants matching the design system.
 *
 * @example
 * ```tsx
 * import { InfoBox } from '@digdir/designsystemet-react';
 *
 * function StatusDisplay() {
 *   return (
 *     <InfoBox variant="success" title="Success">
 *       Your changes have been saved.
 *     </InfoBox>
 *   );
 * }
 * ```
 */

import { Paragraph } from '@digdir/designsystemet-react';
import type { ReactNode } from 'react';

export type InfoBoxVariant = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export interface InfoBoxProps {
  /** Color variant */
  variant?: InfoBoxVariant;
  /** Box content */
  children: ReactNode;
  /** Optional title */
  title?: string;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

const variantStyles: Record<InfoBoxVariant, { bg: string; border: string; text: string }> = {
  info: {
    bg: 'var(--ds-color-info-surface-subtle)',
    border: 'var(--ds-color-info-border-subtle)',
    text: 'var(--ds-color-info-text-default)',
  },
  success: {
    bg: 'var(--ds-color-success-surface-subtle)',
    border: 'var(--ds-color-success-border-subtle)',
    text: 'var(--ds-color-success-text-default)',
  },
  warning: {
    bg: 'var(--ds-color-warning-surface-subtle)',
    border: 'var(--ds-color-warning-border-subtle)',
    text: 'var(--ds-color-warning-text-default)',
  },
  danger: {
    bg: 'var(--ds-color-danger-surface-subtle)',
    border: 'var(--ds-color-danger-border-subtle)',
    text: 'var(--ds-color-danger-text-default)',
  },
  neutral: {
    bg: 'var(--ds-color-neutral-surface-default)',
    border: 'var(--ds-color-neutral-border-subtle)',
    text: 'var(--ds-color-neutral-text-default)',
  },
};

/**
 * InfoBox displays content in a colored box
 */
export function InfoBox({
  variant = 'info',
  children,
  title,
  className,
  style,
}: InfoBoxProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={className}
      style={{
        padding: 'var(--ds-spacing-3)',
        backgroundColor: styles.bg,
        borderRadius: 'var(--ds-border-radius-md)',
        border: `1px solid ${styles.border}`,
        ...style,
      }}
    >
      {title && (
        <Paragraph
          data-size="sm"
          style={{
            fontWeight: 'var(--ds-font-weight-semibold)',
            color: styles.text,
            margin: 0,
            marginBottom: 'var(--ds-spacing-1)',
          }}
        >
          {title}
        </Paragraph>
      )}
      <Paragraph data-size="sm" style={{ color: styles.text, margin: 0 }}>
        {children}
      </Paragraph>
    </div>
  );
}
