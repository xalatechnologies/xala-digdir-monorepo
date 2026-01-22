/**
 * Rental Object Detail View
 * Main container for rental object detail page with tabs
 *
 * NOTE: Rental objects use rental_object terminology throughout.
 * Internally, rental objects are stored as listings with type=RESOURCE.
 */

import { Component, useCallback, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  Card,
  Heading,
  Paragraph,
  Skeleton,
  ChevronLeftIcon,
  AlertTriangleIcon,
  DashboardPageHeader,
  Breadcrumb,
} from '@xalatechnologies/platform/ui';
import { useRentalObjectBySlug, useRentalObject } from '@digilist/client-sdk';
import { RentalObjectOverviewTab } from './RentalObjectOverviewTab';
import { RentalObjectBookingsTab } from './RentalObjectBookingsTab';
import { RentalObjectAvailabilityTab } from './RentalObjectAvailabilityTab';
import { RentalObjectAuditTab } from './RentalObjectAuditTab';
import { RentalObjectCustodyTab } from './RentalObjectCustodyTab';
import { useT } from '@xalatechnologies/platform/i18n';

/**
 * Error Boundary to catch JavaScript runtime errors
 * Prevents entire page crash when component rendering fails
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    // Log error to console for debugging (in development)
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

interface RentalObjectDetailViewProps {
  slug: string;
}

export function RentalObjectDetailView({ slug }: RentalObjectDetailViewProps) {
  const t = useT();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Check if the param looks like a UUID (ID) or a slug
  const isUuid = slug?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

  // Fetch rental object data by slug or ID
  // NOTE: Uses rental object hooks - rental objects are RESOURCE type listings
  const slugQuery = useRentalObjectBySlug(slug || '');
  const idQuery = useRentalObject(slug || '');

  const data = isUuid ? idQuery.data : slugQuery.data;
  const isLoading = isUuid ? idQuery.isLoading : slugQuery.isLoading;
  const error = isUuid ? idQuery.error : slugQuery.error;
  const rentalObject = data?.data;
  const refetch = isUuid ? idQuery.refetch : slugQuery.refetch;

  // Active tab from URL query params
  const activeTab = searchParams.get('tab') || 'overview';

  const handleTabChange = useCallback((tab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  // refetch can be used for refresh after edit
  void refetch;

  // Loading state - Skeleton screen
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
        {/* Header Skeleton */}
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            {/* Title and status */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <Skeleton width="60%" height={32} style={{ marginBottom: 'var(--ds-spacing-2)' }} />
                <Skeleton width="40%" height={20} />
              </div>
              <Skeleton width={100} height={40} />
            </div>
            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
              <Skeleton width={120} height={40} />
              <Skeleton width={120} height={40} />
            </div>
          </div>
        </Card>

        {/* Tabs Skeleton */}
        <div>
          <div
            style={{
              display: 'flex',
              gap: 'var(--ds-spacing-2)',
              borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
              marginBottom: 'var(--ds-spacing-6)',
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width={100} height={40} style={{ marginBottom: '-1px' }} />
            ))}
          </div>

          {/* Tab Content Skeleton */}
          <Card style={{ padding: 'var(--ds-spacing-6)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
              {/* Image gallery skeleton */}
              <Skeleton width="100%" height={400} />

              {/* Key facts skeleton */}
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)' }}>
                <Skeleton width="30%" height={80} />
                <Skeleton width="30%" height={80} />
                <Skeleton width="30%" height={80} />
              </div>

              {/* Description skeleton */}
              <div>
                <Skeleton width="30%" height={24} style={{ marginBottom: 'var(--ds-spacing-3)' }} />
                <Skeleton width="100%" height={16} style={{ marginBottom: 'var(--ds-spacing-2)' }} />
                <Skeleton width="100%" height={16} style={{ marginBottom: 'var(--ds-spacing-2)' }} />
                <Skeleton width="80%" height={16} />
              </div>

              {/* Amenities skeleton */}
              <div>
                <Skeleton width="25%" height={24} style={{ marginBottom: 'var(--ds-spacing-3)' }} />
                <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} width={100} height={32} />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Error state - RFC 7807 compliant
  if (error) {
    return (
      <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Kunne ikke laste utleieobjekt
        </Heading>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginBottom: 'var(--ds-spacing-4)' }}
        >
          Det oppstod en feil ved lasting av objektet. Vennligst prøv igjen senere.
        </Paragraph>
        <Button type="button" variant="primary" onClick={() => navigate('/rental-objects')}>
          <ChevronLeftIcon size={16} />
          Tilbake til liste
        </Button>
      </Card>
    );
  }

  // Not found state
  if (!rentalObject) {
    return (
      <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Utleieobjekt ikke funnet
        </Heading>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginBottom: 'var(--ds-spacing-4)' }}
        >
          Objektet du leter etter finnes ikke eller du har ikke tilgang.
        </Paragraph>
        <Button type="button" variant="primary" onClick={() => navigate('/rental-objects')}>
          <ChevronLeftIcon size={16} />
          Tilbake til liste
        </Button>
      </Card>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
            <AlertTriangleIcon
              size={48}
              style={{ color: 'var(--ds-color-danger-border-default)' }}
            />
          </div>
          <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
            Noe gikk galt
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginBottom: 'var(--ds-spacing-4)' }}
          >
            Det oppstod en uventet feil ved visning av objektet. Vennligst prøv igjen.
          </Paragraph>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', justifyContent: 'center' }}>
            <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
              Last inn på nytt
            </Button>
            <Button type="button" variant="primary" onClick={() => navigate('/rental-objects')}>
              <ChevronLeftIcon size={16} />
              Tilbake til liste
            </Button>
          </div>
        </Card>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
        {/* Header Section with Breadcrumb and Tabs */}
        <DashboardPageHeader
          breadcrumb={
            <Breadcrumb
              items={[
                { label: t('nav.rentalObjects'), href: '/rental-objects' },
                { label: rentalObject.name },
              ]}
            />
          }
          title={rentalObject.name}
          subtitle={rentalObject.description?.slice(0, 100)}
          primaryAction={
            <Button
              type="button"
              variant="primary"
              onClick={() => navigate(`/rental-objects/${slug}`)}
            >
              {t('actions.edit')}
            </Button>
          }
          tabs={[
            { id: 'overview', label: t('ui.overview') },
            { id: 'bookings', label: t('nav.bookings') },
            { id: 'availability', label: t('common.tilgjengelighet') },
            { id: 'custody', label: t('common.ansvar') },
            { id: 'audit', label: t('common.endringslogg') },
          ]}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Tab Content */}
        <div>

          {/* Tab Content */}
          <Card style={{ padding: 'var(--ds-spacing-6)' }}>
            {activeTab === 'overview' && <RentalObjectOverviewTab rentalObject={rentalObject} />}
            {activeTab === 'bookings' && <RentalObjectBookingsTab rentalObjectId={rentalObject.id} />}
            {activeTab === 'availability' && (
              <RentalObjectAvailabilityTab
                rentalObjectId={rentalObject.id}
                rentalObjectName={rentalObject.name}
              />
            )}
            {activeTab === 'custody' && <RentalObjectCustodyTab rentalObjectId={rentalObject.id} />}
            {activeTab === 'audit' && <RentalObjectAuditTab rentalObjectId={rentalObject.id} />}
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
}
