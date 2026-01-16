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
  Stack,
  Grid,
  Text,
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
          <CheckCircleIcon style={{ fontSize: 'var(--ds-font-size-sm)' }} />
          På
        </Badge>
      ) : (
        <Badge color="neutral">
          <XCircleIcon style={{ fontSize: 'var(--ds-font-size-sm)' }} />
          Av
        </Badge>
      );
    }
    return <span>{String(flag.defaultValue)}</span>;
  };

  return (
    <Stack direction="column" gap={20}>
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
      <Grid
        columns="repeat(auto-fit, minmax(var(--ds-size-20, 150px), 1fr))"
        gap={12}
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
      </Grid>

      {/* Filters */}
      <Card>
        <Stack direction="horizontal" gap={12} wrap align="center">
          <div style={{ flex: '1 1 var(--ds-size-container-sm, 300px)', minWidth: 'var(--ds-size-20, 200px)' }}>
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
        </Stack>
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
                <Table.HeaderCell>Navn</Table.HeaderCell>
                <Table.HeaderCell>Kategori</Table.HeaderCell>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell>Standardverdi</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Beskrivelse</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredFlags.map((flag) => (
                <Table.Row key={flag.id}>
                  <Table.Cell>
                    <Stack direction="horizontal" gap={8} align="center">
                      <SettingsIcon style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
                      <Text
                        data-size="sm"
                        style={{
                          fontFamily: 'var(--ds-font-family-monospace)',
                          fontWeight: 'var(--ds-font-weight-medium)',
                        }}
                      >
                        {flag.key}
                      </Text>
                    </Stack>
                  </Table.Cell>
                  <Table.Cell>
                    <Text data-size="sm" style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {flag.name}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={categoryColors[flag.category]}>{categoryLabels[flag.category]}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text
                      data-size="sm"
                      style={{
                        fontFamily: 'var(--ds-font-family-monospace)',
                        color: 'var(--ds-color-neutral-text-subtle)',
                      }}
                    >
                      {flag.type}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>{formatDefaultValue(flag)}</Table.Cell>
                  <Table.Cell>
                    <Badge color={statusColors[flag.status]}>{statusLabels[flag.status]}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {flag.description ? (
                      <Text
                        data-size="sm"
                        style={{
                          color: 'var(--ds-color-neutral-text-subtle)',
                          maxWidth: 'var(--ds-size-container-sm, 300px)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={flag.description}
                      >
                        {flag.description}
                      </Text>
                    ) : (
                      <Text data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                        —
                      </Text>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>

      {/* Results info */}
      <Stack direction="horizontal" justify="end" align="center">
        <Text data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Viser {filteredFlags.length} av {flags.length} feature flags
        </Text>
      </Stack>
    </Stack>
  );
}

export default FeatureFlagsCatalogPage;
