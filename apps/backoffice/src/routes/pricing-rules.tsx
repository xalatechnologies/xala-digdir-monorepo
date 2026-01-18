/**
 * PricingRulesPage
 *
 * Admin page for managing pricing rules and price groups
 * - List all pricing rules
 * - Create/edit price groups
 * - Time-based pricing
 * - Discount rules
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Table,
  Badge,
  Spinner,
  useDialog,
} from '@xala/ds';
import { useT } from '@xala/i18n';

const MOBILE_BREAKPOINT = 768;



export function PricingRulesPage() {
  const t = useT();
  const { confirm } = useDialog();
  const [isLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  // Mock pricing rules
  const mockRules = [
    {
      id: 'rule-001',
      name: t('common.standard_timepris'),
      type: 'hourly',
      amount: 500,
      currency: 'NOK',
      conditions: 'Alle dager 08:00-16:00',
      status: 'active',
    },
    {
      id: 'rule-002',
      name: 'Kveldspris',
      type: 'hourly',
      amount: 750,
      currency: 'NOK',
      conditions: 'Alle dager 16:00-22:00',
      status: 'active',
    },
    {
      id: 'rule-003',
      name: 'Helgpris',
      type: 'hourly',
      amount: 600,
      currency: 'NOK',
      conditions: 'Lørdag-Søndag hele dagen',
      status: 'active',
    },
    {
      id: 'rule-004',
      name: 'Organisasjonsrabatt',
      type: 'discount',
      amount: -20,
      currency: '%',
      conditions: 'For registrerte organisasjoner',
      status: 'active',
    },
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: t('common.slett_prisregel'),
      description: `t('common.er_du_sikker_paa')`,
      confirmText: t("action.delete"),
      cancelText: t("action.cancel"),
      variant: 'danger',
    });
    if (confirmed) {
      // Rule deleted
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    if (currency === '%') {
      return `${amount}%`;
    }
    return `${amount.toLocaleString('nb-NO')} ${currency}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: 'var(--ds-spacing-4)',
      }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            Prisregler
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            Administrer priser, rabatter og prisgrupper
          </Paragraph>
        </div>
        <Button type="button" variant="primary" data-size="md" style={{ minHeight: '44px', width: isMobile ? '100%' : 'auto' }}>
          Ny prisregel
        </Button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: 'var(--ds-spacing-4)',
      }}>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>{t('backoffice.text.totalt')}</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>{mockRules.length}</Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>{t('backoffice.status.aktive')}</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, color: 'var(--ds-color-success-text-default)' }}>
            {mockRules.filter(r => r.status === 'active').length}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>{t('backoffice.text.timepriser')}</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>
            {mockRules.filter(r => r.type === 'hourly').length}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>{t('backoffice.text.rabatter')}</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>
            {mockRules.filter(r => r.type === 'discount').length}
          </Heading>
        </Card>
      </div>

      {/* Rules Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner aria-label={t("state.loading")} data-size="lg" />
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('backoffice.label.name')}</Table.HeaderCell>
                <Table.HeaderCell>{t('backoffice.text.type')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.belop')}</Table.HeaderCell>
                <Table.HeaderCell>{t('backoffice.text.betingelser')}</Table.HeaderCell>
                <Table.HeaderCell>{t('backoffice.text.status')}</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '140px' }}>{t('backoffice.text.handlinger')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {mockRules.map((rule) => (
                <Table.Row key={rule.id}>
                  <Table.Cell>
                    <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{rule.name}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge>{rule.type === 'hourly' ? 'Timepris' : rule.type === 'discount' ? 'Rabatt' : rule.type}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <span style={{ 
                      fontWeight: 'var(--ds-font-weight-semibold)', 
                      color: rule.amount < 0 ? 'var(--ds-color-success-text-default)' : undefined 
                    }}>
                      {formatAmount(rule.amount, rule.currency)}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {rule.conditions}
                    </Paragraph>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge style={{
                      backgroundColor: rule.status === 'active' ? 'var(--ds-color-success-surface-default)' : 'var(--ds-color-neutral-surface-default)',
                      color: rule.status === 'active' ? 'var(--ds-color-success-text-default)' : 'var(--ds-color-neutral-text-default)',
                    }}>
                      {rule.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                      <Button type="button" variant="tertiary" data-size="sm">{t("action.edit")}</Button>
                      <Button type="button" variant="secondary" data-size="sm" onClick={() => handleDelete(rule.id, rule.name)}>{t('action.delete')}</Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>
    </div>
  );
}
