/**
 * FormSection Component
 *
 * Standardized section header for forms.
 * Provides consistent styling for form sections across the application.
 *
 * @example
 * ```tsx
 * import { FormSection } from '@digdir/designsystemet-react';
 *
 * function MyForm() {
 *   return (
 *     <FormSection title="Personal Information" description="Enter your details">
 *       <input name="name" />
 *       <input name="email" />
 *     </FormSection>
 *   );
 * }
 * ```
 */

import { Paragraph } from '@digdir/designsystemet-react';
import type { ReactNode } from 'react';

export interface FormSectionProps {
  /** Section title */
  title: string;
  /** Section content */
  children: ReactNode;
  /** Optional description text */
  description?: string;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

/**
 * FormSection wraps form fields with a title and optional description
 */
export function FormSection({
  title,
  children,
  description,
  className,
  style,
}: FormSectionProps) {
  return (
    <div className={className} style={style}>
      <Paragraph
        data-size="sm"
        style={{
          fontWeight: 'var(--ds-font-weight-semibold)',
          color: 'var(--ds-color-neutral-text-default)',
          marginBottom: 'var(--ds-spacing-3)',
        }}
      >
        {title}
      </Paragraph>
      {description && (
        <Paragraph
          data-size="sm"
          style={{
            color: 'var(--ds-color-neutral-text-subtle)',
            marginBottom: 'var(--ds-spacing-3)',
          }}
        >
          {description}
        </Paragraph>
      )}
      {children}
    </div>
  );
}
