/**
 * BulkActionsBar
 *
 * A floating action bar component for bulk operations on rental objects.
 * Appears when items are selected in a list view.
 *
 * @example
 * ```tsx
 * import { BulkActionsBar } from '@digilist/ui/blocks/rental-objects';
 *
 * function RentalObjectsList() {
 *   const [selectedIds, setSelectedIds] = useState<string[]>([]);
 *
 *   return (
 *     <>
 *       <RentalObjectGrid
 *         selectedIds={selectedIds}
 *         onSelectionChange={setSelectedIds}
 *       />
 *       <BulkActionsBar
 *         selectedCount={selectedIds.length}
 *         onPublish={() => handleBulkPublish(selectedIds)}
 *         onUnpublish={() => handleBulkUnpublish(selectedIds)}
 *         onArchive={() => handleBulkArchive(selectedIds)}
 *         onDelete={() => handleBulkDelete(selectedIds)}
 *         onClearSelection={() => setSelectedIds([])}
 *       />
 *     </>
 *   );
 * }
 * ```
 */

import { useT } from '@xalatechnologies/platform/i18n';
import { Button, Badge } from '@xalatechnologies/platform/ui';

export interface BulkActionsBarProps {
  /** Number of selected items */
  selectedCount: number;
  /** Handler for bulk publish action */
  onPublish: () => void;
  /** Handler for bulk unpublish action */
  onUnpublish: () => void;
  /** Handler for bulk archive action */
  onArchive: () => void;
  /** Handler for bulk delete action */
  onDelete: () => void;
  /** Handler for clearing selection */
  onClearSelection: () => void;
  /** Custom class name */
  className?: string;
}

export function BulkActionsBar({
  selectedCount,
  onPublish,
  onUnpublish,
  onArchive,
  onDelete,
  onClearSelection,
  className,
}: BulkActionsBarProps) {
  const t = useT();

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className={className}
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
      <Badge data-color="accent" data-size="lg">
        {t('bulk.selected', { count: selectedCount }) || `${selectedCount} valgt`}
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
      <div style={{ display: 'flex', flexDirection: 'row', gap: 'var(--ds-spacing-3)' }}>
        <Button variant="secondary" data-size="sm" onClick={onPublish} type="button">
          {t('bulk.publishSelected') || 'Publiser'}
        </Button>

        <Button variant="secondary" data-size="sm" onClick={onUnpublish} type="button">
          {t('bulk.unpublishSelected') || 'Avpubliser'}
        </Button>

        <Button variant="secondary" data-size="sm" onClick={onArchive} type="button">
          {t('bulk.archiveSelected') || 'Arkiver'}
        </Button>

        <Button variant="primary" data-color="danger" data-size="sm" onClick={onDelete} type="button">
          {t('bulk.deleteSelected') || 'Slett'}
        </Button>
      </div>

      {/* Divider */}
      <div
        style={{
          width: '1px',
          height: '32px',
          backgroundColor: 'var(--ds-color-neutral-border-default)',
        }}
      />

      {/* Clear Selection */}
      <Button variant="tertiary" data-size="sm" onClick={onClearSelection} type="button">
        {t('action.cancel') || 'Avbryt'}
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
