/**
 * RentalObjectsGrid
 * Card-based grid view for rental objects
 */

import { useNavigate } from 'react-router-dom';
import { useT } from '@xala/i18n';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Stack,
  Spinner,
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

  const handleItemClick = (item: RentalObject) => {
    navigate(`/rental-objects/${item.slug}`);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 'var(--ds-spacing-6)',
        padding: 'var(--ds-spacing-4)',
      }}
    >
      {rentalObjects.map((item) => (
        <RentalObjectCard
          key={item.id}
          item={item}
          isSelected={selectedIds.includes(item.id)}
          onSelect={(selected) => onSelectOne?.(item.id, selected)}
          onItemClick={handleItemClick}
        />
      ))}
    </div>
  );
}

interface RentalObjectCardProps {
  item: RentalObject;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onItemClick?: (item: RentalObject) => void;
}

function RentalObjectCard({ item, isSelected: _isSelected, onSelect: _onSelect, onItemClick }: RentalObjectCardProps) {
  const t = useT();
  const navigate = useNavigate();

  const primaryImage = item.images?.[0] || '/placeholder-image.jpg';
  const isAvailable = item.status === 'published';

  // Format price display
  const priceDisplay = item.pricing
    ? `${(item.pricing.basePrice / 100).toFixed(0)} kr/${t(`rentalObjects.pricingUnit.${item.pricing.unit}`)}`
    : t('rentalObjects.priceNotSet');

  // Format capacity label based on category
  const getCapacityLabel = () => {
    if (!item.capacity) return null;

    if (item.category === 'LOKALER_OG_BANER') {
      return `${item.capacity} ${t('rentalObjects.persons')}`;
    }
    if (item.category === 'OPPLEVELSER_OG_ARRANGEMENT') {
      return `${item.capacity} ${t('rentalObjects.participants')}`;
    }
    if (item.bookingFeatures?.inventory) {
      return `${item.bookingFeatures.inventory.total} ${t('rentalObjects.available')}`;
    }
    return null;
  };

  const capacityLabel = getCapacityLabel();

  // Format location
  const locationFormatted = item.location?.city || t('rentalObjects.noLocation');

  // Get category translation key
  const categoryI18nKey = `rentalObjects.category.${item.category}`;

  // Description excerpt (first 100 characters)
  const descriptionExcerpt = item.description
    ? item.description.substring(0, 100) + (item.description.length > 100 ? '...' : '')
    : '';

  const handleViewClick = () => {
    if (onItemClick) {
      onItemClick(item);
    } else {
      navigate(`/rental-objects/${item.slug}`);
    }
  };

  const _handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/rental-objects/${item.slug}/edit`);
  };

  return (
    <Card
      style={{
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={handleViewClick}
    >
      {/* Image Section */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '200px',
          overflow: 'hidden',
          borderTopLeftRadius: 'var(--ds-border-radius-lg)',
          borderTopRightRadius: 'var(--ds-border-radius-lg)',
        }}
      >
        <img
          src={primaryImage}
          alt={item.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Category Badge */}
        <div
          style={{
            position: 'absolute',
            top: 'var(--ds-spacing-3)',
            left: 'var(--ds-spacing-3)',
          }}
        >
          <Badge color="info">{t(categoryI18nKey)}</Badge>
        </div>

        {/* Availability Badge */}
        {!isAvailable && (
          <div
            style={{
              position: 'absolute',
              top: 'var(--ds-spacing-3)',
              right: 'var(--ds-spacing-3)',
            }}
          >
            <Badge color="warning">{t('rentalObjects.notAvailable')}</Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div
        style={{
          padding: 'var(--ds-spacing-5)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        <Heading level={3} data-size="sm" style={{ margin: 0 }}>
          {item.name}
        </Heading>

        {descriptionExcerpt && (
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              color: 'var(--ds-color-neutral-text-subtle)',
              lineHeight: 'var(--ds-line-height-md)',
            }}
          >
            {descriptionExcerpt}
          </Paragraph>
        )}

        {/* Location (only for venues and experiences) */}
        {(item.category === 'LOKALER_OG_BANER' ||
          item.category === 'OPPLEVELSER_OG_ARRANGEMENT') && (
          <Stack direction="horizontal" spacing="var(--ds-spacing-2)">
            <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>📍</span>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              {locationFormatted}
            </Paragraph>
          </Stack>
        )}

        {/* Price and Capacity */}
        <Stack
          direction="horizontal"
          spacing="var(--ds-spacing-2)"
          style={{ marginTop: 'auto', paddingTop: 'var(--ds-spacing-3)' }}
        >
          <Paragraph
            style={{
              margin: 0,
              fontWeight: 'var(--ds-font-weight-bold)',
              color: 'var(--ds-color-accent-text-default)',
            }}
          >
            {priceDisplay}
          </Paragraph>
          {capacityLabel && (
            <>
              <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>•</span>
              <Paragraph
                data-size="sm"
                style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}
              >
                {capacityLabel}
              </Paragraph>
            </>
          )}
        </Stack>
      </div>

      {/* Actions */}
      <div
        style={{
          padding: 'var(--ds-spacing-5)',
          paddingTop: 0,
          display: 'flex',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        <Button
          variant="secondary"
          data-size="sm"
          onClick={handleViewClick}
          style={{ flex: 1 }} type="button"
        >
          {t('common.viewDetails')}
        </Button>
      </div>

      {/* Hover Effect */}
      <style>{`
        div[role="group"]:hover {
          transform: translateY(-4px);
          box-shadow: var(--ds-shadow-lg);
        }
      `}</style>
    </Card>
  );
}
