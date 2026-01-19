/**
 * SeasonCard Block
 *
 * Pure display component for season information.
 * No SDK dependencies - receives data via props.
 */

import { Card, Heading, Paragraph, Button, GenericStatusBadge, CalendarIcon, ClockIcon, BuildingIcon } from '../..';
import { useT } from '@xala/i18n';

/** Season status type for display */
export type SeasonStatus = 'draft' | 'open' | 'closed' | 'cancelled' | 'completed';

/** Season data for display */
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
  /** Season data to display */
  season: SeasonCardData;
  /** Show action buttons */
  showActions?: boolean;
  /** View details callback */
  onViewDetails?: (seasonId: string) => void;
  /** Apply callback */
  onApply?: (seasonId: string) => void;
  /** Test ID */
  'data-testid'?: string;
}

const STATUS_CONFIG: Record<SeasonStatus, { label: string; color: 'info' | 'success' | 'warning' | 'danger' | 'neutral' }> = {
  draft: { label: 'Utkast', color: 'neutral' },
  open: { label: 'Åpen', color: 'success' },
  closed: { label: 'Stengt', color: 'warning' },
  cancelled: { label: 'Kansellert', color: 'danger' },
  completed: { label: 'Fullført', color: 'info' },
};

export function SeasonCard({
  season,
  showActions = true,
  onViewDetails,
  onApply,
  'data-testid': testId = 'season-card',
}: SeasonCardProps) {
  const t = useT();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('no-NO', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const statusConfig = STATUS_CONFIG[season.status] || STATUS_CONFIG.draft;
  const isOpen = season.status === 'open';

  return (
    <Card
      data-testid={testId}
      style={{
        padding: 0,
        transition: 'all 0.2s',
        border: '1px solid var(--ds-color-neutral-border-default)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 'var(--ds-spacing-6)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            {season.name}
          </Heading>
          {season.description && (
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                color: 'var(--ds-color-neutral-text-subtle)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {season.description}
            </Paragraph>
          )}
        </div>
        <GenericStatusBadge status={statusConfig.label} color={statusConfig.color} size="sm" />
      </div>

      {/* Details Grid */}
      <div
        style={{
          padding: 'var(--ds-spacing-6)',
          display: 'grid',
          gap: 'var(--ds-spacing-5)',
          flex: 1,
        }}
      >
        {/* Date Range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-accent-surface-default)',
              color: 'var(--ds-color-accent-base-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CalendarIcon size={16} />
          </div>
          <div>
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('seasons.card.period')}
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              {formatDate(season.startDate)} - {formatDate(season.endDate)}
            </Paragraph>
          </div>
        </div>

        {/* Application Deadline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-warning-surface-default)',
              color: 'var(--ds-color-warning-base-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ClockIcon size={16} />
          </div>
          <div>
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('seasons.card.applicationDeadline')}
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              {formatDate(season.applicationDeadline)}
            </Paragraph>
          </div>
        </div>

        {/* Statistics */}
        {(season.totalApplications !== undefined || season.approvedApplications !== undefined) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-success-surface-default)',
                color: 'var(--ds-color-success-base-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BuildingIcon size={16} />
            </div>
            <div>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('seasons.card.applications')}
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                {t('seasons.card.applicationsTotal', { count: season.totalApplications ?? 0 })}
                {season.approvedApplications !== undefined && ` • ${t('seasons.card.applicationsApproved', { count: season.approvedApplications })}`}
              </Paragraph>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div
          style={{
            padding: 'var(--ds-spacing-5) var(--ds-spacing-6)',
            borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
            backgroundColor: 'var(--ds-color-neutral-background-subtle)',
            display: 'flex',
            gap: 'var(--ds-spacing-3)',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            type="button"
            variant="tertiary"
            data-size="sm"
            onClick={() => onViewDetails?.(season.id)}
            data-testid={`${testId}-view-details`}
          >
            {t('seasons.card.viewDetails')}
          </Button>
          {isOpen && onApply && (
            <Button
              type="button"
              variant="primary"
              data-size="sm"
              onClick={() => onApply(season.id)}
              data-testid={`${testId}-apply`}
            >
              {t('seasons.card.applyNow')}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
