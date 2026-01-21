/**
 * Block Detail Page
 * View details of a calendar block
 */
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Skeleton,
  Breadcrumb,
  EditIcon,
  TrashIcon,
  ArrowLeftIcon,
  CalendarIcon,
  BuildingIcon,
  ClockIcon,
  useDialog,
} from '@xalatechnologies/platform/ui';
import { useBlock, useDeleteBlock } from '@digilist/client-sdk/hooks';
import { useT } from '@xalatechnologies/platform/i18n';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCapabilityContext } from '../../providers/CapabilityProvider';

export function BlockDetailPage(): React.ReactElement {
  const t = useT();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { hasCapability } = useCapabilityContext();
  const { confirm } = useDialog();

  const { data: blockData, isLoading, error } = useBlock(id!);
  const deleteBlockMutation = useDeleteBlock();

  const block = blockData?.data;
  const canManageBlocks = hasCapability('CAP_BLOCKS_MANAGE_ASSIGNED') || hasCapability('CAP_BOOKING_MANAGE');

  // Handle delete
  const handleDelete = async () => {
    if (!block) return;

    const confirmed = await confirm({
      title: t('blocks.deleteConfirm.page.title'),
      description: t('blocks.deleteConfirm.description', { title: block.title }),
      confirmLabel: t('action.delete'),
      cancelLabel: t('action.cancel'),
      variant: 'danger',
    });

    if (confirmed) {
      deleteBlockMutation.mutate(block.id, {
        onSuccess: () => {
          navigate('/blocks');
        },
      });
    }
  };

  // Format date for display
  const formatDateTime = (dateString: string, allDay: boolean) => {
    const date = new Date(dateString);
    if (allDay) {
      return date.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    return date.toLocaleString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
        <Skeleton width="40%" height={24} />
        <Skeleton width="50%" height={40} />
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <Skeleton width="100%" height={200} />
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !block) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
        <Breadcrumb
          breadcrumbs={[
            { label: t('blocks.page.title'), href: '/blocks' },
            { label: t('error.generic') },
          ]}
        />
        <Card style={{ padding: 'var(--ds-spacing-6)', textAlign: 'center' }}>
          <Paragraph style={{ color: 'var(--ds-color-danger-text-default)' }}>
            {error?.message || t('blocks.notFound')}
          </Paragraph>
          <Button type="button" variant="secondary" onClick={() => navigate('/blocks')} aria-label={t('action.back')}>
            <ArrowLeftIcon />
            {t('blocks.backToList')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div data-testid="block-detail" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Breadcrumbs */}
      <Breadcrumb
        breadcrumbs={[
          { label: t('blocks.page.title'), href: '/blocks' },
          { label: block.title },
        ]}
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-2)' }}>
            <Heading level={1} data-size="lg" style={{ margin: 0 }}>
              {block.title}
            </Heading>
            <Badge data-color={getStatusColor(block.status)}>
              {t(`blocks.status.${block.status}`)}
            </Badge>
          </div>
          {block.reason && (
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {block.reason}
            </Paragraph>
          )}
        </div>
        {canManageBlocks && (
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
            <Button type="button" variant="secondary" onClick={() => navigate(`/blocks/${block.id}/edit`)} aria-label={t('action.edit')}>
              <EditIcon />
              {t('action.edit')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              data-color="danger"
              onClick={handleDelete}
              disabled={deleteBlockMutation.isPending}
              aria-label={t('action.delete')}
            >
              <TrashIcon />
              {t('action.delete')}
            </Button>
          </div>
        )}
      </div>

      {/* Block details */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--ds-spacing-6)' }}>
        {/* Main info */}
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-5)' }}>
            {t('blocks.details.info')}
          </Heading>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
            {/* Date range */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-4)' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--ds-border-radius-md)',
                  backgroundColor: 'var(--ds-color-accent-surface-default)',
                  color: 'var(--ds-color-accent-text-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CalendarIcon />
              </div>
              <div>
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('blocks.details.dateRange')}
                </Paragraph>
                <Paragraph style={{ margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
                  {formatDateTime(block.startDate, block.allDay)}
                </Paragraph>
                <Paragraph style={{ margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
                  {t('blocks.details.to')} {formatDateTime(block.endDate, block.allDay)}
                </Paragraph>
                {block.allDay && (
                  <Badge data-color="info" data-size="sm" style={{ marginTop: 'var(--ds-spacing-2)' }}>
                    {t('blocks.allDay')}
                  </Badge>
                )}
              </div>
            </div>

            {/* Rental object */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-4)' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--ds-border-radius-md)',
                  backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                  color: 'var(--ds-color-neutral-text-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <BuildingIcon />
              </div>
              <div>
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('blocks.details.rentalObject')}
                </Paragraph>
                <Paragraph style={{ margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
                  {block.rentalObjectName || block.rentalObjectId}
                </Paragraph>
              </div>
            </div>

            {/* Recurring info */}
            {block.recurring && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-4)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--ds-border-radius-md)',
                    backgroundColor: 'var(--ds-color-info-surface-default)',
                    color: 'var(--ds-color-info-text-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ClockIcon />
                </div>
                <div>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('blocks.details.recurrence')}
                  </Paragraph>
                  <Paragraph style={{ margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
                    {block.recurrenceRule || t('blocks.recurring')}
                  </Paragraph>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Metadata */}
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-5)' }}>
            {t('blocks.details.metadata')}
          </Heading>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('blocks.details.visibility')}
              </Paragraph>
              <Badge data-color={block.visibility === 'public' ? 'success' : 'neutral'} style={{ marginTop: 'var(--ds-spacing-1)' }}>
                {t(`blocks.visibility.${block.visibility}`)}
              </Badge>
            </div>

            <div>
              <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('blocks.details.status')}
              </Paragraph>
              <Badge data-color={getStatusColor(block.status)} style={{ marginTop: 'var(--ds-spacing-1)' }}>
                {t(`blocks.status.${block.status}`)}
              </Badge>
            </div>

            <div>
              <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('blocks.details.createdAt')}
              </Paragraph>
              <Paragraph style={{ margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
                {new Date(block.createdAt).toLocaleString('nb-NO')}
              </Paragraph>
            </div>

            {block.updatedAt && block.updatedAt !== block.createdAt && (
              <div>
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('blocks.details.updatedAt')}
                </Paragraph>
                <Paragraph style={{ margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
                  {new Date(block.updatedAt).toLocaleString('nb-NO')}
                </Paragraph>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Back button */}
      <div>
        <Button type="button" variant="tertiary" onClick={() => navigate('/blocks')} aria-label={t('action.back')}>
          <ArrowLeftIcon />
          {t('blocks.backToList')}
        </Button>
      </div>
    </div>
  );
}

export default BlockDetailPage;
