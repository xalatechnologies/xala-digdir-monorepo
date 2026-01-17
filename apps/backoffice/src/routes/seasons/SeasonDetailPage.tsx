/**
 * Season Detail Page
 * Full-page view for managing a seasonal lease season with applications and allocation
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Spinner,
  Stack,
  Tabs,
  EditIcon,
  ArrowLeftIcon,
  TrashIcon,
  CheckCircleIcon,
  CalendarIcon,
  BuildingIcon,
  FileTextIcon,
  ClipboardListIcon,
  PlayIcon,
  LockIcon,
  UnlockIcon,
} from '@xala/ds';
import {
  useSeason,
  useSeasonApplications,
  useSeasonStats,
  useOpenSeason,
  useCloseSeason,
  useDeleteSeason,
  type SeasonStatus,
} from '@digilist/client-sdk';
import { FormSection } from '../../components/shared';
import { SeasonVenueManagement } from '../../components/seasons/SeasonVenueManagement';
import { SeasonApplicationManagement } from '../../components/seasons/SeasonApplicationManagement';
import { SeasonAllocationManagement } from '../../components/seasons/SeasonAllocationManagement';
import { useT } from '@xala/i18n';

const statusVariants: Record<SeasonStatus, 'neutral' | 'info' | 'warning' | 'success'> = {
  draft: 'neutral',
  open: 'info',
  closed: 'warning',
  active: 'success',
  completed: 'success',
  cancelled: 'neutral',
};

export function SeasonDetailPage() {
  const t = useT();

  // Status labels using translations
  const getStatusLabel = (status: SeasonStatus): string => {
    const labels: Record<SeasonStatus, string> = {
      draft: t('seasons.status.draft'),
      open: t('seasons.status.open'),
      closed: t('seasons.status.closed'),
      active: t('seasons.status.active'),
      completed: t('seasons.status.completed'),
      cancelled: t('seasons.status.cancelled'),
    };
    return labels[status];
  };
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');

  // Queries
  const { data: seasonData, isLoading } = useSeason(id!);
  const season = seasonData?.data;

  const { data: statsData } = useSeasonStats(id!);
  const venues = statsData?.data?.applicationsByVenue ?? [];

  const { data: applicationsData } = useSeasonApplications(id!);
  const applications = applicationsData?.data ?? [];

  // Mutations
  const deleteSeasonMutation = useDeleteSeason();
  const openSeasonMutation = useOpenSeason();
  const closeSeasonMutation = useCloseSeason();

  // Handlers
  const handleDelete = async () => {
    if (confirm(t('seasons.confirmDelete'))) {
      await deleteSeasonMutation.mutateAsync(id!);
      navigate('/seasons');
    }
  };

  const handleOpenSeason = async () => {
    if (venues.length === 0) {
      alert(t('seasons.mustAddVenues'));
      return;
    }
    if (confirm(t('seasons.confirmOpenSeason'))) {
      await openSeasonMutation.mutateAsync(id!);
    }
  };

  const handleCloseSeason = async () => {
    if (confirm(t('seasons.confirmCloseSeason'))) {
      await closeSeasonMutation.mutateAsync(id!);
      setActiveTab('applications');
    }
  };

  const handleStartAllocation = () => {
    setActiveTab('allocation');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label={t("ui.loading")} />
      </div>
    );
  }

  if (!season) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Heading level={3} data-size="sm">{t('seasons.seasonNotFound')}</Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}>
          {t('seasons.seasonNotFoundDesc')}
        </Paragraph>
        <Link to="/seasons">
          <Button variant="secondary" data-size="sm" style={{ marginTop: 'var(--ds-spacing-4)' }} type="button">
            <ArrowLeftIcon />
            {t('seasons.backToOverview')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <Link to="/seasons">
          <Button variant="tertiary" data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }} type="button">
            <ArrowLeftIcon />
            {t('seasons.backToOverview')}
          </Button>
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Heading level={2} data-size="lg">
              {season.name}
            </Heading>
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-2)', alignItems: 'center' }}>
              <Badge color={statusVariants[season.status]}>
                {getStatusLabel(season.status)}
              </Badge>
              <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                {formatDate(season.startDate)} – {formatDate(season.endDate)}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
            {/* Status-specific actions */}
            {season.status === 'draft' && (
              <>
                <Link to={`/seasons/${id}/edit`}>
                  <Button variant="secondary" data-size="sm" type="button" aria-label={t("ui.edit")}>
                    <EditIcon />{t("ui.edit")}</Button>
                </Link>
                <Button variant="primary" data-size="sm" onClick={handleOpenSeason} type="button">
                  <UnlockIcon />
                  {t('seasons.openSeason')}
                </Button>
                <Button variant="danger" data-size="sm" onClick={handleDelete} type="button" aria-label={t("ui.delete")}>
                  <TrashIcon />{t("ui.delete")}</Button>
              </>
            )}

            {season.status === 'open' && (
              <>
                <Link to={`/seasons/${id}/edit`}>
                  <Button variant="secondary" data-size="sm" type="button" aria-label={t("ui.edit")}>
                    <EditIcon />{t("ui.edit")}</Button>
                </Link>
                <Button variant="warning" data-size="sm" onClick={handleCloseSeason} type="button">
                  <LockIcon />
                  {t('seasons.closeSeason')}
                </Button>
              </>
            )}

            {season.status === 'closed' && (
              <Button variant="primary" data-size="sm" onClick={handleStartAllocation} type="button">
                <PlayIcon />
                {t('seasons.startAllocation')}
              </Button>
            )}

            {(season.status === 'active' || season.status === 'completed') && (
              <Link to={`/seasons/${id}/edit`}>
                <Button variant="secondary" data-size="sm" type="button">
                  <EditIcon />
                  {t('seasons.seeDetails')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Status info banner */}
      {season.status === 'open' && (
        <Card style={{ backgroundColor: 'var(--ds-color-info-surface-subtle)', border: '1px solid var(--ds-color-info-border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <UnlockIcon style={{ fontSize: 'var(--ds-font-size-heading-md)', color: 'var(--ds-color-info-text-default)' }} />
            <div>
              <Paragraph style={{ fontWeight: 'var(--ds-font-weight-semibold)', margin: 0 }}>
                {t('seasons.seasonOpenForApplications')}
              </Paragraph>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {t('seasons.applicationDeadline')}: {formatDate(season.applicationDeadline)} - {t('seasons.applicationsReceived', { count: applications.length })}
              </Paragraph>
            </div>
          </div>
        </Card>
      )}

      {season.status === 'closed' && (
        <Card style={{ backgroundColor: 'var(--ds-color-warning-surface-subtle)', border: '1px solid var(--ds-color-warning-border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <LockIcon style={{ fontSize: 'var(--ds-font-size-heading-md)', color: 'var(--ds-color-warning-text-default)' }} />
            <div>
              <Paragraph style={{ fontWeight: 'var(--ds-font-weight-semibold)', margin: 0 }}>
                {t('seasons.seasonClosedForApplications')}
              </Paragraph>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {t('seasons.applicationsAwaitingAllocation', { count: applications.length })}
              </Paragraph>
            </div>
          </div>
        </Card>
      )}

      {(season.status === 'active' || season.status === 'completed') && (
        <Card style={{ backgroundColor: 'var(--ds-color-success-surface-subtle)', border: '1px solid var(--ds-color-success-border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <CheckCircleIcon style={{ fontSize: 'var(--ds-font-size-heading-md)', color: 'var(--ds-color-success-text-default)' }} />
            <div>
              <Paragraph style={{ fontWeight: 'var(--ds-font-weight-semibold)', margin: 0 }}>
                {season.status === 'active' ? t('seasons.seasonIsActive') : t('seasons.seasonIsCompleted')}
              </Paragraph>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {t('seasons.allApplicationsProcessed')}
              </Paragraph>
            </div>
          </div>
        </Card>
      )}

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="info">
            <FileTextIcon />{t('seasons.tabInfo')}</Tabs.Trigger>
          <Tabs.Trigger value="venues">
            <BuildingIcon />
            {t('seasons.tabVenues')} ({venues.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="applications">
            <ClipboardListIcon />
            {t('seasons.tabApplications')} ({applications.length})
          </Tabs.Trigger>
          {(season.status === 'closed' || season.status === 'active' || season.status === 'completed') && (
            <Tabs.Trigger value="allocation">
              <CalendarIcon />
              {t('seasons.tabAllocation')}
            </Tabs.Trigger>
          )}
        </Tabs.List>

        {/* Info Tab */}
        <Tabs.Panel value="info">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--ds-spacing-4)' }}>
            <Card>
              <FormSection title={t('seasons.seasonDetails')}>
                <Stack spacing={3}>
                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      {t('seasons.name')}
                    </div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{season.name}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>{t('seasons.period')}</div>
                    <div>{formatDate(season.startDate)} – {formatDate(season.endDate)}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      {t('seasons.applicationDeadline')}
                    </div>
                    <div>{formatDate(season.applicationDeadline)}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      {t('common.status')}
                    </div>
                    <Badge color={statusVariants[season.status]}>
                      {getStatusLabel(season.status)}
                    </Badge>
                  </div>
                </Stack>
              </FormSection>
            </Card>

            <Card>
              <FormSection title={t('seasons.descriptionAndGuidelines')}>
                {season.description ? (
                  <Paragraph data-size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                    {season.description}
                  </Paragraph>
                ) : (
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('seasons.noDescriptionAdded')}
                  </Paragraph>
                )}
              </FormSection>
            </Card>
          </div>
        </Tabs.Panel>

        {/* Venues Tab */}
        <Tabs.Panel value="venues">
          <Card>
            <SeasonVenueManagement
              seasonId={id!}
              canEdit={season.status === 'draft' || season.status === 'open'}
            />
          </Card>
        </Tabs.Panel>

        {/* Applications Tab */}
        <Tabs.Panel value="applications">
          <Card>
            <SeasonApplicationManagement
              seasonId={id!}
              canProcess={season.status === 'closed'}
            />
          </Card>
        </Tabs.Panel>

        {/* Allocation Tab */}
        {(season.status === 'closed' || season.status === 'active' || season.status === 'completed') && (
          <Tabs.Panel value="allocation">
            <Card>
              <SeasonAllocationManagement
                seasonId={id!}
                seasonStartDate={season.startDate}
                seasonEndDate={season.endDate}
                onAllocationComplete={() => navigate(`/seasons/${id}`)}
              />
            </Card>
          </Tabs.Panel>
        )}
      </Tabs>
    </div>
  );
}
