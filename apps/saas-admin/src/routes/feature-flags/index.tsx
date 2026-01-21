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
  Spinner,
  SettingsIcon,
  CheckCircleIcon,
  XCircleIcon,
  Stack,
  Grid,
  Text,
  EmptyState,
  FilterChips,
  DataPageToolbar,
} from '@xalatechnologies/platform/ui';
import {
  useSaasFeatureFlagsCatalog,
  type FeatureFlagCatalogItem,
  type FeatureFlagCategory,
} from '@xalatechnologies/platform/sdk';
import { useT } from '@xalatechnologies/platform/i18n';

// Category labels will be retrieved via i18n

const categoryColors: Record<FeatureFlagCategory, 'info' | 'success' | 'warning'> = {
  module: 'info',
  integration: 'success',
  policy: 'warning',
};

const statusColors: Record<'active' | 'deprecated', 'success' | 'danger'> = {
  active: 'success',
  deprecated: 'danger',
};

// Status labels will be retrieved via i18n

export function FeatureFlagsCatalogPage() {
  const t = useT();
  
  const categoryLabels: Record<FeatureFlagCategory, string> = {
    module: t('saasAdmin.featureFlagsCatalog.categoryModule'),
    integration: t('saasAdmin.featureFlagsCatalog.categoryIntegration'),
    policy: t('saasAdmin.featureFlagsCatalog.categoryPolicy'),
  };
  
  const statusLabels: Record<'active' | 'deprecated', string> = {
    active: t('saasAdmin.featureFlagsCatalog.statusActive'),
    deprecated: t('saasAdmin.featureFlagsCatalog.statusDeprecated'),
  };

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
          {t('saasAdmin.featureFlagsCatalog.boolean.on')}
        </Badge>
      ) : (
        <Badge color="neutral">
          <XCircleIcon style={{ fontSize: 'var(--ds-font-size-sm)' }} />
          {t('saasAdmin.featureFlagsCatalog.boolean.off')}
        </Badge>
      );
    }
    return <span>{String(flag.defaultValue)}</span>;
  };

  return (
    <Stack direction="column" gap={20}>
      {/* Header */}
      <Stack direction="column" gap={1}>
        <Heading level={2} size="md">
          {t('saasAdmin.featureFlagsCatalog.page.title')}
        </Heading>
        <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('saasAdmin.featureFlagsCatalog.description')}
        </Paragraph>
      </Stack>

      {/* Stats */}
      <Grid
        columns="repeat(auto-fit, minmax(var(--ds-size-20, 150px), 1fr))"
        gap={12}
      >
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Stack direction="column" gap={2}>
            <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('saasAdmin.featureFlagsCatalog.total')}
            </Paragraph>
            <Heading level={3} size="lg" style={{ margin: 0 }}>
              {stats.total}
            </Heading>
          </Stack>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Stack direction="column" gap={2}>
            <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('saasAdmin.featureFlagsCatalog.modules')}
            </Paragraph>
            <Heading level={3} size="lg" style={{ margin: 0 }}>
              {stats.module}
            </Heading>
          </Stack>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Stack direction="column" gap={2}>
            <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('saasAdmin.featureFlagsCatalog.integrations')}
            </Paragraph>
            <Heading level={3} size="lg" style={{ margin: 0 }}>
              {stats.integration}
            </Heading>
          </Stack>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Stack direction="column" gap={2}>
            <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('saasAdmin.featureFlagsCatalog.policies')}
            </Paragraph>
            <Heading level={3} size="lg" style={{ margin: 0 }}>
              {stats.policy}
            </Heading>
          </Stack>
        </Card>
      </Grid>

      {/* Filters */}
      <Card>
        <DataPageToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={t('saasAdmin.featureFlagsCatalog.searchPlaceholder')}
          filters={[
            {
              label: t('saasAdmin.featureFlagsCatalog.category'),
              value: categoryFilter,
              onChange: (value) => setCategoryFilter(value as FeatureFlagCategory | 'all'),
              options: [
                { value: 'all', label: t('saasAdmin.featureFlagsCatalog.categoryAll') },
                { value: 'module', label: categoryLabels.module },
                { value: 'integration', label: categoryLabels.integration },
                { value: 'policy', label: categoryLabels.policy },
              ],
            },
            {
              label: t('saasAdmin.featureFlagsCatalog.status'),
              value: statusFilter,
              onChange: (value) => setStatusFilter(value as 'active' | 'deprecated' | 'all'),
              options: [
                { value: 'all', label: t('saasAdmin.featureFlagsCatalog.statusAll') },
                { value: 'active', label: statusLabels.active },
                { value: 'deprecated', label: statusLabels.deprecated },
              ],
            },
          ]}
        />
      </Card>

      {/* Filter Chips */}
      {(() => {
        const chips = [];
        if (categoryFilter !== 'all') {
          chips.push({
            key: 'category',
            label: `${t('saasAdmin.featureFlagsCatalog.category')}: ${categoryLabels[categoryFilter]}`,
            onRemove: () => setCategoryFilter('all'),
          });
        }
        if (statusFilter !== 'all') {
          chips.push({
            key: 'status',
            label: `${t('saasAdmin.featureFlagsCatalog.status')}: ${statusLabels[statusFilter]}`,
            onRemove: () => setStatusFilter('all'),
          });
        }
        return chips.length > 0 ? (
          <FilterChips
            chips={chips}
            onResetAll={() => {
              setCategoryFilter('all');
              setStatusFilter('all');
              setSearchQuery('');
            }}
            resetLabel={t('dataPage.filterChips.resetAll')}
            activeFiltersLabel={t('dataPage.filterChips.activeFilters')}
          />
        ) : null;
      })()}

      {/* Results */}
      <Card>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner size="lg" aria-label={t('state.loading')} />
          </div>
        ) : filteredFlags.length === 0 ? (
          <EmptyState
            icon={<SettingsIcon size={48} />}
            title={t('saasAdmin.featureFlagsCatalog.empty.page.title')}
            description={
              searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                ? t('dataPage.emptyState.tryDifferentFilters')
                : t('saasAdmin.featureFlagsCatalog.empty.noFlags')
            }
            size="md"
            bordered
          />
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('saasAdmin.featureFlagsCatalog.table.key')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.featureFlagsCatalog.table.name')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.featureFlagsCatalog.table.category')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.featureFlagsCatalog.table.type')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.featureFlagsCatalog.table.defaultValue')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.featureFlagsCatalog.table.status')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.featureFlagsCatalog.table.description')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredFlags.map((flag) => (
                <Table.Row key={flag.id}>
                  <Table.Cell>
                    <Stack direction="horizontal" gap={8} align="center">
                      <SettingsIcon style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
                      <Text
                        size="sm"
                        weight="medium"
                        style={{
                          fontFamily: 'var(--ds-font-family-monospace)',
                        }}
                      >
                        {flag.key}
                      </Text>
                    </Stack>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="sm" weight="medium">
                      {flag.name}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={categoryColors[flag.category]}>{categoryLabels[flag.category]}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text
                      size="sm"
                      color="var(--ds-color-neutral-text-subtle)"
                      style={{
                        fontFamily: 'var(--ds-font-family-monospace)',
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
                        size="sm"
                        color="var(--ds-color-neutral-text-subtle)"
                        style={{
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
                      <Text size="sm" color="var(--ds-color-neutral-text-subtle)">
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
        <Text size="sm" color="var(--ds-color-neutral-text-subtle)">
          {t('saasAdmin.featureFlagsCatalog.results', { showing: filteredFlags.length, total: flags.length })}
        </Text>
      </Stack>
    </Stack>
  );
}

export default FeatureFlagsCatalogPage;
