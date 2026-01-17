/**
 * Blocks List Page
 * List view for calendar blocks (maintenance, closures, etc.)
 */
import { useState } from 'react';
import {
  Card,
  Heading,
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
  Select,
  PlusIcon,
  TrashIcon,
  EditIcon,
  EyeIcon,
  useDialog,
} from '@xala/ds';
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
  const canDeleteBlock = canManageBlocks;

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
      title: t('blocks.deleteConfirm.title'),
      description: t('blocks.deleteConfirm.description', { title: blockTitle }),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
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
  const formatDateRange = (startDate: string, endDate: string, allDay: boolean) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };

    if (allDay) {
      if (start.toDateString() === end.toDateString()) {
        return start.toLocaleDateString('nb-NO', dateOptions);
      }
      return `${start.toLocaleDateString('nb-NO', dateOptions)} - ${end.toLocaleDateString('nb-NO', dateOptions)}`;
    }

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
          {t('common.error')}: {error.message}
        </Paragraph>
        <Button type="button" variant="secondary" onClick={() => refetch()}>
          {t('common.retry')}
        </Button>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            {t('blocks.title')}
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            {t('blocks.description')}
          </Paragraph>
        </div>
        {canCreateBlock && (
          <Button type="button" variant="primary" onClick={() => navigate('/blocks/new')}>
            <PlusIcon />
            {t('blocks.createBlock')}
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '200px' }}>
            <Select
              label={t('blocks.filterByRentalObject')}
              value={selectedRentalObjectId}
              onChange={(e) => setSelectedRentalObjectId(e.target.value)}
            >
              <option value="">{t('common.all')}</option>
              {rentalObjects.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.name}
                </option>
              ))}
            </Select>
          </div>
          <div style={{ minWidth: '150px' }}>
            <Select
              label={t('blocks.filterByStatus')}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">{t('common.all')}</option>
              <option value="active">{t('blocks.status.active')}</option>
              <option value="cancelled">{t('blocks.status.cancelled')}</option>
              <option value="completed">{t('blocks.status.completed')}</option>
            </Select>
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
              <Button type="button" variant="secondary" onClick={() => navigate('/blocks/new')} style={{ marginTop: 'var(--ds-spacing-4)' }}>
                <PlusIcon />
                {t('blocks.createFirstBlock')}
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>{t('blocks.table.title')}</TableHeaderCell>
                <TableHeaderCell>{t('blocks.table.rentalObject')}</TableHeaderCell>
                <TableHeaderCell>{t('blocks.table.dateRange')}</TableHeaderCell>
                <TableHeaderCell>{t('blocks.table.status')}</TableHeaderCell>
                <TableHeaderCell>{t('blocks.table.visibility')}</TableHeaderCell>
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
                      {block.reason && (
                        <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}>
                          {block.reason.length > 50 ? `${block.reason.substring(0, 50)}...` : block.reason}
                        </Paragraph>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{block.rentalObjectName || '-'}</TableCell>
                  <TableCell>
                    <Paragraph data-size="sm" style={{ margin: 0 }}>
                      {formatDateRange(block.startDate, block.endDate, block.allDay)}
                    </Paragraph>
                    {block.recurring && (
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
                    <Badge data-color={block.visibility === 'public' ? 'success' : 'neutral'} data-size="sm">
                      {t(`blocks.visibility.${block.visibility}`)}
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
                            title={t('common.edit')}
                          >
                            <EditIcon />
                          </Button>
                          <Button
                            type="button"
                            variant="tertiary"
                            data-size="sm"
                            data-color="danger"
                            onClick={() => handleDelete(block.id, block.title)}
                            title={t('common.delete')}
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
