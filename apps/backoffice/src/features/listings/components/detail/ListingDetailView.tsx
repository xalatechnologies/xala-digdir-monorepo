/**
 * Listing Detail View
 * Main container for the listing detail page with tabs for overview, bookings, availability, and audit
 * Admin interface for comprehensive facility management
 */

import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  Card,
  Heading,
  Paragraph,
  Spinner,
  ChevronLeftIcon,
} from '@xala/ds';
import { useListingBySlug, useListing } from '@digilist/client-sdk';
import { OverviewTab } from './OverviewTab';
import { BookingsTab } from './BookingsTab';
import { AvailabilityTab } from './AvailabilityTab';
import { EditModal } from './EditModal';

interface ListingDetailViewProps {
  slug: string;
}

export function ListingDetailView({ slug }: ListingDetailViewProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Check if the param looks like a UUID (ID) or a slug
  const isUuid = slug?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

  // Fetch listing data by slug or ID
  const slugQuery = useListingBySlug(slug || '', {
    enabled: !!slug && !isUuid,
  });

  const idQuery = useListing(slug || '', {
    enabled: !!slug && !!isUuid,
  });

  const data = isUuid ? idQuery.data : slugQuery.data;
  const isLoading = isUuid ? idQuery.isLoading : slugQuery.isLoading;
  const error = isUuid ? idQuery.error : slugQuery.error;
  const listing = data?.data;
  const refetch = isUuid ? idQuery.refetch : slugQuery.refetch;

  // Active tab from URL query params
  const activeTab = searchParams.get('tab') || 'overview';

  const handleTabChange = useCallback((tab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const handleEditClick = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleEditModalClose = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const handleEditSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'var(--ds-spacing-10)',
          minHeight: '400px',
        }}
      >
        <Spinner aria-label="Laster utleieobjekt..." />
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
        <Button type="button" variant="primary" onClick={() => navigate('/listings')}>
          <ChevronLeftIcon size={16} />
          Tilbake til liste
        </Button>
      </Card>
    );
  }

  // Not found state
  if (!listing) {
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
        <Button type="button" variant="primary" onClick={() => navigate('/listings')}>
          <ChevronLeftIcon size={16} />
          Tilbake til liste
        </Button>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          paddingBottom: 'var(--ds-spacing-4)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
          <Button
            type="button"
            variant="tertiary"
            onClick={() => navigate('/listings')}
            aria-label="Tilbake til liste"
          >
            <ChevronLeftIcon size={20} />
          </Button>
          <div>
            <Heading level={1} data-size="lg" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
              {listing.name}
            </Heading>
            <Paragraph
              data-size="sm"
              style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
            >
              {listing.type} • {listing.city || 'Ukjent lokasjon'}
            </Paragraph>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
          <Button type="button" variant="secondary" onClick={handleEditClick}>
            Rediger
          </Button>
          <Button type="button" variant="tertiary">
            Mer
          </Button>
        </div>
      </div>

      {/* Tabs Section */}
      <div>
        <div
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-2)',
            borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
            marginBottom: 'var(--ds-spacing-6)',
          }}
        >
          {[
            { id: 'overview', label: 'Oversikt' },
            { id: 'bookings', label: 'Bookinger' },
            { id: 'availability', label: 'Tilgjengelighet' },
            { id: 'audit', label: 'Endringslogg' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              style={{
                padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                background: 'none',
                border: 'none',
                borderBottom:
                  activeTab === tab.id
                    ? '2px solid var(--ds-color-accent-border-default)'
                    : '2px solid transparent',
                color:
                  activeTab === tab.id
                    ? 'var(--ds-color-accent-text-default)'
                    : 'var(--ds-color-neutral-text-subtle)',
                fontWeight: activeTab === tab.id ? 600 : 400,
                cursor: 'pointer',
                fontSize: 'var(--ds-font-size-md)',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
              }}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          {activeTab === 'overview' && <OverviewTab listing={listing} />}
          {activeTab === 'bookings' && <BookingsTab listingId={listing.id} />}
          {activeTab === 'availability' && (
            <AvailabilityTab listingId={listing.id} listingName={listing.name} />
          )}
          {activeTab === 'audit' && (
            <div>
              <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
                Endringslogg
              </Heading>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                Oversikt over alle endringer og hendelser for dette utleieobjektet kommer her.
              </Paragraph>
            </div>
          )}
        </Card>
      </div>

      {/* Edit Modal */}
      {listing && (
        <EditModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          listing={listing}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
