/**
 * Billing Page - SaaS Admin
 * Platform-wide billing overview with revenue stats and invoice list
 */

import {
  Card,
  Heading,
  Paragraph,
  Spinner,
  Grid,
  Stack,
} from '@xala/ds';
import { useSaasBillingOverview } from '@digilist/client-sdk/hooks';
import { useT } from '@xala/i18n';

export function BillingPage() {
  const t = useT();
  
  const { data: billingData, isLoading } = useSaasBillingOverview();
  const billing = billingData?.data;

  const formatCurrency = (amount: number, currency: string = 'NOK') => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Stack direction="horizontal" justify="center" align="center" style={{ padding: 'var(--ds-spacing-8)' }}>
        <Spinner size="lg" aria-label={t('state.loading')} />
      </Stack>
    );
  }

  return (
    <Stack direction="column" gap={20}>
      {/* Header */}
      <Stack direction="column" gap={1}>
        <Heading level={2} size="md">
          {t('saasAdmin.billing')}
        </Heading>
        <Paragraph size="sm" color="subtle">
          {t('saasAdmin.billingSubtitle')}
        </Paragraph>
      </Stack>

      {/* Stats Grid */}
      {billing && (
        <Grid
          columns="repeat(auto-fit, minmax(var(--ds-size-20, 200px), 1fr))"
          gap={12}
        >
          <Card style={{ padding: 'var(--ds-spacing-4)' }}>
            <Stack direction="column" gap={2}>
              <Paragraph size="sm" color="subtle" style={{ margin: 0 }}>
                {t('saasAdmin.totalRevenue')}
              </Paragraph>
              <Heading level={3} size="lg" style={{ margin: 0 }}>
                {formatCurrency(billing.totalRevenue, billing.currency)}
              </Heading>
            </Stack>
          </Card>
          <Card style={{ padding: 'var(--ds-spacing-4)' }}>
            <Stack direction="column" gap={2}>
              <Paragraph size="sm" color="subtle" style={{ margin: 0 }}>
                {t('saasAdmin.monthlyRevenue')}
              </Paragraph>
              <Heading level={3} size="lg" style={{ margin: 0 }}>
                {formatCurrency(billing.monthlyRecurring, billing.currency)}
              </Heading>
            </Stack>
          </Card>
          <Card style={{ padding: 'var(--ds-spacing-4)' }}>
            <Stack direction="column" gap={2}>
              <Paragraph size="sm" color="subtle" style={{ margin: 0 }}>
                {t('saasAdmin.billing.activeSubscriptions', { defaultValue: 'Active Subscriptions' })}
              </Paragraph>
              <Heading level={3} size="lg" style={{ margin: 0 }}>
                {billing.activeSubscriptions}
              </Heading>
            </Stack>
          </Card>
          <Card style={{ padding: 'var(--ds-spacing-4)' }}>
            <Stack direction="column" gap={2}>
              <Paragraph size="sm" color="subtle" style={{ margin: 0 }}>
                {t('saasAdmin.billing.overdueInvoices', { defaultValue: 'Overdue Invoices' })}
              </Paragraph>
              <Heading level={3} size="lg" color="danger" style={{ margin: 0 }}>
                {billing.overdueCount}
              </Heading>
            </Stack>
          </Card>
        </Grid>
      )}

      {/* Invoices Section */}
      <Card>
        <Stack direction="column" gap={4}>
          <Heading level={3} size="sm" style={{ margin: 0 }}>
            {t('saasAdmin.invoices')}
          </Heading>
          <Paragraph size="sm" color="subtle">
            {t('saasAdmin.billing.invoicesDescription', { defaultValue: 'Invoice management will be available soon.' })}
          </Paragraph>
        </Stack>
      </Card>
    </Stack>
  );
}

export default BillingPage;
