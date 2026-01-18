/**
 * BulkActionsBar
 * Action bar that appears when rental objects are selected
 */

import { useT } from '@xala/i18n';
import { Button, Badge, Stack } from '@xala/ds';

export interface BulkActionsBarProps {
  selectedCount: number;
  onPublish: () => void;
  onUnpublish: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onPublish,
  onUnpublish,
  onArchive,
  onDelete,
  onClearSelection,
}: BulkActionsBarProps) {
  const t = useT();

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'var(--ds-spacing-6)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        border: '1px solid var(--ds-color-neutral-border-default)',
        borderRadius: 'var(--ds-border-radius-xl)',
        boxShadow: 'var(--ds-shadow-xl)',
        padding: 'var(--ds-spacing-4) var(--ds-spacing-6)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-4)',
        animation: 'slideUp 0.3s ease',
      }}
    >
      {/* Selected Count Badge */}
      <Badge color="accent" size="lg">
        {t('bulk.selected', { count: selectedCount })}
      </Badge>

      {/* Divider */}
      <div
        style={{
          width: '1px',
          height: '32px',
          backgroundColor: 'var(--ds-color-neutral-border-default)',
        }}
      />

      {/* Action Buttons */}
      <Stack direction="row" gap={3}>
        <Button variant="secondary" size="sm" onClick={onPublish} type="button">
          {t('bulk.publishSelected')}
        </Button>

        <Button variant="secondary" size="sm" onClick={onUnpublish} type="button">
          {t('bulk.unpublishSelected')}
        </Button>

        <Button variant="secondary" size="sm" onClick={onArchive} type="button">
          {t('bulk.archiveSelected')}
        </Button>

        <Button variant="danger" size="sm" onClick={onDelete} type="button">
          {t('bulk.deleteSelected')}
        </Button>
      </Stack>

      {/* Divider */}
      <div
        style={{
          width: '1px',
          height: '32px',
          backgroundColor: 'var(--ds-color-neutral-border-default)',
        }}
      />

      {/* Clear Selection */}
      <Button variant="tertiary" size="sm" onClick={onClearSelection} type="button">
        {t('action.cancel')}
      </Button>

      {/* Animation */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateX(-50%) translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
