/**
 * Listings Routes
 * Page components for the listings module
 */

import { useParams, useNavigate } from 'react-router-dom';
import { Heading, Paragraph, Button, Card, Spinner, ChevronLeftIcon } from '@xala/ds';
import { ListingsListView } from '../features/listings/components/list/ListingsListView';
import { ListingWizard } from '../features/listings/components/wizard';
import { useListingBySlug, useListing } from '@digilist/client-sdk';

/**
 * Listings Page - Main list view with filtering and search
 */
export function ListingsPage() {
  return <ListingsListView />;
}

/**
 * Listing Edit Page - Multi-step wizard for create/edit
 */
export function ListingEditPage() {
  const { slug } = useParams<{ slug: string }>();

  return <ListingWizard slug={slug} />;
}

/**
 * Listing Detail Page - Read-only view with audit trail
 * TODO: Replace with full ListingDetailView component in Phase 5
 */
export function ListingDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

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
  const listing = data?.data;

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
        <Spinner aria-label="Laster..." />
      </div>
    );
  }

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
          Tilbake til liste
        </Button>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
          <Button
            type="button"
            variant="tertiary"
            onClick={() => navigate('/listings')}
            aria-label="Tilbake til liste"
          >
            <ChevronLeftIcon />
          </Button>
          <div>
            <Heading level={1} data-size="lg" style={{ margin: 0 }}>
              {listing.name}
            </Heading>
            <Paragraph
              data-size="sm"
              style={{
                color: 'var(--ds-color-neutral-text-subtle)',
                margin: 0,
                marginTop: 'var(--ds-spacing-1)',
              }}
            >
              {listing.type} • {listing.status}
            </Paragraph>
          </div>
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={() => navigate(`/listings/${listing.slug}`)}
        >
          Rediger
        </Button>
      </div>

      {/* Placeholder Content */}
      <Card
        style={{
          padding: 'var(--ds-spacing-6)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
        }}
      >
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Detaljer
        </Heading>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--ds-spacing-4)',
          }}
        >
          <div>
            <Paragraph
              data-size="xs"
              style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginBottom: 'var(--ds-spacing-1)' }}
            >
              Navn
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              {listing.name}
            </Paragraph>
          </div>
          <div>
            <Paragraph
              data-size="xs"
              style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginBottom: 'var(--ds-spacing-1)' }}
            >
              Type
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              {listing.type}
            </Paragraph>
          </div>
          <div>
            <Paragraph
              data-size="xs"
              style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginBottom: 'var(--ds-spacing-1)' }}
            >
              Status
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              {listing.status}
            </Paragraph>
          </div>
          <div>
            <Paragraph
              data-size="xs"
              style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginBottom: 'var(--ds-spacing-1)' }}
            >
              Kapasitet
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              {listing.capacity || 'Ikke angitt'}
            </Paragraph>
          </div>
          <div>
            <Paragraph
              data-size="xs"
              style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginBottom: 'var(--ds-spacing-1)' }}
            >
              Opprettet
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              {new Date(listing.createdAt).toLocaleDateString('nb-NO')}
            </Paragraph>
          </div>
          <div>
            <Paragraph
              data-size="xs"
              style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginBottom: 'var(--ds-spacing-1)' }}
            >
              Sist oppdatert
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              {new Date(listing.updatedAt).toLocaleDateString('nb-NO')}
            </Paragraph>
          </div>
        </div>
      </Card>

      {/* Description */}
      {listing.description && (
        <Card
          style={{
            padding: 'var(--ds-spacing-6)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
          }}
        >
          <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
            Beskrivelse
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            {listing.description}
          </Paragraph>
        </Card>
      )}

      {/* Audit Trail Placeholder */}
      <Card
        style={{
          padding: 'var(--ds-spacing-6)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
        }}
      >
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Endringslogg
        </Heading>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
        >
          Audit trail vil vises her når Phase 5 er implementert.
        </Paragraph>
      </Card>
    </div>
  );
}
