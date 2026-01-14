/**
 * Detail Header
 * Header component for listing detail page with back navigation and action buttons
 * Displays listing name, metadata, and administrative actions
 */

import { useNavigate } from 'react-router-dom';
import { Button, Heading, Paragraph, ChevronLeftIcon } from '@xala/ds';

export interface DetailHeaderProps {
  /** Listing name/title */
  name: string;
  /** Listing type (e.g., "SPACE", "RESOURCE") */
  type: string;
  /** Location/city */
  location?: string;
  /** Listing slug for edit navigation */
  slug: string;
  /** Callback when edit button is clicked */
  onEdit?: () => void;
  /** Callback when more button is clicked */
  onMore?: () => void;
  /** Back navigation path (defaults to /listings) */
  backPath?: string;
}

/**
 * DetailHeader component
 *
 * @example
 * ```tsx
 * <DetailHeader
 *   name="Møterom 101"
 *   type="SPACE"
 *   location="Oslo"
 *   slug="moterom-101"
 *   onEdit={() => handleEdit()}
 *   onMore={() => handleMore()}
 * />
 * ```
 */
export function DetailHeader({
  name,
  type,
  location,
  slug,
  onEdit,
  onMore,
  backPath = '/listings',
}: DetailHeaderProps) {
  const navigate = useNavigate();

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      navigate(`/listings/${slug}`);
    }
  };

  return (
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
          onClick={() => navigate(backPath)}
          aria-label="Tilbake til liste"
        >
          <ChevronLeftIcon size={20} />
        </Button>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            {name}
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
          >
            {type}{location ? ` • ${location}` : ' • Ukjent lokasjon'}
          </Paragraph>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
        <Button type="button" variant="secondary" onClick={handleEdit}>
          Rediger
        </Button>
        {onMore && (
          <Button type="button" variant="tertiary" onClick={onMore}>
            Mer
          </Button>
        )}
      </div>
    </div>
  );
}
