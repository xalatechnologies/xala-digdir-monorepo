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
  CheckIcon,
  EyeIcon,
  Dialog,
} from '@xalatechnologies/platform/ui';
import { useState } from 'react';
import type { RentalObject } from '@digilist/client-sdk/types';
import { usePublishRentalObject, useUnpublishRentalObject, useArchiveRentalObject } from '@digilist/client-sdk/hooks';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<RentalObject | null>(null);
  
  // SDK mutations for publish/unpublish/archive
  const publishMutation = usePublishRentalObject();
  const unpublishMutation = useUnpublishRentalObject();
  const archiveMutation = useArchiveRentalObject();

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
    // Route is rental-objects/:slug (edit is default view for this path)
    navigate(`/rental-objects/${slug || id}`);
  };

  const handleClone = (id: string, slug?: string) => {
    // Navigate to create wizard with cloned data using slug
    navigate(`/rental-objects/create?cloneFrom=${slug || id}`);
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveMutation.mutateAsync(id);
      if (_onRefresh) _onRefresh();
    } catch (error) {
      console.error('Failed to archive:', error);
    }
  };

  const handleDelete = (item: RentalObject) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      // TODO: Call SDK delete method
      console.log('Deleting rental object:', itemToDelete.id);
      // await sdk.rentalObjects.delete(itemToDelete.id);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      // Refresh list if callback provided
      if (_onRefresh) _onRefresh();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handlePublish = async (id: string, currentlyPublished: boolean) => {
    try {
      if (currentlyPublished) {
        await unpublishMutation.mutateAsync(id);
      } else {
        await publishMutation.mutateAsync(id);
      }
      if (_onRefresh) _onRefresh();
    } catch (error) {
      console.error('Failed to publish/unpublish:', error);
    }
  };

  const PRICE_UNIT_LABELS: Record<string, string> = {
    'day': 'dag',
    'hour': 'time',
    'week': 'uke',
    'month': 'måned',
    'year': 'år',
  };

  return (
    <>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: 'var(--ds-spacing-6)',
      padding: 'var(--ds-spacing-4)'
    }}>
      {rentalObjects.map((item) => {
        // Cast to any to access projection fields that may not be in RentalObject type
        const projection = item as any;
        
        const primaryImage = projection.primaryImageUrl || item.images?.[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18"%3EIngen bilde%3C/text%3E%3C/svg%3E';
        const priceAmount = projection.priceAmount ? projection.priceAmount / 100 : (item.pricing ? item.pricing.basePrice / 100 : 0);
        const priceUnit = projection.priceUnit || (item.pricing ? PRICE_UNIT_LABELS[item.pricing.unit] || item.pricing.unit : 'time');
        const locationFormatted = projection.city || projection.locationFormatted || item.location?.city || t('rentalObjects.noLocation');
        // isAvailable is true when status is 'published' - from card projection
        const isPublished = projection.isAvailable === true;

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
                {isPublished ? (
                  <Button
                    variant="tertiary"
                    data-size="sm"
                    data-color="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePublish(item.id, isPublished);
                    }}
                    style={{ gridColumn: '1 / -1' }}
                  >
                    <EyeIcon aria-hidden style={{ width: '1rem', height: '1rem', marginRight: 'var(--ds-spacing-1)' }} />
                    {t('action.unpublish')}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    data-size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePublish(item.id, isPublished);
                    }}
                    style={{ gridColumn: '1 / -1' }}
                  >
                    <CheckIcon aria-hidden style={{ width: '1rem', height: '1rem', marginRight: 'var(--ds-spacing-1)' }} />
                    {t('action.publish')}
                  </Button>
                )}
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
                    handleDelete(item);
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

    {/* Delete Confirmation Dialog */}
    <Dialog.TriggerContext>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <Dialog.Block>
          <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            {t('rentalObjects.deleteConfirmTitle')}
          </Heading>
          <Paragraph>
            {t('rentalObjects.deleteConfirmMessage', { name: itemToDelete?.name || '' })}
          </Paragraph>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-danger-text-default)', marginTop: 'var(--ds-spacing-2)' }}>
            {t('common.actionCannotBeUndone')}
          </Paragraph>
        </Dialog.Block>
        <Dialog.Block>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', justifyContent: 'flex-end' }}>
            <Button
              variant="secondary"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t('action.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={confirmDelete}
              style={{ backgroundColor: 'var(--ds-color-danger-background-default)' }}
            >
              {t('action.delete')}
            </Button>
          </div>
        </Dialog.Block>
      </Dialog>
    </Dialog.TriggerContext>
    </>
  );
}
