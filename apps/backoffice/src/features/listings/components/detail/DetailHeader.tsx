/**
 * Detail Header
 * Header component for listing detail page with back navigation and action buttons
 * Displays listing name, metadata, and administrative actions
 * Integrates EditModal with RBAC permissions
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Heading, Paragraph, ChevronLeftIcon } from '@xala/ds';
import type { Listing } from '@digilist/client-sdk';
import { EditModal } from './EditModal';
import { useListingPermissions } from '../../hooks/useListingPermissions';

export interface DetailHeaderProps {
  /** The full listing object */
  listing: Listing;
  /** Callback when more button is clicked */
  onMore?: () => void;
  /** Back navigation path (defaults to /listings) */
  backPath?: string;
  /** Callback when edit is successful */
  onEditSuccess?: () => void;
}

/**
 * DetailHeader component
 *
 * @example
 * ```tsx
 * <DetailHeader
 *   listing={listing}
 *   onMore={() => handleMore()}
 *   onEditSuccess={() => refetch()}
 * />
 * ```
 */
export function DetailHeader({
  listing,
  onMore,
  backPath = '/listings',
  onEditSuccess,
}: DetailHeaderProps) {
  const navigate = useNavigate();
  const { canEditListing } = useListingPermissions();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // RBAC check: Can user edit this listing based on status?
  const canEdit = canEditListing(listing.status);

  // Additional check: Disable edit for archived listings
  const isArchived = listing.status?.toLowerCase() === 'archived';
  const isEditDisabled = !canEdit || isArchived;

  const handleEditClick = () => {
    if (!isEditDisabled) {
      setIsEditModalOpen(true);
    }
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
  };

  const handleEditSuccess = () => {
    onEditSuccess?.();
  };

  return (
    <>
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
              {listing.name}
            </Heading>
            <Paragraph
              data-size="sm"
              style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
            >
              {listing.type}{listing.city ? ` • ${listing.city}` : ' • Ukjent lokasjon'}
            </Paragraph>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleEditClick}
            disabled={isEditDisabled}
            title={isArchived ? 'Kan ikke redigere arkiverte objekter' : undefined}
          >
            Rediger
          </Button>
          {onMore && (
            <Button type="button" variant="tertiary" onClick={onMore}>
              Mer
            </Button>
          )}
        </div>
      </div>

      {/* Edit Modal - Integrated with RBAC */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        listing={listing}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
