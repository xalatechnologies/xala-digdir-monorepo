/**
 * Branding List Page
 * SaaS Admin page for viewing tenant branding status and managing themes
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Spinner,
  Table,
  Textfield,
  SparklesIcon,
  EditIcon,
  SearchIcon,
} from '@xalatechnologies/platform/ui';
import { useSaasTenants } from '@xalatechnologies/platform/sdk';
import { useT } from '@xalatechnologies/platform/i18n';

// Mock branding data - will be replaced with real API
const MOCK_BRANDING_STATUS: Record<string, { hasCustomBranding: boolean; primaryColor?: string; logoUrl?: string }> = {};

export function BrandingListPage() {
  const t = useT();
  const [searchQuery, setSearchQuery] = useState('');

  // Queries
  const { data: tenantsData, isLoading } = useSaasTenants({ limit: 100 });
  const tenants = tenantsData?.data ?? [];

  // Filter tenants
  const filteredTenants = tenants.filter((tenant) =>
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBrandingStatus = (tenantId: string) => {
    return MOCK_BRANDING_STATUS[tenantId] ?? { hasCustomBranding: false };
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner size="lg" aria-label={t('state.loading')} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--ds-spacing-8)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-6)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-2)' }}>
            <SparklesIcon style={{ color: 'var(--ds-color-accent-text-default)', width: 32, height: 32 }} />
            <Heading level={1} size="lg">
              {t('saasAdmin.branding.page.title', { defaultValue: 'Branding & Tema' })}
            </Heading>
          </div>
          <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('saasAdmin.branding.description', { defaultValue: 'Administrer farger, logoer og visuelle innstillinger for hver tenant' })}
          </Paragraph>
        </div>
      </div>

      {/* Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-spacing-4)', marginBottom: 'var(--ds-spacing-6)' }}>
        <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
          <Heading level={3} size="xl" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
            {tenants.length}
          </Heading>
          <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            Totalt tenanter
          </Paragraph>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
          <Heading level={3} size="xl" style={{ marginBottom: 'var(--ds-spacing-1)', color: 'var(--ds-color-success-text-default)' }}>
            {tenants.filter((t) => getBrandingStatus(t.id).hasCustomBranding).length}
          </Heading>
          <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            Med egendefinert tema
          </Paragraph>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
          <Heading level={3} size="xl" style={{ marginBottom: 'var(--ds-spacing-1)', color: 'var(--ds-color-warning-text-default)' }}>
            {tenants.filter((t) => !getBrandingStatus(t.id).hasCustomBranding).length}
          </Heading>
          <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            Bruker standard tema
          </Paragraph>
        </Card>
      </div>

      {/* Search */}
      <Card style={{ padding: 'var(--ds-spacing-4)', marginBottom: 'var(--ds-spacing-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Textfield
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('action.search', { defaultValue: 'Søk etter tenant...' })}
            />
          </div>
          <Button variant="tertiary" type="button">
            <SearchIcon />
            {t('action.search')}
          </Button>
        </div>
      </Card>

      {/* Tenants Table */}
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>{t('saasAdmin.text.tenant')}</Table.HeaderCell>
              <Table.HeaderCell>{t('saasAdmin.text.slug')}</Table.HeaderCell>
              <Table.HeaderCell>{t('saasAdmin.text.branding')}</Table.HeaderCell>
              <Table.HeaderCell>{t('common.primaerfarge')}</Table.HeaderCell>
              <Table.HeaderCell>{t('saasAdmin.text.handlinger')}</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {filteredTenants.map((tenant) => {
              const branding = getBrandingStatus(tenant.id);
              return (
                <Table.Row key={tenant.id}>
                  <Table.Cell>
                    <strong>{tenant.name}</strong>
                  </Table.Cell>
                  <Table.Cell>
                    <code style={{ fontSize: 'var(--ds-font-size-sm)' }}>{tenant.slug}</code>
                  </Table.Cell>
                  <Table.Cell>
                    {branding.hasCustomBranding ? (
                      <Badge color="success">{t('saasAdmin.text.egendefinert')}</Badge>
                    ) : (
                      <Badge color="neutral">{t('saasAdmin.text.standard')}</Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {branding.primaryColor ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 'var(--ds-border-radius-sm)',
                            backgroundColor: branding.primaryColor,
                            border: '1px solid var(--ds-color-neutral-border-subtle)',
                          }}
                        />
                        <code style={{ fontSize: 'var(--ds-font-size-xs)' }}>{branding.primaryColor}</code>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>—</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Link to={`/branding/${tenant.id}`}>
                      <Button variant="tertiary" size="sm" type="button">
                        <EditIcon />
                        Rediger
                      </Button>
                    </Link>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>

        {filteredTenants.length === 0 && (
          <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              Ingen tenanter funnet.
            </Paragraph>
          </div>
        )}
      </Card>
    </div>
  );
}

export default BrandingListPage;
