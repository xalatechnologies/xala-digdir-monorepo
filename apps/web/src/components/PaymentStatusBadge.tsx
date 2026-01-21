/**
 * PaymentStatusBadge Component
 *
 * Displays payment status for bookings with color-coded badges.
 * Re-exported from @xalatechnologies/platform/ui design system.
 *
 * Usage:
 * ```tsx
 * import { PaymentStatusBadge } from './components/PaymentStatusBadge';
import { useT } from '@xala/i18n';
 *
 * <PaymentStatusBadge status="paid" />
 * <PaymentStatusBadge status="unpaid" size="md" />
 * <PaymentStatusBadge status="partial" />
 * <PaymentStatusBadge status="refunded" />
 * ```
 *
 * Status values:
 * - 'paid': Payment completed successfully (green)
 * - 'unpaid': Payment not yet made (yellow)
 * - 'partial': Partial payment received (yellow)
 * - 'refunded': Payment has been refunded (gray)
 *
 * @see packages/ds/src/blocks/StatusBadges.tsx for implementation
 */

// Re-export from design system - DO NOT create custom UI components in apps
export { PaymentStatusBadge } from '@xalatechnologies/platform/ui';
export type { PaymentStatusBadgeProps, PaymentStatusType } from '@xalatechnologies/platform/ui';
