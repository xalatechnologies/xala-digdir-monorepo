/**
 * Integrations Settings Page - Tenant Admin App
 *
 * Allows tenant administrators to manage third-party integrations:
 * - View integration status (enabled/disabled/configured)
 * - Configure API keys (displayed masked for security)
 * - Enable/disable individual integrations
 * - View last sync timestamps
 */

/* eslint-disable digdir/prefer-ds-components, digdir/no-hardcoded-typography -- Complex settings form */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Input,
  Switch,
  Alert,
  Spinner,
  Badge,
  InfoIcon,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import { useAuth } from '@xala/auth';
import {
  useTenantIntegrations,
  useUpdateTenantIntegration,
} from '@digilist/client-sdk/hooks';
import type { TenantIntegration } from '@digilist/client-sdk/services/tenant-admin.service';

const MOBILE_BREAKPOINT = 768;

/**
 * Integration provider configuration
 * Defines display names, descriptions, and required fields for each provider
 */
const INTEGRATION_CONFIG: Record<
  string,
  {
    name: string;
    description: string;
    category: 'payment' | 'sync' | 'notification' | 'calendar';
    icon: string;
    requiresApiKey: boolean;
    requiresApiSecret: boolean;
    requiresWebhook: boolean;
    docsUrl?: string;
  }
> = {
  vipps: {
    name: 'Vipps',
    description: 'Norsk betalingsløsning for online betaling',
    category: 'payment',
    icon: '💳',
    requiresApiKey: true,
    requiresApiSecret: true,
    requiresWebhook: true,
    docsUrl: 'https://developer.vipps.no/',
  },
  visma: {
    name: 'Visma',
    description: 'Integrasjon med Visma for regnskapsføring og fakturering',
    category: 'sync',
    icon: '📊',
    requiresApiKey: true,
    requiresApiSecret: false,
    requiresWebhook: false,
  },
  rco: {
    name: 'RCO Access',
    description: 'Adgangskontrollsystem for fysiske lokaler',
    category: 'sync',
    icon: '🔐',
    requiresApiKey: true,
    requiresApiSecret: true,
    requiresWebhook: false,
  },
  acos: {
    name: 'Acos',
    description: 'Kommunal sakssystem-integrasjon',
    category: 'sync',
    icon: '📁',
    requiresApiKey: true,
    requiresApiSecret: false,
    requiresWebhook: false,
  },
  outlook: {
    name: 'Microsoft Outlook',
    description: 'Kalendersynkronisering med Microsoft 365',
    category: 'calendar',
    icon: '📅',
    requiresApiKey: false,
    requiresApiSecret: false,
    requiresWebhook: false,
  },
  smtp: {
    name: 'SMTP E-post',
    description: 'Egendefinert e-postserver for varslinger',
    category: 'notification',
    icon: '📧',
    requiresApiKey: true,
    requiresApiSecret: true,
    requiresWebhook: false,
  },
  sms: {
    name: 'SMS Gateway',
    description: 'SMS-varsler via tredjeparts gateway',
    category: 'notification',
    icon: '📱',
    requiresApiKey: true,
    requiresApiSecret: false,
    requiresWebhook: false,
  },
};

const CATEGORY_LABELS: Record<string, { name: string; color: 'info' | 'success' | 'warning' | 'danger' }> = {
  payment: { name: 'Betaling', color: 'success' },
  sync: { name: 'Synkronisering', color: 'info' },
  notification: { name: 'Varsler', color: 'warning' },
  calendar: { name: 'Kalender', color: 'info' },
};

interface IntegrationEditState {
  apiKey: string;
  apiSecret: string;
  webhookUrl: string;
}

export function IntegrationsSettingsPage(): React.ReactElement {
  const t = useT();
  const { isTenantAdmin, isTechAdmin } = useAuth();

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [editState, setEditState] = useState<IntegrationEditState>({
    apiKey: '',
    apiSecret: '',
    webhookUrl: '',
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);

  // SDK hooks
  const { data: integrationsResponse, isLoading, error } = useTenantIntegrations();
  const updateIntegration = useUpdateTenantIntegration();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check access - only tenant admin or tech admin can manage integrations
  if (!isTenantAdmin && !isTechAdmin) {
    return (
      <Alert data-color="warning">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <InfoIcon />
          {t('tenantAdmin.integrations.noAccess', {
            defaultValue: 'You do not have permission to manage integrations.',
          })}
        </div>
      </Alert>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label={t('common.loading', { defaultValue: 'Loading...' })} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert data-color="danger">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <InfoIcon />
          {t('tenantAdmin.integrations.loadError', {
            defaultValue: 'Failed to load integrations. Please try again.',
          })}
        </div>
      </Alert>
    );
  }

  const integrations = integrationsResponse?.data ?? [];

  const handleToggleIntegration = async (provider: string, enabled: boolean) => {
    await updateIntegration.mutateAsync({
      provider,
      data: { enabled },
    });
  };

  const handleStartEdit = (provider: string) => {
    setEditingProvider(provider);
    setEditState({
      apiKey: '',
      apiSecret: '',
      webhookUrl: '',
    });
    setShowApiKey(false);
    setShowApiSecret(false);
  };

  const handleCancelEdit = () => {
    setEditingProvider(null);
    setEditState({
      apiKey: '',
      apiSecret: '',
      webhookUrl: '',
    });
    setShowApiKey(false);
    setShowApiSecret(false);
  };

  const handleSaveIntegration = async () => {
    if (!editingProvider) return;

    const config = INTEGRATION_CONFIG[editingProvider];
    const data: Record<string, unknown> = { enabled: true };

    if (config?.requiresApiKey && editState.apiKey) {
      data.apiKey = editState.apiKey;
    }
    if (config?.requiresApiSecret && editState.apiSecret) {
      data.apiSecret = editState.apiSecret;
    }
    if (config?.requiresWebhook && editState.webhookUrl) {
      data.webhookUrl = editState.webhookUrl;
    }

    await updateIntegration.mutateAsync({
      provider: editingProvider,
      data: data as { enabled: boolean; apiKey?: string; apiSecret?: string; webhookUrl?: string },
    });

    handleCancelEdit();
  };

  const formatLastSync = (lastSync: string | null): string => {
    if (!lastSync) {
      return t('tenantAdmin.integrations.neverSynced', { defaultValue: 'Never synced' });
    }
    const date = new Date(lastSync);
    return date.toLocaleString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderIntegrationCard = (integration: TenantIntegration) => {
    const config = INTEGRATION_CONFIG[integration.provider] ?? {
      name: integration.provider,
      description: 'Unknown integration',
      category: 'sync' as const,
      icon: '🔗',
      requiresApiKey: false,
      requiresApiSecret: false,
      requiresWebhook: false,
    };
    const category = CATEGORY_LABELS[config.category] ?? { name: config.category, color: 'info' as const };
    const isEditing = editingProvider === integration.provider;

    return (
      <Card
        key={integration.provider}
        style={{
          padding: 'var(--ds-spacing-4)',
          borderLeft: integration.enabled
            ? '4px solid var(--ds-color-success-base-default)'
            : '4px solid var(--ds-color-neutral-border-default)',
        }}
      >
        {/* Integration Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 'var(--ds-spacing-3)',
            marginBottom: 'var(--ds-spacing-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <span style={{ fontSize: '1.5rem' }}>{config.icon}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <Heading level={3} data-size="xs" style={{ margin: 0 }}>
                  {config.name}
                </Heading>
                <Badge data-color={category.color} data-size="sm">
                  {category.name}
                </Badge>
              </div>
              <Paragraph
                data-size="sm"
                style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}
              >
                {config.description}
              </Paragraph>
            </div>
          </div>
          <Switch
            checked={integration.enabled}
            onChange={(checked: boolean) => handleToggleIntegration(integration.provider, checked)}
            disabled={updateIntegration.isPending}
            aria-label={t('tenantAdmin.integrations.toggleLabel', {
              defaultValue: 'Toggle {{name}}',
              name: config.name,
            })}
          />
        </div>

        {/* Status Info */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--ds-spacing-4)',
            marginBottom: 'var(--ds-spacing-3)',
            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            borderRadius: 'var(--ds-border-radius-md)',
          }}
        >
          <div>
            <Paragraph
              data-size="xs"
              style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}
            >
              {t('tenantAdmin.integrations.status', { defaultValue: 'Status' })}
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500 }}>
              {integration.enabled
                ? integration.configured
                  ? t('tenantAdmin.integrations.active', { defaultValue: 'Active' })
                  : t('tenantAdmin.integrations.pendingConfig', { defaultValue: 'Pending Configuration' })
                : t('tenantAdmin.integrations.disabled', { defaultValue: 'Disabled' })}
            </Paragraph>
          </div>
          {integration.maskedApiKey && (
            <div>
              <Paragraph
                data-size="xs"
                style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}
              >
                {t('tenantAdmin.integrations.apiKey', { defaultValue: 'API Key' })}
              </Paragraph>
              <Paragraph
                data-size="sm"
                style={{ margin: 0, fontFamily: 'monospace', fontWeight: 500 }}
              >
                {integration.maskedApiKey}
              </Paragraph>
            </div>
          )}
          <div>
            <Paragraph
              data-size="xs"
              style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}
            >
              {t('tenantAdmin.integrations.lastSync', { defaultValue: 'Last Sync' })}
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500 }}>
              {formatLastSync(integration.lastSync)}
            </Paragraph>
          </div>
        </div>

        {/* Edit Form (when editing) */}
        {isEditing && (
          <div
            style={{
              marginTop: 'var(--ds-spacing-3)',
              padding: 'var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
              borderRadius: 'var(--ds-border-radius-md)',
            }}
          >
            <Heading level={4} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
              {t('tenantAdmin.integrations.configureCredentials', {
                defaultValue: 'Configure Credentials',
              })}
            </Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
              {config.requiresApiKey && (
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: 'var(--ds-spacing-1)',
                      fontWeight: 500,
                      fontSize: 'var(--ds-font-size-sm)',
                    }}
                  >
                    {t('tenantAdmin.integrations.apiKeyLabel', { defaultValue: 'API Key' })}
                  </label>
                  <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={editState.apiKey}
                      onChange={e => setEditState(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder={
                        integration.maskedApiKey
                          ? t('tenantAdmin.integrations.leaveBlankToKeep', {
                              defaultValue: 'Leave blank to keep existing',
                            })
                          : t('tenantAdmin.integrations.enterApiKey', {
                              defaultValue: 'Enter API key',
                            })
                      }
                      style={{ flex: 1 }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      data-size="sm"
                      onClick={() => setShowApiKey(v => !v)}
                      style={{ minWidth: '80px' }}
                    >
                      {showApiKey
                        ? t('common.hide', { defaultValue: 'Hide' })
                        : t('common.show', { defaultValue: 'Show' })}
                    </Button>
                  </div>
                </div>
              )}
              {config.requiresApiSecret && (
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: 'var(--ds-spacing-1)',
                      fontWeight: 500,
                      fontSize: 'var(--ds-font-size-sm)',
                    }}
                  >
                    {t('tenantAdmin.integrations.apiSecretLabel', { defaultValue: 'API Secret' })}
                  </label>
                  <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                    <Input
                      type={showApiSecret ? 'text' : 'password'}
                      value={editState.apiSecret}
                      onChange={e => setEditState(prev => ({ ...prev, apiSecret: e.target.value }))}
                      placeholder={t('tenantAdmin.integrations.enterApiSecret', {
                        defaultValue: 'Enter API secret',
                      })}
                      style={{ flex: 1 }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      data-size="sm"
                      onClick={() => setShowApiSecret(v => !v)}
                      style={{ minWidth: '80px' }}
                    >
                      {showApiSecret
                        ? t('common.hide', { defaultValue: 'Hide' })
                        : t('common.show', { defaultValue: 'Show' })}
                    </Button>
                  </div>
                </div>
              )}
              {config.requiresWebhook && (
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: 'var(--ds-spacing-1)',
                      fontWeight: 500,
                      fontSize: 'var(--ds-font-size-sm)',
                    }}
                  >
                    {t('tenantAdmin.integrations.webhookUrl', { defaultValue: 'Webhook URL' })}
                  </label>
                  <Input
                    type="url"
                    value={editState.webhookUrl}
                    onChange={e => setEditState(prev => ({ ...prev, webhookUrl: e.target.value }))}
                    placeholder="https://..."
                    style={{ width: '100%' }}
                  />
                </div>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 'var(--ds-spacing-2)',
                marginTop: 'var(--ds-spacing-4)',
              }}
            >
              <Button type="button" variant="secondary" data-size="sm" onClick={handleCancelEdit}>
                {t('common.cancel', { defaultValue: 'Cancel' })}
              </Button>
              <Button
                type="button"
                variant="primary"
                data-size="sm"
                onClick={handleSaveIntegration}
                disabled={updateIntegration.isPending}
              >
                {updateIntegration.isPending
                  ? t('common.saving', { defaultValue: 'Saving...' })
                  : t('common.save', { defaultValue: 'Save' })}
              </Button>
            </div>
          </div>
        )}

        {/* Configure Button (when not editing) */}
        {!isEditing && (config.requiresApiKey || config.requiresApiSecret || config.requiresWebhook) && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--ds-spacing-2)' }}>
            {config.docsUrl && (
              <Button
                type="button"
                variant="secondary"
                data-size="sm"
                onClick={() => window.open(config.docsUrl, '_blank', 'noopener,noreferrer')}
              >
                {t('tenantAdmin.integrations.viewDocs', { defaultValue: 'Documentation' })}
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              data-size="sm"
              onClick={() => handleStartEdit(integration.provider)}
            >
              {integration.configured
                ? t('tenantAdmin.integrations.updateCredentials', { defaultValue: 'Update Credentials' })
                : t('tenantAdmin.integrations.configure', { defaultValue: 'Configure' })}
            </Button>
          </div>
        )}
      </Card>
    );
  };

  // Group integrations by category
  const groupedIntegrations = integrations.reduce(
    (acc, integration) => {
      const config = INTEGRATION_CONFIG[integration.provider];
      const category = config?.category ?? 'sync';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(integration);
      return acc;
    },
    {} as Record<string, TenantIntegration[]>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            {t('tenantAdmin.integrations.title', { defaultValue: 'Integrations' })}
          </Heading>
          <Paragraph
            style={{
              color: 'var(--ds-color-neutral-text-subtle)',
              marginTop: 'var(--ds-spacing-2)',
              marginBottom: 0,
            }}
          >
            {t('tenantAdmin.integrations.description', {
              defaultValue: 'Connect third-party services to extend platform capabilities',
            })}
          </Paragraph>
        </div>
      </div>

      {/* Security Notice */}
      <Alert data-color="info">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-2)' }}>
          <InfoIcon />
          <div>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500 }}>
              {t('tenantAdmin.integrations.securityNotice', { defaultValue: 'Security Notice' })}
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
              {t('tenantAdmin.integrations.securityDescription', {
                defaultValue:
                  'API keys and secrets are encrypted and stored securely. Only masked versions are displayed for your protection.',
              })}
            </Paragraph>
          </div>
        </div>
      </Alert>

      {/* Integrations by Category */}
      {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => {
        const categoryConfig = CATEGORY_LABELS[category] ?? { name: category, color: 'info' as const };
        return (
          <div key={category}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                marginBottom: 'var(--ds-spacing-3)',
              }}
            >
              <Heading level={2} data-size="sm" style={{ margin: 0 }}>
                {categoryConfig.name}
              </Heading>
              <Badge data-color={categoryConfig.color} data-size="sm">
                {categoryIntegrations.length}
              </Badge>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
              {categoryIntegrations.map(renderIntegrationCard)}
            </div>
          </div>
        );
      })}

      {/* Empty State */}
      {integrations.length === 0 && (
        <Card style={{ padding: 'var(--ds-spacing-6)', textAlign: 'center' }}>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('tenantAdmin.integrations.noIntegrations', {
              defaultValue: 'No integrations available. Contact support to enable integrations for your tenant.',
            })}
          </Paragraph>
        </Card>
      )}
    </div>
  );
}
