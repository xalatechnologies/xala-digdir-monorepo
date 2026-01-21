/**
 * Seasons List Page
 * Admin view for managing seasonal lease seasons
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Table,
  Dropdown,
  Spinner,
  PlusIcon,
  MoreVerticalIcon,
  CalendarIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  HeaderSearch,
} from '@xalatechnologies/platform/ui';
import { useSeasons, useDeleteSeason } from '@digilist/client-sdk/hooks';
import type { SeasonStatus } from '@digilist/client-sdk/types';
// import { StatusBadge } from '../../components/shared';
import { useT } from '@xalatechnologies/platform/i18n';

const statusVariants: Record<SeasonStatus, 'neutral' | 'info' | 'warning' | 'success'> = {
  draft: 'neutral',
  open: 'info',
  closed: 'warning',
  active: 'success',
  completed: 'neutral',
  cancelled: 'neutral',
};

export function SeasonsListPage() {
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
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SeasonStatus | 'all'>('all');

  // Queries
  const { data: seasonsData, isLoading } = useSeasons(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  );
  const seasons = seasonsData?.data ?? [];

  // Mutations
  const deleteSeasonMutation = useDeleteSeason();

  // Filtered seasons
  const filteredSeasons = seasons.filter(season => {
    if (!searchQuery) return true;
    return season.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Handlers
  const handleDelete = async (id: string) => {
    if (confirm(t('seasons.confirmDelete'))) {
      await deleteSeasonMutation.mutateAsync(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={2} data-size="md">
            {t('seasons.pageTitle')}
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
          >
            {t('seasons.pageSubtitle')}
          </Paragraph>
        </div>
        <Link to="/seasons/new">
          <Button type="button">
            <PlusIcon />
            {t('seasons.newSeason')}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', minWidth: '200px' }}>
            <HeaderSearch
              placeholder={t('seasons.searchPlaceholder')}
              value={searchQuery}
              onSearchChange={(value) => setSearchQuery(value)}
            />
          </div>

          <Dropdown.TriggerContext>
            <Dropdown.Trigger variant="secondary" data-size="sm">
              {t('label.status')}: {statusFilter === 'all' ? t('seasons.statusAll') : getStatusLabel(statusFilter)}
            </Dropdown.Trigger>
            <Dropdown>
              <Dropdown.List>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('all')}>{t('seasons.statusAll')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('draft')}>{t('seasons.status.draft')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('open')}>{t('seasons.status.open')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('closed')}>{t('seasons.status.closed')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('active')}>{t('seasons.status.active')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('completed')}>{t('seasons.status.completed')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('cancelled')}>{t('seasons.status.cancelled')}</Dropdown.Button>
                </Dropdown.Item>
              </Dropdown.List>
            </Dropdown>
          </Dropdown.TriggerContext>
        </div>
      </Card>

      {/* Results */}
      <Card>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner data-size="lg" aria-label={t("state.loading")} />
          </div>
        ) : filteredSeasons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
            <CalendarIcon style={{ fontSize: 'var(--ds-font-size-heading-lg)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }} />
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              {t('seasons.noSeasonsFound')}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {searchQuery || statusFilter !== 'all'
                ? t('seasons.tryDifferentCriteria')
                : t('seasons.createFirstSeason')}
            </Paragraph>
            {!searchQuery && statusFilter === 'all' && (
              <Link to="/seasons/new">
                <Button data-size="sm" style={{ marginTop: 'var(--ds-spacing-4)' }} type="button">
                  <PlusIcon />
                  {t('seasons.newSeason')}
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('seasons.tableHeaderName')}</Table.HeaderCell>
                <Table.HeaderCell>{t('seasons.period')}</Table.HeaderCell>
                <Table.HeaderCell>{t('seasons.tableHeaderApplicationDeadline')}</Table.HeaderCell>
                <Table.HeaderCell>{t('seasons.tableHeaderStatus')}</Table.HeaderCell>
                <Table.HeaderCell>{t('seasons.tableHeaderVenues')}</Table.HeaderCell>
                <Table.HeaderCell>{t('seasons.tableHeaderApplications')}</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '80px' }}>{t('seasons.tableHeaderActions')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredSeasons.map(season => (
                <Table.Row key={season.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/seasons/${season.id}`)}>
                  <Table.Cell>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{season.name}</div>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                      {formatDate(season.startDate)} – {formatDate(season.endDate)}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                      {formatDate(season.applicationDeadline)}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={statusVariants[season.status]}>
                      {getStatusLabel(season.status)}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                      {season.venueCount || 0} {t('seasons.venues')}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                      {season.applicationCount || 0} {t('seasons.applications')}
                    </div>
                  </Table.Cell>
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <Dropdown.TriggerContext>
                      <Dropdown.Trigger variant="tertiary" data-size="sm">
                        <MoreVerticalIcon />
                      </Dropdown.Trigger>
                      <Dropdown>
                        <Dropdown.List>
                          <Dropdown.Item>
                            <Dropdown.Button onClick={() => navigate(`/seasons/${season.id}`)}>
                              <EyeIcon />
                              {t('seasons.viewDetails')}
                            </Dropdown.Button>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <Dropdown.Button onClick={() => navigate(`/seasons/${season.id}/edit`)}>
                              <EditIcon />{t("action.edit")}</Dropdown.Button>
                          </Dropdown.Item>
                          {season.status === 'draft' && (
                            <Dropdown.Item>
                              <Dropdown.Button onClick={() => handleDelete(season.id)} data-color="danger">
                                <TrashIcon />{t("action.delete")}</Dropdown.Button>
                            </Dropdown.Item>
                          )}
                        </Dropdown.List>
                      </Dropdown>
                    </Dropdown.TriggerContext>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>
    </div>
  );
}
