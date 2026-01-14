/**
 * Publish Controls Component
 * Status badge and publishing action buttons with RBAC checks
 */

import { useState } from 'react';
import {
  Button,
  Dialog,
  Heading,
  Paragraph,
  ListingStatusBadge,
} from '@xala/ds';
import {
  usePublishListing,
  useArchiveListing,
} from '@digilist/client-sdk';
import { useListingPermissions } from '../../hooks/useListingPermissions';
import { useToast } from '../../../../providers/ToastProvider';
import type { ListingStatus } from '@digilist/client-sdk';

interface PublishControlsProps {
  listingId: string;
  listingName: string;
  status: ListingStatus;
  onActionComplete?: (() => void) | undefined;
}

export function PublishControls({
  listingId,
  listingName,
  status,
  onActionComplete,
}: PublishControlsProps) {
  const toast = useToast();
  const { canPublishListing, canArchiveListing } = useListingPermissions();
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

  const publishMutation = usePublishListing();
  const archiveMutation = useArchiveListing();

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(listingId);
      onActionComplete?.();
      toast.success('Publisert', `"${listingName}" er nå publisert!`);
    } catch (error) {
      console.error('Failed to publish listing:', error);
      toast.error('Kunne ikke publisere', error instanceof Error ? error.message : 'En uventet feil oppstod');
    }
  };

  const handleArchive = async () => {
    try {
      await archiveMutation.mutateAsync(listingId);
      setArchiveDialogOpen(false);
      onActionComplete?.();
      toast.success('Arkivert', `"${listingName}" er nå arkivert`);
    } catch (error) {
      console.error('Failed to archive listing:', error);
      setArchiveDialogOpen(false);
      toast.error('Kunne ikke arkivere', error instanceof Error ? error.message : 'En uventet feil oppstod');
    }
  };

  const isLoading = publishMutation.isPending || archiveMutation.isPending;

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        {/* Status Badge */}
        <ListingStatusBadge status={status} />

        {/* Publish Button - Only for drafts, admin only */}
        {canPublishListing(status) && (
          <Button
            onClick={handlePublish}
            disabled={isLoading}
            size="sm"
            variant="primary"
          >
            Publiser
          </Button>
        )}

        {/* Archive Button - Only for published, admin only */}
        {canArchiveListing(status) && (
          <Button
            onClick={() => setArchiveDialogOpen(true)}
            disabled={isLoading}
            size="sm"
            variant="secondary"
          >
            Arkiver
          </Button>
        )}
      </div>

      {/* Archive Confirmation Dialog */}
      <Dialog open={archiveDialogOpen} onClose={() => setArchiveDialogOpen(false)}>
        <Dialog.Block>
          <Heading level={2} data-size="sm">Arkiver objekt</Heading>
          <Paragraph>
            Er du sikker på at du vil arkivere &quot;{listingName}&quot;?
            Objektet vil ikke lenger være synlig for brukere.
          </Paragraph>
        </Dialog.Block>
        <Dialog.Actions>
          <Button
            variant="secondary"
            onClick={() => setArchiveDialogOpen(false)}
            disabled={isLoading}
          >
            Avbryt
          </Button>
          <Button
            variant="primary"
            onClick={handleArchive}
            disabled={isLoading}
          >
            Arkiver
          </Button>
        </Dialog.Actions>
      </Dialog>
    </>
  );
}
