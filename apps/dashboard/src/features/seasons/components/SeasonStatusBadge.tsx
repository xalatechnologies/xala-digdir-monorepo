/**
 * Season Status Badge Component
 *
 * Displays a colored badge for season status using GenericStatusBadge from @xalatechnologies/platform/ui.
 *
 * Usage:
 * ```tsx
 * import { SeasonStatusBadge } from './features/seasons/components/SeasonStatusBadge';
 *
 * <SeasonStatusBadge status="open" />
 * <SeasonStatusBadge status="active" size="md" />
 * <SeasonStatusBadge status="cancelled" />
 * ```
 *
 * Status values:
 * - 'draft': Season is in draft mode (gray)
 * - 'open': Season is open for applications (green)
 * - 'closed': Season is closed (gray)
 * - 'active': Season is currently active (blue)
 * - 'completed': Season has been completed (gray)
 * - 'cancelled': Season has been cancelled (red)
 */

import { GenericStatusBadge } from '@xalatechnologies/platform/ui';
import type { SeasonStatus } from '@digilist/client-sdk/types';
import { SEASON_STATUS_CONFIG } from '../constants';

interface SeasonStatusBadgeProps {
  status: SeasonStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function SeasonStatusBadge({ status, size = 'sm' }: SeasonStatusBadgeProps) {
  return (
    <GenericStatusBadge
      status={status}
      config={SEASON_STATUS_CONFIG}
      size={size}
    />
  );
}
