/**
 * RentalObjectsGrid
 * Card-based grid view for rental objects using web frontend card design
 */

import { useNavigate } from 'react-router-dom';
import { useT } from '@xala/i18n';
import {
  Card,
  Spinner,
  Button,
  Paragraph,
  Heading,
  EditIcon,
  TrashIcon,
  CopyIcon,
  InboxIcon,
} from '@xala/ds';
import type { RentalObject } from '@digilist/client-sdk/types';

export interface RentalObjectsGridProps {
  rentalObjects: RentalObject[];
  isLoading?: boolean;
  selectedIds?: string[];
  onSelectOne?: (id: string, selected: boolean) => void;
  onRefresh?: () => void;
}

export function RentalObjectsGrid({
  rentalObjects,
  isLoading = false,
  selectedIds = [],
  onSelectOne,
  onRefresh: _onRefresh,
}: RentalObjectsGridProps) {
  const t = useT();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-10)' }}>
        <Spinner aria-label={t('state.loading')} />
      </div>
    );
  }

  if (rentalObjects.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--ds-spacing-10)',
          color: 'var(--ds-color-neutral-text-subtle)',
        }}
      >
        <Paragraph>{t('rentalObjects.noResults')}</Paragraph>
      </div>
    );
  }

  const handleEdit = (id: string, slug?: string) => {
    navigate(`/rental-objects/${slug || id}/edit`);
  };

  const handleClone = (id: string, slug?: string) => {
    // Navigate to create wizard with cloned data using slug
    navigate(`/rental-objects/create?cloneFrom=${slug || id}`);
  };

  const handleArchive = (id: string) => {
    // TODO: Implement archive functionality with confirmation
    console.log('Archive rental object:', id);
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality with confirmation
    console.log('Delete rental object:', id);
  };

  const PRICE_UNIT_LABELS: Record<string, string> = {
    'day': 'dag',
    'hour': 'time',
    'week': 'uke',
    'month': 'måned',
    'year': 'år',
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: 'var(--ds-spacing-6)',
      padding: 'var(--ds-spacing-4)'
    }}>
      {rentalObjects.map((item) => {
        const primaryImage = item.primaryImageUrl || item.images?.[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18"%3EIngen bilde%3C/text%3E%3C/svg%3E';
        const priceAmount = item.pricing ? item.pricing.basePrice / 100 : 0;
        const priceUnit = item.pricing ? PRICE_UNIT_LABELS[item.pricing.unit] || item.pricing.unit : 'time';
        const locationFormatted = item.location?.city || t('rentalObjects.noLocation');

        return (
          <Card
            key={item.id}
            style={{
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onClick={() => navigate(`/rental-objects/${item.slug || item.id}`)}
          >
            {/* Image */}
            <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}>
              <img
                src={primaryImage}
                alt={item.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18"%3EIngen bilde%3C/text%3E%3C/svg%3E';
                }}
              />
              {/* Category Badge */}
              <div style={{
                position: 'absolute',
                top: 'var(--ds-spacing-2)',
                left: 'var(--ds-spacing-2)',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: 'var(--ds-spacing-1) var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                fontSize: 'var(--ds-font-size-sm)',
              }}>
                {item.category}
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: 'var(--ds-spacing-4)' }}>
              <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                {item.name}
              </Heading>
              
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-2)' }}>
                {locationFormatted}
              </Paragraph>

              {item.capacity && (
                <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                  Kapasitet: {item.capacity} personer
                </Paragraph>
              )}

              {priceAmount > 0 && (
                <Paragraph data-size="sm" style={{ fontWeight: 600, marginBottom: 'var(--ds-spacing-4)' }}>
                  {priceAmount} kr/{priceUnit}
                </Paragraph>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-4)' }}>
                <Button
                  variant="secondary"
                  data-size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(item.id, item.slug);
                  }}
                >
                  <EditIcon aria-hidden style={{ width: '1rem', height: '1rem', marginRight: 'var(--ds-spacing-1)' }} />
                  {t('action.edit')}
                </Button>
                <Button
                  variant="secondary"
                  data-size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClone(item.id, item.slug);
                  }}
                >
                  <CopyIcon aria-hidden style={{ width: '1rem', height: '1rem', marginRight: 'var(--ds-spacing-1)' }} />
                  {t('action.clone')}
                </Button>
                <Button
                  variant="secondary"
                  data-size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchive(item.id);
                  }}
                >
                  <InboxIcon aria-hidden style={{ width: '1rem', height: '1rem', marginRight: 'var(--ds-spacing-1)' }} />
                  {t('action.archive')}
                </Button>
                <Button
                  variant="secondary"
                  data-size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                >
                  <TrashIcon aria-hidden style={{ width: '1rem', height: '1rem', marginRight: 'var(--ds-spacing-1)' }} />
                  {t('action.delete')}
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
