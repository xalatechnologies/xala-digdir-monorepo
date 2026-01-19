/**
 * Organizations List Page
 * Admin view for listing and managing organizations
 */

import { useState, useMemo } from 'react';
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
  FilterIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingIcon,
  EditIcon,
  TrashIcon,
  ShieldCheckIcon,
  EyeIcon,
  HeaderSearch,
  PageHeader,
} from '@xala/ds';
import {
  useOrganizations,
  useDeleteOrganization,
  useVerifyOrganization,
  type Organization,
  type ActorType,
  type OrganizationStatus,
} from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

// Actor type labels are now provided via translation function
const getActorTypeLabel = (t: (key: string) => string, type: ActorType): string => {
  return t(`organizations.actorType.${type}`);
};

const actorTypeColors: Record<ActorType, 'neutral' | 'info' | 'success' | 'warning'> = {
  private: 'neutral',
  business: 'info',
  sports_club: 'success',
  youth_organization: 'warning',
  school: 'info',
  municipality: 'success',
};

const statusColors: Record<OrganizationStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  inactive: 'warning',
  suspended: 'danger',
};

export function OrganizationsListPage() {
   
  const t = useT();
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('all');
  const [actorTypeFilter, setActorTypeFilter] = useState<ActorType | 'all'>('all');

  // Queries
  const { data: orgsData, isLoading } = useOrganizations({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const orgs = orgsData?.data ?? [];

  // Mutations
  const deleteOrgMutation = useDeleteOrganization();
  const verifyOrgMutation = useVerifyOrganization();

  // Filter organizations by actor type
  const filteredOrgs = useMemo(() => {
    if (actorTypeFilter === 'all') return orgs;
    return orgs.filter(org => org.actorType === actorTypeFilter);
  }, [orgs, actorTypeFilter]);

  // Handlers
  const handleDelete = async (id: string) => {
    if (confirm(t('organizations.deleteConfirm'))) {
      await deleteOrgMutation.mutateAsync(id);
    }
  };

  const handleVerify = async (id: string) => {
    await verifyOrgMutation.mutateAsync(id);
  };

  const handleViewDetail = (org: Organization) => {
    navigate(`/organizations/${org.id}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
      {/* Header */}
      <PageHeader
        title={t('organizations.page.list.title')}
        subtitle={t('organizations.subtitleAdmin')}
        actions={
          <Link to="/organizations/new">
            <Button type="button">
              <PlusIcon />
              {t('organizations.new')}
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <Card>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', minWidth: '200px' }}>
            <HeaderSearch
              placeholder={t('organizations.searchPlaceholder')}
              value={searchQuery}
              onSearchChange={(value) => setSearchQuery(value)}
            />
          </div>

          <Dropdown.TriggerContext>
            <Dropdown.Trigger variant="secondary" data-size="sm">
              <FilterIcon />
              {t('organizations.filter.status')}: {statusFilter === 'all' ? t('organizations.filter.all') : t(`organizations.${statusFilter}`)}
            </Dropdown.Trigger>
            <Dropdown>
              <Dropdown.List>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('all')}>{t('organizations.filter.all')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('active')}>{t('organizations.active')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('inactive')}>{t('organizations.inactive')}</Dropdown.Button>
                </Dropdown.Item>
              </Dropdown.List>
            </Dropdown>
          </Dropdown.TriggerContext>

          <Dropdown.TriggerContext>
            <Dropdown.Trigger variant="secondary" data-size="sm">
              <FilterIcon />
              {t('organizations.filter.type')}: {actorTypeFilter === 'all' ? t('organizations.filter.all') : getActorTypeLabel(t, actorTypeFilter)}
            </Dropdown.Trigger>
            <Dropdown>
              <Dropdown.List>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setActorTypeFilter('all')}>{t('organizations.filter.all')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setActorTypeFilter('private')}>{t('organizations.actorType.private')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setActorTypeFilter('business')}>{t('organizations.actorType.business')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setActorTypeFilter('sports_club')}>{t('organizations.actorType.sports_club')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setActorTypeFilter('youth_organization')}>{t('organizations.actorType.youth_organization')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setActorTypeFilter('school')}>{t('organizations.actorType.school')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setActorTypeFilter('municipality')}>{t('organizations.actorType.municipality')}</Dropdown.Button>
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
        ) : filteredOrgs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
            <BuildingIcon style={{ fontSize: 'var(--ds-font-size-heading-lg)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }} />
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              {t('organizations.notFound')}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {searchQuery || statusFilter !== 'all' || actorTypeFilter !== 'all'
                ? t('organizations.tryDifferentSearch')
                : t('organizations.createFirst')}
            </Paragraph>
            {!searchQuery && statusFilter === 'all' && actorTypeFilter === 'all' && (
              <Link to="/organizations/new">
                <Button data-size="sm" style={{ marginTop: 'var(--ds-spacing-4)' }} type="button">
                  <PlusIcon />
                  {t('organizations.new')}
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('organizations.table.name')}</Table.HeaderCell>
                <Table.HeaderCell>{t('organizations.table.type')}</Table.HeaderCell>
                <Table.HeaderCell>{t('organizations.table.orgNumber')}</Table.HeaderCell>
                <Table.HeaderCell>{t('organizations.table.contact')}</Table.HeaderCell>
                <Table.HeaderCell>{t('organizations.table.status')}</Table.HeaderCell>
                <Table.HeaderCell>{t('organizations.table.verified')}</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '80px' }}>{t('organizations.table.actions')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredOrgs.map(org => (
                <Table.Row key={org.id} style={{ cursor: 'pointer' }} onClick={() => handleViewDetail(org)}>
                  <Table.Cell>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{org.name}</div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={actorTypeColors[org.actorType]}>
                      {getActorTypeLabel(t, org.actorType)}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontFamily: 'var(--ds-font-family-monospace)', fontSize: 'var(--ds-font-size-sm)' }}>
                      {org.organizationNumber || '—'}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {org.email || org.phone ? (
                      <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                        {org.email && <div>{org.email}</div>}
                        {org.phone && <div>{org.phone}</div>}
                      </div>
                    ) : (
                      '—'
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={statusColors[org.status]}>
                      {t(`organizations.${org.status}`)}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {org.verified ? (
                      <CheckCircleIcon style={{ color: 'var(--ds-color-success-text-default)' }} />
                    ) : (
                      <XCircleIcon style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
                    )}
                  </Table.Cell>
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <Dropdown.TriggerContext>
                      <Dropdown.Trigger variant="tertiary" data-size="sm">
                        <MoreVerticalIcon />
                      </Dropdown.Trigger>
                      <Dropdown>
                        <Dropdown.List>
                          <Dropdown.Item>
                            <Dropdown.Button onClick={() => handleViewDetail(org)}>
                              <EyeIcon />
                              {t('organizations.viewDetails')}
                            </Dropdown.Button>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <Dropdown.Button onClick={() => navigate(`/organizations/${org.id}/edit`)}>
                              <EditIcon />{t("action.edit")}</Dropdown.Button>
                          </Dropdown.Item>
                          {!org.verified && (
                            <Dropdown.Item>
                              <Dropdown.Button onClick={() => handleVerify(org.id)}>
                                <ShieldCheckIcon />
                                {t('organizations.verify')}
                              </Dropdown.Button>
                            </Dropdown.Item>
                          )}
                          <Dropdown.Item>
                            <Dropdown.Button onClick={() => handleDelete(org.id)} data-color="danger">
                              <TrashIcon />{t("action.delete")}</Dropdown.Button>
                          </Dropdown.Item>
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
