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
        <Heading level={2} data-size="md">
          {t('saasAdmin.featureFlagsCatalog.title')}
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
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
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('saasAdmin.featureFlagsCatalog.total')}
            </Paragraph>
            <Heading level={3} data-size="lg" style={{ margin: 0 }}>
              {stats.total}
            </Heading>
          </Stack>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Stack direction="column" gap={2}>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('saasAdmin.featureFlagsCatalog.modules')}
            </Paragraph>
            <Heading level={3} data-size="lg" style={{ margin: 0 }}>
              {stats.module}
            </Heading>
          </Stack>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Stack direction="column" gap={2}>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('saasAdmin.featureFlagsCatalog.integrations')}
            </Paragraph>
            <Heading level={3} data-size="lg" style={{ margin: 0 }}>
              {stats.integration}
            </Heading>
          </Stack>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Stack direction="column" gap={2}>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('saasAdmin.featureFlagsCatalog.policies')}
            </Paragraph>
            <Heading level={3} data-size="lg" style={{ margin: 0 }}>
              {stats.policy}
            </Heading>
          </Stack>
        </Card>
      </Grid>

      {/* Filters */}
      <Card>
        <Stack direction="horizontal" gap={12} wrap align="center">
          <div style={{ flex: '1 1 var(--ds-size-container-sm, 300px)', minWidth: 'var(--ds-size-20, 200px)' }}>
            <HeaderSearch
              placeholder={t('saasAdmin.featureFlagsCatalog.searchPlaceholder')}
              value={searchQuery}
              onSearchChange={(value) => setSearchQuery(value)}
            />
          </div>

          <Dropdown.TriggerContext>
            <Dropdown.Trigger variant="secondary" data-size="sm">
              <FilterIcon />
              {t('saasAdmin.featureFlagsCatalog.category')}: {categoryFilter === 'all' ? t('saasAdmin.featureFlagsCatalog.categoryAll') : categoryLabels[categoryFilter]}
            </Dropdown.Trigger>
            <Dropdown>
              <Dropdown.List>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setCategoryFilter('all')}>{t('saasAdmin.featureFlagsCatalog.categoryAll')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setCategoryFilter('module')}>{t('saasAdmin.featureFlagsCatalog.categoryModule')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setCategoryFilter('integration')}>{t('saasAdmin.featureFlagsCatalog.categoryIntegration')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setCategoryFilter('policy')}>{t('saasAdmin.featureFlagsCatalog.categoryPolicy')}</Dropdown.Button>
                </Dropdown.Item>
              </Dropdown.List>
            </Dropdown>
          </Dropdown.TriggerContext>

          <Dropdown.TriggerContext>
            <Dropdown.Trigger variant="secondary" data-size="sm">
              <FilterIcon />
              {t('saasAdmin.featureFlagsCatalog.status')}: {statusFilter === 'all' ? t('saasAdmin.featureFlagsCatalog.statusAll') : statusLabels[statusFilter]}
            </Dropdown.Trigger>
            <Dropdown>
              <Dropdown.List>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('all')}>{t('saasAdmin.featureFlagsCatalog.statusAll')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('active')}>{t('saasAdmin.featureFlagsCatalog.statusActive')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('deprecated')}>{t('saasAdmin.featureFlagsCatalog.statusDeprecated')}</Dropdown.Button>
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
            <Spinner data-size="lg" aria-label={t('saasAdmin.featureFlagsCatalog.loading')} />
          </div>
        ) : filteredFlags.length === 0 ? (
          <Stack direction="horizontal" justify="center" align="center" style={{ padding: 'var(--ds-spacing-8)' }}>
            <Stack direction="column" gap={3} align="center">
              <SettingsIcon
                style={{
                  fontSize: 'var(--ds-font-size-heading-lg)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              />
              <Stack direction="column" gap={2} align="center">
                <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                  {t('saasAdmin.featureFlagsCatalog.empty.title')}
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                  {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                    ? t('saasAdmin.featureFlagsCatalog.empty.tryDifferentSearch')
                    : t('saasAdmin.featureFlagsCatalog.empty.noFlags')}
                </Paragraph>
              </Stack>
            </Stack>
          </Stack>
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
