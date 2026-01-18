/**
 * Integration Configuration Modal
 * Modal for editing integration configuration with credentials
 */

import {
  Card,
  Heading,
  Paragraph,
  Button,
  FormField,
  Textfield,
  Select,
  Stack,
  Alert,
  Spinner,
  Badge,
  SaveIcon,
  XIcon,
  CheckIcon,
  AlertTriangleIcon,
} from '@xala/ds';
import { useT } from '@xala/i18n';

interface IntegrationConfigModalProps {
  provider: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  formData: Record<string, any>;
  onClose: () => void;
  onSave: () => void;
  onTest: () => void;
  onFieldChange: (field: string, value: any) => void;
  isSaving: boolean;
  isTesting: boolean;
  testResult: { success: boolean; message: string } | null;
}

// Integration-specific field configurations
const INTEGRATION_FIELDS: Record<string, Array<{ key: string; labelKey: string; type?: string; sensitive?: boolean; placeholder?: string }>> = {
  idporten: [
    { key: 'baseUrl', labelKey: 'baseUrl', placeholder: 'https://digilist.sandbox.signicat.com' },
    { key: 'clientId', labelKey: 'clientId', sensitive: true },
    { key: 'clientSecret', labelKey: 'client.secret', type: 'password', sensitive: true },
    { key: 'redirectUri', labelKey: 'redirectUri', placeholder: 'https://api.digilist.no/api/auth/idporten/callback' },
    { key: 'scopes', labelKey: 'scopes', placeholder: 'signicat-api' },
    { key: 'acrValues', labelKey: 'acrValues', placeholder: 'idp:nbid' },
  ],
  vipps: [
    { key: 'baseUrl', labelKey: 'baseUrl', placeholder: 'https://apitest.vipps.no' },
    { key: 'clientId', labelKey: 'clientId', sensitive: true },
    { key: 'clientSecret', labelKey: 'client.secret', type: 'password', sensitive: true },
    { key: 'merchantSerialNumber', labelKey: 'merchant.serial.number', sensitive: true },
    { key: 'subscriptionKey', labelKey: 'subscription.key.ocpapimsubscriptionkey', type: 'password', sensitive: true },
    { key: 'webhookSecret', labelKey: 'webhook.secret', type: 'password', sensitive: true },
  ],
  visma: [
    { key: 'baseUrl', labelKey: 'baseUrl', placeholder: 'https://api.visma.com' },
    { key: 'apiKey', labelKey: 'apiKey', type: 'password', sensitive: true },
    { key: 'companyId', labelKey: 'company.id' },
  ],
  rco: [
    { key: 'baseUrl', labelKey: 'baseUrl' },
    { key: 'username', labelKey: 'username', sensitive: true },
    { key: 'password', labelKey: 'password', type: 'password', sensitive: true },
    { key: 'apiKey', labelKey: 'apiKey', type: 'password', sensitive: true },
  ],
  acos: [
    { key: 'baseUrl', labelKey: 'baseUrl' },
    { key: 'apiKey', labelKey: 'apiKey', type: 'password', sensitive: true },
    { key: 'archiveId', labelKey: 'archiveId' },
  ],
};

export function IntegrationConfigModal({
  provider,
  name,
  status,
  config,
  formData,
  onClose,
  onSave,
  onTest,
  onFieldChange,
  isSaving,
  isTesting,
  testResult,
}: IntegrationConfigModalProps) {
  const t = useT();
  const fields = INTEGRATION_FIELDS[provider] || [];

  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return <Badge color="success">Aktiv</Badge>;
      case 'error':
        return <Badge color="danger">{t("error.generic")}</Badge>;
      default:
        return <Badge color="neutral">Inaktiv</Badge>;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--ds-color-neutral-background-overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--ds-spacing-4)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card>
          <Stack spacing={5}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-2)' }}>
                  <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                    {name}
                  </Heading>
                  {getStatusBadge()}
                </div>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                  Konfigurer integrasjonsinnstillinger og API-legitimasjon
                </Paragraph>
              </div>
              <Button variant="tertiary" data-size="sm" onClick={onClose} type="button" aria-label={t('action.close')}>
                <XIcon />
              </Button>
            </div>

            {/* Status Field */}
            <FormField label="Status" description={t('aktiveringdeaktivering.av.integrasjonen')}>
              <Select
                value={formData.status || status}
                onChange={(e) => onFieldChange('status', e.target.value)}
              >
                <option value="active">Aktiv</option>
                <option value="inactive">Inaktiv</option>
                <option value="error">{t("error.generic")}</option>
              </Select>
            </FormField>

            {/* Dynamic Fields */}
            <Stack spacing={4}>
              {fields.map((field) => (
                <FormField
                  key={field.key}
                  label={t(field.labelKey)}
                  description={field.sensitive ? t('sensitiv.informasjon.vises.maskert') : undefined}
                >
                  <Textfield
                    aria-label={t(field.labelKey)}
                    type={field.type as 'text' | 'password' || 'text'}
                    value={formData.config?.[field.key] || ''}
                    onChange={(e) => onFieldChange(`config.${field.key}`, e.target.value)}
                    placeholder={field.placeholder || field.sensitive ? '***' : ''}
                  />
                </FormField>
              ))}
            </Stack>

            {/* Test Result */}
            {testResult && (
              <Alert style={{
                backgroundColor: testResult.success
                  ? 'var(--ds-color-success-surface-default)'
                  : 'var(--ds-color-danger-surface-default)',
                border: `1px solid ${testResult.success
                  ? 'var(--ds-color-success-border-subtle)'
                  : 'var(--ds-color-danger-border-subtle)'
                }`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                  {testResult.success ? (
                    <CheckIcon style={{ color: 'var(--ds-color-success-text-default)' }} />
                  ) : (
                    <AlertTriangleIcon style={{ color: 'var(--ds-color-danger-text-default)' }} />
                  )}
                  <div>
                    <Paragraph data-size="sm" style={{ fontWeight: 'var(--ds-font-weight-semibold)', margin: 0 }}>
                      {testResult.success ? t('tilkobling.vellykket') : 'Tilkobling feilet'}
                    </Paragraph>
                    <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
                      {testResult.message}
                    </Paragraph>
                  </div>
                </div>
              </Alert>
            )}

            {/* Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 'var(--ds-spacing-3)',
              paddingTop: 'var(--ds-spacing-3)',
              borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
            }}>
              <Button
                variant="secondary"
                onClick={onTest}
                disabled={isTesting || isSaving}
                type="button"
              >
                {isTesting ? (
                  <>
                    <Spinner data-size="sm" />
                    Tester...
                  </>
                ) : (
                  'Test tilkobling'
                )}
              </Button>
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                <Button variant="secondary" onClick={onClose} disabled={isSaving} type="button">{t("action.cancel")}</Button>
                <Button variant="primary" onClick={onSave} disabled={isSaving} type="button">
                  {isSaving ? (
                    <>
                      <Spinner data-size="sm" />
                      Lagrer...
                    </>
                  ) : (
                    <>
                      <SaveIcon />{t("action.save")}</>
                  )}
                </Button>
              </div>
            </div>
          </Stack>
        </Card>
      </div>
    </div>
  );
}
