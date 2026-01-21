/**
 * FormActions Component
 *
 * Standardized action button group for forms.
 * Provides consistent layout and styling for submit/cancel actions.
 *
 * @example
 * ```tsx
 * import { FormActions } from '@digdir/designsystemet-react';
 *
 * function MyForm() {
 *   return (
 *     <form>
 *       {/* form fields *\/}
 *       <FormActions
 *         submitText="Save"
 *         onCancel={() => navigate(-1)}
 *         isSubmitting={isPending}
 *       />
 *     </form>
 *   );
 * }
 * ```
 */

import { Button } from '@digdir/designsystemet-react';

export interface FormActionsProps {
  /** Text for the primary submit button */
  submitText: string;
  /** Text for the secondary cancel button */
  cancelText?: string;
  /** Callback for cancel button */
  onCancel: () => void;
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
  /** Optional loading text to show during submission */
  submittingText?: string;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

/**
 * FormActions provides submit and cancel buttons for forms
 */
export function FormActions({
  submitText,
  cancelText = 'Avbryt',
  onCancel,
  isSubmitting = false,
  submittingText = 'Lagrer...',
  className,
  style,
}: FormActionsProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        gap: 'var(--ds-spacing-3)',
        paddingTop: 'var(--ds-spacing-3)',
        borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
        ...style,
      }}
    >
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? submittingText : submitText}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        {cancelText}
      </Button>
    </div>
  );
}
