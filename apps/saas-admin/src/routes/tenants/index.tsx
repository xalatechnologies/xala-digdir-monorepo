/**
 * Tenants List Page
 * SaaS Admin view for listing and managing tenants
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
  EyeIcon,
  PlayIcon,
  PauseIcon,
  HeaderSearch,
} from '@xala/ds';
import {
  useSaasTenants,
  useSuspendSaasTenant,
  useReactivateSaasTenant,
} from '@digilist/client-sdk/hooks';
import type { SaasTenant, SaasTenantStatus } from '@digilist/client-sdk/types';
import { useT } from '@xala/i18n';

const statusLabels: Record<SaasTenantStatus, string> = {
  active: 'Aktiv',
  inactive: 'Inaktiv',
  suspended: 'Suspendert',
  pending: 'Venter',
};

const statusColors: Record<SaasTenantStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  active: 'success',
  inactive: 'warning',
  suspended: 'danger',
  pending: 'info',
};

export function TenantsListPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useT();
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SaasTenantStatus | 'all'>('all');

  // Queries
  const { data: tenantsData, isLoading } = useSaasTenants({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });
  const tenants = tenantsData?.data ?? [];

  // Mutations
  const suspendMutation = useSuspendSaasTenant();
  const reactivateMutation = useReactivateSaasTenant();

  // Filter tenants by search if needed (in case API doesn't support it)
  const filteredTenants = useMemo(() => {
    if (!searchQuery) return tenants;
    const query = searchQuery.toLowerCase();
    return tenants.filter(
      (tenant) =>
        tenant.name.toLowerCase().includes(query) ||
        tenant.slug.toLowerCase().includes(query) ||
        (tenant.domain && tenant.domain.toLowerCase().includes(query))
    );
  }, [tenants, searchQuery]);

  // Handlers
  const handleSuspend = async (tenant: SaasTenant) => {
    if (confirm(`Er du sikker på at du vil suspendere ${tenant.name}?`)) {
      await suspendMutation.mutateAsync({
        tenantId: tenant.id,
        data: { reason: 'Suspended by SaaS Admin', notifyAdmins: true },
      });
    }
  };

  const handleReactivate = async (tenant: SaasTenant) => {
    await reactivateMutation.mutateAsync(tenant.id);
  };

  const handleViewDetail = (tenant: SaasTenant) => {
    navigate(`/tenants/${tenant.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={2} data-size="md">
            Tenants
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
          >
            Administrer tenants, abonnementer og tilganger
          </Paragraph>
        </div>
        <Link to="/tenants/new">
          <Button type="button">
            <PlusIcon />
            Ny tenant
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', minWidth: '200px' }}>
            <HeaderSearch
              placeholder="Søk etter tenant..."
              value={searchQuery}
              onSearchChange={(value) => setSearchQuery(value)}
            />
          </div>

          <Dropdown.TriggerContext>
            <Dropdown.Trigger variant="secondary" data-size="sm">
              <FilterIcon />
              Status: {statusFilter === 'all' ? 'Alle' : statusLabels[statusFilter]}
            </Dropdown.Trigger>
            <Dropdown>
              <Dropdown.List>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('all')}>Alle</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('active')}>Aktiv</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('inactive')}>Inaktiv</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('suspended')}>Suspendert</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('pending')}>Venter</Dropdown.Button>
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
            <Spinner data-size="lg" aria-label="Laster..." />
          </div>
        ) : filteredTenants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
            <BuildingIcon
              style={{
                fontSize: 'var(--ds-font-size-heading-lg)',
                color: 'var(--ds-color-neutral-text-subtle)',
                marginBottom: 'var(--ds-spacing-3)',
              }}
            />
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Ingen tenants funnet
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {searchQuery || statusFilter !== 'all'
                ? 'Prøv å endre søkekriteriene'
                : 'Opprett din første tenant for å komme i gang'}
            </Paragraph>
            {!searchQuery && statusFilter === 'all' && (
              <Link to="/tenants/new">
                <Button data-size="sm" style={{ marginTop: 'var(--ds-spacing-4)' }} type="button">
                  <PlusIcon />
                  Ny tenant
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('common.name')}</Table.HeaderCell>
                <Table.HeaderCell>Slug</Table.HeaderCell>
                <Table.HeaderCell>Domene</Table.HeaderCell>
                <Table.HeaderCell>Plan</Table.HeaderCell>
                <Table.HeaderCell>{t('common.status')}</Table.HeaderCell>
                <Table.HeaderCell>Opprettet</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '80px' }}>Handlinger</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredTenants.map((tenant) => (
                <Table.Row
                  key={tenant.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleViewDetail(tenant)}
                >
                  <Table.Cell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                      <BuildingIcon style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
                      <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{tenant.name}</div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div
                      style={{
                        fontFamily: 'var(--ds-font-family-monospace)',
                        fontSize: 'var(--ds-font-size-sm)',
                      }}
                    >
                      {tenant.slug}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {tenant.domain ? (
                      <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>{tenant.domain}</div>
                    ) : (
                      <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>—</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {tenant.subscriptionPlanName ? (
                      <Badge color="info">{tenant.subscriptionPlanName}</Badge>
                    ) : (
                      <Badge color="neutral">Ingen plan</Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={statusColors[tenant.status]}>{statusLabels[tenant.status]}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>{formatDate(tenant.createdAt)}</div>
                  </Table.Cell>
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <Dropdown.TriggerContext>
                      <Dropdown.Trigger variant="tertiary" data-size="sm">
                        <MoreVerticalIcon />
                      </Dropdown.Trigger>
                      <Dropdown>
                        <Dropdown.List>
                          <Dropdown.Item>
                            <Dropdown.Button onClick={() => handleViewDetail(tenant)}>
                              <EyeIcon />
                              Vis detaljer
                            </Dropdown.Button>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <Dropdown.Button onClick={() => navigate(`/tenants/${tenant.id}/edit`)}>
                              <EditIcon />
                              Rediger
                            </Dropdown.Button>
                          </Dropdown.Item>
                          {tenant.status === 'active' && (
                            <Dropdown.Item>
                              <Dropdown.Button onClick={() => handleSuspend(tenant)} data-color="danger">
                                <PauseIcon />
                                Suspender
                              </Dropdown.Button>
                            </Dropdown.Item>
                          )}
                          {tenant.status === 'suspended' && (
                            <Dropdown.Item>
                              <Dropdown.Button onClick={() => handleReactivate(tenant)}>
                                <PlayIcon />
                                Reaktiver
                              </Dropdown.Button>
                            </Dropdown.Item>
                          )}
                          {tenant.licenseKeyFingerprint ? (
                            <Dropdown.Item>
                              <Dropdown.Button onClick={() => navigate(`/tenants/${tenant.id}/license`)}>
                                <CheckCircleIcon />
                                Lisensnøkkel
                              </Dropdown.Button>
                            </Dropdown.Item>
                          ) : (
                            <Dropdown.Item>
                              <Dropdown.Button onClick={() => navigate(`/tenants/${tenant.id}/license`)}>
                                <XCircleIcon />
                                Opprett lisensnøkkel
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

      {/* Pagination info */}
      {tenantsData?.meta && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'var(--ds-color-neutral-text-subtle)',
            fontSize: 'var(--ds-font-size-sm)',
          }}
        >
          <span>
            Viser {filteredTenants.length} av {tenantsData.meta.total} tenants
          </span>
          <span>
            Side {tenantsData.meta.page} av {tenantsData.meta.totalPages}
          </span>
        </div>
      )}
    </div>
  );
}

export default TenantsListPage;
