/**
 * IntegrationsTab Component
 * Manages third-party integrations and system connections
 */

import { Card, Heading, Paragraph, Switch, Badge, Stack } from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';

interface Integration {
  enabled?: boolean;
}

interface IntegrationsData {
  bankid?: Integration;
  idporten?: Integration;
  vipps?: Integration;
  rco?: Integration;
  googleCalendar?: Integration;
  outlook?: Integration;
  visma?: Integration;
  brreg?: Integration;
}

export interface IntegrationsTabProps {
  integrations?: IntegrationsData;
  onToggle: (provider: string, enabled: boolean) => Promise<void>;
}

export function IntegrationsTab({ integrations, onToggle }: IntegrationsTabProps) {
  const t = useT();
  return (
    <Stack spacing={4}>
      <Card>
        <Stack spacing={4}>
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Autentisering
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              ID-løsninger og pålogging
            </Paragraph>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
            <div>
              <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>BankID</div>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Norsk e-ID for sikker pålogging</Paragraph>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              {integrations?.bankid?.enabled ? (
                <Badge color="success">Aktiv</Badge>
              ) : (
                <Badge color="neutral">Inaktiv</Badge>
              )}
              <Switch
                checked={integrations?.bankid?.enabled || false}
                onChange={(checked) => onToggle('bankid', checked)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
            <div>
              <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>ID-porten</div>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Offentlig påloggingsløsning</Paragraph>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              {integrations?.idporten?.enabled ? (
                <Badge color="success">Aktiv</Badge>
              ) : (
                <Badge color="neutral">Inaktiv</Badge>
              )}
              <Switch
                checked={integrations?.idporten?.enabled || false}
                onChange={(checked) => onToggle('idporten', checked)}
              />
            </div>
          </div>
        </Stack>
      </Card>

      <Card>
        <Stack spacing={4}>
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>{t("rule.payment")}</Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              Betalingsløsninger
            </Paragraph>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
            <div>
              <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>Vipps</div>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Mobilbetaling med Vipps</Paragraph>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              {integrations?.vipps?.enabled ? (
                <Badge color="success">Aktiv</Badge>
              ) : (
                <Badge color="neutral">Inaktiv</Badge>
              )}
              <Switch
                checked={integrations?.vipps?.enabled || false}
                onChange={(checked) => onToggle('vipps', checked)}
              />
            </div>
          </div>
        </Stack>
      </Card>

      <Card>
        <Stack spacing={4}>
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Tilgangskontroll
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              Låssystemer og adgangskontroll
            </Paragraph>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
            <div>
              <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>RCO</div>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Digital låssystem</Paragraph>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              {integrations?.rco?.enabled ? (
                <Badge color="success">Aktiv</Badge>
              ) : (
                <Badge color="neutral">Inaktiv</Badge>
              )}
              <Switch
                checked={integrations?.rco?.enabled || false}
                onChange={(checked) => onToggle('rco', checked)}
              />
            </div>
          </div>
        </Stack>
      </Card>

      <Card>
        <Stack spacing={4}>
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Kalender
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              Kalendersynkronisering
            </Paragraph>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
            <div>
              <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>Google Calendar</div>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Synkroniser med Google Calendar</Paragraph>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              {integrations?.googleCalendar?.enabled ? (
                <Badge color="success">Aktiv</Badge>
              ) : (
                <Badge color="neutral">Inaktiv</Badge>
              )}
              <Switch
                checked={integrations?.googleCalendar?.enabled || false}
                onChange={(checked) => onToggle('googleCalendar', checked)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
            <div>
              <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>Outlook</div>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Synkroniser med Outlook/Exchange</Paragraph>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              {integrations?.outlook?.enabled ? (
                <Badge color="success">Aktiv</Badge>
              ) : (
                <Badge color="neutral">Inaktiv</Badge>
              )}
              <Switch
                checked={integrations?.outlook?.enabled || false}
                onChange={(checked) => onToggle('outlook', checked)}
              />
            </div>
          </div>
        </Stack>
      </Card>

      <Card>
        <Stack spacing={4}>
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Økonomi & ERP
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              Økonomisystemer og fakturering
            </Paragraph>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
            <div>
              <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>Visma</div>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Fakturering via Visma</Paragraph>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              {integrations?.visma?.enabled ? (
                <Badge color="success">Aktiv</Badge>
              ) : (
                <Badge color="neutral">Inaktiv</Badge>
              )}
              <Switch
                checked={integrations?.visma?.enabled || false}
                onChange={(checked) => onToggle('visma', checked)}
              />
            </div>
          </div>
        </Stack>
      </Card>

      <Card>
        <Stack spacing={4}>
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Offentlige registre
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              Verifikasjon og oppslag
            </Paragraph>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
            <div>
              <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>Brønnøysundregistrene</div>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Verifiser organisasjoner</Paragraph>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              {integrations?.brreg?.enabled ? (
                <Badge color="success">Aktiv</Badge>
              ) : (
                <Badge color="neutral">Inaktiv</Badge>
              )}
              <Switch
                checked={integrations?.brreg?.enabled || false}
                onChange={(checked) => onToggle('brreg', checked)}
              />
            </div>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}
