/**
 * RentalObjectsTable
 * Professional table view with sortable columns, selection, and actions
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@xalatechnologies/platform/i18n';
import {
  Badge,
  Button,
  Checkbox,
  Spinner,
  Paragraph,
} from '@xalatechnologies/platform/ui';
import type { RentalObject } from '@digilist/client-sdk/types';

export interface RentalObjectsTableProps {
  items: RentalObject[];
  isLoading?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

type SortableColumn = 'name' | 'category' | 'price' | 'status';

export function RentalObjectsTable({
  items,
  isLoading = false,
  canEdit = false,
  canDelete = false,
  selectedIds = [],
  onSelectionChange,
  onSort,
  sortBy,
  sortOrder = 'asc',
}: RentalObjectsTableProps) {
  const t = useT();
  const navigate = useNavigate();
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? items.map((item) => item.id) : []);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (onSelectionChange) {
      const newSelection = checked
        ? [...selectedIds, id]
        : selectedIds.filter((selectedId) => selectedId !== id);
      onSelectionChange(newSelection);
    }
  };

  const handleSortColumn = (column: SortableColumn) => {
    if (onSort) {
      const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
      onSort(column, newOrder);
    }
  };

  const getSortIcon = (column: SortableColumn) => {
    if (sortBy !== column) return '⇅';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-10)' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
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

  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
          overflow: 'hidden',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
              borderBottom: '2px solid var(--ds-color-neutral-border-default)',
            }}
          >
            {/* Selection Checkbox */}
            {onSelectionChange && (
              <th style={{ width: '48px', padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  aria-label={t('common.selectAll')}
                />
              </th>
            )}

            {/* Thumbnail */}
            <th
              style={{
                width: '80px',
                padding: 'var(--ds-spacing-4)',
                textAlign: 'left',
                fontWeight: 'var(--ds-font-weight-semibold)',
                color: 'var(--ds-color-neutral-text-default)',
              }}
            >
              {t('rentalObjects.table.image')}
            </th>

            {/* Name */}
            <th
              style={{
                padding: 'var(--ds-spacing-4)',
                textAlign: 'left',
                fontWeight: 'var(--ds-font-weight-semibold)',
                color: 'var(--ds-color-neutral-text-default)',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => handleSortColumn('name')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                {t('rentalObjects.table.name')}
                <span style={{ opacity: 0.5, fontSize: 'var(--ds-font-size-sm)' }}>
                  {getSortIcon('name')}
                </span>
              </div>
            </th>

            {/* Category */}
            <th
              style={{
                padding: 'var(--ds-spacing-4)',
                textAlign: 'left',
                fontWeight: 'var(--ds-font-weight-semibold)',
                color: 'var(--ds-color-neutral-text-default)',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => handleSortColumn('category')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                {t('rentalObjects.table.category')}
                <span style={{ opacity: 0.5, fontSize: 'var(--ds-font-size-sm)' }}>
                  {getSortIcon('category')}
                </span>
              </div>
            </th>

            {/* Location */}
            <th
              style={{
                padding: 'var(--ds-spacing-4)',
                textAlign: 'left',
                fontWeight: 'var(--ds-font-weight-semibold)',
                color: 'var(--ds-color-neutral-text-default)',
              }}
              className="hide-on-mobile"
            >
              {t('rentalObjects.table.location')}
            </th>

            {/* Capacity */}
            <th
              style={{
                padding: 'var(--ds-spacing-4)',
                textAlign: 'left',
                fontWeight: 'var(--ds-font-weight-semibold)',
                color: 'var(--ds-color-neutral-text-default)',
              }}
              className="hide-on-mobile"
            >
              {t('rentalObjects.table.capacity')}
            </th>

            {/* Price */}
            <th
              style={{
                padding: 'var(--ds-spacing-4)',
                textAlign: 'left',
                fontWeight: 'var(--ds-font-weight-semibold)',
                color: 'var(--ds-color-neutral-text-default)',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => handleSortColumn('price')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                {t('rentalObjects.table.price')}
                <span style={{ opacity: 0.5, fontSize: 'var(--ds-font-size-sm)' }}>
                  {getSortIcon('price')}
                </span>
              </div>
            </th>

            {/* Status */}
            <th
              style={{
                padding: 'var(--ds-spacing-4)',
                textAlign: 'left',
                fontWeight: 'var(--ds-font-weight-semibold)',
                color: 'var(--ds-color-neutral-text-default)',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => handleSortColumn('status')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                {t('rentalObjects.table.status')}
                <span style={{ opacity: 0.5, fontSize: 'var(--ds-font-size-sm)' }}>
                  {getSortIcon('status')}
                </span>
              </div>
            </th>

            {/* Actions */}
            <th
              style={{
                width: '180px',
                padding: 'var(--ds-spacing-4)',
                textAlign: 'right',
                fontWeight: 'var(--ds-font-weight-semibold)',
                color: 'var(--ds-color-neutral-text-default)',
              }}
            >
              {t('common.actions')}
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              item={item}
              isSelected={selectedIds.includes(item.id)}
              isHovered={hoveredRow === item.id}
              canEdit={canEdit}
              canDelete={canDelete}
              onSelect={(checked) => handleSelectRow(item.id, checked)}
              onHover={(hover) => setHoveredRow(hover ? item.id : null)}
              showSelection={!!onSelectionChange}
            />
          ))}
        </tbody>
      </table>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .hide-on-mobile {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

interface TableRowProps {
  item: RentalObject;
  isSelected: boolean;
  isHovered: boolean;
  canEdit: boolean;
  canDelete: boolean;
  showSelection: boolean;
  onSelect: (checked: boolean) => void;
  onHover: (hover: boolean) => void;
}

function TableRow({
  item,
  isSelected,
  isHovered,
  canEdit,
  canDelete,
  showSelection,
  onSelect,
  onHover,
}: TableRowProps) {
  const t = useT();
  const navigate = useNavigate();

  const primaryImage = item.images?.[0] || '/placeholder-image.jpg';

  const priceDisplay = item.pricing
    ? `${(item.pricing.basePrice / 100).toFixed(0)} kr/${t(`rentalObjects.pricingUnit.${item.pricing.unit}`)}`
    : t('rentalObjects.priceNotSet');

  const getCapacityLabel = () => {
    if (!item.capacity) return '-';
    if (item.category === 'LOKALER_OG_BANER') {
      return `${item.capacity} ${t('rentalObjects.persons')}`;
    }
    if (item.category === 'OPPLEVELSER_OG_ARRANGEMENT') {
      return `${item.capacity} ${t('rentalObjects.participants')}`;
    }
    if (item.bookingFeatures?.inventory) {
      return `${item.bookingFeatures.inventory.total} ${t('rentalObjects.available')}`;
    }
    return '-';
  };

  const locationFormatted =
    item.category === 'LOKALER_OG_BANER' || item.category === 'OPPLEVELSER_OG_ARRANGEMENT'
      ? item.location?.city || '-'
      : t('rentalObjects.noLocationRequired');

  const statusColor =
    item.status === 'published' ? 'success' : item.status === 'draft' ? 'warning' : 'neutral';

  const handleView = () => navigate(`/rental-objects/${item.slug}`);
  const handleEdit = () => navigate(`/rental-objects/${item.slug}/edit`);
  const handleDuplicate = () => navigate(`/rental-objects/${item.slug}/duplicate`);
  const handleDelete = () => {
    if (confirm(t('rentalObjects.confirmDelete', { name: item.name }))) {
      // TODO: Implement delete via SDK
      console.log('Delete', item.id);
    }
  };

  return (
    <tr
      style={{
        backgroundColor: isSelected
          ? 'var(--ds-color-accent-surface-subtle)'
          : isHovered
            ? 'var(--ds-color-neutral-surface-hover)'
            : 'transparent',
        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
        transition: 'background-color 0.15s ease',
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Selection */}
      {showSelection && (
        <td style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
          <Checkbox
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            aria-label={t('common.select')}
          />
        </td>
      )}

      {/* Thumbnail */}
      <td style={{ padding: 'var(--ds-spacing-4)' }}>
        <img
          src={primaryImage}
          alt={item.name}
          style={{
            width: '60px',
            height: '60px',
            objectFit: 'cover',
            borderRadius: 'var(--ds-border-radius-md)',
          }}
        />
      </td>

      {/* Name */}
      <td style={{ padding: 'var(--ds-spacing-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-1)' }}>
          <Paragraph
            style={{
              margin: 0,
              fontWeight: 'var(--ds-font-weight-semibold)',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            {item.name}
          </Paragraph>
          <Badge color="info" size="sm">
            {t(`rentalObjects.category.${item.category}`)}
          </Badge>
        </div>
      </td>

      {/* Category */}
      <td style={{ padding: 'var(--ds-spacing-4)' }}>
        <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t(`rentalObjects.category.${item.category}`)}
        </Paragraph>
      </td>

      {/* Location */}
      <td style={{ padding: 'var(--ds-spacing-4)' }} className="hide-on-mobile">
        <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
          {locationFormatted}
        </Paragraph>
      </td>

      {/* Capacity */}
      <td style={{ padding: 'var(--ds-spacing-4)' }} className="hide-on-mobile">
        <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
          {getCapacityLabel()}
        </Paragraph>
      </td>

      {/* Price */}
      <td style={{ padding: 'var(--ds-spacing-4)' }}>
        <Paragraph
          style={{
            margin: 0,
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-accent-text-default)',
          }}
        >
          {priceDisplay}
        </Paragraph>
      </td>

      {/* Status */}
      <td style={{ padding: 'var(--ds-spacing-4)' }}>
        <Badge color={statusColor}>{t(`rentalObjects.status.${item.status}`)}</Badge>
      </td>

      {/* Actions */}
      <td style={{ padding: 'var(--ds-spacing-4)', textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', justifyContent: 'flex-end' }}>
          <Button variant="tertiary" size="sm" onClick={handleView} type="button">
            {t('common.view')}
          </Button>
          {canEdit && (
            <Button variant="secondary" size="sm" onClick={handleEdit} type="button">
              {t('common.edit')}
            </Button>
          )}
          {canDelete && (
            <Button variant="danger" size="sm" onClick={handleDelete} type="button">
              {t('common.delete')}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
