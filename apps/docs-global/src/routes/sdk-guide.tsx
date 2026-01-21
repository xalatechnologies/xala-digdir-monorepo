/**
 * SDK Guide Page
 *
 * Documentation for using the client SDK.
 * Platform-only - no @digilist/* imports.
 */

import { Heading, Paragraph, Card, Tabs, TabItem, Tag } from '@xalatechnologies/platform/ui';
import { useT } from '@xala/i18n';

interface ServiceInfo {
  name: string;
  description: string;
  hook: string;
}

const SDK_SERVICES: ServiceInfo[] = [
  { name: 'authService', description: 'Authentication and session management', hook: 'useAuth' },
  { name: 'organizationService', description: 'Organization/tenant management', hook: 'useOrganizations' },
  { name: 'userService', description: 'User profile and settings', hook: 'useUser' },
  { name: 'auditService', description: 'Audit log queries', hook: 'useAuditLogs' },
  { name: 'notificationService', description: 'Push notifications and preferences', hook: 'useNotifications' },
  { name: 'reportsService', description: 'Analytics and reporting', hook: 'useReports' },
  { name: 'monitoringService', description: 'System health and metrics', hook: 'useMonitoring' },
  { name: 'gdprService', description: 'GDPR consent and data subject requests', hook: 'useGdpr' },
];

export function SdkGuidePage() {
  const t = useT();

  return (
    <div style={{ padding: 'var(--ds-spacing-6)', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: 'var(--ds-spacing-8)' }}>
        <Heading level={1} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.sdkGuide.title') || 'SDK Guide'}
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('docs.sdkGuide.description') ||
            'Learn how to integrate the Xala Platform SDK into your React applications with type-safe hooks and services.'}
        </Paragraph>
      </header>

      {/* Installation */}
      <section style={{ marginBottom: 'var(--ds-spacing-8)' }}>
        <Heading level={2} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.sdkGuide.installation') || 'Installation'}
        </Heading>
        <pre>
          <code>{`# Install the SDK package
pnpm add @digilist/client-sdk

# Required peer dependencies
pnpm add @tanstack/react-query react react-dom`}</code>
        </pre>
      </section>

      {/* Initialization */}
      <section style={{ marginBottom: 'var(--ds-spacing-8)' }}>
        <Heading level={2} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.sdkGuide.initialization') || 'Initialization'}
        </Heading>
        <Paragraph style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.sdkGuide.initDescription') ||
            'Initialize the SDK client once at your application entry point:'}
        </Paragraph>
        <pre>
          <code>{`// main.tsx
import { initializeClient } from '@digilist/client-sdk';

initializeClient({
  baseUrl: 'https://api.digilist.no',
  tenantId: 'your-tenant-id',
  licenseKey: 'your-license-key',
});`}</code>
        </pre>
      </section>

      {/* Using Hooks */}
      <section style={{ marginBottom: 'var(--ds-spacing-8)' }}>
        <Heading level={2} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.sdkGuide.usingHooks') || 'Using React Query Hooks'}
        </Heading>
        <Paragraph style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.sdkGuide.hooksDescription') ||
            'The SDK provides React Query hooks for data fetching and mutations:'}
        </Paragraph>
        <Tabs>
          <TabItem label="Basic Usage">
            <pre style={{ marginTop: 'var(--ds-spacing-4)' }}>
              <code>{`import { useOrganizations } from '@digilist/client-sdk/hooks';

function OrganizationList() {
  const { data, isLoading, error } = useOrganizations();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <ul>
      {data?.items.map((org) => (
        <li key={org.id}>{org.name}</li>
      ))}
    </ul>
  );
}`}</code>
            </pre>
          </TabItem>
          <TabItem label="With Filters">
            <pre style={{ marginTop: 'var(--ds-spacing-4)' }}>
              <code>{`import { useOrganizations } from '@digilist/client-sdk/hooks';

function ActiveOrganizations() {
  const { data } = useOrganizations({
    status: 'active',
    limit: 10,
    offset: 0,
  });

  return <OrganizationGrid organizations={data?.items ?? []} />;
}`}</code>
            </pre>
          </TabItem>
          <TabItem label="Mutations">
            <pre style={{ marginTop: 'var(--ds-spacing-4)' }}>
              <code>{`import { useCreateOrganization } from '@digilist/client-sdk/hooks';

function CreateOrgForm() {
  const { mutate, isLoading } = useCreateOrganization();

  const handleSubmit = (data: CreateOrgInput) => {
    mutate(data, {
      onSuccess: (org) => {
        toast.success('Organization created!');
        navigate(\`/organizations/\${org.id}\`);
      },
      onError: (error) => {
        toast.error(error.detail);
      },
    });
  };

  return <Form onSubmit={handleSubmit} disabled={isLoading} />;
}`}</code>
            </pre>
          </TabItem>
        </Tabs>
      </section>

      {/* Available Services */}
      <section style={{ marginBottom: 'var(--ds-spacing-8)' }}>
        <Heading level={2} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.sdkGuide.availableServices') || 'Available Services'}
        </Heading>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--ds-spacing-4)',
          }}
        >
          {SDK_SERVICES.map((service) => (
            <Card key={service.name} style={{ padding: 'var(--ds-spacing-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-2)' }}>
                <code style={{ fontWeight: 600 }}>{service.name}</code>
              </div>
              <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                {service.description}
              </Paragraph>
              <Tag color="info" size="sm">
                Hook: {service.hook}
              </Tag>
            </Card>
          ))}
        </div>
      </section>

      {/* Error Handling */}
      <section style={{ marginBottom: 'var(--ds-spacing-8)' }}>
        <Heading level={2} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.sdkGuide.errorHandling') || 'Error Handling'}
        </Heading>
        <Paragraph style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.sdkGuide.errorDescription') ||
            'All SDK errors conform to RFC 7807 Problem Details:'}
        </Paragraph>
        <pre>
          <code>{`import { isProblemDetails, HttpError } from '@xala/sdk-core';

try {
  await organizationService.create(data);
} catch (error) {
  if (isProblemDetails(error)) {
    // Typed access to error properties
    console.log(error.type);   // Error URI
    console.log(error.title);  // Human-readable title
    console.log(error.status); // HTTP status code
    console.log(error.detail); // Detailed message
  }
}`}</code>
        </pre>
      </section>

      {/* Real-time Updates */}
      <section>
        <Heading level={2} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.sdkGuide.realtime') || 'Real-time Updates'}
        </Heading>
        <Paragraph style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.sdkGuide.realtimeDescription') ||
            'Subscribe to real-time updates via WebSocket:'}
        </Paragraph>
        <pre>
          <code>{`import { realtimeClient } from '@digilist/client-sdk';

// Connect to WebSocket
realtimeClient.connect({
  url: 'wss://api.digilist.no/ws',
  tenantId: 'your-tenant-id',
  autoReconnect: true,
});

// Subscribe to audit events
realtimeClient.onAudit((event) => {
  console.log('Audit event:', event);
});

// Subscribe to notifications
realtimeClient.onNotification((notification) => {
  toast.info(notification.message);
});`}</code>
        </pre>
      </section>
    </div>
  );
}

export default SdkGuidePage;
