/**
 * VenueCard Block - Reusable DS Component
 *
 * Displays venue information with image, details, and apply action.
 * Domain-agnostic - receives all data and handlers via props.
 *
 * @example
 * ```tsx
 * // In app with i18n
 * import { useT } from '@xala/i18n';
 *
 * function MyVenueCard({ venue }) {
 *   const t = useT();
 *
 *   return (
 *     <VenueCard
 *       venue={venue}
 *       onApply={(id) => navigate(`/venues/${id}/apply`)}
 *       labels={{
 *         capacity: t('common.capacity'),
 *         apply: t('common.apply'),
 *       }}
 *     />
 *   );
 * }
 * ```
 */
import { Card, Badge } from '@digdir/designsystemet-react';
import { Heading, Paragraph, Button } from '@digdir/designsystemet-react';

// =============================================================================
// Types
// =============================================================================

export interface VenueCardData {
  id: string;
  name: string;
  description?: string;
  capacity?: number;
  size?: number;
  address?: { street?: string; city?: string };
  imageUrl?: string;
  categories?: string[];
}

export interface VenueCardLabels {
  capacity: string;
  apply: string;
}

export interface VenueCardProps {
  venue: VenueCardData;
  onApply?: (id: string) => void;
  showApplyButton?: boolean;
  /** Labels for i18n */
  labels?: Partial<VenueCardLabels>;
  'data-testid'?: string;
}

// =============================================================================
// Default Labels
// =============================================================================

const DEFAULT_LABELS: VenueCardLabels = {
  capacity: 'Kapasitet',
  apply: 'Sok',
};

// =============================================================================
// Component
// =============================================================================

export function VenueCard({
  venue,
  onApply,
  showApplyButton = true,
  labels: customLabels,
  'data-testid': testId = 'venue-card',
}: VenueCardProps) {
  const labels = { ...DEFAULT_LABELS, ...customLabels };
  const categories = venue.categories || [];

  return (
    <Card data-testid={testId} style={{ padding: 0, border: '1px solid var(--ds-color-neutral-border-default)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: '100%', height: '150px', backgroundColor: 'var(--ds-color-neutral-background-subtle)', backgroundImage: venue.imageUrl ? `url(${venue.imageUrl})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ padding: 'var(--ds-spacing-5)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
        <Heading level={3} data-size="sm" style={{ margin: 0 }}>{venue.name}</Heading>
        {venue.address && <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>{venue.address.street}, {venue.address.city}</Paragraph>}
        {venue.description && <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>{venue.description}</Paragraph>}
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', marginTop: 'auto' }}>
          {venue.capacity && <Badge data-size="sm">{labels.capacity}: {venue.capacity}</Badge>}
          {categories.slice(0, 2).map((c, i) => <Badge key={i} data-size="sm">{c}</Badge>)}
        </div>
      </div>
      {showApplyButton && onApply && (
        <div style={{ padding: 'var(--ds-spacing-4)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
          <Button type="button" variant="primary" data-size="sm" onClick={() => onApply(venue.id)} style={{ width: '100%' }}>{labels.apply}</Button>
        </div>
      )}
    </Card>
  );
}
