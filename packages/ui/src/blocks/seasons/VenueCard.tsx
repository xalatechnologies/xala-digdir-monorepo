/**
 * VenueCard Block - Digilist Domain Component
 *
 * Domain-specific component for displaying venue information in seasonal context.
 * Migrated from @xalatechnologies/platform/ui to @digilist/ui for platform decoupling.
 */
import { Card, Heading, Paragraph, Button } from '@xalatechnologies/platform/ui/primitives';
import { Badge } from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';

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

export interface VenueCardProps {
  venue: VenueCardData;
  onApply?: (id: string) => void;
  showApplyButton?: boolean;
  'data-testid'?: string;
}

export function VenueCard({ venue, onApply, showApplyButton = true, 'data-testid': testId = 'venue-card' }: VenueCardProps) {
  const t = useT();
  const categories = venue.categories || [];

  return (
    <Card data-testid={testId} style={{ padding: 0, border: '1px solid var(--ds-color-neutral-border-default)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: '100%', height: '150px', backgroundColor: 'var(--ds-color-neutral-background-subtle)', backgroundImage: venue.imageUrl ? `url(${venue.imageUrl})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ padding: 'var(--ds-spacing-5)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
        <Heading level={3} data-size="sm" style={{ margin: 0 }}>{venue.name}</Heading>
        {venue.address && <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>{venue.address.street}, {venue.address.city}</Paragraph>}
        {venue.description && <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>{venue.description}</Paragraph>}
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', marginTop: 'auto' }}>
          {venue.capacity && <Badge size="sm">{t('common.capacity')}: {venue.capacity}</Badge>}
          {categories.slice(0, 2).map((c, i) => <Badge key={i} size="sm">{c}</Badge>)}
        </div>
      </div>
      {showApplyButton && onApply && (
        <div style={{ padding: 'var(--ds-spacing-4)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
          <Button type="button" variant="primary" data-size="sm" onClick={() => onApply(venue.id)} style={{ width: '100%' }}>{t('common.apply')}</Button>
        </div>
      )}
    </Card>
  );
}
