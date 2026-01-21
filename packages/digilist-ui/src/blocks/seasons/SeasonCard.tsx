/**
 * SeasonCard Block - Digilist Domain Component
 *
 * Domain-specific component for displaying seasonal booking information.
 * Migrated from @xala/ds to @digilist/ui for platform decoupling.
 */
import { Card, Heading, Paragraph, Button } from '@xalatechnologies/platform/ui/primitives';
import { Badge } from '@xala/ds';
import { useT } from '@xala/i18n';

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

export interface SeasonCardProps {
  season: SeasonCardData;
  showActions?: boolean;
  onViewDetails?: (id: string) => void;
  onApply?: (id: string) => void;
  'data-testid'?: string;
}

const STATUS_CONFIG: Record<SeasonStatus, { label: string; color: 'info' | 'success' | 'warning' | 'danger' | 'neutral' }> = {
  draft: { label: 'Utkast', color: 'neutral' },
  open: { label: 'Åpen', color: 'success' },
  closed: { label: 'Stengt', color: 'warning' },
  cancelled: { label: 'Kansellert', color: 'danger' },
  completed: { label: 'Fullført', color: 'info' },
};

export function SeasonCard({ season, showActions = true, onViewDetails, onApply, 'data-testid': testId = 'season-card' }: SeasonCardProps) {
  const t = useT();
  const formatDate = (d: string) => new Date(d).toLocaleDateString('no-NO', { day: 'numeric', month: 'short', year: 'numeric' });
  const cfg = STATUS_CONFIG[season.status] || STATUS_CONFIG.draft;

  return (
    <Card data-testid={testId} style={{ padding: 0, border: '1px solid var(--ds-color-neutral-border-default)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'var(--ds-spacing-6)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)', display: 'flex', justifyContent: 'space-between', gap: 'var(--ds-spacing-4)' }}>
        <div style={{ flex: 1 }}>
          <Heading level={3} data-size="sm" style={{ margin: 0 }}>{season.name}</Heading>
          {season.description && <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>{season.description}</Paragraph>}
        </div>
        <Badge variant={cfg.color} size="sm">{cfg.label}</Badge>
      </div>
      <div style={{ padding: 'var(--ds-spacing-6)', flex: 1 }}>
        <Paragraph data-size="sm" style={{ margin: 0 }}>{t('seasons.card.period')}: {formatDate(season.startDate)} - {formatDate(season.endDate)}</Paragraph>
        <Paragraph data-size="sm" style={{ margin: 0 }}>{t('seasons.card.applicationDeadline')}: {formatDate(season.applicationDeadline)}</Paragraph>
      </div>
      {showActions && (
        <div style={{ padding: 'var(--ds-spacing-5) var(--ds-spacing-6)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)', display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
          <Button type="button" variant="tertiary" data-size="sm" onClick={() => onViewDetails?.(season.id)}>{t('seasons.card.viewDetails')}</Button>
          {season.status === 'open' && onApply && <Button type="button" variant="primary" data-size="sm" onClick={() => onApply(season.id)}>{t('seasons.card.applyNow')}</Button>}
        </div>
      )}
    </Card>
  );
}
