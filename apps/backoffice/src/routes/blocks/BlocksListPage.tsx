/**
 * Blocks List Page
 * List view for calendar blocks (maintenance, closures, etc.)
 */
import { useState } from 'react';
import {
  Card,
  Paragraph,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Badge,
  Skeleton,
  PlusIcon,
  TrashIcon,
  EditIcon,
  EyeIcon,
  useDialog,
  PageHeader,
  NativeSelect,
} from '@xalatechnologies/platform/ui';
import { useBlocks, useAssignedBlocks, useDeleteBlock, useAssignedRentalObjects } from '@digilist/client-sdk/hooks';
import { useT } from '@xala/i18n';
import { useNavigate } from 'react-router-dom';
import { useCapabilityContext } from '../../providers/CapabilityProvider';
import { useBackofficeRole } from '../../hooks/useBackofficeRole';

export function BlocksListPage(): React.ReactElement {
  const t = useT();
  const navigate = useNavigate();
  const { hasCapability } = useCapabilityContext();
  const { effectiveRole } = useBackofficeRole();
  const { confirm } = useDialog();

  // Filter state
  const [selectedRentalObjectId, setSelectedRentalObjectId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Determine if we should use scoped access
  const isOrgAdmin = effectiveRole === 'org_admin' || effectiveRole === 'org_member';
  const canManageBlocks = hasCapability('CAP_BLOCKS_MANAGE_ASSIGNED') || hasCapability('CAP_BOOKING_MANAGE');
  const canCreateBlock = canManageBlocks;

  // Fetch rental objects for filter dropdown
  const { data: rentalObjectsData } = useAssignedRentalObjects();
  const rentalObjects = rentalObjectsData?.data ?? [];

  // Fetch blocks based on role
  const queryParams = {
    rentalObjectId: selectedRentalObjectId || undefined,
    status: statusFilter || undefined,
    limit: 50,
  };

  const { data: blocksData, isLoading, error, refetch } = isOrgAdmin
    ? useAssignedBlocks(queryParams)
    : useBlocks(queryParams);

  const blocks = blocksData?.data ?? [];
  const deleteBlockMutation = useDeleteBlock();

  // Handle delete
  const handleDelete = async (blockId: string, blockTitle: string) => {
    const confirmed = await confirm({
      title: t('blocks.deleteConfirm.page.title'),
      description: t('blocks.deleteConfirm.description', { title: blockTitle }),
      variant: 'danger',
    });

    if (confirmed) {
      deleteBlockMutation.mutate(blockId, {
        onSuccess: () => {
          refetch();
        },
      });
    }
  };

  // Format date range for display
  const formatDateRange = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };

    if (start.toDateString() === end.toDateString()) {
      return `${start.toLocaleDateString('nb-NO', dateOptions)} ${start.toLocaleTimeString('nb-NO', timeOptions)} - ${end.toLocaleTimeString('nb-NO', timeOptions)}`;
    }
    return `${start.toLocaleDateString('nb-NO', dateOptions)} ${start.toLocaleTimeString('nb-NO', timeOptions)} - ${end.toLocaleDateString('nb-NO', dateOptions)} ${end.toLocaleTimeString('nb-NO', timeOptions)}`;
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'completed':
        return 'neutral';
      default:
        return 'info';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton width="30%" height={40} />
          <Skeleton width={150} height={40} />
        </div>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} width="100%" height={60} style={{ marginBottom: 'var(--ds-spacing-3)' }} />
          ))}
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card style={{ padding: 'var(--ds-spacing-6)', textAlign: 'center' }}>
        <Paragraph style={{ color: 'var(--ds-color-danger-text-default)' }}>
          {t('error.generic')}: {error.message}
        </Paragraph>
        <Button type="button" variant="secondary" onClick={() => refetch()}>
          {t('action.retry')}
        </Button>
      </Card>
    );
  }

  return (
    <div data-testid="blocks-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <PageHeader
        title={t('blocks.page.title')}
        subtitle={t('blocks.description')}
        actions={
          canCreateBlock && (
            <Button type="button" variant="primary" onClick={() => navigate('/blocks/new')} aria-label={t('action.create')}>
              <PlusIcon />
              {t('blocks.createBlock')}
            </Button>
          )
        }
      />

      {/* Filters */}
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: 'var(--ds-font-size-sm)', marginBottom: 'var(--ds-spacing-1)' }}>
              {t('blocks.filterByRentalObject')}
            </label>
            <NativeSelect
              value={selectedRentalObjectId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedRentalObjectId(e.target.value)}
            >
              <option value="">{t('label.all')}</option>
              {rentalObjects.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.name}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div style={{ minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: 'var(--ds-font-size-sm)', marginBottom: 'var(--ds-spacing-1)' }}>
              {t('blocks.filterByStatus')}
            </label>
            <NativeSelect
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
            >
              <option value="">{t('label.all')}</option>
              <option value="active">{t('blocks.status.active')}</option>
              <option value="cancelled">{t('blocks.status.cancelled')}</option>
            </NativeSelect>
          </div>
        </div>
      </Card>

      {/* Blocks table */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        {blocks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('blocks.noBlocks')}
            </Paragraph>
            {canCreateBlock && (
              <Button type="button" variant="secondary" onClick={() => navigate('/blocks/new')} style={{ marginTop: 'var(--ds-spacing-4)' }} aria-label={t('action.create')}>
                <PlusIcon />
                {t('blocks.createFirstBlock')}
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>{t('blocks.table.page.title')}</TableHeaderCell>
                <TableHeaderCell>{t('blocks.table.type')}</TableHeaderCell>
                <TableHeaderCell>{t('blocks.table.dateRange')}</TableHeaderCell>
                <TableHeaderCell>{t('blocks.table.status')}</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: 'right' }}>{t('common.actions')}</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {blocks.map((block) => (
                <TableRow key={block.id}>
                  <TableCell>
                    <div>
                      <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                        {block.title}
                      </Paragraph>
                      {block.notes && (
                        <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}>
                          {block.notes.length > 50 ? `${block.notes.substring(0, 50)}...` : block.notes}
                        </Paragraph>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge data-color="neutral" data-size="sm">
                      {t(`blocks.type.${block.blockType}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Paragraph data-size="sm" style={{ margin: 0 }}>
                      {formatDateRange(block.startTime, block.endTime)}
                    </Paragraph>
                    {block.recurrenceRule && (
                      <Badge data-color="info" data-size="sm" style={{ marginTop: 'var(--ds-spacing-1)' }}>
                        {t('blocks.recurring')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge data-color={getStatusColor(block.status)}>
                      {t(`blocks.status.${block.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', justifyContent: 'flex-end' }}>
                      <Button
                        type="button"
                        variant="tertiary"
                        data-size="sm"
                        onClick={() => navigate(`/blocks/${block.id}`)}
                        title={t('common.view')}
                      >
                        <EyeIcon />
                      </Button>
                      {canManageBlocks && (
                        <>
                          <Button
                            type="button"
                            variant="tertiary"
                            data-size="sm"
                            onClick={() => navigate(`/blocks/${block.id}/edit`)}
                            title={t('action.edit')}
                          >
                            <EditIcon />
                          </Button>
                          <Button
                            type="button"
                            variant="tertiary"
                            data-size="sm"
                            data-color="danger"
                            onClick={() => handleDelete(block.id, block.title)}
                            title={t('action.delete')}
                            disabled={deleteBlockMutation.isPending}
                          >
                            <TrashIcon />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

export default BlocksListPage;
