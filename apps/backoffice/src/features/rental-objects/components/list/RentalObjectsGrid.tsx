/**
 * RentalObjectsGrid
 * Card-based grid view for rental objects using web frontend card design
 */

import { useNavigate } from 'react-router-dom';
import { useT } from '@xala/i18n';
import {
  RentalObjectCard,
  RentalObjectGrid,
  Spinner,
  Button,
  Paragraph,
  EditIcon,
  TrashIcon,
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
    <RentalObjectGrid minCardWidth={450} maxColumns={3}>
        {rentalObjects.map((item) => {
          // Map RentalObject to card props
          const primaryImage = item.primaryImageUrl || item.images?.[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18"%3EIngen bilde%3C/text%3E%3C/svg%3E';
          const priceAmount = item.pricing ? item.pricing.basePrice / 100 : 0;
          const priceUnit = item.pricing ? PRICE_UNIT_LABELS[item.pricing.unit] || item.pricing.unit : 'time';
          const locationFormatted = item.location?.city || t('rentalObjects.noLocation');
          const descriptionExcerpt = item.description
            ? item.description.substring(0, 100) + (item.description.length > 100 ? '...' : '')
            : '';

          return (
            <div
              key={item.id}
              style={{ position: 'relative' }}
            >
              <RentalObjectCard
                id={item.id}
                name={item.name}
                type={t(`rentalObjects.category.${item.category}`)}
                listingType={item.category as 'SPACE' | 'RESOURCE' | 'SERVICE' | 'VEHICLE' | 'EVENT' | 'OTHER'}
                location={locationFormatted}
                description={descriptionExcerpt}
                image={primaryImage}
                facilities={[]}
                capacity={item.capacity || 0}
                price={priceAmount}
                priceUnit={priceUnit}
                currency="NOK"
                imageHeight={260}
                showLocation={true}
                showDescription={true}
                showFacilities={true}
                showCapacity={true}
                showPrice={true}
                onClick={() => navigate(`/rental-objects/${item.slug || item.id}`)}
                onFavorite={undefined}
                onShare={undefined}
              />
              
              {/* Admin Action Buttons Overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 'var(--ds-spacing-4)',
                  left: 'var(--ds-spacing-4)',
                  right: 'var(--ds-spacing-4)',
                  display: 'flex',
                  gap: 'var(--ds-spacing-2)',
                  zIndex: 10,
                }}
              >
                <Button
                  variant="secondary"
                  data-size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(item.id, item.slug);
                  }}
                  style={{ flex: 1 }}
                  type="button"
                  title="Edit"
                >
                  <EditIcon size={16} />
                  Edit
                </Button>
                <Button
                  variant="tertiary"
                  data-size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  type="button"
                  title="Delete"
                >
                  <TrashIcon size={16} />
                </Button>
              </div>
            </div>
          );
        })}
    </RentalObjectGrid>
  );
}
