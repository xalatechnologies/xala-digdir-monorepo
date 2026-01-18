/**
 * PaymentCallbackPage
 *
 * Handles Vipps payment callback after user completes payment flow.
 * Checks payment status and displays success/failure state.
 */
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ContentLayout,
  ContentSection,
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  Stack,
} from '@xala/ds';
import { useVippsPayment } from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

export function PaymentCallbackPage(): React.ReactElement {
  const t = useT();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');

  // Fetch payment status using SDK hook
  const { data: paymentData, isLoading, error } = useVippsPayment(orderId || '', {
    enabled: !!orderId,
  });

  // Handle missing orderId
  if (!orderId) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        paddingTop: 'var(--ds-spacing-16)',
      }}>
        <ContentLayout>
          <ContentSection>
            <Stack gap="24px" align="center" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <Heading size="lg" level={1}>
                {t('payment.invalidLink')}
              </Heading>
              <Paragraph size="md">
                {t('payment.missingOrderId')}
              </Paragraph>
              <Button type="button" onClick={() => navigate('/')}>
                {t('common.goToHome')}
              </Button>
            </Stack>
          </ContentSection>
        </ContentLayout>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        paddingTop: 'var(--ds-spacing-16)',
      }}>
        <ContentLayout>
          <ContentSection>
            <Stack gap="24px" align="center" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <Spinner size="lg" title={t('payment.checkingStatus')} />
              <Heading size="md" level={1}>
                {t('payment.checkingStatus')}
              </Heading>
              <Paragraph size="md">
                {t('payment.pleaseWait')}
              </Paragraph>
            </Stack>
          </ContentSection>
        </ContentLayout>
      </div>
    );
  }

  // Error state
  if (error || !paymentData?.data) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        paddingTop: 'var(--ds-spacing-16)',
      }}>
        <ContentLayout>
          <ContentSection>
            <Card
              style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: 'var(--ds-spacing-8)',
                border: '2px solid var(--ds-color-danger-border-default)',
              }}
            >
              <Stack gap="24px" align="center" style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--ds-color-danger-background-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--ds-font-size-heading-1)',
                }}>
                  ✕
                </div>
                <Heading size="lg" level={1}>
                  {t('payment.failed')}
                </Heading>
                <Paragraph size="md">
                  {t('payment.couldNotComplete')}
                </Paragraph>
                <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('payment.orderId')}: {orderId}
                </Paragraph>
                <Stack direction="horizontal" gap="12px" justify="center">
                  <Button type="button" variant="secondary" onClick={() => navigate('/')}>
                    {t('common.goToHome')}
                  </Button>
                  <Button type="button" onClick={() => window.location.reload()}>
                    {t('common.tryAgain')}
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </ContentSection>
        </ContentLayout>
      </div>
    );
  }

  const payment = paymentData.data;
  const isSuccess = payment.status === 'COMPLETED' || payment.status === 'AUTHORIZED';
  const isPending = payment.status === 'PENDING' || payment.status === 'INITIATED';

  // Success state
  if (isSuccess) {
    // Store payment success in sessionStorage for booking confirmation
    sessionStorage.setItem('paymentSuccess', JSON.stringify({
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status,
      timestamp: new Date().toISOString(),
    }));

    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        paddingTop: 'var(--ds-spacing-16)',
      }}>
        <ContentLayout>
          <ContentSection>
            <Card
              style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: 'var(--ds-spacing-8)',
                border: '2px solid var(--ds-color-success-border-default)',
              }}
            >
              <Stack gap="24px" align="center" style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--ds-color-success-background-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--ds-font-size-heading-1)',
                }}>
                  ✓
                </div>
                <Heading size="lg" level={1}>
                  {t('payment.success')}
                </Heading>
                <Paragraph size="md">
                  {t('payment.amountApproved', { amount: payment.amount, currency: payment.currency || 'NOK' })}
                </Paragraph>
                <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('payment.orderId')}: {payment.orderId}
                </Paragraph>
                <Paragraph size="sm">
                  {t('payment.confirmationEmail')}
                </Paragraph>
                <Button type="button" onClick={() => navigate('/')}>
                  {t('common.goToHome')}
                </Button>
              </Stack>
            </Card>
          </ContentSection>
        </ContentLayout>
      </div>
    );
  }

  // Pending state
  if (isPending) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        paddingTop: 'var(--ds-spacing-16)',
      }}>
        <ContentLayout>
          <ContentSection>
            <Card
              style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: 'var(--ds-spacing-8)',
                border: '2px solid var(--ds-color-warning-border-default)',
              }}
            >
              <Stack gap="24px" align="center" style={{ textAlign: 'center' }}>
                <Spinner size="lg" title={t('payment.processing')} />
                <Heading size="lg" level={1}>
                  {t('payment.processing')}
                </Heading>
                <Paragraph size="md">
                  {t('payment.receivedProcessing')}
                </Paragraph>
                <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('payment.orderId')}: {orderId}
                </Paragraph>
                <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
                  {t('common.refreshStatus')}
                </Button>
              </Stack>
            </Card>
          </ContentSection>
        </ContentLayout>
      </div>
    );
  }

  // Failed state (default fallback)
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--ds-color-neutral-background-default)',
      paddingTop: 'var(--ds-spacing-16)',
    }}>
      <ContentLayout>
        <ContentSection>
          <Card
            style={{
              maxWidth: '600px',
              margin: '0 auto',
              padding: 'var(--ds-spacing-8)',
              border: '2px solid var(--ds-color-danger-border-default)',
            }}
          >
            <Stack gap="24px" align="center" style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--ds-color-danger-background-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--ds-font-size-heading-1)',
              }}>
                ✕
              </div>
              <Heading size="lg" level={1}>
                {t('payment.cancelled')}
              </Heading>
              <Paragraph size="md">
                {t('payment.cancelledDescription')}
              </Paragraph>
              <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('payment.orderId')}: {orderId}
              </Paragraph>
              <Stack direction="horizontal" gap="12px" justify="center">
                <Button type="button" variant="secondary" onClick={() => navigate('/')}>
                  {t('common.goToHome')}
                </Button>
                <Button type="button" onClick={() => navigate(-1)}>
                  {t('common.back')}
                </Button>
              </Stack>
            </Stack>
          </Card>
        </ContentSection>
      </ContentLayout>
    </div>
  );
}
