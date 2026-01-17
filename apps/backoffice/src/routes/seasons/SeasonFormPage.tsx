/**
 * Season Form Page
 * Full-page form for creating and editing seasonal lease seasons
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  ArrowLeftIcon,
  Stack,
  FormField,
  Textfield,
  Alert,
} from '@xala/ds';
import {
  useSeason,
  useCreateSeason,
  useUpdateSeason,
  type CreateSeasonDTO,
} from '@digilist/client-sdk';
import { FormSection, FormActions } from '../../components/shared';
import { useT } from '@xala/i18n';

export function SeasonFormPage() {
  const t = useT();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  // Queries
  const { data: seasonData, isLoading } = useSeason(id!, {
    enabled: isEditing,
  });
  const season = seasonData?.data;

  // Mutations
  const createSeasonMutation = useCreateSeason();
  const updateSeasonMutation = useUpdateSeason();

  // Form state
  const [formData, setFormData] = useState<CreateSeasonDTO>({
    name: '',
    startDate: '',
    endDate: '',
    applicationDeadline: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form from season data
  useEffect(() => {
    if (season) {
      setFormData({
        name: season.name,
        startDate: season.startDate.split('T')[0],
        endDate: season.endDate.split('T')[0],
        applicationDeadline: season.applicationDeadline.split('T')[0],
        description: season.description || '',
      });
    }
  }, [season]);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('seasons.validation.nameRequired');
    }

    if (!formData.startDate) {
      newErrors.startDate = t('seasons.validation.startDateRequired');
    }

    if (!formData.endDate) {
      newErrors.endDate = t('seasons.validation.endDateRequired');
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = t('seasons.validation.endDateAfterStart');
    }

    if (!formData.applicationDeadline) {
      newErrors.applicationDeadline = t('seasons.validation.deadlineRequired');
    }

    if (formData.applicationDeadline && formData.startDate && formData.applicationDeadline >= formData.startDate) {
      newErrors.applicationDeadline = t('seasons.validation.deadlineBeforeStart');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanData: CreateSeasonDTO = {
        ...formData,
        description: formData.description?.trim() || undefined,
      };

      if (isEditing && id) {
        await updateSeasonMutation.mutateAsync({ id, data: cleanData });
        navigate(`/seasons/${id}`);
      } else {
        const result = await createSeasonMutation.mutateAsync(cleanData);
        navigate(`/seasons/${result.data.id}`);
      }
    } catch {
      // Failed to save season
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isEditing && id) {
      navigate(`/seasons/${id}`);
    } else {
      navigate('/seasons');
    }
  };

  const handleChange = (field: keyof CreateSeasonDTO) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (isEditing && isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label={t("ui.loading")} />
      </div>
    );
  }

  if (isEditing && !season) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Heading level={3} data-size="sm">{t('seasons.seasonNotFound')}</Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}>
          {t('seasons.seasonNotFoundDesc')}
        </Paragraph>
        <Link to="/seasons">
          <Button variant="secondary" data-size="sm" style={{ marginTop: 'var(--ds-spacing-4)' }} type="button">
            <ArrowLeftIcon />
            {t('seasons.backToOverview')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <Link to={isEditing && id ? `/seasons/${id}` : '/seasons'}>
          <Button variant="tertiary" data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }} type="button" aria-label={isEditing ? t('seasons.backToSeason') : t('seasons.backToOverview')}>
            <ArrowLeftIcon />
            {isEditing ? t('seasons.backToSeason') : t('seasons.backToOverview')}
          </Button>
        </Link>

        <Heading level={2} data-size="lg">
          {isEditing ? t('seasons.editSeason') : t('seasons.newSeasonTitle')}
        </Heading>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
        >
          {isEditing
            ? t('seasons.updateSeasonDesc')
            : t('seasons.createSeasonDesc')}
        </Paragraph>
      </div>

      {/* Info Alert */}
      {!isEditing && (
        <Alert>
          {t('seasons.draftInfo')} <strong>{t('seasons.status.draft')}</strong>. {t('seasons.draftInfoAddVenues')}
        </Alert>
      )}

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit}>
          <Stack spacing={5}>
            {/* Basic Information */}
            <FormSection title={t('seasons.basicInfo')}>
              <Stack spacing={4}>
                <FormField
                  label={t('seasons.name')}
                  required
                  error={errors.name || undefined}
                  description={t('seasons.nameDescription')}
                >
                  <Textfield aria-label={t('seasons.name')}
                    value={formData.name}
                    onChange={(e) => handleChange('name')(e.target.value)}
                    placeholder={t('seasons.namePlaceholder')}

                  />
                </FormField>

                <FormField
                  label={t('seasons.description')}
                  description={t('seasons.descriptionHint')}
                >
                  <Textfield aria-label={t('seasons.description')}
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description')(e.target.value)}
                    placeholder={t('seasons.descriptionPlaceholder')}
                    multiline
                    rows={4}
                  />
                </FormField>
              </Stack>
            </FormSection>

            {/* Period */}
            <FormSection title={t('seasons.periodAndDeadlines')}>
              <Stack spacing={4}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
                  <FormField
                    label={t('seasons.startDate')}
                    required
                    error={errors.startDate || undefined}
                    description={t('seasons.startDateHint')}
                  >
                    <Textfield aria-label={t('seasons.startDate')}
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange('startDate')(e.target.value)}

                    />
                  </FormField>

                  <FormField
                    label={t('seasons.endDate')}
                    required
                    error={errors.endDate || undefined}
                    description={t('seasons.endDateHint')}
                  >
                    <Textfield aria-label={t('seasons.endDate')}
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleChange('endDate')(e.target.value)}

                      min={formData.startDate}
                    />
                  </FormField>
                </div>

                <FormField
                  label={t('seasons.applicationDeadline')}
                  required
                  error={errors.applicationDeadline || undefined}
                  description={t('seasons.applicationDeadlineHint')}
                >
                  <Textfield aria-label={t('seasons.applicationDeadline')}
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => handleChange('applicationDeadline')(e.target.value)}

                    max={formData.startDate}
                  />
                </FormField>
              </Stack>
            </FormSection>

            {/* Actions */}
            <FormActions
              submitText={isEditing ? t('seasons.saveChanges') : t('seasons.createSeason')}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </Stack>
        </form>
      </Card>
    </div>
  );
}
