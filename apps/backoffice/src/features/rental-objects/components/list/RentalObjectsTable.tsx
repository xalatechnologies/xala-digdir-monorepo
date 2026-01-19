/**
 * RentalObjectsTable
 * Professional table view with sortable columns, selection, and actions
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@xala/i18n';
import {
  Badge,
  Button,
  Spinner,
  Paragraph,
} from '@xala/ds';
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
  // selectedIds = [],
  // onSelectionChange,
  onSort,
  sortBy,
  sortOrder = 'asc',
}: RentalObjectsTableProps) {
  const t = useT();
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);



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
        <Spinner aria-label={t('common.loading')} />
      </div>
    );
  }

  if (!items || items.length === 0) {
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
              isHovered={hoveredRow === item.id}
              canEdit={canEdit}
              canDelete={canDelete}
              onHover={(hover) => setHoveredRow(hover ? item.id : null)}
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
  isHovered: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onHover: (hover: boolean) => void;
}

function TableRow({
  item,
  isHovered,
  canEdit,
  canDelete,
  onHover,
}: TableRowProps) {
  const t = useT();
  const navigate = useNavigate();

  const primaryImage = item.primaryImageUrl || item.images?.[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="60"%3E%3Crect fill="%23ddd" width="80" height="60"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10"%3ENo image%3C/text%3E%3C/svg%3E';

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

  const handleView = () => navigate(`/rental-objects/${item.slug}/view`);
  // Route is rental-objects/:slug (edit is default view for this path)
  const handleEdit = () => navigate(`/rental-objects/${item.slug}`);

  const handleDelete = () => {
    if (confirm(t('rentalObjects.confirmDelete', { name: item.name }))) {
      // TODO: Implement delete via SDK
      console.log('Delete', item.id);
    }
  };

  return (
    <tr
      style={{
        backgroundColor: isHovered
            ? 'var(--ds-color-neutral-surface-hover)'
            : 'transparent',
        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
        transition: 'background-color 0.15s ease',
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >


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
          <Button variant="tertiary" onClick={handleView} type="button">
            {t('common.view')}
          </Button>
          {canEdit && (
            <Button variant="secondary" onClick={handleEdit} type="button">
              {t('action.edit')}
            </Button>
          )}
          {canDelete && (
            <Button variant="secondary" data-color="danger" onClick={handleDelete} type="button">
              {t('action.delete')}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
