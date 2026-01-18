/**
 * Access Grants Page
 * Commune Admin view for managing organization access to rental objects
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ShieldCheckIcon,
  EyeIcon,
  TrashIcon,
  HeaderSearch,
} from '@xala/ds';
import {
  useAccessGrants,
  useRevokeAccess,
  type AccessGrantWithDetails,
  type AccessGrantStatus,
} from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

// Status colors mapping
const statusColors: Record<AccessGrantStatus, 'success' | 'danger' | 'warning'> = {
  active: 'success',
  revoked: 'danger',
  expired: 'warning',
};

// Helper function to get status labels using translation
const getStatusLabel = (t: (key: string) => string, status: AccessGrantStatus): string => {
  const labels: Record<AccessGrantStatus, string> = {
    active: t('accessGrants.status.active'),
    revoked: t('accessGrants.status.revoked'),
    expired: t('accessGrants.status.expired'),
  };
  return labels[status];
};

export function AccessGrantsPage() {
  const t = useT();
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AccessGrantStatus | 'all'>('all');

  // Queries
  const { data: grantsData, isLoading } = useAccessGrants({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const grants = (grantsData?.data ?? []) as AccessGrantWithDetails[];

  // Mutations
  const revokeAccessMutation = useRevokeAccess();

  // Filter grants by search query
  const filteredGrants = useMemo(() => {
    if (!searchQuery) return grants;
    const query = searchQuery.toLowerCase();
    return grants.filter(
      (grant) =>
        grant.organization?.name?.toLowerCase().includes(query) ||
        grant.rentalObject?.name?.toLowerCase().includes(query)
    );
  }, [grants, searchQuery]);

  // Handlers
  const handleRevoke = async (id: string) => {
    if (confirm(t('accessGrants.confirmRevoke'))) {
      await revokeAccessMutation.mutateAsync({ id, reason: t('accessGrants.revokeReason') });
    }
  };

  const handleViewDetail = (grant: AccessGrantWithDetails) => {
    navigate(`/organizations/${grant.organizationId}`);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '\u2014';
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
            {t('accessGrants.page.title')}
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
          >
            {t('accessGrants.page.description')}
          </Paragraph>
        </div>
        <Button type="button" onClick={() => navigate('/access-grants/new')}>
          <PlusIcon />
          {t('accessGrants.newGrant')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', minWidth: '200px' }}>
            <HeaderSearch
              placeholder={t('accessGrants.searchPlaceholder')}
              value={searchQuery}
              onSearchChange={(value) => setSearchQuery(value)}
            />
          </div>

          <Dropdown.TriggerContext>
            <Dropdown.Trigger variant="secondary" data-size="sm">
              <FilterIcon />
              {t('accessGrants.statusLabel')}: {statusFilter === 'all' ? t('accessGrants.status.all') : getStatusLabel(t, statusFilter)}
            </Dropdown.Trigger>
            <Dropdown>
              <Dropdown.List>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('all')}>{t('accessGrants.status.all')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('active')}>{t('accessGrants.status.active')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('revoked')}>{t('accessGrants.status.revoked')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('expired')}>{t('accessGrants.status.expired')}</Dropdown.Button>
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
            <Spinner data-size="lg" aria-label={t('state.loading')} />
          </div>
        ) : filteredGrants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
            <ShieldCheckIcon
              style={{
                fontSize: 'var(--ds-font-size-heading-lg)',
                color: 'var(--ds-color-neutral-text-subtle)',
                marginBottom: 'var(--ds-spacing-3)',
              }}
            />
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              {t('accessGrants.noGrantsFound')}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {searchQuery || statusFilter !== 'all'
                ? t('accessGrants.tryDifferentSearch')
                : t('accessGrants.createFirstGrant')}
            </Paragraph>
            {!searchQuery && statusFilter === 'all' && (
              <Button
                data-size="sm"
                style={{ marginTop: 'var(--ds-spacing-4)' }}
                type="button"
                onClick={() => navigate('/access-grants/new')}
              >
                <PlusIcon />
                {t('accessGrants.newGrant')}
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('accessGrants.table.organization')}</Table.HeaderCell>
                <Table.HeaderCell>{t('accessGrants.table.rentalObject')}</Table.HeaderCell>
                <Table.HeaderCell>{t('accessGrants.table.status')}</Table.HeaderCell>
                <Table.HeaderCell>{t('accessGrants.table.grantedAt')}</Table.HeaderCell>
                <Table.HeaderCell>{t('accessGrants.table.expiresAt')}</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '80px' }}>{t('accessGrants.table.actions')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredGrants.map((grant) => (
                <Table.Row
                  key={grant.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleViewDetail(grant)}
                >
                  <Table.Cell>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {grant.organization?.name ?? '\u2014'}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                      {grant.rentalObject?.name ?? '\u2014'}
                    </div>
                    {grant.rentalObject?.type && (
                      <div
                        style={{
                          fontSize: 'var(--ds-font-size-xs)',
                          color: 'var(--ds-color-neutral-text-subtle)',
                        }}
                      >
                        {grant.rentalObject.type}
                      </div>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={statusColors[grant.status]}>{getStatusLabel(t, grant.status)}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>{formatDate(grant.grantedAt)}</div>
                    {grant.grantedByUser?.name && (
                      <div
                        style={{
                          fontSize: 'var(--ds-font-size-xs)',
                          color: 'var(--ds-color-neutral-text-subtle)',
                        }}
                      >
                        {t('accessGrants.table.grantedBy', { name: grant.grantedByUser.name })}
                      </div>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {grant.expiresAt ? (
                      <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>{formatDate(grant.expiresAt)}</div>
                    ) : (
                      <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {t('accessGrants.table.noExpiry')}
                      </div>
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
                            <Dropdown.Button onClick={() => handleViewDetail(grant)}>
                              <EyeIcon />
                              {t('accessGrants.action.viewOrganization')}
                            </Dropdown.Button>
                          </Dropdown.Item>
                          {grant.status === 'active' && (
                            <Dropdown.Item>
                              <Dropdown.Button onClick={() => handleRevoke(grant.id)} data-color="danger">
                                <TrashIcon />
                                {t('accessGrants.action.revokeAccess')}
                              </Dropdown.Button>
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
