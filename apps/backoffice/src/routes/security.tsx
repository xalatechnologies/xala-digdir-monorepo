import {
  Card,
  Heading,
  Paragraph,
  Spinner,
  StatCard,
  ActivityItem,
  formatTimeAgo,
  ShieldCheckIcon,
  ShieldIcon,
  AlertTriangleIcon,
  DownloadIcon,
  LockIcon,
  type ActivityItemProps,
  type ActivityStatus,
} from '@xalatechnologies/platform/ui';
import {
  useSecurityMetrics,
  useGdprStatus,
  useFailedLogins,
  useDataExports,
} from '@digilist/client-sdk';
import { useT } from '@xalatechnologies/platform/i18n';
import { useAuth } from '@xalatechnologies/platform/auth';

// Map security event severity to activity status
function mapSeverityToStatus(severity: string): ActivityStatus {
  switch (severity) {
    case 'critical':
      return 'rejected';
    case 'error':
      return 'rejected';
    case 'warning':
      return 'pending';
    default:
      return 'pending';
  }
}

export function SecurityPage(): React.ReactElement {
  const { isAdmin } = useAuth();
  const t = useT();

  // Use dedicated security endpoints
  const { data: metricsData, isLoading: loadingMetrics } = useSecurityMetrics();
  const { data: gdprData, isLoading: loadingGdpr } = useGdprStatus();
  const { data: failedLoginsData, isLoading: loadingFailedLogins } = useFailedLogins({ limit: 5 });
  const { data: dataExportsData, isLoading: loadingDataExports } = useDataExports({ limit: 5 });

  const isLoading = loadingMetrics || loadingGdpr || loadingFailedLogins || loadingDataExports;

  // Extract stats from API response - API returns data directly (no wrapper)
  const auditCompleteness = metricsData?.auditTrailCompleteness ?? 0;
  const failedLogins24h = metricsData?.failedLogins?.last24Hours ?? 0;
  const failedLogins7d = metricsData?.failedLogins?.last7Days ?? 0;
  const dataExports30d = metricsData?.dataExports?.last30Days ?? 0;
  const securityEvents = metricsData?.securityEvents ?? [];

  // GDPR stats
  const gdprPercentage = gdprData?.percentage ?? 0;
  const totalUsers = gdprData?.totalUsers ?? 0;
  const withConsent = gdprData?.withConsent ?? 0;
  const withoutConsent = gdprData?.withoutConsent ?? 0;

  // Transform security events to activity feed format
  const recentSecurityEvents: ActivityItemProps[] = securityEvents.map((event) => ({
    title: event.action,
    description: `${event.resource}${event.resourceId ? ` (ID: ${event.resourceId})` : ''}`,
    time: formatTimeAgo(event.timestamp),
    status: mapSeverityToStatus(event.severity),
  }));

  // Get audit trail completeness color
  const getAuditTrailColor = (percentage: number): string => {
    if (percentage >= 95) return 'var(--ds-color-success-text-default)';
    if (percentage >= 80) return 'var(--ds-color-warning-text-default)';
    return 'var(--ds-color-danger-text-default)';
  };

  // Get GDPR consent color
  const getGdprColor = (percentage: number): string => {
    if (percentage >= 90) return 'var(--ds-color-success-text-default)';
    if (percentage >= 75) return 'var(--ds-color-warning-text-default)';
    return 'var(--ds-color-danger-text-default)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            {t('security.page.title')}
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            {isAdmin
              ? t('security.adminDescription')
              : t('security.description')}
          </Paragraph>
        </div>
      </div>

      {/* Stats grid */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
          <Spinner aria-label={t('state.loading')} data-data-size="lg" />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'var(--ds-spacing-4)',
          }}
        >
          <StatCard
            title={t('security.auditTrail')}
            value={`${auditCompleteness}%`}
            description={t('security.auditTrailDescription')}
            color={getAuditTrailColor(auditCompleteness)}
            icon={<ShieldCheckIcon />}
            {...(auditCompleteness < 95 && { trend: { value: 100 - auditCompleteness, isPositive: false as boolean } })}
          />
          <StatCard
            title={t('security.gdprStatus')}
            value={`${gdprPercentage}%`}
            description={t('security.gdprDescription', { withConsent, totalUsers })}
            color={getGdprColor(gdprPercentage)}
            icon={<LockIcon />}
            {...(withoutConsent > 0 && { trend: { value: withoutConsent, isPositive: false as boolean } })}
          />
          <StatCard
            title={t('security.failedLogins')}
            value={failedLogins24h}
            description={t('security.failedLoginsDescription', { last7Days: failedLogins7d })}
            color={failedLogins24h > 10 ? 'var(--ds-color-danger-text-default)' : 'var(--ds-color-success-text-default)'}
            icon={<AlertTriangleIcon />}
            {...(failedLogins24h > 0 && { trend: { value: failedLogins24h, isPositive: false as boolean } })}
          />
          <StatCard
            title={t('security.dataExports')}
            value={dataExports30d}
            description={t('security.dataExportsDescription')}
            icon={<DownloadIcon />}
          />
        </div>
      )}

      {/* Two column layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--ds-spacing-6)',
        }}
      >
        {/* Security events */}
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>
              {t('security.recentEvents')}
            </Heading>
            <ShieldIcon />
          </div>
          {recentSecurityEvents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
              {recentSecurityEvents.map((event, index) => (
                <ActivityItem key={index} {...event} />
              ))}
            </div>
          ) : (
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('security.noRecentEvents')}
            </Paragraph>
          )}
        </Card>

        {/* Failed login attempts */}
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>
              {t('security.recentFailedLogins')}
            </Heading>
            <AlertTriangleIcon />
          </div>
          {failedLoginsData && failedLoginsData.data.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
              {failedLoginsData.data.map((attempt) => (
                <ActivityItem
                  key={attempt.id}
                  title={attempt.action}
                  description={`${t('security.ipAddress')}: ${attempt.ipAddress ?? t('common.unknown')}`}
                  time={formatTimeAgo(attempt.timestamp)}
                  status="rejected"
                />
              ))}
            </div>
          ) : (
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('security.noFailedLogins')}
            </Paragraph>
          )}
        </Card>
      </div>

      {/* Data exports section */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
          <Heading level={2} data-size="sm" style={{ margin: 0 }}>
            {t('security.recentDataExports')}
          </Heading>
          <DownloadIcon />
        </div>
        {dataExportsData && dataExportsData.data.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            {dataExportsData.data.map((exportEvent) => (
              <ActivityItem
                key={exportEvent.id}
                title={exportEvent.userName}
                description={`${exportEvent.action} - ${exportEvent.userEmail ?? ''}`}
                time={formatTimeAgo(exportEvent.timestamp)}
                status="approved"
              />
            ))}
          </div>
        ) : (
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('security.noDataExports')}
          </Paragraph>
        )}
      </Card>
    </div>
  );
}
