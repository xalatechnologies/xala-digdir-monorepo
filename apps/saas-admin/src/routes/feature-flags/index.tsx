/**
 * Feature Flags Catalog Page
 * SaaS Admin view for listing all available feature flags
 */

import { useState, useMemo } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Badge,
  Table,
  Dropdown,
  Spinner,
  FilterIcon,
  SettingsIcon,
  CheckCircleIcon,
  XCircleIcon,
  HeaderSearch,
} from '@xala/ds';
import { useSaasFeatureFlagsCatalog } from '@digilist/client-sdk/hooks';
import type { FeatureFlagCatalogItem, FeatureFlagCategory } from '@digilist/client-sdk/types';
import { useT } from '@xala/i18n';

const categoryLabels: Record<FeatureFlagCategory, string> = {
  module: 'Modul',
  integration: 'Integrasjon',
  policy: 'Policy',
};

const categoryColors: Record<FeatureFlagCategory, 'info' | 'success' | 'warning'> = {
  module: 'info',
  integration: 'success',
  policy: 'warning',
};

const statusColors: Record<'active' | 'deprecated', 'success' | 'danger'> = {
  active: 'success',
  deprecated: 'danger',
};

const statusLabels: Record<'active' | 'deprecated', string> = {
  active: 'Aktiv',
  deprecated: 'Utgått',
};

export function FeatureFlagsCatalogPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useT();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FeatureFlagCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'deprecated' | 'all'>('all');

  // Queries
  const { data: flagsData, isLoading } = useSaasFeatureFlagsCatalog({
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const flags = flagsData?.data ?? [];

  // Filter flags by search
  const filteredFlags = useMemo(() => {
    if (!searchQuery) return flags;
    const query = searchQuery.toLowerCase();
    return flags.filter(
      (flag) =>
        flag.key.toLowerCase().includes(query) ||
        flag.name.toLowerCase().includes(query) ||
        (flag.description && flag.description.toLowerCase().includes(query))
    );
  }, [flags, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const allFlags = flagsData?.data ?? [];
    return {
      total: allFlags.length,
      module: allFlags.filter((f) => f.category === 'module').length,
      integration: allFlags.filter((f) => f.category === 'integration').length,
      policy: allFlags.filter((f) => f.category === 'policy').length,
    };
  }, [flagsData?.data]);

  const formatDefaultValue = (flag: FeatureFlagCatalogItem) => {
    if (flag.type === 'boolean') {
      return flag.defaultValue ? (
        <Badge color="success">
          <CheckCircleIcon style={{ fontSize: '0.875rem' }} />
          På
        </Badge>
      ) : (
        <Badge color="neutral">
          <XCircleIcon style={{ fontSize: '0.875rem' }} />
          Av
        </Badge>
      );
    }
    return <span>{String(flag.defaultValue)}</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={2} data-size="md">
            Feature Flags
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
          >
            Katalog over alle tilgjengelige feature flags i plattformen
          </Paragraph>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
          >
            Totalt
          </Paragraph>
          <Heading level={3} data-size="lg" style={{ margin: 0 }}>
            {stats.total}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
          >
            Moduler
          </Paragraph>
          <Heading level={3} data-size="lg" style={{ margin: 0 }}>
            {stats.module}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
          >
            Integrasjoner
          </Paragraph>
          <Heading level={3} data-size="lg" style={{ margin: 0 }}>
            {stats.integration}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
          >
            Policies
          </Paragraph>
          <Heading level={3} data-size="lg" style={{ margin: 0 }}>
            {stats.policy}
          </Heading>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', minWidth: '200px' }}>
            <HeaderSearch
              placeholder="Søk etter flag..."
              value={searchQuery}
              onSearchChange={(value) => setSearchQuery(value)}
            />
          </div>

          <Dropdown.TriggerContext>
            <Dropdown.Trigger variant="secondary" data-size="sm">
              <FilterIcon />
              Kategori: {categoryFilter === 'all' ? 'Alle' : categoryLabels[categoryFilter]}
            </Dropdown.Trigger>
            <Dropdown>
              <Dropdown.List>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setCategoryFilter('all')}>Alle</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setCategoryFilter('module')}>Modul</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setCategoryFilter('integration')}>Integrasjon</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setCategoryFilter('policy')}>Policy</Dropdown.Button>
                </Dropdown.Item>
              </Dropdown.List>
            </Dropdown>
          </Dropdown.TriggerContext>

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
                  <Dropdown.Button onClick={() => setStatusFilter('deprecated')}>Utgått</Dropdown.Button>
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
        ) : filteredFlags.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
            <SettingsIcon
              style={{
                fontSize: 'var(--ds-font-size-heading-lg)',
                color: 'var(--ds-color-neutral-text-subtle)',
                marginBottom: 'var(--ds-spacing-3)',
              }}
            />
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Ingen feature flags funnet
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Prøv å endre søkekriteriene'
                : 'Ingen feature flags er definert i plattformen'}
            </Paragraph>
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Nøkkel</Table.HeaderCell>
                <Table.HeaderCell>{t('common.name')}</Table.HeaderCell>
                <Table.HeaderCell>Kategori</Table.HeaderCell>
                <Table.HeaderCell>{t('common.type')}</Table.HeaderCell>
                <Table.HeaderCell>Standardverdi</Table.HeaderCell>
                <Table.HeaderCell>{t('common.status')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.description')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredFlags.map((flag) => (
                <Table.Row key={flag.id}>
                  <Table.Cell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                      <SettingsIcon style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
                      <div
                        style={{
                          fontFamily: 'var(--ds-font-family-monospace)',
                          fontSize: 'var(--ds-font-size-sm)',
                          fontWeight: 'var(--ds-font-weight-medium)',
                        }}
                      >
                        {flag.key}
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{flag.name}</div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={categoryColors[flag.category]}>{categoryLabels[flag.category]}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div
                      style={{
                        fontFamily: 'var(--ds-font-family-monospace)',
                        fontSize: 'var(--ds-font-size-sm)',
                        color: 'var(--ds-color-neutral-text-subtle)',
                      }}
                    >
                      {flag.type}
                    </div>
                  </Table.Cell>
                  <Table.Cell>{formatDefaultValue(flag)}</Table.Cell>
                  <Table.Cell>
                    <Badge color={statusColors[flag.status]}>{statusLabels[flag.status]}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {flag.description ? (
                      <div
                        style={{
                          fontSize: 'var(--ds-font-size-sm)',
                          color: 'var(--ds-color-neutral-text-subtle)',
                          maxWidth: '300px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={flag.description}
                      >
                        {flag.description}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>—</span>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>

      {/* Results info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          color: 'var(--ds-color-neutral-text-subtle)',
          fontSize: 'var(--ds-font-size-sm)',
        }}
      >
        <span>
          Viser {filteredFlags.length} av {flags.length} feature flags
        </span>
      </div>
    </div>
  );
}

export default FeatureFlagsCatalogPage;
