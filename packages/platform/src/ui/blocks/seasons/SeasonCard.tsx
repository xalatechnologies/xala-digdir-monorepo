/**
 * SeasonCard Block - Reusable DS Component
 *
 * Displays season information with status badge and actions.
 * Domain-agnostic - receives all data and handlers via props.
 *
 * @example
 * ```tsx
 * // In app with i18n
 * import { useT } from '@xala/i18n';
 *
 * function MySeasonCard({ season }) {
 *   const t = useT();
 *
 *   return (
 *     <SeasonCard
 *       season={season}
 *       onViewDetails={(id) => navigate(`/seasons/${id}`)}
 *       onApply={(id) => navigate(`/seasons/${id}/apply`)}
 *       labels={{
 *         period: t('seasons.card.period'),
 *         applicationDeadline: t('seasons.card.applicationDeadline'),
 *         viewDetails: t('seasons.card.viewDetails'),
 *         applyNow: t('seasons.card.applyNow'),
 *       }}
 *     />
 *   );
 * }
 * ```
 */
import { Card, Badge } from '../../primitives';
import { Heading, Paragraph, Button } from '@digdir/designsystemet-react';

// =============================================================================
// Types
// =============================================================================

export type SeasonStatus = 'draft' | 'open' | 'closed' | 'cancelled' | 'completed';

export interface SeasonCardData {
  id: string;
  name: string;
  description?: string;
  status: SeasonStatus;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  totalApplications?: number;
  approvedApplications?: number;
}

export interface SeasonCardLabels {
  period: string;
  applicationDeadline: string;
  viewDetails: string;
  applyNow: string;
  statusLabels: Record<SeasonStatus, string>;
}

export interface SeasonCardProps {
  season: SeasonCardData;
  showActions?: boolean;
  onViewDetails?: (id: string) => void;
  onApply?: (id: string) => void;
  /** Labels for i18n */
  labels?: Partial<SeasonCardLabels>;
  'data-testid'?: string;
}

// =============================================================================
// Default Configuration
// =============================================================================

const DEFAULT_STATUS_CONFIG: Record<SeasonStatus, { label: string; color: 'info' | 'success' | 'warning' | 'danger' | 'neutral' }> = {
  draft: { label: 'Utkast', color: 'neutral' },
  open: { label: 'Apen', color: 'success' },
  closed: { label: 'Stengt', color: 'warning' },
  cancelled: { label: 'Kansellert', color: 'danger' },
  completed: { label: 'Fullfort', color: 'info' },
};

const DEFAULT_LABELS: SeasonCardLabels = {
  period: 'Periode',
  applicationDeadline: 'Soknadsfrist',
  viewDetails: 'Se detaljer',
  applyNow: 'Sok na',
  statusLabels: {
    draft: 'Utkast',
    open: 'Apen',
    closed: 'Stengt',
    cancelled: 'Kansellert',
    completed: 'Fullfort',
  },
};

// =============================================================================
// Component
// =============================================================================

export function SeasonCard({
  season,
  showActions = true,
  onViewDetails,
  onApply,
  labels: customLabels,
  'data-testid': testId = 'season-card',
}: SeasonCardProps) {
  const labels = { ...DEFAULT_LABELS, ...customLabels };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('no-NO', { day: 'numeric', month: 'short', year: 'numeric' });

  const statusConfig = DEFAULT_STATUS_CONFIG[season.status] || DEFAULT_STATUS_CONFIG.draft;
  const statusLabel = labels.statusLabels?.[season.status] || statusConfig.label;

  return (
    <Card data-testid={testId} style={{ padding: 0, border: '1px solid var(--ds-color-neutral-border-default)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'var(--ds-spacing-6)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)', display: 'flex', justifyContent: 'space-between', gap: 'var(--ds-spacing-4)' }}>
        <div style={{ flex: 1 }}>
          <Heading level={3} data-size="sm" style={{ margin: 0 }}>{season.name}</Heading>
          {season.description && <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>{season.description}</Paragraph>}
        </div>
        <Badge variant={statusConfig.color} size="sm">{statusLabel}</Badge>
      </div>
      <div style={{ padding: 'var(--ds-spacing-6)', flex: 1 }}>
        <Paragraph data-size="sm" style={{ margin: 0 }}>{labels.period}: {formatDate(season.startDate)} - {formatDate(season.endDate)}</Paragraph>
        <Paragraph data-size="sm" style={{ margin: 0 }}>{labels.applicationDeadline}: {formatDate(season.applicationDeadline)}</Paragraph>
      </div>
      {showActions && (
        <div style={{ padding: 'var(--ds-spacing-5) var(--ds-spacing-6)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)', display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
          <Button type="button" variant="tertiary" data-size="sm" onClick={() => onViewDetails?.(season.id)}>{labels.viewDetails}</Button>
          {season.status === 'open' && onApply && <Button type="button" variant="primary" data-size="sm" onClick={() => onApply(season.id)}>{labels.applyNow}</Button>}
        </div>
      )}
    </Card>
  );
}
