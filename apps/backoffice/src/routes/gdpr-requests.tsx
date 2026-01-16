/**
 * GDPR Requests Page
 * Admin view for managing GDPR data subject rights requests
 * Shows pending requests with 30-day GDPR timeline tracking
 */

/* eslint-disable digdir/prefer-ds-components, digdir/require-interactive-labels -- Complex filter form */

import { useState, useMemo } from 'react';
import {
  Button,
  Heading,
  Paragraph,
  Spinner,
  Badge,
  Text,
  Card,
  Alert,
} from '@xala/ds';

import {
  usePendingGdprRequests,
  useMyGdprRequests,
  type GdprRequest,
  type GdprRequestQueryParams,
} from '@digilist/client-sdk';

import { GdprRequestQueue } from '../components/gdpr/GdprRequestQueue';
import { RequestDetailModal } from '../components/gdpr/RequestDetailModal';

// Status tabs for main navigation
const STATUS_TABS = [
  { id: 'pending', label: 'Ventende', icon: '⏳', color: 'warning' },
  { id: 'processing', label: 'Behandles', icon: '⚙️', color: 'info' },
  { id: 'completed', label: 'Fullført', icon: '✓', color: 'success' },
  { id: 'rejected', label: 'Avslått', icon: '✕', color: 'danger' },
  { id: 'all', label: 'Alle', icon: '📋', color: 'neutral' },
] as const;

export function GdprRequestsPage() {
  // State
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Build query params based on active tab
  const requestParams = useMemo(() => {
    const params: GdprRequestQueryParams = {};
    if (activeTab !== 'all') params.status = activeTab as GdprRequestQueryParams['status'];
    return Object.keys(params).length > 0 ? params : undefined;
  }, [activeTab]);

  // Fetch requests based on active tab
  const { data: requestsData, isLoading } = useMyGdprRequests(requestParams);

  // Fetch counts for all status tabs
  const { data: pendingData } = usePendingGdprRequests();
  const { data: processingData } = useMyGdprRequests({ status: 'processing' });
  const { data: completedData } = useMyGdprRequests({ status: 'completed' });
  const { data: rejectedData } = useMyGdprRequests({ status: 'rejected' });
  const { data: allData } = useMyGdprRequests();

  // Tab counts
  const tabCounts: Record<string, number> = {
    pending: pendingData?.meta?.total ?? pendingData?.data?.length ?? 0,
    processing: processingData?.meta?.total ?? processingData?.data?.length ?? 0,
    completed: completedData?.meta?.total ?? completedData?.data?.length ?? 0,
    rejected: rejectedData?.meta?.total ?? rejectedData?.data?.length ?? 0,
    all: allData?.meta?.total ?? allData?.data?.length ?? 0,
  };

  const totalCount = requestsData?.meta?.total || requestsData?.data?.length || 0;

  // Handlers
  const handleRequestClick = (request: GdprRequest) => {
    setSelectedRequestId(request.id);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRequestId(null);
  };

  const handleModalSuccess = () => {
    // Modal closes automatically, data will refetch via React Query
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--ds-color-neutral-background-default)' }}>
      {/* Page Header */}
      <div
        style={{
          backgroundColor: 'var(--ds-color-neutral-background-subtle)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          padding: 'var(--ds-spacing-6) var(--ds-spacing-8)',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-2)' }}>
            <Heading level={1} data-size="lg" style={{ margin: 0 }}>
              GDPR-forespørsler
            </Heading>
            {(tabCounts.pending ?? 0) > 0 && (
              <Badge data-color="warning" data-size="md">
                {tabCounts.pending ?? 0} ventende
              </Badge>
            )}
          </div>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            Administrer datarettighetsforespørsler fra innbyggere. GDPR krever at forespørsler behandles innen 30 dager.
          </Paragraph>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--ds-spacing-6) var(--ds-spacing-8)' }}>
        {/* Status Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-2)',
            marginBottom: 'var(--ds-spacing-6)',
            overflowX: 'auto',
            paddingBottom: 'var(--ds-spacing-2)',
          }}
        >
          {STATUS_TABS.map((tab) => {
            const count = tabCounts[tab.id] || 0;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-2)',
                  padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                  border: '1px solid',
                  borderColor: isActive
                    ? 'var(--ds-color-brand-border-default)'
                    : 'var(--ds-color-neutral-border-default)',
                  backgroundColor: isActive
                    ? 'var(--ds-color-brand-surface-subtle)'
                    : 'var(--ds-color-neutral-background-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  cursor: 'pointer',
                  fontWeight: isActive ? 'var(--ds-font-weight-medium)' : 'normal',
                  color: isActive
                    ? 'var(--ds-color-brand-text-default)'
                    : 'var(--ds-color-neutral-text-default)',
                  fontSize: 'var(--ds-font-size-sm)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <Badge
                  data-color={isActive ? tab.color : 'neutral'}
                  data-size="sm"
                  style={{
                    backgroundColor: isActive
                      ? undefined
                      : 'var(--ds-color-neutral-background-subtle)',
                  }}
                >
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>

        {/* Info Alert for pending requests */}
        {activeTab === 'pending' && (tabCounts.pending ?? 0) > 0 && (
          <Alert data-color="warning" style={{ marginBottom: 'var(--ds-spacing-6)' }}>
            <Heading level={3} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-1)' }}>
              Ventende forespørsler
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              Du har {tabCounts.pending ?? 0} ventende forespørsel{(tabCounts.pending ?? 0) > 1 ? 'er' : ''}.
              Forespørsler må behandles innen 30 dager etter GDPR-regelverket.
            </Paragraph>
          </Alert>
        )}

        {/* Content Card */}
        <Card style={{ padding: 0 }}>
          {isLoading && (
            <div
              style={{
                padding: 'var(--ds-spacing-10)',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--ds-spacing-4)',
              }}
            >
              <Spinner aria-label="Laster forespørsler..." />
              <Text style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                Laster forespørsler...
              </Text>
            </div>
          )}

          {!isLoading && totalCount === 0 && (
            <div
              style={{
                padding: 'var(--ds-spacing-10)',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--ds-spacing-4)',
              }}
            >
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                {activeTab === 'all'
                  ? 'Ingen forespørsler ennå'
                  : `Ingen ${STATUS_TABS.find((t) => t.id === activeTab)?.label.toLowerCase()} forespørsler`}
              </Paragraph>
            </div>
          )}

          {!isLoading && totalCount > 0 && activeTab === 'pending' && (
            <div style={{ padding: 'var(--ds-spacing-4)' }}>
              <GdprRequestQueue onRequestClick={handleRequestClick} />
            </div>
          )}

          {!isLoading && totalCount > 0 && activeTab !== 'pending' && (
            <div
              style={{
                padding: 'var(--ds-spacing-10)',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--ds-spacing-4)',
              }}
            >
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                Fant {totalCount} forespørsel{totalCount > 1 ? 'er' : ''} med status{' '}
                {STATUS_TABS.find((t) => t.id === activeTab)?.label.toLowerCase()}.
              </Paragraph>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setActiveTab('pending')}
              >
                Gå til ventende forespørsler
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Request Detail Modal */}
      <RequestDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        requestId={selectedRequestId}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
