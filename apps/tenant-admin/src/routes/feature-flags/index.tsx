/**
 * Feature Flags Page - Tenant Admin
 * Read-only view of tenant feature flags
 */

import {
  Card,
  Heading,
  Paragraph,
  Badge,
  Spinner,
  Stack,
  EmptyState,
  SettingsIcon,
} from '@xala/ds';
import { useTenantFeatures } from '@digilist/client-sdk/hooks';
import { useT } from '@xala/i18n';

export function FeatureFlagsPage() {
  const t = useT();
  
  const { data: featuresData, isLoading } = useTenantFeatures();
  const features = featuresData?.data ?? [];

  if (isLoading) {
    return (
      <Stack direction="horizontal" justify="center" align="center" style={{ padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label={t('common.loading')} />
      </Stack>
    );
  }

  return (
    <Stack direction="column" gap={20}>
      {/* Header */}
      <Stack direction="column" gap={1}>
        <Heading level={2} data-size="md">
          {t('tenantAdmin.nav.featureFlags')}
        </Heading>
        <Paragraph data-size="sm" data-color="subtle">
          {t('tenantAdmin.nav.featureFlagsDesc')}
        </Paragraph>
      </Stack>

      {/* Feature Flags List */}
      <Card>
        {features.length === 0 ? (
          <EmptyState
            icon={<SettingsIcon size={48} />}
            title={t('common.noResults')}
            description={t('dataPage.emptyState.noData')}
            size="md"
            bordered
          />
        ) : (
          <Stack direction="column" gap={12}>
            {features.map((feature) => (
              <Stack
                key={feature.key}
                direction="horizontal"
                justify="space-between"
                align="center"
                style={{
                  padding: 'var(--ds-spacing-3)',
                  borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                }}
              >
                <Stack direction="column" gap={1}>
                  <Paragraph data-size="sm" data-weight="medium" style={{ margin: 0 }}>
                    {feature.name || feature.key}
                  </Paragraph>
                  {feature.description && (
                    <Paragraph data-size="xs" data-color="subtle" style={{ margin: 0 }}>
                      {feature.description}
                    </Paragraph>
                  )}
                </Stack>
                <Badge color={feature.enabled ? 'success' : 'neutral'}>
                  {feature.enabled ? t('saasAdmin.flagEnabled') : t('saasAdmin.flagDisabled')}
                </Badge>
              </Stack>
            ))}
          </Stack>
        )}
      </Card>
    </Stack>
  );
}

export default FeatureFlagsPage;
