/**
 * Block Form Page
 * Create and edit calendar blocks
 */
import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Input,
  Select,
  Textarea,
  Checkbox,
  Skeleton,
  Breadcrumb,
  Alert,
  SaveIcon,
  ArrowLeftIcon,
} from '@xala/ds';
import { useBlock, useCreateBlock, useUpdateBlock, useAssignedRentalObjects, useCheckConflicts } from '@digilist/client-sdk/hooks';
import { useT } from '@xala/i18n';
import { useNavigate, useParams } from 'react-router-dom';
import { useCapabilityContext } from '../../providers/CapabilityProvider';

interface BlockFormData {
  title: string;
  reason: string;
  rentalObjectId: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  allDay: boolean;
  recurring: boolean;
  recurrenceRule: string;
  visibility: 'public' | 'private';
}

const initialFormData: BlockFormData = {
  title: '',
  reason: '',
  rentalObjectId: '',
  startDate: '',
  startTime: '09:00',
  endDate: '',
  endTime: '17:00',
  allDay: false,
  recurring: false,
  recurrenceRule: '',
  visibility: 'public',
};

export function BlockFormPage(): React.ReactElement {
  const t = useT();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { hasCapability } = useCapabilityContext();

  const isEditing = !!id;

  // Form state
  const [formData, setFormData] = useState<BlockFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof BlockFormData, string>>>({});

  // Fetch existing block if editing
  const { data: blockData, isLoading: loadingBlock } = useBlock(id!, { enabled: isEditing });

  // Fetch rental objects for dropdown
  const { data: rentalObjectsData, isLoading: loadingRentalObjects } = useAssignedRentalObjects();
  const rentalObjects = rentalObjectsData?.data ?? [];

  // Mutations
  const createBlockMutation = useCreateBlock();
  const updateBlockMutation = useUpdateBlock();

  // Check for conflicts
  const conflictCheckParams = {
    rentalObjectId: formData.rentalObjectId,
    startTime: formData.startDate && formData.startTime
      ? new Date(`${formData.startDate}T${formData.startTime}`).toISOString()
      : '',
    endTime: formData.endDate && formData.endTime
      ? new Date(`${formData.endDate}T${formData.endTime}`).toISOString()
      : '',
    excludeBlockId: isEditing ? id : undefined,
  };

  const { data: conflictsData } = useCheckConflicts(conflictCheckParams, {
    enabled: !!formData.rentalObjectId && !!formData.startDate && !!formData.endDate,
  });

  const hasConflicts = conflictsData?.data?.hasConflicts ?? false;
  const conflicts = conflictsData?.data?.conflicts ?? [];

  const canManageBlocks = hasCapability('CAP_BLOCKS_MANAGE_ASSIGNED') || hasCapability('CAP_BOOKING_MANAGE');

  // Populate form when editing
  useEffect(() => {
    if (blockData?.data) {
      const block = blockData.data;
      const startDate = new Date(block.startDate);
      const endDate = new Date(block.endDate);

      setFormData({
        title: block.title,
        reason: block.reason || '',
        rentalObjectId: block.rentalObjectId,
        startDate: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endDate: endDate.toISOString().split('T')[0],
        endTime: endDate.toTimeString().slice(0, 5),
        allDay: block.allDay,
        recurring: block.recurring,
        recurrenceRule: block.recurrenceRule || '',
        visibility: block.visibility as 'public' | 'private',
      });
    }
  }, [blockData]);

  // Handle input changes
  const handleChange = (field: keyof BlockFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BlockFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = t('blocks.form.errors.titleRequired');
    }

    if (!formData.rentalObjectId) {
      newErrors.rentalObjectId = t('blocks.form.errors.rentalObjectRequired');
    }

    if (!formData.startDate) {
      newErrors.startDate = t('blocks.form.errors.startDateRequired');
    }

    if (!formData.endDate) {
      newErrors.endDate = t('blocks.form.errors.endDateRequired');
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(`${formData.startDate}T${formData.allDay ? '00:00' : formData.startTime}`);
      const end = new Date(`${formData.endDate}T${formData.allDay ? '23:59' : formData.endTime}`);

      if (end <= start) {
        newErrors.endDate = t('blocks.form.errors.endAfterStart');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const startDateTime = formData.allDay
      ? new Date(`${formData.startDate}T00:00:00`)
      : new Date(`${formData.startDate}T${formData.startTime}`);

    const endDateTime = formData.allDay
      ? new Date(`${formData.endDate}T23:59:59`)
      : new Date(`${formData.endDate}T${formData.endTime}`t('common.const_blockpayload_title_formdatatitletrim')`/blocks/${id}`);
          },
        }
      );
    } else {
      createBlockMutation.mutate(blockPayload, {
        onSuccess: (result) => {
          navigate(`/blocks/${result.data.id}`);
        },
      });
    }
  };

  const isSubmitting = createBlockMutation.isPending || updateBlockMutation.isPending;
  const submitError = createBlockMutation.error || updateBlockMutation.error;

  // Loading state
  if (loadingBlock || loadingRentalObjects) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
        <Skeleton width="40%" height={24} />
        <Skeleton width="50%" height={40} />
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} width="100%" height={60} style={{ marginBottom: 'var(--ds-spacing-4)' }} />
          ))}
        </Card>
      </div>
    );
  }

  // Check permissions
  if (!canManageBlocks) {
    return (
      <Card style={{ padding: 'var(--ds-spacing-6)', textAlign: 'center' }}>
        <Paragraph style={{ color: 'var(--ds-color-danger-text-default)' }}>
          {t('common.accessDenied')}
        </Paragraph>
        <Button type="button" variant="secondary" onClick={() => navigate('/blocks')} aria-label={t('ui.back')}>
          <ArrowLeftIcon />
          {t('blocks.backToList')}
        </Button>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: t('blocks.title'), href: '/blocks' },
          { label: isEditing ? t('blocks.editBlock') : t('blocks.createBlock') },
        ]}
      />

      {/* Header */}
      <div>
        <Heading level={1} data-size="lg" style={{ margin: 0 }}>
          {isEditing ? t('blocks.editBlock') : t('blocks.createBlock')}
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
          {isEditing ? t('blocks.form.editDescription') : t('blocks.form.createDescription')}
        </Paragraph>
      </div>

      {/* Error alert */}
      {submitError && (
        <Alert data-color="danger">
          {submitError.message || t('common.error')}
        </Alert>
      )}

      {/* Conflict warning */}
      {hasConflicts && (
        <Alert data-color="warning">
          <Heading level={3} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            {t('blocks.form.conflictWarning')}
          </Heading>
          <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)' }}>
            {conflicts.map((conflict, index) => (
              <li key={index}>
                {conflict.type}: {conflict.title} ({new Date(conflict.startTime).toLocaleDateString('nb-NO')})
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
            {/* Title */}
            <Input
              label={t('blocks.form.title')}
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              error={errors.title}
              required
            />

            {/* Reason */}
            <Textarea
              label={t('blocks.form.reason')}
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              description={t('blocks.form.reasonHint')}
              rows={3}
            />

            {/* Rental Object */}
            <Select
              label={t('blocks.form.rentalObject')}
              value={formData.rentalObjectId}
              onChange={(e) => handleChange('rentalObjectId', e.target.value)}
              error={errors.rentalObjectId}
              required
            >
              <option value="">{t('blocks.form.selectRentalObject')}</option>
              {rentalObjects.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.name}
                </option>
              ))}
            </Select>

            {/* All day checkbox */}
            <Checkbox
              checked={formData.allDay}
              onChange={(e) => handleChange('allDay', e.target.checked)}
            >
              {t('blocks.form.allDay')}
            </Checkbox>

            {/* Date/Time inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: formData.allDay ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
              <Input
                type="date"
                label={t('blocks.form.startDate')}
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                error={errors.startDate}
                required
              />
              {!formData.allDay && (
                <Input
                  type="time"
                  label={t('blocks.form.startTime')}
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  required
                />
              )}
              <Input
                type="date"
                label={t('blocks.form.endDate')}
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                error={errors.endDate}
                required
              />
              {!formData.allDay && (
                <Input
                  type="time"
                  label={t('blocks.form.endTime')}
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  required
                />
              )}
            </div>

            {/* Recurring checkbox */}
            <Checkbox
              checked={formData.recurring}
              onChange={(e) => handleChange('recurring', e.target.checked)}
            >
              {t('blocks.form.recurring')}
            </Checkbox>

            {/* Recurrence rule (if recurring) */}
            {formData.recurring && (
              <Select
                label={t('blocks.form.recurrenceRule')}
                value={formData.recurrenceRule}
                onChange={(e) => handleChange('recurrenceRule', e.target.value)}
              >
                <option value="">{t('blocks.form.selectRecurrence')}</option>
                <option value="FREQ=DAILY">{t('blocks.form.recurrence.daily')}</option>
                <option value="FREQ=WEEKLY">{t('blocks.form.recurrence.weekly')}</option>
                <option value="FREQ=BIWEEKLY">{t('blocks.form.recurrence.biweekly')}</option>
                <option value="FREQ=MONTHLY">{t('blocks.form.recurrence.monthly')}</option>
              </Select>
            )}

            {/* Visibility */}
            <Select
              label={t('blocks.form.visibility')}
              value={formData.visibility}
              onChange={(e) => handleChange('visibility', e.target.value)}
            >
              <option value="public">{t('blocks.visibility.public')}</option>
              <option value="private">{t('blocks.visibility.private')}</option>
            </Select>
          </div>
        </Card>

        {/* Form actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--ds-spacing-6)' }}>
          <Button type="button" variant="tertiary" onClick={() => navigate('/blocks')} aria-label={t('ui.cancel')}>
            <ArrowLeftIcon />
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting} aria-label={t('ui.save')}>
            <SaveIcon />
            {isSubmitting
              ? t('common.saving')
              : isEditing
              ? t('common.saveChanges')
              : t('blocks.createBlock')}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default BlockFormPage;
