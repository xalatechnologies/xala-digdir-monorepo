import { Card, Heading, Paragraph, Button, Badge } from '@xala/ds';
import type { RentalObject } from '@digilist/client-sdk/types';
import { useT } from '@xala/i18n';

/**
 * Venue Card Component
 *
 * Displays a venue/rental object that supports season bookings.
 */

// Icons
function MapPinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function SquareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </svg>
  );
}

interface VenueCardProps {
  venue: RentalObject;
  onApply?: (venueId: string) => void;
  showApplyButton?: boolean;
}

export function VenueCard({ venue, onApply, showApplyButton = true }: VenueCardProps) {
  const t = useT();

  const handleApply = () => {
    if (onApply) {
      onApply(venue.id);
    }
  };

  return (
    <Card
      style={{
        padding: 0,
        border: '1px solid var(--ds-color-neutral-border-default)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s',
      }}
    >
      {/* Image */}
      {venue.images && venue.images.length > 0 ? (
        <div
          style={{
            width: '100%',
            height: '180px',
            backgroundColor: 'var(--ds-color-neutral-background-subtle)',
            backgroundImage: `url(${typeof venue.images[0] === 'string' ? venue.images[0] : (venue.images[0] as any)?.url || ''})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '180px',
            backgroundColor: 'var(--ds-color-neutral-background-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          }}
        >
          <MapPinIcon />
        </div>
      )}

      {/* Content */}
      <div
        style={{
          padding: 'var(--ds-spacing-5)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        {/* Header */}
        <div>
          <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            {venue.name}
          </Heading>
          {(venue as any).address && (
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                color: 'var(--ds-color-neutral-text-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-1)',
              }}
            >
              <MapPinIcon />
              {(venue as any).address.street}, {(venue as any).address.city}
            </Paragraph>
          )}
        </div>

        {/* Description */}
        {venue.description && (
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              color: 'var(--ds-color-neutral-text-subtle)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {venue.description}
          </Paragraph>
        )}

        {/* Metadata */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-3)',
            flexWrap: 'wrap',
            marginTop: 'auto',
          }}
        >
          {venue.capacity && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
              <UsersIcon />
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('seasons.venue.persons', { count: venue.capacity })}
              </Paragraph>
            </div>
          )}
          {(venue as any).size && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
              <SquareIcon />
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('seasons.venue.area', { size: (venue as any).size })}
              </Paragraph>
            </div>
          )}
        </div>

        {/* Categories/Tags */}
        {(venue.category || (venue as any).categories) && (
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
            {(Array.isArray((venue as any).categories) ? (venue as any).categories : [venue.category]).filter(Boolean).slice(0, 3).map((category: string, index: number) => (
              <Badge
                key={index}
                data-size="sm"
                style={{
                  backgroundColor: 'var(--ds-color-neutral-surface-default)',
                  color: 'var(--ds-color-neutral-text-default)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                }}
              >
                {category}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {showApplyButton && (
        <div
          style={{
            padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
            borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
            backgroundColor: 'var(--ds-color-neutral-background-subtle)',
          }}
        >
          <Button
            type="button"
            variant="primary"
            data-size="sm"
            onClick={handleApply}
            style={{ width: '100%' }}
          >
            {t('seasons.venue.applyForThis')}
          </Button>
        </div>
      )}
    </Card>
  );
}
